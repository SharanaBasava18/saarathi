"use client";

import { useState } from "react";

type QuickExample = {
  label: string;
  message: string;
};

type InputBoxProps = {
  isLoading: boolean;
  onSubmit: (value: string) => void;
  quickExamples: QuickExample[];
};

export default function InputBox({ isLoading, onSubmit, quickExamples }: InputBoxProps) {
  const [draft, setDraft] = useState("");

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

  return (
    <div className="rounded-card border border-[var(--stroke)] bg-[var(--panel)] p-4 shadow-card sm:p-5">
      <div className="mb-3 rounded-xl border border-[#dbe5e3] bg-[#f7fbfa] p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">Try Examples</p>
        <div className="flex flex-wrap gap-2">
          {quickExamples.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => sendExample(example.message)}
              disabled={isLoading}
              className="rounded-full border border-[#cfe0dc] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-main)] transition hover:bg-[#eef6f4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Type your situation. Example: I am 28, self employed, OBC, income 180000, from a rural village in Karnataka."
        className="min-h-24 w-full resize-y rounded-xl border border-[#cad6d4] bg-white p-3 text-sm leading-6 text-[var(--text-main)] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
          }
        }}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-soft)]">Press Enter to send. Shift+Enter for new line.</p>
        <button
          type="button"
          onClick={sendMessage}
          disabled={isLoading || draft.trim().length === 0}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#006f62] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}
