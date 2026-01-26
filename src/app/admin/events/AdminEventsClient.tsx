"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminEventTabs } from "@/app/admin/AdminEventTabs";
import { RegistrationImageGallery } from "@/app/admin/RegistrationImageGallery";
import { FiSearch, FiArrowUp, FiArrowDown } from "react-icons/fi";

type Tab = "pending" | "approved" | "declined";

type RegistrationStatus = "PENDING" | "APPROVED" | "DECLINED";

export type AdminRegistrationItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  carModel: string;
  country: string;
  city: string;
  arrivingWithTrailer: boolean;
  additionalInfo: string;
  status: RegistrationStatus;
  createdAt: string; // ISO string
  images: { id: string; url: string }[];
};

const statusLabel: Record<RegistrationStatus, string> = {
  PENDING: "Na čekanju",
  APPROVED: "Odobreno",
  DECLINED: "Odbijeno",
};

export function AdminEventsClient({
  registrations,
  approveRegistration,
  declineRegistration,
}: {
  registrations: AdminRegistrationItem[];
  approveRegistration: (formData: FormData) => Promise<void>;
  declineRegistration: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get("status");
  const [confirm, setConfirm] = useState<{
    type: "approve" | "decline";
    registrationId: string;
    label: string;
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before using search params to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeTab: Tab =
    statusParam === "approved"
      ? "approved"
      : statusParam === "declined"
        ? "declined"
        : "pending";

  const { pending, approved, declined, visible } = useMemo(() => {
    const pendingList = registrations.filter((r) => r.status === "PENDING");
    const approvedList = registrations.filter((r) => r.status === "APPROVED");
    const declinedList = registrations.filter((r) => r.status === "DECLINED");

    let visibleList =
      activeTab === "approved"
        ? approvedList
        : activeTab === "declined"
          ? declinedList
          : pendingList;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      visibleList = visibleList.filter((r) => {
        const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
        const email = r.email.toLowerCase();
        const carModel = r.carModel.toLowerCase();
        const city = r.city.toLowerCase();
        const country = r.country.toLowerCase();
        return (
          fullName.includes(query) ||
          email.includes(query) ||
          carModel.includes(query) ||
          city.includes(query) ||
          country.includes(query)
        );
      });
    }

    // Apply sorting by date
    visibleList = [...visibleList].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return {
      pending: pendingList,
      approved: approvedList,
      declined: declinedList,
      visible: visibleList,
    };
  }, [registrations, activeTab, searchQuery, sortOrder]);

  async function handleConfirm() {
    if (!confirm) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      const fd = new FormData();
      fd.set("registrationId", confirm.registrationId);
      if (confirm.type === "approve") {
        await approveRegistration(fd);
      } else {
        await declineRegistration(fd);
      }
      setConfirm(null);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Greška pri izvršavanju akcije.";
      setConfirmError(message);
    } finally {
      setIsConfirming(false);
    }
  }

  if (registrations.length === 0) {
    return <div className="glass-panel rounded-3xl p-8 text-slate-600">Nema prijava.</div>;
  }

  return (
    <div className="space-y-6">
      {confirm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6">
          <div
            className={[
              "glass-panel w-full max-w-md rounded-3xl p-6",
              confirm.type === "approve"
                ? "bg-emerald-50/90"
                : "bg-rose-50/90",
            ].join(" ")}
          >
            <p className="text-lg font-medium text-slate-900">
              {confirm.type === "approve" ? "Potvrda odobravanja" : "Potvrda odbijanja"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Da li ste sigurni da želite da{" "}
              <span className="font-medium text-slate-900">
                {confirm.type === "approve" ? "odobrite" : "odbijete"}
              </span>{" "}
              prijavu za <span className="font-medium">{confirm.label}</span>?
            </p>

            {confirmError ? (
              <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {confirmError}
              </p>
            ) : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                className="button-ghost"
                onClick={() => setConfirm(null)}
                disabled={isConfirming}
              >
                Otkaži
              </button>
              <button
                type="button"
                className={
                  confirm.type === "approve"
                    ? "button-primary"
                    : "button-primary bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-400"
                }
                onClick={handleConfirm}
                disabled={isConfirming}
              >
                {isConfirming ? "Radim..." : "Potvrdi"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AdminEventTabs
        pendingCount={pending.length}
        approvedCount={approved.length}
        declinedCount={declined.length}
      />

      {isMounted && (
        <div className="glass-panel rounded-3xl p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pretraži prijave (ime, email, auto, grad...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 dark:border-white/10 dark:bg-black dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Sortiraj po datumu:</span>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/20 dark:border-white/10 dark:bg-black dark:text-slate-50 dark:hover:bg-slate-900"
              title={sortOrder === "asc" ? "Najstarije prvo" : "Najnovije prvo"}
            >
              {sortOrder === "asc" ? (
                <>
                  <FiArrowUp className="h-4 w-4" />
                  <span>Najstarije</span>
                </>
              ) : (
                <>
                  <FiArrowDown className="h-4 w-4" />
                  <span>Najnovije</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      )}

      {visible.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 text-slate-600">
          {activeTab === "pending"
            ? "Nema prijava na čekanju."
            : activeTab === "approved"
              ? "Nema odobrenih prijava."
              : "Nema odbijenih prijava."}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((registration, index) => (
            <div key={registration.id} className="glass-panel rounded-3xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-lg text-slate-900">
                    {index + 1}. {registration.firstName} {registration.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{registration.email}</p>
                  <p className="text-sm text-slate-500">
                    <span className="font-medium text-slate-700">Auto:</span> {registration.carModel}
                  </p>
                  <p className="text-sm text-slate-500">
                    <span className="font-medium text-slate-700">Lokacija:</span> {registration.city},{" "}
                    {registration.country}
                  </p>
                  <p className="text-sm text-slate-500">
                    <span className="font-medium text-slate-700">Prikolica:</span>{" "}
                    {registration.arrivingWithTrailer ? "Da" : "Ne"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Primljeno:{" "}
                    {new Date(registration.createdAt).toLocaleString("sr-RS", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="chip">{statusLabel[registration.status]}</span>
                  {registration.status === "PENDING" ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="button-primary px-4 py-2"
                        onClick={() =>
                          setConfirm({
                            type: "approve",
                            registrationId: registration.id,
                            label: `${registration.firstName} ${registration.lastName}`.trim(),
                          })
                        }
                        disabled={isConfirming}
                      >
                        Odobri
                      </button>
                      <button
                        type="button"
                        className="button-primary bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 focus-visible:ring-rose-400"
                        onClick={() =>
                          setConfirm({
                            type: "decline",
                            registrationId: registration.id,
                            label: `${registration.firstName} ${registration.lastName}`.trim(),
                          })
                        }
                        disabled={isConfirming}
                      >
                        Odbij
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {registration.additionalInfo ? (
                <p className="mt-4 text-sm text-slate-600">{registration.additionalInfo}</p>
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
                <p className="mt-4 text-sm text-slate-500">Nema otpremljenih slika.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

