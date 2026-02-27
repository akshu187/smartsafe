import type { Metadata } from "next"
import React from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"

import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "SmartSafe | Smart Accident Safety System & Road Safety Dashboard",
  description:
    "SmartSafe is a smart accident safety website that provides predictive road-safety alerts, live weather-based risk monitoring, accident-prone red zones, and automated SOS dispatch simulation for safer journeys.",
  keywords: [
    "SmartSafe",
    "road safety website",
    "accident safety system",
    "smart accident detection",
    "high accident zone map",
    "live weather risk",
    "vehicle safety dashboard",
    "emergency SOS dispatch",
  ],
  metadataBase: new URL("https://smartsafe.local"),
  openGraph: {
    title: "SmartSafe – Smart Accident Safety Website & Live Dashboard",
    description:
      "Experience a modern road-safety website with live risk monitoring, accident red zones, and SOS response simulation.",
    url: "https://smartsafe.local",
    siteName: "SmartSafe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartSafe | Smart Accident Safety System",
    description:
      "SmartSafe combines live weather, accident-prone zones, and a driver dashboard for smarter, safer journeys.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50">
        <div className="flex min-h-screen flex-col font-sans selection:bg-emerald-500/30">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <SpeedInsights />
      </body>
    </html>
  )
}


