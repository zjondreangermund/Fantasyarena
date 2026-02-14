# FantasyArena Architecture & Deployment

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   React UI   │  │   3D Cards   │  │ React Query  │          │
│  │  (Vite App)  │  │  (Three.js)  │  │   (Caching)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    RAILWAY DEPLOYMENT                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Express.js Server                        │  │
│  │                   (Node.js 20)                             │  │
│  │                                                             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │
│  │  │   Routes    │  │  Services   │  │ Middleware  │       │  │
│  │  │  (11 APIs)  │  │  (5 files)  │  │    Auth     │       │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │           Static File Serving                        │  │  │
│  │  │           (dist/public/)                             │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                       │
│                          │ Drizzle ORM                          │
│                          │                                       │
│  ┌───────────────────────▼──────────────────────────────────┐  │
│  │              PostgreSQL Database                          │  │
│  │                                                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │  Users   │  │  Cards   │  │  Wallet  │  │  Trades  │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │  │
│  │                                                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │  │
│  │  │  Comps   │  │  Notify  │  │  History │               │  │
│  │  └──────────┘  └──────────┘  └──────────┘               │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                            │
                            │ External API (Optional)
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   API-Football.com                               │
│                   (Live EPL Data)                                │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### User Action Flow
```
User → React UI → API Request → Express Router → Service Layer → Database
                                                      ↓
                                  ← JSON Response ← Drizzle ORM ← PostgreSQL
```

### Marketplace Transaction Flow
```
1. User clicks "Buy Card"
2. POST /api/marketplace/buy
3. marketplaceService.buyCard()
4. Check rate limit (user_trade_history)
5. Verify balance (wallets)
6. Database transaction:
   - Transfer card ownership
   - Deduct buyer balance
   - Add seller balance
   - Record in marketplace_trades
   - Add to user_trade_history
7. Return success/error
```

### Competition Settlement Flow
```
1. Admin triggers settlement
2. POST /api/competitions/settle
3. competitionsService.settleCompetition()
4. Calculate all lineup scores
5. Rank entries by score
6. Database transaction:
   - Update competition status
   - Award prizes (60/30/10)
   - Update wallet balances
   - Create notifications
   - Record transactions
7. Return success
```

## Technology Stack

### Frontend
- **React 18.3.1** - UI framework
- **Vite 7.3.0** - Build tool & dev server
- **Three.js** - 3D card rendering
- **React Query** - Data fetching & caching
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Wouter** - Routing

### Backend
- **Node.js 20** - Runtime
- **Express 5** - Web framework
- **TypeScript 5.6** - Language
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **ESBuild** - Server bundler

### Services
- **scoring.ts** - XP calculation
- **statScaling.ts** - Rarity multipliers
- **marketplace.ts** - Trading logic
- **competitions.ts** - Prize distribution
- **fantasyLeagueApi.ts** - Live data

### Infrastructure
- **Railway** - Hosting platform
- **PostgreSQL** - Managed database
- **GitHub** - Version control
- **NPM** - Package management

## Deployment Architecture

### Railway Services
```
┌─────────────────────────────────────────────────────────┐
│  Railway Project: FantasyArena                          │
│                                                           │
│  ┌─────────────────────┐    ┌─────────────────────┐    │
│  │  Web Service        │◄──►│  PostgreSQL DB      │    │
│  │                     │    │                     │    │
│  │  - Port: 5000       │    │  - Auto-provisioned │    │
│  │  - Auto-deploy      │    │  - Backups enabled  │    │
│  │  - Health checks    │    │  - Connection pool  │    │
│  └─────────────────────┘    └─────────────────────┘    │
│           │                                              │
│           │ Environment Variables                        │
│           ├─ DATABASE_URL (auto-set)                    │
│           ├─ NODE_ENV=production                        │
│           ├─ PORT=5000                                  │
│           └─ API_FOOTBALL_KEY (optional)                │
└─────────────────────────────────────────────────────────┘
```

### Build Process
```
1. Install Dependencies
   npm install (522 packages)
   
2. Build Client
   cd Fantasy-Sports-Exchange
   vite build → dist/public/
   - index.html (2.23 KB)
   - CSS bundle (87.73 KB)
   - JS bundle (1.31 MB)
   
3. Build Server
   esbuild server/index.ts → dist/index.cjs
   - Bundled server (304.6 KB)
   - Externalized: pg, drizzle-orm, express
   
4. Start Production
   NODE_ENV=production node dist/index.cjs
```

## Security Architecture

### Authentication Flow
```
Railway Deployment (Production):
┌─────────────────────────────────────────────┐
│  Request → Auth Middleware                  │
│  ├─ Check req.user exists                   │
│  ├─ Mock user injected (54644807)          │
│  └─ Continue to route handler               │
└─────────────────────────────────────────────┘

Replit Deployment (Development):
┌─────────────────────────────────────────────┐
│  Request → Replit Auth                      │
│  ├─ OAuth2 authentication                   │
│  ├─ Session management                      │
│  ├─ User object in req.user                 │
│  └─ Continue to route handler               │
└─────────────────────────────────────────────┘
```

### Rate Limiting
```
Marketplace Operations:
┌──────────────────────────────────────┐
│  Rolling 24-hour Window              │
│  ├─ Sells: 5 per user                │
│  └─ Buys/Swaps: 10 per user          │
│                                       │
│  Tracked in: user_trade_history      │
│  Query: WHERE createdAt >= NOW() - 24h│
└──────────────────────────────────────┘
```

### Data Protection
```
┌─────────────────────────────────────────────┐
│  Database Transactions                      │
│  ├─ ACID compliance                         │
│  ├─ Automatic rollback on error            │
│  └─ Isolation level: Read Committed        │
│                                              │
│  SQL Injection Prevention                   │
│  ├─ Drizzle ORM parameterized queries      │
│  ├─ inArray() for IN clauses               │
│  └─ No raw SQL with user input             │
│                                              │
│  Input Validation                           │
│  ├─ Zod schemas for all inputs             │
│  ├─ Type checking at compile time          │
│  └─ Runtime validation                      │
└─────────────────────────────────────────────┘
```

## Performance Optimization

### Caching Strategy
```
┌─────────────────────────────────────────────┐
│  In-Memory Cache (fantasyLeagueApi)        │
│  ├─ Standings: 30 minutes                  │
│  ├─ Injuries: 30 minutes                   │
│  └─ Scores: 5 minutes                      │
│                                              │
│  Database Optimization                      │
│  ├─ Indexes on foreign keys                │
│  ├─ Connection pooling (Drizzle)           │
│  └─ Efficient queries with joins           │
│                                              │
│  Static Assets                              │
│  ├─ Served from dist/public/               │
│  ├─ Gzip compression enabled               │
│  └─ Cache headers set                      │
└─────────────────────────────────────────────┘
```

### Response Times (Target)
- API Endpoints: < 100ms
- Static Pages: < 50ms
- Database Queries: < 50ms
- External APIs: < 500ms (with timeout)

## Monitoring & Observability

### Logging
```
Application Logs:
├─ Request/Response logging
├─ Error stack traces
├─ Database query logging (dev only)
└─ Service method entry/exit

Railway Logs:
├─ Build logs
├─ Deployment logs
├─ Runtime logs
└─ Error logs
```

### Health Checks
```
Railway automatically monitors:
├─ HTTP health endpoint
├─ Process uptime
├─ Memory usage
└─ CPU usage
```

## Scaling Considerations

### Horizontal Scaling
```
Current: Single instance
Future: Multiple instances + Load Balancer
├─ Session management → Redis
├─ File uploads → S3/CDN
└─ WebSocket → Socket.io + Redis adapter
```

### Database Scaling
```
Current: Single PostgreSQL instance
Future: Read replicas for heavy queries
├─ Master: Write operations
└─ Replicas: Read operations (standings, scores)
```

## Disaster Recovery

### Backup Strategy
```
Automated (Railway Pro):
├─ Daily database backups
├─ 7-day retention
└─ Point-in-time recovery

Manual:
├─ pg_dump for manual backups
└─ Git for code versioning
```

### Recovery Procedures
```
Database Recovery:
1. Identify issue
2. Stop application
3. Restore from backup
4. Verify data integrity
5. Restart application

Code Rollback:
1. Identify bad deployment
2. Git revert commit
3. Push to trigger redeploy
4. Verify functionality
```

---

## Quick Reference

### Essential Commands
```bash
# Local Development
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run db:push      # Push database schema

# Railway CLI
railway login        # Login to Railway
railway link         # Link to project
railway run <cmd>    # Run command on Railway
railway logs         # View logs
```

### Essential URLs
```
Local: http://localhost:5000
Railway: https://your-project.up.railway.app
Docs: ./README.md
API: https://your-project.up.railway.app/api/*
```

### Essential Files
```
/README.md                    - Full deployment guide
/QUICKSTART.md                - 5-minute deploy
/DEPLOYMENT_CHECKLIST.md      - Deployment checklist
/.env.example                 - Environment template
/railway.json                 - Railway config
/IMPLEMENTATION_SUMMARY.md    - Technical details
/package.json                 - Dependencies & scripts
/Fantasy-Sports-Exchange/
  ├─ server/                  - Backend code
  ├─ client/                  - Frontend code
  └─ shared/                  - Shared types & schemas
```
