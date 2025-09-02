"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "../types/product";
import { Status } from "../generated/prisma";
import { createProduct } from "../server/product.ts/product";

const formSchema: any = z.object({
  name: z
    .string()
    .min(2, { message: "Product name must be at least 2 characters." })
    .max(50, { message: "Product name must not exceed 50 characters." }),
  description: z
    .string()
    .max(500, { message: "Description must not exceed 500 characters." })
    .optional(),
  imageUrl: z.string().url({ message: "Must be a valid URL." }),
  category: z.string().min(1, { message: "Please select a category." }),
  status: z.enum(["active", "draft", "archived"]),

  priceThree: z.coerce
    .number()
    .min(0.01, { message: "Price must be at least ₹0.01" }),
  priceSix: z.coerce
    .number()
    .min(0.01, { message: "Price must be at least ₹0.01" }),
  priceTwelve: z.coerce
    .number()
    .min(0.01, { message: "Price must be at least ₹0.01" }),
});

interface ProductFormProps {
  initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const isEditing = !!initialData;
  // const router = useRouter();

  const defaultPrice = initialData?.subscriptionPlans;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          imageUrl: initialData.imageUrl,
          category: initialData.category,
          status: initialData.status,
          priceThree: defaultPrice?.three || 0,
          priceSix: defaultPrice?.six || 0,
          priceTwelve: defaultPrice?.twelve || 0,
        }
      : {
          name: "",
          description: "",
          imageUrl: "",
          category: "",
          status: "draft",
          priceThree: 0.0,
          priceSix: 0.0,
          priceTwelve: 0.0,
        },
  });

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(values: {
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
    setIsLoading(true);
    try {
      if (isEditing) {
        console.log("Updating product:", {
          ...values,
          id: initialData.id,
          subscriptionPlans: [
            {
              // Assuming you are updating an existing plan
              id: initialData.subscriptionPlans?.id,
              three: values.priceThree,
              six: values.priceSix,
              twelve: values.priceTwelve,
            },
          ],
        });
        toast("Product Updated!", {
          description: `"${values.name}" has been successfully updated.`,
        });
      } else {
        const newProduct = await createProduct(values);
        console.log("Creating new product:", newProduct);
        toast("Product Created!", {
          description: `"${newProduct.name}" has been added to your inventory.`,
        });
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("Failed to save product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Ultra Gaming Laptop" {...field} />
              </FormControl>
              <FormDescription>
                The name of your product as it will appear to customers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a detailed description of your product features and benefits."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A comprehensive description for your product page.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                A direct link to your product's main image.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="priceThree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>3-Month Price (INR)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="999.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceSix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>6-Month Price (INR)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="1899.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceTwelve"
            render={({ field }) => (
              <FormItem>
                <FormLabel>12-Month Price (INR)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="3599.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="home-goods">Home Goods</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="sports">Sports & Outdoors</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Categorize your product for better discoverability.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Product Status</FormLabel>
                <FormDescription>
                  Set your product as active, draft (not visible), or archived
                  (unavailable).
                </FormDescription>
              </div>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Status.active}>
                      Active (Visible)
                    </SelectItem>
                    <SelectItem value={Status.draft}>Draft (Hidden)</SelectItem>
                    <SelectItem value={Status.archived}>
                      Archived (Retired)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Save Changes"
            : "Add Product"}
        </Button>
      </form>
    </Form>
  );
}
