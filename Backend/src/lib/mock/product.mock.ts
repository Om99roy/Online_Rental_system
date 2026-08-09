import type { Product } from "../../types/product";

const categories = [
  "Camera",
  "Drone",
  "Laptop",
  "Audio",
  "Camping",
  "Projector",
  "Gaming",
];
const brands = [
  "Sony",
  "Canon",
  "DJI",
  "Bose",
  "Apple",
  "Coleman",
  "Epson",
  "Nikon",
  "JBL",
];
const colors = ["Black", "Silver", "White", "Grey", "Blue"];
const durationOptions = [1, 3, 7, 14, 30];

function generateMockProducts(count: number): Product[] {
  const products: Product[] = [];
  for (let i = 1; i <= count; i++) {
    const category = categories[i % categories.length];
    const brand = brands[i % brands.length];
    const color = colors[i % colors.length];
    const durations = durationOptions.filter((_, idx) => (i + idx) % 2 === 0);

    products.push({
      id: `prod_${i}`,
      name: `${brand} ${category} ${100 + i}`,
      description: `A well-maintained ${category.toLowerCase()} available for rent, perfect for short or long-term use.`,
      sku: `SKU-${1000 + i}`,
      category,
      brand,
      color,
      availableDurations: durations.length ? durations : [1],
      imageUrl: `https://picsum.photos/seed/product-${i}/400/300`,
      status: i % 11 === 0 ? "OUT_OF_STOCK" : "ACTIVE",
      stock: i % 11 === 0 ? 0 : (i % 5) + 1,
      pricePerDay: 200 + (i % 10) * 75,
      securityDeposit: 1000 + (i % 6) * 500,
    });
  }
  return products;
}

export const MOCK_PRODUCTS: Product[] = generateMockProducts(48);
