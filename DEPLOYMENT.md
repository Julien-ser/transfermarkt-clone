# Deployment Guide

This guide covers deploying the Transfermarkt Clone to production environments.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
  - [Option 1: Vercel + Railway (Recommended)](#option-1-vercel--railway-recommended)
  - [Option 2: Vercel + Render](#option-2-vercel--render)
  - [Option 3: Docker + Any Cloud Provider](#option-3-docker--any-cloud-provider)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

The application consists of three main components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Express.js    │    │   PostgreSQL   │
│   Frontend      │◄──►│   Backend API   │◄──►│   Database     │
│   (apps/web)    │    │   (apps/api)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway/      │    │   Managed DB   │
│   Deployment    │    │   Render        │    │   Service      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   CDN + Edge    │    │   Redis Cache  │
│   Caching       │    │   (Optional)   │
└─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js with TypeScript, Prisma ORM
- **Database**: PostgreSQL 16+
- **Cache**: Redis (optional but recommended)
- **Auth**: NextAuth.js with JWT sessions
- **Analytics**: Simple Analytics, Sentry

## Prerequisites

Before deployment, ensure:

1. **Git repository** initialized and pushed to GitHub
2. **Domain name** (optional but recommended)
3. **Accounts** on:
   - [Vercel](https://vercel.com) (for frontend)
   - [Railway](https://railway.app) or [Render](https://render.com) (for backend)
   - [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app) (for PostgreSQL)
4. **SSL certificates** (usually handled automatically by platforms)
5. **Node.js** 18+ and **pnpm** installed locally for building

## Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Step 1: Set Up Managed PostgreSQL Database

**Using Supabase (Recommended):**

1. Create a Supabase project at https://supabase.com
2. Go to **Database** → **Connection Pooling**
3. Copy the **Connection URI** (format: `postgresql://postgres:password@hostname:port/dbname?pgbouncer=true`)
4. Alternatively, use **Connection String** from **Settings** → **Database**

**Using Neon:**

1. Create a Neon project at https://neon.tech
2. Copy the connection string from **Connection Details**
3. Format: `postgresql://username:password@hostname/neondb?sslmode=require`

**Using Railway:**

1. Create a new PostgreSQL plugin in your Railway project
2. Copy the connection string from **Variables** tab
3. It will look like: `postgresql://postgres:password@railway.railway.app:5432/railway?sslmode=require`

#### Step 2: Set Up Redis (Optional but Recommended)

**Using Upstash (Recommended for serverless):**

1. Create an Upstash account at https://upstash.com
2. Create a new Redis database
3. Copy the Redis URL: `rediss://username:password@hostname:port`
4. Note: Upstash provides a free tier with 10K commands/day

**Using Railway:**

1. Add Redis plugin to your Railway project
2. Copy the connection string from **Variables**

**Using Render:**

1. Add a Redis service to your Render account
2. Copy the internal URL (format: `redis://redis-service-name:6379`)

#### Step 3: Deploy Backend to Railway

1. **Create a new project** on Railway:
   - Connect your GitHub repository
   - Select the `apps/api` folder as the source
   - Choose **Node.js** as the runtime

2. **Configure environment variables** in Railway dashboard:
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<your-postgres-connection-string>
   REDIS_URL=<your-redis-url>  # Optional
   ```

3. **Configure build & start commands**:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

4. **Set health check**:
   - Path: `/health`
   - Port: 3001

5. **Deploy** the service
   - Railway will automatically build and deploy
   - Note the deployed URL (e.g., `https://your-backend.up.railway.app`)

6. **Run database migrations**:
   ```bash
   # In Railway console or locally with production DATABASE_URL
   npx prisma migrate deploy
   npx prisma db seed
   ```

#### Step 4: Deploy Frontend to Vercel

1. **Import project** from GitHub at https://vercel.com/import
   - Select your repository
   - Vercel will auto-detect Next.js

2. **Configure build settings**:
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (auto-detected)

3. **Set environment variables** in Vercel dashboard:
   ```env
   NODE_ENV=production
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=<generate-secure-random-string>
   DATABASE_URL=<same-as-backend>
   REDIS_URL=<same-as-backend>
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_SIMPLE_ANALYTICS_DOMAIN=<your-domain.simpleanalytics.com>  # Optional
   NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>  # Optional
   SENTRY_ENABLED=true
   CRON_SECRET_TOKEN=<generate-secure-random-string>
   MARKET_VALUE_UPDATE_SCHEDULE=0 2 * * *
   ```

4. **Configure NextAuth**:
   - Vercel automatically sets `NEXTAUTH_URL` to your deployment URL
   - Ensure `NEXTAUTH_SECRET` is at least 32 characters

5. **Deploy** the project
   - Vercel will build and deploy automatically
   - Note the deployment URL (e.g., `https://your-project.vercel.app`)

6. **Custom Domain** (Optional):
   - Go to **Domains** in Vercel dashboard
   - Add your custom domain
   - Follow DNS configuration instructions

#### Step 5: Configure Production Settings

1. **Update API endpoints in frontend**:
   
   The frontend needs to know the backend URL. Create a `.env.production` file:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
   ```

   Then update any API calls to use this base URL. In `apps/web/lib/api.ts` or similar:
   ```typescript
   const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
   ```

2. **Update database connection pool** for production:
   
   In `.env`:
   ```env
   DATABASE_URL="postgresql://...?connection_limit=20&pool_timeout=5"
   ```

3. **Enable Sentry** (Optional):
   - Update `SENTRY_ENABLED=true`
   - Create a Sentry project and add DSN to environment variables
   - Build with Sentry: `vercel --prod` will automatically include Sentry

4. **Set up Simple Analytics** (Optional):
   - Sign up at https://simpleanalytics.com
   - Add your domain to `.env`: `NEXT_PUBLIC_SIMPLE_ANALYTICS_DOMAIN=yourdomain.com`

5. **Configure CORS** in backend:
   
   Update `apps/api/src/index.ts` to allow your frontend domain:
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'https://your-domain.vercel.app',
     credentials: true
   }));
   ```

#### Step 6: Verify Deployment

1. **Test frontend**: Visit your Vercel URL
2. **Test API**: Visit `https://your-backend/health`
3. **Test database connection**:
   - Try to view a player profile
   - Check logs in Railway dashboard for errors
4. **Check Redis** (if configured):
   - Monitor cache hit rates
   - Test with Redis CLI: `redis-cli ping`

#### Step 7: Set Up Cron Jobs (Production)

The market value update cron job needs to run in production. Options:

**Option A: Railway Cron Jobs** (if using Railway)

Railway doesn't have built-in cron, but you can:
- Use a separate worker service
- Or trigger the admin API endpoint externally

**Option B: Render Cron Jobs** (if using Render)

Add a **Cron Job** service in Render:
- Schedule: `0 2 * * *` (daily at 2 AM UTC)
- Command: `curl -X POST https://your-backend.onrender.com/api/admin/market-values/update -H "Authorization: Bearer YOUR_TOKEN"`
- Or use the standalone cron runner as a separate service

**Option C: External Scheduler**

Use a service like:
- [Cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- GitHub Actions scheduled workflow

Example GitHub Action:
```yaml
name: Update Market Values
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger update
        run: |
          curl -X POST https://your-backend/api/admin/market-values/update \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Option 2: Vercel + Render

Render is similar to Railway but with better cron support:

1. **Deploy backend to Render**:
   - Create a **Web Service** for the API
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Environment variables same as Railway

2. **Add a Cron Job** in Render:
   - Create a **Cron Job** service
   - Schedule: `0 2 * * *`
   - Command: `curl -X POST https://your-backend.onrender.com/api/admin/market-values/update -H "Authorization: Bearer YOUR_CRON_TOKEN"`
   - Or: `node scripts/cron-runner.js` as a separate service

3. **Deploy frontend to Vercel**:
   - Same as Step 4 above

### Option 3: Docker + Any Cloud Provider

Use the provided Dockerfiles for deployment on any platform that supports Docker.

#### Local Testing with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Run migrations
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npx prisma db seed

# Stop services
docker-compose down
```

#### Deploy to DigitalOcean/EC2/Azure/AWS

1. **Build and push images**:
   ```bash
   # Build images
   docker build -f Dockerfile.api -t yourusername/transfermarkt-api:latest .
   docker build -f Dockerfile.web -t yourusername/transfermarkt-web:latest .

   # Push to Docker Hub
   docker push yourusername/transfermarkt-api:latest
   docker push yourusername/transfermarkt-web:latest
   ```

2. **Deploy on target platform**:
   - Pull the images
   - Set environment variables
   - Link services together
   - Configure networking

#### Deploy to Kubernetes

```yaml
# Example k8s deployment files
api-deployment.yaml
api-service.yaml
web-deployment.yaml
web-service.yaml
postgres-statefulset.yaml
redis-deployment.yaml
```

See `k8s/` directory for complete manifests (if created).

## Database Setup

### Initial Migration

After deploying your database service, run migrations:

```bash
# Set DATABASE_URL in environment
export DATABASE_URL="your-production-database-url"

# Deploy migrations
npx prisma migrate deploy

# Seed sample data (optional for production)
npx prisma db seed
```

### Database Backups

**Supabase**: Automatic daily backups, manual exports available

**Neon**: Automatic backups with point-in-time recovery

**Railway**: Automatic daily backups, manual snapshots available

**Recommendation**: Set up automated daily backups and test restore procedures monthly.

### Connection Pooling

For production, configure connection pooling:

```env
# For Prisma
DATABASE_URL="postgresql://user:pass@host:port/db?connection_limit=20&pool_timeout=5"

# For PgBouncer (Supabase default)
DATABASE_URL="postgresql://user:pass@host:port/db?pgbouncer=true"
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Session encryption key (min 32 chars) | Random hex string |
| `NEXTAUTH_URL` | Full frontend URL | `https://your-domain.vercel.app` |
| `REDIS_URL` | Redis connection (optional) | `redis://host:6379` |
| `CRON_SECRET_TOKEN` | Auth token for cron updates | Random hex string |

### Frontend-Specific

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_APP_NAME` | Application name |
| `NEXT_PUBLIC_APP_URL` | Frontend URL |
| `NEXT_PUBLIC_SIMPLE_ANALYTICS_DOMAIN` | Simple Analytics domain |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry client DSN |

### Backend-Specific

| Variable | Description |
|----------|-------------|
| `PORT` | Port to listen on (default: 3001) |
| `NODE_ENV` | `production` |
| `SENTRY_ENABLED` | Enable Sentry (`true`/`false`) |
| `SENTRY_ORG` | Sentry organization slug |
| `SENTRY_PROJECT` | Sentry project name |
| `MARKET_VALUE_UPDATE_SCHEDULE` | Cron schedule (default: `0 2 * * *`) |

### Generating Secure Secrets

```bash
# Generate random 32-character hex string
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Post-Deployment

### 1. Verify Health Checks

- Frontend: `https://your-domain.com/api/health` (if health endpoint exists)
- Backend: `https://your-backend.com/health`
- Database: Ensure connection is successful

### 2. Test Core Features

- [ ] Homepage loads with featured leagues
- [ ] Player profiles display correctly
- [ ] Team pages show squad information
- [ ] League standings table works
- [ ] Transfer history filters work
- [ ] Search functionality works
- [ ] Authentication (login/register) works
- [ ] Watchlist feature works (if logged in)

### 3. Configure Monitoring

**Sentry**:
- Install Sentry browser extension
- Trigger test error: `Sentry.captureMessage('Test message')`
- Verify it appears in Sentry dashboard

**Simple Analytics**:
- Check real-time dashboard for page views
- Test custom events with `useAnalytics` hook

**Custom Monitoring**:
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure alerts for 5xx errors
- Monitor database connection pool

### 4. Set Up CI/CD

**Vercel**: Automatic on git push to main

**Railway**: Automatic on git push to main branch

**Render**: Automatic on git push to selected branch

### 5. Enable Custom Domain

1. **Vercel** → Project → Settings → Domains → Add Domain
2. Update DNS (CNAME or A records)
3. Wait for SSL certificate issuance (automatic)
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to use custom domain

### 6. Performance Optimization

1. **Enable Redis caching** if not already:
   - Update `REDIS_URL` environment variable
   - Restart services
   - Monitor cache hit rates

2. **Compress images**:
   - Next.js Image component already optimizes
   - Ensure Cloudinary/Uploadcare configured if using external images

3. **Bundle analysis**:
   ```bash
   cd apps/web
   npm run analyze
   ```
   Check bundle sizes and optimize if needed.

4. **Enable HTTP/2 and Brotli** (usually automatic on Vercel/Railway)

## Monitoring & Maintenance

### Health Monitoring

All services expose health endpoints:

- Backend: `GET /health`
- Frontend: `GET /api/health` (if added)

### Log Aggregation

**Vercel**: Built-in logs in dashboard
**Railway**: Built-in logs with search
**Render**: Built-in logs with filters

### Database Maintenance

- **Monitor disk space**: Set alerts at 80% capacity
- **Regular backups**: Verify daily backups are running
- **Connection pool**: Monitor active connections, adjust limits if needed
- **Query performance**: Use `EXPLAIN ANALYZE` for slow queries
- **Vacuum and analyze**: PostgreSQL auto-vacuum should be sufficient

### Redis Maintenance

If using Redis:
- Monitor memory usage
- Set up persistence (AOF or RDB)
- Consider clustering for high availability
- Monitor command latency

### Security Checklist

- [ ] SSL/TLS enabled (automatic on most platforms)
- [ ] Environment variables secured (not exposed to client)
- [ ] Strong passwords for database
- [ ] Rate limiting enabled on API (consider adding)
- [ ] CORS configured correctly
- [ ] Helmet.js headers enabled (already in Express)
- [ ] Regular dependency updates (`npm audit`, `dependabot`)
- [ ] Secrets rotated periodically
- [ ] Admin endpoints protected (if any)

## Troubleshooting

### Build Failures

**Vercel**: Check build logs for missing dependencies
- Ensure all packages are in `apps/web/package.json`
- Check for native modules (may need recompilation)

**Railway/Render**:
- Verify build command is correct
- Check Node.js version (should be 18+)
- Ensure `npm run build` succeeds locally first

### Database Connection Issues

**Error**: "Connection refused" or "timeout"

1. Verify `DATABASE_URL` is correct
2. Check database service is running
3. Ensure firewall allows connections (if external)
4. For serverless (Vercel), use connection pooler like PgBouncer

**Error**: "Too many connections"

1. Increase database `max_connections`
2. Enable connection pooling (PgBouncer or built-in)
3. Reduce connection limit in Prisma: `?connection_limit=10`

### Redis Connection Issues

**Error**: "Could not connect to Redis"

1. Verify `REDIS_URL` is correct
2. Check Redis service is running
3. Ensure firewall allows connections (if external)
4. For serverless, consider using Upstash which provides HTTP-based Redis

### Authentication Issues

**Error**: "NEXTAUTH_SECRET must be at least 32 characters"

1. Generate a proper secret using `openssl rand -hex 32`
2. Update environment variable

**Error**: "Invalid callback URL"

1. Ensure `NEXTAUTH_URL` matches exactly your frontend URL
2. Include protocol (https://)
3. No trailing slash

### API Not Found (404)

1. Check backend service is running and healthy
2. Verify `NEXT_PUBLIC_API_URL` is set correctly in frontend
3. Check CORS configuration allows your frontend domain
4. Verify routes are registered correctly

### Cron Job Not Running

1. Check cron schedule format: `* * * * *` (minute hour day month weekday)
2. Verify external scheduler is configured correctly
3. Check `CRON_SECRET_TOKEN` matches
4. Review logs for authentication failures
5. Test manually: `curl -X POST https://your-backend/api/admin/market-values/update -H "Authorization: Bearer YOUR_TOKEN"`

### Static Assets Not Loading

1. Check `next.config.js` image domains
2. Ensure `output: 'standalone'` is set (it is)
3. For external images, add domains to `images.domains`
4. Check Vercel asset limits (100GB bandwidth/month on free tier)

### Slow Performance

1. **Monitor Redis cache hit rate**:
   ```bash
   redis-cli info stats | grep keyspace_hits
   ```
   Aim for >80% hit rate

2. **Check database slow queries**:
   ```sql
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   ORDER BY total_time DESC
   LIMIT 10;
   ```

3. **Optimize images**: Ensure WebP/AVIF formats are being served

4. **Bundle size**: Run `npm run analyze` and check for large dependencies

### Infinite Loops in Components

Common when using `useEffect` without proper dependencies.

1. Check browser console for warnings
2. Add proper dependency arrays to `useEffect` and `useCallback`
3. Ensure fetch functions are memoized or defined outside render

### Memory Leaks

1. Use React DevTools Profiler to identify re-renders
2. Check for missing cleanup in `useEffect`
3. Monitor memory usage in production logs

## Scaling Considerations

### Horizontal Scaling

- **Frontend (Vercel)**: Automatic scaling, no action needed
- **Backend**: Add more instances on Railway/Render
  - Railway: Scale replicas in project settings
  - Render: Create multiple instances with load balancer

### Database Scaling

- Use read replicas for heavy read workloads
- Enable connection pooling (PgBouncer)
- Consider sharding for very large datasets (>1TB)

### Cache Scaling

- Redis cluster for >50GB datasets
- Use Redis Sentinel or Redis Cloud for high availability

### CDN

Vercel provides global CDN automatically. For additional optimization:
- Use Cloudflare in front of backend API
- Cache static assets aggressively

## Zero-Downtime Deployments

### Vercel

Automatic zero-downtime deployments with Preview Deployments.

### Railway/Render

- Railway: Zero-downtime by default with rolling updates
- Render: Zero-downtime with blue-green deployments

### Database Migrations

Use Prisma migrate deploy carefully:

```bash
# Always test migrations on staging first
npx prisma migrate dev --name your_migration  # Dev/staging
npx prisma migrate deploy                      # Production
```

For zero-downtime:
1. Additive changes (new tables/columns): Safe
2. Renaming columns: Use `rename` in migration
3. Removing columns: Two-step process (add new, migrate data, drop old)

## Rollbacks

### Vercel

1. Go to Deployments
2. Click "..." on previous deployment
3. Select "Promote to Production"

### Railway

1. Go to project → Deployments
2. Click "..." on previous deployment
3. Select "Rollback"

### Render

1. Go to service → Manual Deploy
2. Select "Deploy a specific commit"
3. Choose previous commit

## Cost Optimization

### Vercel

- Hobby plan (free) sufficient for low traffic
- Pro plan ($20/mo) for higher limits and analytics
- Monitor bandwidth: 100GB free, $40/TB after
- Monitor build minutes: 6,000 free, $40/mo for unlimited

### Railway

- Pay-as-you-go: ~$5-20/mo for small apps
- $5/month credit for new users
- Monitor instance hours and data transfer

### Render

- Free tier: 750 hours/month (1 instance)
- $7/month for always-on instance
- Free PostgreSQL: 1GB storage
- Monitor egress bandwidth: $0.12/GB after free tier

### Database Costs

- Supabase: Free tier (500MB), $25/mo for 8GB
- Neon: Free tier (10GB), $19/mo for 50GB
- Railway PostgreSQL: $5-20/mo depending on size

### Redis Costs

- Upstash: Free tier (10K commands/day), $0.20/10K extra
- Railway: Free tier (shared), $5/mo for dedicated
- Redis Cloud: $5-18/mo depending on size

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Prisma Migration**: https://www.prisma.io/docs/orm/prisma-migrate
- **NextAuth.js**: https://next-auth.js.org/docs

## Appendix: Quick Reference

### Heroku-Style One-Command Deploy (Conceptual)

If you want a single command for deployment, create a script:

```bash
#!/bin/bash
# deploy.sh

set -e

echo "Building and pushing Docker images..."
docker build -f Dockerfile.api -t $DOCKER_USERNAME/transfermarkt-api:latest .
docker build -f Dockerfile.web -t $DOCKER_USERNAME/transfermarkt-web:latest .
docker push $DOCKER_USERNAME/transfermarkt-api:latest
docker push $DOCKER_USERNAME/transfermarkt-web:latest

echo "Triggering Railway deployment..."
# Use Railway CLI or API to trigger redeploy

echo "Deployment complete!"
```

### Environment Variable Checklist

Create a `.env.production` file with all required variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="..."

# Redis
REDIS_URL="redis://..."

# API
NEXT_PUBLIC_API_URL="https://your-backend.railway.app"

# App
NEXT_PUBLIC_APP_NAME="Transfermarkt Clone"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

# Analytics
NEXT_PUBLIC_SIMPLE_ANALYTICS_DOMAIN="yourdomain.com"
NEXT_PUBLIC_SENTRY_DSN="..."
SENTRY_ENABLED="true"
SENTRY_ORG="..."
SENTRY_PROJECT="transfermarkt-clone"
SENTRY_AUTH_TOKEN="..."

# Cron
CRON_SECRET_TOKEN="..."
MARKET_VALUE_UPDATE_SCHEDULE="0 2 * * *"
```

⚠️ **Never commit `.env` files to version control!**

### Production Checklist

Before going live:

- [ ] SSL certificates configured (usually automatic)
- [ ] Environment variables set in all services
- [ ] Database migrations applied
- [ ] Sample data seeded (if desired)
- [ ] All domains in CORS configuration
- [ ] Rate limiting enabled (consider adding)
- [ ] Monitoring (Sentry, analytics) configured
- [ ] Custom domain DNS configured
- [ ] Health checks passing
- [ ] All critical features tested
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Team trained on deployment process
- [ ] Incident response plan created

---

**Need help?** Check the troubleshooting section or open an issue on GitHub.
