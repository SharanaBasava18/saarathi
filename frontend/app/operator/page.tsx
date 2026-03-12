"use client";

import { useEffect, useState } from "react";

type AssistanceRequest = {
  id: string;
  citizen_name: string;
  phone_number: string;
  state: string;
  detected_profile: {
    occupation?: string | null;
  };
  recommended_schemes: Array<{ scheme_id?: string; name?: string }>;
  status: "pending" | "assigned" | "scheduled" | "completed";
  assigned_csc_operator: string | null;
  scheduled_time: string | null;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function OperatorDashboardPage() {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFormFor, setActiveFormFor] = useState<string | null>(null);
  const [operatorName, setOperatorName] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [submittingFor, setSubmittingFor] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/operator/requests`);
      if (!response.ok) {
        throw new Error(`Failed to fetch operator requests (${response.status})`);
      }
      const data = (await response.json()) as AssistanceRequest[];
      setRequests(data);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Unable to load requests.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const scheduleAssistance = async (requestId: string) => {
    if (!operatorName.trim() || !scheduleTime.trim()) {
      setError("Please enter operator name and schedule time.");
      return;
    }

    setSubmittingFor(requestId);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/operator/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: requestId,
          operator_name: operatorName,
          scheduled_time: scheduleTime,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to schedule assistance (${response.status})`);
      }

      const updated = (await response.json()) as AssistanceRequest;
      setRequests((current) => current.map((item) => (item.id === requestId ? updated : item)));
      setActiveFormFor(null);
      setOperatorName("");
      setScheduleTime("");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to schedule request.";
      setError(message);
    } finally {
      setSubmittingFor(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#edf4f9] via-[#f6fbff] to-[#f0f6ef] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="rounded-2xl border border-[#cfdae7] bg-white/95 p-5 shadow-[0_14px_36px_rgba(6,33,61,0.08)]">
          <h1 className="text-2xl font-bold text-slate-900">CSC Operator Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Manage citizen assistance requests and schedule support calls.</p>
        </header>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading assistance requests...</div>
        ) : (
          <section className="mt-4 grid grid-cols-1 gap-3">
            {requests.length > 0 ? (
              requests.map((request) => (
                <article key={request.id} className="rounded-xl border border-[#d0dbe8] bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 text-sm text-slate-700">
                      <p className="text-lg font-semibold text-slate-900">{request.citizen_name}</p>
                      <p>State: {request.state}</p>
                      <p>Detected Occupation: {request.detected_profile?.occupation ?? "Unknown"}</p>
                      <p>Recommended Schemes: {request.recommended_schemes?.length ?? 0}</p>
                      <p>Current Status: <span className="font-semibold capitalize">{request.status}</span></p>
                      {request.scheduled_time ? <p>Scheduled Time: {request.scheduled_time}</p> : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveFormFor(request.id);
                        setOperatorName(request.assigned_csc_operator ?? "");
                        setScheduleTime(request.scheduled_time ?? "");
                      }}
                      className="rounded-lg border border-[#b8cbe2] bg-[#eef4fb] px-3 py-2 text-sm font-semibold text-[#2a4f74] hover:bg-[#e3edf8]"
                    >
                      Schedule Assistance
                    </button>
                  </div>

                  {activeFormFor === request.id ? (
                    <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto]">
                      <input
                        value={operatorName}
                        onChange={(event) => setOperatorName(event.target.value)}
                        placeholder="Operator Name"
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#4f7aa8]"
                      />
                      <input
                        value={scheduleTime}
                        onChange={(event) => setScheduleTime(event.target.value)}
                        placeholder="Schedule Time"
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#4f7aa8]"
                      />
                      <button
                        type="button"
                        onClick={() => scheduleAssistance(request.id)}
                        disabled={submittingFor === request.id}
                        className="rounded-md bg-[#0c5a8f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#084872] disabled:opacity-70"
                      >
                        {submittingFor === request.id ? "Saving..." : "Confirm"}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                No citizen assistance requests available yet.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
