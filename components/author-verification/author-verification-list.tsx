"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type AuthorVerificationReview = { id: string; authorName: string; rating: number; content: string; createdAt: string };
type Profile = { reviewId: string; authorProfileUri: string | null; googleMapsUri: string | null };
function ProfileLinks({ profile }: { profile?: Profile }) {
  return <div className="mt-4 space-y-2">
    {profile?.authorProfileUri ? <>
      <a className="inline-block max-w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white" href={profile.authorProfileUri} target="_blank" rel="noopener noreferrer">Otwórz profil autora w Google Maps ↗</a>
      {profile.googleMapsUri && <a className="block text-xs text-brand" href={profile.googleMapsUri} target="_blank" rel="noopener noreferrer">Zobacz opinię w Google Maps ↗</a>}
      <p translate="no" className="whitespace-nowrap text-xs font-normal not-italic tracking-normal text-[#5E5E5E]">Google Maps</p>
    </> : <p className="text-sm text-black/45">Profil Google autora jest niedostępny</p>}
  </div>;
}
export function AuthorVerificationList({ reviews, businessId, location }: { reviews: AuthorVerificationReview[]; businessId: string; location: string }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuthorVerificationReview | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "Tab") {
        const items = dialog.current?.querySelectorAll<HTMLElement>('button, a[href]');
        if (!items?.length) return;
        if (event.shiftKey && (document.activeElement === items[0] || document.activeElement === dialog.current)) { event.preventDefault(); items[items.length - 1].focus(); }
        else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
      }
    };
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", key); previous?.focus(); };
  }, [selected]);
  async function enrich() {
    if (busy) return;
    setBusy(true); setProfiles([]);
    controller.current = new AbortController();
    try {
      const response = await fetch("/api/author-google-profiles", { cache: "no-store", signal: controller.current.signal });
      if (!response.ok) return;
      const result = await response.json();
      if (result.businessId === businessId && Array.isArray(result.profiles)) setProfiles(result.profiles);
    } catch { /* Optional enrichment leaves the original reviews available. */ }
    finally { setBusy(false); }
  }
  const filtered = reviews.filter(r => (rating === "all" || r.rating === Number(rating)) && (r.authorName + " " + r.content).toLocaleLowerCase("pl").includes(query.toLocaleLowerCase("pl")))
    .sort((a,b) => sort === "lowest" ? a.rating-b.rating : sort === "highest" ? b.rating-a.rating : (Date.parse(b.createdAt)-Date.parse(a.createdAt)) * (sort === "oldest" ? -1 : 1));
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages);
  const date = (value: string) => Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString("pl-PL") : "";
  return <section className="mt-6 min-w-0 rounded-3xl border border-black/5 bg-white p-4 shadow-card sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-semibold">Opinie Google · {reviews.length}</h2>
      <button disabled={busy} onClick={enrich} className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Sprawdzanie…" : "Sprawdź dostępne profile Google"}</button>
    </div>
    <p className="mt-3 text-xs text-black/45" aria-live="polite">Google udostępnia do 5 opinii wybranych według trafności. Link może być dostępny tylko dla części autorów.</p>
    <div className="my-5 grid gap-3 sm:grid-cols-3">
      <input aria-label="Szukaj autora lub opinii" placeholder="Szukaj autora lub opinii" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} className="min-w-0 rounded-xl border p-3" />
      <select aria-label="Ocena" value={rating} onChange={e=>{setRating(e.target.value);setPage(1);}} className="rounded-xl border p-3"><option value="all">Wszystkie oceny</option>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} ★</option>)}</select>
      <select aria-label="Sortowanie" value={sort} onChange={e=>setSort(e.target.value)} className="rounded-xl border p-3"><option value="newest">Najnowsze</option><option value="oldest">Najstarsze</option><option value="lowest">Najniższa ocena</option><option value="highest">Najwyższa ocena</option></select>
    </div>
    <div className="space-y-4">{filtered.slice((current-1)*10,current*10).map(review=><article key={review.id} className="min-w-0 rounded-2xl border border-black/5 p-4">
      <button onClick={()=>setSelected(review)} className="block w-full text-left"><span className="font-semibold break-words">{review.authorName}</span><span className="mt-1 block text-amber-500" aria-label={review.rating+" z 5"}>{"★".repeat(Math.max(0,Math.min(5,review.rating)))}</span><span className="mt-1 block text-xs text-black/45">{date(review.createdAt)} · {location}</span><span className="mt-3 block whitespace-pre-wrap break-words text-sm leading-6">{review.content}</span></button>
      <ProfileLinks profile={profiles.find(p=>p.reviewId===review.id)} />
    </article>)}</div>
    {!filtered.length && <p className="py-8 text-center text-black/45">Brak opinii do wyświetlenia.</p>}
    <div className="mt-5 flex items-center justify-center gap-4"><button disabled={current<=1} onClick={()=>setPage(current-1)} className="p-3 disabled:opacity-30">Poprzednia</button><span>{current} / {pages}</span><button disabled={current>=pages} onClick={()=>setPage(current+1)} className="p-3 disabled:opacity-30">Następna</button></div>
    {selected && createPortal(<div className="fixed inset-0 z-[120] bg-black/30" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Szczegóły autora opinii" className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-6 pb-[max(24px,env(safe-area-inset-bottom))] sm:inset-y-0 sm:left-auto sm:w-[480px] sm:max-w-full sm:max-h-screen sm:rounded-none">
        <button onClick={()=>setSelected(null)} className="float-right rounded-xl p-3" aria-label="Zamknij szczegóły">×</button>
        <p className="text-xs text-black/45">AUTOR</p><h2 className="mt-2 break-words text-xl font-semibold">{selected.authorName}</h2>
        <p className="mt-8 text-xs text-black/45">OPINIA</p><p className="mt-2 text-amber-500">{selected.rating} ★</p><p className="text-xs text-black/45">{date(selected.createdAt)} · {location}</p><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{selected.content}</p>
        <p className="mt-8 text-xs text-black/45">PROFIL GOOGLE</p><ProfileLinks profile={profiles.find(p=>p.reviewId===selected.id)} />
        <p className="mt-6 text-xs leading-5 text-black/45">Profil otwierany jest bezpośrednio w Google Maps. NuvoRate nie potwierdza tożsamości autora.</p>
      </div>
    </div>, document.body)}
  </section>;
}
