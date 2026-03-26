import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateAnonymousId } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rooms = await prisma.chatRoom.findMany({
      where: {
        participants: { some: { userId: user.id } },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return Response.json({ rooms });
  } catch (error) {
    console.error("Get rooms error:", error);
    return Response.json({ error: "Failed to get chat rooms" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return Response.json({ error: "Target user required" }, { status: 400 });
    }

    if (targetUserId === user.id) {
      return Response.json({ error: "Cannot chat with yourself" }, { status: 400 });
    }

    // Check if room already exists between these two users
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
    });

    if (existingRoom) {
      return Response.json({ room: existingRoom });
    }

    // Create new room
    const room = await prisma.chatRoom.create({
      data: {
        isAnonymous: true,
        participants: {
          create: [
            { userId: user.id, anonymousId: generateAnonymousId() },
            { userId: targetUserId, anonymousId: generateAnonymousId() },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    return Response.json({ room }, { status: 201 });
  } catch (error) {
    console.error("Create room error:", error);
    return Response.json({ error: "Failed to create chat room" }, { status: 500 });
  }
}
