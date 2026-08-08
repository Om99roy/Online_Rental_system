import { useEffect, useState } from "react";
import { fetchProductsMock } from "../lib/mock/products.api";
import type {
  Product,
  ProductFilters as ProductFiltersType,
} from "../types/product";
import { useDebounce } from "../hooks/useDebounce";
import SearchBar from "../components/products/SearchBar";
import ProductCard from "../components/products/ProductCard";
import ProductCardSkeleton from "../components/products/ProductSkeleton.tsx";
import Pagination from "../components/products/Pagination";
import ProductFiltersPanel from "../components/products/ProductFilters";

const PAGE_SIZE = 8;

const EMPTY_FACETS = {
  brands: [] as string[],
  colors: [] as string[],
  priceRange: { min: 0, max: 0 },
  durations: [] as number[],
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ProductFiltersType>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState(EMPTY_FACETS);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const res = await fetchProductsMock({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        ...filters,
      });
      if (!cancelled) {
        setProducts(res.data);
        setTotalPages(res.meta.totalPages);
        setTotal(res.meta.total);
        setFacets(res.facets);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, filters]);

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

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            {facets.brands.length > 0 && (
              <ProductFiltersPanel
                filters={filters}
                onChange={setFilters}
                facets={facets}
              />
            )}
          </div>

          <div className="lg:col-span-3">
            <p className="text-sm text-text-subtle mb-4">
              {loading
                ? "Searching..."
                : `${total} product${total === 1 ? "" : "s"} found`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
                <p className="text-text-muted">
                  No products match your filters.
                </p>
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
      </div>
    </div>
  );
}
