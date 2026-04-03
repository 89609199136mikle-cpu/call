import { authStore } from '../store/authStore.js';

/**
 * Хук для управления авторизацией в Craneapp.
 * Инкапсулирует логику запросов к API и обновление локального состояния.
 */
export const useAuth = () => {
    // Базовый URL вашего бэкенда на Railway
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/auth' 
        : 'https://craneapp-production.up.railway.app/api/auth';

    /**
     * Регистрация нового пользователя
     * @param {Object} userData - { phone, password, name, username }
     */
    const register = async (userData) => {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Ошибка регистрации');

            // Сохраняем данные в Store
            authStore.setToken(data.token);
            authStore.setUser(data.user);

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Вход в систему
     * @param {string} phone 
     * @param {string} password 
     */
    const login = async (phone, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Неверный логин или пароль');

            authStore.setToken(data.token);
            authStore.setUser(data.user);

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Выход из системы
     */
    const logout = () => {
        authStore.clear();
        window.location.href = '../auth/login.html';
    };

    /**
     * Проверка, авторизован ли пользователь
     */
    const isAuthenticated = () => {
        const token = authStore.getToken();
        const user = authStore.getUser();
        return !!(token && user);
    };

    return {
        register,
        login,
        logout,
        isAuthenticated,
        user: authStore.getUser()
    };
};
