"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { eventRegistrationSchema } from "@/lib/validators";
import { storeEventImages } from "@/lib/file-storage";
import { sendEmail } from "@/lib/email";

export type RegistrationActionState = {
  ok: boolean;
  message: string;
};

export async function submitEventRegistration(
  _prevState: RegistrationActionState,
  formData: FormData
): Promise<RegistrationActionState> {
  try {
    const raw = {
      firstName: String(formData.get("firstName") || ""),
      lastName: String(formData.get("lastName") || ""),
      email: String(formData.get("email") || ""),
      carModel: String(formData.get("carModel") || ""),
      country: String(formData.get("country") || ""),
      city: String(formData.get("city") || ""),
      arrivingWithTrailer: formData.get("arrivingWithTrailer") === "on",
      additionalInfo: String(formData.get("additionalInfo") || ""),
    };

    const parsed = eventRegistrationSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.errors[0]?.message || "Neispravni podaci.",
      };
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email.toLowerCase(),
        carModel: parsed.data.carModel,
        country: parsed.data.country,
        city: parsed.data.city,
        arrivingWithTrailer: parsed.data.arrivingWithTrailer,
        additionalInfo: parsed.data.additionalInfo || "",
      },
    });

    const files = formData.getAll("carImages").filter((file) => {
      return file instanceof File && file.size > 0;
    }) as File[];

    const stored = await storeEventImages(files, registration.id);
    if (stored.length) {
      await prisma.carImage.createMany({
        data: stored.map((file) => ({
          url: file.url,
          registrationId: registration.id,
        })),
      });
    }

    await sendEmail({
      to: registration.email,
      subject: "Prijava primljena - VagSocietySerbia majski skup",
      text: `Zdravo ${registration.firstName}, prijava je primljena i ceka odobrenje. Obavesticemo vas kada bude potvrdjena.`,
      html: `
        <h2>Prijava primljena</h2>
        <p>Zdravo ${registration.firstName},</p>
        <p>Vasa prijava za majski skup je na cekanju. Javicemo se kada bude potvrdjena.</p>
      `,
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `Nova prijava za skup: ${registration.firstName} ${registration.lastName}`,
        text: `Nova prijava od ${registration.firstName} ${registration.lastName} (${registration.email}). Auto: ${registration.carModel}.`,
        html: `
          <h2>Nova prijava za skup</h2>
          <p><strong>Ime:</strong> ${registration.firstName} ${registration.lastName}</p>
          <p><strong>Email:</strong> ${registration.email}</p>
          <p><strong>Auto:</strong> ${registration.carModel}</p>
          <p><strong>Lokacija:</strong> ${registration.city}, ${registration.country}</p>
          <p><strong>Prikolica:</strong> ${registration.arrivingWithTrailer ? "Da" : "Ne"}</p>
        `,
      });
    }

    revalidatePath("/events/may");
    return {
      ok: true,
      message: "Prijava poslata! Dobicete email kada bude odobrena.",
    };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Nije moguce poslati prijavu." };
  }
}

export async function approveRegistration(formData: FormData) {
  try {
    const id = String(formData.get("registrationId") || "");
    if (!id) {
      return { ok: false };
    }

    const registration = await prisma.eventRegistration.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    await sendEmail({
      to: registration.email,
      subject: "Prijava odobrena - VagSocietySerbia majski skup",
      text: `Zdravo ${registration.firstName}, vasa prijava je odobrena. Vidimo se na skupu!`,
      html: `
        <h2>Prijava odobrena</h2>
        <p>Zdravo ${registration.firstName},</p>
        <p>Vasa prijava za majski skup je odobrena. Vidimo se uskoro!</p>
      `,
    });

    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
}
