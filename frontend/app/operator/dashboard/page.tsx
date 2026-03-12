"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  CalendarClock,
  Clock,
  LogOut,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type OperatorSession = {
  operator_id: string;
  name: string;
  phone: string;
  district: string;
};

type CitizenRequest = {
  request_id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  occupation: string;
  recommended_schemes_count: number;
  assigned_operator_id: string;
  status: string;
  schedule_type: string | null;
  appointment_time: string | null;
};

export default function OperatorDashboardPage() {
  const router = useRouter();
  const [operator, setOperator] = useState<OperatorSession | null>(null);
  const [requests, setRequests] = useState<CitizenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [manualOpenId, setManualOpenId] = useState<string | null>(null);
  const [manualTime, setManualTime] = useState("");

  /* ── Auth check ─────────────────────────────────────────── */
  useEffect(() => {
    const raw = localStorage.getItem("saarthi_operator");
    if (!raw) {
      router.push("/operator/login");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as OperatorSession;
      if (!parsed.operator_id) throw new Error();
      setOperator(parsed);
    } catch {
      router.push("/operator/login");
    }
  }, [router]);

  /* ── Fetch assigned requests ────────────────────────────── */
  const fetchRequests = useCallback(async (opId: string) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `${API}/operator/requests/${encodeURIComponent(opId)}`
      );
      if (!res.ok) throw new Error("Failed to load requests");
      const data = (await res.json()) as CitizenRequest[];
      setRequests(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (operator?.operator_id) {
      void fetchRequests(operator.operator_id);
    }
  }, [operator?.operator_id, fetchRequests]);

  /* ── Schedule helpers ───────────────────────────────────── */
  const schedule = async (
    requestId: string,
    scheduleType: "Auto" | "Manual",
    customTime?: string
  ) => {
    setSchedulingId(requestId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API}/operator/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          schedule_type: scheduleType,
          ...(scheduleType === "Manual" && customTime
            ? { custom_time: customTime }
            : {}),
        }),
      });

      if (!res.ok) throw new Error("Scheduling failed");

      // Refresh list
      if (operator?.operator_id) {
        await fetchRequests(operator.operator_id);
      }
      setManualOpenId(null);
      setManualTime("");
      setSuccess(
        `Appointment ${scheduleType === "Auto" ? "auto-" : ""}scheduled! SMS and voice notification sent to citizen.`
      );
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to schedule appointment."
      );
    } finally {
      setSchedulingId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("saarthi_operator");
    router.push("/operator/login");
  };

  /* ── Status badge ───────────────────────────────────────── */
  const StatusBadge = ({ status }: { status: string }) => {
    const isScheduled = status === "Scheduled";
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
          isScheduled
            ? "border-teal-200 bg-teal-100 text-teal-800"
            : "border-amber-200 bg-amber-100 text-amber-800"
        }`}
      >
        {isScheduled ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : (
          <Clock className="h-3 w-3" />
        )}
        {status}
      </span>
    );
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* ── Header ────────────────────────────────────── */}
        <header className="flex flex-col gap-4 rounded-2xl border border-[#d6e3ef] bg-white/95 p-5 shadow-[0_14px_36px_rgba(6,33,61,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Welcome, {operator?.name ?? "Operator"}
              </h1>
              <p className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {operator?.district ?? ""} CSC Center
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </header>

        {/* ── Alerts ────────────────────────────────────── */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        {/* ── Loading state ─────────────────────────────── */}
        {loading && (
          <div className="mt-6 flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading assigned citizen requests…
          </div>
        )}

        {/* ── Empty state ───────────────────────────────── */}
        {!loading && requests.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              No citizen requests assigned to you yet.
            </p>
          </div>
        )}

        {/* ── Request cards ─────────────────────────────── */}
        {!loading && requests.length > 0 && (
          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {requests.map((req) => (
              <article
                key={req.request_id}
                className="group relative rounded-2xl border border-[#d6e3ef] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {/* Top: name + status */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {req.name}
                  </h3>
                  <StatusBadge status={req.status} />
                </div>

                {/* Details grid */}
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {req.phone}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {req.village}, {req.district}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    {req.occupation}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    Recommended Schemes: {req.recommended_schemes_count}
                  </p>
                </div>

                {/* Appointment info (when scheduled) */}
                {req.appointment_time && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                    <CalendarClock className="h-4 w-4 shrink-0" />
                    <span>
                      <span className="font-semibold">Appointment:</span>{" "}
                      {req.appointment_time}
                    </span>
                  </div>
                )}

                {/* Action buttons (only for Pending) */}
                {req.status === "Pending" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => schedule(req.request_id, "Auto")}
                      disabled={schedulingId === req.request_id}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {schedulingId === req.request_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CalendarClock className="h-3.5 w-3.5" />
                      )}
                      Auto Schedule
                    </button>
                    <button
                      onClick={() => {
                        setManualOpenId(
                          manualOpenId === req.request_id
                            ? null
                            : req.request_id
                        );
                        setManualTime("");
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Manual Schedule
                    </button>
                  </div>
                )}

                {/* Manual datetime picker */}
                {manualOpenId === req.request_id && req.status === "Pending" && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="datetime-local"
                      value={manualTime}
                      onChange={(e) => setManualTime(e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      onClick={() =>
                        schedule(req.request_id, "Manual", manualTime)
                      }
                      disabled={
                        !manualTime || schedulingId === req.request_id
                      }
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
