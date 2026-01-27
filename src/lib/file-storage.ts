import { mkdir, writeFile } from "fs/promises";
import crypto from "crypto";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudKey = process.env.CLOUDINARY_API_KEY;
const cloudSecret = process.env.CLOUDINARY_API_SECRET;
const cloudFolder = process.env.CLOUDINARY_FOLDER || "vagsocietyserbia/events";

export type StoredFile = {
  url: string;
  filename: string;
};

function hasCloudinaryConfig() {
  return Boolean(cloudName && cloudKey && cloudSecret);
}

function isSupportedImageForCompression(file: File) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  const isJpeg =
    type === "image/jpeg" ||
    type === "image/jpg" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg");
  const isPng = type === "image/png" || name.endsWith(".png");
  const isHeic =
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif");
  return isJpeg || isPng || isHeic;
}

async function compressForStorage(file: File): Promise<{ buffer: Buffer; filename: string; mime: string }> {
  const original = Buffer.from(await file.arrayBuffer());
  const safeBase = (file.name || "upload").replace(/[^a-zA-Z0-9.-]/g, "-");
  const baseNoExt = safeBase.replace(/\.[^.]+$/, "");

  // If we can't/shouldn't process it, keep original
  if (!isSupportedImageForCompression(file)) {
    return { buffer: original, filename: safeBase, mime: file.type || "application/octet-stream" };
  }

  try {
    const sharpMod: any = await import("sharp");
    const sharp = sharpMod?.default ?? sharpMod;

    const outBuffer: Buffer = await sharp(original, { failOn: "none" })
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    // If not smaller, keep original
    if (outBuffer.length >= original.length) {
      return { buffer: original, filename: safeBase, mime: file.type || "application/octet-stream" };
    }

    return { buffer: outBuffer, filename: `${baseNoExt || "upload"}.jpg`, mime: "image/jpeg" };
  } catch {
    return { buffer: original, filename: safeBase, mime: file.type || "application/octet-stream" };
  }
}

async function uploadToCloudinary(
  file: File,
  registrationId: string
): Promise<StoredFile> {
  if (!cloudName || !cloudKey || !cloudSecret) {
    throw new Error("Cloudinary config is missing");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `${cloudFolder}/${registrationId}`;
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${cloudSecret}`;
  const signature = crypto
    .createHash("sha1")
    .update(signatureBase)
    .digest("hex");

  const processed = await compressForStorage(file);
  // Next.js/TS: BlobPart typing doesn't accept Node Buffer<ArrayBufferLike>.
  // Copy into a Uint8Array backed by a plain ArrayBuffer.
  const bytes = Uint8Array.from(processed.buffer);
  const blob = new Blob([bytes], {
    type: processed.mime || "application/octet-stream",
  });

  const form = new FormData();
  form.append("file", blob, processed.filename || file.name || "upload");
  form.append("api_key", cloudKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: form,
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorBody}`);
  }

  const data = (await response.json()) as {
    secure_url: string;
    public_id: string;
  };

  return {
    url: data.secure_url,
    filename: data.public_id,
  };
}

export async function storeEventImages(
  files: File[],
  registrationId: string
): Promise<StoredFile[]> {
  if (!files.length) {
    return [];
  }

  if (hasCloudinaryConfig()) {
    const uploads = await Promise.all(
      files.map((file) => uploadToCloudinary(file, registrationId))
    );
    return uploads;
  }

  const eventDir = path.join(UPLOAD_ROOT, "events", registrationId);
  await mkdir(eventDir, { recursive: true });

  const stored: StoredFile[] = [];
  for (const file of files) {
    const processed = await compressForStorage(file);
    const filename = `${Date.now()}-${processed.filename}`;
    const filepath = path.join(eventDir, filename);
    await writeFile(filepath, processed.buffer);

    stored.push({
      url: `/uploads/events/${registrationId}/${filename}`,
      filename,
    });
  }

  return stored;
}

/**
 * Upload video file to Cloudinary
 * Returns the Cloudinary URL with optimizations
 */
export async function uploadVideoToCloudinary(
  filePath: string,
  publicId?: string
): Promise<string> {
  if (!hasCloudinaryConfig()) {
    throw new Error("Cloudinary config is missing");
  }

  const { readFile } = await import("fs/promises");
  const fileBuffer = await readFile(filePath);
  const fileName = path.basename(filePath);

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "vagsocietyserbia/videos";
  const finalPublicId = publicId || `frontpage_video`;
  const signatureBase = `folder=${folder}&public_id=${finalPublicId}&timestamp=${timestamp}${cloudSecret}`;
  const signature = crypto
    .createHash("sha1")
    .update(signatureBase)
    .digest("hex");

  const form = new FormData();
  form.append("file", new Blob([fileBuffer]), fileName);
  form.append("api_key", cloudKey!);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("public_id", finalPublicId);
  form.append("resource_type", "video");
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: "POST",
      body: form,
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Cloudinary video upload failed: ${errorBody}`);
  }

  const data = (await response.json()) as {
    secure_url: string;
    public_id: string;
  };

  return data.secure_url;
}

// getCloudinaryVideoUrl has been moved to cloudinary-video.ts to avoid client-side bundle issues with sharp
