const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Хранилище пользователей
const users = new Map();      // socketId -> { username, userId }
const userSockets = new Map(); // userId -> socketId

app.post('/api/register', (req, res) => {
  const { username, userId } = req.body;
  if (!username || !userId) return res.status(400).json({ error: 'Missing fields' });
  res.json({ success: true });
});

app.get('/api/users', (req, res) => {
  const list = Array.from(userSockets.entries()).map(([uid, sid]) => ({
    userId: uid,
    username: users.get(sid)?.username || 'Unknown',
    online: true
  }));
  res.json(list);
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register', ({ username, userId }) => {
    users.set(socket.id, { username, userId });
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    socket.username = username;
    broadcastUserList();
    console.log(`Registered: ${username} (${userId})`);
  });

  socket.on('call-user', ({ targetId, callType }) => {
    const targetSocketId = userSockets.get(targetId);
    if (targetSocketId && io.sockets.sockets.get(targetSocketId)) {
      io.to(targetSocketId).emit('incoming-call', {
        from: socket.userId,
        fromName: socket.username,
        callType
      });
    } else {
      socket.emit('call-error', { message: 'User offline' });
    }
  });

  socket.on('accept-call', ({ fromId }) => {
    const callerSocket = userSockets.get(fromId);
    if (callerSocket) {
      io.to(callerSocket).emit('call-accepted', {
        targetId: socket.userId,
        targetName: socket.username
      });
    }
  });

  socket.on('reject-call', ({ fromId }) => {
    const callerSocket = userSockets.get(fromId);
    if (callerSocket) io.to(callerSocket).emit('call-rejected');
  });

  socket.on('offer', ({ targetId, offer }) => {
    const targetSocket = userSockets.get(targetId);
    if (targetSocket) io.to(targetSocket).emit('offer', { from: socket.userId, offer });
  });

  socket.on('answer', ({ targetId, answer }) => {
    const targetSocket = userSockets.get(targetId);
    if (targetSocket) io.to(targetSocket).emit('answer', { from: socket.userId, answer });
  });

  socket.on('ice-candidate', ({ targetId, candidate }) => {
    const targetSocket = userSockets.get(targetId);
    if (targetSocket) io.to(targetSocket).emit('ice-candidate', { from: socket.userId, candidate });
  });

  socket.on('end-call', ({ targetId }) => {
    const targetSocket = userSockets.get(targetId);
    if (targetSocket) io.to(targetSocket).emit('call-ended');
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      userSockets.delete(user.userId);
      users.delete(socket.id);
      broadcastUserList();
    }
    console.log('Client disconnected:', socket.id);
  });
});

function broadcastUserList() {
  const list = Array.from(userSockets.entries()).map(([uid, sid]) => ({
    userId: uid,
    username: users.get(sid)?.username || 'Unknown',
    online: true
  }));
  io.emit('user-list', list);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
