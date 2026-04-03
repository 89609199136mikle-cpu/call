import { storage } from '../services/storage/localStorage.js';

/**
 * Хранилище списка чатов и их метаданных.
 * Отвечает за сортировку, счетчики и статусы присутствия.
 */

class ChatStore {
    constructor() {
        // Загружаем закэшированные чаты для мгновенного старта (Offline-first)
        this._chats = storage.get('chats_list', []);
        this._listeners = [];
        this._typingStates = new Map(); // chatId -> { userId, username }
    }

    /**
     * Обновить весь список чатов (вызывается из useChats после API запроса)
     */
    setChats(chats) {
        // Сортируем: чаты с самыми свежими сообщениями вверху
        this._chats = this._sortChats(chats);
        storage.set('chats_list', this._chats);
        this._notify();
    }

    getChats() {
        return this._chats;
    }

    /**
     * Обновить последнее сообщение в конкретном чате (из socketEvents)
     */
    updateLastMessage(chatId, message) {
        const index = this._chats.findIndex(c => c.id === chatId);
        if (index !== -1) {
            this._chats[index].lastMessage = message;
            this._chats[index].updatedAt = message.timestamp;
            
            // Если сообщение входящее и чат не активен, увеличиваем счетчик
            if (!message.isMine) {
                this._chats[index].unreadCount = (this._chats[index].unreadCount || 0) + 1;
            }

            this._chats = this._sortChats(this._chats);
            storage.set('chats_list', this._chats);
            this._notify();
        }
    }

    /**
     * Установка статуса "Печатает..."
     */
    setUserTyping(chatId, userId, username) {
        if (username) {
            this._typingStates.set(chatId, { userId, username });
        } else {
            this._typingStates.delete(chatId);
        }
        this._notify();
    }

    getTypingUser(chatId) {
        return this._typingStates.get(chatId) || null;
    }

    /**
     * Сброс счетчика непрочитанных для конкретного чата
     */
    resetUnread(chatId) {
        const chat = this._chats.find(c => c.id === chatId);
        if (chat && chat.unreadCount > 0) {
            chat.unreadCount = 0;
            storage.set('chats_list', this._chats);
            this._notify();
        }
    }

    /**
     * Вспомогательная сортировка по времени
     */
    _sortChats(chats) {
        return [...chats].sort((a, b) => {
            const dateA = new Date(a.lastMessage?.timestamp || a.updatedAt);
            const dateB = new Date(b.lastMessage?.timestamp || b.updatedAt);
            return dateB - dateA;
        });
    }

    subscribe(callback) {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(l => l !== callback);
        };
    }

    _notify() {
        this._listeners.forEach(callback => callback(this._chats));
    }
}

export const chatStore = new ChatStore();
