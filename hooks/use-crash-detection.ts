import { useEffect, useRef, useState } from "react"

interface CrashData {
  gForce: number
  timestamp: number
  position: { lat: number; lng: number } | null
  speed: number
  crashType?: "frontal" | "side" | "rear" | "rollover" | "unknown"
  rotationRate?: number
  speedDrop?: number
  soundDetected?: boolean
  confidence?: number
}

export function useCrashDetection(
  isEnabled: boolean,
  currentSpeed: number,
  position: { lat: number; lng: number } | null,
  onCrashDetected: (data: CrashData) => void
) {
  const [crashDetected, setCrashDetected] = useState(false)
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 })
  const lastRotation = useRef({ alpha: 0, beta: 0, gamma: 0 })
  const lastTime = useRef(Date.now())
  const previousSpeed = useRef(0)
  const baselineOrientation = useRef({ alpha: 0, beta: 0, gamma: 0 })
  const impactSamples = useRef<number[]>([])
  const audioContext = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const loudSoundDetected = useRef(false)
  const speedHistory = useRef<number[]>([])
  const lastCrashTime = useRef(0)
  const accelerationPattern = useRef<{ x: number; y: number; z: number; timestamp: number }[]>([])
  const normalDrivingBaseline = useRef({ avgG: 1, maxG: 2 })
  const falsePositiveHistory = useRef<{ timestamp: number; reason: string }[]>([])
  const userCancelCount = useRef(0)

  useEffect(() => {
    previousSpeed.current = currentSpeed
    
    // Track speed history for sudden drop detection
    speedHistory.current.push(currentSpeed)
    if (speedHistory.current.length > 10) {
      speedHistory.current.shift() // Keep last 10 readings (2 seconds)
    }
  }, [currentSpeed])

  // Sound detection setup
  useEffect(() => {
    if (!isEnabled || typeof window === "undefined") return

    // Establish normal driving baseline over first 2 minutes
    const baselineTimer = setTimeout(() => {
      if (accelerationPattern.current.length > 0) {
        const avgG = accelerationPattern.current.reduce((sum, p) => {
          const g = Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2) / 9.8
          return sum + g
        }, 0) / accelerationPattern.current.length

        const maxG = Math.max(...accelerationPattern.current.map(p => 
          Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2) / 9.8
        ))

        normalDrivingBaseline.current = { avgG, maxG }
        console.log("Baseline established:", normalDrivingBaseline.current)
      }
    }, 120000) // 2 minutes

    const setupAudioDetection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioContext.current.createMediaStreamSource(stream)
        analyser.current = audioContext.current.createAnalyser()
        analyser.current.fftSize = 2048
        source.connect(analyser.current)

        // Monitor for loud sounds (crash/airbag)
        const checkSound = () => {
          if (!analyser.current) return

          const dataArray = new Uint8Array(analyser.current.frequencyBinCount)
          analyser.current.getByteFrequencyData(dataArray)

          // Calculate average volume
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length

          // Detect loud sudden sound (>150 threshold = crash/airbag)
          if (average > 150) {
            console.log("LOUD SOUND DETECTED:", average)
            loudSoundDetected.current = true
            setTimeout(() => {
              loudSoundDetected.current = false
            }, 2000) // Reset after 2 seconds
          }
        }

        setInterval(checkSound, 100) // Check every 100ms
      } catch (error) {
        console.log("Audio detection not available:", error)
      }
    }

    setupAudioDetection()

    return () => {
      clearTimeout(baselineTimer)
      if (audioContext.current) {
        audioContext.current.close()
      }
    }
  }, [isEnabled])

  useEffect(() => {
    if (!isEnabled || typeof window === "undefined") return

    let rotationRate = 0
    let hasGyroscope = false

    // Handle gyroscope data for rollover detection
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha === null || event.beta === null || event.gamma === null) return
      
      hasGyroscope = true
      const now = Date.now()
      const timeDiff = (now - lastTime.current) / 1000

      if (timeDiff < 0.1) return

      // Calculate rotation rate (degrees per second)
      const alphaChange = Math.abs(event.alpha - lastRotation.current.alpha)
      const betaChange = Math.abs(event.beta - lastRotation.current.beta)
      const gammaChange = Math.abs(event.gamma - lastRotation.current.gamma)

      // Handle 360-degree wraparound for alpha
      const normalizedAlphaChange = alphaChange > 180 ? 360 - alphaChange : alphaChange

      rotationRate = Math.sqrt(
        normalizedAlphaChange ** 2 + betaChange ** 2 + gammaChange ** 2
      ) / timeDiff

      // Detect rollover: extreme rotation (>90 degrees/sec) while moving
      if (rotationRate > 90 && previousSpeed.current > 15) {
        console.log("ROLLOVER DETECTED!", {
          rotationRate: rotationRate.toFixed(2),
          speed: previousSpeed.current,
        })

        setCrashDetected(true)
        onCrashDetected({
          gForce: 0,
          timestamp: now,
          position,
          speed: previousSpeed.current,
          crashType: "rollover",
          rotationRate,
        })
      }

      lastRotation.current = { alpha: event.alpha, beta: event.beta, gamma: event.gamma }
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity
      const rotation = event.rotationRate
      
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return

      const now = Date.now()
      const timeDiff = (now - lastTime.current) / 1000 // seconds

      if (timeDiff < 0.1) return // Ignore too frequent updates

      // Calculate jerk (rate of change of acceleration)
      const jerkX = Math.abs(acc.x - lastAcceleration.current.x) / timeDiff
      const jerkY = Math.abs(acc.y - lastAcceleration.current.y) / timeDiff
      const jerkZ = Math.abs(acc.z - lastAcceleration.current.z) / timeDiff

      const totalJerk = Math.sqrt(jerkX ** 2 + jerkY ** 2 + jerkZ ** 2)

      // Total acceleration magnitude in G's
      const totalG = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2) / 9.8

      // Get gyroscope rotation rate if available
      let gyroRotationRate = 0
      if (rotation && rotation.alpha !== null && rotation.beta !== null && rotation.gamma !== null) {
        gyroRotationRate = Math.sqrt(
          rotation.alpha ** 2 + rotation.beta ** 2 + rotation.gamma ** 2
        )
      }

      // Calculate speed drop (sudden deceleration)
      const speedDrop = speedHistory.current.length >= 2
        ? speedHistory.current[0] - speedHistory.current[speedHistory.current.length - 1]
        : 0

      // Multi-sample verification: Store last 5 impact readings
      impactSamples.current.push(totalG)
      if (impactSamples.current.length > 5) {
        impactSamples.current.shift()
      }

      // Store acceleration pattern for baseline learning
      accelerationPattern.current.push({ x: acc.x, y: acc.y, z: acc.z, timestamp: now })
      if (accelerationPattern.current.length > 1200) { // Keep last 2 minutes
        accelerationPattern.current.shift()
      }

      // Check if multiple samples show high G-force (reduces false positives)
      const highGSamples = impactSamples.current.filter(g => g > 2.5).length
      const consistentImpact = highGSamples >= 3 // At least 3 out of 5 samples

      // Advanced false positive checks
      
      // 1. Baseline comparison: Is this G-force unusual for this user?
      const isUnusualForUser = totalG > (normalDrivingBaseline.current.maxG * 1.5)
      
      // 2. Pattern analysis: Does acceleration pattern match crash signature?
      const recentPattern = accelerationPattern.current.slice(-10) // Last 1 second
      const patternVariance = recentPattern.length > 1 ? 
        Math.sqrt(recentPattern.reduce((sum, p, i) => {
          if (i === 0) return 0
          const prev = recentPattern[i - 1]
          const diff = Math.sqrt(
            (p.x - prev.x) ** 2 + (p.y - prev.y) ** 2 + (p.z - prev.z) ** 2
          )
          return sum + diff ** 2
        }, 0) / recentPattern.length) : 0
      
      const hasErraticPattern = patternVariance > 50 // High variance = crash-like
      
      // 3. Phone orientation check: Is phone mounted or handheld?
      const isLikelyMounted = Math.abs(acc.z) > 8 && Math.abs(acc.z) < 12 // Z-axis ~9.8 (gravity)
      const phoneMountedBonus = isLikelyMounted ? 10 : 0
      
      // 4. Time-of-day adjustment: More cautious at night
      const hour = new Date().getHours()
      const isNightTime = hour >= 22 || hour <= 6
      const nightTimeAdjustment = isNightTime ? -5 : 0 // Slightly lower threshold at night
      
      // 5. Recent false positive learning
      const recentFalsePositives = falsePositiveHistory.current.filter(
        fp => now - fp.timestamp < 3600000 // Last hour
      ).length
      const falsePositivePenalty = recentFalsePositives * 5 // -5 points per recent FP
      
      // 6. GPS accuracy check: Is GPS reliable?
      const gpsAccuracyBonus = position && (position as any).accuracy && (position as any).accuracy < 20 ? 5 : 0

      // Determine crash type based on acceleration direction
      let crashType: "frontal" | "side" | "rear" | "rollover" | "unknown" = "unknown"
      const dominantAxis = Math.max(Math.abs(acc.x), Math.abs(acc.y), Math.abs(acc.z))
      
      if (Math.abs(acc.y) === dominantAxis) {
        crashType = acc.y > 0 ? "frontal" : "rear"
      } else if (Math.abs(acc.x) === dominantAxis) {
        crashType = "side"
      } else if (gyroRotationRate > 5 || rotationRate > 60) {
        crashType = "rollover"
      }

      // Calculate confidence score (0-100%)
      let confidence = 0
      let confidenceFactors = 0

      // Factor 1: G-force strength (max 25 points)
      if (totalG > 4) confidence += 25
      else if (totalG > 3) confidence += 18
      else if (totalG > 2.5) confidence += 10
      confidenceFactors++

      // Factor 2: Jerk magnitude (max 20 points)
      if (totalJerk > 40) confidence += 20
      else if (totalJerk > 30) confidence += 12
      else if (totalJerk > 20) confidence += 8
      confidenceFactors++

      // Factor 3: Speed check (max 15 points)
      if (previousSpeed.current > 30) confidence += 15
      else if (previousSpeed.current > 20) confidence += 10
      else if (previousSpeed.current > 15) confidence += 5
      confidenceFactors++

      // Factor 4: Sound detection (max 12 points)
      if (loudSoundDetected.current) confidence += 12
      confidenceFactors++

      // Factor 5: Speed drop (max 10 points)
      if (speedDrop > 20) confidence += 10
      else if (speedDrop > 10) confidence += 5
      confidenceFactors++

      // Factor 6: Multi-sample consistency (max 8 points)
      if (consistentImpact) confidence += 8
      confidenceFactors++

      // Factor 7: Unusual for user baseline (max 5 points) ✨ NEW
      if (isUnusualForUser) confidence += 5
      confidenceFactors++

      // Factor 8: Erratic pattern (max 5 points) ✨ NEW
      if (hasErraticPattern) confidence += 5
      confidenceFactors++

      // Apply bonuses and penalties
      confidence += phoneMountedBonus // +10 if phone mounted
      confidence += nightTimeAdjustment // -5 at night (more cautious)
      confidence -= falsePositivePenalty // -5 per recent false positive
      confidence += gpsAccuracyBonus // +5 if GPS accurate

      // Cap at 100
      confidence = Math.min(100, Math.max(0, confidence))

      // Enhanced crash detection criteria with confidence scoring
      const isHighImpact = totalG > 4 && totalJerk > 40 && previousSpeed.current > 20
      const isMediumImpact = totalG > 3 && totalJerk > 30 && previousSpeed.current > 15
      const isRollover = (gyroRotationRate > 5 || rotationRate > 60) && previousSpeed.current > 15
      const isConfidentCrash = confidence >= 65 && consistentImpact && previousSpeed.current > 15 // Raised from 60 to 65

      // Prevent duplicate detections (cooldown period)
      const timeSinceLastCrash = now - lastCrashTime.current
      const cooldownPeriod = 10000 // 10 seconds

      if (timeSinceLastCrash < cooldownPeriod) {
        // Skip detection during cooldown
        lastAcceleration.current = { x: acc.x, y: acc.y, z: acc.z }
        lastTime.current = now
        return
      }

      if (isHighImpact || isMediumImpact || isRollover || isConfidentCrash) {
        console.log("CRASH DETECTED!", {
          totalG: totalG.toFixed(2),
          totalJerk: totalJerk.toFixed(2),
          speed: previousSpeed.current,
          speedDrop: speedDrop.toFixed(1),
          crashType,
          rotationRate: (gyroRotationRate || rotationRate).toFixed(2),
          soundDetected: loudSoundDetected.current,
          confidence: confidence.toFixed(0) + "%",
          consistentImpact,
          isUnusualForUser,
          hasErraticPattern,
          phoneMounted: isLikelyMounted,
          gpsAccurate: position && (position as any).accuracy && (position as any).accuracy < 20,
        })

        lastCrashTime.current = now
        setCrashDetected(true)
        onCrashDetected({
          gForce: totalG,
          timestamp: now,
          position,
          speed: previousSpeed.current,
          crashType,
          rotationRate: gyroRotationRate || rotationRate,
          speedDrop,
          soundDetected: loudSoundDetected.current,
          confidence,
        })
      }

      lastAcceleration.current = { x: acc.x, y: acc.y, z: acc.z }
      lastTime.current = now
    }

    // Function to record false positive (called when user cancels)
    const recordFalsePositive = (reason: string) => {
      falsePositiveHistory.current.push({ timestamp: Date.now(), reason })
      userCancelCount.current++
      
      // Adjust thresholds if too many false positives
      if (userCancelCount.current >= 3) {
        console.log("Adjusting detection sensitivity due to false positives")
        // Could dynamically adjust thresholds here
      }
    }

    // Expose recordFalsePositive for external use
    if (typeof window !== "undefined") {
      (window as any).recordCrashFalsePositive = recordFalsePositive
    }

    // Request permission for motion sensors (iOS 13+)
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof (DeviceMotionEvent as any).requestPermission === "function"
    ) {
      ;(DeviceMotionEvent as any)
        .requestPermission()
        .then((response: string) => {
          if (response === "granted") {
            window.addEventListener("devicemotion", handleMotion)
            window.addEventListener("deviceorientation", handleOrientation)
          }
        })
        .catch((error: Error) => {
          console.error("Motion permission denied:", error)
        })
    } else {
      // Android or older iOS
      window.addEventListener("devicemotion", handleMotion)
      window.addEventListener("deviceorientation", handleOrientation)
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion)
      window.removeEventListener("deviceorientation", handleOrientation)
    }
  }, [isEnabled, position, onCrashDetected])

  return { crashDetected, setCrashDetected }
}
