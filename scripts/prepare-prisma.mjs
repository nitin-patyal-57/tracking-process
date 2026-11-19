import fs from "fs";
import path from "path";

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = path.resolve(".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match) return match[1];
    }
  }
  return "";
}

const schemaPath = path.resolve("prisma/schema.prisma");
if (fs.existsSync(schemaPath)) {
  let content = fs.readFileSync(schemaPath, "utf8");
  const dbUrl = getDatabaseUrl();
  const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

  if (isPostgres) {
    if (content.includes('provider = "sqlite"')) {
      content = content.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
      fs.writeFileSync(schemaPath, content, "utf8");
      console.log("[prepare-prisma] Configured Prisma provider to 'postgresql' matching DATABASE_URL.");
    }
  } else {
    if (content.includes('provider = "postgresql"')) {
      content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
      fs.writeFileSync(schemaPath, content, "utf8");
      console.log("[prepare-prisma] Configured Prisma provider to 'sqlite' matching DATABASE_URL.");
    }
  }
}
