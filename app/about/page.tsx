import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="bg-slate-50 py-16 dark:bg-slate-950">
      <div className="container mx-auto px-4 max-w-5xl space-y-12">
        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
            About SmartSafe
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Making every journey safer with intelligent assistance.
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
            SmartSafe is a smart accident safety system designed to support drivers before, during,
            and after a critical event. By combining real-time weather data, historical accident
            patterns, and on-road behaviour, we help you anticipate risks and respond faster when
            every second counts.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Proactive, not reactive</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              SmartSafe analyses conditions ahead on your route and surfaces gentle nudges long
              before a situation becomes dangerous.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Built for real roads</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              From highways to city streets, we factor in local patterns like accident-prone zones,
              low-visibility segments, and emergency facility density.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Designed for trust</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              Clear, minimal UI and voice-first interactions reduce distraction so you can stay
              focused on the road, not the screen.
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <Card className="border-emerald-100 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-emerald-900 dark:text-emerald-300">
                How the system works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-emerald-900/80 dark:text-emerald-200/90">
              <p>
                SmartSafe continuously ingests GPS traces, weather feeds, and historical incident
                data to estimate your current risk context.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Early-stage alerts when approaching known danger zones.</li>
                <li>Progressive warnings based on speed, braking, and visibility.</li>
                <li>
                  Automatic SOS dispatch with live location to public safety and nearby hospitals.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">What we are building towards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                Our long-term vision is a safety layer that any vehicle, two-wheeler, or fleet can
                plug into—regardless of hardware.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>City-scale risk heatmaps for planners and patrol teams.</li>
                <li>Anonymous safety insights for road design and maintenance.</li>
                <li>Open APIs to integrate with OEMs and mobility platforms.</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

