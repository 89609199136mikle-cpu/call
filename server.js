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

// ========== Хранилища ==========
const users = new Map();          // socketId -> { username, userId }
const userSockets = new Map();    // userId -> socketId
const groups = new Map();         // groupId -> { hostId, name, participants: Set, waiting: Set, chatHistory: [] }

// ========== API ==========
app.post('/api/register', (req, res) => {
    const { username, userId } = req.body;
    if (!username || !userId) {
        return res.status(400).json({ error: 'Username and userId required' });
    }
    res.json({ success: true, message: 'Registered successfully' });
});

app.get('/api/users', (req, res) => {
    const list = Array.from(userSockets.entries()).map(([uid, sid]) => ({
        userId: uid,
        username: users.get(sid)?.username || 'Unknown',
        online: true
    }));
    res.json(list);
});

// ========== Socket.IO ==========
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // ========== Регистрация ==========
    socket.on('register', ({ username, userId }) => {
        users.set(socket.id, { username, userId });
        userSockets.set(userId, socket.id);
        socket.userId = userId;
        socket.username = username;
        broadcastUserList();
        console.log(`User registered: ${username} (${userId})`);
    });

    // ========== Личные звонки ==========
    socket.on('call:start', ({ targetId, callType }) => {
        const targetSocket = userSockets.get(targetId);
        if (!targetSocket || !io.sockets.sockets.get(targetSocket)) {
            socket.emit('call:error', { message: 'User offline' });
            return;
        }
        io.to(targetSocket).emit('incoming-call', {
            from: socket.userId,
            fromName: socket.username,
            callType: callType || 'video'
        });
    });

    socket.on('call:accept', ({ fromId }) => {
        const callerSocket = userSockets.get(fromId);
        if (callerSocket) {
            io.to(callerSocket).emit('call:accepted', { targetId: socket.userId, targetName: socket.username });
        }
    });

    socket.on('call:reject', ({ fromId }) => {
        const callerSocket = userSockets.get(fromId);
        if (callerSocket) {
            io.to(callerSocket).emit('call:rejected');
        }
    });

    socket.on('call:end', ({ targetId }) => {
        const targetSocket = userSockets.get(targetId);
        if (targetSocket) {
            io.to(targetSocket).emit('call:ended');
        }
    });

    socket.on('call:signal', ({ targetId, offer, answer, candidate }) => {
        const targetSocket = userSockets.get(targetId);
        if (!targetSocket) return;
        if (offer) {
            io.to(targetSocket).emit('offer', { from: socket.userId, offer });
        } else if (answer) {
            io.to(targetSocket).emit('answer', { from: socket.userId, answer });
        } else if (candidate) {
            io.to(targetSocket).emit('ice-candidate', { from: socket.userId, candidate });
        }
    });

    socket.on('call:mute', ({ targetId, muted }) => {
        const targetSocket = userSockets.get(targetId);
        if (targetSocket) {
            io.to(targetSocket).emit('call:mute', { from: socket.userId, muted });
        }
    });

    socket.on('call:video', ({ targetId, enabled }) => {
        const targetSocket = userSockets.get(targetId);
        if (targetSocket) {
            io.to(targetSocket).emit('call:video', { from: socket.userId, enabled });
        }
    });

    // ========== Групповые звонки ==========
    socket.on('create-group', ({ groupName }) => {
        const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        groups.set(groupId, {
            hostId: socket.userId,
            name: groupName,
            participants: new Set([socket.userId]),
            waiting: new Set(),
            chatHistory: []
        });
        socket.join(groupId);
        socket.emit('group-created', { groupId, groupName });
        broadcastGroups();
    });

    socket.on('get-groups', () => {
        const list = Array.from(groups.entries()).map(([gid, g]) => ({
            groupId: gid,
            name: g.name,
            hostId: g.hostId,
            participants: g.participants.size
        }));
        socket.emit('group-list', list);
    });

    socket.on('join-group-request', ({ groupId }) => {
        const group = groups.get(groupId);
        if (!group) return;
        if (group.hostId === socket.userId) {
            group.participants.add(socket.userId);
            socket.join(groupId);
            socket.emit('admitted-to-group', { groupId, groupName: group.name });
            io.to(groupId).emit('group-participants-update', {
                participants: Array.from(group.participants).map(uid => ({ userId: uid, username: users.get(userSockets.get(uid))?.username }))
            });
        } else {
            group.waiting.add(socket.userId);
            io.to(userSockets.get(group.hostId)).emit('waiting-list-update', {
                groupId,
                waiting: Array.from(group.waiting).map(uid => ({ userId: uid, username: users.get(userSockets.get(uid))?.username }))
            });
            socket.emit('waiting-room', { groupId, groupName: group.name });
        }
    });

    socket.on('admit-user', ({ groupId, userId }) => {
        const group = groups.get(groupId);
        if (!group || group.hostId !== socket.userId) return;
        if (group.waiting.has(userId)) {
            group.waiting.delete(userId);
            group.participants.add(userId);
            const targetSocket = userSockets.get(userId);
            if (targetSocket) {
                io.to(targetSocket).emit('admitted-to-group', { groupId, groupName: group.name });
                io.sockets.sockets.get(targetSocket)?.join(groupId);
            }
            io.to(groupId).emit('group-participants-update', {
                participants: Array.from(group.participants).map(uid => ({ userId: uid, username: users.get(userSockets.get(uid))?.username }))
            });
            io.to(userSockets.get(group.hostId)).emit('waiting-list-update', {
                groupId,
                waiting: Array.from(group.waiting).map(uid => ({ userId: uid, username: users.get(userSockets.get(uid))?.username }))
            });
        }
    });

    socket.on('reject-user', ({ groupId, userId }) => {
        const group = groups.get(groupId);
        if (!group || group.hostId !== socket.userId) return;
        if (group.waiting.has(userId)) {
            group.waiting.delete(userId);
            const targetSocket = userSockets.get(userId);
            if (targetSocket) io.to(targetSocket).emit('rejected-from-group', { groupId });
            io.to(userSockets.get(group.hostId)).emit('waiting-list-update', {
                groupId,
                waiting: Array.from(group.waiting).map(uid => ({ userId: uid, username: users.get(userSockets.get(uid))?.username }))
            });
        }
    });

    socket.on('leave-group', ({ groupId }) => {
        const group = groups.get(groupId);
        if (group) {
            group.participants.delete(socket.userId);
            group.waiting.delete(socket.userId);
            socket.leave(groupId);
            io.to(groupId).emit('group-participants-update', {
                participants: Array.from(group.participants).map(uid => ({ userId: uid, username: users.get(userSockets.get(uid))?.username }))
            });
            if (group.participants.size === 0 && group.waiting.size === 0) {
                groups.delete(groupId);
            } else if (group.hostId === socket.userId && group.participants.size > 0) {
                const newHost = Array.from(group.participants)[0];
                group.hostId = newHost;
                io.to(groupId).emit('new-host', { newHost });
            }
            broadcastGroups();
        }
    });

    socket.on('group-offer', ({ groupId, targetId, offer }) => {
        const targetSocket = userSockets.get(targetId);
        if (targetSocket) {
            io.to(targetSocket).emit('group-offer', { from: socket.userId, offer, groupId });
        }
    });

    socket.on('group-answer', ({ groupId, targetId, answer }) => {
        const targetSocket = userSockets.get(targetId);
        if (targetSocket) {
            io.to(targetSocket).emit('group-answer', { from: socket.userId, answer, groupId });
        }
    });

    socket.on('group-ice', ({ groupId, targetId, candidate }) => {
        const targetSocket = userSockets.get(targetId);
        if (targetSocket) {
            io.to(targetSocket).emit('group-ice', { from: socket.userId, candidate, groupId });
        }
    });

    socket.on('group-chat-message', ({ groupId, message }) => {
        const group = groups.get(groupId);
        if (group) {
            group.chatHistory.push({ from: socket.userId, username: socket.username, message, time: Date.now() });
            io.to(groupId).emit('group-chat-message', { from: socket.userId, username: socket.username, message });
        }
    });

    socket.on('raise-hand', ({ groupId }) => {
        const group = groups.get(groupId);
        if (group && group.hostId !== socket.userId) {
            io.to(userSockets.get(group.hostId)).emit('hand-raised', { userId: socket.userId, username: socket.username, groupId });
        }
    });

    socket.on('screen-share-offer', ({ groupId, targetId, offer }) => {
        const targetSocket = userSockets.get(targetId);
        if (targetSocket) {
            io.to(targetSocket).emit('screen-share-offer', { from: socket.userId, offer, groupId });
        }
    });

    socket.on('screen-share-answer', ({ groupId, targetId, answer }) => {
        const targetSocket = userSockets.get(targetId);
        if (targetSocket) {
            io.to(targetSocket).emit('screen-share-answer', { from: socket.userId, answer, groupId });
        }
    });

    // ========== Отключение ==========
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            userSockets.delete(user.userId);
            users.delete(socket.id);
            broadcastUserList();
            for (let [groupId, group] of groups.entries()) {
                if (group.participants.has(user.userId) || group.waiting.has(user.userId)) {
                    group.participants.delete(user.userId);
                    group.waiting.delete(user.userId);
                    io.to(groupId).emit('group-participants-update', {
                        participants: Array.from(group.participants).map(uid => ({ userId: uid, username: users.get(userSockets.get(uid))?.username }))
                    });
                    if (group.participants.size === 0 && group.waiting.size === 0) {
                        groups.delete(groupId);
                    } else if (group.hostId === user.userId && group.participants.size > 0) {
                        const newHost = Array.from(group.participants)[0];
                        group.hostId = newHost;
                        io.to(groupId).emit('new-host', { newHost });
                    }
                }
            }
            broadcastGroups();
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

function broadcastGroups() {
    const list = Array.from(groups.entries()).map(([gid, g]) => ({
        groupId: gid,
        name: g.name,
        hostId: g.hostId,
        participants: g.participants.size
    }));
    io.emit('group-list', list);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Craheapp server running on port ${PORT}`);
});
