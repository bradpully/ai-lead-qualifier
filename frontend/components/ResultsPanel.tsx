"use client";

export interface QualificationReport {
  lead: string;
  fitScore: number;
  verdict: "Qualified" | "Nurture" | "Disqualify";
  executiveSummary: string;
  redFlags: string[];
  followUpActions: string[];
  pitchAngle: string;
}

const verdictConfig = {
  Qualified:  { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", ring: "#10b981", dot: "bg-emerald-400" },
  Nurture:    { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   ring: "#f59e0b", dot: "bg-amber-400"   },
  Disqualify: { color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     ring: "#ef4444", dot: "bg-red-400"     },
};

function ScoreRing({ score, verdict }: { score: number; verdict: QualificationReport["verdict"] }) {
  const r = 42;
  const circ = 2 * Math.PI * r; // ~264
  const offset = circ * (1 - score / 100);
  const { ring } = verdictConfig[verdict];

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1f2937" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={ring}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="score-ring"
          style={{ "--ring-offset": offset } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white leading-none">{score}</span>
        <span className="text-xs text-slate-500 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

export default function ResultsPanel({ report }: { report: QualificationReport }) {
  const cfg = verdictConfig[report.verdict];

  return (
    <div className="space-y-4">
      {/* Header: Score + Verdict */}
      <div className={`fade-up rounded-2xl border p-6 flex items-center gap-6 ${cfg.bg} ${cfg.border}`}>
        <ScoreRing score={report.fitScore} verdict={report.verdict} />
        <div className="min-w-0">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 ${cfg.bg} ${cfg.border} border ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {report.verdict}
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{report.executiveSummary}</p>
        </div>
      </div>

      {/* Pitch Angle */}
      <div className="fade-up fade-up-delay-1 rounded-2xl border border-indigo-500/20 bg-indigo-500/8 p-5">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Recommended Pitch Angle</p>
        <p className="text-slate-200 text-sm leading-relaxed">{report.pitchAngle}</p>
      </div>

      {/* Red Flags + Follow-up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="fade-up fade-up-delay-2 rounded-2xl border border-white/5 bg-[#0d1424] p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Red Flags</p>
          {report.redFlags.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              None identified
            </div>
          ) : (
            <ul className="space-y-2.5">
              {report.redFlags.map((flag, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {flag}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="fade-up fade-up-delay-3 rounded-2xl border border-white/5 bg-[#0d1424] p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Next Steps</p>
          <ol className="space-y-2.5">
            {report.followUpActions.map((action, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-300">
                <span className="flex-none w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {action}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
