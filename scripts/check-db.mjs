import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  console.log("Checking database connection...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL || "file:./dev.db");
  
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    const requestCount = await prisma.procurementRequest.count();
    console.log("=========================================");
    console.log("SUCCESS: Database is 100% CONNECTED!");
    console.log(`Active Users in System: ${userCount}`);
    console.log(`Total Procurement Requests: ${requestCount}`);
    console.log("=========================================");
  } catch (err) {
    console.error("FAILED: Database is NOT connected.");
    console.error("Reason:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
