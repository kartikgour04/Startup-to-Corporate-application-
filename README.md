# 🚀 Nexus Platform — Where Startups Meet Corporates

A full-stack MERN web platform connecting innovative startups with forward-thinking corporates, enabling seamless collaboration, funding discovery, and innovation partnerships.

---

## 🎯 Features

### For Startups
- ✅ Complete startup profile with traction metrics, team, funding, tech stack
- ✅ Pitch builder — structured pitches to target specific corporates
- ✅ Apply to opportunities from corporates (pilots, accelerators, partnerships)
- ✅ Funding rounds — post and attract investors
- ✅ Real-time messaging with corporate contacts
- ✅ Connection networking
- ✅ Analytics dashboard (views, pitch status, connections)
- ✅ Profile completion tracker

### For Corporates
- ✅ Company profile with innovation focus, partnership types, budget
- ✅ Post opportunities (pilots, POCs, accelerators, vendor RFPs, investments)
- ✅ Application pipeline management — shortlist, accept, reject applicants
- ✅ Browse and connect with startups
- ✅ Real-time messaging
- ✅ Analytics dashboard

### Platform-Wide
- ✅ Role-based auth (Startup / Corporate / Admin) with JWT
- ✅ Email verification & password reset
- ✅ Real-time messaging with Socket.io (typing indicators, online status)
- ✅ Events system — webinars, demo days, summits, hackathons
- ✅ Global search across startups, corporates, opportunities, events
- ✅ Notification system (in-app + email)
- ✅ Premium subscription plans (Stripe-ready)
- ✅ Admin panel — user management, platform stats, moderation
- ✅ Reviews & ratings
- ✅ Mobile-responsive design

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Zustand, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |
| Charts | Recharts |
| Email | Nodemailer |
| File Uploads | Multer + Cloudinary |
| Payments | Stripe (integration-ready) |
| Deployment | Render / Railway / Vercel + MongoDB Atlas |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd nexus-platform

# Install root deps
npm install

# Install all dependencies (server + client)
npm run install-all
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env with your values
```

Required variables:
```
MONGO_URI=mongodb://localhost:27017/nexus
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:3000
```

### 3. Seed Demo Data

```bash
npm run seed
```

This creates:
- Admin: `admin@nexus.com` / `Admin@123`
- Startup: `alex@aifusion.io` / `Test@123`
- Corporate: `sarah@techcorp.com` / `Test@123`
- Plus 4 startups, 3 corporates, 4 opportunities, 3 events, 2 funding rounds

### 4. Run Development

```bash
# Run both server and client simultaneously
npm run dev

# Or run separately:
npm run server    # Backend on http://localhost:5000
npm run client    # Frontend on http://localhost:3000
```

---

## 📁 Project Structure

```
nexus-platform/
├── client/                     # React Frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── layout/         # Navbar, Footer, DashboardLayout
│       │   ├── cards/          # StartupCard, CorporateCard, etc.
│       │   └── ui/             # Reusable UI components
│       ├── pages/
│       │   ├── auth/           # Login, Register, ForgotPassword
│       │   ├── dashboard/      # All authenticated pages
│       │   └── admin/          # Admin panel
│       ├── store/              # Zustand state management
│       └── utils/              # Axios instance, helpers
│
└── server/                     # Express Backend
    ├── controllers/            # Auth controller
    ├── middleware/             # Auth, rate limiting
    ├── models/                 # Mongoose schemas
    │   ├── User.js
    │   ├── Startup.js
    │   ├── Corporate.js
    │   ├── Opportunity.js
    │   ├── pitch.js            # Pitch, Connection, FundingRound
    │   └── index.js            # Message, Conversation, Notification, Event, Review
    ├── routes/                 # All API routes
    ├── socket/                 # Socket.io handler
    ├── utils/                  # Email utility
    └── scripts/                # Seed script
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/verify/:token` | Verify email |
| POST | `/api/auth/forgot-password` | Send reset email |
| PUT | `/api/auth/reset-password/:token` | Reset password |

### Startups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/startups` | List with filters |
| GET | `/api/startups/:id` | Get startup profile |
| GET | `/api/startups/my/profile` | Get own profile |
| PUT | `/api/startups/my/profile` | Update own profile |
| POST | `/api/startups/:id/like` | Like/unlike |
| POST | `/api/startups/:id/follow` | Follow/unfollow |

### Opportunities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/opportunities` | List with filters |
| POST | `/api/opportunities` | Create opportunity |
| PUT | `/api/opportunities/:id` | Update |
| POST | `/api/opportunities/:id/apply` | Apply |
| PUT | `/api/opportunities/:id/applications/:appId` | Update application status |
| GET | `/api/opportunities/my/posted` | My posted opps |
| GET | `/api/opportunities/my/applications` | My applications |

*(and similar endpoints for corporates, pitches, events, funding, messages, connections, notifications, reviews, search, analytics, admin)*

---

## ☁️ Deployment

### Backend (Render / Railway)
1. Create account on [Render](https://render.com) or [Railway](https://railway.app)
2. Connect your GitHub repo
3. Set environment variables from `.env.example`
4. Set start command: `cd server && npm start`

### Frontend (Vercel / Netlify)
1. Connect repo to [Vercel](https://vercel.com)
2. Set build directory: `client`
3. Set build command: `npm run build`
4. Set `REACT_APP_API_URL` to your backend URL

### Database (MongoDB Atlas)
1. Create free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Get connection string and set as `MONGO_URI`

---

## 💰 Monetization Ideas

1. **Premium Subscriptions** — $29–$199/month for startups/corporates
2. **Featured Listings** — Charge to feature profiles/opportunities
3. **Event Tickets** — Platform fee on paid event registrations
4. **Verified Badges** — Paid verification for credibility
5. **Lead Generation** — Charge corporates per quality application
6. **Accelerator Partnerships** — Revenue share with accelerators
7. **API Access** — Enterprise API for aggregators/platforms

---

## 🎨 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nexus.com | Admin@123 |
| Startup | alex@aifusion.io | Test@123 |
| Startup 2 | neha@greenloop.co | Test@123 |
| Corporate | sarah@techcorp.com | Test@123 |
| Corporate 2 | james@innovateinc.com | Test@123 |

---

## 📝 Interview Talking Points

- **Role-based Auth**: JWT with separate startup/corporate interfaces reduces onboarding friction
- **Real-time Features**: Socket.io for live messaging, typing indicators, online status
- **Application Pipeline**: Kanban-style status management (pending → reviewing → shortlisted → accepted)
- **Profile Completion**: Dynamic scoring algorithm motivates users to complete profiles
- **Search Architecture**: MongoDB text indexes for fast full-text search across entities
- **State Management**: Zustand for lightweight, scalable global state
- **Security**: Helmet, rate limiting, input validation, bcrypt hashing
- **Scalability**: Mongoose indexes, pagination, connection pooling ready

---

## 🤝 Contributing

PRs welcome! See issues tab for feature requests and bug reports.

---

*Built with ❤️ — Nexus Platform © 2025*
