/**
 * Контроллер загрузки медиафайлов.
 * Обрабатывает мультипарт-запросы (Multer) и передает их в StorageService.
 */
const storageService = require('./storageService');

class UploadController {
    /**
     * Загрузка изображения или аватара
     * (Интегрируется с avatar.js и imageViewer.js на фронтенде)
     */
    async uploadImage(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const file = req.file; // Файл из multer middleware

            if (!file) {
                return res.status(400).json({ error: 'Файл не выбран' });
            }

            // 1. Сохраняем в постоянное хранилище (S3/Cloudinary) через сервис
            const fileData = await storageService.saveFile(file, 'images', userId);

            // 2. Возвращаем URL и метаданные для вставки в сообщение
            res.status(201).json({
                message: 'Изображение загружено',
                url: fileData.url,
                width: fileData.width,
                height: fileData.height,
                size: fileData.size
            });
        } catch (error) {
            console.error('[UploadCtrl] Image upload error:', error);
            res.status(500).json({ error: 'Ошибка при обработке изображения' });
        }
    }

    /**
     * Загрузка видео или тяжелых файлов
     * (Интегрируется с videoPlayer.js)
     */
    async uploadVideo(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const file = req.file;

            if (!file) return res.status(400).json({ error: 'Видео не найдено' });

            // Для видео на Railway лучше использовать Stream-загрузку
            const videoData = await storageService.saveLargeFile(file, 'videos', userId);

            res.status(201).json({
                url: videoData.url,
                duration: videoData.duration,
                thumbnail: videoData.thumbnailUrl
            });
        } catch (error) {
            console.error('[UploadCtrl] Video upload error:', error);
            res.status(500).json({ error: 'Ошибка загрузки видео' });
        }
    }

    /**
     * Загрузка голосовых сообщений
     * (Интегрируется с audioPlayer.js)
     */
    async uploadVoice(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const file = req.file;

            const audioData = await storageService.saveFile(file, 'voice', userId);

            res.status(201).json({
                url: audioData.url,
                mimeType: 'audio/ogg' // Стандарт для Telegram-like мессенджеров
            });
        } catch (error) {
            console.error('[UploadCtrl] Voice upload error:', error);
            res.status(500).json({ error: 'Ошибка записи' });
        }
    }
}

module.exports = new UploadController();
