export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  brand: string;
  imageUrl: string;
  status: ProductStatus;
  stock: number;
  pricePerDay: number;
  securityDeposit: number;
}

export interface FetchProductsParams {
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
}
