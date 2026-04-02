/**
 * ================================================================================
 * CRANEAPP — AUTHENTICATION PROVIDER
 * ================================================================================
 * Файл: client/mobile/app/providers/authProvider.js
 * Назначение: Управление сессиями, авторизацией (OTP), токенами JWT и безопасностью.
 * ================================================================================
 */

import { AuthApi } from '../../services/api/authApi.js';
import { Logger } from '../../utils/logger.js';

export class AuthProvider {
    /**
     * @param {Object} authStore - Экземпляр AuthStore для работы с LocalStorage/SecureStorage
     */
    constructor(authStore) {
        this.store = authStore;
        this.api = new AuthApi();
        
        // Внутреннее состояние
        this.currentUser = null;
        this.refreshTimer = null;
        this.isRefreshing = false;
        
        // Очередь запросов (если несколько запросов ждут обновления токена)
        this.refreshSubscribers = [];

        Logger.info('[AuthProvider] Initialized');
    }

    /**
     * 1. ГЛАВНАЯ ПРОВЕРКА АВТОРИЗАЦИИ ПРИ ЗАПУСКЕ ПРИЛОЖЕНИЯ
     * Вызывается в app.js при старте.
     * @returns {Promise<boolean>}
     */
    async checkAuth() {
        try {
            Logger.info('[AuthProvider] Checking existing authentication...');
            const accessToken = this.store.getAccessToken();
            const refreshToken = this.store.getRefreshToken();

            if (!accessToken || !refreshToken) {
                Logger.info('[AuthProvider] No tokens found. User is logged out.');
                return false;
            }

            // Проверяем срок действия Access Token'а
            if (this.isTokenExpired(accessToken)) {
                Logger.info('[AuthProvider] Access token expired. Attempting silent refresh...');
                const success = await this.silentRefresh();
                if (!success) {
                    this.logout(false); // Тихий логаут без запроса к API
                    return false;
                }
            } else {
                // Токен еще жив, восстанавливаем пользователя из хранилища
                this.currentUser = this.store.getUser();
                this.scheduleTokenRefresh(accessToken);
            }

            // Уведомляем систему, что мы авторизованы
            this.dispatchAuthStateChange(true);
            return true;

        } catch (error) {
            Logger.error('[AuthProvider] Error during checkAuth', error);
            return false;
        }
    }

    /**
     * 2. ОТПРАВКА КОДА (STEP 1 OF LOGIN)
     * @param {string} phone - Номер телефона в формате +7...
     * @returns {Promise<Object>} - Хэш сессии авторизации
     */
    async requestOTP(phone) {
        try {
            Logger.info(`[AuthProvider] Requesting OTP for ${phone}`);
            const deviceInfo = this.getDeviceInfo();
            
            const response = await this.api.sendOtp({
                phone: phone,
                device_id: deviceInfo.id,
                app_version: deviceInfo.version
            });

            if (response.error) throw new Error(response.error);

            // Возвращаем хэш, который потребуется на втором шаге
            return {
                hash: response.hash,
                timeout: response.timeout,
                is_sent: true
            };
        } catch (error) {
            Logger.error('[AuthProvider] Failed to request OTP', error);
            throw error;
        }
    }

    /**
     * 3. ВЕРИФИКАЦИЯ КОДА (STEP 2 OF LOGIN)
     * @param {string} phone - Номер телефона
     * @param {string} code - Введенный пользователем 6-значный код
     * @param {string} hash - Хэш из первого шага
     * @returns {Promise<boolean>}
     */
    async verifyOTP(phone, code, hash) {
        try {
            Logger.info(`[AuthProvider] Verifying OTP for ${phone}`);
            
            const response = await this.api.verifyOtp({
                phone: phone,
                code: code,
                hash: hash
            });

            if (response.error) throw new Error(response.error);

            // Успешная авторизация: сохраняем данные
            this.store.setTokens(response.access_token, response.refresh_token);
            this.store.setUser(response.user);
            this.currentUser = response.user;

            // Запускаем таймер обновления токена
            this.scheduleTokenRefresh(response.access_token);
            
            // Оповещаем приложение
            this.dispatchAuthStateChange(true);

            return true;
        } catch (error) {
            Logger.error('[AuthProvider] OTP Verification failed', error);
            throw error;
        }
    }

    /**
     * 4. ТЕНЕВОЕ ОБНОВЛЕНИЕ ТОКЕНА (SILENT REFRESH)
     * Защищено от Race Conditions (когда несколько запросов пытаются обновить токен одновременно)
     * @returns {Promise<boolean>}
     */
    async silentRefresh() {
        if (this.isRefreshing) {
            // Если уже обновляем, подписываемся на результат
            return new Promise(resolve => {
                this.refreshSubscribers.push(resolve);
            });
        }

        this.isRefreshing = true;
        Logger.info('[AuthProvider] Starting silent refresh process...');

        try {
            const refreshToken = this.store.getRefreshToken();
            if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

            const response = await this.api.refreshToken(refreshToken);

            if (response.error) throw new Error(response.error);

            // Обновляем Access Token
            this.store.setAccessToken(response.access_token);
            this.scheduleTokenRefresh(response.access_token);

            // Уведомляем всех, кто ждал обновления
            this.onRefreshComplete(true);
            return true;
        } catch (error) {
            Logger.error('[AuthProvider] Silent refresh failed. Session expired.', error);
            this.store.clearAll();
            this.onRefreshComplete(false);
            return false;
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Обработка очереди подписчиков на обновление токена
     */
    onRefreshComplete(isSuccess) {
        this.refreshSubscribers.forEach(callback => callback(isSuccess));
        this.refreshSubscribers = [];
    }

    /**
     * 5. ПЛАНИРОВАНИЕ ОБНОВЛЕНИЯ ТОКЕНА
     * Чтобы токен не протух прямо во время отправки сообщения
     */
    scheduleTokenRefresh(accessToken) {
        if (this.refreshTimer) clearTimeout(this.refreshTimer);

        const decoded = this.decodeJWT(accessToken);
        if (!decoded || !decoded.exp) return;

        // Вычисляем время до истечения срока в миллисекундах
        const expiresAt = decoded.exp * 1000;
        const timeNow = Date.now();
        const timeUntilExpiry = expiresAt - timeNow;

        // Обновляем за 1 минуту до истечения (60000 ms)
        const refreshDelay = Math.max(timeUntilExpiry - 60000, 0);

        Logger.info(`[AuthProvider] Token will be refreshed in ${Math.round(refreshDelay / 1000)} seconds.`);

        this.refreshTimer = setTimeout(() => {
            this.silentRefresh();
        }, refreshDelay);
    }

    /**
     * 6. ВЫХОД ИЗ СИСТЕМЫ (LOGOUT)
     * @param {boolean} notifyServer - Нужно ли отправлять запрос на сервер для отзыва токена
     */
    async logout(notifyServer = true) {
        Logger.info('[AuthProvider] Logging out...');
        
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }

        try {
            if (notifyServer) {
                const token = this.store.getAccessToken();
                if (token) {
                    await this.api.logout(token).catch(e => console.warn('Server logout failed', e));
                }
            }
        } finally {
            // Гарантированно очищаем локальные данные
            this.store.clearAll();
            this.currentUser = null;
            this.dispatchAuthStateChange(false);
        }
    }

    /**
     * 7. УТИЛИТЫ И ХЕЛПЕРЫ
     */
    
    getCurrentUser() {
        return this.currentUser;
    }

    // Декодирование JWT без сторонних библиотек (Native JS)
    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            Logger.error('[AuthProvider] Failed to decode JWT', e);
            return null;
        }
    }

    isTokenExpired(token) {
        const decoded = this.decodeJWT(token);
        if (!decoded || !decoded.exp) return true;
        
        // Считаем токен протухшим, если до конца осталось меньше 30 секунд
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < (currentTime + 30);
    }

    // Сборщик информации об устройстве (Для безопасности и логов входов)
    getDeviceInfo() {
        return {
            id: localStorage.getItem('craneapp_device_id') || this.generateDeviceId(),
            version: '1.0.0-beta',
            os: navigator.userAgent
        };
    }

    generateDeviceId() {
        const id = 'dev_' + Math.random().toString(36).substr(2, 16);
        localStorage.setItem('craneapp_device_id', id);
        return id;
    }

    // Рассылка глобального события об изменении статуса авторизации
    dispatchAuthStateChange(isAuthenticated) {
        const event = new CustomEvent('auth:statusChanged', {
            detail: { isAuthenticated, user: this.currentUser }
        });
        window.dispatchEvent(event);
    }
}
