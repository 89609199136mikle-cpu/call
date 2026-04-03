/**
 * Контроллер сообщений.
 * Отвечает за сохранение, редактирование, удаление и получение истории переписки.
 */
const messageService = require('./messageService');

class MessageController {
    /**
     * Отправить новое сообщение
     * Вызывается через REST (как бэкап) или внутренний эмиттер сокета
     */
    async sendMessage(req, res) {
        try {
            const senderId = req.headers['x-user-id'];
            const { chatId, text, type, attachments } = req.body;

            if (!chatId || (!text && !attachments)) {
                return res.status(400).json({ error: 'Сообщение не может быть пустым' });
            }

            const message = await messageService.createMessage({
                chatId,
                senderId,
                text,
                type: type || 'text',
                attachments: attachments || [],
                status: 'sent'
            });

            // В реальной системе здесь также дергается Socket.io для мгновенной доставки
            res.status(201).json(message);
        } catch (error) {
            console.error('[MsgCtrl] sendMessage error:', error);
            res.status(500).json({ error: 'Ошибка при отправке сообщения' });
        }
    }

    /**
     * Получить историю сообщений для конкретного чата (с пагинацией)
     * Используется при открытии chat.html
     */
    async getChatHistory(req, res) {
        try {
            const { chatId } = req.params;
            const { limit, offset } = req.query;

            const messages = await messageService.getHistory(chatId, {
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0
            });

            res.json(messages);
        } catch (error) {
            console.error('[MsgCtrl] getChatHistory error:', error);
            res.status(500).json({ error: 'Не удалось загрузить историю' });
        }
    }

    /**
     * Пометить сообщения как прочитанные
     */
    async markAsRead(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { chatId, messageIds } = req.body;

            await messageService.updateStatus(messageIds, 'read', userId);
            
            res.json({ success: true });
        } catch (error) {
            console.error('[MsgCtrl] markAsRead error:', error);
            res.status(500).json({ error: 'Ошибка обновления статуса' });
        }
    }

    /**
     * Редактировать сообщение (согласно messageMenu.js)
     */
    async editMessage(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { messageId } = req.params;
            const { newText } = req.body;

            const updated = await messageService.edit(messageId, userId, newText);
            res.json(updated);
        } catch (error) {
            console.error('[MsgCtrl] editMessage error:', error);
            res.status(500).json({ error: 'Ошибка при редактировании' });
        }
    }

    /**
     * Удалить сообщение
     */
    async deleteMessage(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { messageId } = req.params;

            await messageService.delete(messageId, userId);
            res.json({ message: 'Сообщение удалено' });
        } catch (error) {
            console.error('[MsgCtrl] deleteMessage error:', error);
            res.status(500).json({ error: 'Ошибка при удалении' });
        }
    }
}

module.exports = new MessageController();
