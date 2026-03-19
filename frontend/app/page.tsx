"use client";

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
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
        {/* Glowing orbs — cinematic depth */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4">
          <div className="animate-float h-[520px] w-[520px] rounded-full bg-emerald-400/15 blur-[140px]" />
        </div>
        <div className="pointer-events-none absolute -right-20 top-1/3">
          <div className="animate-float h-[350px] w-[350px] rounded-full bg-indigo-400/10 blur-[120px]" style={{ animationDelay: '2s' }} />
        </div>
        <div className="pointer-events-none absolute -left-32 bottom-10">
          <div className="animate-float h-[280px] w-[280px] rounded-full bg-teal-400/12 blur-[100px]" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="animate-fade-slide-up inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-white/60 px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur-lg">
              <Sparkles className="h-4 w-4" />
              AI-guided welfare access for every citizen
            </div>

            <h1 className="mt-10 text-5xl font-extrabold tracking-[-0.04em] sm:text-6xl lg:text-[5.25rem] lg:leading-[1.08]">
              <span className="text-slate-900">Claim Your Rightful Welfare.</span>
              <span className="animate-shimmer mt-3 block bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 bg-clip-text text-transparent">
                Powered by AI.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-500 sm:text-xl">
              SAARTHI bridges the gap between millions of citizens and 700+ government schemes. Discover what you qualify for in seconds.
            </p>

            <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/chat"
                prefetch
                className="animate-glow-pulse inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-emerald-600/20 transition-all duration-300 hover:scale-[1.04] hover:ring-4 hover:ring-emerald-500/25 active:scale-[0.97]"
              >
                Start Discovering Schemes
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/operator/login"
                prefetch
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white/60 px-8 py-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white/80 hover:shadow-md"
              >
                CSC Operator Portal
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="mt-28 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="animate-fade-slide-up group relative overflow-hidden rounded-3xl border border-white/25 bg-white/55 p-8 shadow-premium backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-premium-lg"
                  style={{ animationDelay: `${index * 140}ms` }}
                >
                  <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${feature.accent} opacity-70 transition-opacity duration-500 group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="inline-flex rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-emerald-600 shadow-sm ring-1 ring-emerald-100/60">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-xl font-bold text-slate-900">{feature.title}</h2>
                    <p className="mt-3 text-[15px] leading-7 text-slate-500">{feature.description}</p>
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
