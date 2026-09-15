# Deployment Guide - Vercel

This guide covers deploying the Chronocode Daily application to Vercel.

## Quick Deploy Options

### Option 1: Deploy Button (Fastest - 1 Click)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FZomma2%2FChronocode-Daily&project-name=chronocode-daily&repo-name=Chronocode-Daily)

Click the button above to deploy directly to Vercel!

---

### Option 2: Vercel Dashboard (Recommended)

#### Prerequisites
- Vercel account ([Sign up free](https://vercel.com/signup))
- GitHub account connected to Vercel

#### Steps

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Create New Project**
   - Click **"Add New..."** button
   - Select **"Project"**

3. **Import Repository**
   - Select **"Import Git Repository"**
   - Authorize GitHub (if not already connected)
   - Find `Zomma2/Chronocode-Daily`
   - Click **"Import"**

4. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected ✓)
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build` (auto-detected ✓)
   - **Output Directory**: `.next` (auto-detected ✓)

5. **Add Environment Variables**
   Click **"Environment Variables"** and add:
   
   ```
   DATABASE_URL
   postgresql://username:password@your-db-host:5432/codebits
   
   NEXT_PUBLIC_API_URL
   https://your-app-name.vercel.app
   
   NODE_ENV
   production
   ```

6. **Deploy**
   - Click **"Deploy"** button
   - Wait for build to complete (usually 1-3 minutes)
   - Get your production URL! 🎉

#### Auto-Deployment
After initial deployment, every push to `master` branch will automatically redeploy.

---

### Option 3: Vercel CLI (Advanced)

#### Prerequisites
- Node.js v14+ installed
- Vercel CLI installed

#### Installation & Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Authenticate**
   ```bash
   vercel login
   ```
   - Follow browser prompts
   - Authorize Vercel account

3. **Deploy from Project Directory**
   ```bash
   cd /path/to/codebits
   vercel
   ```

4. **Answer Setup Questions**
   ```
   ? Set up and deploy? [Y/n] → Y
   ? Which scope? → Select your account
   ? Link to existing project? [y/N] → N (for first deploy)
   ? Project name? → chronocode-daily
   ? Directory? → . (current directory)
   ```

5. **Set Environment Variables**
   ```bash
   vercel env add
   ```
   Add the following:
   - `DATABASE_URL` = your database connection string
   - `NEXT_PUBLIC_API_URL` = your Vercel URL

6. **Redeploy with Variables**
   ```bash
   vercel --prod
   ```

#### Useful CLI Commands

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_API_URL

# View deployments
vercel ls

# View deployment logs
vercel logs

# Pull environment from production
vercel env pull

# Remove deployment
vercel remove chronocode-daily
```

---

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string |
| `NEXT_PUBLIC_API_URL` | Yes | `https://app.vercel.app` | Your Vercel app URL |
| `NODE_ENV` | No | `production` | Auto-set to production |

---

## Database Setup on Vercel

### Option A: External PostgreSQL (Recommended)
1. Use PostgreSQL provider (AWS RDS, Railway, Supabase, etc.)
2. Get connection string
3. Add to Vercel environment variables

### Option B: Vercel Postgres (Beta)
1. Link database in Vercel dashboard
2. Connection string auto-generated
3. Add to environment variables

---

## Post-Deployment

### Verify Deployment
1. Go to your Vercel project dashboard
2. Check deployment status
3. Visit your production URL
4. Test key features:
   - Daily challenge loads
   - Tips display correctly
   - API endpoints work

### Monitor Performance
- **Analytics**: Vercel dashboard → Analytics tab
- **Logs**: View real-time logs in dashboard
- **Error Tracking**: Vercel automatically captures errors

### Rollback if Needed
- Vercel dashboard → Deployments tab
- Click previous deployment
- Click "Promote to Production"

---

## Troubleshooting

### Build Fails
**Error**: `npm not found`
- **Solution**: Ensure Node.js 18+ is available; Vercel provides this automatically

**Error**: `DATABASE_URL not set`
- **Solution**: Add `DATABASE_URL` in Environment Variables section

**Error**: `Module not found`
- **Solution**: Ensure all dependencies in `package.json` are listed
  ```bash
  npm install
  npm audit
  ```

### Runtime Errors
**Logs**: Check Vercel dashboard → Deployment → Logs
```bash
# Also locally test before deploying
npm run build
npm run start
```

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check firewall allows Vercel IP addresses
- Test connection locally first

---

## Performance Tips

1. **Image Optimization**: Vercel automatically optimizes images
2. **Caching**: Configure in `vercel.json`:
   ```json
   {
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "max-age=60"
           }
         ]
       }
     ]
   }
   ```

3. **Monitor Build Times**: Vercel dashboard shows build duration
   - Target: < 5 minutes
   - Optimize if longer

---

## Custom Domain

1. **Add Domain** in Vercel dashboard
   - Go to Settings → Domains
   - Add your domain

2. **Configure DNS**
   - Update domain registrar DNS settings
   - Follow Vercel's DNS instructions

3. **SSL Certificate**
   - Vercel auto-provisions Let's Encrypt SSL
   - Free HTTPS enabled automatically

---

## Continuous Deployment

Your repository is now set up for automatic deployments:

```
Push to master branch
        ↓
GitHub webhook triggers Vercel
        ↓
Vercel builds your app
        ↓
Deployed to production (if build succeeds)
```

---

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/learn/basics/deploying-nextjs](https://nextjs.org/learn/basics/deploying-nextjs)
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Report Issues**: [GitHub Issues](https://github.com/Zomma2/Chronocode-Daily/issues)

---

## Next Steps

1. ✅ Deploy using one of the options above
2. ✅ Add your production domain
3. ✅ Set up database connection
4. ✅ Test all features
5. ✅ Monitor performance
6. ✅ Share your deployment! 🚀

---

**Deployment URL**: *Will be provided after deployment*

Questions? Check Vercel docs or open an issue on GitHub.
