const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-urgent text-paper",
  HIGH: "bg-warn text-ink",
  MEDIUM: "bg-calm text-paper",
  LOW: "bg-line text-ink",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-sm uppercase tracking-wide ${
        PRIORITY_STYLES[priority] ?? "bg-line text-ink"
      }`}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="text-xs px-2 py-1 rounded-sm border border-line uppercase tracking-wide text-ink/70">
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function CategoryTag({ category }: { category: string }) {
  return (
    <span className="text-xs text-ink/60">
      {category.replace("_", " ").toLowerCase()}
    </span>
  );
}
