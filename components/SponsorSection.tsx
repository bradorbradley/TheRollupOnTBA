'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { sdk } from '@farcaster/miniapp-sdk'
import { subscribeToNewsletter, type SubscribeResponse } from '@/lib/newsletter'

interface SponsorLinkProps {
  href: string
  token?: string
  fid?: number
  children: React.ReactNode
  className?: string
}

function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    setMessage('')
    setError('')

    try {
      const data: SubscribeResponse = await subscribeToNewsletter(email)
      if ((data as any).error === 'Member Exists') {
        // silently do nothing per requirements
        setIsSubmitting(false)
        return
      }
      setMessage('Subscribed!')
      setIsSubmitting(false)
      setEmail('')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      setError('Failed to subscribe')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 bg-input-bg border border-input-stroke rounded-base text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="px-6 py-3 bg-brand-blue text-white font-semibold rounded-base btn-3d disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Joining...' : 'Join'}
        </button>
      </div>
      {message && (
        <p className="text-sm text-ink-muted mt-2">{message}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </form>
  )
}

interface HostProfileProps {
  name: string
  imageSrc?: string // Optional - will be fetched from Farcaster if not provided
  fid: number | null // Farcaster ID
}

function HostProfile({ name, imageSrc, fid }: HostProfileProps) {
  const [profileImage, setProfileImage] = useState(imageSrc || '')
  const [isFollowed, setIsFollowed] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Fetch profile data from Farcaster if FID is provided and no image
  useEffect(() => {
    if (fid && !imageSrc) {
      fetchProfileData(fid)
    }
  }, [fid, imageSrc])

  const fetchProfileData = async (fid: number) => {
    try {
      // Using Neynar API to fetch profile data
      const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
        headers: {
          'accept': 'application/json',
          'api_key': 'NEYNAR_API_DOCS' // Public API key for basic requests
        }
      })
      const data = await response.json()
      if (data.users && data.users[0]) {
        setProfileImage(data.users[0].pfp_url)
      }
    } catch (err) {
      console.error('Failed to fetch profile data:', err)
      // Fallback to placeholder if API fails
      setProfileImage('/brand/Rollup Logo.PNG')
    }
  }

  const handleFollow = async () => {
    if (fid) {
      try {
        // Use viewProfile to open their Farcaster profile where users can follow
        await sdk.actions.viewProfile({ fid })
        console.log(`Opened profile for ${name} (FID: ${fid})`)
        
        // Show follow animation
        setIsAnimating(true)
        setTimeout(() => {
          setIsFollowed(true)
          setIsAnimating(false)
        }, 1000)
      } catch (err) {
        console.error('Profile view action failed:', err)
      }
    }
  }

  return (
    <div className="text-center">
      <div className="relative">
        <Image
          src={profileImage || '/brand/Rollup Logo.PNG'}
          alt={name}
          width={64}
          height={64}
          className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-all duration-300"
          onClick={handleFollow}
        />
      </div>
      <span className="text-black text-sm font-medium mt-1 block" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
        {name}
      </span>
    </div>
  )
}

function SponsorLink({ href, token, fid, children, className = '' }: SponsorLinkProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    try {
      if (token) {
        // Track custom event for token selection
        const img = e.currentTarget.querySelector('img')
        const span = e.currentTarget.querySelector('span')
        const trackingName = img?.alt || span?.textContent
        if (trackingName) {
          // @ts-ignore
          if (typeof window !== 'undefined' && window.va) {
            // @ts-ignore
            window.va('event', { name: 'selected ' + trackingName })
          }
        }
        console.log('Opening token:', token)
        await sdk.actions.viewToken({ token })
      } else if (fid) {
        // Track custom event for profile selection
        const img = e.currentTarget.querySelector('img')
        const span = e.currentTarget.querySelector('span')
        const trackingName = img?.alt || span?.textContent
        if (trackingName) {
          // @ts-ignore
          if (typeof window !== 'undefined' && window.va) {
            // @ts-ignore
            window.va('event', { name: 'selected ' + trackingName })
          }
        }
        console.log('Opening profile:', fid)
        await sdk.actions.viewProfile({ fid })
      }
    } catch (err) {
      console.error('SDK action failed:', err)
    }
  }

  return (
    <a 
      href={href} 
      className={`sponsor-link-block w-full mb-0 rounded-lg hover:opacity-80 transition-opacity ${className}`}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}

export default function SponsorSection() {
  return (
    <div className="flex flex-col gap-4">
      {/* 1. TRADE TOKENS SECTION */}
      <div className="border-t border-line pt-2 w-full">
        <h3 className="text-xl font-bold text-black tracking-wide leading-tight m-0" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
          TRADE TOKENS
        </h3>
      </div>

      {/* noice full width */}
      <SponsorLink 
        href="#" 
        token="eip155:8453/erc20:0x9cb41fd9dc6891bae8187029461bfaadf6cc0c69"
        className="block w-full text-center"
      >
        <Image 
          src="/token logos/noice-button.png" 
          alt="noice" 
          width={400}
          height={80}
          className="w-full h-auto rounded-base btn-3d hover:opacity-80 transition-opacity bg-brand-blue"
        />
      </SponsorLink>

      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-2">
        <SponsorLink 
          href="#" 
          token="eip155:8453/erc20:0x22af33fe49fd1fa80c7149773dde5890d3c76f3b"
        >
          <Image 
            src="/token logos/bankr.gif" 
            alt="bankroll" 
            width={200}
            height={80}
            className="w-full h-auto rounded-base btn-3d hover:opacity-80 transition-opacity bg-brand-blue"
          />
        </SponsorLink>
        <SponsorLink 
          href="#" 
          token="eip155:8453/erc20:0x06f71fb90f84b35302d132322a3c90e4477333b0"
        >
          <Image 
            src="/token logos/bracky.svg" 
            alt="bracky" 
            width={200}
            height={80}
            className="w-full h-auto rounded-base btn-3d hover:opacity-80 transition-opacity bg-brand-blue"
          />
        </SponsorLink>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-2">
        <SponsorLink 
          href="#" 
          token="eip155:8453/erc20:0x26E0331355dF5Ef082F69dF161218093708a73ac"
        >
          <Image 
            src="/token logos/harmonybot.svg" 
            alt="harmonybot" 
            width={200}
            height={80}
            className="w-full h-auto rounded-base btn-3d hover:opacity-80 transition-opacity bg-brand-blue"
          />
        </SponsorLink>
        <SponsorLink 
          href="#" 
          token="eip155:8453/erc20:0x4ed4e862860bed51a9570b96d89af5e1b0efefed"
        >
          <Image 
            src="/token logos/degen.svg" 
            alt="degen" 
            width={200}
            height={80}
            className="w-full h-auto rounded-base btn-3d hover:opacity-80 transition-opacity bg-brand-blue"
          />
        </SponsorLink>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-2 gap-2">
        <SponsorLink 
          href="#" 
          token="eip155:8453/erc20:0x1f015712aa2a48085ec93f87d643bb625b668b07"
        >
          <Image 
            src="/token logos/indexy.svg" 
            alt="indexy" 
            width={200}
            height={80}
            className="w-full h-auto rounded-base btn-3d hover:opacity-80 transition-opacity bg-brand-blue"
          />
        </SponsorLink>
        <SponsorLink 
          href="#" 
          token="eip155:8453/erc20:0x1111111111166b7fe7bd91427724b487980afc69"
        >
          <Image 
            src="/token logos/zora.svg" 
            alt="zora" 
            width={200}
            height={80}
            className="w-full h-auto rounded-base btn-3d hover:opacity-80 transition-opacity bg-brand-blue"
          />
        </SponsorLink>
      </div>

      {/* 2. SHOW LOGO/BANNER */}
      <div className="mt-6">
        <Image
          src="/brand/Banner rollup.jpg"
          alt="The Rollup"
          width={400}
          height={120}
          className="w-full h-auto object-cover rounded-base"
        />
      </div>

      {/* 3. SHOW DESCRIPTION */}
      <div className="mt-2">
        <p className="text-black text-lg leading-relaxed" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
          The Rollup is hosted by Robbie and Andy featuring in-depth conversations with leading voices in digital assets, exploring crypto's biggest ideas, trends, and builders so you can stay ahead of what matters.
        </p>
      </div>

      {/* 4. HOSTS + QUICK FOLLOW */}
      <div className="mt-4">
        <h4 className="text-black text-lg font-bold mb-3" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
          HOSTS
        </h4>
        <div className="flex justify-start gap-6">
          <HostProfile 
            name="Robbie" 
            imageSrc="/brand/robbie pfp.webp" 
            fid={19146} // coinbrad.eth FID for now
          />
          <HostProfile 
            name="Andy" 
            imageSrc="/brand/andy pfp.webp" 
            fid={19146} // coinbrad.eth FID for now
          />
          <HostProfile 
            name="coinbrad" 
            fid={19146} // Will fetch PFP automatically
          />
          <HostProfile 
            name="The Rollup" 
            imageSrc="/brand/Rollup Logo.PNG" 
            fid={19146} // coinbrad.eth FID for now
          />
        </div>
      </div>

      {/* 5. CTA - NEWSLETTER SIGNUP */}
      <div className="border-t border-line pt-4 w-full mt-6">
        <h3 className="text-xl font-bold text-black tracking-wide leading-tight mb-3" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
          JOIN NEWSLETTER
        </h3>
        <NewsletterSignup />
      </div>

      {/* 6. EXTERNAL LINKS */}
      <div className="flex justify-start gap-6 mt-6">
        <a 
          href="https://therollup.co" 
          className="hover:opacity-70 transition-opacity"
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Image
            src="/brand/website.svg"
            alt="Website"
            width={64}
            height={64}
            className="w-16 h-16"
          />
        </a>
        <a 
          href="https://twitter.com/therollupco" 
          className="hover:opacity-70 transition-opacity"
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Image
            src="/brand/x.svg"
            alt="X (Twitter)"
            width={64}
            height={64}
            className="w-16 h-16"
          />
        </a>
      </div>
    </div>
  )
}