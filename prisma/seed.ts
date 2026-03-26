import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const adapter = new PrismaLibSql({ url: `file:${path.resolve(process.cwd(), "dev.db")}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create users
  const users = [
    {
      name: "Admin User",
      email: "admin@newlocate.com",
      password: "admin123!",
      role: "ADMIN" as const,
      country: "United States",
      bio: "Platform administrator",
      isVerified: true,
    },
    {
      name: "John Buyer",
      email: "buyer@newlocate.com",
      password: "buyer123!",
      role: "BUYER" as const,
      country: "Nigeria",
      bio: "Looking for property in Lagos",
      isVerified: true,
    },
    {
      name: "Sarah Seller",
      email: "seller@newlocate.com",
      password: "seller123!",
      role: "SELLER" as const,
      country: "Nigeria",
      bio: "Property seller in Lagos and Abuja",
      isVerified: true,
    },
    {
      name: "David Agent",
      email: "agent@newlocate.com",
      password: "agent123!",
      role: "SELLER_AGENT" as const,
      country: "Nigeria",
      bio: "Certified real estate agent with 10+ years experience",
      isVerified: true,
    },
    {
      name: "Priya Diaspora",
      email: "diaspora@newlocate.com",
      password: "diaspora123!",
      role: "BUYER" as const,
      country: "United Kingdom",
      bio: "Nigerian diaspora looking for investment property back home",
      isVerified: false,
    },
  ];

  const createdUsers: { [email: string]: string } = {};

  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existing) {
      const hashed = await bcrypt.hash(user.password, 12);
      const created = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashed,
          role: user.role,
          country: user.country,
          bio: user.bio,
          isVerified: user.isVerified,
        },
      });
      createdUsers[user.email] = created.id;
      console.log(`Created user: ${user.name} (${user.role})`);
    } else {
      createdUsers[user.email] = existing.id;
      console.log(`User exists: ${user.name}`);
    }
  }

  const sellerId = createdUsers["seller@newlocate.com"];
  const agentId = createdUsers["agent@newlocate.com"];
  const buyerId = createdUsers["buyer@newlocate.com"];

  // Create properties
  const properties = [
    {
      title: "Modern 3-Bedroom House in Victoria Island",
      description: "Beautiful modern house in the heart of Victoria Island. Features a spacious living room, modern kitchen, and a lovely garden. Perfect for families. Close to major shopping malls and business districts.",
      price: 75000000,
      priceUnit: "NGN",
      address: "15 Adeola Odeku Street",
      city: "Lagos",
      state: "Lagos State",
      country: "Nigeria",
      latitude: 6.4317,
      longitude: 3.4222,
      bedrooms: 3,
      bathrooms: 3,
      area: 250,
      areaUnit: "sqm",
      propertyType: "HOUSE" as const,
      listingType: "SALE" as const,
      isFeatured: true,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      ]),
      amenities: JSON.stringify(["Parking", "Security", "Generator", "Swimming Pool", "Garden"]),
      ownerId: sellerId,
    },
    {
      title: "Luxury Apartment in Lekki Phase 1",
      description: "Exquisite luxury apartment in the prestigious Lekki Phase 1. Ocean views, premium finishes, and state-of-the-art facilities. Ideal for executives and high-net-worth individuals.",
      price: 250000,
      priceUnit: "USD",
      address: "45 Admiralty Way",
      city: "Lagos",
      state: "Lagos State",
      country: "Nigeria",
      latitude: 6.4477,
      longitude: 3.5328,
      bedrooms: 4,
      bathrooms: 4,
      area: 400,
      areaUnit: "sqm",
      propertyType: "APARTMENT" as const,
      listingType: "SALE" as const,
      isFeatured: true,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      ]),
      amenities: JSON.stringify(["Elevator", "Swimming Pool", "Gym", "CCTV", "Parking", "24/7 Security"]),
      ownerId: agentId,
    },
    {
      title: "Self-Contained Studio in Yaba",
      description: "Cozy and affordable studio apartment in the tech hub of Lagos. Close to universities, tech companies, and major roads. Perfect for young professionals and students.",
      price: 500000,
      priceUnit: "NGN",
      address: "8 Herbert Macaulay Way",
      city: "Lagos",
      state: "Lagos State",
      country: "Nigeria",
      latitude: 6.5075,
      longitude: 3.3745,
      bedrooms: 1,
      bathrooms: 1,
      area: 35,
      areaUnit: "sqm",
      propertyType: "STUDIO" as const,
      listingType: "RENT" as const,
      isFeatured: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      ]),
      amenities: JSON.stringify(["WiFi", "Water Supply", "AC"]),
      ownerId: sellerId,
    },
    {
      title: "5-Bedroom Mansion in Banana Island",
      description: "Ultra-luxury mansion in the exclusive Banana Island. Features a private pool, cinema room, staff quarters, and direct waterfront access. A true masterpiece of modern architecture.",
      price: 1500000,
      priceUnit: "USD",
      address: "Plot 12 Bourdillon Road",
      city: "Lagos",
      state: "Lagos State",
      country: "Nigeria",
      latitude: 6.4526,
      longitude: 3.4438,
      bedrooms: 5,
      bathrooms: 6,
      area: 1200,
      areaUnit: "sqm",
      propertyType: "VILLA" as const,
      listingType: "SALE" as const,
      isFeatured: true,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
        "https://images.unsplash.com/photo-1615529151169-7b1ff50dc7f2?w=800",
      ]),
      amenities: JSON.stringify(["Swimming Pool", "Cinema", "Gym", "Servant Quarters", "Elevator", "Solar Power", "Borehole", "Security"]),
      ownerId: agentId,
    },
    {
      title: "Commercial Space in Nairobi CBD",
      description: "Prime commercial office space in Nairobi's Central Business District. Modern open-plan layout with meeting rooms, high-speed internet, and parking. Ideal for startups and established businesses.",
      price: 45000,
      priceUnit: "USD",
      address: "Upper Hill Road",
      city: "Nairobi",
      state: "Nairobi County",
      country: "Kenya",
      latitude: -1.2864,
      longitude: 36.8172,
      area: 300,
      areaUnit: "sqm",
      propertyType: "COMMERCIAL" as const,
      listingType: "RENT" as const,
      isFeatured: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
      ]),
      amenities: JSON.stringify(["WiFi", "Parking", "AC", "Security", "Elevator"]),
      ownerId: sellerId,
    },
    {
      title: "2-Bedroom Flat in Accra, East Legon",
      description: "Modern 2-bedroom flat in the upscale East Legon neighborhood. Gated community with 24-hour security. Walking distance to American International School and major shopping areas.",
      price: 180000,
      priceUnit: "USD",
      address: "15 Boundary Road",
      city: "Accra",
      state: "Greater Accra",
      country: "Ghana",
      latitude: 5.6037,
      longitude: -0.1870,
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      areaUnit: "sqm",
      propertyType: "APARTMENT" as const,
      listingType: "SALE" as const,
      isFeatured: true,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
      ]),
      amenities: JSON.stringify(["Parking", "Security", "AC", "Generator", "Garden"]),
      ownerId: agentId,
    },
    {
      title: "Land Plot in Abuja FCT",
      description: "Prime residential plot in the Federal Capital Territory. Strategic location near government offices and major roads. Excellent investment opportunity with high appreciation potential.",
      price: 120000000,
      priceUnit: "NGN",
      address: "Jabi District",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
      latitude: 9.0765,
      longitude: 7.3986,
      area: 1000,
      areaUnit: "sqm",
      propertyType: "LAND" as const,
      listingType: "SALE" as const,
      isFeatured: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
      ]),
      amenities: JSON.stringify([]),
      ownerId: sellerId,
    },
    {
      title: "3BHK Apartment in Mumbai, Bandra",
      description: "Spacious 3BHK apartment in the premium Bandra West locality. Sea-facing with stunning views. Premium society amenities including gym, pool, and children's play area.",
      price: 45000000,
      priceUnit: "INR",
      address: "32 Carter Road",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      latitude: 19.0606,
      longitude: 72.8362,
      bedrooms: 3,
      bathrooms: 3,
      area: 1400,
      areaUnit: "sqft",
      propertyType: "APARTMENT" as const,
      listingType: "SALE" as const,
      isFeatured: true,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      ]),
      amenities: JSON.stringify(["Swimming Pool", "Gym", "Parking", "Security", "Elevator", "Children's Play Area"]),
      ownerId: agentId,
    },
  ];

  for (const property of properties) {
    const existing = await prisma.property.findFirst({
      where: { title: property.title, ownerId: property.ownerId },
    });

    if (!existing) {
      await prisma.property.create({ data: property });
      console.log(`Created property: ${property.title}`);
    } else {
      console.log(`Property exists: ${property.title}`);
    }
  }

  // Create a property request
  const existingRequest = await prisma.propertyRequest.findFirst({
    where: { userId: buyerId },
  });
  if (!existingRequest) {
    await prisma.propertyRequest.create({
      data: {
        userId: buyerId,
        description: "Looking for a 3-bedroom house in Lagos for my family. Must have good security and parking.",
        minPrice: 40000000,
        maxPrice: 100000000,
        city: "Lagos",
        country: "Nigeria",
        propertyType: "HOUSE",
        listingType: "SALE",
        bedrooms: 3,
        isAnonymous: false,
      },
    });
    console.log("Created property request for buyer");
  }

  // Create sample notifications
  const existingNotif = await prisma.notification.findFirst({
    where: { userId: buyerId },
  });
  if (!existingNotif) {
    await prisma.notification.create({
      data: {
        userId: buyerId,
        type: "PROPERTY_MATCH",
        title: "New Property Match!",
        message: "We found properties matching your request in Lagos!",
      },
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("\nDemo accounts:");
  console.log("  Admin: admin@newlocate.com / admin123!");
  console.log("  Buyer: buyer@newlocate.com / buyer123!");
  console.log("  Seller: seller@newlocate.com / seller123!");
  console.log("  Agent: agent@newlocate.com / agent123!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
