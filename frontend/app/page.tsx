import Link from "next/link";
import { ArrowRight, FileText, MapPin, Sparkles } from "lucide-react";

const features = [
  {
    title: "AI Discovery",
    description:
      "Just type or speak your situation in plain language. Our AI instantly matches you with eligible schemes.",
    icon: Sparkles,
    accent: "from-emerald-500/20 to-teal-500/10",
  },
  {
    title: "Document Readiness",
    description:
      "Simulate DigiLocker integration to know exactly which documents you need before you apply.",
    icon: FileText,
    accent: "from-sky-500/20 to-cyan-500/10",
  },
  {
    title: "Local CSC Support",
    description:
      "Need help applying? We instantly route your request to a registered operator in your exact district.",
    icon: MapPin,
    accent: "from-amber-500/20 to-orange-500/10",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(20,184,166,0.12),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              AI-guided welfare access for every citizen
            </div>

            <h1 className="mt-8 text-5xl font-bold tracking-[-0.04em] text-slate-900 sm:text-6xl lg:text-7xl">
              Claim Your Rightful Welfare.
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Powered by AI.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              SAARTHI bridges the gap between millions of citizens and 700+ government schemes. Discover what you qualify for in seconds.
            </p>

            <div className="mt-10 flex justify-center">
              <Link
                href="/chat"
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/30 transition-transform duration-200 hover:scale-105"
              >
                Start Discovering Schemes
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
                >
                  <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${feature.accent}`} />
                  <div className="relative">
                    <div className="inline-flex rounded-lg bg-emerald-50 p-3 text-emerald-600 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-xl font-semibold text-slate-900">{feature.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{feature.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
