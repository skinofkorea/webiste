/**
 * Optimizes Cloudinary image URLs by injecting auto-format, auto-quality,
 * and width-limiting transformations. This dramatically reduces image sizes
 * (often 60-80% smaller) and serves modern formats like WebP/AVIF automatically.
 *
 * For returning visitors, the browser cache + Cloudinary CDN cache ensures
 * near-instant loading.
 */

const CLOUDINARY_BASE = 'res.cloudinary.com';

/**
 * Add Cloudinary transformations to an image URL.
 * Automatically injects auto-format (f_auto), auto-quality (q_auto),
 * and width-limiting (w_xxx,c_limit) for maximum loading speed on low internet / mobile devices.
 */
export function optimizeCloudinaryUrl(
  url?: string,
  width?: number,
  quality: string = 'auto:good'
): string {
  if (!url || !url.includes(CLOUDINARY_BASE)) return url || '';

  // Already optimized — skip duplicate injection
  if (url.includes('/f_auto') || url.includes('f_auto,')) return url;

  const transforms: string[] = ['f_auto', `q_${quality}`];
  if (width && width > 0) {
    transforms.push(`w_${width}`, 'c_limit');
  }
  const transformStr = transforms.join(',');

  if (/\/upload\/v\d+\//.test(url)) {
    return url.replace(/\/upload\/(v\d+\/)/, `/upload/${transformStr}/$1`);
  }
  return url.replace(/\/upload\//, `/upload/${transformStr}/`);
}

export function optimizeProductImageUrl(url?: string, width = 800): string {
  if (!url) return '';
  if (url.includes(CLOUDINARY_BASE)) return optimizeCloudinaryUrl(url, width);

  if (url.includes('cdn.shopify.com/')) {
    const optimizedUrl = new URL(url);
    optimizedUrl.searchParams.set('width', String(width));
    return optimizedUrl.toString();
  }

  return url;
}

/**
 * Optimized helper for small icons and avatars (100px - 200px)
 */
export function getAvatarUrl(url?: string): string {
  return optimizeCloudinaryUrl(url, 160, 'auto:good');
}

/**
 * Optimized helper for small circles / category thumbnails
 */
export function getThumbnailUrl(url?: string): string {
  return optimizeCloudinaryUrl(url, 280, 'auto:good');
}

/**
 * Optimized helper for e-commerce product cards (400px - 500px)
 */
export function getProductCardUrl(url?: string): string {
  return optimizeCloudinaryUrl(url, 480, 'auto:good');
}

/**
 * Optimized helper for large banners & showcase graphics
 */
export function getBannerUrl(url?: string, isMobile: boolean = false): string {
  return optimizeCloudinaryUrl(url, isMobile ? 640 : 1280, 'auto:good');
}

/**
 * Tiny blurred placeholder for progressive image loading
 */
export function getPlaceholderUrl(url: string): string {
  if (!url || !url.includes(CLOUDINARY_BASE)) return '';
  return url.replace(
    /\/upload\//,
    '/upload/f_auto,q_10,w_20,e_blur:500/'
  );
}
