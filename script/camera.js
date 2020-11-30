if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => {
            console.log('Service worker registered.');
        })
}

let stream;

window.addEventListener('load', () => {
    let list = JSON.parse(localStorage.getItem('pictureList'));
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
        // console.log('stream: ' + stream)
        video.srcObject = stream;
    } catch (e) {
        console.log(e)
            // Visa felmeddelande för användaren:
            // errorMessage.innerHTML = 'Could not show camera window.';
    }
}

async function cameraSettings() {
    // const errorMessage = document.querySelector('.video > .error');
    const switchViewButton = document.querySelector('.buttonRow .switchViewButton');
    const photoButton = document.querySelector('.flex-wrap .buttonTag button');
    // const downloadLink = document.querySelector('.video .downloadLink');
    // .profile > p > button  --> 012, omständigt men mer specifikt
    // .profile       button  --> 011, enklare

    let facing = 'environment';
    // User clicks "Show camera window"

    switchViewButton.addEventListener('click', () => {
        if (facing === 'environment') {
            facing = 'user';
            switchViewButton.innerHTML = 'Show user';
        } else {
            facing = 'environment';
            switchViewButton.innerHTML = 'Show environment';
        }
    })

    photoButton.addEventListener('click', async() => {
        if (!stream) {
            //errorMessage.innerHTML = 'no video to take photo from.';
            return;
        } // errorMessage.innerHTML = '';
        let tracks = stream.getTracks();
        let videoTrack = tracks[0];
        let capture = new ImageCapture(videoTrack);
        let blob = await capture.takePhoto();
        await savePhoto(imgUrlToBase64(URL.createObjectURL(blob)))
    })
}

async function savePhoto(img) {
    let picList = localStorage.getItem('pictureList');
    if (!picList) {
        picList = [];
    } else {
        picList = JSON.parse(picList);
    }

    picList.push(await createPhotoObject(img, 57.65098309999999, 12.043935));
    localStorage.setItem('pictureList', JSON.stringify(picList));
    console.log('img' + img);
}

async function createPhotoObject(base64String, geoLat, geoLong) {
    return {
        base64String: base64String,
        geoLat: geoLat,
        geoLong: geoLong,
        timeStamp: Date.now()
    }
}

function imgUrlToBase64(imgUrl) {
    let htmlImageElement = document.createElement('img');
    htmlImageElement.src = imgUrl;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 420;
    canvas.height = 380;

    // I think this won't work inside the function from the console
    htmlImageElement.crossOrigin = 'anonymous';
    ctx.drawImage(htmlImageElement, 0, 0);

    return canvas.toDataURL();
}