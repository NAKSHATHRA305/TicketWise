import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyTicket } from "@/lib/classifier";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const category = searchParams.get("category");

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(priority ? { priority: priority as any } : {}),
      ...(category ? { category: category as any } : {}),
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, requesterName, requesterEmail } = body;

  if (!title || !description || !requesterName || !requesterEmail) {
    return NextResponse.json(
      { error: "title, description, requesterName, and requesterEmail are all required." },
      { status: 400 }
    );
  }

  const classification = await classifyTicket(title, description);

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      requesterName,
      requesterEmail,
      category: classification.category,
      priority: classification.priority,
      classifiedBy: classification.classifiedBy,
      confidence: classification.confidence,
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
