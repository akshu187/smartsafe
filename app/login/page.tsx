"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get("email") || "").trim()
    const name = (formData.get("name") as string | null) ?? null

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Unable to log in")
        }
        return res.json()
      })
      .then((user) => {
        try {
          window.localStorage.setItem("smartsafe_logged_in", "1")
          window.localStorage.setItem("smartsafe_user_email", user.email)
          if (user.name) {
            window.localStorage.setItem("smartsafe_user_name", user.name)
          }
        } catch {
          // ignore storage errors
        }
        router.push("/dashboard")
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Login failed"
        setMessage(msg)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <div className="bg-slate-50 py-16 dark:bg-slate-950">
      <div className="container mx-auto flex max-w-md flex-col gap-8 px-4">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Log in to SmartSafe
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Access the SmartSafe dashboard from this website. This page focuses on UI only and does not
            connect to a real authentication backend.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Driver account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input id="name" name="name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="driver@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>

              {message && (
                <p className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
                  {message}
                </p>
              )}
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              <p>
                New to SmartSafe?{" "}
                <Link href="/welcome" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
                  Read the website overview
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

