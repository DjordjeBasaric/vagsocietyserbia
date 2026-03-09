/**
 * Cloudinary video URL helper
 * This file is safe to import in client components.
 *
 * Video source:
 * - Cloudinary, ako je cloud name postavljen (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ili CLOUDINARY_CLOUD_NAME)
 * - Lokalni fallback: /frontpage_video.mp4
 */

/**
 * Get frontpage hero video URL (Cloudinary or local).
 * Works on both server and client.
 */
export function getCloudinaryVideoUrl(
  publicId: string,
  options?: {
    width?: number;
    quality?: "auto" | number;
    format?: "mp4" | "webm";
  }
): string {
  const cloudName =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        process.env.CLOUDINARY_CLOUD_NAME
      : undefined;

  if (!cloudName) {
    return "/frontpage_video.mp4";
  }

  const transformations: string[] = [];

  if (options?.width) {
    transformations.push(`w_${options.width}`);
  }

  if (options?.quality) {
    transformations.push(`q_${options.quality}`);
  } else {
    transformations.push("q_auto");
  }

  if (options?.format) {
    transformations.push(`f_${options.format}`);
  }

  const transformationString =
    transformations.length > 0 ? transformations.join(",") + "/" : "";

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformationString}vagsocietyserbia/videos/${publicId}.mp4`;
}
