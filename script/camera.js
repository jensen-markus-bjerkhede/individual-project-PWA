if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => {
            console.log('Service worker registered.');
        })
}

// async function allowCamera() {
//     if( 'mediaDevices' in navigator ) {
//         const md = navigator.mediaDevices;
//         let stream = await md.getUserMedia({
//             audio: false,
//             video: true
//         });
//     }
// }
//allowCamera();


window.addEventListener('load', () => {
    if ('mediaDevices' in navigator) {
        cameraSettings();
        startCamera();
    }
})

async function startCamera() {
    console.log('startCamera')
        // errorMessage.innerHTML = '';
    try {
        let facing = 'environment';
        const md = navigator.mediaDevices;
        stream = await md.getUserMedia({
            video: { width: 320, height: 320, facingMode: facing }
        })

        const video = document.querySelector('.video > video');
        console.log('stream: ' + stream)
        video.srcObject = stream;
        photoButton.disabled = false;

    } catch (e) {
        console.log(e)
            // Visa felmeddelande för användaren:
            // errorMessage.innerHTML = 'Could not show camera window.';
    }
}

async function cameraSettings() {
    // const errorMessage = document.querySelector('.video > .error');
    const switchViewButton = document.querySelector('.switchView .switchViewButton');
    const photoButton = document.querySelector('.flex-wrap .buttonTag button');
    // const downloadLink = document.querySelector('.video .downloadLink');
    // .profile > p > button  --> 012, omständigt men mer specifikt
    // .profile       button  --> 011, enklare

    let stream;
    let facing = 'environment';
    // User clicks "Show camera window"

    switchViewButton.addEventListener('click', () => {
        if (facing == 'environment') {
            facing = 'user';
            switchViewButton.innerHTML = 'Show user';
        } else {
            facing = 'environment';
            switchViewButton.innerHTML = 'Show environment';
        }
        stopButton.click();
        showVideoButton.click();
    })

    photoButton.addEventListener('click', async() => {
        // errorMessage.innerHTML = '';
        if (!stream) {
            // errorMessage.innerHTML = 'No video to take photo from.';
            return;
        }

        let tracks = stream.getTracks();
        let videoTrack = tracks[0];
        let capture = new ImageCapture(videoTrack);
        let blob = await capture.takePhoto();

        let imgUrl = URL.createObjectURL(blob);
        profilePic.src = imgUrl;
        profilePic.classList.remove('hidden');
    })
}