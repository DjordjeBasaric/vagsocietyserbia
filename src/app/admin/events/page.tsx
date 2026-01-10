import { prisma } from "@/lib/db";
import { approveRegistration } from "@/app/actions/registration-actions";
import { AdminShell } from "@/app/admin/AdminShell";
import { RegistrationImageGallery } from "@/app/admin/RegistrationImageGallery";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const registrations = await prisma.eventRegistration.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });

  const pendingRegistrations = registrations.filter(
    (registration) => registration.status === "PENDING"
  );
  const approvedRegistrations = registrations.filter(
    (registration) => registration.status === "APPROVED"
  );

  const statusLabel = {
    PENDING: "Na cekanju",
    APPROVED: "Odobreno",
  } as const;

  return (
    <AdminShell
      title="Prijave za skup"
      subtitle="Pregled prijava i odobravanje ucesnika"
      active="events"
    >
      {registrations.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 text-slate-600">
          Nema prijava.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg text-slate-900">Na cekanju</h3>
              <span className="chip">{pendingRegistrations.length}</span>
            </div>
            {pendingRegistrations.length === 0 ? (
              <div className="glass-panel rounded-3xl p-6 text-slate-600">
                Nema prijava na cekanju.
              </div>
            ) : (
              pendingRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="glass-panel rounded-3xl p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-lg text-slate-900">
                        {registration.firstName} {registration.lastName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {registration.email}
                      </p>
                      <p className="text-sm text-slate-500">
                        {registration.carModel} · {registration.city},{" "}
                        {registration.country}
                      </p>
                      <p className="text-sm text-slate-500">
                        Prikolica:{" "}
                        {registration.arrivingWithTrailer ? "Da" : "Ne"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="chip">
                        {statusLabel[registration.status]}
                      </span>
                      <form action={approveRegistration}>
                        <input
                          type="hidden"
                          name="registrationId"
                          value={registration.id}
                        />
                        <button
                          type="submit"
                          className="button-primary px-4 py-2"
                        >
                          Odobri
                        </button>
                      </form>
                    </div>
                  </div>
                  {registration.additionalInfo ? (
                    <p className="mt-4 text-sm text-slate-600">
                      {registration.additionalInfo}
                    </p>
                  ) : null}
                  {registration.images.length ? (
                    <div className="mt-4">
                      <RegistrationImageGallery
                        images={registration.images.map((image) => ({
                          id: image.id,
                          url: image.url,
                        }))}
                      />
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      Nema otpremljenih slika.
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg text-slate-900">Odobrene</h3>
              <span className="chip">{approvedRegistrations.length}</span>
            </div>
            {approvedRegistrations.length === 0 ? (
              <div className="glass-panel rounded-3xl p-6 text-slate-600">
                Nema odobrenih prijava.
              </div>
            ) : (
              approvedRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="glass-panel rounded-3xl p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-lg text-slate-900">
                        {registration.firstName} {registration.lastName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {registration.email}
                      </p>
                      <p className="text-sm text-slate-500">
                        {registration.carModel} · {registration.city},{" "}
                        {registration.country}
                      </p>
                      <p className="text-sm text-slate-500">
                        Prikolica:{" "}
                        {registration.arrivingWithTrailer ? "Da" : "Ne"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="chip">
                        {statusLabel[registration.status]}
                      </span>
                    </div>
                  </div>
                  {registration.additionalInfo ? (
                    <p className="mt-4 text-sm text-slate-600">
                      {registration.additionalInfo}
                    </p>
                  ) : null}
                  {registration.images.length ? (
                    <div className="mt-4">
                      <RegistrationImageGallery
                        images={registration.images.map((image) => ({
                          id: image.id,
                          url: image.url,
                        }))}
                      />
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      Nema otpremljenih slika.
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
