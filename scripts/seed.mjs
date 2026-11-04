import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up Walnut Medical System Users...");

  // 1. Clear existing data
  await prisma.closureFeedback.deleteMany({});
  await prisma.inwardHandover.deleteMany({});
  await prisma.trackingUpdate.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.alternatePart.deleteMany({});
  await prisma.approvalLog.deleteMany({});
  await prisma.requestItem.deleteMany({});
  await prisma.procurementRequest.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const users = [
    {
      id: "user_abhishek",
      name: "Abhishek Saini",
      email: "abhishek.saini@walnutmedical.com",
      role: "REQUESTER",
      designation: "R&D Team Lead",
      department: "R&D",
    },
    {
      id: "user_abhishek_dir",
      name: "Mr. Abhishek",
      email: "abhishek@walnutmedical.com",
      role: "APPROVER_TIER1",
      designation: "Director / Operations",
      department: "Management",
    },
    {
      id: "user_jaydeep",
      name: "Mr. Jaydeep Panchal",
      email: "jaydeep.panchal@walnutmedical.com",
      role: "APPROVER_TIER2",
      designation: "R&D Head",
      department: "R&D",
    },
    {
      id: "user_amol",
      name: "Mr. Amol Bhardwaj",
      email: "amol.bhardwaj@walnutmedical.com",
      role: "APPROVER_TIER3",
      designation: "Chief Technology Officer (CTO)",
      department: "Executive",
    },
    {
      id: "user_business",
      name: "Pooja Sharma",
      email: "business.procurement@walnutmedical.com",
      role: "BUSINESS",
      designation: "Procurement & Sourcing Lead",
      department: "Business / Procurement",
    },
    {
      id: "user_store",
      name: "Harpreet Singh",
      email: "store.qa@walnutmedical.com",
      role: "STORE_QA",
      designation: "Inward Quality Inspector",
      department: "Quality Assurance / Store",
    },
    {
      id: "user_admin",
      name: "Walnut Admin",
      email: "admin@walnutmedical.com",
      role: "ADMIN",
      designation: "System Administrator",
      department: "Administration",
    },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  console.log(`Created ${users.length} system users. Clean database ready for real requests.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
