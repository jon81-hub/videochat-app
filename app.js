// Obtener los elementos de la interfaz de usuario
const teacherVideo = document.getElementById('teacherVideo');
const studentsGrid = document.getElementById('studentsGrid');
const micBtn = document.getElementById('micBtn');
const camBtn = document.getElementById('camBtn');
const leaveBtn = document.getElementById('leaveBtn');
const shareScreenBtn = document.getElementById('shareScreenBtn');
const recordBtn = document.getElementById('recordBtn');
const virtualBgBtn = document.getElementById('virtualBgBtn');

// Variables para la videollamada
let myStream = null;
let micEnabled = true;
let camEnabled = true;

// Variables para la grabación
let mediaRecorder;
const recordedChunks = [];
let isRecording = false;

// Variables para el fondo virtual
let model;
let isVirtualBgActive = false;
let videoElement = document.createElement('video');
let canvasContext = teacherVideo.getContext('2d');
videoElement.autoplay = true;
videoElement.muted = true; // Importante para evitar eco
videoElement.playsInline = true;

// 1. Conectarse a la cámara y el micrófono
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        myStream = stream;
        videoElement.srcObject = myStream;

        // Cargar el modelo de TensorFlow
        bodyPix.load().then(loadedModel => {
            model = loadedModel;
            // Esperamos a que el video se cargue y tenga sus dimensiones
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                teacherVideo.width = videoElement.videoWidth;
                teacherVideo.height = videoElement.videoHeight;
                segmentAndRender(); // Inicia el ciclo de renderizado
            };
        });

        // Inicializar botones de control
        micBtn.disabled = false;
        camBtn.disabled = false;
        recordBtn.disabled = false;
        shareScreenBtn.disabled = false;
        virtualBgBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error al acceder a la cámara y el micrófono:', error);
        alert('Por favor, concede los permisos de cámara y micrófono.');
    });

// 2. Lógica de los botones
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

recordBtn.addEventListener('click', () => {
    if (!isRecording) {
        startRecording();
        recordBtn.textContent = 'Detener Grabación';
        recordBtn.classList.add('recording');
    } else {
        stopRecording();
        recordBtn.textContent = 'Grabar Clase';
        recordBtn.classList.remove('recording');
    }
    isRecording = !isRecording;
});

virtualBgBtn.addEventListener('click', () => {
    isVirtualBgActive = !isVirtualBgActive;
    virtualBgBtn.textContent = isVirtualBgActive ? 'Fondo Original' : 'Fondo Virtual';
});

// Lógica para compartir pantalla
let screenStream = null;
let isSharingScreen = false;

shareScreenBtn.addEventListener('click', () => {
    if (!isSharingScreen) {
        startScreenShare();
    } else {
        stopScreenShare();
    }
});

function startScreenShare() {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then(stream => {
            screenStream = stream;
            videoElement.srcObject = screenStream;
            isSharingScreen = true;
            shareScreenBtn.textContent = 'Dejar de Compartir';

            screenStream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };
        })
        .catch(error => {
            console.error('Error al compartir pantalla:', error);
            alert('No se pudo iniciar la función de compartir pantalla.');
        });
}

function stopScreenShare() {
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
        isSharingScreen = false;
        shareScreenBtn.textContent = 'Compartir Pantalla';
    }
    if (myStream) {
        videoElement.srcObject = myStream;
    }
}

// 3. Funciones de grabación
function startRecording() {
    if (myStream) {
        mediaRecorder = new MediaRecorder(myStream);
        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'clase-grabada.webm';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            recordedChunks.length = 0;
        };
        mediaRecorder.start();
        console.log('Grabación iniciada.');
    } else {
        alert('No se puede iniciar la grabación. La cámara no está activa.');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        console.log('Grabación detenida. Descargando archivo...');
    }
}

// 4. Lógica para el fondo virtual
function segmentAndRender() {
    requestAnimationFrame(segmentAndRender);

    if (model && videoElement.readyState >= 2) {
        if (isVirtualBgActive) {
            model.segmentPerson(videoElement, {
                internalResolution: 'medium',
                segmentationThreshold: 0.7,
                flipHorizontal: false,
            }).then(segmentation => {
                const background = new Image();
                background.src = 'llabckgd.png';

                const foregroundColor = {r: 255, g: 255, b: 255, a: 255};
                const backgroundColor = {r: 0, g: 0, b: 0, a: 0};
                const backgroundDarkening = 0.7;

                bodyPix.drawMask(
                    teacherVideo, videoElement, segmentation, 
                    0.7, 0, false);
            });
        } else {
            // Si el fondo virtual está desactivado, simplemente dibuja el video
            canvasContext.drawImage(videoElement, 0, 0, teacherVideo.width, teacherVideo.height);
        }
    }
}

// 5. Lógica para manejar roles al cargar la página
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userRole = urlParams.get('role');

    if (userRole === 'profesor') {
        leaveBtn.textContent = 'Cerrar Clase';
    }

    // Deshabilitar botones por defecto hasta que se cargue la cámara
    micBtn.disabled = true;
    camBtn.disabled = true;
    recordBtn.disabled = true;
    shareScreenBtn.disabled = true;
    virtualBgBtn.disabled = true;
};