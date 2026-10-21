// Register service worker to cache Cloudinary images and static assets locally in CacheStorage
export function registerImageCacheServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Image Cache Service Worker registered:', reg.scope))
        .catch((err) => console.error('Service Worker registration failed:', err));
    });
  }
}
