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
      <article className="rounded-2xl border border-[#d4deea] bg-white p-4 shadow-[0_14px_34px_rgba(9,31,56,0.08)] sm:p-5">
        {scheme.welfare_gap ? (
          <div className="mb-3 inline-flex rounded-full border border-[#f2c46d] bg-[#fff2d8] px-3 py-1 text-xs font-semibold text-[#9a5a05]">
            Unclaimed Welfare Opportunity
          </div>
        ) : null}
        <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Top {rank}</p>
          <h3 className="text-base font-bold leading-snug text-[var(--text-main)] sm:text-lg">{scheme.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${matchMeta.className}`}>{matchMeta.label}</span>
          <span className="text-xs font-medium text-[var(--text-soft)]">{score}% score</span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {categories.length > 0
          ? categories.map((category) => {
              const meta = CATEGORY_META[category] ?? { emoji: "🏛️", label: category };
              return (
                <span key={`${scheme.scheme_id}-${category}`} className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#20456f]">
                  {meta.emoji} {meta.label}
                </span>
              );
            })
          : (
            <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#20456f]">🏛️ General Support</span>
            )}
      </div>

      <p className="mb-4 text-sm leading-6 text-[var(--text-soft)]">
        {scheme.description ?? "No description available."}
      </p>

      <div className="mb-4 rounded-xl border border-[#d7e2f2] bg-[#f7fbff] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355a57]">Match Confidence</p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#d9e6f7]">
          <div className="h-full rounded-full bg-[#007a8f] transition-all" style={{ width: `${score}%` }} />
        </div>
        <p className="mt-1 text-xs text-[var(--text-soft)]">{score}%</p>
      </div>

        <div className="rounded-lg border border-[#d7e6e3] bg-[#f6fbfa] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0f5f56]">Why you may qualify</p>
          {scheme.welfare_gap ? (
            <p className="mt-2 rounded-md border border-[#f2c46d] bg-[#fff8ea] px-2 py-1 text-sm text-[#8d5208]">
              You appear eligible for this scheme but may not be receiving the benefit.
            </p>
          ) : null}
          {scheme.eligibility_reasons && scheme.eligibility_reasons.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm text-[var(--text-main)]">
              {scheme.eligibility_reasons.map((reason) => (
                <li key={`${scheme.scheme_id}-${reason}`} className="flex items-center gap-2">
                  <span className="text-green-700">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm leading-6 text-[var(--text-main)]">{scheme.rationale}</p>
          )}
        </div>

      {scheme.estimated_benefit !== undefined && scheme.estimated_benefit !== null ? (
        <div className="mt-3 rounded-lg border border-[#dbe4f1] bg-[#f7faff] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355a57]">📈 Estimated Benefit</p>
          <p className="mt-1 text-sm text-[var(--text-main)]">₹{scheme.estimated_benefit.toLocaleString()} per year</p>
        </div>
      ) : null}

      {scheme.documents_required && scheme.documents_required.length > 0 ? (
        <div className="mt-3 rounded-lg border border-[#dbe4f1] bg-[#f7faff] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355a57]">📄 Documents Required</p>
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
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-main)]">
            {scheme.documents_required.map((document) => (
              <li key={`${scheme.scheme_id}-${document}`}>{document}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {scheme.application_steps && scheme.application_steps.length > 0 ? (
        <div className="mt-3 rounded-lg border border-[#dbe4f1] bg-[#f7faff] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355a57]">🪜 Application Steps</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--text-main)]">
            {scheme.application_steps.map((step, index) => (
              <li key={`${scheme.scheme_id}-${index + 1}`}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}

        <div className="mt-3 rounded-lg border border-[#dbe4f1] bg-[#f7faff] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355a57]">Apply</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <a
              href={scheme.apply_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100"
            >
              Apply Now
            </a>
            <button
              type="button"
              onClick={() => onDownloadChecklist(scheme)}
              className="inline-flex items-center rounded-lg border border-[#b8cbe2] bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4a76] transition hover:bg-[#eef4fb]"
            >
              Download Application Checklist
            </button>
            <button
              type="button"
              onClick={() => {
                if (onRequestAssistance) onRequestAssistance();
              }}
              className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100"
            >
              Request CSC Assistance
            </button>
          </div>
        </div>

      </article>
    </>
  );
}
