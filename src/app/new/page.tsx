"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTicketPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      requesterName: form.get("requesterName"),
      requesterEmail: form.get("requesterEmail"),
    };

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong submitting the ticket.");
      return;
    }

    const ticket = await res.json();
    router.push(`/tickets/${ticket.id}`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-2">New ticket</h1>
      <p className="text-sm text-ink/60 mb-8">
        Describe the issue in your own words. Category and priority are assigned automatically.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1 text-sm">
          Title
          <input
            name="title"
            required
            className="border border-line rounded-sm px-3 py-2 bg-paper focus:outline-none focus:border-accent"
            placeholder="Can't log into the VPN"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            name="description"
            required
            rows={5}
            className="border border-line rounded-sm px-3 py-2 bg-paper focus:outline-none focus:border-accent"
            placeholder="What happened, when it started, and what you've already tried."
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Your name
            <input
              name="requesterName"
              required
              className="border border-line rounded-sm px-3 py-2 bg-paper focus:outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Your email
            <input
              name="requesterEmail"
              type="email"
              required
              className="border border-line rounded-sm px-3 py-2 bg-paper focus:outline-none focus:border-accent"
            />
          </label>
        </div>

        {error && <p className="text-sm text-urgent">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="self-start bg-ink text-paper px-5 py-2 rounded-sm hover:bg-accent transition-colors disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit ticket"}
        </button>
      </form>
    </div>
  );
}
