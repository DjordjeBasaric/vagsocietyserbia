/**
 * Cloudinary video URL helper
 * This file is safe to import in client components
 */

/**
 * Get optimized Cloudinary video URL with transformations
 * Works on both server and client
 */
export function getCloudinaryVideoUrl(publicId: string, options?: {
  width?: number;
  quality?: "auto" | number;
  format?: "mp4" | "webm";
}): string {
  // Video se učitava u browseru (client komponenta) → u buildu mora biti NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.
  // next.config na Vercelu prosleđuje CLOUDINARY_CLOUD_NAME u NEXT_PUBLIC_* pa jedan env var dovoljan.
  const cloudName = typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME)
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

  const transformationString = transformations.length > 0 
    ? transformations.join(",") + "/"
    : "";

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformationString}vagsocietyserbia/videos/${publicId}.mp4`;
}
