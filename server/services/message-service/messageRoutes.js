const express = require('express');
const router = express.Router();
const messageController = require('./messageController');

/**
 * Роуты микросервиса сообщений.
 * Префикс в Gateway: /api/messages/*
 */

// 1. Отправить новое сообщение (резервный путь или для ботов)
// POST /api/messages/send
router.post('/send', (req, res) => messageController.sendMessage(req, res));

// 2. Получить историю сообщений конкретного чата
// GET /api/messages/history/:chatId?limit=50&offset=0
router.get('/history/:chatId', (req, res) => messageController.getChatHistory(req, res));

// 3. Пометить список сообщений как прочитанные
// PATCH /api/messages/read
router.patch('/read', (req, res) => messageController.markAsRead(req, res));

// 4. Редактировать существующее сообщение
// PUT /api/messages/edit/:messageId
router.put('/edit/:messageId', (req, res) => messageController.editMessage(req, res));

// 5. Удалить сообщение (для себя или для всех)
// DELETE /api/messages/:messageId
router.delete('/:messageId', (req, res) => messageController.deleteMessage(req, res));

// 6. Получить статус конкретного сообщения (доставлено/прочитано)
// GET /api/messages/status/:messageId
router.get('/status/:messageId', (req, res) => {
    res.json({ status: 'read', timestamp: new Date() });
});

module.exports = router;
