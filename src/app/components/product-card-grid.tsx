"use client";

import { Product } from "../types/product";
import { ProductCard } from "./product-card";

interface ProductCardGridProps {
  products: Product[];
}

export function ProductCardGrid({ products }: ProductCardGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No products found. Add your first product!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {products.map((product) => (
        // The `ProductCard` component now correctly receives a product
        // with the new, nested `subscriptionPlans` data.
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
