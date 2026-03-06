"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "portal-guidelines-seen";

type PortalGuidelinesModalProps = {
  amount: number;
  currency?: string;
};

export function PortalGuidelinesModal({
  amount,
  currency = "₦",
}: PortalGuidelinesModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, []);

  function dismiss() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent
        showCloseButton
        className="w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto sm:max-w-md"
        aria-describedby="guidelines-description"
        aria-labelledby="guidelines-title"
      >
        <DialogHeader>
          <DialogTitle id="guidelines-title">Application Guidelines</DialogTitle>
          <DialogDescription id="guidelines-description" asChild>
            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              <p>Fee: {currency}{amount.toLocaleString("en-NG")}</p>
              <ul className="list-inside list-disc space-y-1.5">
                <li>Submit one application per child for the selected enrollment session.</li>
                <li>Ensure all personal details are accurate before submitting — changes may require re-application.</li>
                <li>Payment of the application fee is required to complete and confirm your submission.</li>
                <li>Once paid, download your receipt from your dashboard.</li>
                <li>Admission letters will be available when decisions are released.</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={dismiss} className="w-full sm:w-auto">
            I Understand
          </Button>
          <Button variant="outline" onClick={dismiss} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
