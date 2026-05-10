import { NextRequest, NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase/server";
import type { LeadInput, QualificationResult } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const lead = (await request.json()) as LeadInput;

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
