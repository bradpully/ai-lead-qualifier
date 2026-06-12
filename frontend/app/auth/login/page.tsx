import AuthForm from "@/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080d1a] px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-white"
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
          <span className="font-semibold text-white tracking-tight text-lg">
            LeadIQ
          </span>
        </div>

        {error === "auth_callback_failed" && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-sm text-center">
            Authentication link expired. Please sign in again.
          </div>
        )}

        <AuthForm redirectTo={next ?? "/"} />
      </div>
    </div>
  );
}
