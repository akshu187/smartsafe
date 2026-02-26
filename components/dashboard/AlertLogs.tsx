"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { useActivityLog } from "@/hooks/use-activity-log"

export function AlertLogs() {
  const { logs } = useActivityLog()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-slate-500">
          <Clock className="w-4 h-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No activity yet. Start your trip to see events.
          </p>
        ) : (
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-4">
                <div 
                  className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-950 ${
                    log.type === 'danger' ? 'bg-red-500' :
                    log.type === 'warning' ? 'bg-yellow-500' : 
                    log.type === 'success' ? 'bg-green-500' :
                    'bg-slate-300 dark:bg-slate-600'
                  }`} 
                />
                <p className="text-xs text-slate-500 mb-0.5">{log.time}</p>
                <p className="text-sm font-medium">{log.event}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
