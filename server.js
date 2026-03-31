const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Хранилища данных
// socketId -> { userId, username, currentRoom }
const allUsers = new Map();
// userId -> socketId (для быстрого поиска куда слать звонок)
const userToSocket = new Map();

io.on('connection', (socket) => {
    console.log('--- Новое подключение:', socket.id);

    // 1. Регистрация пользователя в системе
    socket.on('call:register', (data) => {
        const { userId, username } = data;
        if (!userId) return;

        allUsers.set(socket.id, { userId, username });
        userToSocket.set(userId, socket.id);

        console.log(`Пользователь ${username} (${userId}) готов к работе`);
        broadcastUserList();
    });

    // 2. Логика начала звонка (Request)
    socket.on('call:request', (data) => {
        const { to, from, fromName } = data;
        const targetSocketId = userToSocket.get(to);

        if (targetSocketId) {
            console.log(`Звонок от ${fromName} к пользователю с ID ${to}`);
            io.to(targetSocketId).emit('call:request', {
                from,
                fromName,
                signal: data.signal // если передаем сразу
            });
        } else {
            socket.emit('call:error', { message: 'Пользователь оффлайн' });
        }
    });

    // 3. Принятие звонка
    socket.on('call:accept', (data) => {
        const targetSocketId = userToSocket.get(data.to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:accepted', { by: allUsers.get(socket.id)?.userId });
        }
    });

    // 4. WebRTC Сигналинг (Offer, Answer, ICE)
    socket.on('call:offer', (data) => {
        const targetSocketId = userToSocket.get(data.to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:offer', {
                offer: data.offer,
                from: allUsers.get(socket.id)?.userId
            });
        }
    });

    socket.on('call:answer', (data) => {
        const targetSocketId = userToSocket.get(data.to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:answer', {
                answer: data.answer,
                from: allUsers.get(socket.id)?.userId
            });
        }
    });

    socket.on('call:ice-candidate', (data) => {
        const targetSocketId = userToSocket.get(data.to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:ice-candidate', {
                candidate: data.candidate,
                from: allUsers.get(socket.id)?.userId
            });
        }
    });

    // 5. Завершение звонка
    socket.on('call:end', (data) => {
        const targetSocketId = userToSocket.get(data.to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:ended');
        }
    });

    // 6. Чат: отправка сообщения
    socket.on('chat:message', (data) => {
        const { to, text, fromName } = data;
        const targetSocketId = userToSocket.get(to);
        
        if (targetSocketId) {
            io.to(targetSocketId).emit('chat:message', {
                text,
                fromId: allUsers.get(socket.id)?.userId,
                fromName: fromName
            });
        }
    });

    // Получение списка всех юзеров (для index.html)
    socket.on('get-users', () => {
        broadcastUserList();
    });

    // Отключение
    socket.on('disconnect', () => {
        const userData = allUsers.get(socket.id);
        if (userData) {
            console.log(`Пользователь ${userData.username} вышел`);
            userToSocket.delete(userData.userId);
            allUsers.delete(socket.id);
            broadcastUserList();
        }
    });
});

// Рассылка списка онлайн пользователей
function broadcastUserList() {
    const users = Array.from(allUsers.values()).map(u => ({
        userId: u.userId,
        username: u.username
    }));
    io.emit('user-list', users);
}

// Запуск на порту Railway или 3000 локально
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
    ======================================
    СЕРВЕР MESSENGER ЗАПУЩЕН
    Порт: ${PORT}
    Режим: Public (Railway Ready)
    ======================================
    `);
});
