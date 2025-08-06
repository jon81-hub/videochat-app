// app.js

function iniciarVideollamada() {
    console.log('El botón de iniciar videollamada ha sido presionado.');

    // 1. Pedir acceso a la cámara y el micrófono del usuario (profesor).
    // navigator.mediaDevices.getUserMedia() es la API de WebRTC que nos da acceso a los dispositivos.
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            // Esta parte del código se ejecuta si el usuario da permiso.
            console.log('Permisos de cámara y micrófono concedidos.');
            
            // 2. Encontrar el elemento <video> en el HTML.
            // Es importante que el <video> tenga el ID "teacherVideo".
            const teacherVideo = document.getElementById('teacherVideo');
            
            if (teacherVideo) {
                // 3. Asignar el stream de video y audio al elemento <video>.
                teacherVideo.srcObject = stream;
                console.log('Video del profesor mostrado en la pantalla.');
            } else {
                console.error('Error: No se encontró el elemento <video> con el ID "teacherVideo".');
            }
        })
        .catch(error => {
            // Esta parte se ejecuta si el usuario deniega los permisos.
            console.error('Error al acceder a la cámara y el micrófono:', error);
            alert('Por favor, concede los permisos de cámara y micrófono para iniciar la videollamada.');
        });
}