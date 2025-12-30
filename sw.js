// Service Worker para EZEN - PWA Offline-First
const CACHE_NAME = 'ezen-v1';
const RUNTIME_CACHE = 'ezen-runtime';

// Recursos para cache na instalação
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching precache assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Remover caches antigos
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de fetch: Network First com fallback para Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições do Supabase (sempre buscar da rede)
  if (url.origin.includes('supabase.co')) {
    return;
  }

  // Ignorar requisições chrome-extension
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Se a resposta for válida, armazenar no cache runtime
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar, tentar buscar do cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Se for navegação, retornar index.html do cache
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }

          // Resposta offline genérica
          return new Response('Offline - Conteúdo não disponível', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Sincronização em background (quando voltar online)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Aqui você pode adicionar lógica adicional de sincronização
      Promise.resolve()
    );
  }
});

// Notificações push (futuro)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível',
    icon: '/favicon.svg',
    badge: '/favicon.svg'
  };

  event.waitUntil(
    self.registration.showNotification('EZEN Financeiro', options)
  );
});
