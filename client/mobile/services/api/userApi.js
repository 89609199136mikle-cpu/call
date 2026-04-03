import { authStore } from '../../store/authStore.js';

/**
 * API Сервис для управления данными пользователей.
 * Взаимодействует с user-service на Railway.
 */

const BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/users' 
    : 'https://craneapp-production.up.railway.app/api/users';

export const userApi = {
    /**
     * Получить данные профиля (своего или чужого)
     * @param {string} userId - Если не указан, возвращает текущего юзера
     */
    getProfile: async (userId = 'me') => {
        const response = await fetch(`${BASE_URL}/profile/${userId}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return await handleResponse(response);
    },

    /**
     * Обновить данные своего профиля
     * @param {Object} updateData - { fullName, bio, username, avatarUrl }
     */
    updateProfile: async (updateData) => {
        const response = await fetch(`${BASE_URL}/update`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(updateData)
        });
        return await handleResponse(response);
    },

    /**
     * Поиск пользователей в глобальной базе Craneapp
     * @param {string} query - Часть имени или @username
     */
    searchGlobal: async (query) => {
        const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return await handleResponse(response);
    },

    /**
     * Обновить статус "В сети" или "Последний раз был..."
     * Вызывается автоматически при активности приложения
     */
    updatePresence: async (status = 'online') => {
        const response = await fetch(`${BASE_URL}/presence`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        return await handleResponse(response);
    },

    /**
     * Заблокировать или разблокировать пользователя
     */
    toggleBlock: async (targetUserId, block = true) => {
        const action = block ? 'block' : 'unblock';
        const response = await fetch(`${BASE_URL}/${action}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ targetUserId })
        });
        return await handleResponse(response);
    }
};

/**
 * Вспомогательная функция для формирования заголовков
 */
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.getToken()}`
    };
}

/**
 * Универсальный обработчик HTTP ответов
 */
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || 'Ошибка User Service');
        error.status = response.status;
        throw error;
    }
    return data;
}
