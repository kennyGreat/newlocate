import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalUsers,
      totalProperties,
      totalEscrows,
      totalChats,
      recentProperties,
      recentUsers,
      escrowStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.escrow.count(),
      prisma.chatRoom.count(),
      prisma.property.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { owner: { select: { name: true } } },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.escrow.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    });

    const propertiesByType = await prisma.property.groupBy({
      by: ["propertyType"],
      _count: { propertyType: true },
    });

    return Response.json({
      stats: {
        totalUsers,
        totalProperties,
        totalEscrows,
        totalChats,
      },
      recentProperties,
      recentUsers,
      escrowStats,
      usersByRole,
      propertiesByType,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
