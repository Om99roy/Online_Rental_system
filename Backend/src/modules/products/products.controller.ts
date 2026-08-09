import type { Request, Response, NextFunction } from "express";
import { listProducts } from "./products.service.ts";
import { getDefaultOrganizationId } from "../../utils/organization.ts";

function toArray(val: unknown): string[] | undefined {
  if (!val) return undefined;
  return Array.isArray(val) ? (val as string[]) : [val as string];
}

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizationId = await getDefaultOrganizationId();
    const {
      page,
      limit,
      search,
      category,
      brands,
      colors,
      duration,
      minPrice,
      maxPrice,
    } = req.query;

    const result = await listProducts(organizationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      category: category as string | undefined,
      brands: toArray(brands),
      colors: toArray(colors),
      duration: duration ? Number(duration) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    res
      .status(200)
      .json({
        success: true,
        data: result.data,
        meta: result.meta,
        facets: result.facets,
      });
  } catch (error) {
    next(error);
  }
};
