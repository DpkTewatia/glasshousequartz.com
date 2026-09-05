/** Money is stored and passed around as integer cents. Never as a float. */
export type Cents = number;

export interface ProductImage {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  position: number;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  sku: string | null;
  title: string;
  price: Cents;
  compareAtPrice: Cents | null;
  available: boolean;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  position: number;
}

export interface Product {
  handle: string;
  title: string;
  brand: string;
  description: string;
  descriptionHtml: string;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  priceMin: Cents | null;
  priceMax: Cents | null;
  available: boolean;
  tags: string[];
  publishedAt: string | null;
  collections: string[];
}

export interface Collection {
  handle: string;
  title: string;
  group: string;
  description: string;
  image: string | null;
  productHandles: string[];
  count: number;
  sortOrder: number;
}

export interface Catalog {
  generatedAt: string;
  source: string;
  counts: {
    products: number;
    collections: number;
    variants: number;
    images: number;
    orphans: number;
  };
  collections: Collection[];
  products: Product[];
}

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'title-asc' | 'newest';

export interface CartLine {
  variantId: string;
  productHandle: string;
  quantity: number;
}

export interface HydratedCartLine extends CartLine {
  product: Product;
  variant: ProductVariant;
  lineTotal: Cents;
}

export interface Cart {
  id: string;
  lines: HydratedCartLine[];
  subtotal: Cents;
  count: number;
}
