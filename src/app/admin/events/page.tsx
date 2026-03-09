import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { approveRegistration, declineRegistration } from "@/app/actions/registration-actions";
import { AdminShell } from "@/app/admin/AdminShell";
import { AdminEventsClient } from "@/app/admin/events/AdminEventsClient";

export const dynamic = "force-dynamic";

type AdminEventsSearchParams = {
  status?: string | string[];
  take?: string | string[];
};

export default async function AdminEventsPage(props: {
  searchParams: Promise<AdminEventsSearchParams>;
}) {
  const searchParams = await props.searchParams;

  const takeParam = Array.isArray(searchParams.take)
    ? searchParams.take[0]
    : searchParams.take;
  const statusParam = Array.isArray(searchParams.status)
    ? searchParams.status[0]
    : searchParams.status;

  const takeBase = Number.parseInt(takeParam || "10", 10);
  const take = Number.isFinite(takeBase)
    ? Math.min(Math.max(takeBase, 5), 200)
    : 10;

  const activeStatus: "PENDING" | "APPROVED" | "DECLINED" =
    statusParam === "approved"
      ? "APPROVED"
      : statusParam === "declined"
        ? "DECLINED"
        : "PENDING";

  const whereStatus = { status: activeStatus };

  const [
    pendingTotal,
    approvedTotal,
    declinedTotal,
    registrations,
  ] = await Promise.all([
    prisma.eventRegistration.count({ where: { status: "PENDING" } }),
    prisma.eventRegistration.count({ where: { status: "APPROVED" } }),
    prisma.eventRegistration.count({ where: { status: "DECLINED" } }),
    prisma.eventRegistration.findMany({
      where: whereStatus,
      orderBy: { createdAt: "desc" },
      include: { images: true },
      take,
    }),
  ]);

  const activeTotal =
    activeStatus === "PENDING"
      ? pendingTotal
      : activeStatus === "APPROVED"
        ? approvedTotal
        : declinedTotal;
  const hasMore = activeTotal > registrations.length;

  return (
    <AdminShell
      title="Prijave za skup"
      subtitle="Pregled prijava i odobravanje učesnika"
      active="events"
    >
      <Suspense fallback={<div className="glass-panel rounded-3xl p-8 text-slate-600">Učitavanje...</div>}>
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
          pendingTotal={pendingTotal}
          approvedTotal={approvedTotal}
          declinedTotal={declinedTotal}
          hasMore={hasMore}
          approveRegistration={approveRegistration}
          declineRegistration={declineRegistration}
        />
      </Suspense>
    </AdminShell>
  );
}
