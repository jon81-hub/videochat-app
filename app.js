// Obtener los elementos de la interfaz de usuario
const teacherVideo = document.getElementById('teacherVideo');
const studentsGrid = document.getElementById('studentsGrid');
const micBtn = document.getElementById('micBtn');
const camBtn = document.getElementById('camBtn');
const leaveBtn = document.getElementById('leaveBtn');
const shareScreenBtn = document.getElementById('shareScreenBtn');
const recordBtn = document.getElementById('recordBtn');

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

// 2. Lógica de los botones
micBtn.addEventListener('click', () => {
    if (myStream) {
        micEnabled = !micEnabled;
        myStream.getAudioTracks()[0].enabled = micEnabled;
        micBtn.textContent = micEnabled ? 'Micrófono' : 'Silenciar';
    }
});

camBtn.addEventListener('click', () => {
    if (myStream) {
        camEnabled = !camEnabled;
        myStream.getVideoTracks()[0].enabled = camEnabled;
        camBtn.textContent = camEnabled ? 'Apagar' : 'Cámara' ;
    }
});

leaveBtn.addEventListener('click', () => {
    if (myStream) {
        myStream.getTracks().forEach(track => track.stop());
    }
    window.location.href = 'https://tu-portal-de-academia.com'; // Reemplaza con la URL de tu portal
});

// 3. Inicializar al cargar la página
window.onload = () => {
    initializeMedia();
    const urlParams = new URLSearchParams(window.location.search);
    const userRole = urlParams.get('role');

    if (userRole === 'profesor') {
        leaveBtn.textContent = 'Cerrar Clase';
    }

    // Deshabilitar botones por defecto hasta que se cargue la cámara
    micBtn.disabled = true;
    camBtn.disabled = true;
};

// ... Aquí iría la lógica de socket.io, WebRTC, etc.