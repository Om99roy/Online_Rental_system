import axios from "axios";
import { API } from "../api";
import type {
  FetchProductsParams,
  FetchProductsResponse,
} from "../../types/product";

export async function fetchProducts(
  params: FetchProductsParams = {},
): Promise<FetchProductsResponse> {
  const res = await axios.get(API.PRODUCTS.LIST, { params });
  return {
    data: res.data.data,
    meta: res.data.meta,
    facets: res.data.facets,
  };
}
