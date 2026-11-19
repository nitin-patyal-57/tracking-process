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

    const rawClean = String(email).trim().toLowerCase();
    const noSpaces = rawClean.replace(/\s+/g, "");

    const isAbhishek =
      rawClean === "abhishek" ||
      rawClean === "mr. abhishek" ||
      rawClean === "abhishek saini" ||
      noSpaces.includes("abhishek");

    const isSukhbir =
      rawClean === "sukhbir" ||
      rawClean === "mr. sukhbir" ||
      noSpaces.includes("sukhbir");

    const isRajesh =
      rawClean === "rajesh" ||
      rawClean === "mr. rajesh" ||
      rawClean === "mr. rajesh kumar" ||
      noSpaces.includes("rajesh");

    const isJaydeep =
      rawClean === "jaydeep" ||
      rawClean === "mr. jaydeep" ||
      rawClean === "mr. jaydeep panchal" ||
      noSpaces.includes("jaydeep");

    const isAmol =
      rawClean === "amol" ||
      rawClean === "mr. amol" ||
      rawClean === "mr. amol bhardwaj" ||
      noSpaces.includes("amol");

    const isAdmin =
      rawClean === "admin" ||
      rawClean === "walnut admin" ||
      noSpaces.includes("admin");

    // Look up by email, ID, alias, or normalized string
    const user = await prisma.user.findFirst({
      where: {
        isActive: true,
        OR: [
          { email: rawClean },
          { email: noSpaces },
          { id: rawClean },
          { id: noSpaces },
          { name: { equals: rawClean } },
          ...(isAbhishek ? [{ id: "user_abhishek" }] : []),
          ...(isJaydeep ? [{ id: "user_jaydeep" }] : []),
          ...(isAmol ? [{ id: "user_amol" }] : []),
          ...(isSukhbir ? [{ id: "user_business" }] : []),
          ...(isRajesh ? [{ id: "user_rajesh" }] : []),
          ...(isAdmin ? [{ id: "user_admin" }] : []),
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
