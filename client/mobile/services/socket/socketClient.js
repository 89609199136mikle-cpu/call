import { authStore } from '../../store/authStore.js';
import { socketEvents } from './socketEvents.js';

/**
 * Синглтон для управления WebSocket соединением (Socket.io).
 * Обеспечивает real-time обмен данными между клиентом и Railway.
 */

const SOCKET_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://craneapp-production.up.railway.app';

class SocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
    }

    /**
     * Инициализация соединения с авторизацией
     */
    connect() {
        const token = authStore.getToken();
        if (!token || this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            transports: ['websocket'] // Принудительно используем WebSockets для скорости на Railway
        });

        this.setupBasicListeners();
        socketEvents.init(this.socket); // Регистрируем обработчики бизнес-логики
    }

    /**
     * Базовые системные события
     */
    setupBasicListeners() {
        this.socket.on('connect', () => {
            this.connected = true;
            this.reconnectAttempts = 0;
            console.log('Craneapp: Соединение установлено');
        });

        this.socket.on('disconnect', (reason) => {
            this.connected = false;
            console.warn('Craneapp: Соединение разорвано:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Ошибка авторизации сокета:', error.message);
            if (error.message === 'xhr poll error') {
                // Логика обработки падения сервера на Railway
            }
        });
    }

    /**
     * Универсальный метод отправки событий
     * @param {string} event - Название события (например, 'chat:send')
     * @param {Object} data - Полезная нагрузка
     */
    emit(event, data) {
        if (this.socket && this.connected) {
            this.socket.emit(event, data);
        } else {
            console.error(`Невозможно отправить ${event}: сокет не подключен`);
        }
    }

    /**
     * Принудительное закрытие (например, при Logout)
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    /**
     * Получить статус соединения
     */
    getStatus() {
        return this.connected;
    }
}

// Экспортируем единственный экземпляр (Singleton)
export const socketClient = new SocketClient();
