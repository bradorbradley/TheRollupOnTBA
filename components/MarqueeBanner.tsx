'use client'

import { useEffect, useState } from 'react'

interface PriceData {
  bitcoin: { usd: number, usd_24h_change: number }
  ethereum: { usd: number, usd_24h_change: number }
  solana: { usd: number, usd_24h_change: number }
}

export default function MarqueeBanner() {
  const [prices, setPrices] = useState<PriceData | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Fetch crypto prices from CoinGecko
        const cryptoResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
        )
        const cryptoData = await cryptoResponse.json()
        setPrices(cryptoData)
      } catch (error) {
        console.error('Failed to fetch prices:', error)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number, isCrypto: boolean = true) => {
    if (isCrypto && price < 1) {
      return price.toFixed(4)
    }
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }

  const formatChange = (change: number) => {
    const isPositive = change >= 0
    const triangle = isPositive ? '▲' : '▼'
    return `${triangle}${Math.abs(change).toFixed(2)}%`
  }

  const renderTickerItem = (symbol: string, price: number, change: number, isCrypto: boolean = true) => {
    const isPositive = change >= 0
    const triangle = isPositive ? '▲' : '▼'
    return (
      <span key={symbol} className="inline-flex items-center gap-1">
        {symbol} ${formatPrice(price, isCrypto)} 
        <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
          {triangle}{Math.abs(change).toFixed(2)}%
        </span>
      </span>
    )
  }

  const renderTicker = () => {
    const easterEggs = [
      'THE ROLLUP IS BASED',
      'UF GATORS BUILT DIFFERENT',
      'FROM POKER TO PROTOCOLS',
      'MODULAR IS THE FUTURE',
      'DEFI SUMMER NEVER ENDED'
    ]
    
    // Cycle through easter eggs every 30 seconds
    const currentEggIndex = Math.floor(Date.now() / 30000) % easterEggs.length
    const currentEgg = easterEggs[currentEggIndex]

    if (!prices) {
      return (
        <>
          <span>{currentEgg}</span>
          <span>•</span>
          <span>LOADING MARKET DATA</span>
          <span>•</span>
        </>
      )
    }

    return (
      <>
        {renderTickerItem('BTC', prices.bitcoin.usd, prices.bitcoin.usd_24h_change)}
        <span>•</span>
        {renderTickerItem('ETH', prices.ethereum.usd, prices.ethereum.usd_24h_change)}
        <span>•</span>
        {renderTickerItem('SOL', prices.solana.usd, prices.solana.usd_24h_change)}
        <span>•</span>
        <span>{currentEgg}</span>
        <span>•</span>
        <span>FACE-TO-FACE WITH DIGITAL ASSETS</span>
        <span>•</span>
      </>
    )
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-brand-blue h-10 flex overflow-hidden">
      <div className="flex items-center gap-4 w-max marquee-content">
        <div className="text-cta-text font-medium whitespace-nowrap meta text-sm tracking-wide flex items-center gap-4">
          {renderTicker()}
        </div>
        <div className="text-cta-text font-medium whitespace-nowrap meta text-sm tracking-wide flex items-center gap-4">
          {renderTicker()}
        </div>
      </div>
    </div>
  )
}