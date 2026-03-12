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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background: "linear-gradient(135deg, #064e3b 0%, #0f766e 35%, #0c4a6e 70%, #1e1b4b 100%)",
      }}
    >
      <div className="relative">
        <div className="absolute -inset-8 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="relative rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5 shadow-2xl backdrop-blur-sm">
          <Shield className="h-14 w-14 text-emerald-300" />
        </div>
      </div>
      <h1 className="mt-7 text-4xl font-extrabold tracking-[0.2em] text-white sm:text-5xl">SAARTHI</h1>
      <p className="mt-3 text-sm font-medium tracking-wider text-emerald-200/80 sm:text-base">Empowering Citizens, Enabling Inclusion</p>
      <div className="mt-8 h-0.5 w-16 rounded-full bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
    </div>
  );
}
