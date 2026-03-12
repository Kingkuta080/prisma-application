"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateProfile } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

type CompleteProfileFormProps = {
  defaultName?: string;
  defaultPhone?: string;
};

export function CompleteProfileForm({ defaultName = "", defaultPhone = "" }: CompleteProfileFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = e.currentTarget;
      const name = (form.elements.namedItem("name") as HTMLInputElement)?.value?.trim() ?? "";
      const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value?.trim() ?? "";
      const result = await updateProfile({
        name,
        phone,
        residence:
          (form.elements.namedItem("residence") as HTMLInputElement)?.value?.trim() ?? "",
        occupation:
          (form.elements.namedItem("occupation") as HTMLInputElement)?.value?.trim() ?? "",
        guardianEmail:
          (form.elements.namedItem("guardianEmail") as HTMLInputElement)?.value?.trim() ?? "",
        motherPhone:
          (form.elements.namedItem("motherPhone") as HTMLInputElement)?.value?.trim() ?? "",
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.user) {
        await updateSession({ user: { name: result.user.name, phone: result.user.phone } });
      }
      router.refresh();
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* ── Your contact (optional) ──────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
          Guardian Information
          </h2>
          <p className="text-xs text-muted-foreground">
            Full name and phone help us reach you; both are optional here.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              defaultValue={defaultName}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number 1</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="080********"
              defaultValue={defaultPhone}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="motherPhone">Phone number 2 (Optional)</Label>
            <Input
              id="motherPhone"
              name="motherPhone"
              type="tel"
              autoComplete="tel"
              placeholder="080********"
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* ── Guardian info ─────────────────────────────────────────────────── */}
        {/* <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            Guardian Information
          </h2>
        </div> */}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="residence">Home Address</Label>
            <Input
              id="residence"
              name="residence"
              type="text"
              autoComplete="street-address"
              placeholder="Full home address"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              name="occupation"
              type="text"
              placeholder="Occupation"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guardianEmail">
              Guardian&apos;s Email
            </Label>
            <Input
              id="guardianEmail"
              name="guardianEmail"
              type="email"
              autoComplete="email"
              placeholder="email@example.com"
              className="h-10"
            />
          </div>
        </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <Button type="submit" className="w-full gap-2 font-semibold" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save & Continue"
        )}
      </Button>
    </form>
  );
}
