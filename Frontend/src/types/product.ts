export type ProductStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "OUT_OF_STOCK"
  | "DISCONTINUED";

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  brand: string;
  color: string;
  availableDurations: number[];
  imageUrl: string;
  status: ProductStatus;
  stock: number;
  pricePerDay: number;
  securityDeposit: number;
}

export interface ProductFilters {
  brands?: string[];
  colors?: string[];
  duration?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface FetchProductsParams extends ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface FetchProductsResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  facets: {
    brands: string[];
    colors: string[];
    priceRange: { min: number; max: number };
    durations: number[];
  };
}
