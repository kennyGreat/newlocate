import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { maskSensitiveInfo } from "@/lib/utils";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ roomId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { roomId } = await params;
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is in this room
  const participant = await prisma.chatParticipant.findUnique({
    where: { chatRoomId_userId: { chatRoomId: roomId, userId: user.id } },
  });

  if (!participant) {
    return Response.json({ error: "Not a participant" }, { status: 403 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { chatRoomId: roomId, isDeleted: false },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // Return messages with anonymous IDs only
    const anonymizedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      anonymousId: msg.anonymousId,
      isOwn: msg.senderId === user.id,
      createdAt: msg.createdAt,
    }));

    return Response.json({ messages: anonymizedMessages });
  } catch (error) {
    console.error("Get messages error:", error);
    return Response.json({ error: "Failed to get messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { roomId } = await params;
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const participant = await prisma.chatParticipant.findUnique({
    where: { chatRoomId_userId: { chatRoomId: roomId, userId: user.id } },
  });

  if (!participant) {
    return Response.json({ error: "Not a participant" }, { status: 403 });
  }

  try {
    const { content } = await req.json();
    if (!content?.trim()) {
      return Response.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // Mask any sensitive info (phone numbers, addresses, emails)
    const maskedContent = maskSensitiveInfo(content.trim());

    const message = await prisma.message.create({
      data: {
        content: maskedContent,
        senderId: user.id,
        chatRoomId: roomId,
        anonymousId: participant.anonymousId,
      },
    });

    // Update room updatedAt
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    // Notify other participants
    const others = await prisma.chatParticipant.findMany({
      where: { chatRoomId: roomId, userId: { not: user.id } },
    });

    for (const other of others) {
      await prisma.notification.create({
        data: {
          userId: other.userId,
          type: "MESSAGE",
          title: "New Message",
          message: "You have a new anonymous message",
          data: JSON.stringify({ chatRoomId: roomId }),
        },
      });
    }

    return Response.json({
      message: {
        id: message.id,
        content: message.content,
        anonymousId: message.anonymousId,
        isOwn: true,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
