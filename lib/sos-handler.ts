interface SOSData {
  userId: string
  userName: string
  position: { lat: number; lng: number }
  timestamp: number
  reason: "crash" | "manual"
  gForce?: number
  speed?: number
}

export async function triggerSOS(data: SOSData) {
  try {
    // 1. Log SOS event
    await fetch("/api/sos/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    // 2. Call emergency services (112)
    if (typeof window !== "undefined") {
      // Create a link that opens phone dialer
      const emergencyCall = document.createElement("a")
      emergencyCall.href = "tel:112"
      emergencyCall.click()
    }

    // 3. Show notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🚨 EMERGENCY SOS ACTIVATED", {
        body: "Emergency services are being contacted. Help is on the way.",
        icon: "/icon-192.png",
        requireInteraction: true,
      })
    }

    // 4. Vibrate phone
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200])
    }

    return { success: true }
  } catch (error) {
    console.error("SOS trigger failed:", error)
    return { success: false, error }
  }
}

export function getGoogleMapsLink(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`
}

export function formatSOSMessage(data: SOSData): string {
  const locationLink = getGoogleMapsLink(data.position.lat, data.position.lng)
  const time = new Date(data.timestamp).toLocaleString()

  return `
🚨 EMERGENCY ALERT 🚨

${data.userName} needs help!

Location: ${locationLink}

Time: ${time}
Reason: ${data.reason === "crash" ? "Crash Detected" : "Manual SOS"}
${data.gForce ? `Impact Force: ${data.gForce.toFixed(1)}g` : ""}
${data.speed ? `Speed: ${data.speed} km/h` : ""}

This is an automated message from SmartSafe.
  `.trim()
}

export async function sendSOSToContacts(data: SOSData) {
  try {
    // Get emergency contacts from localStorage or API
    const contacts = JSON.parse(localStorage.getItem("emergency_contacts") || "[]")

    if (contacts.length === 0) {
      console.warn("No emergency contacts configured")
      return
    }

    const message = formatSOSMessage(data)

    // In a real app, this would use SMS API
    // For now, we'll use Web Share API if available
    if (navigator.share) {
      await navigator.share({
        title: "🚨 EMERGENCY ALERT",
        text: message,
      })
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(message)
      alert("Emergency message copied to clipboard. Please share with your contacts!")
    }
  } catch (error) {
    console.error("Failed to send SOS to contacts:", error)
  }
}
