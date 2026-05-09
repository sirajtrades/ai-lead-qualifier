import { task } from "@trigger.dev/sdk/v3";
import Anthropic from "@anthropic-ai/sdk";

export type LeadInput = {
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  email: string;
  phone?: string;
  companySize?: string;
  budget?: string;
  useCase?: string;
  notes?: string;
};

export type QualificationResult = {
  score: number;          // 0–100
  tier: "hot" | "warm" | "cold";
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendedAction: string;
};

export const qualifyLead = task({
  id: "qualify-lead",
  maxDuration: 120,
  run: async (payload: LeadInput): Promise<QualificationResult> => {
    const client = new Anthropic();

    const prompt = `You are an expert sales qualification specialist. Analyze the following lead and provide a structured qualification assessment.

Lead Information:
- Name: ${payload.firstName} ${payload.lastName}
- Company: ${payload.company}
- Role: ${payload.role}
- Email: ${payload.email}
${payload.phone ? `- Phone: ${payload.phone}` : ""}
${payload.companySize ? `- Company Size: ${payload.companySize}` : ""}
${payload.budget ? `- Budget: ${payload.budget}` : ""}
${payload.useCase ? `- Use Case: ${payload.useCase}` : ""}
${payload.notes ? `- Additional Notes: ${payload.notes}` : ""}

Provide a JSON qualification assessment with this exact structure:
{
  "score": <number 0-100>,
  "tier": "<hot|warm|cold>",
  "summary": "<2-3 sentence overview>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "recommendedAction": "<specific next step>"
}

Scoring guide: 80-100 = hot (high intent, clear budget, strong fit), 50-79 = warm (moderate fit, needs nurturing), 0-49 = cold (poor fit or insufficient info).

Return ONLY raw JSON. No markdown, no code blocks, no backticks, no explanation. Start your response with { and end with }.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const cleaned = content.text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const result = JSON.parse(cleaned) as QualificationResult;
    return result;
  },
});
