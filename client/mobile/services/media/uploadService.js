import { authStore } from '../../store/authStore.js';

/**
 * Сервис загрузки медиафайлов.
 * Обрабатывает подготовку, сжатие и отправку файлов на media-service.
 */

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/media/upload' 
    : 'https://craneapp-production.up.railway.app/api/media/upload';

class UploadService {
    /**
     * Основной метод загрузки файла
     * @param {File} file - Объект файла из input или drag-and-drop
     * @param {Function} onProgress - Callback для обновления ProgressBar в UI
     */
    async upload(file, onProgress) {
        try {
            // 1. Подготовка данных
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', file.type);

            // 2. Создание XMLHttpRequest для отслеживания прогресса
            // (fetch пока не поддерживает upload progress стандартно)
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', API_URL);

                // Установка заголовка авторизации
                const token = authStore.getToken();
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                // Отслеживание прогресса загрузки
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        onProgress(percentComplete);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.response);
                        resolve({ success: true, url: response.url, fileId: response.id });
                    } else {
                        reject(new Error('Ошибка загрузки на сервер Railway'));
                    }
                };

                xhr.onerror = () => reject(new Error('Сетевая ошибка при загрузке'));
                xhr.send(formData);
            });
        } catch (error) {
            console.error('[UploadService] Fatal error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Создание превью для мгновенного отображения (Blob URL)
     * Позволяет пользователю видеть картинку в чате ДО завершения загрузки.
     */
    createPreview(file) {
        return URL.createObjectURL(file);
    }

    /**
     * Валидация файла перед отправкой
     */
    validate(file) {
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB лимит для Railway Free Tier
        if (file.size > MAX_SIZE) {
            return { valid: false, error: 'Файл слишком большой (макс. 50МБ)' };
        }
        return { valid: true };
    }
}

export const uploadService = new UploadService();
