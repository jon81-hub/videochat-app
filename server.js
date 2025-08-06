// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Servir los archivos estáticos de la carpeta 'public' (HTML, CSS y JS)
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    // Cuando un nuevo usuario se conecta, envía su ID a los demás
    socket.broadcast.emit('user-connected', socket.id);

    // Cuando un usuario se desconecta
    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado:', socket.id);
        socket.broadcast.emit('user-disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});