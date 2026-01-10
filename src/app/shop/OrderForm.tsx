"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import type { Product } from "@prisma/client";
import { submitOrder, type OrderActionState } from "@/app/actions/order-actions";
import { formatPrice } from "@/lib/format";

const initialState: OrderActionState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="button-primary mt-4 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={pending}
    >
      {pending ? "Slanje..." : "Posalji narudzbinu"}
    </button>
  );
}

export function OrderForm({ product }: { product: Product }) {
  const [state, formAction] = React.useActionState(
    submitOrder,
    initialState
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="productId" value={product.id} />
      <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-slate-600">
        <p className="text-slate-900">Pregled narudzbine</p>
        <p>{product.name}</p>
        <p className="text-slate-900">{formatPrice(product.priceCents)}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="fullName"
          placeholder="Ime i prezime"
          className="field"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email adresa"
          className="field"
          required
        />
        <input
          name="phone"
          type="tel"
          placeholder="Telefon"
          className="field"
          required
        />
        <input
          name="shippingAddress"
          placeholder="Adresa za isporuku"
          className="field md:col-span-2"
          required
        />
      </div>
      {state.message ? <p className="feedback">{state.message}</p> : null}
      <SubmitButton />
    </form>
  );
}
