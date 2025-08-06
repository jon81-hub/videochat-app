// Obtener los elementos de la interfaz de usuario
const videoContainer = document.getElementById('main-video-container');
const localVideo = document.getElementById('teacherVideo');
const studentsGrid = document.getElementById('studentsGrid');
const micBtn = document.getElementById('micBtn');
const camBtn = document.getElementById('camBtn');
const leaveBtn = document.getElementById('leaveBtn');

// Conectar con el servidor de Socket.IO
const socket = io();

// Variables para el control de la cámara y el micrófono
let myStream;
let micEnabled = true;
let camEnabled = true;

// 1. Obtener acceso a la cámara y el micrófono
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        myStream = stream;
        localVideo.srcObject = myStream;
    })
    .catch(error => {
        console.error('Error al acceder a la cámara y el micrófono:', error);
        alert('Por favor, concede los permisos de cámara y micrófono.');
    });

// 2. Lógica de los botones de la barra de herramientas
micBtn.addEventListener('click', () => {
    myStream.getAudioTracks()[0].enabled = !myStream.getAudioTracks()[0].enabled;
    micEnabled = !micEnabled;
    micBtn.textContent = micEnabled ? 'Micrófono' : 'Silenciar';
});

camBtn.addEventListener('click', () => {
    myStream.getVideoTracks()[0].enabled = !myStream.getVideoTracks()[0].enabled;
    camEnabled = !camEnabled;
    camBtn.textContent = camEnabled ? 'Cámara' : 'Apagar';
});

leaveBtn.addEventListener('click', () => {
    window.location.href = 'https://tu-portal-de-academia.com'; // Reemplazar con la URL de tu portal
});

// 3. Lógica para manejar roles de usuario (profesor/estudiante)
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userRole = urlParams.get('role');

    if (userRole === 'profesor') {
        leaveBtn.textContent = 'Cerrar Clase';
    }
});