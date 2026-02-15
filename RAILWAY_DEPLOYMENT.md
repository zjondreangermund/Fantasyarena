# Railway Deployment Guide

This document provides step-by-step instructions for deploying the Fantasy Arena application to Railway.

## Prerequisites

- A GitHub account with this repository
- A Railway account (sign up at [railway.app](https://railway.app))

## Deployment Steps

### 1. Sign Up / Log In to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Login" and authenticate with your GitHub account

### 2. Create a New Project

1. Click "New Project" on the Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose this repository (Fantasy Arena / Fantasyarena)
4. Railway will automatically detect it as a Node.js application

### 3. Add PostgreSQL Database

1. In your Railway project, click "+ New" 
2. Select "Database"
3. Choose "Add PostgreSQL"
4. Railway will:
   - Provision a PostgreSQL database
   - Automatically set the `DATABASE_URL` environment variable
   - Link it to your application

### 4. Configure Environment Variables (Optional)

Railway automatically configures most variables, but you can verify them:

1. Click on your application service
2. Go to "Variables" tab
3. Verify these are set:
   - `DATABASE_URL` - Should be automatically set by the PostgreSQL service
   - `NODE_ENV` - Set to `production` (optional, Railway may set this automatically)
   - `PORT` - Railway sets this automatically

### 5. Deploy

Railway will automatically:
1. Build your application using the steps defined in `nixpacks.toml`:
   - Install dependencies with `npm install --legacy-peer-deps`
   - Build the client and server with `npm run build`
2. Start your application with `npm start`
3. Assign a public URL (e.g., `your-app.railway.app`)

### 6. Initialize Database Schema

After the first successful deployment:

#### Option A: Use Railway CLI (Recommended)

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Link to your project:
```bash
railway link
```

4. Run the database migration:
```bash
railway run npm run db:push
```

#### Option B: Use Local Connection

1. In Railway dashboard, click on your PostgreSQL service
2. Go to "Connect" tab
3. Copy the connection string (DATABASE_URL)
4. Run locally:
```bash
DATABASE_URL="<your-postgresql-url>" npm run db:push
```

### 7. Access Your Application

1. Go to your Railway project
2. Click on your application service
3. Find the public URL (e.g., `https://your-app.railway.app`)
4. Open it in your browser

## Monitoring and Logs

### View Logs
1. Click on your application service in Railway
2. Go to the "Deployments" tab
3. Click on the latest deployment
4. View real-time logs

### Check Metrics
1. Click on your application service
2. Go to the "Metrics" tab
3. View CPU, Memory, and Network usage

## Updating Your Application

Railway automatically redeploys when you push to GitHub:

1. Make changes to your code locally
2. Commit and push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push
```
3. Railway will automatically detect the changes and redeploy

## Troubleshooting

### Build Fails

**Problem**: Build fails with dependency errors

**Solution**: 
- Check the build logs in Railway
- Verify `nixpacks.toml` includes `--legacy-peer-deps` flag
- Ensure all dependencies are in `package.json`

### Application Crashes on Start

**Problem**: App starts but crashes immediately

**Solutions**:
- Check if `DATABASE_URL` is set (should be automatic with PostgreSQL service)
- Verify the database schema is initialized (run `npm run db:push`)
- Check deployment logs for specific error messages

### Database Connection Errors

**Problem**: Can't connect to database

**Solutions**:
- Ensure PostgreSQL service is running
- Verify `DATABASE_URL` environment variable is set
- Check that the database schema has been pushed
- Try restarting both services in Railway

### Port Binding Errors

**Problem**: Application fails to bind to port

**Solution**:
- Railway automatically sets the `PORT` environment variable
- Ensure your app uses `process.env.PORT` (which it does by default)
- Don't hardcode port numbers

## Cost Information

Railway offers:
- **Free Trial**: $5 credit with no credit card required
- **Hobby Plan**: $5/month for personal projects
- **Pro Plan**: Pay-as-you-go for production applications

Your PostgreSQL database and web application will both consume resources.

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord Community](https://discord.gg/railway)
- [Nixpacks Documentation](https://nixpacks.com/docs)

## Need Help?

If you encounter issues:
1. Check the Railway logs (Deployments → Latest deployment → Logs)
2. Review this guide's Troubleshooting section
3. Consult the [Railway Community](https://discord.gg/railway)
4. Check the application's README.md for more details
