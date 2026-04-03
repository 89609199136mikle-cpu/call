/**
 * Контроллер управления чатами.
 * Реализует логику создания диалогов, групп и каналов.
 */
const chatService = require('./chatService');

class ChatController {
    /**
     * Получить список всех чатов пользователя (для экрана chats.html)
     */
    async getUserChats(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const chats = await chatService.getChatsByUserId(userId);
            
            res.json(chats);
        } catch (error) {
            console.error('[ChatCtrl] getUserChats error:', error);
            res.status(500).json({ error: 'Ошибка при получении списка чатов' });
        }
    }

    /**
     * Создать или получить существующий приватный чат (1-на-1)
     */
    async createPrivateChat(req, res) {
        try {
            const currentUserId = req.headers['x-user-id'];
            const { partnerId } = req.body;

            if (!partnerId) {
                return res.status(400).json({ error: 'Не указан ID собеседника' });
            }

            const chat = await chatService.findOrCreatePrivateChat(currentUserId, partnerId);
            res.status(201).json(chat);
        } catch (error) {
            console.error('[ChatCtrl] createPrivateChat error:', error);
            res.status(500).json({ error: 'Ошибка при создании диалога' });
        }
    }

    /**
     * Создать группу (согласно createGroup.html)
     */
    async createGroup(req, res) {
        try {
            const creatorId = req.headers['x-user-id'];
            const { title, participants, avatar } = req.body;

            if (!title || !participants || !participants.length) {
                return res.status(400).json({ error: 'Название и участники обязательны' });
            }

            const group = await chatService.createChat({
                title,
                type: 'group',
                creatorId,
                avatar,
                members: [creatorId, ...participants]
            });

            res.status(201).json(group);
        } catch (error) {
            console.error('[ChatCtrl] createGroup error:', error);
            res.status(500).json({ error: 'Ошибка при создании группы' });
        }
    }

    /**
     * Создать канал (согласно createChannel.html)
     */
    async createChannel(req, res) {
        try {
            const creatorId = req.headers['x-user-id'];
            const { title, description, avatar } = req.body;

            const channel = await chatService.createChat({
                title,
                description,
                type: 'channel',
                creatorId,
                avatar,
                members: [creatorId]
            });

            res.status(201).json(channel);
        } catch (error) {
            console.error('[ChatCtrl] createChannel error:', error);
            res.status(500).json({ error: 'Ошибка при создании канала' });
        }
    }

    /**
     * Получить детальную информацию о чате (участники, настройки)
     */
    async getChatDetails(req, res) {
        try {
            const { chatId } = req.params;
            const chat = await chatService.getChatById(chatId);

            if (!chat) {
                return res.status(404).json({ error: 'Чат не найден' });
            }

            res.json(chat);
        } catch (error) {
            console.error('[ChatCtrl] getChatDetails error:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
}

module.exports = new ChatController();
