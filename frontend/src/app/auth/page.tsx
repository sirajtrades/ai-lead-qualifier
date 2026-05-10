"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Tab = "login" | "signup";

export default function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSignupDone(true);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "login") handleLogin();
    else handleSignup();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      {/* Ambient blobs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 55% 35% at 8% 8%, rgba(240,98,42,0.06) 0%, transparent 65%)," +
            "radial-gradient(ellipse 50% 35% at 92% 92%, rgba(107,158,255,0.05) 0%, transparent 65%)",
        }}
      />

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        {/* Logo mark */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              borderRadius: 100,
              padding: "5px 13px",
              marginBottom: 16,
            }}
          >
            <span style={{ color: "var(--accent)", fontSize: 11 }}>◆</span>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                color: "var(--accent)",
                letterSpacing: "0.12em",
              }}
            >
              AI LEAD QUALIFIER
            </span>
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 6,
            }}
          >
            {tab === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {tab === "login"
              ? "Sign in to your account to continue"
              : "Sign up to start qualifying leads"}
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 32,
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 4,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 4,
              marginBottom: 28,
            }}
          >
            {(["login", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError(null);
                  setSignupDone(false);
                }}
                style={{
                  background: tab === t ? "var(--surface-2)" : "transparent",
                  border: tab === t ? "1px solid var(--border-bright)" : "1px solid transparent",
                  borderRadius: 7,
                  color: tab === t ? "var(--text)" : "var(--text-tertiary)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "8px 0",
                  transition: "all 0.15s",
                }}
              >
                {t === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Signup success state */}
          {signupDone ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  marginBottom: 16,
                }}
              >
                ✉️
              </div>
              <p
                style={{
                  fontWeight: 600,
                  marginBottom: 8,
                  fontSize: 15,
                }}
              >
                Check your email
              </p>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  lineHeight: 1.65,
                }}
              >
                We sent a confirmation link to <strong style={{ color: "var(--text)" }}>{email}</strong>.
                Click it to activate your account.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <input
                  className="field-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  Password
                </label>
                <input
                  className="field-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tab === "signup" ? "At least 6 characters" : "••••••••"}
                  required
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  minLength={tab === "signup" ? 6 : undefined}
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(255,85,85,0.08)",
                    border: "1px solid rgba(255,85,85,0.22)",
                    borderRadius: 8,
                    color: "#FF7A7A",
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="analyze-btn"
                style={{ marginTop: 4 }}
              >
                {loading
                  ? tab === "login"
                    ? "Signing in…"
                    : "Creating account…"
                  : tab === "login"
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>
          )}
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 13,
            color: "var(--text-tertiary)",
          }}
        >
          {tab === "login" ? "No account yet? " : "Already have an account? "}
          <button
            onClick={() => {
              setTab(tab === "login" ? "signup" : "login");
              setError(null);
              setSignupDone(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "inherit",
              padding: 0,
            }}
          >
            {tab === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </main>
  );
}
