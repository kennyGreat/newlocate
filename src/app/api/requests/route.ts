import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateMatchScore } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requests = await prisma.propertyRequest.findMany({
      where: { userId: user.id },
      include: {
        matches: {
          include: {
            property: {
              include: {
                owner: { select: { name: true, avatar: true } },
              },
            },
          },
          orderBy: { matchScore: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ requests });
  } catch {
    return Response.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const {
      description,
      minPrice,
      maxPrice,
      city,
      country,
      propertyType,
      listingType,
      bedrooms,
      bathrooms,
      isAnonymous,
    } = data;

    const request = await prisma.propertyRequest.create({
      data: {
        userId: user.id,
        description,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        city: city || null,
        country: country || null,
        propertyType: propertyType || null,
        listingType: listingType || null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        isAnonymous: isAnonymous !== false,
      },
    });

    // AI matching - find existing properties
    const properties = await prisma.property.findMany({
      where: { status: "ACTIVE" },
    });

    let matchCount = 0;
    for (const property of properties) {
      const score = calculateMatchScore(
        {
          price: property.price,
          city: property.city,
          country: property.country,
          propertyType: property.propertyType,
          listingType: property.listingType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
        },
        {
          minPrice: request.minPrice,
          maxPrice: request.maxPrice,
          city: request.city,
          country: request.country,
          propertyType: request.propertyType,
          listingType: request.listingType,
          bedrooms: request.bedrooms,
          bathrooms: request.bathrooms,
        }
      );

      if (score > 0.5) {
        await prisma.propertyMatch.create({
          data: {
            propertyId: property.id,
            requestId: request.id,
            matchScore: score,
          },
        });
        matchCount++;
      }
    }

    if (matchCount > 0) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "PROPERTY_MATCH",
          title: "Properties Found!",
          message: `We found ${matchCount} properties matching your request!`,
          data: JSON.stringify({ requestId: request.id }),
        },
      });
    }

    return Response.json({ request, matchCount }, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return Response.json({ error: "Failed to create request" }, { status: 500 });
  }
}
