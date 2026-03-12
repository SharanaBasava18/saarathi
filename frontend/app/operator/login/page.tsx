"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function OperatorLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!phone.trim() || !password.trim()) {
      setError("Please enter phone and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/operator/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid phone or password");
      }

      const data = (await response.json()) as { operator_id: string; name: string; district: string };
      localStorage.setItem("saarthiOperator", JSON.stringify(data));
      router.push("/operator/dashboard");
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "Login failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#eef4fb] via-[#f7fbff] to-[#eef5ee] px-4 py-10">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-[#cfddeb] bg-white p-6 shadow-[0_16px_36px_rgba(6,33,61,0.1)]">
        <h1 className="text-2xl font-bold text-slate-900">CSC Operator Login</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to manage assigned citizen assistance requests.</p>

        <div className="mt-4 space-y-3">
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Phone"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#4f7aa8]"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#4f7aa8]"
          />
        </div>

        <button
          type="button"
          onClick={login}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-[#0c5a8f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#084872] disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      </section>
    </main>
  );
}
