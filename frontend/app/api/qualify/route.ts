import { tasks, runs, configure } from "@trigger.dev/sdk/v3";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

if (!process.env.TRIGGER_SECRET_KEY) {
  throw new Error("Missing required environment variable: TRIGGER_SECRET_KEY");
}
configure({ secretKey: process.env.TRIGGER_SECRET_KEY });

export async function POST(request: Request) {
  // Auth check — must be first
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Trigger the qualify-lead task
    const run = await tasks.trigger("qualify-lead", body);

    // Poll until complete (task typically finishes in 3-10s)
    const finished = await runs.poll(run.id, { pollIntervalMs: 1000 });

    if (finished.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, error: `Run ended with status: ${finished.status}` },
        { status: 500 }
      );
    }

    const report = finished.output as {
      fitScore: number;
      verdict: "Qualified" | "Nurture" | "Disqualify";
      lead?: string;
      [key: string]: unknown;
    };

    // Save to Supabase — save failure does not block the response
    const { error: saveError } = await supabase
      .from("lead_qualifications")
      .insert({
        user_id: user.id,
        company_name: body.companyName ?? report.lead ?? "Unknown",
        industry: body.industry ?? null,
        fit_score: report.fitScore,
        verdict: report.verdict,
        report: report,
      });

    if (saveError) {
      console.error("[qualify] Failed to save qualification:", saveError.message);
    }

    return NextResponse.json({ success: true, data: report });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
