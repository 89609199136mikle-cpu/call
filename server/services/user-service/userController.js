/**
 * Контроллер управления пользователями.
 * Обрабатывает поиск, получение профилей и обновление данных.
 */
const userService = require('./userService');

class UserController {
    /**
     * Получить профиль текущего пользователя
     * (ID берется из заголовка x-user-id, установленного Gateway)
     */
    async getMe(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const user = await userService.getUserById(userId);
            
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            res.json(user);
        } catch (error) {
            console.error('[UserCtrl] getMe error:', error);
            res.status(500).json({ error: 'Ошибка при получении профиля' });
        }
    }

    /**
     * Обновить данные профиля (био, имя, настройки)
     */
    async updateProfile(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const updates = req.body;

            // Защита: нельзя менять чувствительные поля через этот эндпоинт
            delete updates.password;
            delete updates.role;
            delete updates.email;

            const updatedUser = await userService.updateUser(userId, updates);
            res.json({ message: 'Профиль обновлен', user: updatedUser });
        } catch (error) {
            console.error('[UserCtrl] updateProfile error:', error);
            res.status(500).json({ error: 'Не удалось обновить профиль' });
        }
    }

    /**
     * Поиск пользователей по юзернейму или телефону
     */
    async search(req, res) {
        try {
            const { query } = req.query;
            if (!query || query.length < 3) {
                return res.status(400).json({ error: 'Запрос слишком короткий' });
            }

            const users = await userService.searchUsers(query);
            res.json(users);
        } catch (error) {
            console.error('[UserCtrl] search error:', error);
            res.status(500).json({ error: 'Ошибка при поиске' });
        }
    }

    /**
     * Получить публичный профиль другого пользователя
     */
    async getPublicProfile(req, res) {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id, true); // true = public fields only
            
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            res.json(user);
        } catch (error) {
            console.error('[UserCtrl] getPublicProfile error:', error);
            res.status(500).json({ error: 'Ошибка при получении данных' });
        }
    }
}

module.exports = new UserController();
