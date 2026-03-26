import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

// Simulate fetching social media listings
// In production, this would integrate with real social media APIs
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listings = await prisma.socialListing.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return Response.json({ listings });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sourceUrl, sourcePlatform, title, description, price, location, images, contactInfo } =
      await req.json();

    const listing = await prisma.socialListing.upsert({
      where: { sourceUrl },
      create: {
        sourceUrl,
        sourcePlatform,
        title,
        description,
        price: price ? parseFloat(price) : null,
        location,
        images: JSON.stringify(images || []),
        contactInfo,
      },
      update: {
        title,
        description,
        price: price ? parseFloat(price) : null,
        location,
      },
    });

    // Match against property requests
    const requests = await prisma.propertyRequest.findMany();
    for (const request of requests) {
      if (
        request.city &&
        location?.toLowerCase().includes(request.city.toLowerCase())
      ) {
        await prisma.notification.create({
          data: {
            userId: request.userId,
            type: "SOCIAL_LISTING",
            title: "Social Media Match",
            message: `Found a listing on ${sourcePlatform} that might match your request: ${title}`,
            data: JSON.stringify({ listingId: listing.id, sourceUrl }),
          },
        });
      }
    }

    return Response.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Social listing error:", error);
    return Response.json({ error: "Failed to process listing" }, { status: 500 });
  }
}
