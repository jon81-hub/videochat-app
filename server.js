const express = require('express');
const http = require('https');
const socketIo = require('socket.io');
const path = require('path');
const app = express();

app.use(express.static('public'));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Eventos de WebSocket
io.on('connection', socket => {
  console.log(`Usuario conectado: ${socket.id}`);

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/room.html'));
});

