/**
 * API Сервис для аутентификации.
 * Чистый модуль для взаимодействия с эндпоинтамиauth-service.
 */

const BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/auth' 
    : 'https://craneapp-production.up.railway.app/api/auth';

export const authApi = {
    /**
     * Запрос на проверку номера телефона и отправку OTP
     * @param {string} phone 
     */
    checkPhone: async (phone) => {
        const response = await fetch(`${BASE_URL}/check-phone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });
        return await handleResponse(response);
    },

    /**
     * Верификация OTP кода
     * @param {string} phone 
     * @param {string} code 
     */
    verifyOtp: async (phone, code) => {
        const response = await fetch(`${BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code })
        });
        return await handleResponse(response);
    },

    /**
     * Финальная регистрация пользователя
     * @param {Object} userData - { phone, username, fullName, avatar? }
     */
    register: async (userData) => {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await handleResponse(response);
    },

    /**
     * Вход по логину/паролю (если включено в настройках безопасности)
     */
    login: async (identifier, password) => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });
        return await handleResponse(response);
    },

    /**
     * Обновление токена доступа
     * @param {string} refreshToken 
     */
    refreshToken: async (refreshToken) => {
        const response = await fetch(`${BASE_URL}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });
        return await handleResponse(response);
    }
};

/**
 * Вспомогательная функция для обработки ответов сервера
 */
async function handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
        // Выбрасываем структурированную ошибку для перехвата в хуках
        const error = new Error(data.message || 'Ошибка сетевого запроса');
        error.status = response.status;
        error.details = data.errors || null;
        throw error;
    }
    
    return data;
}
