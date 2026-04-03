import { authStore } from '../store/authStore.js';

/**
 * Хук для управления списком контактов в Craneapp.
 */
export const useContacts = () => {
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/contacts' 
        : 'https://craneapp-production.up.railway.app/api/contacts';

    const token = authStore.getToken();

    /**
     * Получение списка всех контактов пользователя
     */
    const getContacts = async () => {
        try {
            const response = await fetch(`${API_URL}/all`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Ошибка загрузки контактов');

            return { success: true, contacts: data.contacts };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Добавление нового контакта по номеру телефона или ID
     * @param {string} identifier - Телефон или Username
     */
    const addContact = async (identifier) => {
        try {
            const response = await fetch(`${API_URL}/add`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ identifier })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            return { success: true, contact: data.contact };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Удаление из списка контактов
     */
    const removeContact = async (contactId) => {
        try {
            const response = await fetch(`${API_URL}/remove/${contactId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Не удалось удалить контакт');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return {
        getContacts,
        addContact,
        removeContact
    };
};
