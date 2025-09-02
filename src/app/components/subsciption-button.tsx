"use client";

import React, { useActionState, useEffect, useState } from "react";
import {
  subscribeToProduct,
  SubscriptionState,
} from "../server/subscription/subcription";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { PlanType, SubscriptionStatus } from "@/app/generated/prisma";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SubscriptionButtonProps {
  productId: number;
  productName: string;
  subscriptionPlans: {
    three: number | null;
    six: number | null;
    twelve: number | null;
  };
  subscription?: {
    id: string;
    status: SubscriptionStatus;
    planType: PlanType;
    startDate: string;
    endDate: string;
    amount: number;
  } | null;
}

const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  productId,
  subscriptionPlans,
  subscription,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("THREE_MONTHS");
  const [state, formAction, isPending] = useActionState(
    (prevState: SubscriptionState, formData: FormData) => {
      const planType = formData.get("planType") as PlanType;
      return subscribeToProduct(productId, planType);
    },
    {}
  );

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (state.success || state.errors) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const getSubscriptionStatus = () => {
    if (!subscription) return "not_subscribed";

    const now = new Date();
    const endDate = new Date(subscription.endDate);

    if (subscription.status === "ACTIVE" && endDate > now) {
      return "active";
    } else if (subscription.status === "ACTIVE" && endDate <= now) {
      return "expired";
    } else {
      return "cancelled";
    }
  };

  const subscriptionStatus = getSubscriptionStatus();

  const handleSubscribe = (planType: PlanType) => {
    const formData = new FormData();
    formData.append("planType", planType);
    formAction(formData);
  };

  const getPlanPrice = (planType: PlanType) => {
    switch (planType) {
      case "THREE_MONTHS":
        return subscriptionPlans.three;
      case "SIX_MONTHS":
        return subscriptionPlans.six;
      case "TWELVE_MONTHS":
        return subscriptionPlans.twelve;
      default:
        return null;
    }
  };

  const getPlanDisplay = (planType: PlanType) => {
    switch (planType) {
      case "THREE_MONTHS":
        return "3 Months";
      case "SIX_MONTHS":
        return "6 Months";
      case "TWELVE_MONTHS":
        return "12 Months";
      default:
        return "";
    }
  };

  const renderButton = () => {
    switch (subscriptionStatus) {
      case "active":
        return (
          <div className="space-y-3">
            <Button disabled className="w-full">
              <CheckCircle className="w-4 h-4 mr-2" />
              Subscribed ({getPlanDisplay(subscription!.planType)})
            </Button>
            <div className="text-xs text-center space-y-1">
              <p className="text-muted-foreground">
                <Calendar className="w-3 h-3 inline mr-1" />
                Valid until{" "}
                {new Date(subscription!.endDate).toLocaleDateString()}
              </p>
              <p className="text-green-600">
                <DollarSign className="w-3 h-3 inline mr-1" />
                Paid: ${subscription!.amount}
              </p>
            </div>
          </div>
        );

      case "expired":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {subscriptionPlans.three && (
                <Button
                  variant="destructive"
                  onClick={() => handleSubscribe("THREE_MONTHS")}
                  disabled={isPending}
                  className="w-full text-xs"
                >
                  {isPending
                    ? "Renewing..."
                    : `Renew 3 Months - $${subscriptionPlans.three}`}
                </Button>
              )}
              {subscriptionPlans.six && (
                <Button
                  variant="destructive"
                  onClick={() => handleSubscribe("SIX_MONTHS")}
                  disabled={isPending}
                  className="w-full text-xs"
                >
                  {isPending
                    ? "Renewing..."
                    : `Renew 6 Months - $${subscriptionPlans.six}`}
                </Button>
              )}
              {subscriptionPlans.twelve && (
                <Button
                  variant="destructive"
                  onClick={() => handleSubscribe("TWELVE_MONTHS")}
                  disabled={isPending}
                  className="w-full text-xs"
                >
                  {isPending
                    ? "Renewing..."
                    : `Renew 12 Months - $${subscriptionPlans.twelve}`}
                </Button>
              )}
            </div>
            <p className="text-xs text-red-600 text-center">
              <Clock className="w-3 h-3 inline mr-1" />
              Expired on {new Date(subscription!.endDate).toLocaleDateString()}
            </p>
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {subscriptionPlans.three && (
                <Button
                  variant="default"
                  onClick={() => handleSubscribe("THREE_MONTHS")}
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs"
                >
                  {isPending ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Subscribing...
                    </>
                  ) : (
                    `3 Months - $${subscriptionPlans.three}`
                  )}
                </Button>
              )}
              {subscriptionPlans.six && (
                <Button
                  variant="default"
                  onClick={() => handleSubscribe("SIX_MONTHS")}
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-xs"
                >
                  {isPending ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Subscribing...
                    </>
                  ) : (
                    `6 Months - $${subscriptionPlans.six}`
                  )}
                </Button>
              )}
              {subscriptionPlans.twelve && (
                <Button
                  variant="default"
                  onClick={() => handleSubscribe("TWELVE_MONTHS")}
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs"
                >
                  {isPending ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Subscribing...
                    </>
                  ) : (
                    `12 Months - $${subscriptionPlans.twelve}`
                  )}
                </Button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {showAlert && (state.success || state.errors) && (
        <Alert variant={state.success ? "default" : "destructive"}>
          <AlertDescription>
            {state.success ? state.message : state.errors?.general?.[0]}
          </AlertDescription>
        </Alert>
      )}
      {renderButton()}
    </div>
  );
};

export default SubscriptionButton;
