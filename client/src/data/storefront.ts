import { Product } from '../types/api-types';

export interface StoreImage {
  id: number;
  src: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface StoreVariant {
  id: number;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  price: string;
  compare_at_price: string | null;
  available: boolean;
  sku: string | null;
  featured_image: string | null;
}

export interface StoreProduct extends Product {
  id: number;
  handle: string;
  vendor: string;
  tags: string[];
  bodyHtml: string;
  currency: 'GBP';
  images: StoreImage[];
  variants: StoreVariant[];
}

export interface StoreCollection {
  id: number;
  title: string;
  handle: string;
  description: string;
  image: string | null;
  published_at: string;
  product_handles?: string[];
}

export interface StorePage {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  published_at: string;
}

export interface StorefrontData {
  source: string;
  exported_at: string;
  product_count: number;
  collection_count: number;
  page_count: number;
  products: StoreProduct[];
  collections: StoreCollection[];
  pages: StorePage[];
}

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  published_at: string;
  tags: string[];
  variants: StoreVariant[];
  images: StoreImage[];
}

interface ShopifyStorefrontFile extends Omit<StorefrontData, 'products'> {
  products: ShopifyProduct[];
}

let storefrontRequest: Promise<StorefrontData> | undefined;

function toPlainText(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  return (document.body.textContent || '').replace(/\s+/g, ' ').trim();
}

export function toProduct(product: ShopifyProduct): StoreProduct {
  const variants = product.variants || [];
  const availableVariants = variants.filter((variant) => variant.available);
  const pricedVariants = (availableVariants.length > 0 ? availableVariants : variants)
    .map((variant) => Number(variant.price))
    .filter(Number.isFinite);
  const images = product.images || [];
  const firstImage = images[0]?.src || variants.find((variant) => variant.featured_image)?.featured_image || '';
  const description = toPlainText(product.body_html || '');

  return {
    _id: product.handle,
    id: product.id,
    name: product.title,
    handle: product.handle,
    category: product.product_type || 'Skincare',
    stock: availableVariants.length > 0 ? 9999 : 0,
    photo: firstImage,
    price: pricedVariants.length > 0 ? Math.min(...pricedVariants) : 0,
    description: description.slice(0, 320),
    bodyHtml: product.body_html || '',
    featured: product.tags.some((tag) => /best.?seller|featured|bestseller/i.test(tag)),
    isActive: true,
    createdAt: product.published_at,
    updatedAt: product.published_at,
    vendor: product.vendor || 'Skin of Korea',
    tags: product.tags || [],
    currency: 'GBP',
    images,
    variants,
  };
}

export function loadStorefront(): Promise<StorefrontData> {
  if (!storefrontRequest) {
    storefrontRequest = fetch('/api/v1/storefront')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Could not load the Skin of Korea catalog (${response.status}).`);
        }
        return response.json() as Promise<ShopifyStorefrontFile>;
      })
      .then((data) => {
        if (!Array.isArray(data.products) || !Array.isArray(data.collections) || !Array.isArray(data.pages)) {
          throw new Error('The Skin of Korea catalog file is missing products, collections, or pages.');
        }

        return {
          ...data,
          products: data.products.map((p: any) => ({
            ...p,
            _id: p.handle || p._id || String(p.id),
            id: p.id,
            name: p.name || p.title,
            handle: p.handle || String(p.id),
            category: p.category || p.product_type || 'Skincare',
            stock: Number(p.stock !== undefined ? p.stock : 9999),
            photo: p.photo || p.images?.[0]?.src || '',
            price: Number(p.price || 0),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
            description: p.description || '',
            bodyHtml: p.bodyHtml || p.body_html || '',
            featured: Boolean(p.featured),
            isActive: p.isActive !== false,
            createdAt: p.createdAt || p.published_at || new Date().toISOString(),
            updatedAt: p.updatedAt || p.published_at || new Date().toISOString(),
            vendor: p.vendor || 'Skin of Korea',
            tags: p.tags || [],
            currency: 'GBP' as const,
            images: p.images || [],
            variants: p.variants || [],
          })),
        };
      })
      .catch((error: unknown) => {
        storefrontRequest = undefined;
        throw error;
      });
  }

  return storefrontRequest;
}

export function findStoreProduct(products: StoreProduct[], id: string): StoreProduct | undefined {
  return products.find((product) => product.handle === id || product._id === id || String(product.id) === id);
}

export function normalizeStoreHandle(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatStorePrice(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function sanitizeStoreHtml(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('script, style, iframe, object, embed, form, input, button').forEach((node) => node.remove());
  document.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith('on') || ((name === 'href' || name === 'src') && value.startsWith('javascript:'))) {
        element.removeAttribute(attribute.name);
      }
    });
  });
  return document.body.innerHTML;
}

export function getCollectionProducts(
  products: StoreProduct[],
  collection: StoreCollection,
): StoreProduct[] {
  if (Array.isArray(collection.product_handles)) {
    const productHandles = new Set(collection.product_handles);
    return products.filter((product) => productHandles.has(product.handle));
  }

  if (collection.handle === 'all') {
    return products;
  }

  if (collection.handle === 'frontpage') {
    const featured = products.filter((product) => product.featured);
    return featured.length > 0 ? featured : products.slice(0, 24);
  }

  const collectionHandle = collection.handle.replace(/-(?:new|\d+)$/, '');
  const equivalentHandles = new Set([
    collectionHandle,
    collectionHandle.replace(/-/g, ''),
    collectionHandle.replace(/s$/, ''),
  ]);

  return products.filter((product) => {
    const productHandles = [
      normalizeStoreHandle(product.vendor),
      normalizeStoreHandle(product.category),
      ...product.tags.map(normalizeStoreHandle),
    ];
    return productHandles.some((handle) =>
      equivalentHandles.has(handle) ||
      equivalentHandles.has(handle.replace(/-/g, '')) ||
      equivalentHandles.has(handle.replace(/s$/, '')),
    );
  });
}
