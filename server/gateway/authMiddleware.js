const jwt = require('jsonwebtoken');

/**
 * Middleware для проверки авторизации на уровне Gateway.
 * Декодирует токен и передает данные пользователя в заголовках микросервисам.
 */

const authMiddleware = (req, res, next) => {
    // 1. Извлекаем заголовок Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Формат: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ 
            error: 'Access Denied', 
            message: 'Токен авторизации не найден' 
        });
    }

    try {
        // 2. Проверка подписи токена (используем секрет из переменных окружения Railway)
        const JWT_SECRET = process.env.JWT_SECRET || 'crane_super_secret_2026';
        const verified = jwt.verify(token, JWT_SECRET);

        // 3. Обогащаем запрос данными пользователя
        // Это важно: мы прокидываем x-user-id дальше в микросервисы, 
        // чтобы они знали, кто делает запрос, не перепроверяя токен заново.
        req.user = verified;
        req.headers['x-user-id'] = verified.id;
        req.headers['x-user-role'] = verified.role || 'user';

        next();
    } catch (error) {
        console.error('[AuthMiddleware] Invalid Token:', error.message);
        
        // Обработка истечения срока действия токена
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token Expired', 
                message: 'Сессия истекла, пожалуйста, войдите снова' 
            });
        }

        res.status(403).json({ 
            error: 'Forbidden', 
            message: 'Невалидный токен' 
        });
    }
};

module.exports = { authMiddleware };
