"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

const topics = ["site", "review", "tip", "train", "tokyo", "other"];

type SubmitState = "idle" | "sending" | "sent" | "error";

export function QuestionForm({ locale }: { locale: string }) {
  const t = useTranslations("feedback");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");
    setMessage("");

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        topic: data.get("topic"),
        question: data.get("question"),
        website: data.get("website"),
        locale,
        page: window.location.href,
      }),
    });

    if (res.ok) {
      setState("sent");
      form.reset();
      setMessage(t("sent"));
      return;
    }

    const json = await res.json().catch(() => null);
    setState("error");
    setMessage(json?.error || t("error"));
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4">
        <label className="grid gap-1.5 text-sm font-semibold text-slate-800">
          {t("topic")}
          <select
            name="topic"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            defaultValue="site"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>{t(`topics.${topic}`)}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-semibold text-slate-800">
          {t("fieldLabel")}
          <textarea
            name="question"
            required
            minLength={8}
            maxLength={1800}
            rows={7}
            placeholder={t("placeholder")}
            className="resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal leading-6 text-slate-800 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </label>

        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            {t("note")}
          </p>
          <button
            type="submit"
            disabled={state === "sending"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <Send className="h-4 w-4" />
            {state === "sending" ? t("sending") : t("submit")}
          </button>
        </div>

        {message && (
          <p className={state === "sent" ? "text-sm font-medium text-emerald-700" : "text-sm font-medium text-red-700"}>
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
