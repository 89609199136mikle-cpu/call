/**
 * ================================================================================
 * CRANEAPP — SOCKET.IO PROVIDER (REAL-TIME ENGINE)
 * ================================================================================
 * Файл: client/mobile/app/providers/socketProvider.js
 * Назначение: Управление WebSocket-соединением, событиями и синхронизацией.
 * ================================================================================
 */

import { io } from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';
import { Logger } from '../../utils/logger.js';

export class SocketProvider {
    /**
     * @param {string} url - URL сервера сокетов (например, wss://api.craneapp.com)
     * @param {string} token - JWT Access Token для авторизации
     */
    constructor(url, token) {
        this.url = url;
        this.token = token;
        this.socket = null;
        
        // Настройки переподключения
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000; // Начальная задержка 1 сек

        // Состояние
        this.isConnected = false;
        this.isReady = false;

        // Очередь событий (если сокет упал, мы копим важные события здесь)
        this.eventQueue = [];
        
        // Биндинг методов
        this.handleConnect = this.handleConnect.bind(this);
        this.handleDisconnect = this.handleDisconnect.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleReconnectAttempt = this.handleReconnectAttempt.bind(this);
    }

    /**
     * Инициализация и установка соединения
     */
    async connect() {
        if (this.socket) return this.socket;

        Logger.info(`[SocketProvider] Connecting to ${this.url}...`);

        try {
            this.socket = io(this.url, {
                auth: { token: this.token },
                transports: ['websocket', 'polling'], // Приоритет Websocket
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                reconnectionDelayMax: 10000, // Макс. задержка 10 сек
                timeout: 20000,
                autoConnect: true
            });

            this.setupListeners();
            return this.socket;

        } catch (error) {
            Logger.error('[SocketProvider] Connection failed', error);
            throw error;
        }
    }

    /**
     * Регистрация системных слушателей Socket.io
     */
    setupListeners() {
        if (!this.socket) return;

        // 1. Успешное соединение
        this.socket.on('connect', this.handleConnect);

        // 2. Разрыв соединения
        this.socket.on('disconnect', this.handleDisconnect);

        // 3. Ошибки (включая ошибки авторизации)
        this.socket.on('connect_error', this.handleError);

        // 4. Попытки переподключения
        this.socket.on('reconnect_attempt', this.handleReconnectAttempt);
        this.socket.on('reconnect_failed', () => {
            Logger.critical('[SocketProvider] All reconnection attempts failed.');
            window.dispatchEvent(new CustomEvent('socket:critical_error', { detail: 'RECONNECT_FAILED' }));
        });

        // 5. Системные уведомления от сервера
        this.socket.on('server:ping', () => this.socket.emit('server:pong'));
    }

    /**
     * Обработчик успешного коннекта
     */
    handleConnect() {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        Logger.success(`[SocketProvider] Connected with ID: ${this.socket.id}`);

        // Сообщаем системе, что мы в сети
        window.dispatchEvent(new CustomEvent('socket:status', { detail: { online: true } }));

        // Очищаем очередь накопившихся событий (Offline Storage)
        this.flushEventQueue();
    }

    /**
     * Обработчик дисконнекта
     */
    handleDisconnect(reason) {
        this.isConnected = false;
        Logger.warn(`[SocketProvider] Disconnected. Reason: ${reason}`);

        window.dispatchEvent(new CustomEvent('socket:status', { detail: { online: false } }));

        // Если дисконнект инициирован сервером (например, бан или кик), 
        // Socket.io не будет пытаться переподключиться сам
        if (reason === "io server disconnect") {
            this.socket.connect();
        }
    }

    /**
     * Обработка ошибок
     */
    handleError(error) {
        Logger.error('[SocketProvider] Socket Error:', error.message);
        
        // Если сервер вернул "Unauthorized", значит токен протух
        if (error.message === 'Authentication error' || error.message === 'xhr poll error') {
            Logger.warn('[SocketProvider] Auth failed, requesting token refresh...');
            window.dispatchEvent(new CustomEvent('auth:refresh_required'));
        }
    }

    handleReconnectAttempt(attempt) {
        this.reconnectAttempts = attempt;
        Logger.info(`[SocketProvider] Reconnection attempt #${attempt}...`);
    }

    /**
     * МЕТОД ОТПРАВКИ (С ОЧЕРЕДЬЮ)
     * Используется для отправки сообщений или статусов
     * @param {string} event - Имя события
     * @param {Object} data - Данные
     * @param {Function} callback - Подтверждение получения (ACK)
     */
    emit(event, data, callback = null) {
        if (!this.isConnected) {
            Logger.warn(`[SocketProvider] Offline. Queueing event: ${event}`);
            this.eventQueue.push({ event, data, callback });
            return;
        }

        // Отправка с использованием механизма подтверждения Delivery
        this.socket.emit(event, data, (response) => {
            if (callback) callback(response);
            
            if (response && response.error) {
                Logger.error(`[SocketProvider] ACK Error for ${event}:`, response.error);
            }
        });
    }

    /**
     * Подписка на событие
     */
    on(event, handler) {
        if (!this.socket) {
            Logger.error('[SocketProvider] Cannot subscribe: socket not initialized');
            return;
        }
        this.socket.on(event, handler);
    }

    /**
     * Отписка от события
     */
    off(event, handler) {
        if (this.socket) {
            this.socket.off(event, handler);
        }
    }

    /**
     * Принудительная очистка очереди после восстановления связи
     */
    flushEventQueue() {
        if (this.eventQueue.length === 0) return;

        Logger.info(`[SocketProvider] Flushing ${this.eventQueue.length} queued events...`);
        
        while (this.eventQueue.length > 0) {
            const { event, data, callback } = this.eventQueue.shift();
            this.emit(event, data, callback);
        }
    }

    /**
     * Обновление токена без перезагрузки соединения (если возможно)
     * или с мягким перезапуском
     */
    updateToken(newToken) {
        this.token = newToken;
        if (this.socket) {
            this.socket.auth.token = newToken;
            // Переподключаемся с новым токеном
            this.socket.disconnect().connect();
        }
    }

    /**
     * Полное закрытие соединения (Logout)
     */
    disconnect() {
        if (this.socket) {
            Logger.info('[SocketProvider] Manually disconnecting...');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }
}
