import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductDetailView } from "./components/product-detail-view";
import prisma from "@/lib/prisma";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  if (!id) {
    return (
      <div className="w-full max-w-xl mx-auto my-20 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
        <div className="text-6xl text-gray-400 dark:text-gray-600 mb-6 mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          🔍
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl mb-3">
          Product Not Found
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          We couldn't find the product you're looking for. It might be out of
          stock, discontinued, or the link is broken.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Go to Homepage
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 dark:border-gray-700 text-gray-900 dark:text-gray-50 dark:hover:bg-gray-800"
          >
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  const product: any = await prisma.product
    .findFirst({
      where: { id: parseInt(id) },
      include: {
        subscriptionPlans: {
          select: {
            three: true,
            six: true,
            twelve: true,
          },
        },
      },
    })
    .catch((e) => {
      return null;
    });

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Product Details</h1>
      <Card>
        <CardContent className="p-6">
          <Suspense fallback={<div>Loading product details...</div>}>
            <ProductDetailView product={product} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
