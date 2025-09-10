import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "./components/product-form";
import { ProductCardGrid } from "./components/product-card-grid";
import prisma from "@/lib/prisma";

export default async function ProductsPage() {
  const products:any = await prisma.product
    .findMany({
      include: {
        subscriptionPlans: true,
      },
    })
    .catch((e) => {
      return null;
    });
    

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">What We Provide</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-700">
              <PlusCircle className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:flex">Add New Product</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Manage your products, inventory levels, and product status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading product list...</div>}>
            <ProductCardGrid products={products} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
