import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const escrow = await prisma.escrow.findUnique({ where: { id } });
    if (!escrow) {
      return Response.json({ error: "Escrow not found" }, { status: 404 });
    }

    const isParticipant = [
      escrow.buyerId,
      escrow.sellerId,
      escrow.buyerAgentId,
      escrow.sellerAgentId,
    ].includes(user.id) || user.role === "ADMIN";

    if (!isParticipant) {
      return Response.json({ error: "Not authorized" }, { status: 403 });
    }

    const { action, notes } = await req.json();

    let updateData: Record<string, unknown> = {};
    let newStatus = escrow.status;

    if (action === "buyer_confirm") {
      if (user.id !== escrow.buyerId) {
        return Response.json({ error: "Only buyer can confirm" }, { status: 403 });
      }
      updateData.buyerConfirmed = true;
      if (escrow.sellerConfirmed) {
        newStatus = "DOCUMENTS_VERIFIED";
      } else {
        newStatus = "BUYER_CONFIRMED";
      }
    } else if (action === "seller_confirm") {
      if (user.id !== escrow.sellerId) {
        return Response.json({ error: "Only seller can confirm" }, { status: 403 });
      }
      updateData.sellerConfirmed = true;
      if (escrow.buyerConfirmed) {
        newStatus = "DOCUMENTS_VERIFIED";
      } else {
        newStatus = "SELLER_CONFIRMED";
      }
    } else if (action === "verify_documents") {
      if (user.role !== "ADMIN") {
        return Response.json({ error: "Only admin can verify documents" }, { status: 403 });
      }
      updateData.documentsVerified = true;
      newStatus = "PAYMENT_RECEIVED";
    } else if (action === "complete") {
      if (user.role !== "ADMIN") {
        return Response.json({ error: "Only admin can complete escrow" }, { status: 403 });
      }
      newStatus = "COMPLETED";
    } else if (action === "dispute") {
      newStatus = "DISPUTED";
    } else if (action === "cancel") {
      if (!["INITIATED", "BUYER_CONFIRMED", "SELLER_CONFIRMED"].includes(escrow.status)) {
        return Response.json({ error: "Cannot cancel at this stage" }, { status: 400 });
      }
      newStatus = "CANCELLED";
    }

    const updated = await prisma.escrow.update({
      where: { id },
      data: {
        ...updateData,
        status: newStatus,
        notes: notes || escrow.notes,
      },
    });

    // Notify relevant parties
    const notifyIds = [escrow.buyerId, escrow.sellerId].filter(Boolean) as string[];
    for (const notifyId of notifyIds) {
      if (notifyId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: notifyId,
            type: "ESCROW_UPDATE",
            title: "Escrow Update",
            message: `Escrow status updated to: ${newStatus.replace(/_/g, " ")}`,
            data: JSON.stringify({ escrowId: id }),
          },
        });
      }
    }

    return Response.json({ escrow: updated });
  } catch (error) {
    console.error("Update escrow error:", error);
    return Response.json({ error: "Failed to update escrow" }, { status: 500 });
  }
}
