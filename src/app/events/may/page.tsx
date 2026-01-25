import type { Metadata } from "next";
import { cookies } from "next/headers";
import { MayEventPageClient } from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("vss-language")?.value === "en" ? "en" : "sr";
  return lang === "en"
    ? {
        title: "Event registration",
        description:
          "Register for the VagSocietySerbia event in Belgrade (Kovilovo Resort). Spots are limited; vehicles are reviewed before confirmation.",
      }
    : {
        title: "Prijava za skup",
        description:
          "Prijava za VagSocietySerbia skup u Beogradu (Kovilovo Resort). Broj mesta je ograničen, vozila se pregledaju pre potvrde.",
      };
}

export default function MayEventPage() {
  return <MayEventPageClient />;
}
