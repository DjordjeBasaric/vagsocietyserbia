"use server";

import { prisma } from "@/lib/db";
import { orderSchema } from "@/lib/validators";
import { sendEmail } from "@/lib/email";
import { formatPrice } from "@/lib/format";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type OrderActionState = {
  ok: boolean;
  message: string;
};

export async function submitOrder(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  try {
    const raw = {
      productId: String(formData.get("productId") || ""),
      fullName: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      shippingAddress: String(formData.get("shippingAddress") || ""),
    };

    const parsed = orderSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message || "Neispravni podaci.",
      };
    }

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
    });

    if (!product || !product.isActive) {
      return { ok: false, message: "Izabrani proizvod nije dostupan." };
    }

    const order = await prisma.order.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        shippingAddress: parsed.data.shippingAddress,
        productId: product.id,
        productNameSnapshot: product.name,
        unitPriceCents: product.priceCents,
        quantity: 1,
        status: "PENDING",
      },
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new Error("Nedostaje ADMIN_EMAIL konfiguracija");
    }

    const priceLabel = formatPrice(product.priceCents);

    await sendEmail({
      to: adminEmail,
      subject: `Nova narudžbina: ${product.name}`,
      text: `Nova narudžbina od ${order.fullName} (${order.email}). Proizvod: ${product.name} x1 (${priceLabel}). Adresa: ${order.shippingAddress}. Telefon: ${order.phone}.`,
      html: `
        <h2>Nova VagSocietySerbia narudžbina</h2>
        <p><strong>Kupac:</strong> ${order.fullName} (${order.email})</p>
        <p><strong>Proizvod:</strong> ${product.name} x1 (${priceLabel})</p>
        <p><strong>Telefon:</strong> ${order.phone}</p>
        <p><strong>Adresa:</strong> ${order.shippingAddress}</p>
        <p><strong>ID narudžbine:</strong> ${order.id}</p>
      `,
    });

    await sendEmail({
      to: order.email,
      subject: "Potvrda narudžbine - VagSocietySerbia",
      text: `Hvala ${order.fullName}! Primili smo vašu narudžbinu za ${product.name} x1. Kontaktiraćemo vas uskoro sa detaljima isporuke i plaćanja.`,
      html: `
        <h2>Hvala na narudžbini, ${order.fullName}!</h2>
        <p>Vaša narudžbina za <strong>${product.name} x1</strong> je potvrđena.</p>
        <p>Uskoro šaljemo detalje isporuke i plaćanja.</p>
        <p>ID narudžbine: ${order.id}</p>
      `,
    });

    revalidatePath("/shop");
    revalidatePath("/admin/orders");
    return {
      ok: true,
      message: "Narudžbina primljena! Proverite email za potvrdu.",
    };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Došlo je do greške. Pokušajte ponovo." };
  }
}

const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["PENDING", "DECLINED", "SHIPPED"]),
});

export async function updateOrderStatus(formData: FormData): Promise<void> {
  try {
    const parsed = orderStatusSchema.safeParse({
      orderId: String(formData.get("orderId") || ""),
      status: String(formData.get("status") || ""),
    });

    if (!parsed.success) {
      return;
    }

    await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: { status: parsed.data.status },
    });

    revalidatePath("/admin/orders");
  } catch (error) {
    console.error(error);
  }
}
