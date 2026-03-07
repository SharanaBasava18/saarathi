"use client";

import { useMemo, useState } from "react";

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
  { label: "Farmer", message: "I am a small farmer with low income" },
  { label: "Student", message: "I am a student from a low income family" },
  { label: "Widow", message: "I am a widow living in a rural area" },
  { label: "Unemployed", message: "I am unemployed and looking for government support" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      text: "Tell me about your situation and I will suggest the top 3 welfare schemes you may qualify for.",
    },
  ]);
  const [loading, setLoading] = useState(false);

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
      <div className="max-w-[88%] rounded-2xl border border-[#d8e4e2] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--text-soft)] sm:max-w-[75%]">
        SAARTHI is thinking...
      </div>
    ),
    []
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-5 rounded-card border border-[#dbe3e2] bg-[var(--panel)] p-6 shadow-card sm:p-7">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-coral">Hackathon Demo</p>
        <h1 className="text-2xl font-bold leading-tight text-[var(--text-main)] sm:text-3xl">SAARTHI Chat Assistant</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-soft)] sm:text-base">
          Chat in plain language. SAARTHI analyzes your profile and replies with the top 3 schemes.
        </p>
      </section>

      <section className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-card border border-[#d8e4e2] bg-white/70 p-4 sm:p-5">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  isUser
                    ? "max-w-[88%] rounded-2xl bg-[#0f8a7a] px-4 py-3 text-sm text-white sm:max-w-[75%]"
                    : "max-w-[88%] rounded-2xl border border-[#d8e4e2] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--text-main)] sm:max-w-[75%]"
                }
              >
                <p className="whitespace-pre-wrap leading-6">{message.text}</p>

                {message.detectedProfile ? (
                  <div className="mt-3 rounded-lg border border-[#dce7e4] bg-[#f8fbfa] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355a57]">
                      Detected Citizen Profile
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-[var(--text-main)] sm:text-sm">
                      <p>Occupation: {message.detectedProfile.occupation ?? "N/A"}</p>
                      <p>
                        Income:{" "}
                        {message.detectedProfile.income !== null ? message.detectedProfile.income : "N/A"}
                      </p>
                      <p>Age: {message.detectedProfile.age !== null ? message.detectedProfile.age : "N/A"}</p>
                      <p>State: {message.detectedProfile.state ?? "N/A"}</p>
                      {message.detectedProfile.category ? <p>Category: {message.detectedProfile.category}</p> : null}
                    </div>
                  </div>
                ) : null}

                {message.eligibilityImprovements && message.eligibilityImprovements.length > 0 ? (
                  <div className="mt-3 rounded-lg border border-[#dce7e4] bg-[#f8fbfa] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355a57]">
                      Improve Your Eligibility
                    </p>
                    <p className="mt-2 text-xs text-[var(--text-main)] sm:text-sm">
                      To increase your chances of qualifying for more schemes:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[var(--text-main)] sm:text-sm">
                      {message.eligibilityImprovements.map((improvement) => (
                        <li key={`${message.id}-${improvement}`}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {message.recommendations ? (
                  <div className="mt-3 space-y-3">
                    {message.benefitsSummary ? (
                      <div className="rounded-lg border border-[#dce7e4] bg-[#f8fbfa] p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#355a57]">
                          Potential Benefits Summary
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-[var(--text-main)] sm:text-sm">
                          <p>
                            Total estimated benefits: INR {message.benefitsSummary.total_monetary_benefits.toLocaleString()}
                          </p>
                          <p>
                            Major support types:{" "}
                            {message.benefitsSummary.major_support_types.length > 0
                              ? message.benefitsSummary.major_support_types.join(", ")
                              : "Not identified"}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {message.recommendations.map((scheme, index) => (
                      <SchemeCard key={`${message.id}-${scheme.scheme_id}`} scheme={scheme} rank={index + 1} />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {loading ? <div className="flex justify-start">{loadingBubble}</div> : null}
      </section>

      <InputBox isLoading={loading} onSubmit={handleSubmit} quickExamples={QUICK_EXAMPLES} />
    </main>
  );
}
