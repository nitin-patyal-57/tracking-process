import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Removing demo requests from database...");

  await prisma.closureFeedback.deleteMany({});
  await prisma.inwardHandover.deleteMany({});
  await prisma.trackingUpdate.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.alternatePart.deleteMany({});
  await prisma.approvalLog.deleteMany({});
  await prisma.requestItem.deleteMany({});
  await prisma.procurementRequest.deleteMany({});

  console.log("All demo requests removed. Database is clean for real procurement requests!");

  const usersCount = await prisma.user.count();
  console.log(`Active system users ready: ${usersCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
