import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid({
  products,
  columns = 4,
  priorityCount = 4,
}: {
  products: Product[];
  columns?: 3 | 4;
  priorityCount?: number;
}) {
  if (products.length === 0) {
    return (
      <p className="py-24 text-center text-sm text-ink-500">
        Nothing here yet. Try another collection.
      </p>
    );
  }

  const cols =
    columns === 3
      ? 'grid-cols-2 md:grid-cols-3'
      : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4';

  return (
    <div className={`grid gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16 ${cols}`}>
      {products.map((p, i) => (
        <ProductCard
          key={p.handle}
          product={p}
          priority={i < priorityCount}
          sizes={
            columns === 3
              ? '(min-width: 768px) 31vw, 45vw'
              : '(min-width: 1280px) 22vw, (min-width: 768px) 31vw, 45vw'
          }
        />
      ))}
    </div>
  );
}
