"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PayNowButton({
  applicationId,
  amount,
}: {
  applicationId: string;
  amount: number;
}) {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    setLoading(true);
    // Navigate to the payment API route; stays "loading" until page unloads
    window.location.href = `/api/pay/${applicationId}`;
  }

  return (
    <Button
      size="lg"
      className="gap-2 font-semibold"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Redirecting to payment…
        </>
      ) : (
        <>
          <CreditCard className="size-4" />
          Pay ₦{amount.toLocaleString("en-NG")} Now
        </>
      )}
    </Button>
  );
}
