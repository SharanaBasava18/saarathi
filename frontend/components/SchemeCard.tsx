"use client";

type Scheme = {
  scheme_id: string;
  name: string;
  match_score: number;
  rationale: string;
  description?: string;
  apply_link: string;
  estimated_benefit?: number | null;
  documents_required?: string[];
  application_steps?: string[];
  scheme_categories?: string[];
  eligibility_reasons?: string[];
  welfare_gap?: boolean;
};

type SchemeCardProps = {
  scheme: Scheme;
  rank: number;
  readyDocumentsCount: number;
  totalDocumentsCount: number;
  isReadyToApply: boolean;
  onDownloadChecklist: (scheme: Scheme) => void;
  onRequestAssistance?: () => void;
};

const getMatchMeta = (score: number): { label: string; className: string } => {
  if (score >= 80) {
    return { label: "High Match", className: "bg-green-100 text-green-700" };
  }

  if (score >= 60) {
    return { label: "Medium Match", className: "bg-yellow-100 text-yellow-700" };
  }

  return { label: "Low Match", className: "bg-red-100 text-red-700" };
};

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  education: { emoji: "🎓", label: "Education" },
  employment: { emoji: "💼", label: "Employment" },
  healthcare: { emoji: "🏥", label: "Healthcare" },
  housing: { emoji: "🏠", label: "Housing" },
  agriculture: { emoji: "🌾", label: "Agriculture" },
  pension: { emoji: "👵", label: "Pension" },
  "income support": { emoji: "💰", label: "Income Support" },
};

export default function SchemeCard({
  scheme,
  rank,
  readyDocumentsCount,
  totalDocumentsCount,
  isReadyToApply,
  onDownloadChecklist,
  onRequestAssistance,
}: SchemeCardProps) {
  const matchMeta = getMatchMeta(scheme.match_score);
  const score = Math.max(0, Math.min(100, Math.round(scheme.match_score)));
  const categories = (scheme.scheme_categories ?? []).map((item) => item.toLowerCase());

  return (
    <>
      <article className="group/card animate-fade-slide-up glass relative overflow-hidden rounded-2xl p-5 shadow-glass transition-all duration-500 hover:-translate-y-1 hover:shadow-premium sm:p-6">
        {/* Top gradient accent line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100" />

        {scheme.welfare_gap ? (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-amber-50/80 px-3 py-1 text-xs font-semibold text-amber-700 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Unclaimed Welfare Opportunity
          </div>
        ) : null}
        <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Top {rank}</p>
          <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">{scheme.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${matchMeta.className}`}>{matchMeta.label}</span>
          <span className="text-xs font-medium text-[var(--text-soft)]">{score}% score</span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {categories.length > 0
          ? categories.map((category) => {
              const meta = CATEGORY_META[category] ?? { emoji: "🏛️", label: category };
              return (
                <span key={`${scheme.scheme_id}-${category}`} className="rounded-full bg-slate-100/80 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {meta.emoji} {meta.label}
                </span>
              );
            })
          : (
            <span className="rounded-full bg-slate-100/80 px-2.5 py-1 text-[11px] font-semibold text-slate-600">🏛️ General Support</span>
            )}
      </div>

      <p className="mb-4 text-sm leading-relaxed text-slate-500">
        {scheme.description ?? "No description available."}
      </p>

      <div className="mb-4 rounded-xl border border-slate-200/50 bg-gradient-to-br from-slate-50/80 to-white p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Match Confidence</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/60">
          <div className="animate-bar-grow h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${score}%` }} />
        </div>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">{score}%</p>
      </div>

        <div className="rounded-xl border border-slate-200/50 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Why you may qualify</p>
          {scheme.welfare_gap ? (
            <p className="mt-2 rounded-lg border border-amber-200/60 bg-amber-50/60 px-2.5 py-1.5 text-sm text-amber-700">
              You appear eligible for this scheme but may not be receiving the benefit.
            </p>
          ) : null}
          {scheme.eligibility_reasons && scheme.eligibility_reasons.length > 0 ? (
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {scheme.eligibility_reasons.map((reason) => (
                <li key={`${scheme.scheme_id}-${reason}`} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-600">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm leading-6 text-slate-600">{scheme.rationale}</p>
          )}
        </div>

      {scheme.estimated_benefit !== undefined && scheme.estimated_benefit !== null ? (
        <div className="mt-3 rounded-xl border border-slate-200/50 bg-gradient-to-br from-slate-50/80 to-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">📈 Estimated Benefit</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">₹{scheme.estimated_benefit.toLocaleString()} per year</p>
        </div>
      ) : null}

      {scheme.documents_required && scheme.documents_required.length > 0 ? (
        <div className="mt-3 rounded-xl border border-slate-200/50 bg-gradient-to-br from-slate-50/80 to-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">📄 Documents Required</p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isReadyToApply ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
              }`}
            >
              {isReadyToApply ? "Ready to Apply" : "Missing Documents"}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            Documents Ready: {readyDocumentsCount} / {totalDocumentsCount}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {scheme.documents_required.map((document) => (
              <li key={`${scheme.scheme_id}-${document}`}>{document}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {scheme.application_steps && scheme.application_steps.length > 0 ? (
        <div className="mt-3 rounded-xl border border-slate-200/50 bg-gradient-to-br from-slate-50/80 to-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">🪜 Application Steps</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
            {scheme.application_steps.map((step, index) => (
              <li key={`${scheme.scheme_id}-${index + 1}`}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}

        <div className="mt-4 rounded-xl border border-slate-200/50 bg-gradient-to-br from-emerald-50/40 to-teal-50/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Apply</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={scheme.apply_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all duration-300 hover:px-7 hover:shadow-lg hover:shadow-emerald-500/30"
            >
              Apply Now
            </a>
            <button
              type="button"
              onClick={() => onDownloadChecklist(scheme)}
              className="inline-flex items-center rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 hover:bg-white hover:shadow-sm"
            >
              Download Application Checklist
            </button>
            <button
              type="button"
              onClick={() => {
                if (onRequestAssistance) onRequestAssistance();
              }}
              className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:bg-emerald-100 hover:px-6"
            >
              Request CSC Assistance
            </button>
          </div>
        </div>

      </article>
    </>
  );
}
