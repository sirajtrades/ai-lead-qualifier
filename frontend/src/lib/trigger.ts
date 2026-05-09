import type { LeadInput, QualificationResult } from "./types";

export type { LeadInput, QualificationResult };

export async function qualifyLead(lead: LeadInput): Promise<QualificationResult> {
  const response = await fetch("/api/qualify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Qualification failed");
  }

  return response.json() as Promise<QualificationResult>;
}
