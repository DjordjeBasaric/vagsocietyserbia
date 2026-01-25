"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { cartOrderSchema } from "@/lib/validators";
import { sendEmail } from "@/lib/email";
import { formatPrice } from "@/lib/format";

export type CartActionState = {
  ok: boolean;
  message: string;
};

type CartItemInput = {
  productId: string;
  quantity: number;
};

function normalizeItems(items: CartItemInput[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    if (!item.productId || item.quantity <= 0) continue;
    const current = map.get(item.productId) ?? 0;
    map.set(item.productId, Math.min(current + item.quantity, 10));
  }
  return Array.from(map.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export async function submitCartOrder(
  _prevState: CartActionState,
  formData: FormData
): Promise<CartActionState> {
  try {
    const raw = {
      fullName: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      shippingAddress: String(formData.get("shippingAddress") || ""),
    };

    const cartJson = String(formData.get("cart") || "[]");
    let items: CartItemInput[] = [];
    try {
      items = JSON.parse(cartJson) as CartItemInput[];
    } catch {
      return { ok: false, message: "Podaci o korpi nisu ispravni." };
    }

    const normalizedItems = normalizeItems(items);
    const parsed = cartOrderSchema.safeParse({
      ...raw,
      items: normalizedItems,
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message || "Neispravni podaci.",
      };
    }

    const productIds = parsed.data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      return {
        ok: false,
        message: "Neki proizvodi više nisu dostupni. Osvežite stranicu.",
      };
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const lineItems = parsed.data.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error("Nedostaje proizvod");
      }
      return {
        product,
        quantity: item.quantity,
      };
    });

    const orders = await prisma.$transaction(
      lineItems.map((item) =>
        prisma.order.create({
          data: {
            fullName: parsed.data.fullName,
            email: parsed.data.email.toLowerCase(),
            phone: parsed.data.phone,
            shippingAddress: parsed.data.shippingAddress,
            productId: item.product.id,
            productNameSnapshot: item.product.name,
            unitPriceCents: item.product.priceCents,
            quantity: item.quantity,
            status: "PENDING",
          },
        })
      )
    );

    const totalCents = lineItems.reduce(
      (sum, item) => sum + item.product.priceCents * item.quantity,
      0
    );

    const linesText = lineItems
      .map(
        (item) =>
          `- ${item.product.name} x${item.quantity} (${formatPrice(
            item.product.priceCents
          )})`
      )
      .join("\n");

    const linesHtml = lineItems
      .map(
        (item) =>
          `<li>${item.product.name} x${item.quantity} (${formatPrice(
            item.product.priceCents
          )})</li>`
      )
      .join("");

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new Error("Nedostaje ADMIN_EMAIL konfiguracija");
    }

    await sendEmail({
      to: adminEmail,
      subject: `Nova narudžbina iz korpe od ${parsed.data.fullName}`,
      text: `Nova narudžbina iz korpe od ${parsed.data.fullName} (${parsed.data.email}).\n\nStavke:\n${linesText}\n\nUkupno: ${formatPrice(totalCents)}\nAdresa: ${parsed.data.shippingAddress}\nTelefon: ${parsed.data.phone}\nID narudžbina: ${orders
        .map((order) => order.id)
        .join(", ")}`,
      html: `
        <h2>Nova narudžbina iz korpe - VagSocietySerbia</h2>
        <p><strong>Kupac:</strong> ${parsed.data.fullName} (${parsed.data.email})</p>
        <ul>${linesHtml}</ul>
        <p><strong>Ukupno:</strong> ${formatPrice(totalCents)}</p>
        <p><strong>Telefon:</strong> ${parsed.data.phone}</p>
        <p><strong>Adresa:</strong> ${parsed.data.shippingAddress}</p>
        <p><strong>ID narudžbina:</strong> ${orders.map((order) => order.id).join(", ")}</p>
      `,
    });

    await sendEmail({
      to: parsed.data.email,
      subject: "Potvrda narudžbine - VagSocietySerbia",
      text: `Hvala ${parsed.data.fullName}! Primili smo vašu narudžbinu.\n\nStavke:\n${linesText}\n\nUkupno: ${formatPrice(
        totalCents
      )}\n\nKontaktiraćemo vas uskoro sa detaljima isporuke i plaćanja.`,
      html: `
        <h2>Hvala na narudžbini, ${parsed.data.fullName}!</h2>
        <p>Vaša narudžbina je potvrđena.</p>
        <ul>${linesHtml}</ul>
        <p><strong>Ukupno:</strong> ${formatPrice(totalCents)}</p>
        <p>Uskoro šaljemo detalje isporuke i plaćanja.</p>
      `,
    });

    revalidatePath("/shop");
    revalidatePath("/admin/orders");
    return { ok: true, message: "Narudžbina primljena! Proverite email." };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Ne možemo da obradimo narudžbinu." };
  }
}
