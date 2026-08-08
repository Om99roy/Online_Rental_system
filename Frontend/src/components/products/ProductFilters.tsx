import type { ProductFilters as ProductFiltersType } from "../../types/product";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onChange: (filters: ProductFiltersType) => void;
  facets: {
    brands: string[];
    colors: string[];
    priceRange: { min: number; max: number };
    durations: number[];
  };
}

export default function ProductFilters({
  filters,
  onChange,
  facets,
}: ProductFiltersProps) {
  function toggleBrand(brand: string) {
    const current = filters.brands ?? [];
    const next = current.includes(brand)
      ? current.filter((b: String) => b !== brand)
      : [...current, brand];
    onChange({ ...filters, brands: next.length ? next : undefined });
  }

  function toggleColor(color: string) {
    const current = filters.colors ?? [];
    const next = current.includes(color)
      ? current.filter((c: String) => c !== color)
      : [...current, color];
    onChange({ ...filters, colors: next.length ? next : undefined });
  }

  function setDuration(duration: number | undefined) {
    onChange({ ...filters, duration });
  }

  function clearAll() {
    onChange({});
  }

  const hasActiveFilters =
    (filters.brands?.length ?? 0) > 0 ||
    (filters.colors?.length ?? 0) > 0 ||
    filters.duration !== undefined ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-primary hover:text-secondary transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Brand */}
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">
          Brand
        </p>
        <div className="space-y-2">
          {facets.brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.brands?.includes(brand) ?? false}
                onChange={() => toggleBrand(brand)}
                className="rounded border-border accent-primary"
              />
              <span className="text-text-muted">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">
          Color
        </p>
        <div className="flex flex-wrap gap-2">
          {facets.colors.map((color) => {
            const active = filters.colors?.includes(color) ?? false;
            return (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-muted hover:border-primary/40"
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">
          Rental duration
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDuration(undefined)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filters.duration === undefined
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-text-muted hover:border-primary/40"
            }`}
          >
            Any
          </button>
          {facets.durations.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filters.duration === d
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-text-muted hover:border-primary/40"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">
          Price per day (₹)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={String(facets.priceRange.min)}
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full bg-surface-2 border border-border placeholder:text-text-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <span className="text-text-subtle text-sm">–</span>
          <input
            type="number"
            placeholder={String(facets.priceRange.max)}
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full bg-surface-2 border border-border placeholder:text-text-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
}
