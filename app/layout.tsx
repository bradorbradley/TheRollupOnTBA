import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Rollup Live',
  description: "Weekly crypto news, Base ecosystem updates, and blockchain insights",
  keywords: 'The Rollup, crypto news, Base ecosystem, blockchain, DeFi, Ethereum, live streaming',
  
  // Open Graph / Facebook
  openGraph: {
    type: 'website',
    url: 'https://tbpn-tba.vercel.app/',
    title: 'The Rollup Live - Weekly Crypto News',
    description: 'Weekly crypto news, Base ecosystem updates, and blockchain insights. Live every Wednesday with comprehensive DeFi analysis and blockchain discussions.',
    images: [
      {
        url: 'https://tbpn-tba.vercel.app/og.png',
        width: 1200,
        height: 630,
        alt: 'The Rollup Live',
      },
    ],
    siteName: 'The Rollup Live',
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'The Rollup Live - Weekly Crypto News',
    description: 'Weekly crypto news, Base ecosystem updates, and blockchain insights. Live every Wednesday.',
    images: ['https://tbpn-tba.vercel.app/og.png'],
  },
  
  // Theme & Mobile
  themeColor: '#4285F4',
  colorScheme: 'dark',
  
  // Icons
  icons: {
    icon: '/fav-small.png',
    apple: '/fav-large.png',
    shortcut: '/fav-small.png',
  },
  
  // Viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  
  // Other metadata
  other: {
    // TBA mini-app frame metadata
    'fc:frame': JSON.stringify({
      version: "next",
      imageUrl: "https://tbpn-tba.vercel.app/og.png",
      button: {
        title: "Watch Live",
        action: {
          type: "launch_frame",
          name: "The Rollup Live",
          url: "https://tbpn-tba.vercel.app",
          splashImageUrl: "https://tbpn-tba.vercel.app/splash.png",
          splashBackgroundColor: "#4285F4"
        }
      }
    }),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Resource Hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://d3e54v103j8qbb.cloudfront.net" />
        <link rel="preconnect" href="https://cdn.prod.website-files.com" />
        
        {/* Preload Critical Resources */}
        <link rel="preload" href="/logo.svg" as="image" />
        <link rel="preload" href="/splash.png" as="image" />
      </head>
      <body className="font-geist-mono antialiased">
        {children}
        <Analytics />
        
        {/* Vercel Analytics Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
            `,
          }}
        />
      </body>
    </html>
  )
}