"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Ticket = {
  id: string;
  status: string;
  priority: string;
  assignee: string | null;
};

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function TicketControls({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [assignee, setAssignee] = useState(ticket.assignee ?? "");

  async function update(fields: Partial<{ status: string; priority: string; assignee: string }>) {
    setSaving(true);
    await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="border-t border-line pt-6 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Status
          <select
            defaultValue={ticket.status}
            onChange={(e) => update({ status: e.target.value })}
            className="border border-line rounded-sm px-3 py-2 bg-paper"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Priority
          <select
            defaultValue={ticket.priority}
            onChange={(e) => update({ priority: e.target.value })}
            className="border border-line rounded-sm px-3 py-2 bg-paper"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Assignee
        <div className="flex gap-2">
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Unassigned"
            className="border border-line rounded-sm px-3 py-2 bg-paper flex-1"
          />
          <button
            onClick={() => update({ assignee })}
            disabled={saving}
            className="bg-ink text-paper px-4 rounded-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </label>
    </div>
  );
}
