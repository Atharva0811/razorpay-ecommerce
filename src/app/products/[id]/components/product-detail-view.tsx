"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ShoppingCart, Check, Star, Clock } from "lucide-react";
import { Product } from "@/app/types/product";
import { useEffect, useState } from "react";
import {
  getProductSubscription,
  subscribeToProduct,
} from "@/app/server/subscription/subcription";
import SubscriptionButton from "@/app/components/subsciption-button";

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const plan = product.subscriptionPlans;
  const [selectedDuration, setSelectedDuration] = useState<
    "three" | "six" | "twelve"
  >("three");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const selectedPrice = plan ? plan[selectedDuration] : 0;
  const availablePlans = plan
    ? Object.entries(plan).filter(([_, price]) => price > 0)
    : [];
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSubcription, setLoadingSubcription] = useState(true);

  const formattedPrice = (price: number | undefined) => {
    if (!price || price === 0) {
      return "Unavailable";
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  useEffect(() => {
    setSubscribing();
  }, []);

  const setSubscribing = async () => {
    const temp = await getProductSubscription(product.id);
    if (temp) {
      setIsSubscribed(temp);
    }
    setLoadingSubcription(false);
  };

  const getMonthlyPrice = (totalPrice: number, months: number) => {
    return totalPrice / months;
  };

  const getDurationLabel = (duration: string) => {
    const labels = {
      three: "3 Months",
      six: "6 Months",
      twelve: "12 Months",
    };
    return labels[duration as keyof typeof labels];
  };

  const getDurationMonths = (duration: string) => {
    const months = {
      three: 3,
      six: 6,
      twelve: 12,
    };
    return months[duration as keyof typeof months];
  };

  const getBestValuePlan = () => {
    if (!plan) return null;

    const plans = [
      { duration: "three", price: plan.three, months: 3 },
      { duration: "six", price: plan.six, months: 6 },
      { duration: "twelve", price: plan.twelve, months: 12 },
    ].filter((p) => p.price > 0);

    if (plans.length === 0) return null;

    return plans.reduce((best, current) => {
      const bestMonthly = best.price / best.months;
      const currentMonthly = current.price / current.months;
      return currentMonthly < bestMonthly ? current : best;
    });
  };

  const bestValue = getBestValuePlan();

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

  const handleSubscribe = async () => {
    if (!selectedPrice || selectedPrice === 0) {
      toast.error("Subscription unavailable", {
        description: `This product is not available for a ${selectedDuration} month subscription.`,
      });
      return;
    }

    setIsSubscribing(true);
    try {
      // Simulate API call
      let user;
      if (selectedDuration == "three") {
        user = await subscribeToProduct(product.id, "THREE_MONTHS");
      }
      if (selectedDuration == "six") {
        user = await subscribeToProduct(product.id, "SIX_MONTHS");
      }
      if (selectedDuration == "twelve") {
        user = await subscribeToProduct(product.id, "TWELVE_MONTHS");
      }

      if (user?.errors?.general) {
        throw new Error(user.errors.general[0]);
      }

      console.log(
        `Subscribing to ${
          product.name
        } for ${selectedDuration} months at ${formattedPrice(selectedPrice)}`
      );

      toast.success("Subscription Added!", {
        description: `"${product.name}" for ${getDurationLabel(
          selectedDuration
        )} has been added to your cart.`,
      });
    } catch (error) {
      toast.error("Subscription failed", {
        description: `Warning: ${error}`,
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Product Image and Basic Info */}
      <div className="lg:col-span-1">
        <div className="relative w-full h-72 sm:h-96 md:h-64 lg:h-80 rounded-lg overflow-hidden border bg-gray-50 dark:bg-gray-900">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            style={{ objectFit: "contain" }}
            className="p-4"
          />
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="md:text-2xl sm:text-xl text-lg font-bold">
                {product.name}
              </h2>
              <p className="text-muted-foreground">{product.category}</p>
            </div>
            <Badge variant={statusVariant} className="capitalize">
              {product.status}
            </Badge>
          </div>

          {/* Rating placeholder - you can replace with actual rating */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-yellow-400 text-yellow-400"
              />
            ))}
            <span className="sm:text-sm text-xs text-muted-foreground ml-2">
              (4.8)
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="lg:col-span-2 space-y-6">
        {plan && availablePlans.length > 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="sm:text-xl text-lg font-semibold">
                  Choose Your Subscription
                </h3>
                <div className="flex items-center sm:text-sm text-xs text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  Cancel anytime
                </div>
              </div>

              <RadioGroup
                defaultValue={selectedDuration}
                onValueChange={(value: "three" | "six" | "twelve") =>
                  setSelectedDuration(value)
                }
                className="space-y-4"
              >
                {availablePlans.map(([duration, price]) => {
                  const months = getDurationMonths(duration);
                  const monthlyPrice = getMonthlyPrice(price as number, months);
                  const isBestValue = bestValue?.duration === duration;

                  return (
                    <div key={duration} className="relative">
                      {isBestValue && (
                        <div className="absolute -top-2 left-4 z-10">
                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                            Best Value
                          </Badge>
                        </div>
                      )}
                      <div
                        className={`flex items-center space-x-4 border rounded-lg sm:p-4 py-4 px-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${
                          isBestValue
                            ? "border-green-500 bg-green-50 dark:bg-green-950"
                            : ""
                        }`}
                      >
                        <RadioGroupItem value={duration} id={duration} />
                        <Label
                          htmlFor={duration}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex justify-between items-center w-full sm:space-x-3">
                            <div>
                              <span className="font-semibold sm:text-lg">
                                {getDurationLabel(duration)}
                              </span>
                              <p className="sm:text-sm text-xs text-muted-foreground">
                                {formattedPrice(monthlyPrice)}/month
                              </p>
                            </div>
                            <div></div>
                            <div className="text-right">
                              <p className="font-bold sm:text-lg">
                                {formattedPrice(price as number)}
                              </p>
                              <p className="sm:text-sm text-xs text-muted-foreground">
                                Total for {months} months
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>

              <Separator className="my-6" />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="md:text-2xl sm:text-xl text-lg font-bold">
                    {formattedPrice(selectedPrice)}
                  </p>
                  <p className="sm:text-sm text-xs text-muted-foreground">
                    {formattedPrice(
                      getMonthlyPrice(
                        selectedPrice,
                        getDurationMonths(selectedDuration)
                      )
                    )}
                    /month
                  </p>
                </div>

                <Button
                  className="w-full sm:w-auto min-w-[200px]"
                  onClick={handleSubscribe}
                  disabled={
                    !selectedPrice ||
                    selectedPrice === 0 ||
                    isSubscribing ||
                    isSubscribed
                  }
                  size="lg"
                >
                  {!loadingSubcription ? (
                    isSubscribing ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {isSubscribed ? "Subscribed" : "Subscribe Now"}
                      </>
                    )
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Loading...
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Free cancellation
                  </div>
                  <div className="flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    No hidden fees
                  </div>
                  <div className="flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    24/7 support
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="sm:text-lg font-semibold mb-2">
                  No Pricing Available
                </h3>
                <p>This product is currently not available for subscription.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="md:text-xl sm:text-lg font-semibold mb-3">
              About This Product
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {product.features && product.features.length > 0 && (
            <div>
              <h3 className="md:text-xl sm:text-lg font-semibold mb-3">What's Included</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plan && availablePlans.length > 0 && (
            <div>
              <h3 className="md:text-xl sm:text-lg font-semibold mb-3">
                Subscription Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-semibold mb-1">Flexible Terms</h4>
                  <p className="sm:text-sm text-xs text-muted-foreground">
                    Choose the perfect duration for your needs
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-semibold mb-1">Easy Management</h4>
                  <p className="sm:text-sm text-xs text-muted-foreground">
                    Cancel or modify anytime
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <h4 className="font-semibold mb-1">Premium Support</h4>
                  <p className="sm:text-sm text-xs text-muted-foreground">
                    24/7 customer service
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
