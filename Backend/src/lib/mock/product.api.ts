import { MOCK_PRODUCTS } from "./products.mock.ts";
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
  const { page = 1, limit = 8, search = "", category } = params;

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

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    meta: { page: safePage, limit, total, totalPages },
  };
}
