"use client"

import React from "react"
import { AlertTriangle, Zap, Gauge } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface HarshDrivingStatsProps {
  harshBrakeCount: number
  harshAccelCount: number
  speedingCount: number
  safetyScore?: number
}

export function HarshDrivingStats({
  harshBrakeCount,
  harshAccelCount,
  speedingCount,
  safetyScore = 100,
}: HarshDrivingStatsProps) {
  // Calculate safety score based on events
  const calculatedScore = Math.max(
    0,
    100 - harshBrakeCount * 5 - harshAccelCount * 3 - speedingCount * 10
  )
  const finalScore = safetyScore || calculatedScore

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: "Excellent", variant: "success" as const }
    if (score >= 80) return { text: "Good", variant: "success" as const }
    if (score >= 60) return { text: "Fair", variant: "warning" as const }
    return { text: "Needs Improvement", variant: "danger" as const }
  }

  const badge = getScoreBadge(finalScore)

  return (
    <Card className="border-slate-800 bg-slate-900/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-slate-200">Driving Behavior</CardTitle>
        <Gauge className="h-5 w-5 text-slate-400" />
      </CardHeader>
      <CardContent>
        {/* Safety Score */}
        <div className="mb-4 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className={`text-4xl font-bold ${getScoreColor(finalScore)}`}>
              {finalScore}
            </span>
            <span className="text-2xl text-slate-500">/100</span>
          </div>
          <Badge variant={badge.variant as any} className="text-xs">
            {badge.text}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 border-t border-slate-800 pt-4">
          {/* Harsh Braking */}
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center">
              <div
                className={`rounded-full p-2 ${
                  harshBrakeCount > 5
                    ? "bg-red-500/20"
                    : harshBrakeCount > 2
                    ? "bg-yellow-500/20"
                    : "bg-green-500/20"
                }`}
              >
                <AlertTriangle
                  className={`h-4 w-4 ${
                    harshBrakeCount > 5
                      ? "text-red-400"
                      : harshBrakeCount > 2
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-100">{harshBrakeCount}</p>
            <p className="text-[10px] text-slate-500">Harsh Brakes</p>
          </div>

          {/* Harsh Acceleration */}
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center">
              <div
                className={`rounded-full p-2 ${
                  harshAccelCount > 5
                    ? "bg-red-500/20"
                    : harshAccelCount > 2
                    ? "bg-yellow-500/20"
                    : "bg-green-500/20"
                }`}
              >
                <Zap
                  className={`h-4 w-4 ${
                    harshAccelCount > 5
                      ? "text-red-400"
                      : harshAccelCount > 2
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-100">{harshAccelCount}</p>
            <p className="text-[10px] text-slate-500">Rapid Accels</p>
          </div>

          {/* Speeding */}
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center">
              <div
                className={`rounded-full p-2 ${
                  speedingCount > 3
                    ? "bg-red-500/20"
                    : speedingCount > 1
                    ? "bg-yellow-500/20"
                    : "bg-green-500/20"
                }`}
              >
                <Gauge
                  className={`h-4 w-4 ${
                    speedingCount > 3
                      ? "text-red-400"
                      : speedingCount > 1
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-100">{speedingCount}</p>
            <p className="text-[10px] text-slate-500">Speeding</p>
          </div>
        </div>

        {/* Tip */}
        {finalScore < 80 && (
          <div className="mt-4 rounded-lg bg-yellow-500/10 p-3 text-xs text-yellow-400">
            💡 Tip: Smooth driving improves safety score and saves fuel!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
