const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);
    socket.broadcast.emit('user-connected', socket.id);

    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado:', socket.id);
        socket.broadcast.emit('user-disconnected', socket.id);
    });

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', {
            from: data.from,
            signal: data.signal
        });
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});