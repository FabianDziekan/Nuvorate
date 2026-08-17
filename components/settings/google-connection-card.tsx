"use client";

import { useActionState, useState, useTransition } from "react";
import { disconnectGoogleConnection, selectGoogleLocation } from "@/app/settings/actions";

type GoogleConnectionCardProps = {
  configured: boolean;
  connection: { google_location_title: string | null; google_email: string | null } | null;
  message?: string;
  locations?: Array<{ locationName: string; locationTitle: string }>;
};

export function GoogleConnectionCard({ configured, connection, message, locations = [] }: GoogleConnectionCardProps) {
  const [pending, start] = useTransition();
  const [selection, selectAction] = useActionState(selectGoogleLocation, { error: "" });
  const [mobileOpen, setMobileOpen] = useState(false);
  const status = connection ? "Połączono" : "Niepołączono";

  return <section className="mt-4 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-card min-[769px]:mt-5 min-[769px]:p-5 sm:p-6">
    <button type="button" className="flex w-full items-center gap-3 px-4 py-4 text-left min-[769px]:hidden" onClick={() => setMobileOpen((value) => !value)} aria-expanded={mobileOpen}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-sm font-semibold text-brand" aria-hidden="true">G</span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink">Google Business</span><span className={`mt-0.5 block text-xs ${connection ? "text-emerald-700" : "text-black/45"}`}>{status}</span></span>
      <span className={`text-brand transition-transform duration-200 ${mobileOpen ? "rotate-90" : ""}`} aria-hidden="true">›</span>
    </button>
    <div className={`overflow-hidden min-[769px]:block ${mobileOpen ? "max-[768px]:block" : "max-[768px]:hidden"}`}>
      <div className="border-t border-black/[0.06] p-4 min-[769px]:border-0 min-[769px]:p-0">
        <h2 className="hidden text-xl font-semibold min-[769px]:block">Połączenie z Google</h2>
        {!configured ? <p className="text-sm text-black/45 min-[769px]:mt-3">Integracja Google nie została jeszcze skonfigurowana przez administratora.</p> : connection ? <div className="min-[769px]:mt-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Połączono</span><p className="mt-4 font-semibold">{connection.google_location_title ?? "Lokalizacja Google"}</p><p className="mt-1 text-sm text-black/45">{connection.google_email}</p><p className="mt-4 text-sm text-black/45">Synchronizacja opinii zostanie włączona w kolejnym etapie.</p><div className="mt-5 flex flex-wrap gap-3"><a href="/api/google/connect" className="button-secondary">Połącz ponownie</a><button type="button" className="text-sm font-semibold text-red-600" disabled={pending} onClick={() => { if (window.confirm("Odłączyć Google? Nie usunie to danych NuvoRate.")) start(async () => { await disconnectGoogleConnection(); window.location.reload(); }); }}>Odłącz Google</button></div></div> : locations.length ? <form action={selectAction} className="min-[769px]:mt-4"><p className="text-sm text-black/45">Wybierz lokalizację Google Business Profile.</p><select name="locationName" className="mt-4 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm">{locations.map((location) => <option key={location.locationName} value={location.locationName}>{location.locationTitle}</option>)}</select>{selection.error ? <p className="mt-2 text-sm text-red-600">{selection.error}</p> : null}<button className="button-primary mt-4">Połącz wybraną lokalizację</button></form> : <div className="min-[769px]:mt-4"><p className="text-sm text-black/45">Połącz profil Google Business, aby w kolejnym etapie synchronizować opinie.</p>{message ? <p className="mt-3 text-sm font-medium text-black/55">{message}</p> : null}<a href="/api/google/connect" className="button-primary mt-5">Połącz z Google</a></div>}
      </div>
    </div>
  </section>;
}
