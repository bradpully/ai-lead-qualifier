"use client";

import { useState } from "react";
import LeadForm, { LeadFormData } from "@/components/LeadForm";
import ResultsPanel from "@/components/ResultsPanel";
import type { QualificationReport } from "@/components/ResultsPanel";

type AppState = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [report, setReport] = useState<QualificationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(data: LeadFormData) {
    setState("loading");
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Qualification failed");
      setReport(json.data);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  function handleReset() {
    setState("idle");
    setReport(null);
    setError(null);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <aside className="hidden lg:flex flex-col justify-between w-[380px] shrink-0 bg-[#0d1424] border-r border-white/5 p-10">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-tight">LeadIQ</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Qualify leads<br />in seconds.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Stop wasting time on bad-fit prospects. Get an AI-powered qualification report with a fit score, red flags, and your exact pitch angle.
          </p>

          {/* Feature list */}
          <ul className="space-y-4">
            {[
              { icon: "📊", label: "Fit Score 0–100", sub: "BANT-weighted qualification" },
              { icon: "⚠️", label: "Red Flag Detection", sub: "Surfaces deal-breakers early" },
              { icon: "🎯", label: "Pitch Angle", sub: "Tailored messaging for each lead" },
              { icon: "⚡", label: "Results in ~5 seconds", sub: "Powered by GPT-4o via Trigger.dev" },
            ].map((f) => (
              <li key={f.label} className="flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-200">{f.label}</p>
                  <p className="text-xs text-slate-500">{f.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-600">
          Built with Trigger.dev + Next.js
        </p>
      </aside>

      {/* Right panel — content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-white">LeadIQ</span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-2xl mx-auto w-full">
          {state === "idle" || state === "loading" || state === "error" ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">New lead analysis</h2>
                <p className="text-slate-400 text-sm">Fill in what you know — the AI fills in the rest.</p>
              </div>
              <LeadForm onSubmit={handleAnalyze} loading={state === "loading"} />
              {state === "error" && error && (
                <div className="mt-4 p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-sm">
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Qualification report</h2>
                  <p className="text-slate-400 text-sm">{report?.lead}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M17.657 17.657l-.707-.707M12 19v1M6.343 17.657l-.707.707M4 12H3M6.343 6.343l-.707-.707" />
                  </svg>
                  New analysis
                </button>
              </div>
              {report && <ResultsPanel report={report} />}
              {report && (
                <div className="mt-6 text-center">
                  <a
                    href="/history"
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View all qualifications →
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
