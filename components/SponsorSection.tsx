'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { sdk } from '@farcaster/miniapp-sdk'

interface SponsorLinkProps {
  href: string
  token?: string
  fid?: string
  children: React.ReactNode
  className?: string
}

function SponsorLink({ href, token, fid, children, className = '' }: SponsorLinkProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    try {
      
      if (token) {
        // Track custom event for token selection
        const img = e.currentTarget.querySelector('img')
        if (img?.alt && typeof window !== 'undefined' && 'va' in window) {
          const va = (window as any).va
          if (typeof va === 'function') {
            va('event', { name: 'selected ' + img.alt })
          }
        }
        await sdk.actions.viewToken({ token })
      } else if (fid) {
        // Track custom event for profile selection
        const img = e.currentTarget.querySelector('img')
        if (img?.alt && typeof window !== 'undefined' && 'va' in window) {
          const va = (window as any).va
          if (typeof va === 'function') {
            va('event', { name: 'selected ' + img.alt })
          }
        }
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
  useEffect(() => {
    // Initialize SDK when component mounts
    const initSDK = async () => {
      try {
        await sdk.actions.ready()
        console.log('Splash screen dismissed')
      } catch (err) {
        console.error('SDK ready failed:', err)
      }
    }

    initSDK()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="border-t border-[#656565] pt-2 w-full">
        <h2 className="text-3xl font-record-laser font-black uppercase tracking-wide leading-[90%] m-0">
          MADE POSSIBLE BY
        </h2>
      </div>

      {/* noice full width */}
      <SponsorLink 
        href="#" 
        token="eip155:8453/erc20:0x9cb41fd9dc6891bae8187029461bfaadf6cc0c69"
        className="block w-full text-center"
      >
        <Image 
          src="/noice-button.png" 
          alt="noice" 
          width={400}
          height={100}
          className="w-full h-auto rounded-lg bg-[#0057ff]"
        />
      </SponsorLink>

      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-2">
        <SponsorLink 
          href="#" 
          token="eip155:8453/erc20:0x22af33fe49fd1fa80c7149773dde5890d3c76f3b"
        >
          <Image 
            src="/bankr.gif" 
            alt="bankroll" 
            width={200}
            height={100}
            className="w-full h-auto rounded-lg bg-[#F6D6D7]"
          />
        </SponsorLink>
        <SponsorLink 
          href="#" 
          token="eip155:8453/erc20:0x06f71fb90f84b35302d132322a3c90e4477333b0"
        >
          <Image 
            src="/bracky.svg" 
            alt="degen" 
            width={200}
            height={100}
            className="w-full h-auto rounded-lg bg-[#0000FF]"
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
            src="/harmonybot.svg" 
            alt="harmonybot" 
            width={200}
            height={100}
            className="w-full h-auto rounded-lg bg-[#262626]"
          />
        </SponsorLink>
        <SponsorLink 
          href="#" 
          token="eip155:8453/erc20:0x4ed4e862860bed51a9570b96d89af5e1b0efefed"
        >
          <Image 
            src="/degen.svg" 
            alt="degen" 
            width={200}
            height={100}
            className="w-full h-auto rounded-lg bg-[#A36EFD]"
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
            src="/indexy.svg" 
            alt="indexy" 
            width={200}
            height={100}
            className="w-full h-auto rounded-lg bg-[#147B58]"
          />
        </SponsorLink>
        <SponsorLink 
          href="#" 
          token="eip155:8453/erc20:0x1111111111166b7fe7bd91427724b487980afc69"
        >
          <Image 
            src="/zora.svg" 
            alt="zora" 
            width={200}
            height={100}
            className="w-full h-auto rounded-lg bg-[#FFFFFF]"
          />
        </SponsorLink>
      </div>

      {/* Made By Section */}
      <div className="border-t border-[#656565] pt-2 w-full">
        <h2 className="text-3xl font-record-laser font-black uppercase tracking-wide leading-[90%] m-0">
          MADE BY
        </h2>
      </div>

      <SponsorLink 
        href="#" 
        fid={373}
      >
        <Image 
          src="/jayme.png" 
          alt="jayme" 
          width={200}
          height={100}
          className="w-full h-auto rounded-lg"
        />
      </SponsorLink>
    </div>
  )
}