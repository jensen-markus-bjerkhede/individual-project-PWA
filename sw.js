const projectName = 'INDIVIDUAL-PROJECT-PWA';

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(projectName).then(function(cache) {
            return cache.addAll([
                '/css/Photo.css',
                '/css/style.css',
                '/script/photoAlbum.js',
                '/script/photoUtils.js',
                '/img/kitten.jpg',
                '/img/kittens.jpg',
            ]);
        }),
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open(projectName).then(function(cache) {
            return cache.match(event.request).then(function(response) {
                return (
                    response ||
                    fetch(event.request).then(function(response) {
                        cache.put(event.request, response.clone());
                        return response;
                    })
                );
            });
        }),
    );
});