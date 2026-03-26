import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const escrows = await prisma.escrow.findMany({
      where: {
        OR: [
          { buyerId: user.id },
          { sellerId: user.id },
          { buyerAgentId: user.id },
          { sellerAgentId: user.id },
        ],
      },
      include: {
        property: { select: { id: true, title: true, price: true, images: true } },
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ escrows });
  } catch {
    return Response.json({ error: "Failed to fetch escrows" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { propertyId, sellerId, amount, currency, notes } = await req.json();

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return Response.json({ error: "Property not found" }, { status: 404 });
    }

    const escrow = await prisma.escrow.create({
      data: {
        propertyId,
        buyerId: user.id,
        sellerId: sellerId || property.ownerId,
        amount: parseFloat(amount),
        currency: currency || "USD",
        notes: notes || null,
      },
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: "ESCROW_UPDATE",
        title: "New Escrow Initiated",
        message: `A buyer has initiated an escrow for your property: ${property.title}`,
        data: JSON.stringify({ escrowId: escrow.id }),
      },
    });

    return Response.json({ escrow }, { status: 201 });
  } catch (error) {
    console.error("Create escrow error:", error);
    return Response.json({ error: "Failed to create escrow" }, { status: 500 });
  }
}
