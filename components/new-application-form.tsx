"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createApplication } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Session = {
  id: string;
  year: number;
  amount: number;
  availableClasses: string[];
};

export function NewApplicationForm({
  sessions,
}: {
  sessions: Session[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);
  const activeSessionId = sessions[0]?.id ?? "";
  const [selectedSessionId, setSelectedSessionId] = useState<string>(activeSessionId);

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId),
    [sessions, selectedSessionId]
  );
  const classOptions = useMemo(
    () => selectedSession?.availableClasses ?? [],
    [selectedSession]
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const sessionId = (form.elements.namedItem("sessionId") as HTMLSelectElement).value;
    const wardName = (form.elements.namedItem("wardName") as HTMLInputElement).value.trim();
    const wardDob = (form.elements.namedItem("wardDob") as HTMLInputElement).value;
    const wardGender = (form.elements.namedItem("wardGender") as HTMLSelectElement).value;
    const selectedClass = (form.elements.namedItem("class") as HTMLSelectElement)?.value?.trim() ?? "";
    if (!sessionId || !wardName || !wardDob || !wardGender) {
      setError("Please fill session and ward details.");
      setLoading(false);
      return;
    }
    if (!selectedClass && classOptions.length > 0) {
      setError("Please select a class.");
      setLoading(false);
      return;
    }
    if (classOptions.length === 0) {
      setError("No classes configured for this session. Please try another session.");
      setLoading(false);
      return;
    }
    const result = await createApplication(sessionId, wardName, wardDob, wardGender, selectedClass);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result?.applicationId) {
      setApplicationId(result.applicationId);
    }
    setLoading(false);
    toast.success("Application submitted");
    setCountdown(10);
    setShowSuccessDialog(true);
  }

  useEffect(() => {
    if (!showSuccessDialog || countdown <= 0) return;
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          setShowSuccessDialog(false);
          router.push("/");
          router.refresh();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [showSuccessDialog, router]);

  function handleNewApplication() {
    setShowSuccessDialog(false);
    router.push("/new-application");
    router.refresh();
  }

  function handlePayNow() {
    setShowSuccessDialog(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3">
            <div className="size-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground">Submitting application…</p>
          </div>
        </div>
      )}
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sessionId">Session</Label>
        <select
          id="sessionId"
          name="sessionId"
          required
          value={selectedSessionId}
          disabled
          aria-label="Application session"
          className="flex h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-1 text-sm shadow-sm cursor-not-allowed"
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              Year {s.year} (amount: ₦{s.amount})
            </option>
          ))}
        </select>
      </div>
      {selectedSessionId && (
        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          {classOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No classes configured for this session.
            </p>
          ) : (
            <select
              id="class"
              name="class"
              required
              aria-label="Class"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select class</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="wardName">Child name</Label>
        <Input
          id="wardName"
          name="wardName"
          type="text"
          required
          placeholder="Full name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wardDob">Date of birth</Label>
        <Input
          id="wardDob"
          name="wardDob"
          type="date"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wardGender">Gender</Label>
        <select
          id="wardGender"
          name="wardGender"
          required
          aria-label="Gender"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit application"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/">Cancel</Link>
        </Button>
      </div>
    </form>
    </div>

    <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Application submitted</DialogTitle>
          <DialogDescription>
            Your application was submitted successfully. You can start another application or go to your dashboard to pay.
          </DialogDescription>
          {countdown > 0 && (
            <p className="text-center text-sm font-medium tabular-nums text-muted-foreground pt-2">
              Redirecting in ({countdown}s)
            </p>
          )}
        </DialogHeader>
        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={handlePayNow}>
            Go to home
          </Button>
          <Button onClick={handleNewApplication}>
            New application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
