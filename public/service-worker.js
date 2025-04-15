// Estrategia de cacheo para PWA y mejora de rendimiento

const CACHE_NAME = 'gtceuta-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/site.webmanifest',
  // Elimina los recursos que generan warnings si no son críticos para la primera carga
  // '/images/hero-bg.jpg',
  // '/images/CARTEL I GT CEUTA.jpg',
  // '/documents/Bases GT Ceuta.pdf',
  '/assets/index-*.js',
  '/assets/index-*.css',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Estrategia stale-while-revalidate para mejor rendimiento
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Solo cachear respuestas exitosas
          if (networkResponse && networkResponse.status === 200) {
            // Ignorar querystrings para análisis
            if (!event.request.url.includes('analytics') && 
                !event.request.url.includes('gtag')) {
              cache.put(event.request, networkResponse.clone());
            }
          }
          return networkResponse;
        }).catch(err => {
          console.log('Error en fetch', err);
        });
        
        return response || fetchPromise;
      });
    })
  );
});

// Gestionar notificaciones push para recordar eventos
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon-192x192.png',
    badge: '/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data.url;
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(windowClients => {
      // Verificar si ya hay una ventana abierta y enfocarla
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});