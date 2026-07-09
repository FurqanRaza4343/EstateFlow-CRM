# EstateFlow CRM — Migration Status

## Project
- **Name**: EstateFlow CRM (managmentsystem)
- **InsForge**: `https://b9qgdai5.us-east.insforge.app`, anon key in `src/lib/insforge.ts`
- **GitHub**: `https://github.com/FurqanRaza4343/EstateFlow-CRM`

## Migration: Express → InsForge
### Completed ✅
- All `fetch('/api/...')` CRUD calls replaced with `api.*` SDK via `src/lib/api.ts`
- Components migrated: `App.tsx`, `LeadsModule.tsx`, `MoreModule.tsx`, `ContactsModule.tsx`, `SuperAdminPanel.tsx`, `SaaSPlansBilling.tsx`
- `api.ts` covers: agencies, profiles, leads, properties, activities, followups, notifications, attendance, social_posts, contacts, shares, stats
- **Cleanup**: deleted `server.ts`, `server/`, `netlify/`, `netlify.toml`, `vercel.json`, `fly.toml`, `Dockerfile`, `data/`, `seed.js`, server deps from package.json
- **Auth**: `AuthContext.tsx` now wired to `insforge.auth.getCurrentUser()` on mount; working `signOut`, `refreshProfile`
- **Empty states**: All modules have proper empty state UI with icons + CTAs
- **Animations**: `motion` library (Framer Motion v12) added — page transitions via `AnimatePresence` in App.tsx
- **Design polish**: AI Co-Pilot modal has glassmorphism (`backdrop-blur`, `animate-scaleIn`); copilot button has scale/grow hover; card hover improvements

### Remaining fetch calls (need Edge Functions)
| File | Endpoint | Purpose |
|------|----------|---------|
| `App.tsx` | `/api/ai/process-command` | AI Co-Pilot (Mistral) |
| `App.tsx` | `/api/calls/bridge` | Twilio call bridge |
| `LeadsModule.tsx` | `/api/ai/draft-message` | AI message draft |
| `MoreModule.tsx` | `/api/social-posts/ai-caption` | AI caption gen |
| `ContactsModule.tsx` | `/api/whatsapp/send` | Twilio WhatsApp send |
| `SaaSPlansBilling.tsx` | `/api/payments/create-checkout` | Stripe checkout |

### DB Tables (all exist in InsForge PostgreSQL)
`agencies`, `profiles`, `leads`, `properties`, `shares`, `activities`, `call_logs`, `message_logs`, `followups`, `attendance`, `social_posts`, `contacts`, `notifications`

### Build
- `npm run build` — succeeds (Vite frontend)

### Auth
- `AuthContext.tsx` uses `insforge.auth.getCurrentUser()` for session hydration on app load
- `OnboardingAuth` uses `insforge.auth.signUp()/signInWithPassword()/signInWithOAuth()`  
- Session persists across page refreshes via InsForge httpOnly refresh cookie

### Codegen
- RLS policies per agency_id already applied on all tables via InsForge CLI
