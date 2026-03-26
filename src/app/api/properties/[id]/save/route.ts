import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.savedProperty.upsert({
      where: { userId_propertyId: { userId: user.id, propertyId: id } },
      create: { userId: user.id, propertyId: id },
      update: {},
    });
    return Response.json({ saved: true });
  } catch {
    return Response.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.savedProperty.deleteMany({
      where: { userId: user.id, propertyId: id },
    });
    return Response.json({ saved: false });
  } catch {
    return Response.json({ error: "Failed to unsave" }, { status: 500 });
  }
}
