"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInCredentials } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Map auth error codes (from server action or URL) to user-facing messages */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  account_not_found: "Account not found.",
  incorrect_password: "Password incorrect.",
  account_suspended: "Account suspended.",
  email_not_verified:
    "Please verify your email before signing in. Check your inbox for the verification link.",
  CredentialsSignin: "Invalid email or password.",
  CredentialsCreate: "Could not create account. Please try again.",
  Callback: "Sign-in failed. Please try again.",
  OAuthAccountNotLinked:
    "This email is already linked to another sign-in method. Try signing in with that method.",
};

function getAuthErrorMessage(code: string | null): string {
  if (!code) return "Something went wrong. Please try again.";
  return AUTH_ERROR_MESSAGES[code] ?? "Invalid email or password.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const initialUrlCode = searchParams.get("code");
  const initialUrlError = searchParams.get("error");
  const initialUrlDescription = searchParams.get("errorDescription");
  const initialError = initialUrlCode
    ? getAuthErrorMessage(initialUrlCode)
    : initialUrlError
    ? initialUrlDescription ?? getAuthErrorMessage(initialUrlError)
    : null;
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const result = await signInCredentials(email, password);
    if (!result.success) {
      setErrorMessage(getAuthErrorMessage(result.errorCode));
      setLoading(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => signIn("google", { callbackUrl })}
          >
            Google
          </Button>
        </div>
      </form>

      <Dialog open={!!errorMessage} onOpenChange={(open) => !open && setErrorMessage(null)}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Sign-in error</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setErrorMessage(null)}
            >
              Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
