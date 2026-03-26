import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const reviews = await prisma.review.findMany({
      where: { propertyId: id },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const avg = await prisma.review.aggregate({
      where: { propertyId: id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return Response.json({ reviews, avgRating: avg._avg.rating, totalReviews: avg._count.rating });
  } catch {
    return Response.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rating, comment } = await req.json();
    if (!rating || !comment) {
      return Response.json({ error: "Rating and comment required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return Response.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return Response.json({ error: "Property not found" }, { status: 404 });
    }

    // Check for duplicate review
    const existing = await prisma.review.findFirst({
      where: { propertyId: id, reviewerId: user.id },
    });
    if (existing) {
      return Response.json({ error: "Already reviewed" }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        rating: parseInt(String(rating)),
        comment,
        reviewerId: user.id,
        propertyId: id,
        revieweeId: property.ownerId,
      },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Notify property owner
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: "REVIEW",
        title: "New Review",
        message: `${user.name} gave your property ${rating} stars`,
        data: JSON.stringify({ propertyId: id, reviewId: review.id }),
      },
    });

    return Response.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return Response.json({ error: "Failed to create review" }, { status: 500 });
  }
}
