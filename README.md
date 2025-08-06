# TBPN on TBA

A Next.js application for the Technology's daily show with John Coogan and Jordi Hays, featuring live streaming on TBA Monday through Friday.

## Features

- **Live Video Streaming**: Embedded YouTube live streams with automatic video loading
- **Live Status Indicators**: Real-time status showing when the show is live (Mon-Fri, 11 AM - 2 PM PST)
- **Sponsor Integration**: Interactive sponsor buttons with Farcaster SDK integration
- **Marquee Banner**: Scrolling international text banner
- **Mobile Responsive**: Optimized for both desktop and mobile viewing
- **Farcaster Integration**: Native Farcaster mini-app with token and profile viewing

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Farcaster SDK** for blockchain interactions
- **Vercel Analytics** for tracking
- **Vercel Cron** for scheduled notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Add your environment variables:
   ```
   NEYNAR_API_KEY=your_neynar_api_key_here
   CRON_SECRET=your_cron_secret_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

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

## Deployment

The app is designed to deploy on Vercel with:

- Automatic builds on push
- Cron job for live notifications
- Static asset optimization
- Environment variable management

## API Endpoints

- `POST /api/cron-notify` - Triggered by Vercel Cron for live notifications
- `POST /api/notify-status` - Manual notification sending

## Live Schedule

The show is live Monday through Friday, 11 AM - 2 PM Pacific Time. The live status is automatically updated based on this schedule.

## Sponsors

Current sponsors include various Web3 projects with integrated token viewing through the Farcaster SDK.

## License

[Add your license here]