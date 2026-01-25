import type { Metadata } from "next";
import { cookies } from "next/headers";
import { HomePageClient } from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("vss-language")?.value === "en" ? "en" : "sr";
  return lang === "en"
    ? {
        title: "Home",
        description:
          "Discover VagSocietySerbia — our story, gallery, and how to join upcoming club events.",
      }
    : {
        title: "Početna",
        description:
          "Upoznaj VagSocietySerbia – našu priču, galeriju i kako da se pridružiš narednim klupskim događajima.",
      };
}

export default function HomePage() {
  return <HomePageClient />;
}
