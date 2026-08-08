import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PriorityBadge, StatusBadge, CategoryTag } from "@/components/Badges";
import TicketControls from "./TicketControls";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <CategoryTag category={ticket.category} />
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
      </div>

      <h1 className="font-display text-3xl mb-1">{ticket.title}</h1>
      <p className="text-sm text-ink/60 mb-6">
        {ticket.requesterName} · {ticket.requesterEmail} ·{" "}
        {new Date(ticket.createdAt).toLocaleString()}
      </p>

      <p className="whitespace-pre-wrap leading-relaxed mb-8">{ticket.description}</p>

      <p className="text-xs text-ink/40 mb-8">
        Classified by {ticket.classifiedBy}
        {ticket.confidence ? ` · ${Math.round(ticket.confidence * 100)}% confidence` : ""}
      </p>

      <TicketControls ticket={ticket} />
    </div>
  );
}
