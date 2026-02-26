"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShieldAlert, Menu, X, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [open, setOpen] = React.useState(false)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [userName, setUserName] = React.useState<string | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const loggedIn = window.localStorage.getItem("smartsafe_logged_in") === "1"
        const name = window.localStorage.getItem("smartsafe_user_name")
        setIsLoggedIn(loggedIn)
        setUserName(name)
      }
    }

    // Check on mount
    checkAuth()

    // Listen for storage changes (from other tabs or same page)
    window.addEventListener("storage", checkAuth)
    
    // Listen for custom event (from same page login)
    window.addEventListener("smartsafe-auth-change", checkAuth)

    return () => {
      window.removeEventListener("storage", checkAuth)
      window.removeEventListener("smartsafe-auth-change", checkAuth)
    }
  }, [])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("smartsafe_logged_in")
      window.localStorage.removeItem("smartsafe_user_email")
      window.localStorage.removeItem("smartsafe_user_name")
      window.localStorage.removeItem("smartsafe_user_id")
      setIsLoggedIn(false)
      setUserName(null)
      router.push("/")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-xl bg-emerald-500 p-2 text-white">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">SmartSafe</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          <Link href="/welcome" className="transition-colors hover:text-emerald-500">
            Welcome
          </Link>
          <Link href="/#features" className="transition-colors hover:text-emerald-500">
            Features
          </Link>
          <Link href="/#how-it-works" className="transition-colors hover:text-emerald-500">
            How it Works
          </Link>
          <Link href="/about" className="transition-colors hover:text-emerald-500">
            About
          </Link>
          <Link href="/contact" className="transition-colors hover:text-emerald-500">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 md:flex">
                <User className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">{userName || "User"}</span>
              </div>
              <Link href="/dashboard" className="hidden md:inline-flex">
                <Button className="rounded-full bg-emerald-500 px-6 text-sm text-white hover:bg-emerald-600">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                className="hidden rounded-full px-5 text-sm md:inline-flex"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:inline-flex">
                <Button variant="outline" className="rounded-full px-5 text-sm">
                  Log in
                </Button>
              </Link>
              <Link href="/dashboard" className="hidden md:inline-flex">
                <Button className="rounded-full bg-emerald-500 px-6 text-sm text-white hover:bg-emerald-600">
                  Open Dashboard
                </Button>
              </Link>
            </>
          )}

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white/95 pb-4 pt-2 shadow-sm dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
          <div className="container mx-auto flex flex-col gap-2 px-4 text-sm font-medium text-slate-700 dark:text-slate-200">
            <Link href="/welcome" onClick={() => setOpen(false)} className="py-1.5">
              Welcome
            </Link>
            <Link href="/#features" onClick={() => setOpen(false)} className="py-1.5">
              Features
            </Link>
            <Link href="/#how-it-works" onClick={() => setOpen(false)} className="py-1.5">
              How it Works
            </Link>
            <Link href="/about" onClick={() => setOpen(false)} className="py-1.5">
              About
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="py-1.5">
              Contact
            </Link>
            <div className="mt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                    <User className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">{userName || "User"}</span>
                  </div>
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button className="w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-600">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full rounded-full text-sm"
                    onClick={() => {
                      handleLogout()
                      setOpen(false)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full text-sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button className="w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-600">
                      Dashboard
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
