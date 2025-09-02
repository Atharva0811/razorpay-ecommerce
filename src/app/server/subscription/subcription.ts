"use server";

import { revalidatePath } from "next/cache";
import { PlanType, SubscriptionStatus } from "@/app/generated/prisma";
import { getCurrentUser } from "../userLogin/signIn";
import prisma from "@/lib/prisma";

export type SubscriptionState = {
  errors?: {
    general?: string[];
  };
  success?: boolean;
  message?: string;
};

export async function subscribeToProduct(
  productId: number,
  planType: PlanType
): Promise<SubscriptionState> {
  try {
    console.log("testing started");

    const user = await getCurrentUser();

    if (!user) {
      return {
        errors: {
          general: ["Please login to subscribe to products"],
        },
      };
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { subscriptionPlans: true },
    });

    if (!product || product.status !== "active") {
      return {
        errors: {
          general: ["Product not found or is not available"],
        },
      };
    }

    if (!product.subscriptionPlans) {
      return {
        errors: {
          general: ["No subscription plans available for this product"],
        },
      };
    }

    // Get plan price and duration
    let planPrice: number | null = null;
    let durationMonths: number = 0;

    switch (planType) {
      case "THREE_MONTHS":
        planPrice = product.subscriptionPlans.three;
        durationMonths = 3;
        break;
      case "SIX_MONTHS":
        planPrice = product.subscriptionPlans.six;
        durationMonths = 6;
        break;
      case "TWELVE_MONTHS":
        planPrice = product.subscriptionPlans.twelve;
        durationMonths = 12;
        break;
    }

    if (!planPrice) {
      return {
        errors: {
          general: ["Selected plan is not available"],
        },
      };
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.userSubscription.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    if (
      existingSubscription &&
      existingSubscription.status === "ACTIVE" &&
      existingSubscription.endDate > new Date()
    ) {
      return {
        errors: {
          general: ["You already have an active subscription for this product"],
        },
      };
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + durationMonths);

    // Create or update subscription
    await prisma.userSubscription.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
      update: {
        planType,
        status: "ACTIVE",
        startDate,
        endDate,
        amount: planPrice,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        productId: productId,
        planType,
        status: "ACTIVE",
        startDate,
        endDate,
        amount: planPrice,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/products/${productId}`);

    const planName = planType
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return {
      success: true,
      message: `Successfully subscribed to ${
        product.name
      } (${planName})! Valid until ${endDate.toLocaleDateString()}`,
    };
  } catch (error) {
    console.error("Subscription error:", error);
    return {
      errors: {
        general: ["Failed to subscribe. Please try again."],
      },
    };
  }
}

export async function getUserSubscriptions(userId: string) {
  try {
    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            subscriptionPlans: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return subscriptions;
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return [];
  }
}

export async function getProductSubscription(productId: number) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return false;
    }
    const subscription = await prisma.userSubscription.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      include: {
        product: {
          include: {
            subscriptionPlans: true,
          },
        },
      },
    });

    if (subscription) return true;
    return false;
  } catch (error) {
    console.error("Get product subscription error:", error);
    return null;
  }
}
