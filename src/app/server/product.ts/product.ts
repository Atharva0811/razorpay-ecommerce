"use server";

import { Status } from "@/app/generated/prisma";
import prisma from "@/lib/prisma";

export async function createProduct(values: {
  category: string;
  description: string;
  imageUrl: string;
  name: string;
  priceSix: number;
  priceThree: number;
  priceTwelve: number;
  status: Status;
  features?: string;
}) {
  let subscription = {};
  if (values.priceThree || values.priceSix || values.priceTwelve) {
    subscription = {
      three: values.priceThree,
      six: values.priceSix,
      twelve: values.priceTwelve,
    };
  }

  const res = prisma.product.create({
    data: {
      name: values.name,
      description: values.description,
      category: values.category,
      status: values.status,
      imageUrl: values.imageUrl,
      // The nested `create` for the related model
      subscriptionPlans: {
        create: subscription,
      },
    },
    // You can include the created subscription plans in the return value
    include: {
      subscriptionPlans: true,
    },
  });
  return res;
}
