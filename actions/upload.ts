"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { randomUUID } from "crypto";

type UploadResult = { url: string } | { error: string };

function getS3Client() {
  return new S3Client({
    // Region is required by the SDK but ignored for many S3-compatible providers.
    // A default is fine when using a custom endpoint.
    region: "us-east-1",
    endpoint: process.env.S3_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * Uploads a base64-encoded image (data URL) to AWS S3.
 * Must be called from an authenticated session.
 * Returns the public S3 object URL on success.
 */
export async function uploadPhoto(dataUrl: string): Promise<UploadResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bucket = process.env.S3_BUCKET?.trim();
  const publicUrlBase = process.env.S3_PUBLIC_URL?.trim();

  if (!bucket || !publicUrlBase) {
    return { error: "Image upload is not configured" };
  }

  // Parse the data URL — e.g. "data:image/jpeg;base64,/9j/4AAQ..."
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return { error: "Invalid image data" };

  const mimeType = match[1];           // e.g. "image/jpeg"
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  // Derive a file extension from the MIME type
  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";

  // Unique key per upload: applicant-photos/<userId>/<uuid>.<ext>
  const key = `applicant-photos/${session.user.id}/${randomUUID()}.${ext}`;

  try {
    const client = getS3Client();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        // Make the object publicly readable (suitable for a public bucket)
        ACL: "public-read",
        Metadata: {
          uploadedBy: session.user.id,
        },
      })
    );

    // Public URL is derived from the configured base, which supports any
    // S3-compatible provider (AWS, MinIO, DigitalOcean Spaces, etc.).
    const normalizedBase = publicUrlBase.replace(/\/+$/, "");
    const url = `${normalizedBase}/${key}`;
    return { url };
  } catch (err) {
    console.error("S3 upload failed:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return { error: message };
  }
}
