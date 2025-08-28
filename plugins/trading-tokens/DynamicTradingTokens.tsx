'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { sdk } from '@farcaster/miniapp-sdk'

interface Token {
  id: string
  address: string
  chainId: number
  name: string
  symbol: string
  decimals: number
  logoUri: string
  enabled: boolean
  sort: number
}

interface SponsorLinkProps {
  href: string
  token: string
  children: React.ReactNode
  className?: string
}

function SponsorLink({ href, token, children, className = '' }: SponsorLinkProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    try {
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

export default function DynamicTradingTokens() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const streamId = 'rollup' // Could be made configurable later

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/tokens?streamId=${streamId}`)
      const data = await response.json()
      
      if (data.success && data.tokens) {
        // Filter only enabled tokens and sort by sort order
        const enabledTokens = data.tokens
          .filter((token: Token) => token.enabled)
          .sort((a: Token, b: Token) => a.sort - b.sort)
        
        setTokens(enabledTokens)
      } else {
        throw new Error(data.error || 'Failed to load tokens')
      }
    } catch (err) {
      console.error('Failed to fetch tokens:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tokens')
      
      // Fallback to hardcoded tokens if API fails
      setTokens([
        {
          id: 'fallback_noice',
          address: '0x9cb41fd9dc6891bae8187029461bfaadf6cc0c69',
          chainId: 8453,
          name: 'Noice',
          symbol: 'NOICE',
          decimals: 18,
          logoUri: '/token logos/noice-button.png',
          enabled: true,
          sort: 0
        },
        {
          id: 'fallback_bankr',
          address: '0x22af33fe49fd1fa80c7149773dde5890d3c76f3b',
          chainId: 8453,
          name: 'Bankroll',
          symbol: 'BANKR',
          decimals: 18,
          logoUri: '/token logos/bankr.gif',
          enabled: true,
          sort: 1
        },
        {
          id: 'fallback_bracky',
          address: '0x06f71fb90f84b35302d132322a3c90e4477333b0',
          chainId: 8453,
          name: 'Bracky',
          symbol: 'BRACKY',
          decimals: 18,
          logoUri: '/token logos/bracky.svg',
          enabled: true,
          sort: 2
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Convert chain ID to Farcaster token format
  const formatTokenForFarcaster = (token: Token): string => {
    // Map chain IDs to Farcaster format
    const chainMap: Record<number, string> = {
      1: 'eip155:1/erc20',     // Ethereum
      8453: 'eip155:8453/erc20', // Base  
      10: 'eip155:10/erc20',   // Optimism
      137: 'eip155:137/erc20'  // Polygon
    }
    
    const chainPrefix = chainMap[token.chainId] || 'eip155:8453/erc20'
    return `${chainPrefix}:${token.address.toLowerCase()}`
  }

  // Render loading state
  if (loading) {
    return (
      <div className="border-t border-line pt-2 w-full">
        <h3 className="text-xl font-bold text-black tracking-wide leading-tight m-0 mb-4" 
            style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
          TRADE TOKENS
        </h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
          <span className="ml-3 text-ink-muted">Loading tokens...</span>
        </div>
      </div>
    )
  }

  // Render error state (with fallback tokens)
  if (error) {
    console.warn('Using fallback tokens due to API error:', error)
  }

  // No tokens available
  if (tokens.length === 0) {
    return (
      <div className="border-t border-line pt-2 w-full">
        <h3 className="text-xl font-bold text-black tracking-wide leading-tight m-0 mb-4" 
            style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
          TRADE TOKENS
        </h3>
        <div className="text-center py-8 text-ink-muted">
          <p>No trading tokens available.</p>
          <p className="text-sm mt-2">Host can add tokens via the Trading Editor.</p>
        </div>
      </div>
    )
  }

  // Render tokens dynamically
  // First token gets special full-width treatment, rest go in grid
  const [firstToken, ...otherTokens] = tokens

  return (
    <div className="flex flex-col gap-4">
      {/* TRADE TOKENS SECTION HEADER */}
      <div className="border-t border-line pt-2 w-full">
        <h3 className="text-xl font-bold text-black tracking-wide leading-tight m-0" 
            style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
          TRADE TOKENS
        </h3>
        {error && (
          <p className="text-xs text-orange-600 mt-1">
            Using cached tokens (API unavailable)
          </p>
        )}
      </div>

      {/* First token - full width */}
      {firstToken && (
        <SponsorLink 
          href="#" 
          token={formatTokenForFarcaster(firstToken)}
          className="block w-full text-center"
        >
          <div className="relative">
            <Image 
              src={firstToken.logoUri} 
              alt={firstToken.symbol.toLowerCase()} 
              width={400}
              height={80}
              className="w-full h-auto rounded-base btn-3d hover:opacity-80 transition-opacity bg-brand-blue"
              onError={(e) => {
                // Fallback to identicon if image fails to load
                const img = e.target as HTMLImageElement
                img.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${firstToken.address}&backgroundColor=2563eb`
              }}
            />
            {/* Token info overlay for custom tokens */}
            {!firstToken.logoUri.startsWith('/token logos/') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-base">
                <div className="text-white font-bold text-lg">{firstToken.symbol}</div>
              </div>
            )}
          </div>
        </SponsorLink>
      )}

      {/* Remaining tokens in grid layout */}
      {otherTokens.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {otherTokens.map((token) => (
            <SponsorLink 
              key={token.id}
              href="#" 
              token={formatTokenForFarcaster(token)}
            >
              <div className="relative">
                <Image 
                  src={token.logoUri} 
                  alt={token.symbol.toLowerCase()} 
                  width={200}
                  height={80}
                  className="w-full h-auto rounded-base btn-3d hover:opacity-80 transition-opacity bg-brand-blue"
                  onError={(e) => {
                    // Fallback to identicon if image fails to load
                    const img = e.target as HTMLImageElement
                    img.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${token.address}&backgroundColor=2563eb`
                  }}
                />
                {/* Token info overlay for custom tokens */}
                {!token.logoUri.startsWith('/token logos/') && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-base">
                    <div className="text-white font-bold text-sm">{token.symbol}</div>
                  </div>
                )}
              </div>
            </SponsorLink>
          ))}
        </div>
      )}
    </div>
  )
}