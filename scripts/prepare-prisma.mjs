import fs from "fs";
import path from "path";

function detectDatabaseUrl() {
  const envCandidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ];

  for (const cand of envCandidates) {
    if (cand && typeof cand === "string" && cand.trim().length > 0) {
      return cand.trim().replace(/^["']|["']$/g, "").trim();
    }
  }

  const envPath = path.resolve(".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*(?:DATABASE_URL|POSTGRES_PRISMA_URL|POSTGRES_URL)\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        return match[1].trim().replace(/^["']|["']$/g, "").trim();
      }
    }
  }

  return "";
}

const rawDbUrl = detectDatabaseUrl();
const isVercel = process.env.VERCEL === "1" || process.env.NOW_BUILDER === "1";
const isExplicitPostgres =
  rawDbUrl.startsWith("postgres://") ||
  rawDbUrl.startsWith("postgresql://") ||
  rawDbUrl.startsWith("prisma://") ||
  rawDbUrl.startsWith("prisma+postgres://");

// On Vercel, or if rawDbUrl is postgres, or if non-empty and not file:
const usePostgres = isVercel || isExplicitPostgres || (rawDbUrl.length > 0 && !rawDbUrl.startsWith("file:"));

const schemaPath = path.resolve("prisma/schema.prisma");
if (fs.existsSync(schemaPath)) {
  let content = fs.readFileSync(schemaPath, "utf8");

  if (usePostgres) {
    if (content.includes('provider = "sqlite"')) {
      content = content.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
      fs.writeFileSync(schemaPath, content, "utf8");
      console.log("[prepare-prisma] Configured Prisma provider to 'postgresql' for cloud deployment.");
    }
  } else {
    if (content.includes('provider = "postgresql"')) {
      content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
      fs.writeFileSync(schemaPath, content, "utf8");
      console.log("[prepare-prisma] Configured Prisma provider to 'sqlite' for local development.");
    }
  }
}

// Sync environment variable for Prisma CLI
if (usePostgres) {
  const finalUrl =
    rawDbUrl ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (finalUrl) {
    const cleanFinalUrl = finalUrl.trim().replace(/^["']|["']$/g, "").trim();
    process.env.DATABASE_URL = cleanFinalUrl;

    const envPath = path.resolve(".env");
    let envLines = fs.existsSync(envPath)
      ? fs.readFileSync(envPath, "utf8").split(/\r?\n/)
      : [];
    envLines = envLines.filter((l) => !l.match(/^\s*DATABASE_URL\s*=/));
    envLines.push(`DATABASE_URL="${cleanFinalUrl}"`);
    fs.writeFileSync(envPath, envLines.join("\n"), "utf8");
  }
} else {
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("file:")) {
    process.env.DATABASE_URL = "file:./dev.db";
  }
}
