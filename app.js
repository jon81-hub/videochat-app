// Obtener los elementos de la interfaz de usuario
const teacherVideo = document.getElementById('teacherVideo');
const studentsGrid = document.getElementById('studentsGrid');
const micBtn = document.getElementById('micBtn');
const camBtn = document.getElementById('camBtn');
const leaveBtn = document.getElementById('leaveBtn');
const shareScreenBtn = document.getElementById('shareScreenBtn');
const recordBtn = document.getElementById('recordBtn');

// Conectar con el servidor de Socket.IO
const socket = io();

// Variables para la videollamada
let myStream;
let micEnabled = true;
let camEnabled = true;

// 1. Conectarse a la cámara y el micrófono
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        myStream = stream;
        teacherVideo.srcObject = myStream;

        // Escuchar cuando otros usuarios se conectan (lógica futura)
        socket.on('user-connected', userId => {
            console.log('Nuevo usuario conectado:', userId);
        });
    })
    .catch(error => {
        console.error('Error al acceder a la cámara y el micrófono:', error);
        alert('Por favor, concede los permisos de cámara y micrófono para iniciar la videollamada.');
    });

// 2. Lógica de los botones
micBtn.addEventListener('click', () => {
    if (myStream) {
        myStream.getAudioTracks()[0].enabled = !myStream.getAudioTracks()[0].enabled;
        micEnabled = !micEnabled;
        micBtn.textContent = micEnabled ? 'Micrófono' : 'Silenciar';
    }
});

camBtn.addEventListener('click', () => {
    if (myStream) {
        myStream.getVideoTracks()[0].enabled = !myStream.getVideoTracks()[0].enabled;
        camEnabled = !camEnabled;
        camBtn.textContent = camEnabled ? 'Cámara' : 'Apagar';
    }
});

leaveBtn.addEventListener('click', () => {
    alert('Has salido de la clase.');
    window.location.href = 'https://tu-portal-de-academia.com'; // Reemplazar con la URL de tu portal
});

shareScreenBtn.addEventListener('click', () => {
    alert('Compartir pantalla no está implementado en este ejemplo.');
});

recordBtn.addEventListener('click', () => {
    alert('La grabación de la clase no está implementada en este ejemplo.');
});

// 3. Lógica de los roles
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userRole = urlParams.get('role');

    if (userRole === 'profesor') {
        leaveBtn.textContent = 'Cerrar Clase';
    }
});