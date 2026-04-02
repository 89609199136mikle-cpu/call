/**
 * ================================================================================
 * CRANEAPP — CORE APPLICATION ENTRY
 * ================================================================================
 * Файл: client/mobile/app/app.js
 * Назначение: Инициализация ядра, управление состоянием, роутинг и сокеты.
 * Архитектура: Модульный Singleton.
 * ================================================================================
 */

import { AuthProvider } from './providers/authProvider.js';
import { ThemeProvider } from './providers/themeProvider.js';
import { SocketProvider } from './providers/socketProvider.js';
import { Navigation } from './navigation.js';
import { AuthStore } from '../store/authStore.js';
import { ChatStore } from '../store/chatStore.js';
import { MessageStore } from '../store/messageStore.js';
import { ApiClient } from '../services/api/authApi.js';
import { Logger } from '../utils/logger.js'; // Предполагаемая утилита для дебага

class CraneApp {
    constructor() {
        // Состояние инициализации
        this.isInitialized = false;
        this.isOnline = navigator.onLine;
        
        // Глобальные провайдеры
        this.auth = null;
        this.theme = null;
        this.socket = null;
        this.navigation = null;

        // Конфигурация приложения
        this.config = {
            apiUrl: 'https://api.craneapp.railway.app/v1',
            socketUrl: 'wss://api.craneapp.railway.app',
            version: '1.0.0-beta',
            reconnectInterval: 5000
        };

        // Биндинг методов
        this.handleOnlineStatus = this.handleOnlineStatus.bind(this);
        this.handleAppLifecycle = this.handleAppLifecycle.bind(this);
        this.onGlobalError = this.onGlobalError.bind(this);
    }

    /**
     * Основной метод запуска приложения
     */
    async bootstrap() {
        console.log(`%c 🏗️ CraneApp ${this.config.version} Bootstrapping... `, 'background: #7a5cff; color: #fff; font-weight: bold;');

        try {
            // 1. Инициализация темы (сразу, чтобы избежать вспышки белого)
            this.theme = new ThemeProvider();
            await this.theme.init();

            // 2. Инициализация хранилища авторизации
            this.authStore = new AuthStore();
            this.authProvider = new AuthProvider(this.authStore);

            // 3. Проверка текущей сессии
            const isAuthenticated = await this.authProvider.checkAuth();
            
            // 4. Инициализация навигации
            this.navigation = new Navigation();
            
            // 5. Инициализация Real-time соединения, если авторизован
            if (isAuthenticated) {
                await this.initRealTime();
            } else {
                this.navigation.goTo('login');
            }

            // 6. Подписка на системные события
            this.subscribeToSystemEvents();

            this.isInitialized = true;
            this.render();

        } catch (error) {
            this.onGlobalError('BOOTSTRAP_ERROR', error);
        }
    }

    /**
     * Инициализация Socket.io и подписок
     */
    async initRealTime() {
        if (this.socket) return;

        const token = this.authStore.getAccessToken();
        this.socketProvider = new SocketProvider(this.config.socketUrl, token);
        
        this.socket = await this.socketProvider.connect();

        // Регистрация глобальных слушателей событий
        this.socket.on('connect', () => {
            console.log('✅ Socket connected');
            this.updateOnlineStatus(true);
        });

        this.socket.on('disconnect', () => {
            console.warn('❌ Socket disconnected');
            this.updateOnlineStatus(false);
        });

        this.socket.on('msg:new', (data) => this.handleNewMessage(data));
        this.socket.on('call:incoming', (data) => this.handleIncomingCall(data));
        this.socket.on('chat:update', (data) => this.handleChatUpdate(data));
    }

    /**
     * Обработка нового сообщения (Global Handler)
     */
    handleNewMessage(payload) {
        const { message, chat_id } = payload;
        
        // 1. Обновляем MessageStore (добавляем в кеш)
        MessageStore.addMessage(chat_id, message);
        
        // 2. Обновляем ChatStore (сортировка списка чатов)
        ChatStore.updateLastMessage(chat_id, message);

        // 3. Если мы не в этом чате — показываем In-app уведомление
        if (this.navigation.currentRoute !== `chat/${chat_id}`) {
            this.showInAppNotification(message);
        }
    }

    /**
     * Обработка входящего вызова (Переключение на Call UI)
     */
    handleIncomingCall(callData) {
        // Сохраняем данные звонка в глобальный стейт
        window.activeCall = callData;
        
        // Принудительный переход на экран звонка
        this.navigation.openModal('incoming-call', callData);
    }

    /**
     * Подписка на события браузера/устройства
     */
    subscribeToSystemEvents() {
        window.addEventListener('online', this.handleOnlineStatus);
        window.addEventListener('offline', this.handleOnlineStatus);
        
        // Жизненный цикл (для мобильных версий в браузере)
        document.addEventListener('visibilitychange', this.handleAppLifecycle);

        // Глобальный перехват ошибок
        window.addEventListener('unhandledrejection', (event) => {
            this.onGlobalError('PROMISE_REJECTION', event.reason);
        });
    }

    handleOnlineStatus() {
        this.isOnline = navigator.onLine;
        console.log(this.isOnline ? '🌐 Back online' : '🔌 Connection lost');
        
        if (this.isOnline && this.isInitialized) {
            this.initRealTime(); // Переподключаемся
        }
    }

    handleAppLifecycle() {
        if (document.visibilityState === 'visible') {
            console.log('👁️ App visible: refreshing data...');
            this.syncData();
        } else {
            console.log('🌙 App backgrounded');
            // Можно отправить статус "был в сети в..."
            if (this.socket) {
                this.socket.emit('user:away');
            }
        }
    }

    /**
     * Синхронизация данных при возврате в приложение
     */
    async syncData() {
        if (!this.authStore.isAuthenticated()) return;

        try {
            // Получаем пропущенные обновления чатов
            await ChatStore.fetchChats();
            // Проверяем статус сокета
            if (this.socket && !this.socket.connected) {
                this.socket.connect();
            }
        } catch (e) {
            console.error('Sync failed', e);
        }
    }

    /**
     * Глобальный обработчик ошибок (Telegram-style: пишет лог и не падает)
     */
    onGlobalError(type, error) {
        Logger.error(`[${type}]`, error);
        
        // Если ошибка авторизации (401), выкидываем на логин
        if (error.status === 401) {
            this.authProvider.logout();
            this.navigation.goTo('login');
        }

        // Показ UI-уведомления об ошибке (Toast)
        this.showToast('Что-то пошло не так. Проверьте соединение.');
    }

    /**
     * Отрисовка базовой структуры в DOM
     */
    render() {
        const root = document.getElementById('app-root');
        if (!root) return;

        // Очистка лоадера
        root.innerHTML = `
            <div id="main-container" class="${this.theme.currentTheme}">
                <div id="nav-container"></div>
                <div id="content-area"></div>
                <div id="modal-layer"></div>
                <div id="notification-layer"></div>
            </div>
        `;

        // Запуск первого экрана
        this.navigation.init(document.getElementById('content-area'));
    }

    // Вспомогательные методы UI
    showToast(message) {
        // Реализация будет в компонентах UI, тут просто проброс
        console.log(`TOAST: ${message}`);
    }

    showInAppNotification(message) {
        console.log(`NEW MESSAGE FROM ${message.sender_name}: ${message.text}`);
    }
}

// Создание и экспорт единственного экземпляра (Singleton)
const app = new CraneApp();
export default app;

// Автоматический запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    app.bootstrap();
});
