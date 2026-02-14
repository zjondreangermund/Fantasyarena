# 🎮 Getting Started with FantasyArena

Welcome to FantasyArena! This guide will help you get up and running quickly.

## What is FantasyArena?

FantasyArena is a fantasy football card trading game where you:
- Collect NFT-style player cards
- Trade cards on the marketplace
- Compete in fantasy competitions
- Earn rewards and prizes

## Choose Your Path

### 🚀 I Want to Deploy to Production
**Time: 5 minutes**

Follow the [Quick Start Guide](./QUICKSTART.md) to deploy to Railway:
1. Fork repository
2. Deploy to Railway
3. Add PostgreSQL database
4. Set environment variables
5. Done!

📖 [Read Quick Start →](./QUICKSTART.md)

---

### 💻 I Want to Develop Locally
**Time: 10 minutes**

**Prerequisites:**
- Node.js 20+
- PostgreSQL 15+

**Steps:**
```bash
# 1. Clone repository
git clone https://github.com/zjondreangermund/Fantasyarena.git
cd Fantasyarena

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 4. Start PostgreSQL (Docker)
docker run --name fantasyarena-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=fantasyarena \
  -p 5432:5432 -d postgres:15

# 5. Push database schema
npm run db:push

# 6. Start development server
npm run dev
```

Visit: http://localhost:5000

📖 [Read Full Setup Guide →](./README.md#local-development-setup)

---

### 📚 I Want to Learn More
**Time: 15 minutes**

Read these documents in order:
1. [Architecture Overview](./ARCHITECTURE.md) - System design
2. [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Technical details
3. [API Documentation](./README.md#api-endpoints) - Endpoints reference
4. [Deployment Guide](./README.md) - Full deployment instructions

---

## Key Features

### 🎴 Card Collection
- Collect player cards with different rarities (common → legendary)
- Each card has unique stats and multipliers
- Level up cards by earning XP

### 💰 Marketplace
- Buy and sell player cards
- 8% marketplace fee
- Rate limiting: 5 sells, 10 buys per 24h
- Price validation by rarity tier

### 🏆 Competitions
- Enter fantasy competitions
- Submit lineups (1 GK, 1 DEF, 1 MID, 1 FWD, 1 Utility)
- Earn prizes: 60% 1st, 30% 2nd, 10% 3rd
- Real-time scoring based on player performance

### 📊 Live Data
- EPL standings with fantasy points
- Player performance scores
- Injury and suspension updates
- Caching for optimal performance

### 🔔 Notifications
- Rewards and prizes
- Trade confirmations
- System announcements
- Mark as read functionality

---

## Project Structure

```
Fantasyarena/
├── Fantasy-Sports-Exchange/    # Main application
│   ├── client/                 # React frontend
│   │   ├── src/
│   │   │   ├── pages/         # Page components
│   │   │   └── components/    # Reusable components
│   │   └── index.html
│   ├── server/                 # Express backend
│   │   ├── services/          # Business logic
│   │   ├── routes.ts          # API routes
│   │   └── index.ts           # Entry point
│   └── shared/                 # Shared code
│       ├── schema.ts          # Database schema
│       └── models/            # Type definitions
├── dist/                       # Build output (gitignored)
├── .env                        # Environment vars (gitignored)
├── .env.example                # Environment template
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── railway.json                # Railway config
├── README.md                   # Full documentation
├── QUICKSTART.md               # 5-minute deploy
├── ARCHITECTURE.md             # System architecture
├── IMPLEMENTATION_SUMMARY.md   # Technical details
├── DEPLOYMENT_CHECKLIST.md     # Deployment steps
└── GETTING_STARTED.md          # This file
```

---

## Essential Commands

### Development
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (port 5000)
npm run check            # Type check
npm run db:push          # Push database schema
```

### Production
```bash
npm run build            # Build client + server
npm start                # Start production server
```

### Database
```bash
npm run db:push          # Apply schema changes
# Sync EPL data (after server starts)
curl -X POST http://localhost:5000/api/epl/sync
```

---

## Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - `development` or `production`

**Optional:**
- `PORT` - Server port (default: 5000)
- `API_FOOTBALL_KEY` - Live EPL data API key
- `ADMIN_USER_IDS` - Admin user IDs (comma-separated)

📖 [See .env.example for details](./.env.example)

---

## Technology Stack

**Frontend:**
- React 18.3.1 + TypeScript
- Vite (build tool)
- Three.js (3D cards)
- Tailwind CSS
- React Query

**Backend:**
- Node.js 20
- Express 5
- Drizzle ORM
- PostgreSQL
- TypeScript

**Deployment:**
- Railway (hosting)
- PostgreSQL (managed DB)
- GitHub (version control)

---

## API Endpoints

### Public
- `GET /api/players` - List player cards
- `GET /api/fantasy/standings` - EPL standings
- `GET /api/fantasy/scores` - Player scores
- `GET /api/fantasy/injuries` - Injury updates

### Authenticated
- `GET /api/user/cards` - User's cards
- `POST /api/marketplace/sell` - List card
- `POST /api/marketplace/buy` - Buy card
- `GET /api/notifications` - User notifications

### Admin
- `POST /api/epl/sync` - Sync EPL data
- `POST /api/competitions/settle` - Settle competition

📖 [Full API docs →](./README.md#api-endpoints)

---

## Common Tasks

### Add New Player Data
```bash
# Start server, then:
curl -X POST http://localhost:5000/api/epl/sync
```

### View Database
```bash
# Using psql
psql $DATABASE_URL

# List tables
\dt

# Query data
SELECT * FROM players LIMIT 10;
```

### Check Logs
```bash
# Local: View terminal output
npm run dev

# Railway: Dashboard → Service → Deployments → Logs
```

### Reset Database
```bash
# Drop all tables and recreate
npm run db:push
```

---

## Troubleshooting

### Build Fails
**Issue:** Dependencies not installed
```bash
# Solution
npm install
```

### Database Connection Error
**Issue:** `DATABASE_URL must be set`
```bash
# Solution: Set DATABASE_URL in .env
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/fantasyarena" > .env
```

### Port Already in Use
**Issue:** `EADDRINUSE: address already in use :::5000`
```bash
# Solution: Find and stop process
# Mac/Linux: lsof -ti:5000 | xargs kill -9
# Windows: netstat -ano | findstr :5000
```

### Vite Build Error
**Issue:** Replit plugins failing
```bash
# Solution: Ensure process.env.REPL_ID is undefined
# This is handled automatically in vite.config.ts
```

📖 [More troubleshooting →](./README.md#troubleshooting)

---

## Getting Help

### Documentation
- 📖 [README.md](./README.md) - Full guide
- ⚡ [QUICKSTART.md](./QUICKSTART.md) - Quick deploy
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture
- 📝 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical details

### Support
- 🐛 [GitHub Issues](https://github.com/zjondreangermund/Fantasyarena/issues)
- 💬 [Railway Discord](https://discord.gg/railway)

---

## Next Steps

✅ **Deployed?** Test all features:
  - [ ] User can view cards
  - [ ] Marketplace buy/sell works
  - [ ] Competitions display
  - [ ] Notifications show up
  - [ ] API endpoints respond

✅ **Developing?** Read the code:
  - [ ] Review [schema.ts](./Fantasy-Sports-Exchange/shared/schema.ts)
  - [ ] Check [routes.ts](./Fantasy-Sports-Exchange/server/routes.ts)
  - [ ] Explore [services/](./Fantasy-Sports-Exchange/server/services/)
  - [ ] Look at [pages/](./Fantasy-Sports-Exchange/client/src/pages/)

✅ **Contributing?** 
  - [ ] Fork repository
  - [ ] Create feature branch
  - [ ] Make changes
  - [ ] Test locally
  - [ ] Submit PR

---

## License

MIT License - See LICENSE file

---

## Credits

Built with ❤️ using React, Express, PostgreSQL, and Railway.

---

**Ready to start? Choose your path above!** 🚀
