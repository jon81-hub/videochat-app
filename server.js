const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', socket => {
    socket.on('join-class', role => {
        socket.broadcast.emit('user-connected', socket.id);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', socket.id);
    });

    socket.on('offer', (targetId, sdp) => {
        socket.to(targetId).emit('offer', socket.id, sdp);
    });

    socket.on('answer', (targetId, sdp) => {
        socket.to(targetId).emit('answer', socket.id, sdp);
    });

    socket.on('ice-candidate', (targetId, candidate) => {
        socket.to(targetId).emit('ice-candidate', socket.id, candidate);
    });
});

module.exports = app;