import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return Response.json({ user: null });
  }

  const unreadNotifications = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      country: user.country,
      bio: user.bio,
    },
    unreadNotifications,
  });
}

export async function PUT(req: Request) {
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const {
      name,
      bio,
      phone,
      country,
      city,
      facebookUrl,
      twitterUrl,
      instagramUrl,
      linkedinUrl,
      preferences,
    } = data;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        bio: bio ?? user.bio,
        phone: phone ?? user.phone,
        country: country ?? user.country,
        city: city ?? user.city,
        facebookUrl: facebookUrl ?? user.facebookUrl,
        twitterUrl: twitterUrl ?? user.twitterUrl,
        instagramUrl: instagramUrl ?? user.instagramUrl,
        linkedinUrl: linkedinUrl ?? user.linkedinUrl,
        preferences: preferences ? JSON.stringify(preferences) : user.preferences,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
        country: true,
        city: true,
        facebookUrl: true,
        twitterUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
      },
    });

    return Response.json({ user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
