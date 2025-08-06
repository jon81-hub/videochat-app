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
let myStream = null;
let micEnabled = true;
let camEnabled = true;

// 1. Conectarse a la cámara y el micrófono
function initializeMedia() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            myStream = stream;
            teacherVideo.srcObject = myStream;
            teacherVideo.onloadedmetadata = () => teacherVideo.play();

            // Deshabilitar los botones hasta que la cámara esté lista
            micBtn.disabled = false;
            camBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error al acceder a la cámara y el micrófono:', error);
            alert('Por favor, concede los permisos de cámara y micrófono.');
        });
}

// 2. Lógica para manejar nuevos usuarios
function connectToNewUser(userId, stream) {
    // Aquí se crearía una nueva conexión de WebRTC
    // En este ejemplo, solo añadiremos un video de un "usuario simulado"
    const studentVideo = document.createElement('video');
    studentVideo.muted = true;
    addVideoStream(studentVideo, stream, 'estudiante');
}

// 3. Añadir el stream de video a la interfaz
function addVideoStream(video, stream, role) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    if (role === 'profesor') {
        teacherVideo.srcObject = stream;
    } else {
        const videoContainer = document.createElement('div');
        videoContainer.classList.add('student-video-container');
        videoContainer.append(video);
        studentsGrid.append(videoContainer);
    }
}

// 4. Lógica de los botones
micBtn.addEventListener('click', () => {
    if (myStream) {
        micEnabled = !micEnabled;
        myStream.getAudioTracks()[0].enabled = micEnabled;
        micBtn.textContent = micEnabled ? 'Silenciar' : 'Activar';
    }
});

camBtn.addEventListener('click', () => {
    if (myStream) {
        camEnabled = !camEnabled;
        myStream.getVideoTracks()[0].enabled = camEnabled;
        camBtn.textContent = camEnabled ? 'Apagar' : 'Encender';
    }
});

leaveBtn.addEventListener('click', () => {
    if (myStream) {
        myStream.getTracks().forEach(track => track.stop());
    }
    window.location.href = 'https://tu-portal-de-academia.com';
});

// Desactivar temporalmente los botones no implementados
shareScreenBtn.disabled = true;
recordBtn.disabled = true;

// 5. Lógica de los roles
window.onload = () => {
    initializeMedia();
    const urlParams = new URLSearchParams(window.location.search);
    const userRole = urlParams.get('role');

    if (userRole === 'profesor') {
        leaveBtn.textContent = 'Cerrar Clase';
    }
};