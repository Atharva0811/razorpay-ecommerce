"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";
import { ProductForm } from "./product-form";
import { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainPrice = product.subscriptionPlans?.three;
  const formattedPrice = mainPrice
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(mainPrice)
    : "Unavailable";
  let statusVariant:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | null
    | undefined = "secondary";
  if (product.status === "active") statusVariant = "default";
  if (product.status === "draft") statusVariant = "outline";
  if (product.status === "archived") statusVariant = "destructive";

  const handleDelete = () => {
    console.log(`Deleting product: ${product.name} (ID: ${product.id})`);
  };

  return (
    <Card className="flex flex-col h-full">
      <a
        className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
        href={`products/${product.id}`}
      >
        <CardHeader className="p-0 relative h-48 rounded-t-lg overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 left-2">
            <Badge variant={statusVariant} className="capitalize">
              {product.status}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="h-8 w-8 p-0 rounded-full bg-opacity-70 backdrop-blur-sm"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(product.id.toString())
                  }
                >
                  Copy product ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Edit Product
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Edit Product: {product.name}</DialogTitle>
                    </DialogHeader>
                    <ProductForm initialData={product} />
                  </DialogContent>
                </Dialog>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={handleDelete}
                >
                  Delete Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <CardTitle className="text-lg font-semibold truncate">
            {product.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1 mb-2">
            {product.category}
          </CardDescription>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="font-bold text-base">{formattedPrice}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0"></CardFooter>
      </a>
    </Card>
  );
}
