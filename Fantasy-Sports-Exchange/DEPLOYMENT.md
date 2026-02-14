# Deployment Guide for FantasyFC

## Environment Variables

The following environment variables are required for deployment to Railway or other production environments:

### Database Configuration
- **`DATABASE_URL`** (Required): PostgreSQL connection string
  - Example: `postgresql://user:password@host:5432/database`
  - Used by: Drizzle ORM for all database operations

### API Keys
- **`API_FOOTBALL_KEY`** (Optional when FANTASY_LEAGUE_API_KEY is set): API-Football API key for EPL data integration
  - Get from: https://www.api-football.com/
  - Used by: `server/services/apiFootball.ts` for live EPL data sync
  - Features: standings, fixtures, injuries, player stats
  - Note: Not needed if FANTASY_LEAGUE_API_KEY is configured

- **`FANTASY_LEAGUE_API_KEY`** (Optional): Fantasy League API key for live fantasy data
  - Get from: Fantasy Sports Data provider
  - Used by: `server/services/fantasyLeagueApi.ts`
  - When configured: Replaces the need for API_FOOTBALL_KEY for fantasy endpoints
  - Fallback: Uses EPL data from API_FOOTBALL_KEY if not configured, or mock data if neither is set

### Authentication
- **`REPL_ID`** (Optional): Replit environment ID for Replit Auth
  - Set automatically in Replit environment
  - Not needed for Railway deployment (uses Railway bypass mode)

- **`ISSUER_URL`** (Optional): OIDC issuer URL for authentication
  - Default: `https://replit.com/oidc`
  - Only needed if using Replit Auth

### Admin Configuration
- **`ADMIN_USER_IDS`** (Optional): Comma-separated list of admin user IDs
  - Example: `54644807,12345678`
  - Used by: Admin routes for privileged operations
  - Leave empty to allow all authenticated users to access admin routes

### Server Configuration
- **`PORT`** (Optional): Server port
  - Default: 5000
  - Railway automatically sets this

- **`NODE_ENV`** (Optional): Environment mode
  - Values: `development`, `production`
  - Default: `production` in Railway

## Railway Deployment

### Step 1: Provision PostgreSQL Database
1. In Railway dashboard, add PostgreSQL service
2. Copy the `DATABASE_URL` from database settings

### Step 2: Set Environment Variables
In Railway project settings > Variables, add required variables:
```
DATABASE_URL=<your-postgres-connection-string>
PORT=5000
NODE_ENV=production
```

Choose ONE of these API key options:
**Option A - Fantasy League API (recommended):**
```
FANTASY_LEAGUE_API_KEY=<your-fantasy-league-api-key>
```

**Option B - EPL API (fallback):**
```
API_FOOTBALL_KEY=<your-api-football-key>
```

**Option C - Both (for complete data):**
```
FANTASY_LEAGUE_API_KEY=<your-fantasy-league-api-key>
API_FOOTBALL_KEY=<your-api-football-key>
```

Additional optional variables:
```
ADMIN_USER_IDS=54644807
```

### Step 3: Deploy Application
1. Connect Railway to your GitHub repository
2. Set root directory to: `Fantasy-Sports-Exchange`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`

### Step 4: Run Database Migrations
After first deployment:
```bash
npm run db:push
```

### Step 5: Seed Initial Data (Optional)
Call the sync endpoint to populate initial data:
```bash
curl -X POST https://your-app.railway.app/api/epl/sync
```

## API Endpoints

### Fantasy League API (New)
- `GET /api/fantasy/standings` - Live league standings
- `GET /api/fantasy/scores` - Live player performance scores
- `GET /api/fantasy/injuries` - Injury/suspension updates

### Authentication
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user
- `GET /api/auth/user` - Get current user

### Game Data
- `GET /api/players` - Get marketplace cards (with stat multipliers)
- `GET /api/user/cards` - Get user's cards (with stat multipliers)
- `GET /api/players/:id` - Get specific player details
- `POST /api/epl/sync` - Sync EPL data (admin only)

## Features Implemented

### 1. Fantasy League API Integration
✅ Live league standings with fantasy points calculation
✅ Player performance scores with real-time stats
✅ Injury/suspension tracking
✅ Smart caching (30min for standings, 5min for scores)
✅ Error handling with fallback to cached data

### 2. Authentication Flow
✅ Replit Auth integration for Replit environment
✅ Railway bypass mode for production
✅ Session management with PostgreSQL
✅ Protected routes with auth middleware

### 3. Game Rules & Stat Scaling
✅ XP scoring system (goals, assists, clean sheets)
✅ Rarity-based stat multipliers (Common: 1.0x → Legendary: 1.5x)
✅ Marketplace price limits by rarity
✅ Trade rate limiting (5 sells, 10 buys per 24h)
✅ Prize distribution system (60/30/10 split)

### 4. Data Services
✅ `fantasyLeagueApi.ts` - Fantasy data integration
✅ `statScaling.ts` - Rarity multiplier application
✅ `scoring.ts` - Player XP calculation
✅ `marketplace.ts` - Price validation & rate limiting
✅ `competitions.ts` - Competition logic & prizes

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set
- Check if PostgreSQL service is running
- Ensure database is accessible from Railway

### API Key Issues
- If using FANTASY_LEAGUE_API_KEY: Fantasy endpoints will use mock data until real API is implemented
- If using API_FOOTBALL_KEY: Fantasy endpoints will transform EPL data to fantasy format
- For both keys: FANTASY_LEAGUE_API_KEY takes priority for fantasy endpoints
- Check API quota limits if configured

### Build Errors
- Ensure Node.js version 18+ is used
- Clear `node_modules` and reinstall if needed
- Check that all dependencies are in `package.json`

### Authentication Issues
- In Railway: Auth bypass is automatic (no Replit Auth needed)
- In Replit: Ensure `REPL_ID` and `ISSUER_URL` are set
- Check session store is using PostgreSQL

## Monitoring

### Health Checks
- Server should respond to root path `/`
- Check logs for any startup errors
- Verify database connection on startup

### Performance
- API responses are cached per configuration
- Database queries use indexes
- Static assets served efficiently in production

## Security Notes

⚠️ **Never commit API keys or DATABASE_URL to Git**
⚠️ Use environment variables for all secrets
⚠️ Rotate API keys periodically
⚠️ Use HTTPS in production (Railway provides this automatically)
⚠️ Set strong PostgreSQL passwords
