"use client"

import React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  MapPin,
  CloudRain,
  BellRing,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover bg-center opacity-10 dark:opacity-20 mix-blend-luminosity"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-950"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium border border-emerald-200 dark:border-emerald-800/50"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Monitoring Active in 120+ Cities
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white"
              >
                Next-Generation <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                  Road Safety System
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
              >
                Advanced predictive alerts, real-time weather analysis, and automated emergency SOS dispatch to keep you safe on every journey.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <Link href="/dashboard">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 h-14 text-lg w-full sm:w-auto shadow-lg shadow-emerald-500/25">
                    Start Driving Safely <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg w-full sm:w-auto border-slate-300 dark:border-slate-700">
                  View Live Map
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Safety Infrastructure</h2>
              <p className="text-slate-600 dark:text-slate-400">Our system integrates multiple data points to provide unparalleled protection on the road.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[
                {
                  icon: AlertTriangle,
                  title: "Advanced Crash Detection",
                  desc: "95-98% accuracy with 8-method detection system including accelerometer, gyroscope, and sound analysis. 100-second countdown for emergency response.",
                  color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                },
                {
                  icon: MapPin,
                  title: "Accident Zone Alerts",
                  desc: "Real-time alerts when approaching high-risk areas. Automatic detection of nearby accident-prone zones with severity levels and safety tips.",
                  color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                },
                {
                  icon: CloudRain,
                  title: "Weather & Risk Analysis",
                  desc: "Live weather monitoring with visibility tracking. Dynamic risk calculation based on conditions, speed, and location.",
                  color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                },
                {
                  icon: BellRing,
                  title: "Harsh Driving Detection",
                  desc: "Real-time monitoring of harsh braking, rapid acceleration, and speeding. Instant feedback to improve driving behavior.",
                  color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                },
                {
                  icon: Phone,
                  title: "Automated SOS Dispatch",
                  desc: "Instant emergency alerts to contacts with GPS location. Manual SOS button for immediate help. Crash-triggered automatic dispatch.",
                  color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                },
                {
                  icon: CheckCircle2,
                  title: "Fatigue Detection",
                  desc: "Monitors driving duration and patterns. Alerts when rest is needed. Prevents drowsy driving accidents.",
                  color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                },
                {
                  icon: MapPin,
                  title: "Live GPS Tracking",
                  desc: "Real-time location tracking with interactive map. Route history and trip analytics. Nearby zones visualization.",
                  color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                },
                {
                  icon: CheckCircle2,
                  title: "Safety Score & Analytics",
                  desc: "Comprehensive driving behavior analysis. Trip metrics including speed, distance, and safety events. Performance insights.",
                  color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works / Split Section */}
        <section id="how-it-works" className="py-24 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">
              <div className="flex-1 space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                  Intelligent routing meets <br/>
                  <span className="text-emerald-500">emergency response.</span>
                </h2>
                <div className="space-y-6">
                  {[
                    "95-98% accurate crash detection with 8-method system",
                    "Real-time accident zone alerts within 50km radius",
                    "Fatigue detection with smart rest recommendations",
                    "Harsh driving monitoring (braking, acceleration, speeding)",
                    "Live weather integration with risk calculation",
                    "Automated SOS dispatch to emergency contacts",
                    "Trip analytics with safety score tracking",
                    "Voice-activated controls for hands-free operation"
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/50 rounded-full p-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-lg text-slate-700 dark:text-slate-300">{item}</p>
                    </motion.div>
                  ))}
                </div>
                <Link href="/dashboard" className="inline-block mt-4">
                  <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white rounded-full px-8 h-12">
                    Explore Dashboard
                  </Button>
                </Link>
              </div>
              <div className="flex-1 w-full relative">
                {/* Abstract UI Representation */}
                <div className="relative rounded-3xl bg-slate-900 p-8 shadow-2xl overflow-hidden border border-slate-800 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-emerald-400 w-6 h-6" />
                        <span className="text-white font-medium">Live Tracking</span>
                      </div>
                      <span className="text-emerald-400 text-sm font-mono">ACTIVE</span>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 text-sm">Risk Level</span>
                        <span className="text-yellow-400 text-sm font-bold">MEDIUM</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full w-2/3"></div>
                      </div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4">
                      <AlertTriangle className="text-red-400 w-6 h-6 shrink-0" />
                      <div>
                        <h4 className="text-red-400 font-medium mb-1">Accident Prone Zone</h4>
                        <p className="text-slate-400 text-sm">Reduce speed to 40km/h. Sharp curve ahead.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-emerald-500 dark:bg-emerald-600 text-white">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-4xl font-bold mb-6">Ready to upgrade your road safety?</h2>
            <p className="text-emerald-100 text-lg mb-10">Join thousands of drivers using the SmartSafe website to protect themselves and their passengers on every journey.</p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 rounded-full px-10 h-14 text-lg shadow-xl">
                Open SmartSafe Website
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
