"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import InputBox from "@/components/InputBox";
import SchemeCard from "@/components/SchemeCard";

type SchemeRecommendation = {
  scheme_id: string;
  name: string;
  match_score: number;
  rationale: string;
  description?: string;
  apply_link: string;
  documents_required?: string[];
  application_steps?: string[];
  estimated_benefit?: number | null;
};

type RecommendationResponse = {
  extracted_profile: {
    occupation: string | null;
    income: number | null;
    age: number | null;
    state: string | null;
    category: string | null;
  };
  eligibility_improvements: string[];
  benefits_summary: {
    total_monetary_benefits: number;
    major_support_types: string[];
  } | null;
  recommendations: SchemeRecommendation[];
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  recommendations?: SchemeRecommendation[];
  detectedProfile?: RecommendationResponse["extracted_profile"];
  eligibilityImprovements?: string[];
  benefitsSummary?: RecommendationResponse["benefits_summary"];
};

const QUICK_EXAMPLES = [
  { label: "👨‍🌾 Farmer", message: "I am a small farmer with low income" },
  { label: "🎓 Student", message: "I am a student from a low income family" },
  { label: "👩 Widow", message: "I am a widow living in a rural area" },
  { label: "💼 Unemployed", message: "I am unemployed and looking for government support" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const JOURNEY_STEPS = [
  { key: "voice", title: "Voice Input", icon: "🎤" },
  { key: "profile", title: "Profile Creation", icon: "📋" },
  { key: "analysis", title: "Scheme Analysis", icon: "⚙️" },
  { key: "shortlist", title: "Shortlist Generated", icon: "✅" },
] as const;

const formatCurrency = (value: number | null) => {
  if (value === null) {
    return "N/A";
  }

  return `₹${value.toLocaleString("en-IN")}`;
};

const getSchemeTags = (scheme: SchemeRecommendation): string[] => {
  const source = `${scheme.name} ${scheme.description ?? ""} ${scheme.rationale}`.toLowerCase();
  const matched: string[] = [];

  const tagRules: Array<{ test: RegExp; label: string }> = [
    { test: /farmer|agri|crop|kisan|rural/, label: "Agriculture" },
    { test: /health|hospital|medical|insurance|aarogya/, label: "Healthcare" },
    { test: /education|student|scholarship|school/, label: "Education" },
    { test: /housing|awas|home|shelter/, label: "Housing" },
    { test: /income|cash|support|benefit|financial/, label: "Income Support" },
    { test: /women|widow|mother|girl/, label: "Women Support" },
    { test: /pension|senior|elderly/, label: "Pension" },
    { test: /employment|skill|job|livelihood/, label: "Employment" },
  ];

  for (const rule of tagRules) {
    if (rule.test.test(source)) {
      matched.push(rule.label);
    }
  }

  if (matched.length === 0) {
    return ["General Support"];
  }

  return matched.slice(0, 2);
};

export default function Home() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      text: "Describe your situation and SAARTHI will identify government welfare schemes you may qualify for.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);

  const handleSubmit = async (userText: string) => {
    const trimmed = userText.trim();
    if (trimmed.length < 10) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Please share a little more detail so I can match schemes accurately.",
        },
      ]);
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        text: trimmed,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_input: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as RecommendationResponse;
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Here are the top 3 schemes based on your profile.",
          recommendations: data.recommendations,
          detectedProfile: data.extracted_profile,
          eligibilityImprovements: data.eligibility_improvements,
          benefitsSummary: data.benefits_summary,
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `I could not fetch recommendations right now. ${message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadingBubble = useMemo(
    () => (
      <div className="max-w-[88%] animate-pulse rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-[var(--text-soft)] shadow-sm sm:max-w-[75%]">
        Analyzing your profile...
      </div>
    ),
    []
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const latestRecommendationMessage = useMemo(
    () => [...messages].reverse().find((message) => message.recommendations && message.recommendations.length > 0),
    [messages]
  );

  const detectedProfile = latestRecommendationMessage?.detectedProfile ?? null;
  const eligibilityImprovements = latestRecommendationMessage?.eligibilityImprovements ?? [];
  const benefitsSummary = latestRecommendationMessage?.benefitsSummary ?? null;
  const recommendedSchemes = latestRecommendationMessage?.recommendations ?? [];

  const selectedScheme =
    recommendedSchemes.find((scheme) => scheme.scheme_id === selectedSchemeId) ?? recommendedSchemes[0] ?? null;

  useEffect(() => {
    if (recommendedSchemes.length === 0) {
      setSelectedSchemeId(null);
      return;
    }

    const currentIsValid = recommendedSchemes.some((scheme) => scheme.scheme_id === selectedSchemeId);
    if (!currentIsValid) {
      setSelectedSchemeId(recommendedSchemes[0].scheme_id);
    }
  }, [recommendedSchemes, selectedSchemeId]);

  const selectedSchemeRank = selectedScheme
    ? recommendedSchemes.findIndex((scheme) => scheme.scheme_id === selectedScheme.scheme_id) + 1
    : 1;

  const stepCompletion = {
    voice: messages.some((message) => message.role === "user"),
    profile: Boolean(detectedProfile),
    analysis: loading || recommendedSchemes.length > 0,
    shortlist: !loading && recommendedSchemes.length > 0,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-7xl space-y-4 pb-28">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">🤖</div>
            <div>
              <p className="text-2xl font-bold leading-tight text-slate-900">SAARTHI</p>
              <p className="text-sm text-slate-600">Smart Accessible Assistance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-slate-300 bg-slate-50 p-1 shadow-sm">
              <button type="button" className="rounded-full bg-[#294172] px-3 py-1 text-sm font-semibold text-white">
                EN
              </button>
              <button type="button" className="rounded-full px-3 py-1 text-sm font-semibold text-slate-600">
                KA
              </button>
            </div>
            <button
              type="button"
              aria-label="Profile"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-lg shadow-sm"
            >
              👤
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
            <h2 className="text-2xl font-semibold text-slate-900">Status Journey</h2>
            <div className="mt-5 space-y-4">
              {JOURNEY_STEPS.map((step, index) => {
                const completed = stepCompletion[step.key];

                return (
                  <div key={step.key} className="relative pl-2">
                    {index < JOURNEY_STEPS.length - 1 ? (
                      <span className="absolute left-6 top-12 h-8 border-l-2 border-slate-200" aria-hidden="true" />
                    ) : null}

                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg ${
                          completed ? "border-green-200 bg-green-100" : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        {step.icon}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500">{index + 1}</p>
                        <p className="text-lg font-semibold leading-5 text-slate-900">{step.title}</p>
                      </div>
                      <span className={`text-xl ${completed ? "text-green-600" : "text-slate-300"}`}>✔</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="space-y-4 lg:col-span-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="max-h-[380px] space-y-4 overflow-y-auto pr-1">
                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={
                          isUser
                            ? "flex max-w-[92%] flex-row-reverse items-start gap-2 sm:max-w-[80%]"
                            : "flex max-w-[92%] items-start gap-2 sm:max-w-[80%]"
                        }
                      >
                        <span className="mt-1 text-base">{isUser ? "👤" : "🤖"}</span>
                        <div
                          className={
                            isUser
                              ? "rounded-xl bg-[#e8f2ff] px-4 py-3 text-sm text-[#17365d] shadow-sm"
                              : "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm"
                          }
                        >
                          <p className="whitespace-pre-wrap leading-6">{message.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {loading ? <div className="flex justify-start">{loadingBubble}</div> : null}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-slate-900">Eligible Scheme Dashboard</h2>
                {recommendedSchemes.length > 0 ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {recommendedSchemes.length} schemes
                  </span>
                ) : null}
              </div>

              {benefitsSummary ? (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-sm text-slate-700">
                  <p>
                    Total estimated benefits: <strong>₹{benefitsSummary.total_monetary_benefits.toLocaleString("en-IN")}</strong>
                  </p>
                  <p className="mt-1">
                    Major support types:{" "}
                    {benefitsSummary.major_support_types.length > 0
                      ? benefitsSummary.major_support_types.join(", ")
                      : "Not identified"}
                  </p>
                </div>
              ) : null}

              {eligibilityImprovements.length > 0 ? (
                <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Eligibility Explanation</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {eligibilityImprovements.map((improvement) => (
                      <li key={improvement}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {recommendedSchemes.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {recommendedSchemes.map((scheme) => {
                    const tags = getSchemeTags(scheme);

                    return (
                      <article key={scheme.scheme_id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <h3 className="line-clamp-2 min-h-12 text-base font-semibold text-slate-900">{scheme.name}</h3>
                        <p className="mt-1 text-sm font-medium text-slate-700">Match: {Math.round(scheme.match_score)}%</p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span key={`${scheme.scheme_id}-${tag}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedSchemeId(scheme.scheme_id)}
                          className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                        >
                          View Details
                        </button>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  Submit your situation above to view recommended schemes.
                </div>
              )}

              {selectedScheme ? (
                <div className="mt-4">
                  <SchemeCard scheme={selectedScheme} rank={selectedSchemeRank} />
                </div>
              ) : null}
            </div>
          </section>

          <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
            <h2 className="text-2xl font-semibold text-slate-900">Profile Module</h2>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">Detected Citizen Profile</p>

              {detectedProfile ? (
                <div className="mt-3 space-y-2 text-sm text-slate-800">
                  <p>👨‍🌾 Occupation: {detectedProfile.occupation ?? "N/A"}</p>
                  <p>💰 Annual Income: {formatCurrency(detectedProfile.income)}</p>
                  <p>🧓 Age: {detectedProfile.age ?? "N/A"}</p>
                  <p>📍 State: {detectedProfile.state ?? "N/A"}</p>
                  <p>🪪 Category: {detectedProfile.category ?? "N/A"}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  Share your details in chat to auto-fill this profile using SAARTHI extraction.
                </p>
              )}
            </div>
          </aside>
        </section>

        <InputBox isLoading={loading} onSubmit={handleSubmit} quickExamples={QUICK_EXAMPLES} />
      </div>

      <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            aria-label="Voice Assistant"
            className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-2xl text-white shadow-lg"
          >
            🎤
          </button>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">Voice Assistant</span>
        </div>
      </div>
    </main>
  );
}
