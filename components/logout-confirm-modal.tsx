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
import { signOutAction } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

type LogoutConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function LogoutSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full sm:w-auto"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Signing out…
        </>
      ) : (
        "Sign out"
      )}
    </Button>
  );
}

export function LogoutConfirmModal({ open, onOpenChange }: LogoutConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-sm"
        aria-describedby="logout-description"
        aria-labelledby="logout-title"
      >
        <DialogHeader>
          <DialogTitle id="logout-title">Sign out</DialogTitle>
          <DialogDescription id="logout-description">
            Are you sure you want to sign out?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <form action={signOutAction} className="w-full sm:w-auto">
            <LogoutSubmitButton />
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
