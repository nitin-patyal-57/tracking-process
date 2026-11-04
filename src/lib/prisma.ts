import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// On Vercel Serverless, project files are read-only.
// If on Vercel and using SQLite, copy seed dev.db to writable /tmp/dev.db
if (process.env.VERCEL) {
  const tmpDbPath = path.join("/tmp", "dev.db");
  const bundledDbPath = path.join(process.cwd(), "prisma", "dev.db");

  if (!fs.existsSync(tmpDbPath)) {
    try {
      if (fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
      }
    } catch (e) {
      console.warn("Could not copy bundled db to /tmp:", e);
    }
  }
  process.env.DATABASE_URL = `file:${tmpDbPath}`;
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
