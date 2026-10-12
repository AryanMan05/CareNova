# CareNova — Your Personal Health Companion

**Platform Version:** 2.0.0 (Complete Fresh Architecture)  
**Lead Architect & Creator:** Aryan More  
**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS + Supabase (Auth, Postgres RLS) + Netlify  

---

## 🌟 Executive Overview
**CareNova** is a clinically referenced personal health companion designed to replace fragile legacy architectures. Powered directly by Supabase Authentication and PostgreSQL with Row Level Security (RLS), CareNova delivers:
- **Unified Health Cockpit Dashboard:** Real-time BMI, recent weight, daily water glasses, steps, sleep, AHA blood pressure, ADA glucose, Recharts longitudinal trends, and 1-click medication compliance.
- **8 Dedicated Clinical Health Trackers:** Full transactional CRUD with user isolation for Hydration, Weight, Sleep Quality, Exercise, Steps, Blood Pressure, Blood Glucose, and Heart Rate.
- **Clinical Health Calculators:** Mifflin-St Jeor BMR, TDEE, Devine Ideal Body Weight, Tanaka Heart Rate Zones, Hydration Targets, and 1-Click Profile Sync.
- **Disease & Health Awareness Library:** 22 clinical categories with full-text search, etiology, hallmark symptoms, prevention, standard treatments, and emergency warning signs.
- **Interactive Symptom Checker & Triage:** Algorithmic red-flag life-threat screening with direct dialers for Indian National Emergency (112, 108).
- **CareNova AI Assistant:** Clinical intelligence with prompt safeguards, user health context injection, and offline heuristic fallback.
- **Doctor-Ready PDF Reports:** Instant client-side PDF document generation powered by `jspdf` and `jspdf-autotable` branded with creator credit: *"Created by Aryan More"*.
- **Admin Governance Portal:** Telemetry telemetry, user directory state control, and medical condition CMS catalog.
- **Global Command Palette:** Keyboard shortcut modal listener (`Ctrl+K` / `Cmd+K`) for rapid navigation.

---

## 🚀 Quick Start Guide

### 1. Local Development
```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

> **Note on Demo Mode:** CareNova includes a built-in offline demo engine with authentic seed data and full feature fidelity when Supabase credentials are not provided.

---

## 🔐 Supabase Configuration & Production Setup

### 1. Database Schema & RLS Setup
1. Log in to your [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project.
3. Open [`supabase_schema.sql`](./supabase_schema.sql) in this repository, paste the entire SQL contents into the SQL editor, and click **Run**.
4. This will create all 13 tables, user creation trigger (`on_auth_user_created`), admin helper functions, and Row Level Security policies.

### 2. Environment Variables (.env)
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🌐 Netlify Production Deployment

CareNova is pre-configured for 1-click Netlify deployment with zero-404 SPA routing:
- Build command: `npm run build`
- Publish directory: `dist`
- Client redirect rules are configured in [`public/_redirects`](./public/_redirects) and [`netlify.toml`](./netlify.toml).

In Netlify Dashboard:
1. Link your GitHub repository.
2. Go to **Site Configuration > Environment Variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Trigger deploy.

---

## 📄 License & Attribution
Designed, Authored, and Approved for CareNova by **Aryan More**.
