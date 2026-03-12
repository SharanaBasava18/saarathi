"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AssistanceRequest = {
  id: string;
  citizen_name: string;
  phone_number: string;
  state: string;
  district?: string;
  village?: string;
  detected_profile: {
    occupation?: string | null;
  };
  recommended_schemes: Array<{ scheme_id?: string; name?: string }>;
  status: "pending" | "assigned" | "scheduled" | "completed";
  assigned_operator_id?: string | null;
  assigned_csc_operator: string | null;
  scheduled_time: string | null;
  created_at: string;
};

type OperatorSession = {
  operator_id: string;
  name: string;
  district: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function OperatorDashboardPage() {
  const router = useRouter();
  const [operator, setOperator] = useState<OperatorSession | null>(null);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [schedulingFor, setSchedulingFor] = useState<string | null>(null);
  const [manualOpenFor, setManualOpenFor] = useState<string | null>(null);
  const [manualScheduleTime, setManualScheduleTime] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("saarthiOperator");
    if (!raw) {
      router.push("/operator/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as OperatorSession;
      if (!parsed.operator_id) {
        router.push("/operator/login");
        return;
      }
      setOperator(parsed);
    } catch {
      router.push("/operator/login");
    }
  }, [router]);

  useEffect(() => {
    if (!operator?.operator_id) {
      return;
    }

    const loadRequests = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/operator/requests?operator_id=${encodeURIComponent(operator.operator_id)}`);
        if (!response.ok) {
          throw new Error(`Failed to load assigned requests (${response.status})`);
        }

        const data = (await response.json()) as AssistanceRequest[];
        setRequests(data);
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Unable to load assigned requests.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadRequests();
  }, [operator?.operator_id]);

  const autoSchedule = async (requestId: string) => {
    setSchedulingFor(requestId);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/operator/auto-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request_id: requestId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to auto schedule request (${response.status})`);
      }

      const payload = (await response.json()) as { message: string; request: AssistanceRequest };
      setRequests((current) => current.map((item) => (item.id === requestId ? payload.request : item)));
      setSuccessMessage("SMS and voice notification sent to citizen.");
    } catch (scheduleError) {
      const message = scheduleError instanceof Error ? scheduleError.message : "Unable to auto schedule appointment.";
      setError(message);
    } finally {
      setSchedulingFor(null);
    }
  };

  const manualSchedule = async (requestId: string) => {
    if (!manualScheduleTime.trim()) {
      setError("Please select date and time for manual scheduling.");
      return;
    }

    setSchedulingFor(requestId);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/operator/manual-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request_id: requestId, scheduled_time: manualScheduleTime }),
      });

      if (!response.ok) {
        throw new Error(`Failed to manually schedule request (${response.status})`);
      }

      const payload = (await response.json()) as { message: string; request: AssistanceRequest };
      setRequests((current) => current.map((item) => (item.id === requestId ? payload.request : item)));
      setManualOpenFor(null);
      setManualScheduleTime("");
      setSuccessMessage("SMS and voice notification sent to citizen.");
    } catch (scheduleError) {
      const message = scheduleError instanceof Error ? scheduleError.message : "Unable to manually schedule appointment.";
      setError(message);
    } finally {
      setSchedulingFor(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#edf4f9] via-[#f6fbff] to-[#f0f6ef] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="rounded-2xl border border-[#cfdae7] bg-white/95 p-5 shadow-[0_14px_36px_rgba(6,33,61,0.08)]">
          <h1 className="text-2xl font-bold text-slate-900">CSC Operator Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            {operator ? `Logged in as ${operator.name} (${operator.district})` : "Loading operator session..."}
          </p>
        </header>

        {error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
        {successMessage ? (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{successMessage}</div>
        ) : null}

        {loading ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading assigned citizen requests...</div>
        ) : (
          <section className="mt-4 grid grid-cols-1 gap-3">
            {requests.length > 0 ? (
              requests.map((request) => (
                <article key={request.id} className="rounded-xl border border-[#d0dbe8] bg-white p-4 shadow-sm">
                  <div className="space-y-1 text-sm text-slate-700">
                    <p className="text-lg font-semibold text-slate-900">{request.citizen_name} - {request.district ?? request.state}</p>
                    <p>Detected Occupation: {request.detected_profile?.occupation ?? "Unknown"}</p>
                    <p>Recommended Schemes: {request.recommended_schemes?.length ?? 0}</p>
                    <p>Current Status: <span className="font-semibold capitalize">{request.status}</span></p>
                    <p>Scheduled: {request.scheduled_time ? new Date(request.scheduled_time).toLocaleString() : "Not scheduled yet"}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => autoSchedule(request.id)}
                      disabled={schedulingFor === request.id}
                      className="rounded-lg border border-[#b8cbe2] bg-[#eef4fb] px-3 py-2 text-sm font-semibold text-[#2a4f74] hover:bg-[#e3edf8] disabled:opacity-70"
                    >
                      {schedulingFor === request.id ? "Scheduling..." : "Auto Schedule"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualOpenFor(request.id);
                        setManualScheduleTime("");
                      }}
                      className="rounded-lg border border-[#d7b87d] bg-[#fff5e6] px-3 py-2 text-sm font-semibold text-[#8a5c09] hover:bg-[#ffecce]"
                    >
                      Manual Schedule
                    </button>
                  </div>

                  {manualOpenFor === request.id ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <input
                        type="datetime-local"
                        value={manualScheduleTime}
                        onChange={(event) => setManualScheduleTime(event.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#4f7aa8]"
                      />
                      <button
                        type="button"
                        onClick={() => manualSchedule(request.id)}
                        disabled={schedulingFor === request.id}
                        className="rounded-md bg-[#0c5a8f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#084872] disabled:opacity-70"
                      >
                        Confirm Manual Time
                      </button>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                No assigned citizen requests found for your account.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
