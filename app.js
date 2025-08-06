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
const peers = {}; // Almacenar las conexiones de los otros usuarios
let myPeerId;

// 1. Conectarse a la cámara y el micrófono
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        myStream = stream;
        addVideoStream(teacherVideo, stream, 'profesor'); // Mostrar mi video

        // Escuchar cuando otros usuarios se conectan
        socket.on('user-connected', userId => {
            console.log('Nuevo usuario conectado:', userId);
            connectToNewUser(userId, stream);
        });
    })
    .catch(error => {
        console.error('Error al acceder a la cámara y el micrófono:', error);
        alert('Por favor, concede los permisos de cámara y micrófono para iniciar la videollamada.');
    });

// 2. Lógica para manejar nuevos usuarios
function connectToNewUser(userId, stream) {
    // Aquí se crearía una nueva conexión de WebRTC
    // En este ejemplo, solo añadiremos un video de un "usuario simulado" para la demostración
    const studentVideo = document.createElement('video');
    studentVideo.muted = true;
    studentVideo.srcObject = myStream; // En un caso real, sería el stream del otro usuario
    addVideoStream(studentVideo, myStream, 'estudiante');
}

// 3. Añadir el stream de video a la interfaz
function addVideoStream(video, stream, role) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    if (role === 'profesor') {
        // El video del profesor se muestra en el contenedor principal
        teacherVideo.srcObject = stream;
    } else {
        // Los videos de los alumnos se añaden a la cuadrícula lateral
        const videoContainer = document.createElement('div');
        videoContainer.classList.add('student-video-container');
        videoContainer.append(video);
        studentsGrid.append(videoContainer);
    }
}

// 4. Lógica de los botones
let micEnabled = true;
micBtn.addEventListener('click', () => {
    myStream.getAudioTracks()[0].enabled = !myStream.getAudioTracks()[0].enabled;
    micEnabled = !micEnabled;
    micBtn.textContent = micEnabled ? 'Micrófono' : 'Silenciar';
});

let camEnabled = true;
camBtn.addEventListener('click', () => {
    myStream.getVideoTracks()[0].enabled = !myStream.getVideoTracks()[0].enabled;
    camEnabled = !camEnabled;
    camBtn.textContent = camEnabled ? 'Cámara' : 'Apagar';
});

leaveBtn.addEventListener('click', () => {
    // Lógica para salir de la clase y redirigir al portal
    alert('Has salido de la clase.');
    window.location.href = 'https://tu-portal-de-academia.com'; // Reemplazar con la URL de tu portal
});

shareScreenBtn.addEventListener('click', () => {
    // Lógica para compartir pantalla
    alert('Compartir pantalla no está implementado en este ejemplo.');
});

recordBtn.addEventListener('click', () => {
    // Lógica para grabar la clase
    alert('La grabación de la clase no está implementada en este ejemplo.');
});

// 5. Lógica de los roles
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userRole = urlParams.get('role');

    if (userRole === 'profesor') {
        leaveBtn.textContent = 'Cerrar Clase';
    }
});