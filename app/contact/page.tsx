"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    window.setTimeout(() => setSubmitted(false), 3500)
  }

  return (
    <div className="bg-slate-50 py-16 dark:bg-slate-950">
      <div className="container mx-auto px-4 max-w-3xl space-y-10">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
            Contact
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Talk to the SmartSafe team.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
            Share feedback, partnership ideas, or implementation questions. This form is a visual
            mock and does not send real emails yet.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Your full name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
              placeholder="Tell us a bit about how you’d like to use SmartSafe…"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" className="w-full sm:w-auto">
              Send message
            </Button>
            {submitted && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Message received. In a real deployment this would be sent to the SmartSafe team.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

