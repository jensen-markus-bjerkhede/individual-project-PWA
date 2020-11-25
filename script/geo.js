/*
Metoder att vänta till dess att webbläsaren har läst in alla HTML-element till JavaScript DOM:
- länka script-taggen med attributet "defer"
- window.addEventListener('load')
- lägga script-taggen längst ner i body
*/


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
// https://geocode.xyz/51.50354,-0.12768?geoit=xml