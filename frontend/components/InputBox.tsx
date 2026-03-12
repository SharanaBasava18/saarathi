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
    <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel)] p-4 shadow-[0_16px_40px_rgba(9,31,56,0.08)] sm:p-5">
      <div className="mb-3 rounded-xl border border-[#d9e2eb] bg-[#f6f9fc] p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">Common Situations</p>
        <div className="flex flex-wrap gap-2">
          {quickExamples.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => sendExample(example.message)}
              disabled={isLoading}
              className="rounded-full border border-[#cbd9e6] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-main)] shadow-sm transition hover:bg-[#f2f7ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-2 whitespace-pre-line text-sm leading-6 text-[var(--text-soft)]">
        Describe your situation in simple language.
        {"\n"}
        Example:
        {"\n"}
        • I am a farmer with 2 acres land
        {"\n"}
        • I am a student aged 21
        {"\n"}
        • I need housing support
      </p>

      <div className="flex items-end gap-2 rounded-xl border border-[#c9d6e4] bg-white p-2 shadow-inner">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Describe your situation here..."
          className="min-h-16 w-full resize-y border-0 bg-transparent p-2 text-sm leading-6 text-[var(--text-main)] outline-none"
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
          className={`mb-1 rounded-lg p-2 transition ${
            isRecording ? "bg-red-100 text-red-600" : "bg-[#edf4fb] text-[#23456f] hover:bg-[#dfeaf8]"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <Mic size={18} />
        </button>
        <button
          type="button"
          onClick={sendMessage}
          disabled={isLoading || draft.trim().length === 0}
          className="mb-1 rounded-lg bg-accent p-2 text-white transition hover:bg-[#005d7a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SendHorizonal size={18} />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[var(--text-soft)]">
        <p>Press Enter to send. Shift+Enter for new line.</p>
        <p>{isRecording ? "Listening..." : "Tap mic to speak"}</p>
      </div>
      <p className="mt-2 text-xs font-semibold text-[#315577]">
        Detected Language: {detectedLanguage === "hi" ? "Hindi" : "English"}
      </p>
    </div>
  );
}
