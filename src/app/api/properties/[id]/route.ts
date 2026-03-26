import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            isVerified: true,
            role: true,
            facebookUrl: true,
            twitterUrl: true,
            instagramUrl: true,
            linkedinUrl: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { reviews: true, savedBy: true } },
      },
    });

    if (!property) {
      return Response.json({ error: "Property not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.property.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const avgRating = await prisma.review.aggregate({
      where: { propertyId: id },
      _avg: { rating: true },
    });

    return Response.json({
      property: {
        ...property,
        _avg: avgRating._avg,
      },
    });
  } catch (error) {
    console.error("Get property error:", error);
    return Response.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return Response.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.ownerId !== user.id && user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();
    const updated = await prisma.property.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price ? parseFloat(data.price) : undefined,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : undefined,
        area: data.area ? parseFloat(data.area) : undefined,
        propertyType: data.propertyType,
        listingType: data.listingType,
        status: data.status,
        images: data.images ? JSON.stringify(data.images) : undefined,
        amenities: data.amenities ? JSON.stringify(data.amenities) : undefined,
      },
    });

    return Response.json({ property: updated });
  } catch (error) {
    console.error("Update property error:", error);
    return Response.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return Response.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.ownerId !== user.id && user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.property.delete({ where: { id } });
    return Response.json({ message: "Property deleted" });
  } catch (error) {
    console.error("Delete property error:", error);
    return Response.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
