/**
 * Контроллер звонков (Signaling & Session Management).
 * Управляет логикой инициализации WebRTC соединений.
 */
const callService = require('./callService');

class CallController {
    /**
     * Инициация звонка (предложение - Offer)
     * Вызывается, когда пользователь нажимает "Позвонить" в contactProfile.html
     */
    async startCall(req, res) {
        try {
            const callerId = req.headers['x-user-id'];
            const { receiverId, type } = req.body; // type: 'audio' или 'video'

            if (!receiverId) {
                return res.status(400).json({ error: 'Не указан получатель звонка' });
            }

            // 1. Создаем запись о звонке в БД (database/schema/calls.txt)
            const callSession = await callService.createCallSession({
                callerId,
                receiverId,
                type,
                status: 'ringing'
            });

            // 2. В реальной системе здесь отправляется Push-уведомление через Firebase
            // или событие через Socket.io получателю.
            
            res.status(201).json({
                sessionId: callSession.id,
                iceServers: callService.getIceConfig(), // Передаем конфиг STUN/TURN
                message: 'Вызов инициирован'
            });
        } catch (error) {
            console.error('[CallCtrl] startCall error:', error);
            res.status(500).json({ error: 'Не удалось начать звонок' });
        }
    }

    /**
     * Ответ на входящий звонок (Accept)
     */
    async acceptCall(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { sessionId } = req.params;

            const updatedCall = await callService.updateStatus(sessionId, 'active');
            
            res.json({
                message: 'Звонок принят',
                session: updatedCall
            });
        } catch (error) {
            console.error('[CallCtrl] acceptCall error:', error);
            res.status(500).json({ error: 'Ошибка при ответе на звонок' });
        }
    }

    /**
     * Завершение звонка (Hang up)
     */
    async endCall(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { sessionId } = req.params;
            const { duration } = req.body;

            await callService.updateStatus(sessionId, 'ended', duration);
            
            res.json({ message: 'Звонок завершен' });
        } catch (error) {
            console.error('[CallCtrl] endCall error:', error);
            res.status(500).json({ error: 'Ошибка при завершении' });
        }
    }

    /**
     * Получение истории звонков (для calls.html)
     */
    async getHistory(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const history = await callService.getHistoryByUserId(userId);
            res.json(history);
        } catch (error) {
            console.error('[CallCtrl] getHistory error:', error);
            res.status(500).json({ error: 'Не удалось загрузить историю' });
        }
    }
}

module.exports = new CallController();
