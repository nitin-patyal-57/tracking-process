import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SECRET = process.env.AUTH_SECRET || "walnut-medical-secret-key-2026";

export function hashPassword(password: string): string {
  return crypto.createHmac("sha256", SECRET).update(password).digest("hex");
}

export function verifyPassword(inputPassword: string, storedPassword: string): boolean {
  if (inputPassword === storedPassword) return true; // plain fallback
  const hashed = hashPassword(inputPassword);
  return hashed === storedPassword;
}

export function createSessionToken(userId: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${userId}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

export function verifySessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId, expiresAtStr, signature] = decoded.split(":");
    if (!userId || !expiresAtStr || !signature) return null;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) return null; // expired

    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(`${userId}:${expiresAtStr}`)
      .digest("hex");

    if (signature !== expectedSignature) return null;

    return userId;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("wm_session")?.value;
  if (!token) return null;

  const userId = verifySessionToken(token);
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        department: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}
