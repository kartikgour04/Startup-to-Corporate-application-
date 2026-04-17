# 🚀 Deployment Guide — Nexus Platform

## Why your data resets (and how to fix it)

**Root cause:** You're using a local MongoDB database (`mongodb://localhost:27017/nexus`).  
Local MongoDB only exists on your Mac. When you restart your Mac or the server, sessions expire and data can appear inconsistent because the JWT secret may not persist.

**The fix:** Use MongoDB Atlas (free cloud database). Your data will persist forever, work from any device, and be accessible when you deploy.

---

## Step 1 — MongoDB Atlas (Free, 5 min setup)

1. Go to https://cloud.mongodb.com → Sign up free
2. Create a free **M0 cluster** (512MB free forever)
3. Under **Database Access** → Add a user with password (save these)
4. Under **Network Access** → Add IP Address → Allow access from anywhere (`0.0.0.0/0`)
5. Under **Databases** → Connect → **Connect your application** → copy the connection string

Your connection string looks like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nexus?retryWrites=true&w=majority
```

6. Paste it into `server/.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nexus?retryWrites=true&w=majority
```

7. Re-run the seed script:
```bash
cd server && npm run seed
```

---

## Step 2 — Stripe (Payments)

1. Go to https://stripe.com → Create account (use Test mode first)
2. Get your **Secret key** from https://dashboard.stripe.com/apikeys
3. Create 3 Products in https://dashboard.stripe.com/products:
   - **Nexus Starter** — $29/month recurring → copy the Price ID (starts with `price_`)
   - **Nexus Professional** — $79/month recurring → copy the Price ID
   - **Nexus Enterprise** — $199/month recurring → copy the Price ID
4. Add to `server/.env`:
```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_PRICE_STARTER=price_xxxxxxxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxx
```
5. For webhooks (to activate premium after payment):
   - Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
   - Run: `stripe listen --forward-to localhost:5001/api/payments/webhook`
   - Copy the webhook secret into `STRIPE_WEBHOOK_SECRET`

---

## Step 3 — Deploy Backend (Render — Free tier)

1. Push your code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
5. Add all environment variables from `server/.env`
6. Deploy → copy your backend URL (e.g. `https://nexus-api.onrender.com`)

---

## Step 4 — Deploy Frontend (Vercel — Free)

1. Go to https://vercel.com → New Project → Import your repo
2. Settings:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
3. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy

---

## Step 5 — Update CORS

In `server/.env`, update `CLIENT_URL` to your Vercel URL:
```
CLIENT_URL=https://your-app.vercel.app
```

---

## After deployment, update Stripe

1. In Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://your-backend.onrender.com/api/payments/webhook`
3. Events to listen: `checkout.session.completed`, `customer.subscription.deleted`
4. Copy the signing secret → update `STRIPE_WEBHOOK_SECRET`

---

## JWT Token Expiry (login persistence)

By default, tokens expire in 7 days. If you want users to stay logged in longer, change in `server/.env`:
```
JWT_EXPIRE=30d   # 30 days
JWT_EXPIRE=90d   # 90 days
```

---

## Summary Checklist

- [ ] MongoDB Atlas cluster created and `MONGO_URI` updated
- [ ] `JWT_SECRET` changed to a long random string (never share this)
- [ ] Seed data re-run against Atlas: `npm run seed`
- [ ] Stripe account created and keys added
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] `CLIENT_URL` updated to Vercel URL
- [ ] Stripe webhook configured with production URL
- [ ] Test payment flow end-to-end
