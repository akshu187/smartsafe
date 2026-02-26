# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 1. Internal Server Error (500)

**Problem**: Dashboard shows "Internal Server Error" or 500 error

**Cause**: Build cache corrupted (`.next` folder)

**Solution**:
```bash
# Stop the dev server (Ctrl+C)

# Delete .next folder
Remove-Item -Recurse -Force .next

# Start dev server again
npm run dev
```

**Why it happens**: 
- Hot reload sometimes corrupts the build cache
- Adding new files/dependencies can cause cache issues
- Windows file system sometimes locks files

---

### 2. Port Already in Use

**Problem**: `Port 3000 is in use`

**Solution 1** (Automatic):
- Next.js will automatically use port 3001
- Just use http://localhost:3001 instead

**Solution 2** (Kill the process):
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Start dev server
npm run dev
```

---

### 3. GPS Not Working

**Problem**: Location not showing on dashboard

**Solutions**:
1. **Enable Location Permission**:
   - Browser will ask for permission
   - Click "Allow" when prompted
   - If blocked, click lock icon in address bar → Site settings → Location → Allow

2. **Check GPS Status**:
   - Look for "GPS locked" message on dashboard
   - Should show coordinates like: `29.8650°, 77.8950°`

3. **Test GPS**:
   ```javascript
   // Open browser console (F12)
   navigator.geolocation.getCurrentPosition(
     (pos) => console.log(pos.coords),
     (err) => console.error(err)
   )
   ```

---

### 4. Voice Assistant Not Speaking

**Problem**: No voice alerts

**Checklist**:
- ✅ Trip started? (Click "Start Trip" button)
- ✅ Live Mode ON? (Check switch on dashboard)
- ✅ Speed > 5 km/h? (For harsh driving alerts)
- ✅ Browser sound ON?
- ✅ System volume > 0?

**Test Voice**:
```javascript
// Open browser console (F12)
const utterance = new SpeechSynthesisUtterance("Testing voice")
utterance.lang = "en-IN"
window.speechSynthesis.speak(utterance)
```

If this doesn't speak, your browser doesn't support speech synthesis.

---

### 5. Map Not Loading

**Problem**: Map shows blank or loading spinner

**Solutions**:
1. **Check Internet**: Map needs internet for tiles
2. **Wait**: Sometimes takes 5-10 seconds to load
3. **Refresh**: Press F5 to reload page
4. **Clear Cache**: Ctrl+Shift+Delete → Clear cache

**Check Console**:
```
F12 → Console tab → Look for Leaflet errors
```

---

### 6. Weather Not Showing

**Problem**: Weather shows "Live weather unavailable"

**Causes**:
- No GPS location yet
- Weather API rate limit
- Internet connection issue

**Solutions**:
1. Wait for GPS to lock (green message)
2. Refresh page after GPS locks
3. Check internet connection

**Fallback**: App will show demo weather data if API fails

---

### 7. Crash Detection Not Working

**Problem**: Shaking phone doesn't trigger crash alert

**Checklist**:
- ✅ Auto SOS Dispatch ON? (Check switch)
- ✅ Live Mode ON?
- ✅ Speed > 20 km/h? (Crash detection needs speed)
- ✅ Using mobile device? (Desktop won't have accelerometer)

**Test on Desktop**:
- Crash detection won't work on desktop (no accelerometer)
- Use mobile device for testing

---

### 8. POI Alerts Not Showing

**Problem**: No school/hospital alerts

**Checklist**:
- ✅ Trip started?
- ✅ Live Mode ON?
- ✅ GPS enabled?
- ✅ Actually near a school/hospital? (Within 200m)
- ✅ Internet connection? (Needs Overpass API)

**Check Console**:
```
F12 → Console → Look for "Failed to fetch POIs" error
```

**Note**: POI detection checks every 10 seconds, so wait a bit.

---

### 9. Database Errors

**Problem**: Prisma errors or database connection issues

**Solution**:
```bash
# Reset database
npx prisma migrate reset

# Run migrations
npx prisma migrate dev

# Seed data
npx prisma db seed
```

---

### 10. Build Errors

**Problem**: `npm run build` fails

**Common Fixes**:

**TypeScript Errors**:
```bash
# Check for errors
npm run build

# Fix errors shown in output
# Then build again
```

**Dependency Issues**:
```bash
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

**Cache Issues**:
```bash
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run build
```

---

## Quick Fixes Checklist

When something doesn't work, try these in order:

1. **Refresh Page** (F5)
2. **Hard Refresh** (Ctrl+Shift+R)
3. **Clear Cache** (Ctrl+Shift+Delete)
4. **Restart Dev Server** (Ctrl+C, then `npm run dev`)
5. **Delete .next folder** (`Remove-Item -Recurse -Force .next`)
6. **Check Console** (F12 → Console tab)
7. **Check Network** (F12 → Network tab)
8. **Reinstall Dependencies** (`npm install`)

---

## Error Messages & Solutions

### "Cannot find module"
```bash
# Solution
npm install
```

### "Port already in use"
```bash
# Solution
Use the new port shown (e.g., 3001)
# Or kill the process using the port
```

### "Prisma Client not found"
```bash
# Solution
npx prisma generate
```

### "GPS not available"
```
# Solution
Enable location permission in browser
```

### "Speech synthesis not supported"
```
# Solution
Use Chrome, Edge, or Firefox (latest version)
```

---

## Performance Issues

### Slow Loading
1. Check internet speed
2. Clear browser cache
3. Close other tabs
4. Restart browser

### High Battery Usage
1. GPS is the main battery consumer
2. Use charger during long trips
3. Reduce screen brightness
4. Close other apps

### Laggy Map
1. Zoom out (less detail to render)
2. Close other tabs
3. Refresh page
4. Use Chrome (best performance)

---

## Browser Compatibility

### Recommended Browsers
- ✅ Chrome 90+ (Best)
- ✅ Edge 90+ (Best)
- ✅ Firefox 88+ (Good)
- ✅ Safari 14+ (Good)

### Not Supported
- ❌ Internet Explorer
- ❌ Old browsers (< 2020)

---

## Mobile Issues

### GPS Accuracy
- Indoor: ±50m
- Outdoor: ±10m
- Moving: ±5m (best)

### Battery Saving
- Use power saving mode
- Reduce screen brightness
- Close background apps
- Use charger

### Data Usage
- ~5-10 MB per hour
- Map tiles: ~3 MB
- Weather API: ~1 MB
- POI detection: ~2 MB

---

## Development Issues

### Hot Reload Not Working
```bash
# Restart dev server
Ctrl+C
npm run dev
```

### TypeScript Errors
```bash
# Check diagnostics
npm run build

# Fix errors shown
# Then restart dev server
```

### Prisma Issues
```bash
# Regenerate client
npx prisma generate

# Reset database
npx prisma migrate reset
```

---

## Getting Help

### Check Logs
1. **Browser Console**: F12 → Console
2. **Network Tab**: F12 → Network
3. **Dev Server**: Terminal output

### Report Issue
Include:
- Error message (screenshot)
- Browser & version
- Steps to reproduce
- Console logs

---

## Emergency Fixes

### Nothing Works?
```bash
# Nuclear option - fresh start
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
npm install
npx prisma generate
npm run dev
```

### Still Not Working?
1. Check Node.js version: `node --version` (should be 18+)
2. Check npm version: `npm --version` (should be 9+)
3. Restart computer
4. Try different browser

---

## Current Known Issues

### 1. POI Detection Delay
- **Issue**: Takes 10 seconds to detect new POIs
- **Workaround**: This is by design to save API calls
- **Fix**: Reduce interval in code if needed

### 2. GPS Noise
- **Issue**: Speed jumps when stationary
- **Fix**: Already implemented (10m minimum movement)

### 3. Voice Repeat
- **Issue**: Same alert repeats too often
- **Fix**: Already implemented (2-minute cooldown)

---

## Success Indicators

### Everything Working When:
- ✅ GPS shows coordinates
- ✅ Map loads with your location
- ✅ Weather shows current conditions
- ✅ Trip controls work
- ✅ Voice alerts speak
- ✅ No console errors

---

**Last Updated**: After POI Detection implementation
**Status**: All features working ✅
