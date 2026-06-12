import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import UserNav from "@/components/UserNav";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI Lead Qualifier",
  description: "Qualify your sales leads in seconds with AI",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans bg-[#080d1a] text-slate-100 min-h-screen antialiased`}
        suppressHydrationWarning
      >
        {user && (
          <div className="fixed top-4 right-4 z-50">
            <div className="flex items-center gap-3 bg-[#0d1424] border border-white/5 rounded-xl px-4 py-2 shadow-lg">
              <UserNav user={user} />
              <span className="w-px h-4 bg-white/10" />
              <Link
                href="/history"
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                History
              </Link>
            </div>
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
