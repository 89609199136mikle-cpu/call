/**
 * Сервис аутентификации.
 * Содержит методы для работы с моделью User в базе данных.
 */

// В реальном приложении здесь импортируется модель Sequelize, TypeORM или клиент Prisma
// Например: const { User } = require('../../database/models');

class AuthService {
    /**
     * Поиск пользователя по Email
     * @param {string} email 
     */
    async findUserByEmail(email) {
        try {
            // Имитация запроса к БД: SELECT * FROM users WHERE email = ?
            // return await User.findOne({ where: { email } });
            
            console.log(`[AuthService] Searching user by email: ${email}`);
            return null; // Заглушка, пока не подключена реальная БД
        } catch (error) {
            throw new Error('Ошибка при поиске пользователя в базе данных');
        }
    }

    /**
     * Создание нового пользователя
     * @param {Object} userData - Данные из контроллера (уже с хешированным паролем)
     */
    async createUser(userData) {
        try {
            // Имитация: INSERT INTO users (username, email, password, ...) VALUES (...)
            // const newUser = await User.create(userData);
            
            console.log(`[AuthService] Creating user: ${userData.username}`);
            
            // Возвращаем объект пользователя для генерации токена в контроллере
            return {
                id: Date.now().toString(), // Временный ID для тестов
                ...userData
            };
        } catch (error) {
            throw new Error('Не удалось сохранить пользователя в базе данных');
        }
    }

    /**
     * Обновление статуса (Online/Offline)
     */
    async updateStatus(userId, status) {
        try {
            // await User.update({ status }, { where: { id: userId } });
            console.log(`[AuthService] User ${userId} is now ${status}`);
        } catch (error) {
            console.error('[AuthService] Status update error:', error);
        }
    }

    /**
     * Поиск пользователя по ID (для проверки токена и профиля)
     */
    async findUserById(userId) {
        try {
            // return await User.findByPk(userId);
            return null;
        } catch (error) {
            throw new Error('Пользователь не найден');
        }
    }
}

module.exports = new AuthService();
