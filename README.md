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

## Deploying to Railway

### Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

### Manual Setup

1. **Create a new project on Railway**
   - Go to [railway.app](https://railway.app) and sign in
   - Click "New Project"
   - Select "Deploy from GitHub repo" and choose this repository

2. **Add PostgreSQL Database**
   - In your Railway project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically provision a database and set the `DATABASE_URL` environment variable

3. **Configure Environment Variables**
   Railway will automatically detect most settings from `nixpacks.toml`, but you can verify/add these variables in the Railway dashboard:
   
   - `DATABASE_URL` - Automatically set by Railway when you add PostgreSQL
   - `NODE_ENV` - Set to `production`
   - `PORT` - Railway automatically sets this (usually 3000 or dynamic)

4. **Deploy**
   - Railway will automatically build and deploy your application
   - The build process runs `npm run build` as defined in `nixpacks.toml`
   - The app starts with `npm start`

5. **Push Database Schema**
   After the first deployment, you need to initialize the database schema:
   - Go to your Railway project
   - Click on your service → "Settings" → "Service Variables"
   - Copy the `DATABASE_URL` value
   - Run locally:
   ```bash
   DATABASE_URL="<your-railway-db-url>" npm run db:push
   ```
   
   Alternatively, you can run it in Railway's CLI or add it as a one-time deployment step.

### Configuration Files

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
└── nixpacks.toml        # Railway build configuration
```

## Troubleshooting

### Build Fails on Railway

- Check that all environment variables are set correctly
- Review the build logs in Railway dashboard
- Ensure `DATABASE_URL` is provided by the PostgreSQL service

### Database Connection Errors

- Verify `DATABASE_URL` is correctly formatted
- Ensure the database schema has been pushed with `npm run db:push`
- Check that the PostgreSQL service is running in Railway

### App Doesn't Start

- Check the Railway deployment logs
- Verify the `dist/` folder was created during build
- Ensure `NODE_ENV=production` is set

## License

MIT
