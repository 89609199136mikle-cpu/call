const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Настройка Socket.io с поддержкой CORS для Railway
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000, // Увеличиваем таймаут для стабильности на мобилках
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========== ХРАНИЛИЩА ДАННЫХ ==========
// socket.id -> { userId, username, lastSeen }
const users = new Map(); 
// userId -> socket.id (для мгновенного поиска получателя)
const userSockets = new Map();

// ========== ГЛАВНАЯ ЛОГИКА СОЕДИНЕНИЙ ==========
io.on('connection', (socket) => {
    console.log('>>> Подключено новое устройство:', socket.id);

    // 1. РЕГИСТРАЦИЯ (Исправляет проблему доставки сообщений)
    socket.on('call:register', (data) => {
        const { userId, username } = data;
        if (!userId || !username) return;

        // Если этот пользователь уже был в сети с другого сокета, обновляем его
        const oldSocketId = userSockets.get(userId);
        if (oldSocketId && oldSocketId !== socket.id) {
            io.to(oldSocketId).emit('system:multiple_locations'); 
        }

        users.set(socket.id, { userId, username, online: true });
        userSockets.set(userId, socket.id);

        console.log(`User Registered: ${username} [ID: ${userId}]`);
        
        // Рассылаем всем обновленный список пользователей
        broadcastUserList();
    });

    // 2. ТЕКСТОВЫЕ СООБЩЕНИЯ (Исправление доставки)
    socket.on('chat:message', (data) => {
        const { to, text, fromName } = data;
        const targetSocketId = userSockets.get(to);
        const senderData = users.get(socket.id);

        if (targetSocketId && senderData) {
            // Отправляем конкретному человеку
            io.to(targetSocketId).emit('chat:message', {
                fromId: senderData.userId,
                fromName: fromName || senderData.username,
                text: text,
                timestamp: Date.now()
            });
            console.log(`Message: from ${senderData.username} to ${to}`);
        } else {
            console.log(`User ${to} is offline. Message not delivered.`);
            socket.emit('chat:error', { message: 'Пользователь не в сети' });
        }
    });

    // 3. ЗВОНКИ: ЗАПРОС (Initial Request)
    socket.on('call:request', (data) => {
        const { to, from, fromName } = data;
        const targetSocketId = userSockets.get(to);

        if (targetSocketId) {
            io.to(targetSocketId).emit('call:request', {
                from: from,
                fromName: fromName
            });
            console.log(`Call Request: from ${fromName} to ${to}`);
        }
    });

    // 4. ЗВОНКИ: ПРИНЯТИЕ (Accept)
    socket.on('call:accept', (data) => {
        const { to } = data;
        const targetSocketId = userSockets.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:accepted', { by: users.get(socket.id)?.userId });
        }
    });

    // 5. WebRTC СИГНАЛИНГ (Offer / Answer / ICE)
    // Эти события исправляют "бесконечное соединение" путем точной адресации
    
    socket.on('call:offer', (data) => {
        const targetSocketId = userSockets.get(data.to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:offer', {
                offer: data.offer,
                from: users.get(socket.id)?.userId
            });
        }
    });

    socket.on('call:answer', (data) => {
        const targetSocketId = userSockets.get(data.to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:answer', {
                answer: data.answer,
                from: users.get(socket.id)?.userId
            });
        }
    });

    socket.on('call:ice-candidate', (data) => {
        const targetSocketId = userSockets.get(data.to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:ice-candidate', {
                candidate: data.candidate,
                from: users.get(socket.id)?.userId
            });
        }
    });

    // 6. ЗАВЕРШЕНИЕ ЗВОНКА
    socket.on('call:end', (data) => {
        const targetSocketId = userSockets.get(data.to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:ended');
        }
    });

    // 7. ЗАПРОС СПИСКА ПОЛЬЗОВАТЕЛЕЙ
    socket.on('get-users', () => {
        broadcastUserList();
    });

    // 8. ОБРАБОТКА ВЫХОДА
    socket.on('disconnect', () => {
        const userData = users.get(socket.id);
        if (userData) {
            console.log(`<<< User Disconnected: ${userData.username}`);
            userSockets.delete(userData.userId);
            users.delete(socket.id);
            broadcastUserList();
        }
    });
});

// ФУНКЦИЯ РАССЫЛКИ СПИСКА ОНЛАЙН-ЮЗЕРОВ
function broadcastUserList() {
    const list = Array.from(users.values()).map(u => ({
        userId: u.userId,
        username: u.username
    }));
    // Убираем дубликаты по userId, если они возникли
    const uniqueList = Array.from(new Map(list.map(item => [item.userId, item])).values());
    io.emit('user-list', uniqueList);
}

// ========== ЗАПУСК СЕРВЕРА ==========
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
    ===========================================
    CRAHEAPP SERVER IS RUNNING
    Port: ${PORT}
    Status: Operational
    WebRTC Signaling: Enabled
    ===========================================
    `);
});
