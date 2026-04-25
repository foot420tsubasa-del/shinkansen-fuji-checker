import { NextResponse } from "next/server";

const MAX_QUESTION_LENGTH = 1800;

function clean(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const honeypot = clean(body.website, 200);
    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    const question = clean(body.question, MAX_QUESTION_LENGTH);
    if (question.length < 8) {
      return NextResponse.json({ error: "Please enter a question." }, { status: 400 });
    }

    const webhookUrl = process.env.QUESTIONS_WEBHOOK_URL || process.env.GAS_API_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Question form is not connected yet." },
        { status: 503 },
      );
    }

    const payload = {
      action: "feedback",
      token: process.env.QUESTIONS_SHARED_TOKEN || process.env.GAS_SHARED_TOKEN || "",
      submittedAt: new Date().toISOString(),
      topic: clean(body.topic, 80) || "general",
      question,
      email: "",
      name: "",
      locale: clean(body.locale, 20),
      page: clean(body.page, 500),
      userAgent: request.headers.get("user-agent")?.slice(0, 500) || "",
    };

    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Could not save the feedback." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
