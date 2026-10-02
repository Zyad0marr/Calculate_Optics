# Nour Optics (نور للبصريات)

نظام ويب متكامل لإدارة وحساب أسعار عدسات النظارات الطبية وسجل العملاء والطلبات.
مبني باستخدام **React + Vite** ومجهز للنشر المباشر على **Vercel** مع قاعدة بيانات **Supabase**.

---

## Vercel Deployment Instructions

Follow these exact steps to deploy this project directly to Vercel:

### Step 1:
Push project to GitHub.
```bash
git init
git add .
git commit -m "Initial commit of Nour Optics"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2:
Import GitHub repository into Vercel:
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New"** -> **"Project"**.
3. Select your GitHub repository.

### Step 3:
Vercel should detect Vite automatically.

### Step 4:
Build Command:
```
npm run build
```

### Step 5:
Output Directory:
```
dist
```

### Step 6:
Add these Vercel Environment Variables in your Vercel project settings (**Settings -> Environment Variables**):
- `VITE_SUPABASE_URL` : Your Supabase project URL (e.g. `https://xyzproject.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` : Your Supabase anon public key

### Step 7:
Deploy.
Click **"Deploy"**. Your application will be live on Vercel with zero additional configuration needed.

---

## Supabase Database Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in the Supabase dashboard.
3. Open `supabase/schema.sql` from this repository and run it. It will create all tables (`companies`, `lens_types`, `pricing_rules`, `customers`, `orders`) with Row Level Security (RLS) policies and initial sample data.
4. Copy your project URL and anon public key from **Project Settings -> API** and add them to `.env` (locally) or Vercel Environment Variables (in production).

---

## Local Development

```bash
# Install dependencies
npm install

# Run local development server (runs on http://localhost:3000)
npm run dev

# Build for production (outputs to dist/)
npm run build
```

---

## Login Credentials

- **Username**: `nour` (lowercase English)
- **Password**: `nour` (lowercase English)

*Credentials are strictly protected and never displayed in the application interface.*
