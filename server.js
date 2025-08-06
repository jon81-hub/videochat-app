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

    // Cuando un nuevo usuario se conecta, envía su ID a los demás
    socket.broadcast.emit('user-connected', socket.id);

    // Cuando un usuario se desconecta
    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado:', socket.id);
        socket.broadcast.emit('user-disconnected', socket.id);
    });

    // Manejar el envío de la señal de video y audio
    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', {
            from: data.from,
            signal: data.signal
        });
    });

    // Manejar cuando un usuario comparte su pantalla
    socket.on('screen-share', (data) => {
        socket.broadcast.emit('screen-share', data);
    });

    // Manejar la grabación de la clase
    socket.on('start-recording', () => {
        socket.broadcast.emit('start-recording');
    });

    socket.on('stop-recording', () => {
        socket.broadcast.emit('stop-recording');
    });

    // Silenciar o activar micrófono
    socket.on('toggle-mic', (data) => {
        socket.broadcast.emit('toggle-mic', data);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});