"use client";

import { useState } from "react";

import { Mic, SendHorizonal } from "lucide-react";

type SpeechRecognitionResultLike = {
  0: {
    transcript: string;
  };
};

type SpeechRecognitionEventLike = {
  results: SpeechRecognitionResultLike[];
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type QuickExample = {
  label: string;
  message: string;
};

type InputBoxProps = {
  isLoading: boolean;
  onSubmit: (value: string) => void;
  quickExamples: QuickExample[];
  detectedLanguage?: "en" | "hi";
};

export default function InputBox({ isLoading, onSubmit, quickExamples, detectedLanguage = "en" }: InputBoxProps) {
  const [draft, setDraft] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const submitText = (text: string) => {
    if (isLoading || text.trim().length === 0) {
      return;
    }

    onSubmit(text);
  };

  const sendMessage = () => {
    submitText(draft);
    setDraft("");
  };

  const sendExample = (exampleMessage: string) => {
    setDraft(exampleMessage);
    submitText(exampleMessage);
    setDraft("");
  };

  const startVoiceCapture = () => {
    if (isLoading || isRecording) {
      return;
    }

    const SpeechRecognitionImpl = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) {
      setDraft((current) => `${current}${current ? " " : ""}Voice input is not supported in this browser.`);
      return;
    }

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setDraft((current) => `${current}${current ? " " : ""}${transcript}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <div className="glass-strong relative rounded-2xl p-4 shadow-[0_-8px_40px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="mb-3 flex flex-wrap gap-2">
        {quickExamples.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => sendExample(example.message)}
            disabled={isLoading}
            className="rounded-full border border-slate-200/60 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {example.label}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2 rounded-xl border border-slate-200/50 bg-white/90 p-2 shadow-inner transition-all duration-300 focus-within:border-emerald-300/60 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.06)]">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="e.g., I am a 28-year-old farmer from Maharashtra looking for..."
          className="min-h-16 w-full resize-y border-0 bg-transparent p-2 text-sm leading-6 text-slate-900 placeholder:text-slate-400 outline-none"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          type="button"
          onClick={startVoiceCapture}
          disabled={isLoading}
          aria-label="Start voice input"
          className={`mb-1 rounded-xl p-2.5 transition-all duration-200 ${
            isRecording ? "bg-red-100 text-red-600 shadow-md shadow-red-200/50" : "bg-slate-100 text-slate-500 hover:bg-slate-200/80"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Mic size={18} />
        </button>
        <button
          type="button"
          onClick={sendMessage}
          disabled={isLoading || draft.trim().length === 0}
          className="mb-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-2.5 text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendHorizonal size={18} />
        </button>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-3 text-[11px] text-slate-400">
        <p>Press Enter to send. Shift+Enter for new line.</p>
        <p>{isRecording ? "Listening..." : "Tap mic to speak"}</p>
      </div>
      <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
        Detected Language: {detectedLanguage === "hi" ? "Hindi" : "English"}
      </p>
    </div>
  );
}
