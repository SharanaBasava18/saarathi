"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Bot, BriefcaseBusiness, CheckCircle2, GraduationCap, HeartPulse, House, ShieldCheck, Sprout, User, Waves, XCircle } from "lucide-react";

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
  scheme_categories?: string[];
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
  { label: "Widow Support", message: "I am a widow living in a rural area" },
  { label: "Unemployed", message: "I am unemployed and looking for government support" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const BENEFIT_BENCHMARK_INR = 200000;

const VAULT_DOCUMENTS: Array<{ name: string; available: boolean }> = [
  { name: "Aadhaar Card", available: false },
  { name: "Bank Passbook", available: false },
  { name: "Income Certificate", available: false },
  { name: "Mobile Number Verified", available: false },
  { name: "Land Ownership Record", available: false },
];

const CATEGORY_ICON_MAP: Record<string, JSX.Element> = {
  education: <GraduationCap size={14} />,
  employment: <BriefcaseBusiness size={14} />,
  healthcare: <HeartPulse size={14} />,
  housing: <House size={14} />,
  agriculture: <Sprout size={14} />,
};

const formatCurrency = (value: number | null) => {
  if (value === null) {
    return "N/A";
  }

  return `₹${value.toLocaleString("en-IN")}`;
};

const normalizeDoc = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

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
  const [showAllSchemes, setShowAllSchemes] = useState(false);
  const [animatedBenefit, setAnimatedBenefit] = useState(0);
  const [vaultDocuments, setVaultDocuments] = useState(VAULT_DOCUMENTS);

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
    setShowAllSchemes(false);

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
          text: "I found eligible schemes based on your profile. Review top recommendations and expand to view all matches.",
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
  const topSchemes = useMemo(() => recommendedSchemes.slice(0, 3), [recommendedSchemes]);
  const displayedSchemes = showAllSchemes ? recommendedSchemes : topSchemes;
  const supportTarget = Math.round(benefitsSummary?.total_monetary_benefits ?? 0);

  useEffect(() => {
    if (!benefitsSummary) {
      setAnimatedBenefit(0);
      return;
    }

    const target = Math.round(benefitsSummary.total_monetary_benefits);
    if (target <= 0) {
      setAnimatedBenefit(0);
      return;
    }

    let raf = 0;
    const duration = 1100;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setAnimatedBenefit(Math.round(target * progress));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [benefitsSummary]);

  const categorySummary = useMemo(() => {
    const allCategories = new Set<string>();
    for (const scheme of recommendedSchemes) {
      for (const category of scheme.scheme_categories ?? []) {
        allCategories.add(category.toLowerCase());
      }
    }
    return Array.from(allCategories);
  }, [recommendedSchemes]);

  const allRequiredDocuments = useMemo(() => {
    const docs = new Set<string>();
    for (const scheme of recommendedSchemes) {
      for (const document of scheme.documents_required ?? []) {
        const normalized = document.trim();
        if (normalized) {
          docs.add(normalized);
        }
      }
    }
    return Array.from(docs);
  }, [recommendedSchemes]);

  const isDocumentInVault = (documentName: string) => {
    const normalized = normalizeDoc(documentName);
    return vaultDocuments.some((vaultDocument) => {
      if (!vaultDocument.available) {
        return false;
      }

      const vaultNormalized = normalizeDoc(vaultDocument.name);
      if (normalized.includes(vaultNormalized) || vaultNormalized.includes(normalized)) {
        return true;
      }

      const keywordMap: Array<{ pattern: RegExp; key: string }> = [
        { pattern: /(aadhaar|aadhar|identity)/, key: "aadhaar" },
        { pattern: /(bank|passbook|account)/, key: "bank passbook" },
        { pattern: /(income|salary|itr)/, key: "income certificate" },
        { pattern: /(mobile|phone|verified)/, key: "mobile number verified" },
        { pattern: /(land|ownership|property|patta)/, key: "land ownership" },
      ];

      const matchedKey = keywordMap.find((item) => item.pattern.test(normalized))?.key;
      return matchedKey ? vaultNormalized.includes(matchedKey) : false;
    });
  };

  const missingDocuments = useMemo(() => {
    return allRequiredDocuments.filter((document) => !isDocumentInVault(document));
  }, [allRequiredDocuments, vaultDocuments]);

  const availableRequiredDocumentsCount = useMemo(
    () => allRequiredDocuments.filter((document) => isDocumentInVault(document)).length,
    [allRequiredDocuments, vaultDocuments]
  );

  const readinessScore = useMemo(() => {
    if (recommendedSchemes.length === 0) {
      return 0;
    }

    if (allRequiredDocuments.length === 0) {
      return 100;
    }

    return Math.round((availableRequiredDocumentsCount / allRequiredDocuments.length) * 100);
  }, [allRequiredDocuments.length, availableRequiredDocumentsCount, recommendedSchemes.length]);

  const benefitProgress = useMemo(() => {
    if (supportTarget <= 0 || animatedBenefit <= 0) {
      return 0;
    }
    const maxProgress = Math.min(100, (supportTarget / BENEFIT_BENCHMARK_INR) * 100);
    return Math.min(100, (animatedBenefit / supportTarget) * maxProgress);
  }, [animatedBenefit, supportTarget]);

  const readinessBarColor = useMemo(() => {
    if (readinessScore >= 80) {
      return "bg-green-500";
    }
    if (readinessScore >= 50) {
      return "bg-yellow-500";
    }
    return "bg-red-500";
  }, [readinessScore]);

  const downloadChecklist = (scheme: SchemeRecommendation) => {
    const content = [
      `Scheme Name: ${scheme.name}`,
      "",
      "Required Documents:",
      ...(scheme.documents_required && scheme.documents_required.length > 0
        ? scheme.documents_required.map((document, index) => `${index + 1}. ${document}`)
        : ["None specified"]),
      "",
      "Application Steps:",
      ...(scheme.application_steps && scheme.application_steps.length > 0
        ? scheme.application_steps.map((step, index) => `${index + 1}. ${step}`)
        : ["None specified"]),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = scheme.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    link.href = url;
    link.download = `${safeName || "scheme"}-application-checklist.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const toggleVaultDocument = (documentName: string) => {
    setVaultDocuments((current) =>
      current.map((document) =>
        document.name === documentName ? { ...document, available: !document.available } : document
      )
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#edf3f9] via-[#f7fbff] to-[#f2f5ef] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#cfdae7] bg-white/90 px-4 py-3 shadow-[0_14px_36px_rgba(6,33,61,0.08)] sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/saarthi-logo.png"
              alt="SAARTHI Logo"
              className="h-12 w-12 rounded-full object-cover border border-slate-200 shadow-sm"
            />
            <div>
              <p className="text-2xl font-bold text-slate-900">SAARTHI</p>
              <p className="text-sm text-slate-600">Smart Accessible Assistance</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#d5e0ec] bg-[#f6f9fc] px-4 py-2 text-sm font-semibold text-[#2d4f73]">
            <Waves size={16} />
            <span>Multilingual Voice Support (Powered by Bhashini)</span>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-8">
            <div className="rounded-2xl border border-[#d2deea] bg-white p-4 shadow-[0_14px_36px_rgba(6,33,61,0.08)] sm:p-5">
              <div className="max-h-[340px] space-y-4 overflow-y-auto pr-1">
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
                        <span className="mt-1 text-base text-slate-600">
                          {isUser ? <User size={16} /> : <Bot size={16} />}
                        </span>
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

            <InputBox isLoading={loading} onSubmit={handleSubmit} quickExamples={QUICK_EXAMPLES} />

            <div className="rounded-2xl border border-[#d2deea] bg-white p-4 shadow-[0_14px_36px_rgba(6,33,61,0.08)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-slate-900">Eligible Scheme Dashboard</h2>
                {recommendedSchemes.length > 0 ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {recommendedSchemes.length} schemes
                  </span>
                ) : null}
              </div>

              {recommendedSchemes.length > 0 ? (
                <>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">Impact Summary</p>
                    <p className="mt-2 text-sm text-slate-700">Based on your profile you may qualify for:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800">
                      <li>{recommendedSchemes.length} government welfare schemes</li>
                      <li>{formatCurrency(supportTarget)} potential annual support</li>
                      <li>
                        {categorySummary.length > 0
                          ? `${categorySummary.slice(0, 3).map((category) => category.replace(/\b\w/g, (char) => char.toUpperCase())).join(", ")} assistance`
                          : "General assistance"}
                      </li>
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {categorySummary.length > 0 ? (
                        categorySummary.map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center gap-1 rounded-full border border-[#ccdae8] bg-[#f8fbff] px-3 py-1 text-xs font-semibold text-[#325778]"
                          >
                            {CATEGORY_ICON_MAP[category] ?? <Waves size={14} />}
                            {category.replace(/\b\w/g, (char) => char.toUpperCase())}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-600">General Support</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">Your Estimated Government Support</p>
                    <p className="mt-2 text-3xl font-bold text-[#0a4470]">₹{animatedBenefit.toLocaleString("en-IN")}</p>
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#21517e]">Potential Annual Support</p>
                      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[#d9e6f7]">
                        <div className="h-full rounded-full bg-[#0a6aa1] transition-all duration-200" style={{ width: `${benefitProgress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">Application Readiness</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className={`h-full rounded-full transition-all duration-500 ${readinessBarColor}`} style={{ width: `${readinessScore}%` }} />
                      </div>
                      <span className="min-w-12 text-right text-sm font-semibold text-slate-800">{readinessScore}%</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">Live readiness score updates as vault documents are toggled.</p>
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="text-xs text-slate-600">
                        Ready documents: {availableRequiredDocumentsCount} / {allRequiredDocuments.length}
                      </p>
                      {missingDocuments.length > 0 ? (
                        <>
                          <p className="font-semibold text-slate-900">Missing Documents:</p>
                          <ul className="mt-1 list-disc space-y-1 pl-5">
                            {missingDocuments.slice(0, 6).map((document) => (
                              <li key={document}>{document}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="font-semibold text-slate-900">Your application profile is ready.</p>
                      )}
                    </div>
                  </div>
                </>
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
                <>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">Top Recommended Schemes (Top 3)</h3>
                    {!showAllSchemes && recommendedSchemes.length > 3 ? (
                      <button
                        type="button"
                        onClick={() => setShowAllSchemes(true)}
                        className="rounded-lg border border-[#bfd0e2] bg-[#eef4fb] px-3 py-1.5 text-sm font-semibold text-[#2b4f72] transition hover:bg-[#e3edf8]"
                      >
                        View All Eligible Schemes
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
                    {displayedSchemes.map((scheme, index) => (
                      <SchemeCard
                        key={scheme.scheme_id}
                        scheme={scheme}
                        rank={index + 1}
                        readyDocumentsCount={(scheme.documents_required ?? []).filter((document) => isDocumentInVault(document)).length}
                        totalDocumentsCount={(scheme.documents_required ?? []).length}
                        isReadyToApply={
                          (scheme.documents_required ?? []).length === 0 ||
                          (scheme.documents_required ?? []).every((document) => isDocumentInVault(document))
                        }
                        onDownloadChecklist={downloadChecklist}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  Submit your situation above to view recommended schemes.
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-2xl border border-[#d2deea] bg-white p-5 shadow-[0_14px_36px_rgba(6,33,61,0.08)] lg:col-span-4">
            <h2 className="text-2xl font-semibold text-slate-900">Profile Module</h2>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">Detected Citizen Profile</p>

              {detectedProfile ? (
                <div className="mt-3 space-y-2 text-sm text-slate-800">
                  <p>Occupation: {detectedProfile.occupation ?? "Unknown"}</p>
                  <p>Education: {detectedProfile.education ?? "Not Provided"}</p>
                  <p>Annual Income: {detectedProfile.income !== null ? formatCurrency(detectedProfile.income) : "Not Provided"}</p>
                  <p>Age: {detectedProfile.age ?? "Unknown"}</p>
                  <p>State: {detectedProfile.state ?? "Unknown"}</p>
                  <p>Category: {detectedProfile.category ?? "Not Provided"}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  Share your details in chat to auto-fill this profile using SAARTHI extraction.
                </p>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#1e4a76]" />
                <p className="text-lg font-semibold text-slate-900">Citizen Document Vault</p>
              </div>
              <p className="mt-1 text-sm text-slate-600">Secure access to your government documents</p>

              {recommendedSchemes.length > 0 ? (
                <>
                  <div className="mt-3 space-y-2 rounded-xl border border-[#d5deea] bg-[#f8fbff] p-3">
                    {vaultDocuments.map((document) => (
                      <button
                        key={document.name}
                        type="button"
                        onClick={() => toggleVaultDocument(document.name)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm transition hover:bg-[#eef4fb]"
                      >
                        <span className="text-slate-800">{document.name}</span>
                        <span className="inline-flex items-center gap-1 font-semibold">
                          {document.available ? (
                            <>
                              <CheckCircle2 size={16} className="text-green-600" />
                              <span className="text-green-700">Uploaded</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} className="text-red-600" />
                              <span className="text-red-700">Missing</span>
                            </>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-600">Demo Mode: Toggle documents to simulate citizen readiness.</p>
                </>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
                  Submit your situation to analyze required documents.
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
