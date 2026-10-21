export interface CategoryItem {
  id: string;
  title: string;
  handle: string;
  image: string;
  fallbackImage?: string;
  categoryName: string;
}

export interface BrandItem {
  name: string;
  vendor: string;
  handle: string;
  image: string;
  fallbackImage?: string;
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'cleanser',
    title: 'CLEANSER',
    handle: 'cleanser',
    image: '/images/home-categories/cleanser.webp',
    categoryName: 'Cleanser',
  },
  {
    id: 'eyecream',
    title: 'EYECREAM',
    handle: 'eyecream',
    image: '/images/home-categories/eyecream.webp',
    categoryName: 'Eye Cream',
  },
  {
    id: 'spf',
    title: 'SPF',
    handle: 'spf',
    image: '/images/home-categories/spf.webp',
    categoryName: 'SPF',
  },
  {
    id: 'masks',
    title: 'MASKS',
    handle: 'masks',
    image: '/images/home-categories/masks.webp',
    categoryName: 'Masks',
  },
  {
    id: 'moisturiser',
    title: 'MOISTURISER',
    handle: 'moisturiser',
    image: '/images/home-categories/moisturiser.webp',
    categoryName: 'Moisturiser',
  },
  {
    id: 'toner',
    title: 'TONER',
    handle: 'toner',
    image: '/images/home-categories/toner.webp',
    categoryName: 'Toner',
  },
];

export const BRANDS_DATA: BrandItem[] = [
  {
    name: 'SKIN 1004',
    vendor: 'SKIN1004',
    handle: 'skin-1004',
    image: '/images/brand-logos/skin-1004.webp',
  },
  {
    name: 'BEAUTY OF JOSEON',
    vendor: 'BEAUTY OF JOSEON',
    handle: 'beauty-of-joseon',
    image: '/images/brand-logos/beauty-of-joseon.png',
  },
  {
    name: 'ANUA',
    vendor: 'ANUA',
    handle: 'anua',
    image: '/images/brand-logos/anua.webp',
  },
  {
    name: 'COSRX',
    vendor: 'COSRX',
    handle: 'cosrx',
    image: '/images/brand-logos/cosrx.png',
  },
  {
    name: 'HARUHARU WONDER',
    vendor: 'HARUHARU WONDER',
    handle: 'haruharu-wonder',
    image: '/images/brand-logos/haruharu-wonder.png',
  },
];
