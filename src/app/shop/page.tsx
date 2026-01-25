import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ShopPageClient } from "@/app/shop/page-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("vss-language")?.value === "en" ? "en" : "sr";
  return lang === "en"
    ? {
        title: "Shop",
        description:
          "Official VagSocietySerbia products and gear — apparel, accessories, stickers and more.",
      }
    : {
        title: "Prodavnica",
        description:
          "Kupovina zvaničnih VagSocietySerbia proizvoda - odeća, aksesoari, nalepnice i još.",
      };
}

export default function ShopPage() {
  return <ShopPageClient />;
}
