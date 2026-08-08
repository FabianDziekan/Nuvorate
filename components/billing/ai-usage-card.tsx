import { getPlanLabel, type AppPlan } from "@/lib/plans";

function usagePercent(used: number, limit: number) {
  if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((used / limit) * 100));
}

function UsageProgress({ used, limit }: { used: number; limit: number }) {
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/[0.06]">
      <div
        className="h-full rounded-full bg-brand"
        style={{ width: `${usagePercent(used, limit)}%` }}
      />
    </div>
  );
}

export function AiUsageCard({
  plan,
  repliesUsed,
  repliesLimit,
  analysesUsed,
  analysesLimit,
}: {
  plan: AppPlan;
  repliesUsed: number;
  repliesLimit: number;
  analysesUsed: number;
  analysesLimit: number;
}) {
  const isUnpaid = plan === "unpaid";
  const remainingReplies = Math.max(repliesLimit - repliesUsed, 0);
  const remainingAnalyses = Math.max(analysesLimit - analysesUsed, 0);

  return (
    <article className="w-full min-w-0 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card max-[768px]:p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-3 max-[768px]:gap-2 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
            Limity planu
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Miesięczne limity planu
          </h2>
          <p className="mt-2 text-xs leading-5 text-black/40">
            Limity odnawiają się na początku każdego miesiąca.
          </p>
        </div>
        <span className="self-start rounded-full bg-brand-soft px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
          Plan {getPlanLabel(plan)}
        </span>
      </div>

      {isUnpaid ? (
        <div className="mt-5 rounded-2xl border border-brand/10 bg-brand-soft px-4 py-3 text-sm font-semibold text-brand">
          Wybierz plan, aby korzystać z funkcji automatyzacji
        </div>
      ) : null}

      <div className="mt-5 grid min-w-0 gap-4 max-[768px]:mt-3 max-[768px]:gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-black/[0.05] bg-[#FAFAFC] p-4 shadow-sm max-[768px]:p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Odpowiedzi na opinie</p>
            <p className="text-sm font-semibold text-brand">{remainingReplies} pozostało</p>
          </div>
          <UsageProgress used={repliesUsed} limit={repliesLimit} />
          <p className="mt-2 text-[11px] text-black/35">{usagePercent(repliesUsed, repliesLimit)}% limitu</p>
          <p className="mt-1 text-[11px] text-black/35">Wykorzystano {repliesUsed} z {repliesLimit}</p>
        </div>
        <div className="min-w-0 rounded-2xl border border-black/[0.05] bg-[#FAFAFC] p-4 shadow-sm max-[768px]:p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Analizy reputacji</p>
            <p className="text-sm font-semibold text-brand">{remainingAnalyses} pozostało</p>
          </div>
          <UsageProgress used={analysesUsed} limit={analysesLimit} />
          <p className="mt-2 text-[11px] text-black/35">{usagePercent(analysesUsed, analysesLimit)}% limitu</p>
          <p className="mt-1 text-[11px] text-black/35">Wykorzystano {analysesUsed} z {analysesLimit}</p>
        </div>
      </div>
    </article>
  );
}
