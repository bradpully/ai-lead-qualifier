"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  redirectTo: string;
}

export default function AuthForm({ redirectTo }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
          },
        });
        if (error) throw error;
        setSignupSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full bg-[#111827] border border-white/8 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/40 transition-colors";
  const label =
    "block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2";

  if (signupSuccess) {
    return (
      <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-white font-semibold mb-2">Check your email</h2>
        <p className="text-slate-400 text-sm">
          We sent a confirmation link to{" "}
          <span className="text-slate-200">{email}</span>. Click it to activate
          your account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white mb-1">
        {mode === "login" ? "Welcome back" : "Create account"}
      </h1>
      <p className="text-slate-400 text-sm mb-8">
        {mode === "login"
          ? "Sign in to your LeadIQ account"
          : "Start qualifying leads in seconds"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>Email</label>
          <input
            type="email"
            required
            placeholder="you@company.com"
            className={inputBase}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Password</label>
          <input
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            className={inputBase}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span className="text-slate-400">
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </span>
            </span>
          ) : mode === "login" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
          }}
          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
