import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body.email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const email = body.email.toLowerCase().trim()
  const name = typeof body.name === "string" ? body.name.trim() : null

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      lastLoginAt: new Date(),
      ...(name ? { name } : {}),
    },
    create: {
      email,
      name: name || null,
      passwordHash: "",
      role: "driver",
      lastLoginAt: new Date(),
    },
  })

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
}

