import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { seedCategories, seedProducts } from "./seed-data.js";

function loadEnvFile(): void {
  const appEnv = process.env.APP_ENV ?? "local";
  const envFile = resolve(process.cwd(), `.env.${appEnv}`);

  if (existsSync(envFile)) {
    config({ path: envFile });
    console.info(`Using ${envFile}`);
    return;
  }

  const legacyEnv = resolve(process.cwd(), ".env");
  if (existsSync(legacyEnv)) {
    config({ path: legacyEnv });
    console.info(`Using ${legacyEnv}`);
  }
}

async function main(): Promise<void> {
  loadEnvFile();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const prisma = new PrismaClient();

  console.info("Seeding categories...");
  const categoryMap = new Map<string, string>();

  for (const category of seedCategories) {
    const record = await prisma.category.upsert({
      where: { name: category.name },
      update: { description: category.description },
      create: {
        name: category.name,
        description: category.description,
      },
    });

    categoryMap.set(category.name, record.id);
  }

  console.info(`Seeded ${categoryMap.size} categories`);

  let productCount = 0;
  let aliasCount = 0;

  console.info("Seeding products and aliases...");

  for (const product of seedProducts) {
    const categoryId = categoryMap.get(product.categoryName);

    if (!categoryId) {
      throw new Error(`Category not found: ${product.categoryName}`);
    }

    const record = await prisma.product.upsert({
      where: { productCode: product.productCode },
      update: {
        name: product.name,
        description: product.description ?? null,
        price: product.price,
        unit: product.unit,
        stockQuantity: product.stockQuantity ?? 0,
        categoryId,
      },
      create: {
        productCode: product.productCode,
        name: product.name,
        description: product.description ?? null,
        price: product.price,
        unit: product.unit,
        stockQuantity: product.stockQuantity ?? 0,
        categoryId,
      },
    });

    productCount += 1;

    for (const alias of product.aliases ?? []) {
      await prisma.productAlias.upsert({
        where: { alias },
        update: { productId: record.id },
        create: {
          alias,
          productId: record.id,
        },
      });

      aliasCount += 1;
    }
  }

  const [categories, products, aliases] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.productAlias.count(),
  ]);

  console.info("Seed complete:");
  console.info(`  Categories: ${categories}`);
  console.info(`  Products:   ${products} (${productCount} upserted this run)`);
  console.info(`  Aliases:    ${aliases} (${aliasCount} upserted this run)`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
