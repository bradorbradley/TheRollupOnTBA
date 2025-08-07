# TBPN on TBA

A Next.js application for the Technology's daily show with John Coogan and Jordi Hays, featuring live streaming on TBA Monday through Friday. This application can be easily customized for your own live streaming show with YouTube integration and sponsor widgets.

## Features

- **Live Video Streaming**: Embedded YouTube live streams with automatic video loading
- **Live Status Indicators**: Real-time status showing when the show is live (customizable schedule)
- **Sponsor Integration**: Interactive sponsor buttons with Farcaster SDK integration
- **Marquee Banner**: Scrolling international text banner
- **Mobile Responsive**: Optimized for both desktop and mobile viewing
- **Farcaster Integration**: Native Farcaster mini-app with token and profile viewing
- **Automated Notifications**: Cron-based live notifications via Neynar API

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Farcaster SDK** for blockchain interactions
- **Vercel Analytics** for tracking
- **Vercel Cron** for scheduled notifications
- **Neynar API** for Farcaster notifications

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- A GitHub account (for deployment)
- Vercel account (for hosting and cron jobs)
- Neynar API key (for Farcaster notifications)

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-username/tbpnOnTba.git
cd tbpnOnTba

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Required for Farcaster notifications
NEYNAR_API_KEY=your_neynar_api_key_here

# Required for cron job security
CRON_SECRET=your_secure_random_string_here
```

**Getting your Neynar API Key:**
1. Visit [Neynar Developer Portal](https://neynar.com/)
2. Sign up for a developer account
3. Create a new app and get your API key
4. Add it to your `.env.local` file

### 3. Set Up Your Farcaster Mini App Manifest

**This step is REQUIRED to make your app work as a Farcaster Mini App:**

1. **Create the manifest file** at `public/.well-known/farcaster.json`:
```json
{
  "accountAssociation": {
    "header": "YOUR_SIGNED_HEADER",
    "payload": "YOUR_SIGNED_PAYLOAD", 
    "signature": "YOUR_SIGNATURE"
  },
  "frame": {
    "version": "1",
    "name": "Your Show Name",
    "iconUrl": "https://your-domain.com/icon.png",
    "homeUrl": "https://your-domain.com",
    "imageUrl": "https://your-domain.com/og.png",
    "buttonTitle": "Watch Live",
    "splashImageUrl": "https://your-domain.com/splash.png",
    "splashBackgroundColor": "#1E51F5"
  }
}
```

2. **Get your domain signature** (REQUIRED):
   - Deploy your app to your production domain first
   - Visit: `https://farcaster.xyz/~/developers/mini-apps/manifest?domain=your-domain.com`
   - Sign the manifest with your Farcaster account
   - Copy the signed `accountAssociation` data into your manifest

3. **Configure your server** to serve the manifest:
   - **Next.js**: The file in `public/.well-known/` will be automatically served
   - **Vercel**: May need to add a redirect in `vercel.json` if needed:
   ```json
   {
     "redirects": [
       {
         "source": "/.well-known/farcaster.json",
         "destination": "/api/manifest",
         "permanent": false
       }
     ]
   }
   ```

4. **Test your manifest**:
```bash
curl -s https://your-domain.com/.well-known/farcaster.json
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application running.

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── cron-notify/     # Cron job for notifications
│   │   └── notify-status/   # Manual notification endpoint
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main page component
├── components/              # React components
│   ├── Disclaimer.tsx       # TAPWATER disclaimer
│   ├── LiveStatus.tsx       # Live/offline indicators
│   ├── LogoSection.tsx      # Logo with effects
│   ├── MarqueeBanner.tsx    # Scrolling banner
│   ├── SponsorSection.tsx   # Sponsor buttons
│   └── VideoSection.tsx     # Video player embed
├── public/                  # Static assets
└── tailwind.config.ts       # Tailwind configuration
```

## 🎯 **Want to Fork This for Your Own Show?**

> **⭐ For the complete step-by-step guide to customize this for your own livestream show, see [CLAUDE.md](./CLAUDE.md)**
> 
> **📋 Key things you'll need to change:**
> - [ ] YouTube video integration for your channel
> - [ ] **Farcaster Mini App manifest** (REQUIRED - see [CLAUDE.md](./CLAUDE.md))
> - [ ] Your branding (logo, colors, show name)
> - [ ] Live schedule for your show times
> - [ ] Sponsor/widget section
> - [ ] Domain signature (CRITICAL for Farcaster Mini App)

## 🎨 Quick Customization Guide

#### 1. **YouTube Video Integration**

The app fetches live video IDs from an external API. To customize this for your own YouTube channel:

**Option A: Use a static video ID**
Edit `components/VideoSection.tsx`:

```typescript
// Replace the API call with your video ID
async function checkLive() {
  try {
    // Replace with your YouTube video ID
    const videoId = "YOUR_YOUTUBE_VIDEO_ID" 
    embedVideo(videoId)
  } catch (e) {
    console.error('Failed to load video:', e)
    handleError()
  }
}
```

**Option B: Create your own API endpoint**
1. Create your own API that returns `{ videoId: "your_video_id" }`
2. Replace the API URL in `VideoSection.tsx`:
```typescript
const liveRes = await fetch('YOUR_API_ENDPOINT/getCurrentVideo')
```

**Option C: YouTube Live Stream Detection**
For automatic live stream detection, you'll need:
1. YouTube Data API v3 key
2. Your channel ID
3. An API endpoint that checks for live streams

#### 2. **Live Schedule Configuration**

Update the live schedule in `components/LiveStatus.tsx`:

```typescript
// Customize these values for your schedule
const liveStartHour = 11  // Start hour (24-hour format)
const liveEndHour = 14    // End hour (24-hour format)

// Customize days (1 = Monday, 7 = Sunday)
const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5 // Mon-Fri
// For weekends only: dayOfWeek === 0 || dayOfWeek === 6
// For specific days: [1, 3, 5].includes(dayOfWeek) // Mon, Wed, Fri
```

#### 3. **Branding and Styling**

**Logo and Images:**
1. Replace images in the `public/` folder with your own:
   - `logo.svg` - Main logo
   - `og.png` - Social media preview
   - `fav-small.png` & `fav-large.png` - Favicons
   - `splash.png` - App splash screen

**Colors and Fonts:**
Edit `tailwind.config.ts` and `app/globals.css`:

```typescript
// tailwind.config.ts
colors: {
  'brand-green': '#your-color',
  'brand-red': '#your-color',
  'brand-purple': '#your-color',
  // ... add your brand colors
}
```

**Marquee Banner Text:**
Update `components/MarqueeBanner.tsx`:
```typescript
const bannerText = "YOUR SHOW NAME - Add your international text here"
```

#### 4. **Sponsor/Widget Section**

Customize `components/SponsorSection.tsx`:

**Add your own sponsors:**
```typescript
<SponsorLink 
  href="#" 
  token="your_token_address" // For Farcaster tokens
  // OR
  fid={123} // For Farcaster profiles
>
  <Image 
    src="/your-sponsor-image.png" 
    alt="sponsor name" 
    width={200}
    height={100}
    className="w-full h-auto rounded-lg bg-[#your-bg-color]"
  />
</SponsorLink>
```

**Remove Farcaster integration** (if not needed):
```typescript
// Simple link version
<a href="https://your-sponsor-site.com" target="_blank" rel="noopener noreferrer">
  <Image src="/sponsor.png" alt="Sponsor" width={200} height={100} />
</a>
```

#### 5. **Farcaster Mini App Manifest**

**CRITICAL**: Update your manifest file at `public/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "YOUR_SIGNED_HEADER_FROM_FARCASTER_TOOL",
    "payload": "YOUR_SIGNED_PAYLOAD_FROM_FARCASTER_TOOL", 
    "signature": "YOUR_SIGNATURE_FROM_FARCASTER_TOOL"
  },
  "frame": {
    "version": "1",
    "name": "Your Show Name",
    "iconUrl": "https://your-domain.com/icon.png",
    "homeUrl": "https://your-domain.com",
    "imageUrl": "https://your-domain.com/og.png",
    "buttonTitle": "Watch Your Show",
    "splashImageUrl": "https://your-domain.com/splash.png",
    "splashBackgroundColor": "#your-brand-color"
  }
}
```

**Steps to set up:**
1. Deploy your app to production domain
2. Visit: `https://farcaster.xyz/~/developers/mini-apps/manifest?domain=your-domain.com`
3. Sign with your Farcaster account
4. Copy the `accountAssociation` data to your manifest
5. Test: `curl https://your-domain.com/.well-known/farcaster.json`

#### 6. **Metadata and SEO**

Update `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'Your Show Name',
  description: 'Your show description',
  keywords: 'your, keywords, here',
  openGraph: {
    title: 'Your Show Name',
    description: 'Your show description',
    url: 'https://your-domain.com',
    images: [{ url: 'https://your-domain.com/og.png' }],
  },
  // ADD THIS for Mini App embed support
  other: {
    'fc:miniapp': JSON.stringify({
      version: "1",
      imageUrl: "https://your-domain.com/og.png",
      button: {
        title: "Watch Live",
        action: {
          type: "launch_frame",
          name: "Your Show Name",
          url: "https://your-domain.com",
          splashImageUrl: "https://your-domain.com/splash.png",
          splashBackgroundColor: "#your-brand-color"
        }
      }
    })
  }
}
```

#### 7. **Notifications (Optional)**

To set up live notifications:

1. **Configure Vercel Cron:**
   Create `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron-notify",
       "schedule": "0 11 * * 1-5"
     }]
   }
   ```

2. **Update notification content** in `app/api/cron-notify/route.ts`:
   ```typescript
   notification: {
     title: 'Your Show is Live',
     body: 'Your hosts are streaming now',
     target_url: 'https://your-domain.com',
   }
   ```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard:
     - `NEYNAR_API_KEY`
     - `CRON_SECRET`

3. **Set up custom domain** (optional):
   - In Vercel dashboard, go to Settings > Domains
   - Add your custom domain

### Alternative Deployment Options

- **Netlify**: Works but cron jobs require paid plan
- **Railway**: Good for full-stack apps
- **DigitalOcean App Platform**: Reliable alternative

## 📱 API Endpoints

- `POST /api/cron-notify` - Triggered by Vercel Cron for live notifications
- `POST /api/notify-status` - Manual notification sending

### Manual Notification Example

```bash
curl -X POST https://your-domain.com/api/notify-status \
  -H "Content-Type: application/json" \
  -d '{
    "target_fids": ["all"],
    "title": "Show is Live!",
    "body": "Join us now",
    "target_url": "https://your-domain.com"
  }'
```

## 🔧 Advanced Configuration

### Custom Video API

Create your own video API endpoint:

```typescript
// pages/api/getCurrentVideo.ts (if using Pages Router)
// or app/api/getCurrentVideo/route.ts (App Router)

export async function GET() {
  // Your logic to determine current video
  const videoId = await getYourVideoId()
  return Response.json({ videoId })
}
```

### Analytics Integration

The app includes Vercel Analytics. To add Google Analytics:

1. Install: `npm install @next/third-parties`
2. Add to `app/layout.tsx`:
```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

// Add before closing </body> tag
<GoogleAnalytics gaId="GA_MEASUREMENT_ID" />
```

### Environment Variables Reference

```bash
# Required
NEYNAR_API_KEY=neynar_api_key_here
CRON_SECRET=random_secure_string

# Optional
NEXT_PUBLIC_GA_ID=google_analytics_id
```

## 🚨 Farcaster Mini App Troubleshooting

### **Common Issues & Solutions**

#### **Mini App Not Loading / Infinite Splash Screen**
```bash
# Check if sdk.actions.ready() is called
# Add this to your main component:
await sdk.actions.ready()
```

#### **Manifest Not Found (404)**
```bash
# Test your manifest
curl -s https://your-domain.com/.well-known/farcaster.json

# Should return JSON, not 404
# If 404: Check file exists at public/.well-known/farcaster.json
```

#### **Domain Signature Invalid**
- Domain in manifest MUST match hosting domain exactly
- Include subdomains: `www.example.com` ≠ `example.com`
- Re-sign at: `https://farcaster.xyz/~/developers/mini-apps/manifest?domain=your-exact-domain.com`

#### **Embed Not Showing in Farcaster**
```bash
# Check for fc:miniapp meta tag
curl -s https://your-domain.com | grep "fc:miniapp"

# Should show: <meta name="fc:miniapp" content='{"version":"1",...}' />
```

#### **Test Your Mini App**
Use the official preview tool:
```
https://farcaster.xyz/~/developers/mini-apps/preview?url=https%3A%2F%2Fyour-domain.com
```

### **Manifest Validation Checklist**

Based on the [Farcaster Mini Apps specification](https://miniapps.farcaster.xyz/docs/specification):

- [ ] Manifest accessible at `/.well-known/farcaster.json`
- [ ] `version` is `"1"` (not `"next"`)
- [ ] `imageUrl` is 3:2 aspect ratio
- [ ] `buttonTitle` is ≤ 32 characters
- [ ] `splashImageUrl` is 200x200px
- [ ] Domain signature matches hosting domain exactly
- [ ] All URLs return HTTP 200
- [ ] `fc:miniapp` meta tag present in HTML

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Architecture

- **App Router**: Uses Next.js 13+ App Router
- **Client Components**: Interactive components use 'use client'
- **Server Components**: Static components render on server
- **API Routes**: Handle backend logic and external API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📝 License

[Add your license here]