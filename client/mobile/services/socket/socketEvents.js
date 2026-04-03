import { messageStore } from '../../store/messageStore.js';
import { chatStore } from '../../store/chatStore.js';
import { authStore } from '../../store/authStore.js';

/**
 * Обработчик входящих событий Socket.io.
 * Распределяет данные по Store и инициирует уведомления в UI.
 */

export const socketEvents = {
    /**
     * Инициализация слушателей на объекте socket
     * @param {Socket} socket - Экземпляр от socketClient.js
     */
    init(socket) {
        if (!socket) return;

        // --- СООБЩЕНИЯ ---

        // Новое входящее сообщение
        socket.on('message:new', (message) => {
            console.log('Craneapp: Новое сообщение', message);
            
            // 1. Добавляем в хранилище сообщений
            messageStore.addMessage(message);
            
            // 2. Обновляем превью в списке чатов (последнее сообщение)
            chatStore.updateLastMessage(message.chatId, message);
            
            // 3. Если чат не открыт — вызываем системное уведомление
            this.handleNotification(message);
        });

        // Сообщение прочитано собеседником
        socket.on('message:read_status', ({ chatId, messageIds }) => {
            messageStore.markAsRead(chatId, messageIds);
        });

        // Сообщение удалено
        socket.on('message:deleted', ({ chatId, messageId }) => {
            messageStore.removeMessage(chatId, messageId);
        });


        // --- СТАТУСЫ ---

        // Собеседник печатает
        socket.on('chat:typing', ({ chatId, userId, username }) => {
            chatStore.setUserTyping(chatId, userId, username);
            
            // Автоматически скрываем статус через 3 секунды
            setTimeout(() => {
                chatStore.setUserTyping(chatId, userId, null);
            }, 3000);
        });

        // Изменение статуса (Online/Offline)
        socket.on('user:presence', ({ userId, status }) => {
            chatStore.updateUserPresence(userId, status);
        });


        // --- ЗВОНКИ (Signaling для WebRTC) ---

        // Входящий звонок (Offer)
        socket.on('call:incoming', (data) => {
            // Перенаправляем на экран звонка
            window.location.href = `../calls/call.html?callerId=${data.from}&type=${data.type}`;
        });


        // --- СИСТЕМНЫЕ ---

        socket.on('error:auth', () => {
            console.error('Сессия устарела. Выход...');
            authStore.clear();
            window.location.href = '../auth/login.html';
        });
    },

    /**
     * Логика уведомлений (Push или Sound)
     */
    handleNotification(message) {
        const currentChatId = new URLSearchParams(window.location.search).get('id');
        
        // Не уведомляем, если пользователь уже в этом чате
        if (message.chatId === currentChatId) return;

        // Всплывающее уведомление (если реализовано в UI)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(message.senderName, {
                body: message.text,
                icon: '../../../assets/icons/logo.png'
            });
        }
        
        // Звуковой сигнал (из sounds.json)
        const audio = new Audio('../../../assets/sounds/new_message.mp3');
        audio.play().catch(() => {}); // Игнорируем блокировку автоплея браузером
    }
};
