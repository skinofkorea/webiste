import { Product } from '../types/api-types';

export interface MiikoreanImage {
  id: number;
  src: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface MiikoreanVariant {
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

export interface MiikoreanProduct extends Product {
  id: number;
  handle: string;
  vendor: string;
  tags: string[];
  bodyHtml: string;
  currency: 'GBP';
  images: MiikoreanImage[];
  variants: MiikoreanVariant[];
}

export interface MiikoreanCollection {
  id: number;
  title: string;
  handle: string;
  description: string;
  image: string | null;
  published_at: string;
  product_handles?: string[];
}

export interface MiikoreanPage {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  published_at: string;
}

export interface MiikoreanStorefrontData {
  source: string;
  exported_at: string;
  product_count: number;
  collection_count: number;
  page_count: number;
  products: MiikoreanProduct[];
  collections: MiikoreanCollection[];
  pages: MiikoreanPage[];
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
  variants: MiikoreanVariant[];
  images: MiikoreanImage[];
}

interface ShopifyStorefrontFile extends Omit<MiikoreanStorefrontData, 'products'> {
  products: ShopifyProduct[];
}

let storefrontRequest: Promise<MiikoreanStorefrontData> | undefined;

function toPlainText(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  return (document.body.textContent || '').replace(/\s+/g, ' ').trim();
}

function toProduct(product: ShopifyProduct): MiikoreanProduct {
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
    vendor: product.vendor || 'Mii Korean',
    tags: product.tags || [],
    currency: 'GBP',
    images,
    variants,
  };
}

export function loadMiikoreanStorefront(): Promise<MiikoreanStorefrontData> {
  if (!storefrontRequest) {
    storefrontRequest = fetch('/miikorean-storefront.json')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Could not load the Miikorean catalog (${response.status}).`);
        }
        return response.json() as Promise<ShopifyStorefrontFile>;
      })
      .then((data) => {
        if (!Array.isArray(data.products) || !Array.isArray(data.collections) || !Array.isArray(data.pages)) {
          throw new Error('The Miikorean catalog file is missing products, collections, or pages.');
        }

        return {
          ...data,
          products: data.products.map(toProduct),
        };
      })
      .catch((error: unknown) => {
        storefrontRequest = undefined;
        throw error;
      });
  }

  return storefrontRequest;
}

export function findMiikoreanProduct(products: MiikoreanProduct[], id: string): MiikoreanProduct | undefined {
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
  products: MiikoreanProduct[],
  collection: MiikoreanCollection,
): MiikoreanProduct[] {
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
