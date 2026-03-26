import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return Response.json({ notifications });
  } catch {
    return Response.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PUT() {
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return Response.json({ message: "All marked as read" });
  } catch {
    return Response.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
