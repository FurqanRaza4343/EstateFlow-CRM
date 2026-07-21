# 🏡 EstateFlow CRM

**A Multi-Tenant White-Label Real Estate CRM** — Automate lead management, agent allocation, WhatsApp/SMS communication, AI-powered Co-Pilot assistance, attendance tracking, social media planning, and subscription billing — all in one dashboard.

Built with **React + TypeScript + Vite** on the frontend and **Express + InsForge** on the backend.

---

## ✨ Features

### Lead Management
- **Round-Robin Agent Allocation** — Incoming leads are automatically assigned to the least-loaded agent.
- **Manual & Webhook Lead Creation** — Add leads via form or API endpoint.
- **Temperature Scoring** — Hot / Warm / Cold with visual indicators.
- **Status Pipeline** — New → Contacted → Follow-Up → Won / Lost.
- **Timeline & Notes** — Full activity log with note-taking per lead.

### WhatsApp & SMS (Twilio)
- Send WhatsApp messages directly from the CRM (simulation mode if no API keys set).
- SMS sending support.
- Property sharing via WhatsApp, SMS, or Email.

### AI Co-Pilot (Mistral AI)
- Voice or text commands: "Create a hot lead Zain Malik phone +923001234567", "Schedule site visit with Sarah Jenkins next Monday", etc.
- Automates lead creation, follow-up scheduling, note-taking, and social media posts.

### Multi-Tenant SaaS
- White-label agencies with custom logos, colors, domain, and language/currency settings.
- Subscription plans: Free, Pro, Business, Enterprise — each with configurable limits (max leads, properties, users).
- Super Admin panel to manage all agencies.

### Property Inventory
- Full CRUD for property listings.
- Availability status, furnishing, amenities, images, documents.
- Budget-max comparison with leads.

### Employee Attendance
- GPS check-in/check-out with late detection.
- Daily attendance records.

### Social Media Planning
- Draft, schedule, and publish social posts.
- AI-powered caption generation.

### Billing (Stripe)
- Checkout sessions, customer portal, price listing.
- Subscription plan upgrades.

### Localization
- English, Urdu, Roman Urdu.
- Currency: USD, AED, PKR.
- Property units: Global (sq ft) / Regional (marla, kanal, etc.).

### Theme
- Dark, Light, and High-Contrast modes.
- Outdoor-legibility optimized.

---

## 🖥️ Tech Stack

| Layer          | Technology                             |
|----------------|----------------------------------------|
| Frontend       | React 19, TypeScript, Vite 6           |
| Styling        | Tailwind CSS v4                        |
| Animations     | Framer Motion, ClickSpark, Shaders (WebGL) |
| Icons          | Lucide React                           |
| Backend        | Express.js (Node/TypeScript)           |
| Database       | InsForge (PostgreSQL) / JSON file store |
| Auth           | InsForge Auth (email/password, OAuth)  |
| AI             | Mistral AI API                         |
| Messaging      | Twilio (WhatsApp / SMS)                |
| Payments       | Stripe                                 |
| Build Tool     | Vite 6                                 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/FurqanRaza4343/EstateFlow-CRM.git
cd EstateFlow-CRM
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
# InsForge Backend
VITE_INSFORGE_URL=https://your-project.insforge.app
VITE_INSFORGE_ANON_KEY=your-anon-key

INSFORGE_URL=https://your-project.insforge.app
INSFORGE_API_KEY=your-api-key

# AI (Mistral or Gemini)
MISTRAL_API_KEY=your-mistral-api-key
# GEMINI_API_KEY=your-gemini-api-key

# Twilio (leave empty for simulation)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_PHONE_NUMBER=+15005550006

# Stripe (leave empty for simulation)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

APP_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Opens at **http://localhost:3000**.

### Production Build

```bash
npm run build
npm start
```

Or use the pre-built static files:

```bash
NODE_ENV=production node server.js
```

---

## 📸 Screenshots

| | |
|---|---|
| Dashboard | Leads Pipeline |
| Property Catalog | WhatsApp Integration |
| AI Co-Pilot Chat | Attendance Check-In |
| Super Admin Panel | Subscription Billing |

---

## 🧠 AI Co-Pilot Commands

Type or speak these in the Co-Pilot:

- `"Create a hot lead Zain Malik phone +923001234567"`
- `"Schedule site visit with Sarah Jenkins next Monday"`
- `"Add a note to lead-1 regarding current quote"`
- `"Draft an Instagram post for property prop-1"`
- `"What are my tasks today?"`

---

## 🔮 Roadmap / Future Enhancements

- [ ] **Email Campaign Builder** — Drag-and-drop email sequences for lead nurturing
- [ ] **Advanced Analytics Dashboard** — Conversion funnels, agent performance metrics
- [ ] **Mobile App** — React Native companion app for field agents
- [ ] **Voice Call Recording & Transcription** — Twilio voice integration with AI summaries
- [ ] **Document Signing** — Built-in e-signature for property agreements
- [ ] **Multi-Currency Payment Links** — Shareable payment links via WhatsApp
- [ ] **Google Calendar Sync** — Two-way follow-up synchronization
- [ ] **Custom Reporting** — Export leads, activities, and attendance to PDF/CSV
- [ ] **Real-Time Notifications** — WebSocket-powered live updates
- [ ] **Integrations** — Zapier, Meta Ads (automatic lead import), Property Portal APIs (Zillow, Bayut)

---

## 📦 Project Structure

```
├── server.ts                 # Express API server
├── server/
│   ├── database.ts           # JSON file database + seed data
│   ├── services.ts           # AI, messaging, call services
│   ├── whatsapp.ts           # Twilio WhatsApp/SMS service
│   └── payments.ts           # Stripe payment service
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Main app shell + state management
│   ├── index.css             # Tailwind + CSS variables + themes
│   ├── lib/
│   │   ├── AuthContext.tsx    # Auth state provider
│   │   ├── insforge.ts       # InsForge SDK client
│   │   └── i18n.ts           # Internationalization helpers
│   ├── components/
│   │   ├── OnboardingAuth.tsx # Login/Signup screen
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   ├── LeadsModule.tsx   # Lead management
│   │   ├── PropertiesModule.tsx # Property inventory
│   │   ├── FollowUpsModule.tsx  # Follow-up scheduling
│   │   ├── ContactsModule.tsx   # WhatsApp contacts
│   │   ├── MoreModule.tsx    # Settings, attendance, billing
│   │   ├── SuperAdminPanel.tsx  # Multi-tenant admin
│   │   ├── ClickSpark.tsx    # Click spark animation
│   │   ├── ShaderBackground.tsx  # WebGL shader background
│   │   └── TextRollButton.tsx    # Animated button
│   └── pages/
│       └── AxionStudio.tsx   # Design reference page
```





## 👨‍💻 Author

**Furqan Raza** — [GitHub](https://github.com/FurqanRaza4343)
