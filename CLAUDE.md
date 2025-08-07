# 🎯 Complete Guide: Fork This for Your Own Live Stream Show

> **This is the comprehensive guide for customizing this TBPN on TBA app for your own live streaming show. Follow these steps to create your own branded Farcaster Mini App.**

## 📋 What You'll Need

- [ ] Your own domain name (required for Farcaster Mini App)
- [ ] YouTube channel or video IDs for your streams
- [ ] Farcaster account (for signing the manifest)
- [ ] Neynar API key (for notifications)
- [ ] Your show's branding assets (logo, colors, images)

## 🚀 Step-by-Step Setup

### 1. **Clone and Initial Setup**

```bash
# Fork the repository on GitHub first, then clone YOUR fork
git clone https://github.com/YOUR-USERNAME/tbpnOnTba.git
cd tbpnOnTba

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 2. **Configure Environment Variables**

Edit `.env.local`:

```bash
# Get from https://neynar.com/
NEYNAR_API_KEY=your_neynar_api_key_here

# Generate a random secure string
CRON_SECRET=your_secure_random_string_here
```

### 3. **🔧 Customize Your Show**

#### **A. YouTube Video Integration**

Edit `components/VideoSection.tsx`:

**Option 1: Static Video ID**
```typescript
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

**Option 2: Your Own API**
```typescript
async function checkLive() {
  try {
    // Replace with your API endpoint
    const liveRes = await fetch('https://your-api.com/getCurrentVideo')
    const liveData = await liveRes.json()
    embedVideo(liveData.videoId)
  } catch (e) {
    console.error('Failed to load video:', e)
    handleError()
  }
}
```

#### **B. Live Schedule**

Edit `components/LiveStatus.tsx`:

```typescript
// Customize these for your schedule
const liveStartHour = 11  // Your start time (24-hour format)
const liveEndHour = 14    // Your end time (24-hour format)

// Customize days (1 = Monday, 7 = Sunday)
const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5 // Mon-Fri
// Examples:
// Weekends only: dayOfWeek === 0 || dayOfWeek === 6
// Specific days: [1, 3, 5].includes(dayOfWeek) // Mon, Wed, Fri
// Daily: dayOfWeek >= 0 && dayOfWeek <= 6
```

#### **C. Branding & Design**

**1. Replace Images in `public/` folder:**
- `logo.svg` - Your main logo
- `og.png` - Social media preview (1200x630px)
- `fav-small.png` - Small favicon (32x32px)
- `fav-large.png` - Large favicon (192x192px)
- `splash.png` - App loading screen (200x200px)
- `icon.png` - App icon (200x200px)

**2. Update Colors in `tailwind.config.ts`:**
```typescript
colors: {
  'brand-green': '#your-primary-color',
  'brand-red': '#your-accent-color',
  'brand-purple': '#your-secondary-color',
  'brand-yellow': '#your-highlight-color',
  'grey': '#your-neutral-color',
}
```

**3. Update Marquee Banner in `components/MarqueeBanner.tsx`:**
```typescript
const bannerText = "YOUR SHOW NAME - Your International Text Here - あなたの番組名 - VOTRE NOM D'ÉMISSION -"
```

#### **D. Sponsor/Widget Section**

Edit `components/SponsorSection.tsx`:

**Replace "MADE POSSIBLE BY" section:**
```typescript
<div className="border-t border-[#656565] pt-2 w-full">
  <h2 className="text-3xl font-record-laser font-black uppercase tracking-wide leading-[90%] m-0">
    YOUR SPONSORS TITLE
  </h2>
</div>

// Add your sponsors
<SponsorLink 
  href="https://your-sponsor.com" 
  token="eip155:8453/erc20:YOUR_TOKEN_ADDRESS" // Optional: for Farcaster tokens
>
  <Image 
    src="/your-sponsor-logo.png" 
    alt="Your Sponsor" 
    width={400}
    height={100}
    className="w-full h-auto rounded-lg bg-[#your-bg-color]"
  />
</SponsorLink>
```

**Replace "MADE BY" section:**
```typescript
<SponsorLink 
  href="#" 
  fid={YOUR_FARCASTER_FID} // Your Farcaster ID number
>
  <Image 
    src="/your-profile-pic.png" 
    alt="your name" 
    width={200}
    height={100}
    className="w-full h-auto rounded-lg"
  />
</SponsorLink>
```

#### **E. App Metadata**

Edit `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'Your Show Name',
  description: 'Your show description here',
  keywords: 'your, show, keywords, live, streaming',
  
  openGraph: {
    type: 'website',
    url: 'https://your-domain.com/',
    title: 'Your Show Name - Live Stream',
    description: 'Your detailed show description for social media',
    images: [
      {
        url: 'https://your-domain.com/og.png',
        width: 1200,
        height: 630,
        alt: 'Your Show Name',
      },
    ],
    siteName: 'Your Show Name',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Your Show Name - Live Stream',
    description: 'Your show description',
    images: ['https://your-domain.com/og.png'],
  },
  
  themeColor: '#your-brand-color',
  
  icons: {
    icon: '/fav-small.png',
    apple: '/fav-large.png',
    shortcut: '/fav-small.png',
  },
  
  // CRITICAL: Mini App embed metadata
  other: {
    'fc:miniapp': JSON.stringify({
      version: "1",
      imageUrl: "https://your-domain.com/og.png",
      button: {
        title: "Watch Live", // Max 32 characters
        action: {
          type: "launch_frame",
          name: "Your Show Name",
          url: "https://your-domain.com",
          splashImageUrl: "https://your-domain.com/splash.png",
          splashBackgroundColor: "#your-brand-color"
        }
      }
    })
  },
}
```

### 4. **🎯 CRITICAL: Farcaster Mini App Manifest Setup**

**This is REQUIRED for your app to work as a Farcaster Mini App!**

#### **A. Create the Manifest File**

Create `public/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "REPLACE_WITH_SIGNED_HEADER",
    "payload": "REPLACE_WITH_SIGNED_PAYLOAD", 
    "signature": "REPLACE_WITH_SIGNATURE"
  },
  "frame": {
    "version": "1",
    "name": "Your Show Name",
    "iconUrl": "https://your-domain.com/icon.png",
    "homeUrl": "https://your-domain.com",
    "imageUrl": "https://your-domain.com/og.png",
    "buttonTitle": "Watch Live",
    "splashImageUrl": "https://your-domain.com/splash.png",
    "splashBackgroundColor": "#your-brand-color"
  }
}
```

#### **B. Get Your Domain Signature**

**IMPORTANT**: You MUST do this step or your Mini App won't work!

1. **Deploy your app to production first** (see deployment section)
2. **Visit the Farcaster manifest signing tool**:
   ```
   https://farcaster.xyz/~/developers/mini-apps/manifest?domain=your-domain.com
   ```
3. **Sign with your Farcaster account**
4. **Copy the generated `accountAssociation` data**
5. **Replace the placeholder values** in your `farcaster.json` file

#### **C. Test Your Manifest**

```bash
# Test that your manifest is accessible
curl -s https://your-domain.com/.well-known/farcaster.json

# Should return your JSON manifest with 200 status
```

#### **D. Verify Mini App Embed**

Test your Mini App embed:

```bash
# Check that your pages have the fc:miniapp meta tag
curl -s https://your-domain.com | grep -E 'fc:miniapp|fc:frame'

# Should show: <meta name="fc:miniapp" content='{"version":"1",...}' />
```

### 5. **🚀 Deploy Your App**

#### **Option A: Vercel (Recommended)**

```bash
# Push to GitHub
git add .
git commit -m "Customized for [Your Show Name]"
git push origin main

# Deploy to Vercel
# 1. Visit vercel.com
# 2. Import your GitHub repo
# 3. Add environment variables:
#    - NEYNAR_API_KEY
#    - CRON_SECRET
# 4. Deploy
```

#### **Option B: Custom Domain Setup**

If using a custom domain:

1. **Add domain in Vercel dashboard**
2. **Update DNS records** as instructed
3. **Re-sign your manifest** with the custom domain
4. **Update all URLs** in your code to use the custom domain

### 6. **📱 Test Your Mini App**

#### **A. Test Manifest**
```bash
curl -s https://your-domain.com/.well-known/farcaster.json
```

#### **B. Test Preview**
Visit:
```
https://farcaster.xyz/~/developers/mini-apps/preview?url=https%3A%2F%2Fyour-domain.com
```

#### **C. Test in Farcaster**
1. Share your domain link in a Farcaster cast
2. Verify the embed preview appears
3. Click to launch your Mini App

### 7. **🔔 Optional: Set Up Notifications**

#### **A. Configure Cron Job**

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron-notify",
    "schedule": "0 11 * * 1-5"
  }]
}
```

#### **B. Update Notification Content**

Edit `app/api/cron-notify/route.ts`:
```typescript
notification: {
  title: 'Your Show is Live',
  body: 'Your hosts are streaming now on Farcaster',
  target_url: 'https://your-domain.com',
}
```

### 8. **🎨 Advanced Customization**

#### **A. Custom Fonts**

Add to `app/globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font:wght@400;700&display=swap');

body {
  font-family: 'Your Font', monospace;
}
```

#### **B. Custom Animations**

Update `tailwind.config.ts`:
```typescript
animation: {
  'your-animation': 'your-keyframes 3s ease-in-out infinite',
},
keyframes: {
  'your-keyframes': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' }
  }
}
```

## 🛠️ Troubleshooting

### **Mini App Not Loading**
- Ensure `sdk.actions.ready()` is called in your components
- Check browser console for errors
- Verify manifest is accessible at `/.well-known/farcaster.json`

### **Embed Not Showing in Farcaster**
- Verify `fc:miniapp` meta tag is present in HTML
- Check image URLs are accessible (3:2 aspect ratio for `imageUrl`)
- Test with the [preview tool](https://farcaster.xyz/~/developers/mini-apps/preview)

### **Domain Signature Issues**
- Domain in manifest MUST match exactly (including subdomains)
- Re-sign manifest if you change domains
- Ensure manifest is served with correct CORS headers

### **Common Errors**
- `Manifest not found (404)`: Check file path and server configuration
- `Invalid signature`: Re-sign manifest with correct domain
- `App won't launch`: Ensure `sdk.actions.ready()` is called

## 📚 Resources

- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Farcaster Mini Apps Specification](https://miniapps.farcaster.xyz/docs/specification)
- [Farcaster SDK Reference](https://miniapps.farcaster.xyz/docs/sdk)
- [Neynar API Documentation](https://neynar.com/)
- [Manifest Signing Tool](https://farcaster.xyz/~/developers/mini-apps/manifest)
- [Preview Tool](https://farcaster.xyz/~/developers/mini-apps/preview)

## 🤝 Need Help?

- **Farcaster Team**: Reach out to @pirosb3, @linda, @deodad on Farcaster
- **GitHub Issues**: Open an issue in this repository
- **Community**: Ask in Farcaster developer channels

---

**🎉 Once you've completed these steps, you'll have your own branded live streaming Mini App running on Farcaster!**