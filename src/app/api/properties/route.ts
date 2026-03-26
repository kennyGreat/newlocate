import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateMatchScore } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const country = searchParams.get("country") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const propertyType = searchParams.get("propertyType");
    const listingType = searchParams.get("listingType");
    const bedrooms = searchParams.get("bedrooms");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const featured = searchParams.get("featured") === "true";

    const where: Record<string, unknown> = {
      status: "ACTIVE",
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { address: { contains: q } },
        { city: { contains: q } },
      ];
    }
    if (city) where.city = { contains: city };
    if (country) where.country = { contains: country };
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }
    if (propertyType) where.propertyType = propertyType;
    if (listingType) where.listingType = listingType;
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
    if (featured) where.isFeatured = true;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: { select: { name: true, avatar: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    // Calculate average ratings
    const propIds = properties.map((p) => p.id);
    const avgRatings = await Promise.all(
      propIds.map((id) =>
        prisma.review.aggregate({
          where: { propertyId: id },
          _avg: { rating: true },
        })
      )
    );

    const propertiesWithRatings = properties.map((p, i) => ({
      ...p,
      _avg: avgRatings[i]._avg,
    }));

    return Response.json({
      properties: propertiesWithRatings,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get properties error:", error);
    return Response.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!["SELLER", "SELLER_AGENT", "ADMIN"].includes(user.role)) {
    return Response.json({ error: "Not authorized to list properties" }, { status: 403 });
  }

  try {
    const data = await req.json();
    const {
      title,
      description,
      price,
      priceUnit,
      address,
      city,
      state,
      country,
      zipCode,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      area,
      areaUnit,
      propertyType,
      listingType,
      images,
      amenities,
    } = data;

    if (!title || !description || !price || !address || !city || !country) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        priceUnit: priceUnit || "USD",
        address,
        city,
        state: state || "",
        country,
        zipCode: zipCode || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        area: area ? parseFloat(area) : null,
        areaUnit: areaUnit || "sqft",
        propertyType: propertyType || "HOUSE",
        listingType: listingType || "SALE",
        images: JSON.stringify(images || []),
        amenities: JSON.stringify(amenities || []),
        ownerId: user.id,
      },
    });

    // Run AI matching - find all property requests (including anonymous) for this new property
    const requests = await prisma.propertyRequest.findMany();

    for (const request of requests) {
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
        await prisma.propertyMatch.upsert({
          where: { propertyId_requestId: { propertyId: property.id, requestId: request.id } },
          create: { propertyId: property.id, requestId: request.id, matchScore: score },
          update: { matchScore: score },
        });

        await prisma.notification.create({
          data: {
            userId: request.userId,
            type: "PROPERTY_MATCH",
            title: "New Property Match!",
            message: `A new property matches your request: ${property.title}`,
            data: JSON.stringify({ propertyId: property.id }),
          },
        });
      }
    }

    return Response.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Create property error:", error);
    return Response.json({ error: "Failed to create property" }, { status: 500 });
  }
}
