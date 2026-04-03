/**
 * Сервис сообщений.
 * Работает с базой данных сообщений и обеспечивает логику их жизненного цикла.
 */

class MessageService {
    /**
     * Создать и сохранить сообщение
     */
    async createMessage(data) {
        try {
            const newMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                chatId: data.chatId,
                senderId: data.senderId,
                text: data.text,
                type: data.type || 'text',
                attachments: data.attachments || [],
                createdAt: new Date().toISOString(),
                status: 'sent', // sent -> delivered -> read
                isEdited: false
            };

            // Имитация: INSERT INTO messages (...)
            console.log(`[MsgService] Message saved: ${newMessage.id} in chat ${data.chatId}`);
            
            return newMessage;
        } catch (error) {
            throw new Error('Не удалось сохранить сообщение в БД');
        }
    }

    /**
     * Получить историю сообщений чата с пагинацией
     */
    async getHistory(chatId, { limit, offset }) {
        try {
            console.log(`[MsgService] Fetching history for ${chatId} (Limit: ${limit}, Offset: ${offset})`);
            
            // Имитация выборки: SELECT * FROM messages WHERE chatId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?
            return [
                {
                    id: "msg_1712100000",
                    senderId: "user_99",
                    text: "Привет! Как продвигается разработка Craneapp?",
                    createdAt: "2026-04-03T10:00:00Z",
                    status: "read"
                },
                {
                    id: "msg_1712100005",
                    senderId: "me",
                    text: "Почти закончили с message-service!",
                    createdAt: "2026-04-03T10:05:00Z",
                    status: "sent"
                }
            ];
        } catch (error) {
            throw new Error('Ошибка при загрузке истории сообщений');
        }
    }

    /**
     * Редактирование сообщения
     */
    async edit(messageId, userId, newText) {
        try {
            // 1. Проверяем, существует ли сообщение и принадлежит ли оно пользователю
            // 2. Обновляем текст и ставим флаг isEdited: true
            console.log(`[MsgService] User ${userId} editing message ${messageId}`);
            
            return {
                id: messageId,
                text: newText,
                isEdited: true,
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            throw new Error('Ошибка при редактировании сообщения');
        }
    }

    /**
     * Удаление сообщения (Логическое или физическое)
     */
    async delete(messageId, userId) {
        try {
            // Проверка прав и удаление: DELETE FROM messages WHERE id = ? AND senderId = ?
            console.log(`[MsgService] Message ${messageId} deleted by ${userId}`);
            return true;
        } catch (error) {
            throw new Error('Не удалось удалить сообщение');
        }
    }

    /**
     * Обновить статус прочтения (Массово)
     */
    async updateStatus(messageIds, status, userId) {
        try {
            // UPDATE messages SET status = ? WHERE id IN (?) AND senderId != ?
            console.log(`[MsgService] Messages ${messageIds.length} marked as ${status} by ${userId}`);
        } catch (error) {
            console.error('[MsgService] Status update failed:', error);
        }
    }
}

module.exports = new MessageService();
