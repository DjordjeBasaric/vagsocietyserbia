import { prisma } from "@/lib/db";
import { approveRegistration, declineRegistration } from "@/app/actions/registration-actions";
import { AdminShell } from "@/app/admin/AdminShell";
import { AdminEventsClient } from "@/app/admin/events/AdminEventsClient";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams?: { status?: string | string[] };
}) {
  const registrations = await prisma.eventRegistration.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });

  return (
    <AdminShell
      title="Prijave za skup"
      subtitle="Pregled prijava i odobravanje učesnika"
      active="events"
    >
      <AdminEventsClient
        registrations={registrations.map((r) => ({
          id: r.id,
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
          carModel: r.carModel,
          country: r.country,
          city: r.city,
          arrivingWithTrailer: r.arrivingWithTrailer,
          additionalInfo: r.additionalInfo,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          images: r.images.map((img) => ({ id: img.id, url: img.url })),
        }))}
        approveRegistration={approveRegistration}
        declineRegistration={declineRegistration}
      />
    </AdminShell>
  );
}
