import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  "Camera",
  "Drone",
  "Laptop",
  "Audio",
  "Camping",
  "Projector",
  "Gaming",
  "Lighting",
  "Tools",
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
  "GoPro",
  "Dell",
  "HP",
  "Asus",
  "Logitech",
  "Yamaha",
  "Panasonic",
];
const colors = ["Black", "Silver", "White", "Grey", "Blue", "Red", "Green"];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function randomBetween(min: number, max: number, seed: number): number {
  return min + (seed % (max - min + 1));
}

interface ProductSeed {
  name: string;
  sku: string;
  category: string;
  brand: string;
  color: string;
  price: number;
  deposit: number;
  stock: number;
  description: string;
}

function generateProducts(count: number, skuStart: number): ProductSeed[] {
  const products: ProductSeed[] = [];

  for (let i = 0; i < count; i++) {
    const seed = skuStart + i;
    const category = pick(categories, seed);
    const brand = pick(brands, seed + 3);
    const color = pick(colors, seed + 7);
    const modelNumber = 100 + (seed % 900);

    products.push({
      name: `${brand} ${category} ${modelNumber}`,
      sku: `SKU-${skuStart + i}`,
      category,
      brand,
      color,
      price: randomBetween(200, 2500, seed * 13),
      deposit: randomBetween(1000, 10000, seed * 17),
      stock: randomBetween(1, 15, seed * 19),
      description: `A well-maintained ${category.toLowerCase()} from ${brand}, available for rent. Ideal for short-term or long-term use.`,
    });
  }

  return products;
}

async function chunkedInsert<T>(
  items: T[],
  size: number,
  insertFn: (item: T) => Promise<unknown>,
) {
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    await Promise.all(chunk.map(insertFn));
    console.log(
      `Inserted ${Math.min(i + size, items.length)} / ${items.length}`,
    );
  }
}

async function main() {
  const org = await prisma.organization.findFirst({ select: { id: true } });
  if (!org) {
    throw new Error(
      "No organization found. Run the base seed script first: bunx prisma db seed",
    );
  }

  const priceList = await prisma.priceList.findFirst({
    where: { organizationId: org.id, isDefault: true },
    select: { id: true },
  });
  if (!priceList) {
    throw new Error(
      "No default price list found. Run the base seed script first.",
    );
  }

  const existingCount = await prisma.product.count({
    where: { organizationId: org.id },
  });
  const products = generateProducts(350, existingCount + 1000);

  await chunkedInsert(products, 20, async (p) => {
    const existing = await prisma.product.findUnique({
      where: { organizationId_sku: { organizationId: org.id, sku: p.sku } },
    });
    if (existing) return;

    const product = await prisma.product.create({
      data: {
        organizationId: org.id,
        name: p.name,
        description: p.description,
        sku: p.sku,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
        securityDeposit: p.deposit,
        imageUrl: `https://picsum.photos/seed/${p.sku}/400/300`,
        variants: {
          create: { name: "Default", color: p.color, brand: p.brand },
        },
      },
    });

    await prisma.priceListItem.create({
      data: {
        priceListId: priceList.id,
        productId: product.id,
        price: p.price,
      },
    });
  });

  const total = await prisma.product.count({
    where: { organizationId: org.id },
  });
  console.log(`Done. Organization now has ${total} products.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
