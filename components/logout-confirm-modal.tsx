"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth";

type LogoutConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LogoutConfirmModal({ open, onOpenChange }: LogoutConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm">
        <DialogTitle>Sign out</DialogTitle>
        <DialogDescription>
          Are you sure you want to sign out?
        </DialogDescription>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <form action={signOutAction} className="w-full sm:w-auto">
            <Button type="submit" className="w-full sm:w-auto">
              Sign out
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
