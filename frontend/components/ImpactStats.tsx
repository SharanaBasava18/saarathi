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
          className="rounded-2xl border border-[#cfe0df] bg-white/95 px-4 py-3 shadow-[0_10px_26px_rgba(17,44,71,0.08)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3f617e]">{counter.label}</p>
          <p className="mt-1 text-2xl font-bold text-[#0f4f7a]">{formatCounter(values[index] ?? 0, counter)}</p>
        </article>
      ))}
    </section>
  );
}
