"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Bot, BriefcaseBusiness, CheckCircle2, GraduationCap, HeartPulse, HelpCircle, House, Loader2, ShieldCheck, Sprout, User, UserCheck, Waves, X, XCircle } from "lucide-react";

import InputBox from "@/components/InputBox";
import ImpactStats from "@/components/ImpactStats";
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
  eligibility_reasons?: string[];
  welfare_gap?: boolean;
};

type RecommendationResponse = {
  detected_language: "en" | "hi";
  detected_documents: Record<string, boolean>;
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
  potential_unclaimed_schemes: number;
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
  potentialUnclaimedSchemes?: number;
  detectedLanguage?: "en" | "hi";
  detectedDocuments?: Record<string, boolean>;
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

const renderProfileValue = (value: string | number | null | undefined, emptyLabel: string) => {
  if (value === null || value === undefined || value === "" || value === "Unknown" || value === "Not Provided") {
    return <span className="rounded-md bg-slate-100/80 px-2 py-0.5 text-xs font-medium text-slate-400">{emptyLabel}</span>;
  }

  return <span className="font-semibold capitalize text-emerald-700">{String(value)}</span>;
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
  const [showAllSchemes, setShowAllSchemes] = useState(false);
  const [animatedBenefit, setAnimatedBenefit] = useState(0);
  const [vaultDocuments, setVaultDocuments] = useState(VAULT_DOCUMENTS);

  const [isAssistanceModalOpen, setIsAssistanceModalOpen] = useState(false);
  const [assistanceForm, setAssistanceForm] = useState({ name: "", phone: "", village: "", district: "" });
  const [assistanceStatus, setAssistanceStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [assistanceError, setAssistanceError] = useState("");
  const [assignedOperator, setAssignedOperator] = useState<{ name: string; district: string; phone: string } | null>(null);

  const latestRecommendationMessage = useMemo(
    () => [...messages].reverse().find((message) => message.recommendations && message.recommendations.length > 0),
    [messages]
  );

  const detectedProfile = latestRecommendationMessage?.detectedProfile ?? null;
  const eligibilityImprovements = latestRecommendationMessage?.eligibilityImprovements ?? [];
  const benefitsSummary = latestRecommendationMessage?.benefitsSummary ?? null;
  const potentialUnclaimedSchemes = latestRecommendationMessage?.potentialUnclaimedSchemes ?? 0;
  const detectedLanguage = latestRecommendationMessage?.detectedLanguage ?? "en";
  const detectedDocuments = latestRecommendationMessage?.detectedDocuments ?? null;
  const recommendedSchemes = latestRecommendationMessage?.recommendations ?? [];
  const topSchemes = useMemo(() => recommendedSchemes.slice(0, 3), [recommendedSchemes]);
  const displayedSchemes = showAllSchemes ? recommendedSchemes : topSchemes;
  const supportTarget = Math.round(benefitsSummary?.total_monetary_benefits ?? 0);

  const openAssistanceModal = () => {
    setAssistanceForm({
      name: "",
      phone: "",
      village: "",
      district: detectedProfile?.state ?? "",
    });
    setAssistanceStatus("idle");
    setAssistanceError("");
    setAssignedOperator(null);
    setIsAssistanceModalOpen(true);
  };

  const closeAssistanceModal = () => {
    setIsAssistanceModalOpen(false);
  };

  const submitAssistanceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistanceForm.name.trim() || !assistanceForm.phone.trim()) {
      setAssistanceError("Name and phone number are required.");
      return;
    }
    setAssistanceStatus("loading");
    setAssistanceError("");

    try {
      const res = await fetch(`${API_BASE_URL}/request-assistance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(assistanceForm.name || ""),
          phone: String(assistanceForm.phone || ""),
          village: String(assistanceForm.village || ""),
          district: String(assistanceForm.district || ""),
          occupation: String(detectedProfile?.occupation || "Not Specified"),
          recommended_schemes_count: Number(recommendedSchemes.length) || 0,
        }),
      });

      if (!res.ok) {
        const fastApiError = await res.text();
        throw new Error(`FastAPI ${res.status}: ${fastApiError}`);
      }

      const data = await res.json();
      setAssignedOperator(data.assigned_operator);
      setAssistanceStatus("success");
    } catch (err) {
      setAssistanceError(err instanceof Error ? err.message : "Something went wrong.");
      setAssistanceStatus("error");
    }
  };

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
          potentialUnclaimedSchemes: data.potential_unclaimed_schemes,
          detectedLanguage: data.detected_language,
          detectedDocuments: data.detected_documents,
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

  useEffect(() => {
    if (!detectedDocuments) {
      return;
    }

    const detectorMap: Record<string, string> = {
      aadhaar: "Aadhaar Card",
      bank_passbook: "Bank Passbook",
      income_certificate: "Income Certificate",
      land_record: "Land Ownership Record",
      caste_certificate: "Caste Certificate",
    };

    setVaultDocuments((current) => {
      const existingByName = new Map(current.map((item) => [item.name, item.available]));
      const names = new Set<string>([...current.map((item) => item.name), ...Object.values(detectorMap)]);

      return Array.from(names).map((name) => {
        const detectorKey = Object.entries(detectorMap).find(([, mappedName]) => mappedName === name)?.[0];
        if (detectorKey && detectorKey in detectedDocuments) {
          return { name, available: Boolean(detectedDocuments[detectorKey]) };
        }

        return { name, available: existingByName.get(name) ?? false };
      });
    });
  }, [detectedDocuments]);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-7xl space-y-5 pb-8">
        <ImpactStats />

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <section className="space-y-5 lg:col-span-8">
            <div className="flex justify-end">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm backdrop-blur-md">
                <Waves size={16} className="text-emerald-500" />
                <span>Multilingual Voice Support (Powered by Bhashini)</span>
              </div>
            </div>

            <div className="glass-strong relative overflow-hidden rounded-2xl p-4 shadow-glass sm:p-5">
              <div className="max-h-[380px] space-y-4 overflow-y-auto pr-1">
                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div key={message.id} className={`animate-fade-slide-up flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={
                          isUser
                            ? "flex max-w-[92%] flex-row-reverse items-start gap-2.5 sm:max-w-[78%]"
                            : "flex max-w-[92%] items-start gap-2.5 sm:max-w-[78%]"
                        }
                      >
                        <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-sm ${isUser ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white" : "bg-white text-slate-400 ring-1 ring-slate-200/60"}`}>
                          {isUser ? <User size={14} /> : <Bot size={14} />}
                        </span>
                        <div
                          className={
                            isUser
                              ? "rounded-2xl rounded-tr-md bg-gradient-to-br from-emerald-600 to-teal-600 px-4 py-3 text-sm text-white shadow-lg shadow-emerald-500/10"
                              : "rounded-2xl rounded-tl-md border border-white/50 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-md shadow-slate-900/[0.03] backdrop-blur-sm"
                          }
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {loading ? <div className="animate-fade-in flex justify-start">{loadingBubble}</div> : null}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <InputBox isLoading={loading} onSubmit={handleSubmit} quickExamples={QUICK_EXAMPLES} detectedLanguage={detectedLanguage} />

            {detectedLanguage === "hi" ? (
              <div className="animate-fade-slide-up rounded-xl border border-amber-200/50 bg-amber-50/60 p-3 text-sm font-medium text-amber-700 backdrop-blur-sm">
                Input detected in Hindi. Automatically translated for analysis.
              </div>
            ) : null}

            <div className="glass-strong relative overflow-hidden rounded-2xl p-5 shadow-glass sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Eligible Scheme Dashboard</h2>
                {recommendedSchemes.length > 0 ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {recommendedSchemes.length} schemes
                  </span>
                ) : null}
              </div>

              {recommendedSchemes.length > 0 ? (
                <>
                  <div className="mt-4 rounded-xl border border-amber-200/50 bg-amber-50/60 p-4 shadow-sm backdrop-blur-sm">
                    <p className="text-sm font-semibold text-amber-700">
                      Potential Unclaimed Welfare: {potentialUnclaimedSchemes} schemes
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200/50 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Impact Summary</p>
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
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {categorySummary.length > 0 ? (
                        categorySummary.map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200/50 bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-600 backdrop-blur-sm"
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

                  <div className="mt-4 rounded-xl border border-slate-200/50 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Your Estimated Government Support</p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">₹{animatedBenefit.toLocaleString("en-IN")}</p>
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Potential Annual Support</p>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200/60">
                        <div className="animate-bar-grow h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-200" style={{ width: `${benefitProgress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200/50 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Application Readiness</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/60">
                        <div className={`h-full rounded-full transition-all duration-500 ${readinessBarColor}`} style={{ width: `${readinessScore}%` }} />
                      </div>
                      <span className="min-w-12 text-right text-sm font-semibold text-slate-800">{readinessScore}%</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">Live readiness score updates as vault documents are toggled.</p>
                    <div className="mt-3 rounded-xl border border-slate-200/50 bg-slate-50/80 p-3 text-sm text-slate-600">
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
                <div className="mt-3 rounded-xl border border-amber-200/50 bg-amber-50/50 p-3 text-sm text-slate-600 backdrop-blur-sm">
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
                    <h3 className="text-base font-bold text-slate-900">Top Recommended Schemes (Top 3)</h3>
                    {!showAllSchemes && recommendedSchemes.length > 3 ? (
                      <button
                        type="button"
                        onClick={() => setShowAllSchemes(true)}
                        className="rounded-full border border-emerald-200/60 bg-emerald-50/60 px-4 py-1.5 text-sm font-semibold text-emerald-700 backdrop-blur-sm transition-all duration-300 hover:bg-emerald-100/80 hover:shadow-sm"
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
                        onRequestAssistance={() => setIsAssistanceModalOpen(true)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300/60 bg-white/40 p-5 text-center text-sm text-slate-500 backdrop-blur-sm">
                  Submit your situation above to view recommended schemes.
                </div>
              )}
            </div>

            {recommendedSchemes.length > 0 && (
              <button
                type="button"
                onClick={openAssistanceModal}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 active:scale-[0.98]"
              >
                <HelpCircle className="h-5 w-5" />
                Need Help Applying? Request CSC Assistance
              </button>
            )}
          </section>

          <aside className="glass-strong relative overflow-hidden rounded-2xl p-5 shadow-glass lg:col-span-4">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Profile Module</h2>
            <div className="mt-4 rounded-xl border border-slate-200/50 bg-slate-50/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Detected Citizen Profile</p>

              {detectedProfile ? (
                <div className="mt-3 divide-y divide-slate-200/60 rounded-xl border border-slate-200/50 bg-white/90 backdrop-blur-sm">
                  <div className="flex items-center justify-between px-3 py-2.5 text-sm">
                    <span className="font-medium text-slate-500">Occupation</span>
                    {renderProfileValue(detectedProfile.occupation, "Unknown")}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 text-sm">
                    <span className="font-medium text-slate-500">Education</span>
                    {renderProfileValue(detectedProfile.education, "Not Provided")}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 text-sm">
                    <span className="font-medium text-slate-500">Annual Income</span>
                    {renderProfileValue(detectedProfile.income !== null ? formatCurrency(detectedProfile.income) : null, "Not Provided")}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 text-sm">
                    <span className="font-medium text-slate-500">Age</span>
                    {renderProfileValue(detectedProfile.age, "Unknown")}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 text-sm">
                    <span className="font-medium text-slate-500">State</span>
                    {renderProfileValue(detectedProfile.state, "Unknown")}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 text-sm">
                    <span className="font-medium text-slate-500">Category</span>
                    {renderProfileValue(detectedProfile.category, "Not Provided")}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  Share your details in chat to auto-fill this profile using SAARTHI extraction.
                </p>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200/50 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <p className="text-base font-bold text-slate-900">Citizen Document Vault</p>
              </div>
              <p className="mt-1 text-sm text-slate-600">Secure access to your government documents</p>

              {detectedDocuments ? (
                <div className="mt-3 rounded-xl border border-slate-200/50 bg-slate-50/60 p-3">
                  <p className="text-sm font-semibold text-slate-700">Documents detected via DigiLocker simulation.</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {vaultDocuments.map((document) => (
                      <li key={`detected-${document.name}`} className="flex items-center gap-2">
                        <span className={document.available ? "text-green-700" : "text-amber-700"}>
                          {document.available ? "✓" : "⚠"}
                        </span>
                        <span>{document.name} {document.available ? "Found" : "Missing"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {recommendedSchemes.length > 0 ? (
                <>
                  <div className="mt-3 space-y-2 rounded-xl border border-slate-200/50 bg-slate-50/60 p-3">
                    {vaultDocuments.map((document) => (
                      <button
                        key={document.name}
                        type="button"
                        onClick={() => toggleVaultDocument(document.name)}
                        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200/50 bg-white/90 px-3 py-2.5 text-left text-sm backdrop-blur-sm transition-all duration-200 hover:bg-slate-50/80 hover:shadow-sm"
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
                <div className="mt-3 rounded-xl border border-dashed border-slate-300/50 bg-slate-50/40 p-3 text-sm text-slate-500 backdrop-blur-sm">
                  Submit your situation to analyze required documents.
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>

      {isAssistanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-md">
          <div className="animate-scale-fade relative w-full max-w-lg rounded-3xl border border-white/40 bg-white/95 p-6 shadow-premium-lg backdrop-blur-xl sm:p-8">
            <button
              onClick={closeAssistanceModal}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            {assistanceStatus === "success" && assignedOperator ? (
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 shadow-md shadow-emerald-500/10">
                  <UserCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Success! (Demo Mode)</h2>
                <p className="mt-3 leading-relaxed text-slate-600">
                  We have assigned a local CSC operator near you. They will send you an SMS shortly to schedule your application assistance. Please keep an eye on your phone!
                </p>
                <button
                  onClick={closeAssistanceModal}
                  className="mt-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition-all duration-200 hover:shadow-xl hover:brightness-110"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/15">
                    <HelpCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Request CSC Assistance</h2>
                    <p className="text-sm text-slate-500">A nearby CSC operator will help you apply</p>
                  </div>
                </div>

                <form onSubmit={submitAssistanceRequest} className="mt-5 space-y-3.5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={assistanceForm.name}
                      onChange={(e) => setAssistanceForm({ ...assistanceForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="mt-1 w-full rounded-xl border border-slate-200/60 bg-white/90 px-3.5 py-2.5 text-sm outline-none backdrop-blur-sm transition-all duration-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.06)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                    <input
                      type="tel"
                      value={assistanceForm.phone}
                      onChange={(e) => setAssistanceForm({ ...assistanceForm, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="mt-1 w-full rounded-xl border border-slate-200/60 bg-white/90 px-3.5 py-2.5 text-sm outline-none backdrop-blur-sm transition-all duration-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.06)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Village</label>
                    <input
                      type="text"
                      value={assistanceForm.village}
                      onChange={(e) => setAssistanceForm({ ...assistanceForm, village: e.target.value })}
                      placeholder="e.g. Gokak"
                      className="mt-1 w-full rounded-xl border border-slate-200/60 bg-white/90 px-3.5 py-2.5 text-sm outline-none backdrop-blur-sm transition-all duration-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.06)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">District</label>
                    <input
                      type="text"
                      value={assistanceForm.district}
                      onChange={(e) => setAssistanceForm({ ...assistanceForm, district: e.target.value })}
                      placeholder="e.g. Belagavi"
                      className="mt-1 w-full rounded-xl border border-slate-200/60 bg-white/90 px-3.5 py-2.5 text-sm outline-none backdrop-blur-sm transition-all duration-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.06)]"
                    />
                  </div>

                  {assistanceError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                      {assistanceError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={assistanceStatus === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition-all duration-200 hover:shadow-xl hover:brightness-110 disabled:opacity-50"
                  >
                    {assistanceStatus === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                    {assistanceStatus === "loading" ? "Submitting…" : "Submit Request"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
