"use client";

import { useEffect, useState } from "react";

type CounterCard = {
  label: string;
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
};

const COUNTERS: CounterCard[] = [
  { label: "Citizens Assisted", target: 2451 },
  { label: "Schemes Discovered", target: 6900 },
  { label: "Total Welfare Unlocked", target: 3.2, prefix: "₹", suffix: " Crore", decimals: 1 },
];

const formatCounter = (value: number, card: CounterCard): string => {
  const fixed = card.decimals !== undefined ? value.toFixed(card.decimals) : Math.round(value).toString();
  const [intPart, decimalPart] = fixed.split(".");
  const formattedInt = Number(intPart).toLocaleString("en-IN");
  const formattedValue = decimalPart ? `${formattedInt}.${decimalPart}` : formattedInt;
  return `${card.prefix ?? ""}${formattedValue}${card.suffix ?? ""}`;
};

export default function ImpactStats() {
  const [values, setValues] = useState<number[]>(COUNTERS.map(() => 0));

  useEffect(() => {
    let raf = 0;
    const duration = 1300;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValues(COUNTERS.map((counter) => counter.target * progress));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {COUNTERS.map((counter, index) => (
        <article
          key={counter.label}
          className="animate-fade-slide-up glass-strong relative overflow-hidden rounded-2xl px-5 py-4 shadow-glass transition-all duration-300 hover:shadow-glass-lg"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-400/5 blur-xl" />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{counter.label}</p>
          <p className="relative mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">{formatCounter(values[index] ?? 0, counter)}</p>
        </article>
      ))}
    </section>
  );
}
