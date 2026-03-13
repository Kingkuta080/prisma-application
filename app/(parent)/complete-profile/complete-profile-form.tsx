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
      const residence =
        (form.elements.namedItem("residence") as HTMLInputElement)?.value?.trim() ?? "";
      const occupation =
        (form.elements.namedItem("occupation") as HTMLInputElement)?.value?.trim() ?? "";
      const guardianEmail =
        (form.elements.namedItem("guardianEmail") as HTMLInputElement)?.value?.trim() ?? "";
      const motherPhone =
        (form.elements.namedItem("motherPhone") as HTMLInputElement)?.value?.trim() ?? "";

      if (!name || !phone || !residence || !occupation || !guardianEmail) {
        setError("Please fill in all required fields before continuing.");
        setLoading(false);
        return;
      }

      const result = await updateProfile({
        name,
        phone,
        residence,
        occupation,
        guardianEmail,
        motherPhone,
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
      {/* ── Your contact details ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            Contact information
          </h2>
          <p className="text-xs text-muted-foreground">
            Fields marked with <span className="text-destructive">*</span> are required to
            continue.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label
              htmlFor="name"
              className="flex items-center gap-1 text-sm font-medium"
            >
              <span>Full name</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              defaultValue={defaultName}
              className="h-10"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="phone"
              className="flex items-center gap-1 text-sm font-medium"
            >
              <span>Phone number 1</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="080********"
              defaultValue={defaultPhone}
              className="h-10"
              required
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
            <Label
              htmlFor="residence"
              className="flex items-center gap-1 text-sm font-medium"
            >
              <span>Home Address</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="residence"
              name="residence"
              type="text"
              autoComplete="street-address"
              placeholder="Full home address"
              className="h-10"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="occupation"
              className="flex items-center gap-1 text-sm font-medium"
            >
              <span>Occupation</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="occupation"
              name="occupation"
              type="text"
              placeholder="Occupation"
              className="h-10"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="guardianEmail"
              className="flex items-center gap-1 text-sm font-medium"
            >
              <span>Guardian&apos;s Email</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guardianEmail"
              name="guardianEmail"
              type="email"
              autoComplete="email"
              placeholder="email@example.com"
              className="h-10"
              required
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
