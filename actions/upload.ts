"use server";

import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type UploadResult = { url: string } | { error: string };

/**
 * Uploads a base64-encoded image (data URL) to Cloudinary.
 * Must be called from an authenticated session.
 * Returns the secure Cloudinary URL on success.
 */
export async function uploadPhoto(dataUrl: string): Promise<UploadResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  if (!process.env.CLOUDINARY_CLOUD_NAME?.trim()) {
    return { error: "Image upload is not configured" };
  }

  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "applicant-photos",
      resource_type: "image",
      // Auto-select best format (webp where supported)
      fetch_format: "auto",
      quality: "auto:good",
      // Crop tightly around face for passport-style photos
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" },
      ],
    });

    return { url: result.secure_url };
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return { error: message };
  }
}
