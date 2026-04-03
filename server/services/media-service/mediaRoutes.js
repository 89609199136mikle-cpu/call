const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('./uploadController');

/**
 * Настройка Multer для обработки файлов в оперативной памяти.
 * Это самый быстрый способ для последующей передачи в Cloudinary/S3.
 */
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // Лимит 50MB на файл
    }
});

/**
 * Роуты медиа-сервиса.
 * Префикс в Gateway: /api/media/*
 */

// 1. Загрузка изображений (Аватары, фото в чат)
// POST /api/media/upload/image
router.post(
    '/upload/image', 
    upload.single('file'), 
    (req, res) => uploadController.uploadImage(req, res)
);

// 2. Загрузка видео-контента
// POST /api/media/upload/video
router.post(
    '/upload/video', 
    upload.single('file'), 
    (req, res) => uploadController.uploadVideo(req, res)
);

// 3. Загрузка голосовых сообщений (Voice Notes)
// POST /api/media/upload/voice
router.post(
    '/upload/voice', 
    upload.single('file'), 
    (req, res) => uploadController.uploadVoice(req, res)
);

// 4. Загрузка документов и прочих файлов
// POST /api/media/upload/file
router.post(
    '/upload/file', 
    upload.single('file'), 
    (req, res) => {
        res.status(201).json({ message: 'Файл принят на обработку' });
    }
);

// 5. Получение метаданных файла по ID
// GET /api/media/info/:fileId
router.get('/info/:fileId', (req, res) => {
    res.json({ id: req.params.fileId, status: 'available' });
});

module.exports = router;
