"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateProfile } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

export function CompleteProfileForm({
  defaultName,
  defaultPhone,
  defaultGuardianFullName = "",
  defaultResidence = "",
  defaultOccupation = "",
  defaultGuardianPhone = "",
  defaultGuardianEmail = "",
  defaultMotherPhone = "",
}: {
  defaultName: string;
  defaultPhone: string;
  defaultGuardianFullName?: string;
  defaultResidence?: string;
  defaultOccupation?: string;
  defaultGuardianPhone?: string;
  defaultGuardianEmail?: string;
  defaultMotherPhone?: string;
}) {
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
      const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
      const phone = (form.elements.namedItem("phone") as HTMLInputElement).value.trim();
      if (!name || !phone) {
        setError("Full name and phone number are required.");
        return;
      }
      const result = await updateProfile({
        name,
        phone,
        guardianFullName:
          (form.elements.namedItem("guardianFullName") as HTMLInputElement)?.value?.trim() ?? "",
        residence:
          (form.elements.namedItem("residence") as HTMLInputElement)?.value?.trim() ?? "",
        occupation:
          (form.elements.namedItem("occupation") as HTMLInputElement)?.value?.trim() ?? "",
        guardianPhone:
          (form.elements.namedItem("guardianPhone") as HTMLInputElement)?.value?.trim() ?? "",
        guardianEmail:
          (form.elements.namedItem("guardianEmail") as HTMLInputElement)?.value?.trim() ?? "",
        motherPhone:
          (form.elements.namedItem("motherPhone") as HTMLInputElement)?.value?.trim() ?? "",
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      await updateSession({ user: { name, phone } });
      router.refresh();
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* ── Account info ─────────────────────────────────────────────────── */}
      <div className="space-y-1 pb-2">
        <h2 className="text-sm font-semibold text-foreground">
          Account Information
        </h2>
        <p className="text-xs text-muted-foreground">
          Your name as it will appear in the portal.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            defaultValue={defaultName}
            placeholder="Your full name"
            className="h-10"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            defaultValue={defaultPhone}
            placeholder="+234 800 000 0000"
            className="h-10"
          />
        </div>
      </div>

      {/* ── Guardian info ─────────────────────────────────────────────────── */}
      <div className="space-y-4 border-t border-border pt-6">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            Parent / Guardian Information
          </h2>
          <p className="text-xs text-muted-foreground">
            Required for application processing and communication.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Full name — full width */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="guardianFullName">
              Father&apos;s / Guardian&apos;s Full Name
            </Label>
            <Input
              id="guardianFullName"
              name="guardianFullName"
              type="text"
              autoComplete="name"
              defaultValue={defaultGuardianFullName}
              placeholder="Full name"
              className="h-10"
            />
          </div>

          {/* Residence — full width */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="residence">Home Address</Label>
            <Input
              id="residence"
              name="residence"
              type="text"
              autoComplete="street-address"
              defaultValue={defaultResidence}
              placeholder="Full home address"
              className="h-10"
            />
          </div>

          {/* Occupation */}
          <div className="space-y-1.5">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              name="occupation"
              type="text"
              defaultValue={defaultOccupation}
              placeholder="Occupation"
              className="h-10"
            />
          </div>

          {/* Guardian phone */}
          <div className="space-y-1.5">
            <Label htmlFor="guardianPhone">
              Father&apos;s / Guardian&apos;s Phone
            </Label>
            <Input
              id="guardianPhone"
              name="guardianPhone"
              type="tel"
              autoComplete="tel"
              defaultValue={defaultGuardianPhone}
              placeholder="+234 800 000 0000"
              className="h-10"
            />
          </div>

          {/* Guardian email */}
          <div className="space-y-1.5">
            <Label htmlFor="guardianEmail">
              Father&apos;s / Guardian&apos;s Email
            </Label>
            <Input
              id="guardianEmail"
              name="guardianEmail"
              type="email"
              autoComplete="email"
              defaultValue={defaultGuardianEmail}
              placeholder="email@example.com"
              className="h-10"
            />
          </div>

          {/* Mother phone */}
          <div className="space-y-1.5">
            <Label htmlFor="motherPhone">Mother&apos;s Phone Number</Label>
            <Input
              id="motherPhone"
              name="motherPhone"
              type="tel"
              autoComplete="tel"
              defaultValue={defaultMotherPhone}
              placeholder="+234 800 000 0000"
              className="h-10"
            />
          </div>
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
