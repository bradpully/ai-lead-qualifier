import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI Lead Qualifier",
  description: "Qualify your sales leads in seconds with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-[#080d1a] text-slate-100 min-h-screen antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
