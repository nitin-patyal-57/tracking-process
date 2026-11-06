import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email / ID and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const isBusinessAlias =
      cleanEmail === "business.procurement@walnutmedical.com" ||
      cleanEmail === "rajesh" ||
      cleanEmail === "rajesh.kumar@walnutmedical.com";

    // Look up by email or id
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { id: cleanEmail },
          { name: { equals: cleanEmail } },
          ...(isBusinessAlias ? [{ id: "user_business" }] : []),
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found with this email or ID." },
        { status: 401 }
      );
    }

    // Verify password (default "Walnut@2026")
    const isValid = verifyPassword(password, user.password || "Walnut@2026");
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password. Default credentials: Walnut@2026" },
        { status: 401 }
      );
    }

    // Create session token
    const token = createSessionToken(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        department: user.department,
      },
    });

    // Set HTTP-only session cookie
    response.cookies.set("wm_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

