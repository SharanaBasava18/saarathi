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
};

type SchemeCardProps = {
  scheme: Scheme;
  rank: number;
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

export default function SchemeCard({ scheme, rank }: SchemeCardProps) {
  const matchMeta = getMatchMeta(scheme.match_score);

  return (
    <article className="rounded-xl border border-[#d7e1df] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Top {rank}</p>
          <h3 className="text-base font-bold leading-snug text-[var(--text-main)] sm:text-lg">{scheme.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${matchMeta.className}`}>{matchMeta.label}</span>
          <span className="text-xs font-medium text-[var(--text-soft)]">{Math.round(scheme.match_score)}% score</span>
        </div>
      </div>

      <p className="mb-4 text-sm leading-6 text-[var(--text-soft)]">
        {scheme.description ?? "No description available."}
      </p>

      <div className="rounded-lg border border-[#d7e6e3] bg-[#f6fbfa] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0f5f56]">Why you may qualify</p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-main)]">{scheme.rationale}</p>
      </div>

      {scheme.estimated_benefit !== undefined && scheme.estimated_benefit !== null ? (
        <div className="mt-3 rounded-lg border border-[#dbe4f1] bg-[#f7faff] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355a57]">📈 Estimated Benefit</p>
          <p className="mt-1 text-sm text-[var(--text-main)]">₹{scheme.estimated_benefit.toLocaleString()} per year</p>
        </div>
      ) : null}

      {scheme.documents_required && scheme.documents_required.length > 0 ? (
        <div className="mt-3 rounded-lg border border-[#dbe4f1] bg-[#f7faff] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355a57]">📄 Documents Required</p>
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
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355a57]">How to Apply</p>
        <a
          href={scheme.apply_link}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-sm font-medium text-[#0b5e8a] underline underline-offset-2"
        >
          Open Application Link
        </a>
      </div>
    </article>
  );
}
