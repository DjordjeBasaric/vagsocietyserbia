/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { deleteProduct, updateProduct } from "@/app/actions/product-actions";
import { AdminShell } from "@/app/admin/AdminShell";
import { ProductCreateForm } from "@/app/admin/ProductCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      title="Odrzavanje proizvoda"
      subtitle="Kreiraj i uredi proizvode u prodavnici"
      active="products"
    >
      <section className="glass-panel rounded-3xl p-8">
        <h2 className="text-2xl text-slate-900">Novi proizvod</h2>
        <ProductCreateForm />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl text-slate-900">Postojeci proizvodi</h2>
        <div className="mt-6 grid gap-6">
          {products.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-slate-600">
              Nema proizvoda.
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="glass-panel rounded-3xl p-6"
              >
                <div className="grid gap-6 lg:grid-cols-[0.6fr_1.4fr]">
                  <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="grid gap-4">
                    <form action={updateProduct} className="grid gap-4">
                      <input
                        type="hidden"
                        name="productId"
                        value={product.id}
                      />
                      <input
                        name="name"
                        defaultValue={product.name}
                        className="field"
                      />
                      <input
                        name="price"
                        defaultValue={(product.priceCents / 100).toFixed(2)}
                        className="field"
                      />
                      <select
                        name="category"
                        defaultValue={product.category}
                        className="field"
                        required
                      >
                        <option value="APPAREL">Odeca</option>
                        <option value="ACCESSORIES">Aksesoari</option>
                        <option value="STICKERS">Nalepnice</option>
                      </select>
                      <input
                        name="imageUrl"
                        defaultValue={product.imageUrl}
                        className="field"
                      />
                      <textarea
                        name="description"
                        defaultValue={product.description}
                        className="textarea h-28"
                      />
                      <label className="flex items-center gap-3 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked={product.isActive}
                          className="h-4 w-4"
                        />
                        Aktivan proizvod
                      </label>
                      <button type="submit" className="button-outline w-fit">
                        Azuriraj
                      </button>
                    </form>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <form action={deleteProduct}>
                        <input
                          type="hidden"
                          name="productId"
                          value={product.id}
                        />
                        <button type="submit" className="button-ghost">
                          Obrisi
                        </button>
                      </form>
                      <span>Trenutna cena: {formatPrice(product.priceCents)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AdminShell>
  );
}
