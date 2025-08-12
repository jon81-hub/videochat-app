// Obtener elementos de la interfaz de usuario
const teacherVideo = document.getElementById('teacherVideo');
const studentsGrid = document.getElementById('studentsGrid');
const micBtn = document.getElementById('micBtn');
const camBtn = document.getElementById('camBtn');
const leaveBtn = document.getElementById('leaveBtn');
const recordBtn = document.getElementById('recordBtn');

// Variables para la videollamada y conexiones
let myStream;
let myPeerConnection;
const peerConnections = {};
const socket = io('https://myroomvirtual.com'); 
const urlParams = new URLSearchParams(window.location.search);
const userRole = urlParams.get('role');

// Variables para el control de la interfaz
let micEnabled = true;
let camEnabled = true;
let isRecording = false;
let mediaRecorder;
const recordedChunks = [];

// 1. Conectarse a la cámara y el micrófono
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        myStream = stream;
        teacherVideo.srcObject = myStream;
        teacherVideo.onloadedmetadata = () => teacherVideo.play();
        socket.emit('join-class', userRole);
        setupMediaControls();
    })
    .catch(error => {
        console.error('Error al acceder a la cámara y el micrófono:', error);
        alert('Por favor, concede los permisos de cámara y micrófono.');
    });

// 2. Lógica del socket
socket.on('user-connected', (userId) => {
    console.log('Usuario conectado:', userId);
    createPeerConnection(userId);
});

socket.on('user-disconnected', (userId) => {
    console.log('Usuario desconectado:', userId);
    if (peerConnections[userId]) {
        peerConnections[userId].close();
        delete peerConnections[userId];
    }
    removeStudentVideo(userId);
});

socket.on('offer', (userId, sdp) => {
    console.log('Recibiendo oferta de:', userId);
    const peerConnection = createPeerConnection(userId);
    peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
        .then(() => peerConnection.createAnswer())
        .then(answer => peerConnection.setLocalDescription(answer))
        .then(() => {
            socket.emit('answer', userId, peerConnection.localDescription);
        });
});

socket.on('answer', (userId, sdp) => {
    console.log('Recibiendo respuesta de:', userId);
    peerConnections[userId].setRemoteDescription(new RTCSessionDescription(sdp));
});

socket.on('ice-candidate', (userId, candidate) => {
    if (candidate) {
        peerConnections[userId].addIceCandidate(new RTCIceCandidate(candidate));
    }
});

// 3. Funciones de WebRTC
function createPeerConnection(userId) {
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
        ],
    });

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('ice-candidate', userId, event.candidate);
        }
    };

    peerConnection.ontrack = event => {
        const studentVideo = document.createElement('video');
        studentVideo.setAttribute('id', `video-${userId}`);
        studentVideo.srcObject = event.streams[0];
        studentVideo.autoplay = true;
        studentsGrid.appendChild(studentVideo);
    };

    myStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, myStream);
    });

    if (myStream.getTracks().length > 0) {
        peerConnection.createOffer()
            .then(offer => peerConnection.setLocalDescription(offer))
            .then(() => {
                socket.emit('offer', userId, peerConnection.localDescription);
            });
    }

    peerConnections[userId] = peerConnection;
    return peerConnection;
}

function removeStudentVideo(userId) {
    const videoElement = document.getElementById(`video-${userId}`);
    if (videoElement) {
        videoElement.remove();
    }
}

// 4. Lógica de los botones de control
function setupMediaControls() {
    micBtn.disabled = false;
    camBtn.disabled = false;
    recordBtn.disabled = userRole !== 'profesor';

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
        socket.disconnect();
        // Redireccionar al usuario a su portal de aprendizaje
        if (userRole === 'profesor') {
            window.location.href = 'https://tu-portal-de-aprendizaje.com';
        } else {
            window.location.href = 'https://el-campus-del-alumno.com';
        }
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
}

// 5. Funciones de grabación
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
    } else {
        alert('No se puede iniciar la grabación. La cámara no está activa.');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}