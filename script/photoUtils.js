if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => {
            console.log('Service worker registered.');
        })
}
let facing
let stream;
let longitude;
let latitude;
let address;

window.addEventListener('load', () => {
    if ('mediaDevices' in navigator) {
        cameraSettings();
        startCamera();
        loadGeoLocation();
    }
})

async function loadGeoLocation() {
    return new Promise(async function(resolve, reject) {
        await getGeoPosition().then(function(geoResponse) {
            latitude = geoResponse.coords.latitude;
            longitude = geoResponse.coords.longitude;
            address = fetchLocation(latitude, longitude);
            resolve();
        }, function(e) {
            reject(e);
        });
    });
}

async function startCamera() {
    try {
        const md = navigator.mediaDevices;
        stream = await md.getUserMedia({
            video: { width: 320, height: 320, facingMode: facing }
        })

        const video = document.querySelector('.video > video');
        video.srcObject = stream;
    } catch (e) {
        messageError.innerHTML = 'Could not show camera';
    }
}

async function cameraSettings() {
    const switchViewButton = document.querySelector('.buttonRow .switchViewButton');
    const photoButton = document.querySelector('.flex-wrap .buttonTag button');

    facing = 'environment'

    switchViewButton.addEventListener('click', () => {
        if (facing === 'environment') {
            facing = 'user';
            startCamera()
        } else {
            facing = 'environment';
            startCamera()

        }
    })

    photoButton.addEventListener('click', async() => {
        if (!stream) {
            return;
        }
        let tracks = stream.getTracks();
        let videoTrack = tracks[0];
        let capture = new ImageCapture(videoTrack);
        let blob = await capture.takePhoto();
        let img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.src = URL.createObjectURL(blob);
        img.onload = async function() {
            let base64String;
            await imgToBase64(img).then(async function(base64Response) {
                base64String = base64Response;
                if (!latitude || !longitude || !address) {
                    await loadGeoLocation().then(async function(base64Response) {
                        console.log('Saving photo with location...');
                        savePhoto(base64Response);
                    }, function(e) {
                        console.log('Saving photo without location: ', e.message)
                        savePhoto(base64Response);
                    });
                } else {
                    console.log('Saving photo with location...');
                    savePhoto(base64Response);
                }
            }, function(e) {
                console.error("Failed!", e);
            });
        };
    })
}

function savePhoto(base64String) {
    let picList = localStorage.getItem('pictureList');
    if (!picList) {
        picList = [];
    } else {
        picList = JSON.parse(picList);
    }
    picList.push(createPhotoObject(base64String, latitude, longitude, address));
    localStorage.setItem('pictureList', JSON.stringify(picList));
}

function createPhotoObject(base64String, geoLat, geoLong, address) {
    return {
        base64String: base64String,
        geoLat: geoLat,
        geoLong: geoLong,
        address: address,
        timeStamp: Date.now()
    }
}

function imgToBase64(img) {
    return new Promise(function(resolve, reject) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            let baseString = canvas.toDataURL();
            resolve(baseString);
        } catch (e) {
            reject('Something went wrong decoding img: ', e);
        }
    });
}

function getGeoPosition() {
    return new Promise(function(resolve, reject) {
        if ('geolocation' in navigator) {
            const geo = navigator.geolocation;
            geo.getCurrentPosition(
                pos => {
                    resolve(pos);
                },
                error => {
                    reject('Could not get position: ', error);
                }
            )
        }
    });
}

async function fetchLocation(lat, lng) {
    try {
        // This API will fail if others are using it at the same time
        const response = await fetch(`https://geocode.xyz/${lat},${lng}?json=1`);
        const data = await response.json();
        if (data.error) {
            console.log('Could not fetch location at given time, please try again');
        } else {
            address = `${data.country}, ${data.city}`;
        }

    } catch (e) {
        console.error('Error fetching location', e.message);
    }
}