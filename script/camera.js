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
        geoLocation();
    }
})

async function startCamera() {
    // errorMessage.innerHTML = '';
    try {
        let facing = 'environment';
        const md = navigator.mediaDevices;
        stream = await md.getUserMedia({
            video: { width: 320, height: 320, facingMode: facing }
        })

        const video = document.querySelector('.video > video');
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
        console.log('ive been clicked')
        if (facing === 'environment') {
            facing = 'user';
            // switchViewButton.innerHTML = 'Show user';
        } else {
            facing = 'environment';
            // switchViewButton.innerHTML = 'Show environment';
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
        let base64String = await imgUrlToBase64(URL.createObjectURL(blob));
        savePhoto(base64String);
    })
}

function savePhoto(base64String) {
    let picList = localStorage.getItem('pictureList');
    if (!picList) {
        picList = [];
    } else {
        picList = JSON.parse(picList);
    }
    picList.push(createPhotoObject(base64String, 57.65098309999999, 12.043935));
    localStorage.setItem('pictureList', JSON.stringify(picList));
}

function createPhotoObject(base64String, geoLat, geoLong) {
    return {
        base64String: base64String,
        geoLat: geoLat,
        geoLong: geoLong,
        timeStamp: Date.now()
    }
}

function imgUrlToBase64(imgUrl) {
    return new Promise(resolve => {
        let img = new Image();
        img.src = imgUrl;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            // I think this won't work inside the function from the console
            img.crossOrigin = 'anonymous';
            ctx.drawImage(img, 0, 0);

            let baseString = canvas.toDataURL();
            resolve(baseString);
        };
    });
}


function geoLocation() {
    const button = document.querySelector('#geoButton');
button.addEventListener('click', () => {
    console.log('Geo button');
    const message = document.querySelector('.position');

    if( 'geolocation' in navigator ) {
        const geo = navigator.geolocation;
        // console.log('geolocation:', geo);
        geo.getCurrentPosition(
            pos => {
                // console.log('Got position: ', pos);
                let lat = pos.coords.latitude;
                let lng = pos.coords.longitude;
                message.innerHTML = `You are at ${lat}, ${lng}.`;
                getAddressFromPosition(lat, lng, message)
            },
            error => {
                // console.log('Could not get position: ', error);
                message.innerHTML = 'Please <em>allow</em> position and I will tell you where you are.';
            }
        )

    } else {
        message.innerHTML = 'This device does not have access to the Geolocation API.';
    }
})
}
// Reverse geocoding
async function getAddressFromPosition(lat, lng, message) {
    try {
        // This API will fail if others are using it at the same time
        const response = await fetch(`https://geocode.xyz/${lat},${lng}?json=1`);
        const data = await response.json();

        if( data.error ) {
            message.innerHTML += `<br> Could not get location information at this time. Try again later!`;

        } else {
            // console.log('getAddressFromPosition: data=', data);
            const city = data.city, country = data.country;
            message.innerHTML += `<br> It's in ${city}, ${country}.`;
        }

    } catch (e) {
        // console.log('getAddressFromPosition error: ', error.message);
        message.innerHTML += `<br> Could not find your city.`
    }
}