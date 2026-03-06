"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type GlobalErrorModalProps = {
  open: boolean;
  message: string;
  onRetry: () => void;
  onCancel: () => void;
};

export function GlobalErrorModal({
  open,
  message,
  onRetry,
  onCancel,
}: GlobalErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-md sm:w-full"
        aria-describedby="global-error-description"
        aria-labelledby="global-error-title"
      >
        <DialogHeader>
          <DialogTitle id="global-error-title">Something went wrong</DialogTitle>
          <DialogDescription id="global-error-description">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={onRetry} className="w-full sm:w-auto">
            Retry Again
          </Button>
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
