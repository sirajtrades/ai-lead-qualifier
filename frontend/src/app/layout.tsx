import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Lead Qualifier",
  description: "AI-powered lead qualification — score, tier, and recommended next steps in seconds.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${jetbrainsMono.variable}`}>
        {user && (
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 50,
              background: "rgba(12,12,15,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid var(--border)",
              padding: "10px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 10,
                  color: "var(--accent)",
                  letterSpacing: "0.1em",
                }}
              >
                ◆ LEAD QUALIFIER
              </span>
              <nav style={{ display: "flex", gap: 4 }}>
                <Link
                  href="/"
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    padding: "4px 10px",
                    borderRadius: 6,
                  }}
                >
                  Qualify
                </Link>
                <Link
                  href="/history"
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    padding: "4px 10px",
                    borderRadius: 6,
                  }}
                >
                  History
                </Link>
              </nav>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-tertiary)",
                  maxWidth: 200,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
