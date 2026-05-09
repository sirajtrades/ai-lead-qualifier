import { NextRequest, NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { LeadInput, QualificationResult } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const lead = (await request.json()) as LeadInput;

  const handle = await tasks.trigger("qualify-lead", lead);

  const result = await runs.poll(handle, { pollIntervalMs: 1000 });

  if (result.status !== "COMPLETED" || !result.output) {
    return NextResponse.json(
      { message: "Qualification task did not complete successfully", status: result.status },
      { status: 500 }
    );
  }

  return NextResponse.json(result.output as QualificationResult);
}
