"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Phone, Lock, ShieldCheck } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function OperatorLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setError("Please enter both phone number and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/operator/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Invalid phone number or password.");
      }

      const data = (await res.json()) as {
        operator_id: string;
        name: string;
        phone: string;
        district: string;
      };
      localStorage.setItem("saarthi_operator", JSON.stringify(data));
      router.push("/operator/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 shadow-lg shadow-indigo-100">
            <ShieldCheck className="h-7 w-7 text-indigo-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-indigo-600">
            SAARTHI CSC Portal
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Common Service Centre — Operator Login
          </p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#d6e3ef] bg-white p-8 shadow-[0_20px_50px_rgba(6,33,61,0.08)]"
        >
          {/* Phone */}
          <label className="block text-sm font-medium text-slate-700">
            Phone Number
          </label>
          <div className="relative mt-1.5">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9999999991"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Password */}
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-white" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {loading ? "Signing in…" : "Sign In"}
          </button>

          {/* Demo hint */}
          <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Demo credentials:</span>{" "}
            Phone <span className="font-mono">9999999991</span> / Password{" "}
            <span className="font-mono">admin123</span>
          </p>
        </form>
      </div>
    </main>
  );
}
