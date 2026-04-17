# 🇮🇳 India Setup Guide — Nexus Platform

## Razorpay Setup (5 minutes)

1. **Create account**: https://razorpay.com → Sign up with Indian business details
2. **Test mode** (for development):
   - Dashboard → Settings → API Keys → Generate Test Key
   - Copy Key ID (starts with `rzp_test_`) and Key Secret
3. **Add to `server/.env`**:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **Test card numbers**:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
   - OTP: `1234`
5. **Go live**: Complete KYC → Dashboard → Switch to Live mode → Get live keys (`rzp_live_xxx`)

## Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Gmail
2. Go to: Google Account → Security → 2-Step Verification → App Passwords
3. Generate App Password for "Mail"
4. Add to `server/.env`:
   ```
   EMAIL_USER=yourcompany@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx    ← 16 character app password
   ```

## MongoDB Atlas (Free)

1. https://cloud.mongodb.com → Create free account
2. Create M0 Cluster (free forever, 512MB)
3. Database Access → Add user with password
4. Network Access → Add `0.0.0.0/0` (allow all IPs)
5. Connect → copy connection string
6. Add to `server/.env`:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/nexus
   ```

## Deploy on Indian Infrastructure (Optional)

For lowest latency for Indian users:
- **AWS Mumbai** (ap-south-1) on Elastic Beanstalk
- **Google Cloud Mumbai** (asia-south1)
- **DigitalOcean Bangalore** (blr1)
- **Azure India Central**

Or use global CDN services (Render/Vercel auto-select closest region).

## GST Compliance

- All prices shown on platform are exclusive of GST
- 18% GST applies on software services
- Razorpay handles GST on payment processing
- Provide GST invoices to customers from your Razorpay dashboard

## DPIIT/Startup India Registration

Once live, register at https://startupindia.gov.in for:
- Tax benefits
- IPR benefits
- Easier compliance
- Government tender eligibility

## Support Contact

For integration support: support@nexus.in
