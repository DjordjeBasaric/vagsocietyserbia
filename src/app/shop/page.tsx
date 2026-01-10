import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container } from "@/components/Container";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ShopClient, type ShopProduct } from "@/app/shop/ShopClient";

export const metadata: Metadata = {
  title: "Prodavnica",
  description:
    "Kupovina zvanicnih VagSocietySerbia proizvoda - odeca, aksesoari, nalepnice i jos.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const shopProducts: ShopProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    imageUrl: product.imageUrl,
    category: product.category,
  }));

  return (
    <div className="min-h-screen text-slate-900">
      <SiteHeader />
      <main className="py-16 pb-24 md:pb-0">
        <Container>
          <div className="space-y-4 text-left md:text-center">
            <p className="section-subtitle fade-up">Prodavnica</p>
            <h1 className="section-title fade-up delay-1">Zvanicni proizvodi</h1>
            <p className="fade-up delay-2 mx-auto max-w-2xl text-slate-600">
              Svaka kupovina podrzava klupske dogadjaje i buduce projekte.
              Placanje je trenutno manuelno, a siguran proces placanja stize uskoro.
            </p>
          </div>
          <div className="mt-10">
            <ShopClient products={shopProducts} />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
