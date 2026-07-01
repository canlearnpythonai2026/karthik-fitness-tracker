# Karthik's Fitness Tracker
**Next.js 14 + Python FastAPI + PostgreSQL (Neon)**
Mobile-first PWA — installs on Android like a real app.

---

## Architecture
```
Android Phone (PWA)
      ↓
Vercel (Next.js frontend) — FREE
      ↓
Render.com (FastAPI backend) — FREE
      ↓
Neon (PostgreSQL database) — FREE forever
```

---

## STEP 1 — Push code to GitHub (5 min)

On your laptop, open terminal:

```bash
# Extract the zip
unzip fitness_tracker_app.zip
cd fitness-tracker

# Initialize git
git init
git add .
git commit -m "karthik fitness app - initial"
```

Go to **github.com** → click **New repository**
- Name: `karthik-fitness-app`
- Visibility: Public
- Click **Create repository**

Then back in terminal:
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/karthik-fitness-app.git
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub.

---

## STEP 2 — Free Database on Neon (3 min)

1. Go to **neon.tech** → Sign up free (use GitHub login)
2. Click **New Project**
   - Name: `fitness-tracker`
   - Region: **AWS / Singapore** (closest to Chennai)
3. Click **Create Project**
4. Go to **Dashboard → Connect**
5. Copy the connection string — looks like:
```
postgresql://karthik:abc123@ep-cool-sun-123.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```
6. **Save this string** — you need it in Step 3 and Step 4

✅ Your permanent database is ready.

---

## STEP 3 — Deploy Backend on Render.com (5 min)

Render is better than Railway — **truly free, no sleep issues for web services**.

1. Go to **render.com** → Sign up with GitHub (free)
2. Click **New +** → **Web Service**
3. Connect GitHub → Select `karthik-fitness-app`
4. Fill in the form:
   - **Name**: `karthik-fitness-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Scroll to **Environment Variables** → Add:
   - `DATABASE_URL` → paste your Neon connection string
   - `FRONTEND_URL` → `https://karthik-fitness-app.vercel.app` (update after Step 4)
6. Click **Create Web Service**
7. Wait 2-3 minutes → Render builds and deploys
8. Copy your Render URL:
   `https://karthik-fitness-api.onrender.com`

Test it — open in browser:
`https://karthik-fitness-api.onrender.com/api/health`

You should see: `{"status":"healthy"}`

✅ Backend is live.

---

## STEP 4 — Deploy Frontend on Vercel (5 min)

1. Go to **vercel.com** → Sign in with GitHub
2. Click **Add New** → **Project**
3. Import `karthik-fitness-app` from GitHub
4. Set **Root Directory** → `frontend`
5. Under **Environment Variables** → Add:
   - `NEXT_PUBLIC_API_URL` → your Render URL:
     `https://karthik-fitness-api.onrender.com`
6. Click **Deploy**
7. Wait 1-2 minutes
8. Your app URL:
   `https://karthik-fitness-app.vercel.app`

Then go back to **Render** → update `FRONTEND_URL` to your Vercel URL → **Manual Deploy**.

✅ Frontend is live.

---

## STEP 5 — Install on Android Phone (30 seconds)

1. Open **Chrome** on your Android phone
2. Go to: `https://karthik-fitness-app.vercel.app`
3. Tap the **⋮ menu** (top right corner)
4. Tap **"Add to Home Screen"**
5. Tap **"Add"**

🎉 **Done! The app icon appears on your home screen.**

Tap it — it opens fullscreen, no browser bar, like a real app!

---

## How your data is saved

Every time you tap Save in the app:

```
Your phone → Vercel → Render → Neon DB
                                  ✅ Saved permanently
```

| What you log | Stored permanently |
|---|---|
| Sets / reps / weight | ✅ Yes |
| Morning body weight | ✅ Yes |
| Sunday weight log | ✅ Yes |
| Monthly check-in | ✅ Yes |

**Neon free tier: 512 MB storage. Your 6 months of data = ~2 MB.**
You will never run out of space.

---

## Local development (optional)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env → paste your Neon DATABASE_URL
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
# .env.local already has NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open `http://localhost:3000` in Chrome on laptop,
or on your phone (same WiFi): `http://YOUR_LAPTOP_IP:3000`

---

## Troubleshooting

**Render backend sleeping?**
- Render free tier spins down after 15 min inactivity
- First request after sleep takes ~30 sec to wake up
- Solution: upgrade to Render Starter ($7/month) or keep it free and wait

**CORS error in browser?**
- Go to Render → Environment Variables
- Make sure `FRONTEND_URL` matches your exact Vercel URL
- Redeploy backend

**Database connection error?**
- Check Neon dashboard → your project is active
- Verify `DATABASE_URL` in Render environment variables
- Make sure it ends with `?sslmode=require`

**Vercel build failed?**
- Check Root Directory is set to `frontend`
- Check `NEXT_PUBLIC_API_URL` has no trailing slash

---

## Free tier summary

| Service | What it does | Cost | Limit |
|---|---|---|---|
| Neon | PostgreSQL DB | Free forever | 512 MB |
| Render | Python backend | Free | Sleeps after 15 min |
| Vercel | Next.js frontend | Free forever | 100 GB bandwidth |
| ExerciseDB | Exercise GIFs | Free | Open source |

