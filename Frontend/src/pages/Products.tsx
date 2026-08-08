import { useEffect, useState } from "react";
import { fetchProductsMock } from "../lib/mock/products.api";
import type { Product } from "../types/";
import { useDebounce } from "../hooks/useDebounce";
import SearchBar from "../components/products/SearchBar";
import ProductCard from "../components/products/ProductCard";
import ProductCardSkeleton from "../components/products/ProductSkeleton.tsx";
import Pagination from "../components/products/Pagination";

const PAGE_SIZE = 8;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const res = await fetchProductsMock({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      });
      if (!cancelled) {
        setProducts(res.data);
        setTotalPages(res.meta.totalPages);
        setTotal(res.meta.total);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold purple-fade-text mb-1">
            Browse Products
          </h1>
          <p className="text-text-muted text-sm">
            Find and rent the equipment you need
          </p>
        </div>

        <div className="max-w-md mb-6">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <p className="text-sm text-text-subtle mb-4">
          {loading
            ? "Searching..."
            : `${total} product${total === 1 ? "" : "s"} found`}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-muted">No products match your search.</p>
          </div>
        )}

        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
