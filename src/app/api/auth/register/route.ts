import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, country, phone } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "BUYER",
        country: country || null,
        phone: phone || null,
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "GENERAL",
        title: "Welcome to NewLocate!",
        message: `Welcome ${user.name}! Start exploring properties or list your own.`,
      },
    });

    return Response.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ error: "Failed to create account" }, { status: 500 });
  }
}
