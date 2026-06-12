import { task, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { env } from "../lib/env";

// ── Schemas ───────────────────────────────────────────────────────────────────

const LeadSchema = z.object({
  companyName:       z.string().min(1),
  industry:          z.string().min(1),
  companySize:       z.enum(["<10", "10-50", "50-200", "200+"]),
  estimatedRevenue:  z.enum(["<$1M", "$1-10M", "$10-50M", "$50M+"]),
  painPoint:         z.string().min(1),
  budget:            z.enum(["No budget", "Under $10k", "$10-50k", "$50k+"]),
  timeline:          z.enum(["No timeline", "6+ months", "1-6 months", "Immediate"]),
});

interface QualificationReport {
  fitScore: number;
  verdict: "Qualified" | "Nurture" | "Disqualify";
  executiveSummary: string;
  redFlags: string[];
  followUpActions: string[];
  pitchAngle: string;
}

interface OpenRouterResponse {
  choices: Array<{ message: { content: string } }>;
}

// ── Task ──────────────────────────────────────────────────────────────────────

export const qualifyLead = task({
  id: "qualify-lead",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 30000,
    maxTimeoutInMs: 120000,
    randomize: true,
  },

  run: async (payload: unknown) => {
    // ── Step 1: Validate input ──────────────────────────────────────────────
    const lead = LeadSchema.parse(payload);

    logger.info("Step 1: Lead validated", {
      companyName: lead.companyName,
      industry: lead.industry,
      budget: lead.budget,
      timeline: lead.timeline,
    });

    // ── Step 2: Build prompt ────────────────────────────────────────────────
    const prompt = `You are an expert B2B sales qualification analyst. Analyze this prospect and return a JSON qualification report.

## Lead Data
- Company: ${lead.companyName}
- Industry: ${lead.industry}
- Company Size: ${lead.companySize} employees
- Estimated Revenue: ${lead.estimatedRevenue}
- Pain Point: ${lead.painPoint}
- Budget: ${lead.budget}
- Timeline: ${lead.timeline}

## Instructions
Score and qualify this lead using a BANT-style analysis (Budget, Authority/Fit, Need, Timeline). Consider:
- Budget alignment: does their stated budget suggest they can afford a real solution?
- Need urgency: is the pain point specific and acute, or vague?
- Timeline readiness: are they buying soon or just exploring?
- Company fit: does the size/industry/revenue suggest a good customer profile?

Return ONLY a valid JSON object with no markdown, no preamble, no trailing text:
{
  "fitScore": <integer 0-100>,
  "verdict": <"Qualified" | "Nurture" | "Disqualify">,
  "executiveSummary": "<2-3 sentence summary of the lead's situation and why they score as they do>",
  "redFlags": ["<concern 1>", "<concern 2>"],
  "followUpActions": ["<specific action 1>", "<specific action 2>", "<specific action 3>"],
  "pitchAngle": "<1-2 sentences on the recommended messaging approach for this specific lead>"
}

Verdict thresholds: Qualified ≥ 70, Nurture 40-69, Disqualify < 40.`;

    logger.info("Step 2: Prompt built", { promptLength: prompt.length });

    // ── Step 3: Call OpenRouter ─────────────────────────────────────────────
    logger.info("Step 3: Calling OpenRouter (gpt-4o-mini)");

    let response: Response;
    try {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.openRouterApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      });
    } catch (err) {
      throw new Error(`OpenRouter network error: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${text}`);
    }

    const data = await response.json() as OpenRouterResponse;
    const raw = data.choices[0].message.content.trim();

    logger.info("Step 3: Response received", { rawLength: raw.length });

    // ── Step 4: Parse report ────────────────────────────────────────────────
    let report: QualificationReport;
    try {
      report = JSON.parse(raw) as QualificationReport;
    } catch {
      const stripped = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/, "");
      report = JSON.parse(stripped) as QualificationReport;
    }

    logger.info("Step 4: Report parsed", {
      fitScore: report.fitScore,
      verdict: report.verdict,
      redFlagCount: report.redFlags.length,
    });

    // ── Return ──────────────────────────────────────────────────────────────
    const result = { lead: lead.companyName, ...report };
    logger.info("Task complete", result);
    return result;
  },
});
