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
    <main className="min-h-screen bg-gradient-to-b from-[#ecf1fa] via-[#f7fbff] to-[#ecf5f1] px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <section className="rounded-[2rem] border border-[#d3ddef] bg-[#0f2238] p-5 text-white shadow-[0_22px_50px_rgba(10,30,52,0.35)]">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.18em] text-[#bcd3ec]">IVR Demo Simulation</p>
            <PhoneCall size={18} className="text-[#8ce3bf]" />
          </div>

          <div className="mt-4 rounded-2xl bg-[#132b46] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#9ec0de]">Call Status</p>
            <p className="mt-1 text-lg font-semibold">
              {loading ? "Analyzing caller details..." : `Step ${step} of 4`}
            </p>

            {step === 1 ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-[#d4e2f0]">Speak or type your situation and SAARTHI IVR will identify schemes.</p>
                <textarea
                  value={ivrInput}
                  onChange={(event) => setIvrInput(event.target.value)}
                  placeholder="Example: I am a farmer with low income and need irrigation support"
                  className="min-h-28 w-full rounded-xl border border-[#2d4865] bg-[#0f2238] p-3 text-sm text-white outline-none focus:border-[#66b6ff]"
                />
                <button
                  type="button"
                  onClick={submitIvrInput}
                  disabled={loading}
                  className="w-full rounded-xl bg-[#1c7db9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#166896] disabled:opacity-70"
                >
                  Start IVR Analysis
                </button>
              </div>
            ) : null}

            {step >= 3 ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold text-[#d7ebff]">Top 3 Schemes</p>
                {topThree.length > 0 ? (
                  topThree.map((scheme) => (
                    <div key={scheme.scheme_id} className="rounded-lg border border-[#2f506f] bg-[#173552] p-3">
                      <p className="text-sm font-semibold text-white">{scheme.name}</p>
                      <p className="text-xs text-[#b6cde4]">Match Score: {Math.round(scheme.match_score)}%</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#d4e2f0]">No schemes found for this simulation.</p>
                )}

                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (topThree[0]?.apply_link) {
                        window.open(topThree[0].apply_link, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className="rounded-lg border border-[#3b6f95] bg-[#1a5f88] px-3 py-2 text-sm font-semibold text-white hover:bg-[#124a6d]"
                  >
                    Press 1 -&gt; Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssistForm((current) => !current);
                      setStep(4);
                    }}
                    className="rounded-lg border border-[#5d7d4a] bg-[#365f3f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2a4f31]"
                  >
                    Press 2 -&gt; Request CSC Assistance
                  </button>
                </div>

                {showAssistForm ? (
                  <div className="space-y-2 rounded-lg border border-[#2f506f] bg-[#102a42] p-3">
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Name"
                      className="w-full rounded-md border border-[#325273] bg-[#0f2238] px-3 py-2 text-sm text-white outline-none focus:border-[#67b7ff]"
                    />
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Phone Number"
                      className="w-full rounded-md border border-[#325273] bg-[#0f2238] px-3 py-2 text-sm text-white outline-none focus:border-[#67b7ff]"
                    />
                    <input
                      value={stateName}
                      onChange={(event) => setStateName(event.target.value)}
                      placeholder="State"
                      className="w-full rounded-md border border-[#325273] bg-[#0f2238] px-3 py-2 text-sm text-white outline-none focus:border-[#67b7ff]"
                    />
                    <button
                      type="button"
                      onClick={requestCscAssistance}
                      className="w-full rounded-md bg-[#1c7db9] px-3 py-2 text-sm font-semibold text-white hover:bg-[#166896]"
                    >
                      Submit Assistance Request
                    </button>
                    {assistMessage ? <p className="text-xs text-[#9fd1f9]">{assistMessage}</p> : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {error ? <p className="mt-3 text-sm text-[#ffb6b6]">{error}</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
