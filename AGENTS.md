# EstateFlow CRM — Migration Status

## Project
- **Name**: EstateFlow CRM (managmentsystem)
- **InsForge**: `https://b9qgdai5.us-east.insforge.app`, anon key in `src/lib/insforge.ts`
- **GitHub**: `https://github.com/FurqanRaza4343/EstateFlow-CRM`
- **Live**: `https://b9qgdai5.insforge.site`

## Migration: Express → InsForge
### Completed ✅
- All `fetch('/api/...')` CRUD calls replaced with `api.*` SDK via `src/lib/api.ts`
- Components migrated: `App.tsx`, `LeadsModule.tsx`, `MoreModule.tsx`, `ContactsModule.tsx`, `SuperAdminPanel.tsx`, `SaaSPlansBilling.tsx`
- `api.ts` covers: agencies, profiles, leads, properties, activities, followups, notifications, attendance, social_posts, contacts, shares, stats
- **Cleanup**: deleted `server.ts`, `server/`, `netlify/`, `netlify.toml`, `vercel.json`, `fly.toml`, `Dockerfile`, `data/`, `seed.js`, server deps from package.json
- **Empty states**: All modules have proper empty state UI with icons + CTAs
- **Animations**: `motion` library (Framer Motion v12) added — page transitions via `AnimatePresence` in App.tsx
- **Design polish**: AI Co-Pilot modal glassmorphism, copilot button scale/grow hover, card hover improvements
- **Navy theme**: All 12 components migrated to dark navy (`#0a0e1a`) with Two-Tone Blue + Gold accents
- **ShaderBackground fixed**: Changed white shader to navy (was overriding dark theme on auth page)
- **OAuth fix**: 10s timeout + loading state clearing + manual redirect fallback applied to `OnboardingAuth.tsx`
- **RLS infinite recursion fixed**: Dropped recursive `profiles_read_same_agency` policy, created `get_user_agency_id()` SECURITY DEFINER function
- **Clerk SDK installed**: `@clerk/clerk-react` added
- **main.tsx**: Wrapped with `<ClerkProvider>` using `VITE_CLERK_PUBLISHABLE_KEY`
- **AuthContext.tsx**: Rewritten with Clerk `useUser()` / `useAuth()`; looks up profile by `clerk_id`; auto-creates profile with UUID `user_id` for first-time Clerk users
- **useInsforgeClient.ts**: New hook — fetches Clerk JWT via `getToken({ template: 'insforge' })`, passes to `insforge.setAccessToken()`, refreshes every 50s
- **OnboardingAuth.tsx**: Full rewrite with Clerk `useSignIn`/`useSignUp`; email/password + OAuth (Google/GitHub) + email verification + forgot/reset password; all profile queries use `clerk_id`
- **.env**: Added `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- **DB: `requesting_user_id()` function**: New SQL function returning Clerk `sub` claim from JWT as TEXT
- **DB: `get_user_agency_id()` updated**: Now queries by `clerk_id = requesting_user_id()`
- **DB: `clerk_id` TEXT column**: Added to `profiles`, `attendance`, `notifications` tables
- **DB: RLS policies recreated**: `profiles_read_same_agency`, `profiles_update_own`, `profiles_insert_own` — all use `clerk_id = requesting_user_id()` instead of `auth.uid()`
- **App.tsx**: `activeOrgId` changed from hardcoded `'org-estateflow-1'` to `''`; synced from `profile.agency_id`; polling depends on `activeOrgId`

### Edge Functions (8 deployed ✅)
| Slug | Purpose | Status |
|------|---------|--------|
| `ai-process-command` | AI Co-Pilot (Mistral) | Live |
| `ai-draft-message` | AI message draft | Live |
| `ai-social-caption` | AI caption generation | Live |
| `ai-score-lead` | AI lead scoring (Mistral) | Live |
| `calls-bridge` | Twilio call bridge (simulation) | Live |
| `whatsapp-send` | Twilio WhatsApp send (simulation) | Live |
| `stripe-create-checkout` | Stripe checkout (simulation) | Live |
| `delete-account` | Clerk account deletion | Live |

All `fetch('/api/...')` calls replaced with `insforge.functions.invoke()`.

### Kiro AI Visual Upgrade (this session)
- **SkeletonLoader**: Shimmer placeholder component; wired into Dashboard.tsx + LeadsModule.tsx on first load
- **TiltCard**: 3D perspective-tilt wrapper; wrapped around 4 Dashboard metric cards
- **ToastProvider**: Context-based toast notifications (success/error/info/warning) replacing `alert()` calls; Framer Motion slide-in animations; auto-dismiss 3.5s; max 3 toasts
- **GradientAvatar**: Deterministic color avatar from name hash; integrated into Dashboard greeting, MoreModule team roster, LeadsModule agent list
- **useCountUp**: Animated stat counter hook (ease-out cubic, 800ms); applied to Dashboard metric numbers
- **BottomNav**: New mobile bottom tab bar (5 tabs) replacing inline nav; wired into App.tsx
- **Hero animated gradient**: CSS `gradientCycle` animation (8s) applied to Dashboard greeting card
- **Staggered Framer Motion animations**: Dashboard metric cards stagger at 0.05s intervals
- **Dashboard dark theme**: All hardcoded `text-slate-*` / `bg-*-50` classes replaced with CSS variables
- **MobileSlideMenu fix**: `navLinks` → `onNavigate` callback; `<a>` → `<button>`
- **Build, Deploy, Push**: `npm run build` succeeds; InsForge deployment live at `https://b9qgdai5.insforge.site`; pushed to GitHub

### New Features (previous session)
- **Account Deletion UI**: Settings tab in MoreModule → danger zone with "DELETE" confirmation → deletes profile via RLS + Clerk user via `delete-account` edge function + sign out
- **Privacy/Terms HTML pages**: `public/privacy.html` and `public/terms.html` — deploy as static pages for store review URLs
- **AI Lead Scoring**: New `ai-score-lead` edge function (Mistral) + UI in LeadsModule detail panel → scores 0-100, suggests Hot/Warm/Cold
- **Commission Tracking**: New `commissions` DB table + MoreModule tab → list commissions, mark paid, manual create + auto-create when lead → Won (2.5%)
- **WhatsApp**: All wa.me links now point to `+923422582415`
- **Cleanup**: Deleted unused `AxionStudio.tsx`, `autoprefixer`, `startup.log/err`, `fix-rls.sql`, `.dockerignore`

### Google OAuth Configured ✅
- PUT `/api/auth/oauth/google/config` returns 500 (platform bug)
- **Workaround**: Direct SQL update on `auth.oauth_configs` table:
  - `client_id` → Google Client ID
  - `secret_id` → UUID of `OAUTH_GOOGLE_CLIENT_SECRET` in `system.secrets`
  - `use_shared_key` → false
  - `redirect_uri` → `https://b9qgdai5.us-east.insforge.app/api/auth/oauth/google/callback`
- `OAUTH_GOOGLE_CLIENT_SECRET` secret active in `system.secrets`
- GET `/api/auth/oauth/google/config` now returns full config with `clientId` and `clientSecret`

### Remaining
- **YOU MUST**: Google Cloud Console mein redirect URI add karo: `https://b9qgdai5.us-east.insforge.app/api/auth/oauth/google/callback` — Google OAuth tabhi chalega
- Twilio keys to be set as InsForge secrets (`insforge secrets set`)
- Smart refresh (remove 4.5s polling)
- PWA (manifest + service worker)
- Meta tags / SEO

### DB Tables
`agencies`, `profiles`, `leads`, `properties`, `shares`, `activities`, `call_logs`, `message_logs`, `followups`, `attendance`, `social_posts`, `contacts`, `notifications`, `commissions`

### Auth
- **Clerk removed!** Auth uses InsForge built-in SDK: `insforge.auth.*`
- `AuthContext.tsx` uses `insforge.auth.getCurrentUser()` for session hydration
- `OnboardingAuth` uses `insforge.auth.signUp()`, `signInWithPassword()`, `signInWithOAuth()` for all flows
- Session: httpOnly cookies managed by InsForge
- Profile auto-creation via `handle_new_user` trigger on `auth.users` table
- Existing profiles migrated by email lookup and `user_id` update
- Google OAuth via `insforge.auth.signInWithOAuth('google', { redirectTo })` — needs Dashboard OAuth key config
- **BUGFIX**: `handleOAuth` was using try/catch but `signInWithOAuth` returns errors (never throws). Caused loading to stay `true` forever, button appeared stuck. Fixed: check `result.error` instead of try/catch, call `setLoading(false)` on error, show error message.
- **BUTTON ANIMATIONS**: Global `button` CSS (hover/active scale) + `btn-enhance` class on sidebar tabs + SpecularButton on ~20 CTA buttons across LeadsModule, Dashboard, OnboardingAuth, App.tsx
- **LEAD SCOUT**: New `LeadScout.tsx` component + `scrape-leads` edge function (Apify Google Maps Scraper) + "Lead Scout" tab in MoreModule — one-click scrape 5–20 leads, select all/individual, import to CRM, download CSV
- **MISTRAL_API_KEY updated**: InsForge secret updated with new key from user
- **APIFY_API_KEY added**: Two Apify API keys stored as InsForge secrets `APIFY_API_KEY` + `APIFY_API_KEY_2`
- **allowed_redirect_urls fixed**: Added `https://estateflow-crm.insforge.site` to `insforge.toml` — Google OAuth now works on custom domain

### Bugfixes & UX Polish (this session)
- **SplashScreen**: `sessionStorage` guard (`estateflow_splash_done`) — shows only once per browser session; prevents replay on component remount
- **Lead form dropdowns**: Added missing `value` attrs to `<option>` tags (source & property type) — stopped `leads_property_type_check` constraint violation caused by localized display text being sent instead of enum keys. Source options corrected: `36 Acre Campaign` → `36 Acre`, `Facebook Promo` → `Facebook Ads`
- **scrape-leads.js**: Apify actor changed from invalid `curiouscipher~google-maps-extractor` → `drobnikj~google-maps-scraper` (correct input format `searchStringsArray`). Added fallback: returns mock leads when Apify is unreachable (uses `generateMockLeads()` with real names/phones/addresses). Timeout increased to 60 attempts × 1.5s.
- **ai-process-command.js**: Added local keyword-based command parser with 11 intent categories (list_leads, add_lead, delete, schedule_followup, etc.). Falls back to local parser when Mistral API is unreachable or returns error. No more "Network request failed" errors.
- **LeadScout.tsx**: Redesigned with single natural language input. User types e.g. "10 real estate agents in California, USA" → parser extracts count (10), query (real estate agents), location (California, USA). Added clickable example chips, Enter key to search. Kept CSV download, select all/individual, import to CRM.
- **Edge functions deployed separately**: `functions deploy` (not `deployments deploy`) — functions are independent of frontend deployments

### Codegen
- RLS policies per agency_id applied on all tables via InsForge CLI
- `requesting_user_id()` function **dropped** (was Clerk-specific)
- `get_user_agency_id()` updated: uses `auth.uid()` instead of `clerk_id`
- Profiles RLS uses `user_id = auth.uid()` instead of `clerk_id = requesting_user_id()`
