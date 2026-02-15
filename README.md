# Fantasy Arena

A Fantasy Sports Exchange application built with React, Express, and PostgreSQL.

## Local Development

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL database

### Setup

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Set up environment variables (create a `.env` file):
```env
DATABASE_URL=postgresql://username:password@localhost:5432/fantasyarena
NODE_ENV=development
PORT=5000
```

3. Push the database schema:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Building for Production

Build the application:
```bash
npm run build
```

This will create:
- `dist/index.cjs` - The bundled server application
- `dist/public/` - The static client assets

Start the production server:
```bash
npm start
```

## Cloud Deployment

### Recommended: Deploy to Render.com (Free) 🆓

Render.com offers a generous free tier perfect for getting your site online:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Why Render?**
- ✅ Free tier (web service + PostgreSQL for 90 days)
- ✅ No credit card required
- ✅ Auto-deploy from GitHub
- ✅ Simple setup with `render.yaml` blueprint

**Quick Start:**
1. Sign up at [render.com](https://render.com)
2. Create new Blueprint from this repository
3. Deploy automatically in ~10 minutes

📖 **Full Guide**: See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed instructions

### Alternative: Deploy to Railway

Railway is another great option (requires upgrading after free tier):

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

**Railway Setup:**
1. Go to [railway.app](https://railway.app) and sign in
2. Create "New Project" from GitHub repo
3. Add PostgreSQL Database
4. Deploy automatically

📖 **Full Guide**: See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for detailed instructions

### Comparing Hosting Options

Not sure which platform to choose? See [HOSTING_ALTERNATIVES.md](HOSTING_ALTERNATIVES.md) for a detailed comparison of:
- Render.com (recommended for free tier)
- Railway
- Fly.io
- Vercel + External DB
- And more...

### Configuration Files

- `render.yaml` - Render.com Blueprint configuration (recommended)
- `nixpacks.toml` - Railway/Nixpacks build configuration
- `package.json` - Scripts for building and running the app
- `.gitignore` - Files to exclude from git

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `NODE_ENV` | Environment (development/production) | No | development |
| `PORT` | Server port | No | 5000 |

## Project Structure

```
.
├── Fantasy-Sports-Exchange/
│   ├── client/          # React frontend
│   ├── server/          # Express backend
│   ├── shared/          # Shared types and schemas
│   └── vite.config.ts   # Vite build configuration
├── dist/                # Build output (generated)
│   ├── index.cjs        # Bundled server
│   └── public/          # Static client assets
├── package.json         # Dependencies and scripts
├── render.yaml          # Render.com configuration
└── nixpacks.toml        # Railway build configuration
```

## Troubleshooting

### Build Fails

- Check that all environment variables are set correctly
- Review the build logs in your hosting platform dashboard
- Ensure `DATABASE_URL` is provided by the PostgreSQL service
- Verify the build command includes `--legacy-peer-deps`

### Database Connection Errors

- Verify `DATABASE_URL` is correctly formatted
- Ensure the database schema has been pushed with `npm run db:push`
- Check that the PostgreSQL service is running
- For Render: Use the "External Database URL" not the internal one

### App Doesn't Start

- Check the deployment logs in your hosting dashboard
- Verify the `dist/` folder was created during build
- Ensure `NODE_ENV=production` is set
- Check that all required environment variables are set

### Cold Starts (Render Free Tier)

- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Use a monitoring service like UptimeRobot to keep app awake
- Or upgrade to paid tier for always-on service

## License

MIT
