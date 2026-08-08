import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PriorityBadge, StatusBadge, CategoryTag } from "@/components/Badges";

export const dynamic = "force-dynamic";

const PRIORITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export default async function QueuePage() {
  const tickets = await prisma.ticket.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  const sorted = [...tickets].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  const openCount = tickets.filter((t: (typeof tickets)[number]) => t.status === "OPEN").length;
  const criticalCount = tickets.filter(
    (t: (typeof tickets)[number]) => t.priority === "CRITICAL"
  ).length;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="font-display text-3xl">Triage queue</h1>
        <p className="text-sm text-ink/60">
          {openCount} open · {criticalCount} critical
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-10 text-center text-ink/60">
          No tickets yet. Submit one from{" "}
          <Link href="/new" className="text-accent underline">
            New ticket
          </Link>
          .
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/tickets/${ticket.id}`}
                className="block border border-line rounded-sm px-5 py-4 hover:border-accent transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display text-lg truncate">{ticket.title}</p>
                    <p className="text-sm text-ink/60 truncate">{ticket.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <CategoryTag category={ticket.category} />
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
