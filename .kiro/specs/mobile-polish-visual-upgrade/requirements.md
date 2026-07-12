# Requirements Document

## Introduction

This feature covers a comprehensive mobile-first UX polish and visual upgrade for the EstateFlow CRM application. The app is built with React 19, TypeScript, Tailwind CSS v4, Framer Motion v12 (`motion` package), and Lucide React icons. It uses a dark navy theme with CSS custom properties defined in `index.css`. The upgrade spans ten areas: fixing broken mobile navigation, resolving dark-theme consistency issues in the Dashboard, adding Framer Motion page/card animations, a 3D tilt card effect, an animated hero section, skeleton loaders, count-up stat animations, a toast notification system, and gradient avatars.

No new npm packages may be introduced. All animation must respect the `prefers-reduced-motion` media query. All components must use CSS variables from `index.css` rather than hardcoded Tailwind color classes.

## Glossary

- **App**: The EstateFlow CRM React application (`App.tsx`)
- **BottomNav**: The new sticky bottom tab bar component rendered on mobile (`md:hidden`)
- **MobileSlideMenu**: The existing slide-up menu component in `src/components/MobileSlideMenu.tsx`
- **Dashboard**: The `src/components/Dashboard.tsx` module
- **TiltCard**: The new reusable 3D perspective-tilt wrapper component
- **SkeletonLoader**: The new shimmer placeholder component using the existing `.skeleton` CSS class
- **ToastProvider**: The context provider that manages the toast notification stack
- **Toast**: A single transient notification message
- **GradientAvatar**: The new deterministic gradient avatar component
- **useCountUp**: The custom React hook that animates a number from 0 to a target value
- **useToast**: The custom React hook that exposes `toast.success()`, `toast.error()`, `toast.info()`, and `toast.warning()` methods
- **CSS_Variables**: The set of CSS custom properties defined in `:root` in `index.css`, e.g. `var(--bg-card)`, `var(--text-primary)`, `var(--color-accent)`
- **safe-bottom**: The Tailwind utility class defined in `index.css` that applies `padding-bottom: env(safe-area-inset-bottom)` for notched phones
- **AnimatePresence**: The Framer Motion component already imported in `App.tsx` that enables exit animations
- **activeTab**: The React state variable in `App.tsx` that controls which module is displayed
- **setActiveTab**: The state setter in `App.tsx` that changes the active module tab

---

## Requirements

### Requirement 1: Fix MobileSlideMenu Navigation

**User Story:** As a mobile user, I want tapping a navigation link in the slide menu to actually switch tabs in the app, so that I can navigate between modules without the link being a broken no-op.

#### Acceptance Criteria

1. THE MobileSlideMenu SHALL accept an `onNavigate` callback prop of type `(tab: string) => void` in place of the current `navLinks: { label: string; href: string }[]` prop structure.
2. WHEN a user taps a navigation link inside MobileSlideMenu, THE MobileSlideMenu SHALL call `onNavigate` with the corresponding tab identifier string and then close itself.
3. THE App SHALL pass `setActiveTab` (or a wrapper that also resets sub-views) as the `onNavigate` prop when rendering MobileSlideMenu.
4. THE MobileSlideMenu SHALL render navigation items as `<button>` elements instead of `<a href="#">` anchor tags.
5. WHEN the MobileSlideMenu is open, THE MobileSlideMenu SHALL be visible only on screens narrower than the `md` breakpoint (768px).

---

### Requirement 2: Mobile Bottom Navigation Bar

**User Story:** As a mobile user, I want a persistent bottom tab bar so that I can switch between the five main modules with one thumb tap, without relying on the slide-up menu.

#### Acceptance Criteria

1. THE App SHALL render a BottomNav component that is visible only on screens narrower than the `md` breakpoint (`md:hidden` equivalent) and is hidden on desktop.
2. THE BottomNav SHALL display five tabs: Dashboard, Leads, Properties, Contacts, and More, each with a Lucide icon and a short text label.
3. THE BottomNav SHALL be positioned as `fixed bottom-0` and span the full viewport width.
4. WHEN a tab is active, THE BottomNav SHALL display an accent-color indicator (pill or glow) beneath or around the active icon using `var(--color-accent)`.
5. THE BottomNav SHALL apply bottom safe-area padding using `env(safe-area-inset-bottom)` to support notched phones.
6. WHEN a user taps a BottomNav tab, THE App SHALL set `activeTab` to the corresponding tab identifier via `setActiveTab`.
7. WHEN the user navigates between tabs using BottomNav, THE BottomNav tab switch SHALL be animated using Framer Motion with a layout transition on the active indicator.
8. IF `prefers-reduced-motion` is set, THE BottomNav SHALL skip the tab switch animation and apply the active indicator instantly.

---

### Requirement 3: Dashboard Dark Theme Consistency Fix

**User Story:** As a user on the dark navy theme, I want all Dashboard cards and sections to use the dark color palette consistently, so that no white or light-grey backgrounds break the visual design.

#### Acceptance Criteria

1. THE Dashboard SHALL replace all hardcoded light Tailwind color classes (`text-slate-800`, `text-slate-900`, `text-slate-600`, `bg-emerald-50`, `bg-amber-50`, `bg-blue-50`, `bg-indigo-50`, `text-emerald-600`, `text-amber-600`, `text-blue-600`, `text-indigo-600`) on metric card elements with the equivalent CSS variable references.
2. THE Dashboard metric card icon badges SHALL use `var(--border-light)` as background and the relevant semantic color variable for the icon color, replacing `bg-emerald-50 text-emerald-600` and similar patterns.
3. THE Dashboard section headings that currently use `text-slate-800` SHALL use `var(--text-primary)` instead.
4. THE Dashboard footer element SHALL replace `bg-slate-100/80`, `text-slate-400`, and `text-slate-500` classes with `var(--bg-surface)`, `var(--text-muted)`, and `var(--text-secondary)` CSS variable references respectively.
5. THE Dashboard hot-lead row items that use `bg-amber-50/40` and `border-amber-100/30` SHALL use semi-transparent overlays built from `var(--color-gold)` at reduced opacity instead.
6. THE Dashboard secondary grid items that use `hover:bg-slate-100/80` SHALL use `var(--bg-surface-alt)` for hover states instead.
7. WHEN the `theme-light` class is applied to the root element, THE Dashboard SHALL remain readable because all color references resolve through CSS variables that the `theme-light` class overrides.

---

### Requirement 4: Framer Motion Page Transitions and Card Animations

**User Story:** As a user navigating between tabs, I want smooth animated transitions so that the app feels fluid and polished rather than jarring.

#### Acceptance Criteria

1. THE App SHALL wrap each tab's content `<motion.div>` with `initial={{ opacity: 0, y: 16 }}`, `animate={{ opacity: 1, y: 0 }}`, and `exit={{ opacity: 0, y: -8 }}` transition parameters — this already exists in App.tsx and SHALL be preserved as-is.
2. THE Dashboard metric stat cards SHALL enter with a staggered animation where each card's entrance is delayed by `0.05 * index` seconds.
3. THE LeadsModule lead list items SHALL animate in with a staggered `slideUp` entrance, each delayed by `0.04 * index` seconds, capped at a maximum of 8 animated items.
4. THE ContactsModule contact list items SHALL animate in with a staggered `slideUp` entrance, each delayed by `0.04 * index` seconds, capped at a maximum of 8 animated items.
5. IF `prefers-reduced-motion` is set, THE App SHALL disable all staggered card entrance animations and render cards without motion.

---

### Requirement 5: 3D Card Tilt Effect

**User Story:** As a desktop user hovering over cards, I want a subtle 3D perspective tilt effect so that the interface feels interactive and premium.

#### Acceptance Criteria

1. THE App SHALL provide a reusable `TiltCard` wrapper component in `src/components/TiltCard.tsx` that applies a CSS `perspective` transform and listens for mouse move and touch move events.
2. WHEN a pointer moves over a TiltCard on desktop, THE TiltCard SHALL rotate along the X and Y axes with a maximum tilt of 6 degrees.
3. WHEN a touch moves over a TiltCard on a touch device, THE TiltCard SHALL rotate along the X and Y axes with a maximum tilt of 3 degrees.
4. WHEN the pointer leaves a TiltCard or a touch ends, THE TiltCard SHALL smoothly reset to `rotateX(0) rotateY(0)` using a CSS transition of 300ms.
5. THE Dashboard metric stat cards, property cards in PropertiesModule, and lead cards in LeadsModule SHALL be wrapped in TiltCard.
6. IF `prefers-reduced-motion` is set, THE TiltCard SHALL apply no tilt transforms and render as a plain wrapper.

---

### Requirement 6: Dashboard Hero Section Visual Upgrade

**User Story:** As a user viewing the Dashboard, I want the greeting card to feel more dynamic and premium so that the app makes a strong first impression.

#### Acceptance Criteria

1. THE Dashboard greeting card (`#dashboard-hero`) SHALL display an animated gradient background that cycles through blue (`var(--color-accent)`), gold (`var(--color-gold)`), and navy (`var(--bg-primary)`) over an 8-second loop using a CSS `@keyframes` animation.
2. THE Dashboard greeting card SHALL display a decorative glow orb or radial gradient element positioned absolutely behind the greeting text to add visual depth.
3. THE Dashboard greeting text (`Good Morning/Afternoon/Evening, {name}`) SHALL render at `text-2xl` (24px) on mobile screens (below `sm` breakpoint) and `text-xl` on larger screens, using `var(--text-primary)` for color.
4. IF `prefers-reduced-motion` is set, THE Dashboard greeting card SHALL display a static gradient background instead of the animated cycling gradient.

---

### Requirement 7: Skeleton Loaders

**User Story:** As a user who just logged in, I want to see skeleton placeholder cards while the CRM data is loading, so that the interface feels responsive rather than blank.

#### Acceptance Criteria

1. THE App SHALL provide a `SkeletonLoader` component in `src/components/SkeletonLoader.tsx` that renders one or more shimmer placeholder blocks using the `.skeleton` CSS class already defined in `index.css`.
2. THE SkeletonLoader SHALL accept `count`, `height`, and `className` props to control the number of rows, the height of each row, and additional styling.
3. WHILE `activeOrgId` is empty or the first data fetch has not yet completed, THE Dashboard SHALL render SkeletonLoader placeholders in place of the four metric stat cards.
4. WHILE the leads array is empty on first load (before the first API response), THE LeadsModule SHALL render SkeletonLoader row placeholders in place of the lead list.
5. THE SkeletonLoader shimmer animation SHALL be suppressed if `prefers-reduced-motion` is set, showing a static muted background instead.

---

### Requirement 8: Count-Up Animation for Dashboard Stats

**User Story:** As a user viewing the Dashboard, I want the stat numbers to animate from zero to their value on first render so that key metrics feel impactful.

#### Acceptance Criteria

1. THE App SHALL provide a `useCountUp(target: number, duration?: number)` hook in `src/hooks/useCountUp.ts` that returns the current animated display value as a number.
2. WHEN a Dashboard metric stat card first mounts with a non-zero target value, THE Dashboard SHALL display the count animating from `0` to the target value over 800 milliseconds using an ease-out curve.
3. THE useCountUp hook SHALL only trigger the animation once on the initial mount and SHALL NOT re-trigger the animation when the target value changes due to polling updates.
4. IF `prefers-reduced-motion` is set, THE useCountUp hook SHALL return the target value immediately without animating.

---

### Requirement 9: Toast Notification System

**User Story:** As a user performing CRM actions, I want informative toast notifications instead of browser `alert()` dialogs so that the feedback is non-blocking and visually consistent with the dark navy theme.

#### Acceptance Criteria

1. THE App SHALL provide a `ToastProvider` context provider in `src/components/ToastProvider.tsx` and a `useToast` hook that exposes `toast.success(message)`, `toast.error(message)`, `toast.info(message)`, and `toast.warning(message)` methods.
2. WHEN `toast.success` is called, THE ToastProvider SHALL display a Toast with a green left border and a green check icon.
3. WHEN `toast.error` is called, THE ToastProvider SHALL display a Toast with a red left border and a red X icon.
4. WHEN `toast.info` is called, THE ToastProvider SHALL display a Toast with a blue left border and a blue info icon.
5. WHEN `toast.warning` is called, THE ToastProvider SHALL display a Toast with an amber left border and an amber warning icon.
6. THE ToastProvider SHALL render Toasts in a fixed overlay container positioned at `top-right` on desktop (≥ `sm` breakpoint) and `top-center` on mobile.
7. WHEN a Toast is displayed, THE Toast SHALL slide in from the right on desktop and from the top on mobile using a Framer Motion animation.
8. WHEN 3.5 seconds have elapsed since a Toast appeared, THE ToastProvider SHALL automatically dismiss that Toast.
9. THE ToastProvider SHALL allow a user to manually dismiss a Toast by clicking an X button on the Toast.
10. THE ToastProvider SHALL stack a maximum of 3 Toasts simultaneously; WHEN a fourth Toast is triggered, THE ToastProvider SHALL remove the oldest Toast before adding the new one.
11. THE App SHALL replace the `alert('Success: Lead added!')` call in `handleCreateLeadManual` with `toast.success('Lead added successfully.')`.
12. THE App SHALL replace the `alert('Error: ...')` call in `handleCreateLeadManual` with `toast.error(err.message)`.
13. THE App SHALL replace the `alert('Candidate full name and phone number is required.')` call with `toast.warning('Full name and phone number are required.')`.
14. THE App SHALL replace the `alert('Your browser does not support Speech Recognition...')` call in `startSpeechListening` with `toast.warning(message)`.
15. THE App SHALL replace the `alert('Billing Threshold Restriction: ...')` call in the property add handler with `toast.error(message)`.

---

### Requirement 10: Gradient Avatar Component

**User Story:** As a user, I want to see visually distinct gradient avatars for agents and contacts instead of plain initials divs, so that the team list feels more human and polished.

#### Acceptance Criteria

1. THE App SHALL provide a `GradientAvatar` component in `src/components/GradientAvatar.tsx` that accepts `name: string`, `seed?: string`, and `size?: number` props.
2. THE GradientAvatar SHALL derive a consistent gradient color pair from a hash of the `name` prop, producing the same colors for the same name on every render without using an external library.
3. THE GradientAvatar SHALL render a circular element displaying the first letter (or first two letters) of `name` as white text on the derived gradient background.
4. WHEN a GradientAvatar is in an active or selected state (indicated by an `active` boolean prop), THE GradientAvatar SHALL display a subtle box-shadow glow using `var(--color-accent)`.
5. THE Dashboard greeting section SHALL replace any plain initials `<div>` with `<GradientAvatar>` using the current user's name.
6. THE LeadsModule agent avatar elements SHALL use `<GradientAvatar>` with the agent's name as the seed.
7. THE MoreModule team member list items SHALL use `<GradientAvatar>` for each team member.
