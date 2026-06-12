"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function UserNav({ user }: { user: User }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
        <span className="text-xs font-semibold text-indigo-400">
          {user.email?.[0]?.toUpperCase()}
        </span>
      </div>
      <span className="text-xs text-slate-400 hidden sm:block max-w-[140px] truncate">
        {user.email}
      </span>
      <button
        onClick={handleSignOut}
        className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
      >
        Sign out
      </button>
    </div>
  );
}
