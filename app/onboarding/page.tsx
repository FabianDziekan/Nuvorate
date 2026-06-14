import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { BusinessForm } from "@/components/onboarding/business-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Konfiguracja firmy | NuvoRate",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    redirect("/login?next=/onboarding");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError) {
    throw new Error(
      "Nie udało się odczytać danych firmy. Sprawdź konfigurację Supabase.",
    );
  }

  if (business) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#F7F7FA] text-ink">
      <header className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto flex h-[74px] max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <BrandLogo />
          <div className="hidden items-center gap-2 text-xs text-black/40 sm:flex">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
              1
            </span>
            Konfiguracja firmy
            <span className="mx-1 h-px w-8 bg-black/10" />
            <span className="grid h-6 w-6 place-items-center rounded-full bg-black/[0.05] text-[10px] font-bold text-black/30">
              2
            </span>
            Dashboard
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-74px)] max-w-[1180px] items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-16">
        <section>
          <span className="eyebrow">Pierwszy krok</span>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Opowiedz nam o swojej firmie
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-black/55 sm:text-lg">
            Te dane pozwolą przygotować dashboard NuvoRate dla Twojego biznesu.
            Na tym etapie konfigurujesz jedną firmę przypisaną do swojego konta.
          </p>

          <div className="mt-9 space-y-4">
            {[
              "Jedno konto ownera i jedna firma",
              "Dane możesz później zaktualizować",
              "Link Google wykorzystamy do kierowania klientów do opinii",
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-sm font-bold text-brand">
                  {index + 1}
                </span>
                <p className="text-sm font-medium text-black/65">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-brand/10 bg-brand-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              Zalogowano jako
            </p>
            <p className="mt-1 truncate text-sm font-semibold">{user.email}</p>
          </div>
        </section>

        <section className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-soft sm:p-9">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              Dane firmy
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
              Skonfiguruj profil biznesu
            </h2>
            <p className="mt-2 text-sm leading-6 text-black/45">
              Wszystkie pola są wymagane, aby zakończyć konfigurację.
            </p>
          </div>
          <BusinessForm />
        </section>
      </div>
    </main>
  );
}
