import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { LeadInput, QualificationResult } from "@/lib/types";

type LeadRecord = {
  id: string;
  created_at: string;
  lead_input: LeadInput;
  result: QualificationResult;
};

function MiniScoreRing({ score }: { score: number }) {
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color = score >= 80 ? "var(--hot)" : score >= 50 ? "var(--warm)" : "var(--cold)";

  return (
    <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
      <svg
        viewBox="0 0 44 44"
        style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
      >
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color,
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {score}
        </span>
      </div>
    </div>
  );
}

function TierDot({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    hot: "#FF5555",
    warm: "#F0622A",
    cold: "#6B9EFF",
  };
  return (
    <span
      style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.1em",
        color: colors[tier] ?? colors.cold,
        textTransform: "uppercase",
      }}
    >
      ● {tier}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: records } = await supabase
    .from("lead_results")
    .select("id, created_at, lead_input, result")
    .order("created_at", { ascending: false })
    .returns<LeadRecord[]>();

  const items = records ?? [];

  return (
    <main style={{ minHeight: "100vh", padding: "48px 16px" }}>
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

      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                color: "var(--accent)",
                letterSpacing: "0.12em",
                marginBottom: 8,
              }}
            >
              ◆ HISTORY
            </p>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              Lead History
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                marginTop: 6,
              }}
            >
              {items.length} qualification{items.length !== 1 ? "s" : ""} on record
            </p>
          </div>
          <Link
            href="/"
            style={{
              background: "var(--accent)",
              color: "#fff",
              borderRadius: 9,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            + New Lead
          </Link>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div
            className="fade-up"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "56px 32px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                color: "var(--text-tertiary)",
                letterSpacing: "0.1em",
                marginBottom: 12,
              }}
            >
              NO RECORDS YET
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
              Run your first lead qualification to see results here.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                background: "var(--accent)",
                color: "#fff",
                borderRadius: 9,
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Qualify a Lead
            </Link>
          </div>
        )}

        {/* Records list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((record) => {
            const { lead_input: lead, result } = record;
            return (
              <div
                key={record.id}
                className="fade-up"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <MiniScoreRing score={result.score} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                      {lead.firstName} {lead.lastName}
                    </span>
                    <TierDot tier={result.tier} />
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      marginBottom: 4,
                    }}
                  >
                    {lead.role} · {lead.company}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-tertiary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {result.summary}
                  </p>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-mono, monospace)",
                    flexShrink: 0,
                  }}
                >
                  {formatDate(record.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
