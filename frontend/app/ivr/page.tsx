"use client";

import { useMemo, useState } from "react";

import { PhoneCall } from "lucide-react";

type SchemeRecommendation = {
  scheme_id: string;
  name: string;
  match_score: number;
  apply_link: string;
};

type RecommendationResponse = {
  extracted_profile: {
    age: number | null;
    occupation: string | null;
    education: string | null;
    state: string | null;
    income: number | null;
    category: string | null;
  };
  recommendations: SchemeRecommendation[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type IvrStep = 1 | 2 | 3 | 4;

export default function IvrDemoPage() {
  const [ivrInput, setIvrInput] = useState("");
  const [step, setStep] = useState<IvrStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detectedProfile, setDetectedProfile] = useState<RecommendationResponse["extracted_profile"] | null>(null);
  const [recommendations, setRecommendations] = useState<SchemeRecommendation[]>([]);
  const [showAssistForm, setShowAssistForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [stateName, setStateName] = useState("");
  const [assistMessage, setAssistMessage] = useState("");

  const topThree = useMemo(() => recommendations.slice(0, 3), [recommendations]);

  const submitIvrInput = async () => {
    const trimmed = ivrInput.trim();
    if (trimmed.length < 10) {
      setError("Please speak or type a bit more detail for IVR analysis.");
      return;
    }

    setLoading(true);
    setError("");
    setStep(2);

    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_input: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Recommendation failed (${response.status})`);
      }

      const data = (await response.json()) as RecommendationResponse;
      setDetectedProfile(data.extracted_profile);
      setRecommendations(data.recommendations);
      setStep(3);
    } catch (recommendError) {
      const message = recommendError instanceof Error ? recommendError.message : "Unable to process call.";
      setError(message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const requestCscAssistance = async () => {
    if (!name.trim() || !phone.trim() || !stateName.trim()) {
      setAssistMessage("Please provide name, phone number, and state.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/request-assistance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          citizen_name: name,
          phone_number: phone,
          state: stateName,
          detected_profile: detectedProfile ?? {},
          recommended_schemes: topThree,
        }),
      });

      if (!response.ok) {
        throw new Error(`Assistance request failed (${response.status})`);
      }

      setAssistMessage("Your request has been sent to a CSC operator. You will be contacted soon.");
    } catch (assistanceError) {
      const message = assistanceError instanceof Error ? assistanceError.message : "Unable to submit assistance request.";
      setAssistMessage(message);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#0f2238] to-[#0a1929] p-5 text-white shadow-[0_22px_50px_rgba(10,30,52,0.4)]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">IVR Demo Simulation</p>
            <PhoneCall size={18} className="text-emerald-400" />
          </div>

          <div className="mt-4 rounded-2xl bg-white/[0.06] p-4 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Call Status</p>
            <p className="mt-1 text-lg font-semibold">
              {loading ? "Analyzing caller details..." : `Step ${step} of 4`}
            </p>

            {step === 1 ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-slate-300">Speak or type your situation and SAARTHI IVR will identify schemes.</p>
                <textarea
                  value={ivrInput}
                  onChange={(event) => setIvrInput(event.target.value)}
                  placeholder="Example: I am a farmer with low income and need irrigation support"
                  className="min-h-28 w-full rounded-xl border border-white/10 bg-white/[0.05] p-3 text-sm text-white outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-slate-500 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10"
                />
                <button
                  type="button"
                  onClick={submitIvrInput}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition-all duration-200 hover:brightness-110 disabled:opacity-70"
                >
                  Start IVR Analysis
                </button>
              </div>
            ) : null}

            {step >= 3 ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold text-slate-200">Top 3 Schemes</p>
                {topThree.length > 0 ? (
                  topThree.map((scheme) => (
                    <div key={scheme.scheme_id} className="rounded-xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-sm">
                      <p className="text-sm font-semibold text-white">{scheme.name}</p>
                      <p className="text-xs text-slate-400">Match Score: {Math.round(scheme.match_score)}%</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-300">No schemes found for this simulation.</p>
                )}

                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (topThree[0]?.apply_link) {
                        window.open(topThree[0].apply_link, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.12]"
                  >
                    Press 1 -&gt; Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssistForm((current) => !current);
                      setStep(4);
                    }}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 backdrop-blur-sm transition-all duration-200 hover:bg-emerald-500/20"
                  >
                    Press 2 -&gt; Request CSC Assistance
                  </button>
                </div>

                {showAssistForm ? (
                  <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm">
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Name"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none backdrop-blur-sm placeholder:text-slate-500 transition-all duration-200 focus:border-emerald-500/40"
                    />
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Phone Number"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none backdrop-blur-sm placeholder:text-slate-500 transition-all duration-200 focus:border-emerald-500/40"
                    />
                    <input
                      value={stateName}
                      onChange={(event) => setStateName(event.target.value)}
                      placeholder="State"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none backdrop-blur-sm placeholder:text-slate-500 transition-all duration-200 focus:border-emerald-500/40"
                    />
                    <button
                      type="button"
                      onClick={requestCscAssistance}
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition-all duration-200 hover:brightness-110"
                    >
                      Submit Assistance Request
                    </button>
                    {assistMessage ? <p className="text-xs text-emerald-300/80">{assistMessage}</p> : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
