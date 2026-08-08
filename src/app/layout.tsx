import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TicketWise — Triage Queue",
  description: "AI-assisted IT helpdesk ticket triage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-mono min-h-screen">
        <header className="border-b border-line px-8 py-5 flex items-baseline justify-between">
          <a href="/" className="font-display text-2xl tracking-tight">
            TicketWise
          </a>
          <nav className="flex gap-6 text-sm">
            <a href="/" className="hover:text-accent transition-colors">
              Queue
            </a>
            <a
              href="/new"
              className="hover:text-accent transition-colors border border-ink px-3 py-1 rounded-sm"
            >
              New ticket
            </a>
          </nav>
        </header>
        <main className="px-8 py-8 max-w-5xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
