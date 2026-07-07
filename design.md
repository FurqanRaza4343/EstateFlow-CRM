# EstateFlow CRM — Design System

## Color Palette

### Brand Colors
```
Primary:      Emerald-500  #10B981  (buttons, links, active states)
PrimaryDark:  Emerald-600  #059669  (hover states)
Secondary:    Navy-900     #0B132B  (backgrounds, dark mode base)
Accent:       Teal-400     #2DD4BF  (highlights, badges)
```

### Theme Modes

#### Dark Mode (Default)
```
Background:   #0B132B  (navy-900)
Surface:      #1E293B  (slate-800)
SurfaceAlt:   #0F172A  (slate-900)
TextPrimary:  #F1F5F9  (slate-100)
TextSecondary:#94A3B8  (slate-400)
Border:       #334155  (slate-700)
```

#### Light Mode (SD Mode)
```
Background:   #F8FAFC  (slate-50)
Surface:      #FFFFFF  (white)
SurfaceAlt:   #F1F5F9  (slate-100)
TextPrimary:  #1E293B  (slate-800)
TextSecondary:#64748B  (slate-500)
Border:       #E2E8F0  (slate-200)
```

#### High Contrast Mode (Accessibility)
```
Background:   #FFFFFF
Surface:      #FFFFFF
TextPrimary:  #000000
TextSecondary:#1E293B
Border:       #000000
```

## Typography

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `text-xs` | 12px | 600 | Labels, badges |
| `text-sm` | 14px | 400 | Body text |
| `text-base` | 16px | 500 | Card titles |
| `text-lg` | 18px | 700 | Section headers |
| `text-xl` | 20px | 800 | Page titles |
| `text-2xl` | 24px | 900 | Dashboard metrics |

## Spacing

```
Card padding:     p-4 (16px) or p-6 (24px)
Grid gap:         gap-4 (16px)
Section margin:   mb-6 (24px) or mb-8 (32px)
```

## Component Standards

### Cards
- Rounded: `rounded-2xl` (16px)
- Shadow: `shadow-sm` (default), `shadow-md` (hover)
- Dark: `bg-slate-800/80 border border-slate-700/50`
- Light: `bg-white border border-slate-200`

### Buttons
- Primary: `bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl px-4 py-2`
- Secondary: `bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl`
- Ghost: `hover:bg-slate-800/50 text-slate-400 rounded-xl`

### Inputs
- Dark: `bg-slate-900/80 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white`
- Light: `bg-white border border-slate-300 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm`

### Navigation
- Bottom nav: Fixed bottom, pill shape on desktop (`rounded-full`), active state emerald
- Top bar: Sticky, brand + controls

## Animations

- **Page transitions:** Fade + slide up (`animate-fadeIn`)
- **Card hover:** Scale 1.02 + shadow-md
- **List items:** Stagger appear (50ms delay each)
- **Notifications:** Slide-in from right
- **Modal:** Fade backdrop + scale content
- **Loading:** Skeleton shimmer (`animate-pulse`)

## Icons
- Library: `lucide-react`
- Size: 16-20px inline, 24px for feature icons
- Color: Current text color or emerald accent
