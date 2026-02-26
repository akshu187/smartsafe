"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, Info } from "lucide-react"

const TIPS = [
  { icon: Shield, title: "Keep Safe Distance", desc: "Maintain at least 3 seconds gap from the vehicle ahead." },
  { icon: AlertTriangle, title: "Reduce Speed", desc: "Wet roads increase braking distance by 2x." },
  { icon: Info, title: "Use Headlights", desc: "Turn on low beams in fog or heavy rain." },
]

export function SafetyTips() {
  return (
    <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-emerald-800 dark:text-emerald-500 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Safety Guidelines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex gap-3">
              <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                <tip.icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">{tip.title}</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-600/80">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
