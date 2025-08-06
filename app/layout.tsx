import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'TBPN on TBA',
  description: "Technology's daily show with John Coogan and Jordi Hays. Live on TBA Monday through Friday.",
  keywords: 'TBPN, TBA, technology, daily show, John Coogan, Jordi Hays, live streaming',
  
  // Open Graph / Facebook
  openGraph: {
    type: 'website',
    url: 'https://tbpn-tba.vercel.app/',
    title: 'TBPN on TBA - Technology\'s Daily Show',
    description: 'Technology\'s daily show with John Coogan and Jordi Hays. Live on TBA Monday through Friday. Watch live streams and catch up on the latest tech discussions.',
    images: [
      {
        url: 'https://tbpn-tba.vercel.app/og.png',
        width: 1200,
        height: 630,
        alt: 'TBPN on TBA',
      },
    ],
    siteName: 'TBPN on TBA',
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'TBPN on TBA - Technology\'s Daily Show',
    description: 'Technology\'s daily show with John Coogan and Jordi Hays. Live on TBA Monday through Friday.',
    images: ['https://tbpn-tba.vercel.app/og.png'],
  },
  
  // Theme & Mobile
  themeColor: '#0057ff',
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
        title: "Watch Now",
        action: {
          type: "launch_frame",
          name: "TBPN",
          url: "https://tbpn-tba.vercel.app",
          splashImageUrl: "https://tbpn-tba.vercel.app/splash.png",
          splashBackgroundColor: "#1E51F5"
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