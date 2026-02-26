"use client"

import React from "react"
import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-white">
            <ShieldAlert className="w-6 h-6 text-emerald-500" />
            <span className="font-bold text-xl tracking-tight">SmartSafe</span>
          </Link>
          <div className="flex gap-8 text-sm">
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} SmartSafe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
