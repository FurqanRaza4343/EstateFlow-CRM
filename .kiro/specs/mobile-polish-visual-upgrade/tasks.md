# Implementation Plan: Mobile Polish & Visual Upgrade

## Overview

Incrementally improve the EstateFlow CRM app with mobile-first UX fixes and visual enhancements. The order prioritizes foundational correctness first (broken nav, dark theme) before layering on visual enhancements (animations, tilt, toasts) and finishing with the wiring task (BottomNav). Each task produces a working, demoable change.

---

## Tasks

- [x] 1. Fix MobileSlideMenu navigation (R1, R2)
  - Update `MobileSlideMenu` props: remove `navLinks: { label: string; href: string }[]`, add `onNavigate: (tab: string) => void`
  - Replace `<a href={link.href}>` elements with `<button>` elements
  - On button click, call `onNavigate(tabId)` then `setOpen(false)`
  - Map the 5 nav items to tab ids: `dashboard`, `leads`, `properties`, `contacts`, `more`
  - Update `App.tsx` to pass `onNavigate={(tab) => { setActiveTab(tab); setLeadsFilterRedirect(''); if (tab === 'more') setMoreSubview('attendance'); }}` to `MobileSlideMenu`
  - Remove the `navLinks` array passed from App.tsx
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.1 Write unit tests for MobileSlideMenu navigation callback
    - Mock `onNavigate` spy, click each of the 5 tab buttons, verify correct tab id passed and menu closes
    - _Requirements: 1.2_

- [x] 2. Dashboard dark theme consistency fix (R3)
  - In `Dashboard.tsx`, replace all hardcoded light Tailwind color classes on metric cards with CSS variable inline styles
  - Metric card labels: replace `text-slate-600`, `text-slate-650` → `style={{ color: 'var(--text-secondary)' }}`
  - Metric card numbers: replace `text-slate-900` → `style={{ color: 'var(--text-primary)' }}`
  - Metric card sub-labels: replace `text-slate-550` → `style={{ color: 'var(--text-muted)' }}`
  - Icon badge pills: replace `bg-emerald-50 text-emerald-600` → `style={{ background: 'var(--border-light)', color: 'var(--color-emerald)' }}`; same pattern for amber, blue, indigo badges
  - Section headings: replace `text-slate-800` → `style={{ color: 'var(--text-primary)' }}`
  - Secondary grid hover states: replace `hover:bg-slate-100/80` → use `hover:bg-surface-alt` class (already in index.css)
  - Secondary grid text: replace `text-slate-600`, `text-slate-800` → CSS variable inline styles
  - Hot leads list items: replace `bg-amber-50/40 border-amber-100/30` → inline rgba from `var(--color-gold)` at 0.08 opacity
  - Activity feed text: replace `text-slate-800`, `text-slate-500`, `text-slate-400`, `text-slate-300` → CSS variable references
  - Footer: replace `bg-slate-100/80`, `border-slate-200/40`, `text-slate-500`, `text-slate-400`, `text-indigo-600` → `var(--bg-surface)`, `var(--border-light)`, `var(--text-secondary)`, `var(--text-muted)`, `var(--color-accent)` respectively
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Create SkeletonLoader component and integrate (R7)
  - Create `src/components/SkeletonLoader.tsx` with props: `count?: number` (default 1), `height?: string` (default '40px'), `className?: string`
  - Render `count` div elements each with className `skeleton` (already defined in `index.css`) and the given `height` inline style
  - In `Dashboard.tsx`, add local state `const [isFirstLoad, setIsFirstLoad] = useState(true);`
  - After stats data is received (detect by `activeOrgId !== ''` transitioning or first non-zero stats), call `setIsFirstLoad(false)` in a `useEffect`
  - Replace the metric cards grid with `{isFirstLoad ? <SkeletonGrid /> : <MetricCardsGrid />}` — render 4 skeleton placeholders at `height="120px"` in a 2x2 grid while loading
  - In `LeadsModule.tsx`, add `isFirstLoad` state; show `<SkeletonLoader count={5} height="80px" className="mb-2" />` in place of lead list while `leads.length === 0 && isFirstLoad`
  - After first leads data arrives, set `isFirstLoad(false)`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 3.1 Write unit tests for SkeletonLoader rendering
    - Verify `count` prop renders correct number of skeleton divs
    - Verify `height` prop is applied as inline style
    - _Requirements: 7.2_

- [x] 4. Checkpoint — Verify foundational fixes
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify: MobileSlideMenu links switch tabs; Dashboard renders with dark theme; skeletons appear on first load in both Dashboard and LeadsModule

- [-] 5. Create ToastProvider and replace alert() calls (R9)
  - Create `src/components/ToastProvider.tsx` with:
    - `Toast` interface: `{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string; timestamp: number }`
    - `ToastContext` with `success`, `error`, `info`, `warning` methods
    - `ToastProvider` component managing `toasts: Toast[]` state, `addToast` function, and the fixed overlay container
    - `useToast()` export hook
    - Internal `ToastItem` component using Framer Motion `motion.div` with `initial={{ opacity: 0, x: 100 }}`, `animate={{ opacity: 1, x: 0 }}`, `exit={{ opacity: 0, x: 100 }}`
    - Auto-dismiss with `setTimeout` at 3500ms
    - Stack cap: `slice(-3)` to keep max 3 toasts
    - Manual dismiss X button per toast
    - Color coding: success → `var(--color-emerald)`, error → `#ef4444`, info → `var(--color-accent)`, warning → `var(--color-gold)`
    - Left border coloring via inline `borderLeft: 4px solid {color}`
    - Position: `fixed top-4 right-4` on `sm:` and up, `top-4 left-1/2 -translate-x-1/2` on mobile
    - Import `CheckCircle2`, `X`, `Info`, `AlertTriangle`, `XCircle` from `lucide-react`
  - Wrap the root `<div>` in `App.tsx` (inside the `return`) with `<ToastProvider>`
  - Import `useToast` and add `const toast = useToast()` at the top of the `App` function body
  - Replace `alert('Candidate full name and phone number is required.')` → `toast.warning('Full name and phone number are required.')`
  - Replace `alert('Success: Lead added!')` → `toast.success('Lead added successfully.')`
  - Replace `alert(\`Error: ${err.message || err}\`)` → `toast.error(err.message || 'An error occurred.')`
  - Replace `alert('Your browser does not support Speech Recognition...')` in `startSpeechListening` → `toast.warning('Your browser does not support Speech Recognition. Please type your query.')`
  - Replace the `alert(\`Billing Threshold Restriction: ...\`)` call in the PropertiesModule `onAddProperty` handler in App.tsx → `toast.error(\`Billing limit: ${error.message || 'Check plan limits.'}\`)`
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 9.12, 9.13, 9.14, 9.15_

  - [ ]* 5.1 Write property test for Toast stack cap invariant
    - **Property 4: Toast Stack Cap Invariant**
    - For any sequence of k toast additions (k ≥ 1), verify `toasts.length ≤ 3` always holds
    - Test by directly calling `addToast` repeatedly and checking the state
    - **Validates: Requirements 9.10**

  - [ ]* 5.2 Write unit tests for toast auto-dismiss and manual dismiss
    - Use fake timers (`vi.useFakeTimers()`), advance clock 3500ms, verify toast is removed
    - Test manual dismiss by clicking X button and verifying toast removed
    - _Requirements: 9.8, 9.9_

- [-] 6. Create useCountUp hook and integrate into Dashboard (R8)
  - Create `src/hooks/useCountUp.ts`
  - Accept `target: number` and optional `duration: number` (default 800)
  - Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` on mount; if true, return `target` immediately without animation
  - Use `useRef(false)` (named `hasAnimatedRef`) to track if animation has run
  - Use `requestAnimationFrame` loop with ease-out cubic easing: `eased = 1 - Math.pow(1 - progress, 3)`
  - At each frame: `displayValue = Math.round(target * eased)`; stop when `progress >= 1` and mark `hasAnimatedRef.current = true`
  - If target is NaN or null/undefined, return 0 immediately
  - In `Dashboard.tsx`, call `useCountUp` for each of the 4 stat values: `newLeadsToday`, `followupsDueToday`, `hotLeadsCount`, `presentAgentsCount`
  - Render the animated values in the metric card `<span>` elements
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 6.1 Write property test for useCountUp convergence
    - **Property 2: useCountUp Convergence**
    - For any non-negative integer target, after animation completes, displayValue equals target
    - Test by advancing requestAnimationFrame mock past duration and checking the final value
    - **Validates: Requirements 8.2**

  - [ ]* 6.2 Write property test for useCountUp reduced-motion bypass
    - **Property 3: useCountUp Reduced-Motion Bypass**
    - For any non-negative integer target with matchMedia mocked to return prefers-reduced-motion: reduce, verify displayValue equals target immediately
    - **Validates: Requirements 8.4**

  - [ ]* 6.3 Write unit test for useCountUp idempotence on re-render
    - Render hook with initial target, verify animation ran once
    - Update target prop, verify count does NOT restart from 0
    - _Requirements: 8.3_

- [-] 7. Create GradientAvatar component and integrate (R10)
  - Create `src/components/GradientAvatar.tsx`
  - Implement `hash(str: string): number` using a simple djb2-style algorithm: iterate chars, `h = Math.imul(31, h) + charCodeAt(i) | 0`, return `Math.abs(h)`
  - Derive `hue1 = hash(seed || name) % 360` and `hue2 = (hue1 + 120) % 360`
  - Render a round div with `background: linear-gradient(135deg, hsl(${hue1}, 70%, 55%), hsl(${hue2}, 70%, 45%))` 
  - Show 1–2 character initials in white text (first letter of each word, max 2)
  - `size` prop controls `width`/`height`/`fontSize` in px (default 40)
  - `active` prop adds `boxShadow: 0 0 0 2px var(--color-accent)`
  - Fallback: if `name` is empty, show "?" and use grey gradient (`hsl(0, 0%, 50%)` → `hsl(0, 0%, 35%)`)
  - In `Dashboard.tsx` greeting card (`#dashboard-hero`): replace any plain initials div with `<GradientAvatar name={currentUser.name} size={48} />`; lay out as `flex items-center gap-3` with name/role text beside it
  - In `LeadsModule.tsx`: find agent avatar elements (initials divs near agent names) and replace with `<GradientAvatar name={agent.name} size={32} />`
  - In `MoreModule.tsx`: find team member list items and replace plain initials with `<GradientAvatar name={member.name} size={36} active={member.id === currentUser.id} />`
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 7.1 Write property test for GradientAvatar determinism
    - **Property 5: GradientAvatar Determinism**
    - For any non-empty string name, calling the hash function twice produces the same hue1 and hue2 values
    - Generate random strings and verify `hash(s) === hash(s)` and `hash(s) % 360` is stable
    - **Validates: Requirements 10.2**

- [-] 8. Create TiltCard component and apply to cards (R5)
  - Create `src/components/TiltCard.tsx`
  - Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` on mount; if true, return `<div className={className}>{children}</div>` (no tilt)
  - Outer `<div>` style: `perspective: 1000px; display: inline-block; width: 100%`
  - Inner `<div>` ref state `tilt: { x: number; y: number }` — apply `transform: rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` inline, `transition: transform 300ms ease-out`, `transform-style: preserve-3d`
  - `onMouseMove(e)`: get card bounds via `getBoundingClientRect()`, compute `rotateY = ((mouseX - centerX) / (width / 2)) * maxTilt`, `rotateX = -((mouseY - centerY) / (height / 2)) * maxTilt`, clamp both to `±maxTilt` using `Math.min/Math.max`, call `setTilt({ x, y })`
  - `onMouseLeave`: call `setTilt({ x: 0, y: 0 })`
  - `onTouchMove(e)`: use `e.touches[0]` coordinates, apply same formula but with `maxTilt / 2`
  - `onTouchEnd`: call `setTilt({ x: 0, y: 0 })`
  - Default `maxTilt`: 6 on desktop. On mobile, the touch handlers will use `maxTilt / 2` = 3 automatically
  - Wrap the 4 metric stat cards in `Dashboard.tsx` with `<TiltCard>`
  - Wrap property cards in `PropertiesModule.tsx` with `<TiltCard maxTilt={5}>`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 8.1 Write property test for TiltCard clamping
    - **Property 1: TiltCard Tilt Clamping**
    - Extract the pure tilt calculation function; for any pointer (x, y) and any card dimensions (width, height), verify `|rotateX| ≤ maxTilt` and `|rotateY| ≤ maxTilt`
    - Test with maxTilt values of 3, 6, and 10; positions at corners, edges, and center
    - **Validates: Requirements 5.2, 5.3**

- [~] 9. Dashboard hero animated gradient and glow orb (R6)
  - In `index.css`, add the `@keyframes gradientCycle` animation and `.hero-animated-gradient` utility class:
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
  - Apply `hero-animated-gradient` class to the `#dashboard-hero` outer `<div>` in `Dashboard.tsx`
  - Add an absolutely-positioned glow orb inside the hero card (inside the relative-positioned parent, before the content `z-10` div):
    ```tsx
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      <div 
        className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)', transform: 'translate(-50%, -50%)' }}
      />
    </div>
    ```
  - Update greeting `<h1>` font size: `className="text-2xl sm:text-xl font-black mt-3 tracking-tight leading-tight"`
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [~] 10. Staggered Framer Motion card animations (R4)
  - In `Dashboard.tsx`, convert the metric cards grid `<div id="dashboard-metrics">` to a Framer Motion stagger container:
    - Wrap with `<motion.div ... variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="visible">`
    - Wrap each of the 4 metric cards with `<motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}>`
  - Add reduced-motion check: `const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;` — if true, skip variants and render plain divs
  - In `LeadsModule.tsx`, find the lead list container and wrap with stagger parent + per-item motion wrappers (first 8 items), same `staggerChildren: 0.04`
  - In `ContactsModule.tsx`, apply same pattern to the contact list (first 8 items)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [~] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify: toasts slide in on lead creation; count-up animates on Dashboard load; gradient avatars appear in Dashboard greeting, Leads agent list, and More team section; TiltCard responds to mouse hover on desktop; hero card shows animated gradient.

- [ ] 12. Add BottomNav component and wire into App.tsx (R2)
  - Create `src/components/BottomNav.tsx`
  - Import `Home`, `Users`, `Award`, `MessageSquare`, `MoreHorizontal` from `lucide-react`
  - Define tabs array: `[{ id: 'dashboard', icon: Home, label: 'Dashboard' }, { id: 'leads', icon: Users, label: 'Leads' }, { id: 'properties', icon: Award, label: 'Properties' }, { id: 'contacts', icon: MessageSquare, label: 'Contacts' }, { id: 'more', icon: MoreHorizontal, label: 'More' }]`
  - Render `<nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden justify-around items-center">` with `background: var(--bg-surface)`, `borderTop: 1px solid var(--border-light)`, `paddingBottom: env(safe-area-inset-bottom)`
  - Each tab: `<button>` with `flex flex-col items-center py-1.5 flex-1 min-touch relative` layout
  - Active tab button text/icon color: `var(--color-accent)`, inactive: `var(--text-muted)`
  - Active indicator: `<motion.div layoutId="bottom-tab-indicator">` pill (small, accent background, 2px height) positioned at bottom of button — use Framer Motion `layoutId` for animated position transitions between tabs
  - If `prefersReducedMotion`, replace `motion.div` with a plain `<div>` (no layoutId)
  - Each button: `aria-label`, `aria-current`, `onClick={() => onTabChange(tab.id)}`
  - Labels: `<span className="text-[9px] uppercase font-bold mt-0.5 tracking-tight">{tab.label}</span>`
  - In `App.tsx`, import and render `<BottomNav>` just before the closing `</div>` of the main `ClickSpark` wrapper, passing `activeTab` and `onTabChange={(tab) => { setActiveTab(tab); setLeadsFilterRedirect(''); if (tab === 'more') setMoreSubview('attendance'); }}`
  - Ensure the existing `<nav id="bottom-navigation-bar">` section in App.tsx is removed to avoid duplication (it will be fully replaced by BottomNav)
  - Verify `pb-24 safe-bottom` on the `<main>` tag provides enough clearance for the bottom nav + safe area
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 12.1 Write unit tests for BottomNav tab switching
    - Mock `onTabChange`, click each of the 5 buttons, verify correct id is passed
    - _Requirements: 2.6_

- [~] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify full end-to-end on mobile (375px): BottomNav is visible and switches tabs; MobileSlideMenu also switches tabs; hero gradient animates; toasts appear on lead creation; avatars display correctly; skeleton loaders show on fresh load; count-up animations run once.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate core correctness invariants (tilt clamping, count-up convergence, toast stack cap, avatar determinism)
- Unit tests validate specific interaction examples
- Use Vitest with `--run` flag for single-execution test runs: `npx vitest --run`
- All new components go in `src/components/`, all new hooks in `src/hooks/`
- No new npm packages — use only `motion`, `lucide-react`, and React 19 built-ins
- The existing `.skeleton` CSS class and CSS variables in `index.css` are ready to use
- The existing `AnimatePresence` import in `App.tsx` is available for ToastProvider's exit animations
