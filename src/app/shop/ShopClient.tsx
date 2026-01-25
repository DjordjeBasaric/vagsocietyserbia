/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { formatPrice } from "@/lib/format";
import {
  submitCartOrder,
  type CartActionState,
} from "@/app/actions/cart-actions";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

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

function getCategories(lang: "sr" | "en"): { key: CategoryFilter; label: string }[] {
  return [
    { key: "APPAREL", label: t("shop.categories.APPAREL", lang) },
    { key: "ACCESSORIES", label: t("shop.categories.ACCESSORIES", lang) },
    { key: "STICKERS", label: t("shop.categories.STICKERS", lang) },
  ];
}
const defaultCategory: CategoryFilter = "APPAREL";

const initialState: CartActionState = { ok: false, message: "" };

function CheckoutButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending || disabled}
    >
      {pending ? "Obrada..." : "Pošalji narudžbinu"}
    </button>
  );
}

export function ShopClient({ products }: { products: ShopProduct[] }) {
  const { language } = useLanguage();
  const categories = React.useMemo(() => getCategories(language), [language]);
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
                  ? "rounded-full bg-black dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-black"
                  : "rounded-full border border-black/10 dark:border-white/10 px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          {t("shop.showingProducts", language, { showing: filteredProducts.length, total: products.length })}
        </span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-10 text-center">
          <p className="text-lg text-slate-900 dark:text-white">{t("shop.noProductsFound", language)}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("shop.tryDifferentSearch", language)}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedProducts.map((group) => (
            <section key={group.key} className="space-y-6">
              <div>
                <p className="section-subtitle">{t("shop.category", language)}</p>
                <h2 className="section-title">{group.label}</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((product) => (
                  <div
                    key={product.id}
                    className="glass-panel flex h-full flex-col overflow-hidden rounded-3xl"
                  >
                    <div className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-black">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-56 w-full object-cover"
                      />
                    </div>
                    <div className="flex h-full flex-col gap-4 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {product.name}
                          </p>
                          <p className="mt-1 text-lg text-slate-600 dark:text-slate-300">
                            {formatPrice(product.priceCents)}
                          </p>
                        </div>
                        <span className="chip">{group.label}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {product.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => addToCart(product.id)}
                        className="button-primary mt-auto w-full"
                      >
                        {t("shop.addToCart", language)}
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
        className="fixed bottom-24 right-6 z-40 rounded-full bg-black dark:bg-white px-5 py-3 text-sm font-medium text-white dark:text-black transition hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white hover:border hover:border-black/20 dark:hover:border-white/20 md:bottom-6"
      >
        Korpa ({cart.reduce((sum, item) => sum + item.quantity, 0)})
      </button>

      {isCartOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="ml-auto flex h-full w-full max-w-md flex-col bg-white dark:bg-black p-6 md:rounded-l-3xl md:border-l md:border-black/10 dark:md:border-white/10"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="section-subtitle">{t("shop.cartTitle", language)}</p>
                <h2 className="text-2xl text-slate-900 dark:text-white">{t("shop.cartReview", language)}</h2>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="button-ghost"
              >
                {t("shop.cartClose", language)}
              </button>
            </div>

            <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-2">
              {cartItems.length === 0 ? (
                <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-black p-6 text-sm text-slate-600 dark:text-slate-300">
                  {t("shop.cartEmpty", language)}
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-black p-4"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatPrice(item.product.priceCents)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-sm text-slate-900 dark:text-white"
                        >
                          -
                        </button>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-sm text-slate-900 dark:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatPrice(item.lineTotalCents)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="mt-2 text-xs text-slate-400 dark:text-slate-500"
                      >
                        {t("shop.remove", language)}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-black p-6">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Međuzbir</span>
                <span>{formatPrice(totalCents)}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Instrukcije za isporuku i plaćanje šaljemo emailom.
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
                  className="pointer-events-none absolute left-4 top-3 bg-white dark:bg-black px-1 text-sm text-slate-400 dark:text-slate-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-slate-500 dark:peer-focus:text-slate-400"
                >
                  {t("shop.orderForm.fields.fullName", language)}
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
                  className="pointer-events-none absolute left-4 top-3 bg-white dark:bg-black px-1 text-sm text-slate-400 dark:text-slate-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-slate-500 dark:peer-focus:text-slate-400"
                >
                  {t("shop.orderForm.fields.email", language)}
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
                  className="pointer-events-none absolute left-4 top-3 bg-white dark:bg-black px-1 text-sm text-slate-400 dark:text-slate-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-slate-500 dark:peer-focus:text-slate-400"
                >
                  {t("shop.orderForm.fields.phone", language)}
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
                  className="pointer-events-none absolute left-4 top-3 bg-white dark:bg-black px-1 text-sm text-slate-400 dark:text-slate-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-slate-500 dark:peer-focus:text-slate-400"
                >
                  {t("shop.orderForm.fields.shippingAddress", language)}
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
