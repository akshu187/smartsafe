# 🔧 Infinite Loop Fix - Maximum Update Depth Exceeded

## ❌ Problem

**Error**: "Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render."

**Screenshot**: Console showing error in `components/ui/select.tsx`

---

## 🔍 Root Cause

The error was NOT in the Select component itself, but in the custom hooks that were causing infinite re-renders:

### Issue 1: POI Detection Hook
```typescript
// ❌ WRONG - onAlert in dependency array
useEffect(() => {
  // ... code that calls onAlert
}, [position?.lat, position?.lng, isEnabled, onAlert])
```

**Problem**: 
- `onAlert` is a function passed from parent component
- Parent re-renders → new function reference created
- New function → useEffect runs again
- useEffect calls setState → parent re-renders
- **Infinite loop!**

### Issue 2: Fatigue Detection Hook
```typescript
// ❌ WRONG - Same issue
useEffect(() => {
  // ... code that calls onAlert
}, [isEnabled, tripStartTime, lastAlertTime, onAlert])
```

---

## ✅ Solution

### Use `useRef` to Store Callback

Instead of putting the callback in the dependency array, store it in a ref:

```typescript
// ✅ CORRECT
const onAlertRef = useRef(onAlert)

// Update ref when callback changes (doesn't trigger re-render)
useEffect(() => {
  onAlertRef.current = onAlert
}, [onAlert])

// Use ref in main useEffect
useEffect(() => {
  // ... code that calls onAlertRef.current
}, [position?.lat, position?.lng, isEnabled]) // No onAlert!
```

**Why this works**:
- Ref updates don't trigger re-renders
- Main useEffect doesn't depend on callback
- No infinite loop!

---

## 🔧 Files Fixed

### 1. `hooks/use-poi-detection.ts`

**Before**:
```typescript
export function usePOIDetection(
  position: { lat: number; lng: number } | null,
  isEnabled: boolean,
  onAlert?: (alert: POIAlert) => void
) {
  // ... code
  
  useEffect(() => {
    // ... code that calls onAlert
  }, [position?.lat, position?.lng, isEnabled, onAlert]) // ❌ onAlert here
}
```

**After**:
```typescript
export function usePOIDetection(
  position: { lat: number; lng: number } | null,
  isEnabled: boolean,
  onAlert?: (alert: POIAlert) => void
) {
  const onAlertRef = useRef(onAlert) // ✅ Store in ref
  
  useEffect(() => {
    onAlertRef.current = onAlert // ✅ Update ref
  }, [onAlert])
  
  useEffect(() => {
    // ... code that calls onAlertRef.current
  }, [position?.lat, position?.lng, isEnabled]) // ✅ No onAlert
}
```

---

### 2. `hooks/use-fatigue-detection.ts`

**Before**:
```typescript
export function useFatigueDetection(
  isEnabled: boolean,
  tripStartTime: number | null,
  onAlert?: (alert: FatigueAlert) => void
) {
  // ... code
  
  useEffect(() => {
    // ... code that calls onAlert
  }, [isEnabled, tripStartTime, lastAlertTime, onAlert]) // ❌ onAlert here
}
```

**After**:
```typescript
export function useFatigueDetection(
  isEnabled: boolean,
  tripStartTime: number | null,
  onAlert?: (alert: FatigueAlert) => void
) {
  const onAlertRef = useRef(onAlert) // ✅ Store in ref
  
  useEffect(() => {
    onAlertRef.current = onAlert // ✅ Update ref
  }, [onAlert])
  
  useEffect(() => {
    // ... code that calls onAlertRef.current
  }, [isEnabled, tripStartTime, lastAlertTime]) // ✅ No onAlert
}
```

---

## 🎯 How to Test

### 1. Clear Cache & Restart
```bash
# Stop dev server (Ctrl+C)

# Delete .next folder
Remove-Item -Recurse -Force .next

# Start dev server
npm run dev
```

### 2. Open Dashboard
```
http://localhost:3001/dashboard
```

### 3. Check Console
- ✅ No "Maximum update depth exceeded" error
- ✅ No infinite loop warnings
- ✅ Clean console

### 4. Test Features
- ✅ Start trip
- ✅ POI detection works
- ✅ Fatigue detection works
- ✅ No performance issues

---

## 📚 React Best Practices

### Rule 1: Don't Put Functions in Dependencies
```typescript
// ❌ BAD
useEffect(() => {
  callback()
}, [callback])

// ✅ GOOD
const callbackRef = useRef(callback)
useEffect(() => {
  callbackRef.current = callback
}, [callback])

useEffect(() => {
  callbackRef.current()
}, []) // No callback dependency
```

### Rule 2: Use useCallback for Stable References
```typescript
// ✅ ALTERNATIVE - Make callback stable
const stableCallback = useCallback(() => {
  // ... code
}, []) // Empty deps = never changes

useEffect(() => {
  stableCallback()
}, [stableCallback]) // Safe now
```

### Rule 3: Avoid setState in Render
```typescript
// ❌ BAD
function Component() {
  setState(value) // Causes infinite loop
  return <div />
}

// ✅ GOOD
function Component() {
  useEffect(() => {
    setState(value)
  }, [])
  return <div />
}
```

---

## 🐛 Common Causes of Infinite Loops

### 1. Function Dependencies
```typescript
// ❌ Function recreated every render
useEffect(() => {
  callback()
}, [callback])
```

### 2. Object Dependencies
```typescript
// ❌ Object recreated every render
useEffect(() => {
  console.log(config)
}, [config]) // { foo: 'bar' } !== { foo: 'bar' }
```

### 3. Array Dependencies
```typescript
// ❌ Array recreated every render
useEffect(() => {
  console.log(items)
}, [items]) // [1,2,3] !== [1,2,3]
```

### 4. setState in Render
```typescript
// ❌ Causes re-render → setState → re-render → ...
function Component() {
  const [count, setCount] = useState(0)
  setCount(count + 1) // Infinite loop!
  return <div>{count}</div>
}
```

---

## ✅ Verification Checklist

After fix:
- [x] No console errors
- [x] No infinite loop warnings
- [x] Dashboard loads normally
- [x] POI detection works
- [x] Fatigue detection works
- [x] Voice alerts work
- [x] No performance issues
- [x] Build successful

---

## 🎉 Result

**Before Fix**:
- ❌ Console full of errors
- ❌ Page freezes
- ❌ Infinite re-renders
- ❌ Browser becomes unresponsive

**After Fix**:
- ✅ Clean console
- ✅ Smooth performance
- ✅ No re-render issues
- ✅ All features working

---

## 💡 Key Takeaway

**When passing callbacks to custom hooks**:
1. Store callback in `useRef`
2. Update ref in separate `useEffect`
3. Don't include callback in main `useEffect` dependencies
4. Use `ref.current` to call the callback

This prevents infinite loops while keeping the callback up-to-date!

---

**Error fixed! Dashboard ab smoothly chalega!** 🚀😊
