import { tasks, runs, configure } from "@trigger.dev/sdk/v3";
import { NextResponse } from "next/server";

export const maxDuration = 60;

configure({ secretKey: process.env.TRIGGER_SECRET_KEY ?? "" });

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Trigger the qualify-lead task
    const run = await tasks.trigger("qualify-lead", body);

    // Poll until complete (task typically finishes in 3-10s)
    const finished = await runs.poll(run.id, { pollIntervalMs: 1000 });

    if (finished.status === "COMPLETED") {
      return NextResponse.json({ success: true, data: finished.output });
    }

    return NextResponse.json(
      { success: false, error: `Run ended with status: ${finished.status}` },
      { status: 500 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
