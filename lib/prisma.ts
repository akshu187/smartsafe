import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// For production (Vercel with PostgreSQL)
let connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required")
}

// Add pgbouncer parameter for Vercel connection pooling if not present
if (!connectionString.includes('pgbouncer=true')) {
  connectionString += connectionString.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true'
}

const pool = new Pool({ 
  connectionString,
  max: 1, // Limit connections for serverless
})
const adapter = new PrismaPg(pool)

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

