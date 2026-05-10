import { NextRequest, NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase/server";
import type { LeadInput, QualificationResult } from "@/lib/types";

export const maxDuration = 60;

const RATE_LIMIT = 20;
const RATE_WINDOW_HOURS = 1;

const FIELD_LIMITS: Record<string, number> = {
  firstName: 100,
  lastName: 100,
  company: 200,
  role: 200,
  email: 254,
  phone: 20,
  useCase: 500,
  notes: 1000,
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: max 20 qualifications per user per hour
  const windowStart = new Date(Date.now() - RATE_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("lead_results")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= RATE_LIMIT) {
    return NextResponse.json(
      { message: `Rate limit reached. You can qualify up to ${RATE_LIMIT} leads per hour.` },
      { status: 429 }
    );
  }

  const body = (await request.json()) as Record<string, unknown>;

  // Validate field lengths to prevent prompt injection
  for (const [field, max] of Object.entries(FIELD_LIMITS)) {
    const value = body[field];
    if (typeof value === "string" && value.length > max) {
      return NextResponse.json(
        { message: `Field "${field}" exceeds maximum length of ${max} characters.` },
        { status: 400 }
      );
    }
  }

  const lead = body as LeadInput;

  const handle = await tasks.trigger("qualify-lead", lead);
  const result = await runs.poll(handle, { pollIntervalMs: 1000 });

  if (result.status !== "COMPLETED" || !result.output) {
    return NextResponse.json(
      { message: "Qualification task did not complete successfully", status: result.status },
      { status: 500 }
    );
  }

  const qualification = result.output as QualificationResult;

  await supabase.from("lead_results").insert({
    user_id: user.id,
    lead_input: lead,
    result: qualification,
  });

  return NextResponse.json(qualification);
}
