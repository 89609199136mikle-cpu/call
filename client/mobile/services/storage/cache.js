/**
 * Сервис кэширования Craneapp.
 * Управляет временными данными в памяти и синхронизацией с постоянным хранилищем.
 */

class CacheService {
    constructor() {
        // Основное хранилище в оперативной памяти
        this._cache = new Map();
        
        // Время жизни кэша по умолчанию (5 минут)
        this.DEFAULT_TTL = 5 * 60 * 1000;
    }

    /**
     * Установить значение в кэш
     * @param {string} key - Уникальный ключ
     * @param {any} value - Данные
     * @param {number} ttl - Время жизни в мс (опционально)
     */
    set(key, value, ttl = this.DEFAULT_TTL) {
        const expiry = Date.now() + ttl;
        this._cache.set(key, { value, expiry });
        
        // Для отладки на Railway
        if (window.location.hostname === 'localhost') {
            console.log(`[Cache] Set: ${key} (expires in ${ttl/1000}s)`);
        }
    }

    /**
     * Получить значение из кэша
     * @param {string} key 
     */
    get(key) {
        const cached = this._cache.get(key);
        
        if (!cached) return null;

        // Проверка на протухание (TTL)
        if (Date.now() > cached.expiry) {
            this._cache.delete(key);
            return null;
        }

        return cached.value;
    }

    /**
     * Кэширование медиа-файлов (Blob/Base64)
     * Используется для мгновенного отображения аватаров и стикеров
     */
    async cacheMedia(url) {
        const cached = this.get(url);
        if (cached) return cached;

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            // Кэшируем на 1 час
            this.set(url, objectUrl, 60 * 60 * 1000);
            return objectUrl;
        } catch (e) {
            return url; // Возвращаем исходный URL при ошибке
        }
    }

    /**
     * Очистить весь кэш (например, при переключении аккаунта)
     */
    clear() {
        this._cache.clear();
        console.log('[Cache] All cleared');
    }

    /**
     * Удалить конкретную запись
     */
    delete(key) {
        this._cache.delete(key);
    }
}

// Экспортируем синглтон
export const cache = new CacheService();
