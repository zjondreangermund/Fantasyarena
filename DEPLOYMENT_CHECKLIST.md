# Railway Deployment Checklist

## Pre-Deployment
- [ ] Code is pushed to GitHub
- [ ] All tests pass locally
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables ready

## Railway Setup
- [ ] Create Railway account
- [ ] Create new project from GitHub repo
- [ ] Add PostgreSQL database service
- [ ] Configure environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL` (auto-set by Railway)
  - [ ] `PORT=5000`
  - [ ] `API_FOOTBALL_KEY` (optional)
  - [ ] `ADMIN_USER_IDS` (optional)

## First Deployment
- [ ] Trigger deployment in Railway
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Check deployment logs for errors
- [ ] Verify app is accessible at Railway URL

## Database Initialization
- [ ] Open Railway shell or use Railway CLI
- [ ] Run: `npm run db:push`
- [ ] Verify tables created successfully
- [ ] (Optional) Sync EPL data: `POST /api/epl/sync`

## Post-Deployment Testing
- [ ] Visit deployment URL
- [ ] Check health of app
- [ ] Test API endpoints:
  - [ ] GET /api/players
  - [ ] GET /api/fantasy/standings
  - [ ] GET /api/fantasy/scores
- [ ] Review logs for any errors
- [ ] Monitor performance

## Optional Enhancements
- [ ] Set up custom domain
- [ ] Configure real authentication (OAuth2)
- [ ] Enable monitoring/alerting
- [ ] Set up automated backups
- [ ] Configure CDN for static assets

## Success Criteria
✅ App loads at Railway URL
✅ No errors in logs
✅ Database connected
✅ API endpoints responding
✅ Static assets loading

## Troubleshooting Resources
- Railway Logs: Dashboard → Service → Deployments → Logs
- [README.md](./README.md) - Full deployment guide
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical details
- Railway Discord: https://discord.gg/railway
