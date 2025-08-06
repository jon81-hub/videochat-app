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

// Sirve los archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta explícita para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', socket => {
    console.log(`Nuevo usuario conectado: ${socket.id}`);

    socket.on('join-class', role => {
        console.log(`Usuario ${socket.id} se unió como ${role}`);
        socket.broadcast.emit('user-connected', socket.id);
    });

    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${socket.id}`);
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});