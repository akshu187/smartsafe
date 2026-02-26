import { PrismaClient } from "../generated/prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// For production (Vercel), DATABASE_URL will be PostgreSQL from Neon
// Prisma v7 handles connection automatically via prisma.config.ts
export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

