import { chatStore } from '../store/chatStore.js';
import { authStore } from '../store/authStore.js';

/**
 * Хук для управления чатами и сообщениями в Craneapp.
 */
export const useChats = () => {
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/chats' 
        : 'https://craneapp-production.up.railway.app/api/chats';

    const token = authStore.getToken();

    /**
     * Получение всех активных диалогов пользователя
     */
    const getMyChats = async () => {
        try {
            const response = await fetch(`${API_URL}/my-chats`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            // Обновляем локальное хранилище
            chatStore.setChats(data.chats);
            return { success: true, chats: data.chats };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Загрузка истории сообщений конкретного чата
     * @param {string} chatId 
     */
    const getMessages = async (chatId) => {
        try {
            const response = await fetch(`${API_URL}/${chatId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            return { success: true, messages: data.messages };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Создание нового чата (или поиск существующего)
     * @param {string} recipientId 
     */
    const createChat = async (recipientId) => {
        try {
            const response = await fetch(`${API_URL}/create`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recipientId })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            return { success: true, chat: data.chat };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Поиск пользователей по юзернейму (для создания новых чатов)
     */
    const searchUsers = async (query) => {
        if (!query || query.length < 3) return [];
        try {
            const response = await fetch(`${API_URL}/search-users?q=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            return data.users || [];
        } catch (error) {
            console.error('Ошибка поиска:', error);
            return [];
        }
    };

    return {
        getMyChats,
        getMessages,
        createChat,
        searchUsers,
        allChats: chatStore.getChats()
    };
};
