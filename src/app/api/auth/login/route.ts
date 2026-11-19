import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken } from "@/lib/auth";

const DEFAULT_USERS = [
  {
    id: "user_abhishek",
    name: "Abhishek Saini",
    email: "abhishek.saini@walnutmedical.com",
    password: "Walnut@2026",
    role: "APPROVER_TIER1",
    designation: "R&D Team Lead",
    department: "R&D",
    isActive: true,
  },
  {
    id: "user_jaydeep",
    name: "Mr. Jaydeep Panchal",
    email: "jaydeep.panchal@walnutmedical.com",
    password: "Walnut@2026",
    role: "APPROVER_TIER2",
    designation: "R&D Head",
    department: "R&D",
    isActive: true,
  },
  {
    id: "user_amol",
    name: "Mr. Amol Bhardwaj",
    email: "amol.bhardwaj@walnutmedical.com",
    password: "Walnut@2026",
    role: "ADMIN",
    designation: "Chief Technology Officer (CTO) & System Administrator",
    department: "Executive & Administration",
    isActive: true,
  },
  {
    id: "user_business",
    name: "Mr. Rajesh Kumar",
    email: "rajesh.kumar@walnutmedical.com",
    password: "Walnut@2026",
    role: "BUSINESS",
    designation: "Business, Procurement & Store Lead",
    department: "Purchase, Procurement & Store Operations",
    isActive: true,
  },
];

async function ensureDefaultUsers() {
  try {
    const count = await prisma.user.count({ where: { isActive: true } });
    if (count === 0) {
      for (const u of DEFAULT_USERS) {
        await prisma.user.upsert({
          where: { id: u.id },
          create: u,
          update: { ...u, isActive: true },
        });
      }
    }
  } catch (err) {
    console.error("Auto-seed error:", err);
  }
}

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

    // Auto-seed if database is fresh/empty
    await ensureDefaultUsers();

    const rawClean = String(email).trim().toLowerCase();
    const noSpaces = rawClean.replace(/\s+/g, "");

    const isAbhishek =
      rawClean === "abhishek" ||
      rawClean === "mr. abhishek" ||
      rawClean === "abhishek saini" ||
      noSpaces.includes("abhishek");

    const isRajesh =
      rawClean === "rajesh" ||
      rawClean === "mr. rajesh" ||
      rawClean === "mr. rajesh kumar" ||
      rawClean === "business" ||
      rawClean === "store" ||
      noSpaces.includes("rajesh");

    const isJaydeep =
      rawClean === "jaydeep" ||
      rawClean === "mr. jaydeep" ||
      rawClean === "mr. jaydeep panchal" ||
      noSpaces.includes("jaydeep");

    // Amol Bhardwaj has both CTO & Administrator access merged
    const isAmolOrAdmin =
      rawClean === "amol" ||
      rawClean === "mr. amol" ||
      rawClean === "mr. amol bhardwaj" ||
      rawClean === "admin" ||
      rawClean === "walnut admin" ||
      rawClean === "admin@walnutmedical.com" ||
      noSpaces.includes("amol") ||
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
          ...(isAbhishek ? [{ id: "user_abhishek" }, { email: "abhishek.saini@walnutmedical.com" }] : []),
          ...(isJaydeep ? [{ id: "user_jaydeep" }, { email: "jaydeep.panchal@walnutmedical.com" }] : []),
          ...(isAmolOrAdmin ? [{ id: "user_amol" }, { email: "amol.bhardwaj@walnutmedical.com" }] : []),
          ...(isRajesh ? [{ id: "user_business" }, { email: "rajesh.kumar@walnutmedical.com" }] : []),
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found with this email or ID. Active accounts: abhishek.saini@walnutmedical.com, rajesh.kumar@walnutmedical.com, jaydeep.panchal@walnutmedical.com, amol.bhardwaj@walnutmedical.com" },
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
