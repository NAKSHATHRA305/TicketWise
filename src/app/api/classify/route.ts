import { NextRequest, NextResponse } from "next/server";
import { classifyTicket } from "@/lib/classifier";

// Lets you test the classifier directly, e.g. from the dashboard or via curl,
// without creating a ticket. Handy for demoing the AI piece in an interview.
export async function POST(req: NextRequest) {
  const { title, description } = await req.json();

  if (!title || !description) {
    return NextResponse.json({ error: "title and description are required." }, { status: 400 });
  }

  const result = await classifyTicket(title, description);
  return NextResponse.json(result);
}
