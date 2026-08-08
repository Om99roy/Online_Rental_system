import prisma from "../../config/prisma.ts";

interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brands?: string[];
  colors?: string[];
  duration?: number;
  minPrice?: number;
  maxPrice?: number;
}

export const listProducts = async (organizationId: string, params: ListProductsParams) => {
  const {
    page = 1,
    limit = 8,
    search,
    category,
    brands,
    colors,
    duration,
    minPrice,
    maxPrice,
  } = params;

  const products = await prisma.product.findMany({
    where: { organizationId, status: "ACTIVE" },
    include: {
      variants: true,
      priceListItems: {
        where: { rentalPeriodId: null, priceList: { isDefault: true } },
        take: 1,
      },
    },
  });

  const periods = await prisma.rentalPeriod.findMany({
    where: { organizationId, active: true, unit: "DAILY" },
    select: { duration: true },
  });
  const durationOptions = [...new Set(periods.map((p) => p.duration))].sort((a, b) => a - b);

  const shaped = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    sku: p.sku,
    category: p.category ?? "Uncategorized",
    brand: p.brand ?? "Generic",
    color: p.variants[0]?.color ?? "N/A",
    availableDurations: durationOptions,
    imageUrl: p.imageUrl ?? "",
    status: p.status,
    stock: p.stock,
    pricePerDay: p.priceListItems[0]?.price ? Number(p.priceListItems[0].price) : 0,
    securityDeposit: Number(p.securityDeposit),
  }));

  let filtered = shaped;

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }
  if (category) filtered = filtered.filter((p) => p.category === category);
  if (brands?.length) filtered = filtered.filter((p) => brands.includes(p.brand));
  if (colors?.length) filtered = filtered.filter((p) => colors.includes(p.color));
  if (duration) filtered = filtered.filter((p) => p.availableDurations.includes(duration));
  if (minPrice !== undefined) filtered = filtered.filter((p) => p.pricePerDay >= minPrice);
  if (maxPrice !== undefined) filtered = filtered.filter((p) => p.pricePerDay <= maxPrice);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const data = filtered.slice(start, start + limit);

  const allPrices = shaped.map((p) => p.pricePerDay);
  const facets = {
    brands: [...new Set(shaped.map((p) => p.brand))].sort(),
    colors: [...new Set(shaped.map((p) => p.color))].sort(),
    priceRange: {
      min: allPrices.length ? Math.min(...allPrices) : 0,
      max: allPrices.length ? Math.max(...allPrices) : 0,
    },
    durations: durationOptions,
  };

  return { data, meta: { page: safePage, limit, total, totalPages }, facets };
};

export const getProductById = async (organizationId: string, productId: string) => {
  return prisma.product.findFirst({
    where: { id: productId, organizationId },
    include: {
      variants: true,
      priceListItems: { where: { rentalPeriodId: null, priceList: { isDefault: true } }, take: 1 },
    },
  });
};
