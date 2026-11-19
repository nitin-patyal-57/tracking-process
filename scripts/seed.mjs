import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up Walnut Medical System Users (4 Core Leaders) without deleting existing data...");

  // Safely ensure no other record has conflicting unique emails
  try {
    await prisma.user.updateMany({
      where: {
        email: "rajesh.kumar@walnutmedical.com",
        id: { not: "user_business" },
      },
      data: {
        email: "old_rajesh_archive@walnutmedical.com",
        isActive: false,
      },
    });

    await prisma.user.updateMany({
      where: {
        email: "admin@walnutmedical.com",
        id: { not: "user_amol" },
      },
      data: {
        email: "old_admin_archive@walnutmedical.com",
        isActive: false,
      },
    });
  } catch (e) {
    // Non-fatal if table empty or no match
  }

  // Walnut Medical 4 Core Team Members (Admin merged with CTO Mr. Amol Bhardwaj)
  const users = [
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

  for (const user of users) {
    const { id, ...profile } = user;
    await prisma.user.upsert({
      where: { id },
      create: user,
      update: { ...profile, isActive: true },
    });
  }

  // Deactivate old, removed or merged user IDs without deleting foreign key references
  await prisma.user.updateMany({
    where: { id: { in: ["user_store", "user_rajesh", "user_abhishek_dir", "user_admin"] } },
    data: { isActive: false },
  });

  console.log(`Created or updated ${users.length} active system users. Walnut Admin successfully merged into Mr. Amol Bhardwaj.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
