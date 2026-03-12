"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    const unmountTimer = setTimeout(() => {
      setShouldRender(false);
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="animate-pulse rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-5">
        <Shield className="h-16 w-16 text-emerald-400" />
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-widest text-white sm:text-5xl">SAARTHI</h1>
      <p className="mt-2 text-sm text-gray-300 sm:text-base">Empowering Citizens, Enabling Inclusion</p>
    </div>
  );
}
