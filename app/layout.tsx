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
    url: 'https://the-rollup-base-miniapp.vercel.app/',
    title: 'The Rollup Live - Weekly Crypto News',
    description: 'Weekly crypto news, Base ecosystem updates, and blockchain insights. Live every Wednesday with comprehensive DeFi analysis and blockchain discussions.',
    images: [
      {
        url: 'https://the-rollup-base-miniapp.vercel.app/brand/Banner%20rollup.jpg',
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
    images: ['https://the-rollup-base-miniapp.vercel.app/brand/Banner%20rollup.jpg'],
  },
  
  // Theme & Mobile
  themeColor: '#4285F4',
  colorScheme: 'dark',
  
  // Icons
  icons: {
    icon: '/brand/rollup%20Logo%202.svg',
    apple: '/token%20logos/fav-large.png',
    shortcut: '/brand/rollup%20Logo%202.svg',
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
      imageUrl: "https://the-rollup-base-miniapp.vercel.app/brand/Banner%20rollup.jpg",
      button: {
        title: "Watch The Rollup Live",
        action: {
          type: "launch_frame",
          name: "The Rollup Live",
          url: "https://the-rollup-base-miniapp.vercel.app",
          splashImageUrl: "https://the-rollup-base-miniapp.vercel.app/brand/Banner%20rollup.jpg",
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
        <link rel="preload" href="/brand/rollup%20Logo%202.svg" as="image" />
        <link rel="preload" href="/brand/Banner%20rollup.jpg" as="image" />
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