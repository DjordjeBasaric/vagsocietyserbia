"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LanguageProvider } from "@/lib/language-context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCloudinaryVideoUrl } from "@/lib/cloudinary-video";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isAdmin = pathname.startsWith("/admin");
  const preloadVideoRef = useRef<HTMLVideoElement | null>(null);

  // Preload video in background on all pages (except admin)
  useEffect(() => {
    if (isAdmin) return;

    const videoUrl = getCloudinaryVideoUrl("frontpage_video", {
      width: 1920,
      quality: "auto",
      format: "mp4",
    });

    // Create hidden video element to preload
    const video = document.createElement("video");
    video.src = videoUrl;
    video.preload = "auto";
    video.muted = true;
    video.style.display = "none";
    video.style.position = "absolute";
    video.style.width = "1px";
    video.style.height = "1px";
    video.style.opacity = "0";
    video.style.pointerEvents = "none";
    
    document.body.appendChild(video);
    preloadVideoRef.current = video;

    // Start loading video
    video.load();

    return () => {
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
    };
  }, [isAdmin]);

  return (
    <LanguageProvider>
      {isAdmin ? (
        <>{children}</>
      ) : (
        <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-black dark:text-white">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      )}
    </LanguageProvider>
  );
}

