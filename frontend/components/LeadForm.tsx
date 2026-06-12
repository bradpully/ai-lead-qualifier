"use client";

import { useState } from "react";

export interface LeadFormData {
  companyName: string;
  industry: string;
  companySize: "<10" | "10-50" | "50-200" | "200+";
  estimatedRevenue: "<$1M" | "$1-10M" | "$10-50M" | "$50M+";
  painPoint: string;
  budget: "No budget" | "Under $10k" | "$10-50k" | "$50k+";
  timeline: "No timeline" | "6+ months" | "1-6 months" | "Immediate";
}

interface Props {
  onSubmit: (data: LeadFormData) => void;
  loading: boolean;
}

const defaultForm: LeadFormData = {
  companyName: "",
  industry: "",
  companySize: "10-50",
  estimatedRevenue: "$1-10M",
  painPoint: "",
  budget: "Under $10k",
  timeline: "1-6 months",
};

export default function LeadForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<LeadFormData>(defaultForm);

  function set<K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  const inputBase =
    "w-full bg-[#111827] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/40 transition-colors";
  const label = "block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company */}
      <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Name</label>
            <input
              type="text"
              required
              placeholder="Acme Corp"
              className={inputBase}
              value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Industry</label>
            <input
              type="text"
              required
              placeholder="SaaS / HR Tech"
              className={inputBase}
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Headcount</label>
            <select
              className={inputBase}
              value={form.companySize}
              onChange={(e) => set("companySize", e.target.value as LeadFormData["companySize"])}
            >
              <option value="<10">&lt;10 employees</option>
              <option value="10-50">10–50 employees</option>
              <option value="50-200">50–200 employees</option>
              <option value="200+">200+ employees</option>
            </select>
          </div>
          <div>
            <label className={label}>Est. Revenue</label>
            <select
              className={inputBase}
              value={form.estimatedRevenue}
              onChange={(e) => set("estimatedRevenue", e.target.value as LeadFormData["estimatedRevenue"])}
            >
              <option value="<$1M">&lt;$1M</option>
              <option value="$1-10M">$1–10M</option>
              <option value="$10-50M">$10–50M</option>
              <option value="$50M+">$50M+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pain */}
      <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Pain Point</p>
        <textarea
          required
          rows={3}
          placeholder="What specific problem or challenge did they describe? Be as specific as possible — the AI uses this to assess need urgency."
          className={inputBase + " resize-none"}
          value={form.painPoint}
          onChange={(e) => set("painPoint", e.target.value)}
        />
      </div>

      {/* Buying signals */}
      <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Buying Signals</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Budget</label>
            <select
              className={inputBase}
              value={form.budget}
              onChange={(e) => set("budget", e.target.value as LeadFormData["budget"])}
            >
              <option value="No budget">No budget</option>
              <option value="Under $10k">Under $10k</option>
              <option value="$10-50k">$10–50k</option>
              <option value="$50k+">$50k+</option>
            </select>
          </div>
          <div>
            <label className={label}>Timeline</label>
            <select
              className={inputBase}
              value={form.timeline}
              onChange={(e) => set("timeline", e.target.value as LeadFormData["timeline"])}
            >
              <option value="No timeline">No timeline</option>
              <option value="6+ months">6+ months</option>
              <option value="1-6 months">1–6 months</option>
              <option value="Immediate">Immediate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all
          bg-indigo-600 hover:bg-indigo-500 text-white
          disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2.5">
            <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-slate-400">Analyzing lead...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Analyze Lead
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        )}
      </button>
    </form>
  );
}
