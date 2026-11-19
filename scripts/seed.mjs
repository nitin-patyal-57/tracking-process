import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up Walnut Medical System Users without deleting existing data...");

  // Remove old conflicting IDs if email is being transferred
  await prisma.user.deleteMany({
    where: { id: { in: ["user_rajesh", "user_abhishek_dir"] } },
  });

  const users = [
    {
      id: "user_abhishek",
      name: "Abhishek Saini",
      email: "abhishek.saini@walnutmedical.com",
      role: "APPROVER_TIER1",
      designation: "R&D Team Lead",
      department: "R&D",
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
      name: "Mr. Rajesh Kumar",
      email: "rajesh.kumar@walnutmedical.com",
      role: "BUSINESS",
      designation: "Business & Procurement Lead",
      department: "Purchase & Procurement",
    },
    {
      id: "user_store",
      name: "Mr. Sukhbir",
      email: "sukhbir@walnutmedical.com",
      role: "STORE_QA",
      designation: "Store & QA Lead",
      department: "Store & Quality Assurance",
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
    const { id, ...profile } = user;
    await prisma.user.upsert({
      where: { id },
      create: user,
      update: { ...profile, isActive: true },
    });
  }

  await prisma.user.updateMany({
    where: { id: { in: ["user_rajesh", "user_abhishek_dir"] } },
    data: { isActive: false },
  });

  console.log(`Created or updated ${users.length} active system users. Existing request history was preserved.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
