/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { formatPrice } from "@/lib/format";
import {
  submitCartOrder,
  type CartActionState,
} from "@/app/actions/cart-actions";

export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  category: "APPAREL" | "ACCESSORIES" | "STICKERS";
};

type CartItem = {
  productId: string;
  quantity: number;
};

type CategoryFilter = ShopProduct["category"];

const categories: { key: CategoryFilter; label: string }[] = [
  { key: "APPAREL", label: "Odeca" },
  { key: "ACCESSORIES", label: "Aksesoari" },
  { key: "STICKERS", label: "Nalepnice" },
];
const defaultCategory = categories[0]?.key ?? "APPAREL";

const initialState: CartActionState = { ok: false, message: "" };

function CheckoutButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending || disabled}
    >
      {pending ? "Obrada..." : "Posalji narudzbinu"}
    </button>
  );
}

export function ShopClient({ products }: { products: ShopProduct[] }) {
  const [category, setCategory] = React.useState<CategoryFilter>(defaultCategory);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = React.useState(false);
  const [state, formAction] = React.useActionState(
    submitCartOrder,
    initialState
  );

  const productMap = React.useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const cartItems = React.useMemo(() => {
    return cart
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return {
          ...item,
          product,
          lineTotalCents: product.priceCents * item.quantity,
        };
      })
      .filter(Boolean) as Array<
      CartItem & { product: ShopProduct; lineTotalCents: number }
    >;
  }, [cart, productMap]);

  const totalCents = cartItems.reduce(
    (sum, item) => sum + item.lineTotalCents,
    0
  );

  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      if (product.category !== category) return false;
      return true;
    });
  }, [products, category]);

  const groupedProducts = React.useMemo(() => {
    return [
      {
        key: category,
        label: categories.find((item) => item.key === category)?.label || "",
        items: filteredProducts,
      },
    ];
  }, [filteredProducts, category]);

  React.useEffect(() => {
    const stored = window.localStorage.getItem("vss-cart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartItem[];
        setCart(parsed);
      } catch {
        setCart([]);
      }
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem("vss-cart", JSON.stringify(cart));
  }, [cart]);

  React.useEffect(() => {
    if (state.ok) {
      setCart([]);
      window.localStorage.removeItem("vss-cart");
    }
  }, [state.ok]);

  React.useEffect(() => {
    if (!isCartOpen) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCartOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isCartOpen]);

  function addToCart(productId: string) {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, nextQuantity: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, Math.min(nextQuantity, 10)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setCategory(item.key)}
              className={
                item.key === category
                  ? "rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
                  : "rounded-full border border-black/10 px-4 py-2 text-sm text-slate-600"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Prikazano {filteredProducts.length} od {products.length} proizvoda
        </span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-10 text-center">
          <p className="text-lg text-slate-900">Nema pronadjenih proizvoda.</p>
          <p className="mt-2 text-sm text-slate-500">
            Probaj drugu pretragu ili kategoriju.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedProducts.map((group) => (
            <section key={group.key} className="space-y-6">
              <div>
                <p className="section-subtitle">Kategorija</p>
                <h2 className="section-title">{group.label}</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((product) => (
                  <div
                    key={product.id}
                    className="glass-panel flex h-full flex-col overflow-hidden rounded-3xl"
                  >
                    <div className="border-b border-black/10 bg-white">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-56 w-full object-cover"
                      />
                    </div>
                    <div className="flex h-full flex-col gap-4 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {product.name}
                          </p>
                          <p className="mt-1 text-lg text-slate-600">
                            {formatPrice(product.priceCents)}
                          </p>
                        </div>
                        <span className="chip">{group.label}</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {product.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => addToCart(product.id)}
                        className="button-primary mt-auto w-full"
                      >
                        Dodaj u korpu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-24 right-6 z-40 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black hover:border hover:border-black/20 md:bottom-6"
      >
        Korpa ({cart.reduce((sum, item) => sum + item.quantity, 0)})
      </button>

      {isCartOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="ml-auto flex h-full w-full max-w-md flex-col bg-white p-6 md:rounded-l-3xl md:border-l md:border-black/10"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="section-subtitle">Vasa korpa</p>
                <h2 className="text-2xl text-slate-900">Pregled narudzbine</h2>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="button-ghost"
              >
                Zatvori
              </button>
            </div>

            <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-2">
              {cartItems.length === 0 ? (
                <div className="rounded-3xl border border-black/10 bg-white p-6 text-sm text-slate-600">
                  Korpa je prazna. Dodajte proizvode da nastavite.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 rounded-3xl border border-black/10 bg-white p-4"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatPrice(item.product.priceCents)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="rounded-full border border-black/10 px-3 py-1 text-sm"
                        >
                          -
                        </button>
                        <span className="text-sm text-slate-600">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="rounded-full border border-black/10 px-3 py-1 text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {formatPrice(item.lineTotalCents)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="mt-2 text-xs text-slate-400"
                      >
                        Ukloni
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-black/10 bg-white p-6">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Medjuzbir</span>
                <span>{formatPrice(totalCents)}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Instrukcije za isporuku i placanje saljemo emailom.
              </p>
            </div>

            <form action={formAction} className="mt-6 space-y-4">
              <input type="hidden" name="cart" value={JSON.stringify(cart)} />
              <div className="relative">
                <input
                  id="checkout-fullName"
                  name="fullName"
                  className="field peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="checkout-fullName"
                  className="pointer-events-none absolute left-4 top-3 bg-white px-1 text-sm text-slate-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-slate-500"
                >
                  Ime i prezime
                </label>
              </div>
              <div className="relative">
                <input
                  id="checkout-email"
                  name="email"
                  type="email"
                  className="field peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="checkout-email"
                  className="pointer-events-none absolute left-4 top-3 bg-white px-1 text-sm text-slate-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-slate-500"
                >
                  Email adresa
                </label>
              </div>
              <div className="relative">
                <input
                  id="checkout-phone"
                  name="phone"
                  type="tel"
                  className="field peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="checkout-phone"
                  className="pointer-events-none absolute left-4 top-3 bg-white px-1 text-sm text-slate-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-slate-500"
                >
                  Telefon
                </label>
              </div>
              <div className="relative">
                <input
                  id="checkout-shipping"
                  name="shippingAddress"
                  className="field peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="checkout-shipping"
                  className="pointer-events-none absolute left-4 top-3 bg-white px-1 text-sm text-slate-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-slate-500"
                >
                  Adresa za isporuku
                </label>
              </div>
              {state.message ? (
                <p className="feedback">{state.message}</p>
              ) : null}
              <CheckoutButton disabled={cartItems.length === 0} />
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
