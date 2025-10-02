# Deployment Guide

This Next.js application can be deployed to various platforms. Here are the recommended options:

## Option 1: Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your GitHub repository: `debaditya5/assignment_deba`
5. Vercel will auto-detect it's a Next.js app
6. Click "Deploy" - it will be live in minutes!

## Option 2: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub account
3. Import your repository
4. Set build command: `npm run build`
5. Set publish directory: `.next`

## Option 3: Railway

1. Go to [railway.app](https://railway.app)
2. Connect GitHub and deploy

## Local Testing

Before deploying, you can test the production build locally:

```bash
npm run build
npm run start
```

## Environment Variables

No environment variables are required for this application as it uses mock data.

## Features

- Multi-tenant dashboard
- Real-time data visualization
- CSV export functionality
- PDF download capability
- Responsive design
- Admin mode with tenant switching

