import { Product } from "@/app/types/product";
import { PrismaClient, User } from "../src/app/generated/prisma";
import { sampleProductsData } from "./sample";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Delete all existing data to ensure a clean slate
  try {
    await prisma.subscriptionPlan.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (e) {
    console.log(e);
  }

  // Loop through your sample data to create products
  for (const productData of sampleProductsData) {
    const { price, ...productWithoutPlans } = productData;

    const product: Product = await prisma.product.create({
      data: {
        ...productWithoutPlans,
        subscriptionPlans: {
          create: {
            three: price.three,
            six: price.six,
            twelve: price.twelve,
          },
        },
      },
    });

    console.log(
      `Created product with id: ${product.id} and one subscription plan.`
    );
  }

  console.log("Creating default user...");
  const user: User = await prisma.user.create({
    data: {
      username: "admin",
      password: "admin12345",
      email: "testing@inaiways.com",
    },
  });

  console.log(
    `Created User with id: ${user.id}, username:${user.username}, password:${user.password}`
  );

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
