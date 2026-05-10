"use client";

import { useState, useEffect } from "react";
import { qualifyLead } from "../lib/trigger";
import type { LeadInput, QualificationResult } from "../lib/trigger";

const INITIAL_FORM: LeadInput = {
  firstName: "",
  lastName: "",
  company: "",
  role: "",
  email: "",
  phone: "",
  companySize: "",
  budget: "",
  useCase: "",
  notes: "",
};

/* ─── Score ring ─────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const [filled, setFilled] = useState(false);
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - (filled ? score / 100 : 0));
  const color = score >= 80 ? "var(--hot)" : score >= 50 ? "var(--warm)" : "var(--cold)";

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
      <svg
        viewBox="0 0 100 100"
        style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
      >
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontSize: 20, fontWeight: 700, color, lineHeight: 1,
          fontFamily: "var(--font-mono, monospace)",
        }}>
          {score}
        </span>
        <span style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>/100</span>
      </div>
    </div>
  );
}

/* ─── Tier badge ─────────────────────────────────────────── */
function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, { label: string; bg: string; border: string; text: string; glow: string }> = {
    hot:  { label: "HOT",  bg: "rgba(255,85,85,0.10)",    border: "rgba(255,85,85,0.35)",    text: "#FF6E6E", glow: "0 0 16px rgba(255,85,85,0.18)"    },
    warm: { label: "WARM", bg: "rgba(240,98,42,0.10)",    border: "rgba(240,98,42,0.35)",    text: "#F0622A", glow: "0 0 16px rgba(240,98,42,0.18)"    },
    cold: { label: "COLD", bg: "rgba(107,158,255,0.10)",  border: "rgba(107,158,255,0.35)",  text: "#6B9EFF", glow: "0 0 16px rgba(107,158,255,0.18)" },
  };
  const cfg = map[tier] ?? map.cold;
  return (
    <span style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.text,
      boxShadow: cfg.glow,
      fontFamily: "var(--font-mono, monospace)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.12em",
      padding: "5px 13px",
      borderRadius: 4,
      textTransform: "uppercase",
    }}>
      ● {cfg.label} LEAD
    </span>
  );
}

/* ─── Loading card ───────────────────────────────────────── */
function LoadingCard() {
  const steps = [
    "Retrieving company intelligence",
    "Scoring engagement signals",
    "Generating qualification report",
  ];
  return (
    <div className="fade-up" style={{
      marginTop: 20,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "28px 32px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div className="scan-line" />
      <p style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 11,
        color: "var(--accent)",
        letterSpacing: "0.12em",
        marginBottom: 20,
      }}>
        ◆ ANALYZING LEAD
      </p>
      {steps.map((label, i) => (
        <div key={label} style={{ marginBottom: i < steps.length - 1 ? 16 : 0 }}>
          <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 7 }}>{label}</p>
          <div style={{ height: 2, background: "var(--border)", borderRadius: 1, overflow: "hidden" }}>
            <div className="shimmer-track" style={{ animationDelay: `${i * 0.28}s` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────── */
function SectionHeader({ number, name }: { number: string; name: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      paddingBottom: 14,
      borderBottom: "1px solid var(--border)",
      marginBottom: 18,
    }}>
      <span style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 10,
        color: "var(--accent)",
        letterSpacing: "0.1em",
      }}>{number}</span>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--text-secondary)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}>{name}</span>
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: 6,
};

/* ─── Page ───────────────────────────────────────────────── */
export default function Home() {
  const [form, setForm] = useState<LeadInput>(INITIAL_FORM);
  const [result, setResult] = useState<QualificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const qualification = await qualifyLead(form);
      setResult(qualification);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", padding: "64px 16px" }}>

      {/* Ambient background blobs */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background:
          "radial-gradient(ellipse 55% 35% at 8% 8%, rgba(240,98,42,0.06) 0%, transparent 65%)," +
          "radial-gradient(ellipse 50% 35% at 92% 92%, rgba(107,158,255,0.05) 0%, transparent 65%)",
      }} />

      <div style={{ maxWidth: 624, margin: "0 auto", position: "relative" }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <header style={{ marginBottom: 36 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 18,
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-border)",
            borderRadius: 100,
            padding: "5px 13px",
          }}>
            <span style={{ color: "var(--accent)", fontSize: 11 }}>◆</span>
            <span style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 10,
              color: "var(--accent)",
              letterSpacing: "0.12em",
            }}>POWERED BY CLAUDE</span>
          </div>

          <h1 style={{
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            marginBottom: 12,
          }}>
            AI Lead Qualifier
          </h1>

          <p style={{
            color: "var(--text-secondary)",
            fontSize: 15,
            lineHeight: 1.65,
            maxWidth: 460,
          }}>
            Enter lead details to generate an instant AI qualification report with score, tier, and recommended next steps.
          </p>
        </header>

        {/* ── Form card ───────────────────────────────────────── */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 32,
        }}>
          <form onSubmit={handleSubmit}>

            {/* 01 — Contact */}
            <div style={{ marginBottom: 28 }}>
              <SectionHeader number="01" name="Contact" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={fieldLabel}>First Name <span style={{ color: "var(--accent)" }}>*</span></label>
                  <input className="field-input" name="firstName" value={form.firstName} onChange={handleChange} required maxLength={100} />
                </div>
                <div>
                  <label style={fieldLabel}>Last Name <span style={{ color: "var(--accent)" }}>*</span></label>
                  <input className="field-input" name="lastName" value={form.lastName} onChange={handleChange} required maxLength={100} />
                </div>
                <div>
                  <label style={fieldLabel}>Email <span style={{ color: "var(--accent)" }}>*</span></label>
                  <input className="field-input" name="email" type="email" value={form.email} onChange={handleChange} required maxLength={254} />
                </div>
                <div>
                  <label style={fieldLabel}>Phone</label>
                  <input className="field-input" name="phone" type="tel" value={form.phone ?? ""} onChange={handleChange} maxLength={20} />
                </div>
              </div>
            </div>

            {/* 02 — Company */}
            <div style={{ marginBottom: 28 }}>
              <SectionHeader number="02" name="Company" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={fieldLabel}>Company <span style={{ color: "var(--accent)" }}>*</span></label>
                  <input className="field-input" name="company" value={form.company} onChange={handleChange} required maxLength={200} />
                </div>
                <div>
                  <label style={fieldLabel}>Role / Title <span style={{ color: "var(--accent)" }}>*</span></label>
                  <input className="field-input" name="role" value={form.role} onChange={handleChange} required maxLength={200} />
                </div>
                <div>
                  <label style={fieldLabel}>Company Size</label>
                  <div style={{ position: "relative" }}>
                    <select
                      className="field-input"
                      name="companySize"
                      value={form.companySize ?? ""}
                      onChange={handleChange}
                      style={{ paddingRight: 32, cursor: "pointer" }}
                    >
                      <option value="">Select…</option>
                      <option value="1-10">1–10 employees</option>
                      <option value="11-50">11–50 employees</option>
                      <option value="51-200">51–200 employees</option>
                      <option value="201-1000">201–1,000 employees</option>
                      <option value="1000+">1,000+ employees</option>
                    </select>
                    <span style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      color: "var(--text-tertiary)", pointerEvents: "none", fontSize: 9,
                    }}>▼</span>
                  </div>
                </div>
                <div>
                  <label style={fieldLabel}>Budget</label>
                  <div style={{ position: "relative" }}>
                    <select
                      className="field-input"
                      name="budget"
                      value={form.budget ?? ""}
                      onChange={handleChange}
                      style={{ paddingRight: 32, cursor: "pointer" }}
                    >
                      <option value="">Select…</option>
                      <option value="under-1k">Under $1,000/mo</option>
                      <option value="1k-5k">$1,000–$5,000/mo</option>
                      <option value="5k-20k">$5,000–$20,000/mo</option>
                      <option value="20k+">$20,000+/mo</option>
                    </select>
                    <span style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      color: "var(--text-tertiary)", pointerEvents: "none", fontSize: 9,
                    }}>▼</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 03 — Context */}
            <div style={{ marginBottom: 24 }}>
              <SectionHeader number="03" name="Context" />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={fieldLabel}>Use Case</label>
                  <input
                    className="field-input"
                    name="useCase"
                    value={form.useCase ?? ""}
                    onChange={handleChange}
                    placeholder="What problem are they trying to solve?"
                    maxLength={500}
                  />
                </div>
                <div>
                  <label style={fieldLabel}>Notes</label>
                  <textarea
                    className="field-input"
                    name="notes"
                    value={form.notes ?? ""}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any additional context…"
                    style={{ resize: "none" }}
                    maxLength={1000}
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="analyze-btn">
              {loading ? "Running analysis…" : <>Analyze Lead <span style={{ fontSize: 16 }}>→</span></>}
            </button>
          </form>
        </div>

        {/* ── Loading ──────────────────────────────────────────── */}
        {loading && <LoadingCard />}

        {/* ── Error ────────────────────────────────────────────── */}
        {error && (
          <div className="fade-up" style={{
            marginTop: 20,
            padding: "14px 20px",
            background: "rgba(255,85,85,0.08)",
            border: "1px solid rgba(255,85,85,0.22)",
            borderRadius: 12,
            color: "#FF7A7A",
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* ── Results ──────────────────────────────────────────── */}
        {result && (
          <div className="fade-up" style={{
            marginTop: 20,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}>

            {/* Score + Tier row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 10,
                  color: "var(--text-tertiary)",
                  letterSpacing: "0.1em",
                  marginBottom: 10,
                }}>
                  QUALIFICATION REPORT
                </p>
                <TierBadge tier={result.tier} />
              </div>
              <ScoreRing score={result.score} />
            </div>

            <div style={{ height: 1, background: "var(--border)" }} />

            {/* Summary */}
            <p style={{
              color: "var(--text-secondary)",
              fontSize: 14,
              lineHeight: 1.75,
              borderLeft: "3px solid var(--border-bright)",
              paddingLeft: 16,
            }}>
              {result.summary}
            </p>

            {/* Strengths & Concerns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <p style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--green)",
                  letterSpacing: "0.12em",
                  marginBottom: 12,
                }}>STRENGTHS</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.strengths.map((s, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text)", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--green)", flexShrink: 0, marginTop: 1 }}>↑</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--red)",
                  letterSpacing: "0.12em",
                  marginBottom: 12,
                }}>CONCERNS</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.concerns.map((c, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text)", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }}>↓</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Action */}
            <div style={{
              background: "rgba(240,98,42,0.07)",
              border: "1px solid rgba(240,98,42,0.18)",
              borderRadius: 12,
              padding: "16px 20px",
            }}>
              <p style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                color: "var(--accent)",
                letterSpacing: "0.12em",
                marginBottom: 8,
              }}>RECOMMENDED ACTION</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", lineHeight: 1.65 }}>
                {result.recommendedAction}
              </p>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
