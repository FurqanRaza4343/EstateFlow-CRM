# Design Document

## Overview

This design covers ten interconnected mobile-first improvements to the EstateFlow CRM app:

1. **MobileSlideMenu Fix** — replace `href="#"` links with `<button>` + `onNavigate` callback
2. **BottomNav** — new sticky bottom tab bar for mobile (5 tabs, accent indicator, safe-area support)
3. **Dashboard Dark Theme Consistency** — replace hardcoded Tailwind color classes with CSS variables
4. **Framer Motion Animations** — staggered card entrance animations (Dashboard, LeadsModule, ContactsModule)
5. **TiltCard** — reusable 3D perspective-tilt wrapper for cards (Desktop: 6°, Mobile: 3°, mouse/touch)
6. **Dashboard Hero Upgrade** — animated gradient background + glow orb effect
7. **SkeletonLoader** — shimmer placeholders during first load
8. **Count-Up Stats** — animate Dashboard stat numbers from 0 → target on mount
9. **ToastProvider** — replace `alert()` with slide-in toasts (success/error/info/warning, auto-dismiss 3.5s)
10. **GradientAvatar** — deterministic color avatars from name hash

No new npm dependencies are introduced. All animations respect `prefers-reduced-motion`. All components use CSS variables from `index.css` (`var(--bg-card)`, `var(--text-primary)`, `var(--color-accent)`, etc.).

---

## Architecture

### Component Hierarchy

```
App.tsx
├─ ToastProvider (new) — wraps entire app, renders toast stack
├─ BottomNav (new, mobile only)
├─ MobileSlideMenu (updated) — now uses onNavigate callback
├─ Dashboard.tsx (updated)
│   ├─ Hero card (updated) — animated gradient + glow orb
│   ├─ TiltCard (new) → wraps stat cards
│   ├─ SkeletonLoader (new) — shown when stats loading
│   ├─ GradientAvatar (new) — replaces initials div
│   └─ useCountUp (new hook) — animates stat numbers
├─ LeadsModule.tsx (updated)
│   └─ motion.div staggerChildren for lead list items
├─ ContactsModule.tsx (updated)
│   └─ motion.div staggerChildren for contact list items
├─ PropertiesModule.tsx (updated)
│   └─ TiltCard → wraps property cards
└─ MoreModule.tsx (updated)
    └─ GradientAvatar → team member avatars
```

### Data Flow

- **App.tsx** state: `activeTab: string`, `setActiveTab: (tab: string) => void`
- **ToastProvider** state: `toasts: Toast[]`, exposes `toast.{success,error,info,warning}(message)` via context
- **TiltCard** local state: `tilt: { x: number, y: number }` — computed from mouse/touch position
- **useCountUp** local state: `displayValue: number` — eased from 0 to target over 800ms
- **SkeletonLoader** props: `count: number`, `height: string`, `className?: string`
- **GradientAvatar** props: `name: string`, `seed?: string`, `size?: number`, `active?: boolean`

---

## Components and Interfaces

### 1. BottomNav Component

**File**: `src/components/BottomNav.tsx`

**Props**:
```typescript
interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
```

**Behavior**:
- Renders a `<nav>` element with `fixed bottom-0 left-0 right-0 z-40 md:hidden` positioning
- Displays 5 tabs: `{ id: 'dashboard', icon: Home, label: 'Dashboard' }`, `{ id: 'leads', icon: Users, label: 'Leads' }`, `{ id: 'properties', icon: Award, label: 'Properties' }`, `{ id: 'contacts', icon: MessageSquare, label: 'Contacts' }`, `{ id: 'more', icon: MoreHorizontal, label: 'More' }`
- Each tab renders as a `<button>` with `flex-1 flex flex-col items-center py-1.5` layout
- Active tab: `color: var(--color-accent)`, inactive: `color: var(--text-muted)`
- Active indicator: a `<motion.div>` pill rendered under the active tab with `layoutId="tab-indicator"` for smooth transitions
- Background: `var(--bg-surface)`, top border: `1px solid var(--border-light)`
- Bottom padding: `env(safe-area-inset-bottom)` applied via inline style or Tailwind `safe-bottom` class
- Each tab has `onClick={() => onTabChange(tab.id)}`
- Label: `text-[9px] uppercase font-bold mt-0.5`
- If `prefers-reduced-motion`, the `motion.div` is replaced with a plain `<div>` (no layout animation)

**Typography**: Labels use `text-[9px] uppercase font-bold tracking-tight`

**Accessibility**: Each button has `aria-label={Navigate to ${label}}` and `aria-current={activeTab === id ? 'page' : undefined}`

---

### 2. MobileSlideMenu Update

**File**: `src/components/MobileSlideMenu.tsx` (existing)

**Changes**:
- Replace `navLinks: { label: string; href: string }[]` prop with `onNavigate: (tab: string) => void` prop
- Replace `<a href={link.href} ...>` elements with `<button onClick={() => { onNavigate(tab); setOpen(false); }} ...>`
- Internal tab mapping: `['dashboard', 'leads', 'properties', 'contacts', 'more']` maps to labels `['Dashboard', 'Leads', 'Properties', 'Contacts', 'More']`
- When a button is clicked, call `onNavigate(tab)` then `setOpen(false)`
- No other behavior changes

**App.tsx integration**:
```typescript
<MobileSlideMenu 
  onNavigate={(tab) => {
    setActiveTab(tab);
    setLeadsFilterRedirect('');
    if (tab === 'more') setMoreSubview('attendance');
  }}
/>
```

---

### 3. Dashboard Dark Theme Fixes

**File**: `src/components/Dashboard.tsx` (existing)

**Color Replacements**:

| Old Class | New CSS Variable Reference |
|-----------|----------------------------|
| `text-slate-800`, `text-slate-900` | `color: var(--text-primary)` |
| `text-slate-600`, `text-slate-650` | `color: var(--text-secondary)` |
| `text-slate-550`, `text-slate-500` | `color: var(--text-muted)` |
| `bg-emerald-50`, `bg-amber-50`, `bg-blue-50`, `bg-indigo-50` | `background: var(--border-light)` |
| `text-emerald-600` | `color: var(--color-emerald)` |
| `text-amber-600` | `color: var(--color-gold)` |
| `text-blue-600`, `text-indigo-600` | `color: var(--color-accent)` |
| `bg-amber-50/40`, `border-amber-100/30` | `background: rgba(var(--color-gold-rgb), 0.1)` and `border-color: rgba(var(--color-gold-rgb), 0.2)` (or use Tailwind `opacity-*` with CSS var) |
| `bg-slate-100/80`, `hover:bg-slate-100/80`, `text-slate-400` in footer | `var(--bg-surface)`, `var(--text-muted)` |

**Implementation approach**:
- Replace Tailwind classes with inline `style={{ color: 'var(--text-primary)' }}` or with custom Tailwind utility classes defined in `index.css` (e.g., `.text-primary { color: var(--text-primary); }` — these already exist).
- Prefer using the existing utility classes (`.text-primary`, `.text-secondary`, `.bg-card`, etc.) when possible.
- For icon badge backgrounds (e.g., `bg-emerald-50 text-emerald-600` on the metric card icon pills), replace with `style={{ background: 'var(--border-light)', color: 'var(--color-emerald)' }}`.
- For hover states like `hover:bg-slate-100/80`, replace with `hover:bg-surface-alt` (already defined in `index.css`).
- For semi-transparent overlays (e.g., hot leads list), use inline styles with `rgba()` or define new utility classes.

**No structural changes** — only color replacements.

---

### 4. Framer Motion Staggered Card Animations

**Files**: `Dashboard.tsx`, `LeadsModule.tsx`, `ContactsModule.tsx`

**Dashboard.tsx**:
- Wrap the metric cards grid (`#dashboard-metrics`) with:
```typescript
<motion.div
  className="grid grid-cols-2 md:grid-cols-4 gap-3"
  initial="hidden"
  animate="visible"
  variants={{
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05
      }
    }
  }}
>
  {/* each card */}
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 16 },
      visible: { opacity: 1, y: 0 }
    }}
    transition={{ duration: 0.25 }}
    ...
  >
    {/* metric card content */}
  </motion.div>
</motion.div>
```

**LeadsModule.tsx**:
- Wrap the lead list container with `<motion.div>` and apply `staggerChildren: 0.04`
- Each lead list item: `<motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>`
- Cap stagger to first 8 items (conditional logic: `slice(0, 8)` for staggered items, rest render without motion)

**ContactsModule.tsx**:
- Same pattern as LeadsModule: stagger first 8 contact items

**Reduced motion**:
- Wrap stagger animations in a check for `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skip motion variants if true

---

### 5. TiltCard Component

**File**: `src/components/TiltCard.tsx`

**Props**:
```typescript
interface TiltCardProps {
  children: React.ReactNode;
  maxTilt?: number; // default: 6 on desktop, 3 on mobile
  className?: string;
}
```

**Behavior**:
- Renders a `<div>` with `perspective: 1000px` CSS
- Inner wrapper with `transition: transform 0.3s ease-out`
- On `onMouseMove` (desktop): calculate `rotateX` and `rotateY` based on mouse position relative to card center, clamp to `±maxTilt` degrees
- On `onTouchMove` (mobile): same calculation with half the tilt (`maxTilt / 2`)
- On `onMouseLeave` or `onTouchEnd`: reset to `transform: rotateX(0) rotateY(0)`
- If `prefers-reduced-motion` is set, return `<div className={className}>{children}</div>` (no tilt logic)

**Formula**:
```typescript
const rotateY = ((mouseX - centerX) / (width / 2)) * maxTilt;
const rotateX = -((mouseY - centerY) / (height / 2)) * maxTilt;
```

**CSS**:
```css
.tilt-card-inner {
  transform-style: preserve-3d;
  transition: transform 300ms ease-out;
}
```

**Usage**:
```tsx
<TiltCard className="...">
  <div className="bg-card p-4 rounded-2xl ...">
    {/* metric card content */}
  </div>
</TiltCard>
```

**Integration**:
- Dashboard: wrap each of the 4 metric cards with `<TiltCard maxTilt={6}>`
- PropertiesModule: wrap each property card
- LeadsModule: wrap each lead card in the list (optional — can be applied selectively to detail panels)

---

### 6. Dashboard Hero Section Animated Gradient

**File**: `Dashboard.tsx` (existing `#dashboard-hero` element)

**Changes**:
- Add a `<style>` block in the component or define in `index.css`:
```css
@keyframes gradientCycle {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-animated-gradient {
  background: linear-gradient(135deg, var(--color-accent), var(--color-gold), var(--bg-primary));
  background-size: 200% 200%;
  animation: gradientCycle 8s ease infinite;
}

@media (prefers-reduced-motion: reduce) {
  .hero-animated-gradient {
    animation: none;
    background-size: 100% 100%;
  }
}
```

- Apply `hero-animated-gradient` class to the greeting card outer `<div>`
- Add a decorative glow orb:
```tsx
<div className="absolute inset-0 pointer-events-none overflow-hidden">
  <div 
    className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-20"
    style={{ 
      background: 'radial-gradient(circle, var(--color-accent), transparent)',
      transform: 'translate(-50%, -50%)'
    }}
  />
</div>
```

- Update greeting text size: `className="text-2xl sm:text-xl ..."`

---

### 7. SkeletonLoader Component

**File**: `src/components/SkeletonLoader.tsx`

**Props**:
```typescript
interface SkeletonLoaderProps {
  count?: number; // default: 1
  height?: string; // default: '40px'
  className?: string;
}
```

**Implementation**:
```tsx
export default function SkeletonLoader({ count = 1, height = '40px', className = '' }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={`skeleton ${className}`} 
          style={{ height }}
        />
      ))}
    </>
  );
}
```

**CSS** (already defined in `index.css`):
```css
.skeleton {
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-surface) 50%, var(--bg-card) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: var(--bg-card);
  }
}
```

**Integration**:

**Dashboard.tsx**:
```tsx
{activeOrgId === '' || isFirstLoad ? (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <SkeletonLoader count={4} height="120px" />
  </div>
) : (
  // metric cards
)}
```

**LeadsModule.tsx**:
```tsx
{leads.length === 0 && isFirstLoad ? (
  <SkeletonLoader count={5} height="80px" className="mb-2" />
) : (
  // lead list
)}
```

**First load detection**:
- Add local state: `const [isFirstLoad, setIsFirstLoad] = useState(true);`
- In `useEffect` after first data fetch: `setIsFirstLoad(false);`

---

### 8. useCountUp Hook

**File**: `src/hooks/useCountUp.ts`

**Interface**:
```typescript
export function useCountUp(target: number, duration = 800): number {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimatedRef = useRef(false);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (hasAnimatedRef.current || prefersReducedMotion) {
      setDisplayValue(target);
      return;
    }

    const startTime = performance.now();
    const startValue = 0;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      setDisplayValue(Math.round(startValue + (target - startValue) * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        hasAnimatedRef.current = true;
      }
    };
    
    requestAnimationFrame(animate);
  }, []); // run once on mount

  return displayValue;
}
```

**Usage in Dashboard.tsx**:
```tsx
const newLeadsDisplay = useCountUp(stats.newLeadsToday);
const followupsDisplay = useCountUp(stats.followupsDueToday);
const hotLeadsDisplay = useCountUp(stats.hotLeadsCount);
const presentAgentsDisplay = useCountUp(stats.presentAgentsCount);

// then render:
<span className="text-2xl font-black">{newLeadsDisplay}</span>
```

---

### 9. ToastProvider & useToast Hook

**File**: `src/components/ToastProvider.tsx`

**Context Interface**:
```typescript
interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
```

**ToastProvider Implementation**:
```tsx
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => {
      const updated = [...prev, { id, type, message, timestamp: Date.now() }];
      return updated.slice(-3); // max 3 toasts
    });

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const value: ToastContextValue = {
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    info: (msg) => addToast('info', msg),
    warning: (msg) => addToast('warning', msg),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 sm:right-4 sm:top-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onDismiss={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
```

**Toast Component** (internal to ToastProvider.tsx):
```tsx
function Toast({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const iconMap = {
    success: <CheckCircle2 size={16} />,
    error: <XCircle size={16} />,
    info: <Info size={16} />,
    warning: <AlertTriangle size={16} />
  };

  const colorMap = {
    success: 'var(--color-emerald)',
    error: '#ef4444',
    info: 'var(--color-accent)',
    warning: 'var(--color-gold)'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl max-w-sm"
      style={{ 
        background: 'var(--bg-card)', 
        borderLeft: `4px solid ${colorMap[toast.type]}`
      }}
    >
      <div style={{ color: colorMap[toast.type] }}>{iconMap[toast.type]}</div>
      <p className="text-xs flex-1" style={{ color: 'var(--text-primary)' }}>{toast.message}</p>
      <button onClick={onDismiss} className="text-xs" style={{ color: 'var(--text-muted)' }}>
        <X size={14} />
      </button>
    </motion.div>
  );
}
```

**App.tsx Wrapping**:
```tsx
import { ToastProvider } from './components/ToastProvider';

// inside App return:
<ToastProvider>
  <div className="min-h-[100dvh] ...">
    {/* existing app content */}
  </div>
</ToastProvider>
```

**Replace alert() calls**:

| Old | New |
|-----|-----|
| `alert('Success: Lead added!')` | `toast.success('Lead added successfully.')` |
| `alert('Error: ...')` | `toast.error(err.message)` |
| `alert('Candidate full name and phone number is required.')` | `toast.warning('Full name and phone number are required.')` |
| `alert('Your browser does not support Speech Recognition...')` | `toast.warning('Your browser does not support Speech Recognition. Please type your query.')` |
| `alert('Billing Threshold Restriction: ...')` | `toast.error(`Billing Threshold Restriction: ${error.message}`)` |

**Add `const toast = useToast();` at the top of App function body.**

---

### 10. GradientAvatar Component

**File**: `src/components/GradientAvatar.tsx`

**Props**:
```typescript
interface GradientAvatarProps {
  name: string;
  seed?: string; // if provided, use seed for hash; otherwise use name
  size?: number; // default: 40 (px)
  active?: boolean; // default: false
  className?: string;
}
```

**Implementation**:
```tsx
export default function GradientAvatar({ 
  name, 
  seed, 
  size = 40, 
  active = false, 
  className = '' 
}: GradientAvatarProps) {
  const hashSeed = seed || name;
  
  // Simple hash function (no external library)
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return Math.abs(h);
  };

  const hue1 = hash(hashSeed) % 360;
  const hue2 = (hue1 + 120) % 360;
  
  const gradient = `linear-gradient(135deg, hsl(${hue1}, 70%, 55%), hsl(${hue2}, 70%, 45%))`;
  
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 font-bold text-white ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: gradient,
        fontSize: `${size * 0.4}px`,
        boxShadow: active ? `0 0 0 2px var(--color-accent)` : 'none'
      }}
    >
      {initials}
    </div>
  );
}
```

**Integration**:

**Dashboard.tsx** (greeting section):
```tsx
<div className="flex items-center gap-3">
  <GradientAvatar name={currentUser.name} size={48} />
  <div>
    <h1 className="text-2xl sm:text-xl font-black">{greeting()}, {currentUser.name}!</h1>
    <p className="text-xs">Role: <strong>{currentUser.role}</strong></p>
  </div>
</div>
```

**LeadsModule.tsx** (agent list):
```tsx
<GradientAvatar name={agent.name} size={32} />
```

**MoreModule.tsx** (team member list):
```tsx
<GradientAvatar name={member.name} size={36} active={member.id === currentUser.id} />
```

---

## Data Models

No new database models. All changes are UI-only.

**State Extensions**:

**App.tsx**:
- Add `const toast = useToast();` after wrapping with `<ToastProvider>`

**Dashboard.tsx**:
- Add `const [isFirstLoad, setIsFirstLoad] = useState(true);` for skeleton loader logic
- After first `refreshCRMData()` completes, call `setIsFirstLoad(false);`

**LeadsModule.tsx**:
- Add `const [isFirstLoad, setIsFirstLoad] = useState(true);` for skeleton loader logic

**ContactsModule.tsx**:
- Add `const [isFirstLoad, setIsFirstLoad] = useState(true);` for skeleton loader logic

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Five behaviors in this feature have testable properties: the TiltCard clamping math, the count-up animation convergence and reduced-motion bypass, the toast stack cap invariant, and the gradient avatar determinism function.

### Property 1: TiltCard Tilt Clamping

*For any* pointer position (x, y) within a card of any width and height, with any `maxTilt` value ≥ 0, the computed `rotateX` and `rotateY` values returned by the tilt calculation function SHALL satisfy `|rotateX| ≤ maxTilt` and `|rotateY| ≤ maxTilt`.

**Validates: Requirements 5.2, 5.3**

### Property 2: useCountUp Convergence

*For any* non-negative integer `target` and `duration` > 0, after the animation has run to completion, the value returned by `useCountUp(target, duration)` SHALL equal `target` exactly. Additionally, at any intermediate time `t` where `0 ≤ t ≤ duration`, the returned value SHALL satisfy `0 ≤ displayValue ≤ target`.

**Validates: Requirements 8.2**

### Property 3: useCountUp Reduced-Motion Bypass

*For any* non-negative integer `target`, when `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`, the value returned by `useCountUp(target)` SHALL equal `target` immediately (on the initial render frame, with no animation).

**Validates: Requirements 8.4**

### Property 4: Toast Stack Cap Invariant

*For any* sequence of `k` toast additions (`k ≥ 1`), the length of the active toasts array SHALL always satisfy `toasts.length ≤ 3`. When a 4th toast is added while 3 are already present, the oldest toast (lowest timestamp) SHALL be removed before the new toast is appended.

**Validates: Requirements 9.10**

### Property 5: GradientAvatar Determinism

*For any* non-empty string `name`, calling the avatar gradient derivation function twice with the same `name` value SHALL produce identical `hue1` and `hue2` values, and therefore the same CSS gradient string on every invocation.

**Validates: Requirements 10.2**

---

## Error Handling

- **TiltCard**: Wrap mouse/touch event handlers in try-catch to prevent crashes if DOM measurements fail. If error, silently fall back to no tilt.
- **useCountUp**: If `target` is `NaN` or `null`, return `0` immediately. If `duration` is invalid (≤ 0), return `target` immediately.
- **ToastProvider**: If `addToast` is called with an empty message, render "No message" as fallback. If toast limit is exceeded, remove oldest toast before adding new one (already implemented).
- **GradientAvatar**: If `name` is empty or undefined, use "?" as initials and a default grey gradient.
- **SkeletonLoader**: If `count` is 0 or negative, render nothing.
- **BottomNav**: If `activeTab` is not in the tab list, default to highlighting 'dashboard'.

---

## Testing Strategy

This feature does not involve complex business logic or parsers, so property-based testing is not applicable. The focus is on UI interaction, animation, and visual consistency.

**Testing Approach**:

1. **Manual Testing**:
   - Test on mobile (375px width) and desktop (1440px width)
   - Test with `prefers-reduced-motion` enabled in browser DevTools
   - Test on a notched iPhone (safe-area-inset-bottom verification)
   - Verify all CSS variables resolve correctly in dark theme, light theme, and high-contrast theme
   - Verify toast auto-dismiss after 3.5s
   - Verify count-up animation runs only once on mount
   - Verify BottomNav tab indicator animates smoothly between tabs
   - Verify TiltCard responds to mouse move on desktop and touch move on mobile
   - Verify MobileSlideMenu navigation actually switches tabs
   - Verify Dashboard hero gradient animates over 8 seconds
   - Verify skeleton loaders appear during first load

2. **Snapshot Testing** (optional, not required for MVP):
   - Capture snapshots of Dashboard with skeleton loaders
   - Capture snapshots of BottomNav in each active tab state
   - Capture snapshots of Toasts in all 4 types

3. **Integration Testing** (optional, not required for MVP):
   - Simulate clicking BottomNav tabs and verify `setActiveTab` is called
   - Simulate clicking a toast dismiss button and verify it disappears
   - Simulate hovering over a TiltCard and verify CSS transform is applied

**No unit tests or property tests are required for this feature.** The focus is on visual polish and user experience, which are best validated through manual testing and user feedback.
