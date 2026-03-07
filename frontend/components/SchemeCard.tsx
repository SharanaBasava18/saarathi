type Scheme = {
  scheme_id: string;
  name: string;
  match_score: number;
  rationale: string;
  description?: string;
  apply_link: string;
};

type SchemeCardProps = {
  scheme: Scheme;
  rank: number;
};

export default function SchemeCard({ scheme, rank }: SchemeCardProps) {
  return (
    <article className="rounded-xl border border-[#d7e1df] bg-white p-3 sm:p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Top {rank}</p>
          <h3 className="text-base font-bold text-[var(--text-main)] sm:text-lg">{scheme.name}</h3>
        </div>
        <span className="rounded-full bg-[#ecf7f5] px-3 py-1 text-xs font-semibold text-[#0f5f56]">
          Eligibility Match: {Math.round(scheme.match_score)}%
        </span>
      </div>

      <p className="mb-3 text-sm leading-6 text-[var(--text-soft)]">
        {scheme.description ?? "No description available."}
      </p>

      <div className="rounded-lg border border-[#d7e6e3] bg-[#f6fbfa] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0f5f56]">Why you may qualify</p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-main)]">{scheme.rationale}</p>
      </div>

      <div className="mt-3 rounded-lg border border-[#dbe4f1] bg-[#f7faff] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355a57]">How to Apply</p>
        <a
          href={scheme.apply_link}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-sm font-medium text-[#0b5e8a] underline underline-offset-2"
        >
          Apply on MyScheme Portal
        </a>
      </div>
    </article>
  );
}
