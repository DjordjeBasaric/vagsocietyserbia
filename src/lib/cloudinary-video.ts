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
  // Use CLOUDINARY_CLOUD_NAME (server-side) or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME (client-side)
  // On server, CLOUDINARY_CLOUD_NAME is available
  // On client, only NEXT_PUBLIC_* env vars are available
  const cloudName = typeof process !== "undefined" 
    ? (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
    : undefined;
    
  if (!cloudName) {
    // Fallback to local file if Cloudinary is not configured
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
