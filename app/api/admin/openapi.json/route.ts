import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/swagger-spec";
import { getAppBaseUrl } from "@/lib/school-config";

export function GET(request: Request) {
  const spec = { ...openApiSpec };
  const url = request.url ? new URL(request.url) : null;
  const origin =
    (url?.origin ?? getAppBaseUrl()) || process.env.NEXT_PUBLIC_APP_URL || "";
  if (origin) {
    spec.servers = [
      { url: `${origin.replace(/\/$/, "")}/api/admin`, description: "Current host" },
      { url: "/api/admin", description: "Relative" },
    ];
  }
  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
