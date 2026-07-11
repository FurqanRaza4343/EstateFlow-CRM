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

### New Features (this session)
- **Account Deletion UI**: Settings tab in MoreModule → danger zone with "DELETE" confirmation → deletes profile via RLS + Clerk user via `delete-account` edge function + sign out
- **Privacy/Terms HTML pages**: `public/privacy.html` and `public/terms.html` — deploy as static pages for store review URLs
- **AI Lead Scoring**: New `ai-score-lead` edge function (Mistral) + UI in LeadsModule detail panel → scores 0-100, suggests Hot/Warm/Cold
- **Commission Tracking**: New `commissions` DB table + MoreModule tab → list commissions, mark paid, manual create + auto-create when lead → Won (2.5%)
- **WhatsApp**: All wa.me links now point to `+923422582415`
- **Cleanup**: Deleted unused `AxionStudio.tsx`, `autoprefixer`, `startup.log/err`, `fix-rls.sql`, `.dockerignore`

### Remaining
- Clerk JWT template named `insforge` must be created in Clerk Dashboard (HS256, signing key = InsForge JWT secret `64b179877c6b29a560f5766b016e0e4627bbcc1c`, claims: `{ "role": "authenticated", "aud": "insforge-api" }`)
- Twilio keys & Clerk secret to be set as InsForge secrets (`insforge secrets set`)
- Skeleton loaders
- Smart refresh (remove 4.5s polling)
- PWA (manifest + service worker)
- Meta tags / SEO
- Toast notifications

### DB Tables
`agencies`, `profiles`, `leads`, `properties`, `shares`, `activities`, `call_logs`, `message_logs`, `followups`, `attendance`, `social_posts`, `contacts`, `notifications`, `commissions`

### Auth
- `AuthContext.tsx` uses Clerk `useUser()` for session hydration
- `OnboardingAuth` uses Clerk `useSignIn()`/`useSignUp()` for email/password + OAuth
- Session persists via Clerk httpOnly cookies
- `useInsforgeClient.ts` passes Clerk JWT to InsForge SDK

### Codegen
- RLS policies per agency_id applied on all tables via InsForge CLI
- `requesting_user_id()` returns Clerk `sub` claim as TEXT for RLS
- `get_user_agency_id()` SECURITY DEFINER function uses `clerk_id` to return agency UUID

### Blocked
- Clerk JWT template creation requires user action in Clerk Dashboard
