let photoAlbum;

window.addEventListener('load', async() => {
    photoAlbum = [];
    pushKittens();
    await updatePhotoAlbum();
    renderPhotoAlbum();
})

function pushKittens() {
    let kitten1 = {
        base64String: "img/kitten.jpg",
        address: "MeowTown",
        timeStamp: 723250800000,
        geoLat: 0,
        geoLong: 0
    };
    let kitten2 = {
        base64String: "img/kittens.jpg",
        address: "KittensTown",
        timeStamp: 723250800000,
        geoLat: 0,
        geoLong: 0
    };
    photoAlbum.push(kitten1, kitten2);
}

async function updatePhotoAlbum() {
    let photoObjects = await JSON.parse(localStorage.getItem('pictureList'));
    photoAlbum = photoAlbum.concat(photoObjects);
}

function renderPhotoAlbum() {
    console.log(photoAlbum)
    let pictureListSection = document.getElementById("pictureList");
    photoAlbum.forEach(img => pictureListSection.appendChild(createSection(img)));
}

function createSection(img) {
    let section = document.createElement("SECTION");
    let imageElement = document.createElement('img');
    imageElement.src = img.base64String;
    section.appendChild(imageElement);
    let span = document.createElement('span');
    let txt = document.createTextNode(`${img.address}`);
    span.appendChild(txt);
    section.appendChild(span);
    return section;

}