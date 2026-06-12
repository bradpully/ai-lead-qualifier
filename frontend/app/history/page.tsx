import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const verdictStyles: Record<string, string> = {
  Qualified: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Nurture: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Disqualify: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/history");

  const { sort } = await searchParams;
  const ascending = sort === "asc";

  const { data: qualifications, error } = await supabase
    .from("lead_qualifications")
    .select("id, company_name, fit_score, verdict, created_at")
    .order("created_at", { ascending });

  return (
    <div className="min-h-screen bg-[#080d1a]">
      <header className="border-b border-white/5 bg-[#0d1424] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="font-semibold text-white">LeadIQ</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 text-sm">History</span>
          </div>
          <Link
            href="/"
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New analysis
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Qualification history
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {qualifications?.length ?? 0} lead
              {qualifications?.length !== 1 ? "s" : ""} analyzed
            </p>
          </div>
          <Link
            href={`/history?sort=${ascending ? "desc" : "asc"}`}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            {ascending ? "Newest first" : "Oldest first"}
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-sm mb-6">
            Failed to load history: {error.message}
          </div>
        )}

        {!qualifications?.length ? (
          <div className="text-center py-24 text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-400 mb-1">
              No qualifications yet
            </p>
            <p className="text-sm">
              <Link
                href="/"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Analyze your first lead →
              </Link>
            </p>
          </div>
        ) : (
          <div className="bg-[#0d1424] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Verdict
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {qualifications.map((q) => (
                  <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-slate-200 font-medium">
                      {q.company_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white">{q.fit_score}</span>
                      <span className="text-slate-500 text-xs">/100</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${verdictStyles[q.verdict] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20"}`}
                      >
                        {q.verdict}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(q.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
