import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.create({
    data: { name: "Demo Rentals Co.", currency: "INR" },
  });

  const priceList = await prisma.priceList.create({
    data: {
      organizationId: org.id,
      name: "Default",
      isDefault: true,
      active: true,
    },
  });

  await prisma.rentalPeriod.createMany({
    data: [
      { organizationId: org.id, name: "1 Day", duration: 1, unit: "DAILY" },
      { organizationId: org.id, name: "3 Days", duration: 3, unit: "DAILY" },
      { organizationId: org.id, name: "7 Days", duration: 7, unit: "DAILY" },
    ],
  });

  const productsData = [
    {
      name: "Sony Camera 101",
      sku: "SKU-1001",
      category: "Camera",
      brand: "Sony",
      price: 500,
      deposit: 2000,
      stock: 5,
    },
    {
      name: "DJI Drone 202",
      sku: "SKU-1002",
      category: "Drone",
      brand: "DJI",
      price: 800,
      deposit: 5000,
      stock: 3,
    },
    {
      name: "Bose Speaker 303",
      sku: "SKU-1003",
      category: "Audio",
      brand: "Bose",
      price: 300,
      deposit: 1000,
      stock: 8,
    },
  ];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        organizationId: org.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
        securityDeposit: p.deposit,
        imageUrl: `https://picsum.photos/seed/${p.sku}/400/300`,
        variants: { create: { name: "Default", color: "Black" } },
      },
    });

    await prisma.priceListItem.create({
      data: {
        priceListId: priceList.id,
        productId: product.id,
        price: p.price,
      },
    });
  }

  console.log("Seed complete. Organization ID:", org.id);
}

main().finally(() => prisma.$disconnect());
