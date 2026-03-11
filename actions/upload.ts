"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import https from "node:https";
import { auth } from "@/auth";
import { randomUUID } from "crypto";

type UploadResult = { url: string } | { error: string };

/**
 * S3 client supports custom S3-compatible endpoints (e.g. DigitalOcean Spaces,
 * MinIO) via S3_ENDPOINT and S3_PUBLIC_URL. No AWS-specific URLs are hardcoded.
 * Set S3_INSECURE_SKIP_TLS_VERIFY=1 to allow self-signed certificates (e.g. local MinIO).
 */
function getS3Client() {
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const skipTlsVerify =
    process.env.S3_INSECURE_SKIP_TLS_VERIFY === "1" ||
    process.env.S3_INSECURE_SKIP_TLS_VERIFY === "true";

  const requestHandler = skipTlsVerify
    ? new NodeHttpHandler({
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      })
    : undefined;

  return new S3Client({
    ...(endpoint && {
      endpoint,
      forcePathStyle:
        endpoint.includes("localhost") || endpoint.includes("127.0.0.1"),
    }),
    region: process.env.S3_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    ...(requestHandler && { requestHandler }),
  });
}

/**
 * Uploads a base64-encoded image (data URL) to S3 (or S3-compatible storage).
 * Must be called from an authenticated session.
 * Returns the public object URL on success.
 */
export async function uploadPhoto(dataUrl: string): Promise<UploadResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bucket = process.env.S3_BUCKET?.trim();
  const publicBaseUrl = process.env.S3_PUBLIC_URL?.trim();

  if (!bucket || !publicBaseUrl) {
    return { error: "Image upload is not configured" };
  }

  // Parse the data URL — e.g. "data:image/jpeg;base64,/9j/4AAQ..."
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return { error: "Invalid image data" };

  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const key = `applicant-photos/${session.user.id}/${randomUUID()}.${ext}`;

  try {
    const client = getS3Client();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: "public-read",
        Metadata: {
          uploadedBy: session.user.id,
        },
      })
    );

    const base = publicBaseUrl.replace(/\/$/, "");
    const url = `${base}/${key}`;
    return { url };
  } catch (err) {
    console.error("S3 upload failed:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return { error: message };
  }
}
