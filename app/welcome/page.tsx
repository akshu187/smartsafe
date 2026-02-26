"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WelcomePage() {
  const [showConsent, setShowConsent] = React.useState(false)
  const [consentError, setConsentError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("smartsafe_permissions")
    if (stored !== "granted") {
      setShowConsent(true)
    }
  }, [])

  async function handleAllow() {
    setConsentError(null)
    if (typeof window === "undefined") return

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          window.localStorage.setItem("smartsafe_permissions", "granted")
          setShowConsent(false)
        },
        (err) => {
          setConsentError(err.message || "Location access was denied.")
        },
        { enableHighAccuracy: true, timeout: 15000 },
      )
    } else {
      setConsentError("Geolocation is not supported in this browser.")
    }
  }

  function handleSkip() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("smartsafe_permissions", "skipped")
    }
    setShowConsent(false)
  }

  return (
    <div className="bg-slate-50 py-16 dark:bg-slate-950">
      <div className="container mx-auto max-w-5xl px-4 space-y-12">
        {showConsent && (
          <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-4 text-xs text-slate-100 shadow-sm dark:border-emerald-400/40 dark:bg-emerald-500/10">
            <p className="font-semibold text-emerald-300">Enable safety features</p>
            <p className="mt-1 text-slate-300">
              SmartSafe can use your approximate GPS location and play audio warnings to analyse
              accident-prone zones more accurately. Your location is only used inside this browser
              session.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                className="h-7 rounded-full bg-emerald-500 px-4 text-[11px] text-white hover:bg-emerald-600"
                type="button"
                onClick={handleAllow}
              >
                Allow location & audio alerts
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full border-slate-600 px-4 text-[11px]"
                type="button"
                onClick={handleSkip}
              >
                Continue without extra access
              </Button>
              {consentError && (
                <span className="text-[11px] text-yellow-300">{consentError}</span>
              )}
            </div>
          </div>
        )}

        <section className="grid gap-10 md:grid-cols-[1.3fr,1fr] md:items-center">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
              Welcome to SmartSafe
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              A modern road-safety website for smarter, safer journeys.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
              This website demonstrates how an intelligent accident safety system could look and feel
              in a real deployment, with a public marketing site and a live monitoring dashboard.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/login">
                <Button className="rounded-full bg-emerald-500 px-6 text-sm text-white hover:bg-emerald-600">
                  Continue to login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="rounded-full px-6 text-sm">
                  Skip to dashboard
                </Button>
              </Link>
            </div>
          </div>

          <Card className="border-emerald-100 bg-white/70 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm">Project overview</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Helpful when explaining the website in a demo or viva.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                <span className="font-medium">Public website:</span> Landing page, About, and Contact
                sections explain the SmartSafe concept and goals.
              </p>
              <p>
                <span className="font-medium">Dashboard:</span> Live weather, GPS support, simulated
                speed and accident-prone red zones for a driver&apos;s journey.
              </p>
              <p>
                <span className="font-medium">Auth pages:</span> Login screen to illustrate how
                drivers would securely access their dashboard from the website.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

