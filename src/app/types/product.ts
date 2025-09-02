export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  features: string[];
  status: "active" | "draft" | "archived";
  imageUrl: string;
  subscriptionPlans?:
    | {
        id: number;
          three: number;
          six: number;
          twelve: number;
        productId: number;
      }
    | null;
}
