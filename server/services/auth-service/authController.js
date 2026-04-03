const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Предполагаем наличие authService для работы с БД (напишем следующим)
const authService = require('./authService');

/**
 * Контроллер аутентификации.
 * Обрабатывает входящие HTTP-запросы от API Gateway.
 */

class AuthController {
    /**
     * Регистрация нового пользователя
     */
    async register(req, res) {
        try {
            const { username, email, password, phone } = req.body;

            // 1. Проверяем, не занят ли email или username
            const existingUser = await authService.findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }

            // 2. Хешируем пароль (Salt rounds = 10)
            const hashedPassword = await bcrypt.hash(password, 10);

            // 3. Создаем пользователя в БД через сервис
            const newUser = await authService.createUser({
                username,
                email,
                password: hashedPassword,
                phone,
                status: 'online'
            });

            // 4. Генерируем токен, чтобы пользователь сразу залогинился
            const token = this._generateToken(newUser);

            res.status(201).json({
                message: 'Регистрация успешна',
                token,
                user: { id: newUser.id, username: newUser.username, email: newUser.email }
            });
        } catch (error) {
            console.error('[AuthCtrl] Register error:', error);
            res.status(500).json({ error: 'Ошибка при регистрации' });
        }
    }

    /**
     * Вход пользователя (Login)
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // 1. Поиск пользователя
            const user = await authService.findUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }

            // 2. Проверка пароля
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }

            // 3. Генерация JWT
            const token = this._generateToken(user);

            res.json({
                token,
                user: { id: user.id, username: user.username, avatar: user.avatar }
            });
        } catch (error) {
            console.error('[AuthCtrl] Login error:', error);
            res.status(500).json({ error: 'Ошибка сервера при входе' });
        }
    }

    /**
     * Вспомогательный метод генерации токена
     */
    _generateToken(user) {
        const JWT_SECRET = process.env.JWT_SECRET || 'crane_super_secret_2026';
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role || 'user' },
            JWT_SECRET,
            { expiresIn: '7d' } // Токен живет неделю
        );
    }
}

module.exports = new AuthController();
