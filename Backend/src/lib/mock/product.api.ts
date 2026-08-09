import { MOCK_PRODUCTS } from "./product.mock.ts";
import type {
  FetchProductsParams,
  FetchProductsResponse,
} from "../../types/product";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchProductsMock(
  params: FetchProductsParams = {},
): Promise<FetchProductsResponse> {
  const {
    page = 1,
    limit = 8,
    search = "",
    category,
    brands,
    colors,
    duration,
    minPrice,
    maxPrice,
  } = params;

  await delay(400);

  let filtered = MOCK_PRODUCTS;

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q),
    );
  }

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (brands && brands.length > 0) {
    filtered = filtered.filter((p) => brands.includes(p.brand));
  }

  if (colors && colors.length > 0) {
    filtered = filtered.filter((p) => colors.includes(p.color));
  }

  if (duration) {
    filtered = filtered.filter((p) => p.availableDurations.includes(duration));
  }

  if (minPrice !== undefined) {
    filtered = filtered.filter((p) => p.pricePerDay >= minPrice);
  }

  if (maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.pricePerDay <= maxPrice);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const data = filtered.slice(start, start + limit);

  // Facets computed from the FULL catalog, not the filtered subset,
  // so filter options don't disappear as the user narrows results.
  const allPrices = MOCK_PRODUCTS.map((p) => p.pricePerDay);
  const facets = {
    brands: [...new Set(MOCK_PRODUCTS.map((p) => p.brand))].sort(),
    colors: [...new Set(MOCK_PRODUCTS.map((p) => p.color))].sort(),
    priceRange: { min: Math.min(...allPrices), max: Math.max(...allPrices) },
    durations: [
      ...new Set(MOCK_PRODUCTS.flatMap((p) => p.availableDurations)),
    ].sort((a, b) => a - b),
  };

  return {
    data,
    meta: { page: safePage, limit, total, totalPages },
    facets,
  };
}
