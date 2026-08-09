import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../lib/api/product.api.ts";
import type { Product } from "../../types/product";
import ProductCard from "../products/ProductCard";
import ProductCardSkeleton from "../products/ProductSkeleton.tsx";

const FEATURED_COUNT = 4;

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchProducts({ page: 1, limit: FEATURED_COUNT });
        if (!cancelled) setProducts(res.data);
      } catch {
        // fail silently on homepage — not worth a toast for a teaser section
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="px-4 py-16 max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold purple-fade-text mb-1">
            Available to Rent
          </h2>
          <p className="text-text-muted text-sm">
            Browse our most popular equipment
          </p>
        </div>
        <Link
          to="/products"
          className="text-sm font-medium text-primary hover:text-secondary transition-colors flex-shrink-0"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: FEATURED_COUNT }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {!loading && products.length === 0 && (
        <p className="text-center text-text-muted py-8">
          No products available right now.
        </p>
      )}
    </section>
  );
}
