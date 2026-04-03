import { authStore } from '../../store/authStore.js';

/**
 * API Сервис для работы с сообщениями.
 * Обеспечивает HTTP-взаимодействие с message-service.
 */

const BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/messages' 
    : 'https://craneapp-production.up.railway.app/api/messages';

export const messageApi = {
    /**
     * Получить историю сообщений для конкретного чата
     * @param {string} chatId 
     * @param {Object} params - { limit: 50, offset: 0 } для пагинации
     */
    fetchMessages: async (chatId, params = { limit: 50, offset: 0 }) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/${chatId}?${query}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return await handleResponse(response);
    },

    /**
     * Отправить сообщение с вложением (FormData для файлов)
     * @param {FormData} formData - содержит текст и файл
     */
    sendMediaMessage: async (formData) => {
        const response = await fetch(`${BASE_URL}/media`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authStore.getToken()}`
                // Content-Type не ставим, браузер сам выставит multipart/form-data с boundary
            },
            body: formData
        });
        return await handleResponse(response);
    },

    /**
     * Отметить сообщения как прочитанные
     * @param {string} chatId 
     * @param {Array} messageIds 
     */
    markAsRead: async (chatId, messageIds) => {
        const response = await fetch(`${BASE_URL}/${chatId}/read`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ messageIds })
        });
        return await handleResponse(response);
    },

    /**
     * Удалить сообщение (у себя или у всех)
     * @param {string} messageId 
     * @param {boolean} forEveryone 
     */
    deleteMessage: async (messageId, forEveryone = false) => {
        const response = await fetch(`${BASE_URL}/${messageId}`, {
            method: 'DELETE',
            headers: getHeaders(),
            body: JSON.stringify({ forEveryone })
        });
        return await handleResponse(response);
    },

    /**
     * Редактировать текст сообщения
     */
    editMessage: async (messageId, newText) => {
        const response = await fetch(`${BASE_URL}/${messageId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ text: newText })
        });
        return await handleResponse(response);
    }
};

/**
 * Вспомогательные заголовки
 */
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.getToken()}`
    };
}

/**
 * Обработка сетевых ответов
 */
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || 'Ошибка API сообщений');
        error.status = response.status;
        throw error;
    }
    return data;
}
