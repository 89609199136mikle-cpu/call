const path = require('path');
const fs = require('fs').promises;
// В реальном проекте здесь: const AWS = require('aws-sdk'); или const cloudinary = require('cloudinary').v2;

/**
 * Сервис хранения медиафайлов.
 * Отвечает за физическое перемещение байтов и генерацию публичных ссылок.
 */

class StorageService {
    constructor() {
        this.uploadDir = path.join(__dirname, '../../../public/uploads');
        // Настройка S3 / Cloudinary из переменных окружения Railway
        this.useCloud = process.env.NODE_ENV === 'production';
    }

    /**
     * Основной метод сохранения файла
     * @param {Object} file - Объект файла из Multer
     * @param {string} folder - Тип медиа (images/voice/videos)
     * @param {string} userId - ID владельца
     */
    async saveFile(file, folder, userId) {
        try {
            const fileName = `${Date.now()}-${file.originalname}`;
            const relativePath = `uploads/${userId}/${folder}/${fileName}`;
            const fullPath = path.join(this.uploadDir, `../${relativePath}`);

            if (this.useCloud) {
                // ЛОГИКА ДЛЯ RAILWAY PRODUCTION (S3 / Cloudinary)
                // return await this._uploadToCloud(file, relativePath);
                console.log(`[StorageService] Uploading to Cloud: ${relativePath}`);
                return {
                    url: `https://cdn.craneapp.io/${relativePath}`,
                    size: file.size,
                    type: file.mimetype
                };
            } else {
                // ЛОГИКА ДЛЯ LOCAL DEV
                await fs.mkdir(path.dirname(fullPath), { recursive: true });
                await fs.writeFile(fullPath, file.buffer);
                
                return {
                    url: `http://localhost:5000/${relativePath}`,
                    size: file.size,
                    path: fullPath
                };
            }
        } catch (error) {
            console.error('[StorageService] Save error:', error);
            throw new Error('Не удалось сохранить файл в хранилище');
        }
    }

    /**
     * Специальная обработка тяжелых файлов (видео)
     */
    async saveLargeFile(file, folder, userId) {
        // Здесь можно добавить генерацию превью (thumbnail) через ffmpeg
        const result = await this.saveFile(file, folder, userId);
        return {
            ...result,
            thumbnailUrl: result.url.replace(/\.[^/.]+$/, ".jpg"), // Имитация смены расширения
            duration: 0 // Здесь была бы логика извлечения метаданных
        };
    }

    /**
     * Удаление файла (при удалении сообщения)
     */
    async deleteFile(fileUrl) {
        try {
            console.log(`[StorageService] Deleting file: ${fileUrl}`);
            // Логика удаления из S3 или ФС
            return true;
        } catch (error) {
            console.error('[StorageService] Delete error:', error);
            return false;
        }
    }
}

module.exports = new StorageService();
