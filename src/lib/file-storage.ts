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

  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = new Blob([buffer], {
    type: file.type || "application/octet-stream",
  });

  const form = new FormData();
  form.append("file", blob, file.name || "upload");
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
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const filename = `${Date.now()}-${safeName}`;
    const filepath = path.join(eventDir, filename);
    await writeFile(filepath, buffer);

    stored.push({
      url: `/uploads/events/${registrationId}/${filename}`,
      filename,
    });
  }

  return stored;
}
