import { storage } from '../services/storage/localStorage.js';

/**
 * Хранилище состояния авторизации.
 * Управляет токенами, данными профиля и статусом сессии.
 */

class AuthStore {
    constructor() {
        // Инициализация данных из постоянного хранилища
        this._token = storage.get('auth_token', null);
        this._user = storage.get('user_data', null);
        this._isAuthenticated = !!this._token;
        
        // Коллбэки для уведомления UI об изменениях (простой паттерн Observer)
        this._listeners = [];
    }

    /**
     * Сохранить JWT токен
     * @param {string} token 
     */
    setToken(token) {
        this._token = token;
        this._isAuthenticated = !!token;
        storage.set('auth_token', token);
        this._notify();
    }

    getToken() {
        return this._token;
    }

    /**
     * Сохранить данные текущего пользователя
     * @param {Object} userData 
     */
    setUser(userData) {
        this._user = userData;
        storage.set('user_data', userData);
        this._notify();
    }

    getUser() {
        return this._user;
    }

    /**
     * Проверка статуса авторизации
     */
    isAuthorized() {
        return this._isAuthenticated;
    }

    /**
     * Полная очистка данных (Logout)
     */
    clear() {
        this._token = null;
        this._user = null;
        this._isAuthenticated = false;
        storage.remove('auth_token');
        storage.remove('user_data');
        this._notify();
    }

    /**
     * Подписка на изменения состояния (для UI-компонентов)
     */
    subscribe(callback) {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(l => l !== callback);
        };
    }

    _notify() {
        this._listeners.forEach(callback => callback({
            user: this._user,
            isAuth: this._isAuthenticated
        }));
    }
}

// Экспортируем синглтон для всего приложения
export const authStore = new AuthStore();
