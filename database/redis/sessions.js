/**
 * Менеджер сессий на базе Redis.
 * Используется для хранения активных токенов и статусов присутствия.
 */
const redis = require('redis');

class SessionManager {
    constructor() {
        this.client = redis.createClient({
            url: process.env.REDIS_URL
        });

        this.client.on('error', (err) => console.error('[Redis] Error:', err));
        this.connect();
    }

    async connect() {
        if (!this.client.isOpen) {
            await this.client.connect();
            console.log('🚀 Redis Connected for Sessions');
        }
    }

    /**
     * Создать сессию при логине (authController.js)
     * @param {string} userId - ID пользователя
     * @param {string} token - JWT или Refresh Token
     */
    async createSession(userId, token) {
        const key = `session:${userId}`;
        // Храним сессию 7 дней (в секундах)
        await this.client.set(key, token, {
            EX: 7 * 24 * 60 * 60
        });
        
        // Обновляем статус на Online
        await this.setUserOnline(userId);
    }

    /**
     * Проверка валидности сессии (authMiddleware.js)
     */
    async getSession(userId) {
        return await this.client.get(`session:${userId}`);
    }

    /**
     * Удаление сессии при логауте
     */
    async destroySession(userId) {
        await this.client.del(`session:${userId}`);
        await this.setUserOffline(userId);
    }

    /**
     * Управление статусом Presence
     */
    async setUserOnline(userId) {
        await this.client.set(`presence:${userId}`, 'online', {
            EX: 300 // Статус истекает через 5 минут, если не обновлять
        });
    }

    async setUserOffline(userId) {
        await this.client.del(`presence:${userId}`);
    }

    async getUserStatus(userId) {
        const status = await this.client.get(`presence:${userId}`);
        return status || 'offline';
    }
}

module.exports = new SessionManager();
