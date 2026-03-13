"use client";

import { useState, useEffect } from "react";
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
import { Eye, EyeOff, AlertCircle } from "lucide-react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  account_not_found: "No account found with this email address.",
  incorrect_password: "Incorrect password. Please try again.",
  account_suspended: "This account has been suspended.",
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
  const [showPassword, setShowPassword] = useState(false);

  const oneTimeToken = searchParams.get("oneTimeToken");
  const autoEmail = searchParams.get("email");
  const isAuto = searchParams.get("auto") === "1";

  useEffect(() => {
    if (!isAuto || !oneTimeToken?.trim() || !autoEmail?.trim()) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const result = await signIn("credentials", {
          email: autoEmail.trim().toLowerCase(),
          oneTimeToken: oneTimeToken.trim(),
          redirect: false,
        });
        if (cancelled) return;
        if (result?.ok) {
          router.push(callbackUrl);
          router.refresh();
        } else {
          setErrorMessage(
            "Sign-in link expired or invalid. Please sign in with your password."
          );
        }
      } catch {
        if (!cancelled)
          setErrorMessage(
            "Something went wrong. Please sign in with your password."
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuto, oneTimeToken, autoEmail, callbackUrl, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)
      ?.value.trim() ?? "";
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      ?.value.trim() ?? "";

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      setLoading(false);
      return;
    }

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
    <div className="space-y-5">
      {/* Google sign-in */}
      <Button
        type="button"
        variant="outline"
        className="w-full border-border bg-white font-medium hover:bg-muted/50"
        disabled={loading}
        onClick={() => signIn("google", { callbackUrl })}
      >
        <GoogleIcon className="mr-2.5 size-4 shrink-0" />
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Credentials form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="flex items-center gap-1 text-sm font-medium"
          >
            <span>Email address</span>
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="flex items-center gap-1 text-sm font-medium"
          >
            <span>Password</span>
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="h-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {/* Error dialog */}
      <Dialog
        open={!!errorMessage}
        onOpenChange={(open) => !open && setErrorMessage(null)}
      >
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-4 text-destructive" />
              Sign-in error
            </DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setErrorMessage(null)}>
              Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
