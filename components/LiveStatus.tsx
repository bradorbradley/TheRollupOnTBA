'use client'

import { useEffect, useState } from 'react'

export default function LiveStatus() {
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    function updateVisibility() {
      const options = { timeZone: 'America/Los_Angeles' }
      const now = new Date().toLocaleString('en-US', options)
      const pstDate = new Date(now)
      
      const dayOfWeek = pstDate.getDay()
      const currentHour = pstDate.getHours()
      
      const liveStartHour = 11
      const liveEndHour = 14
      
      const isWednesday = dayOfWeek === 3
      const isLiveHours = currentHour >= liveStartHour && currentHour < liveEndHour
      const isCurrentlyLive = isWednesday && isLiveHours
      
      console.log('The Rollup Live Status:', { 
        dayOfWeek, 
        isWednesday, 
        currentHour, 
        isLiveHours, 
        isCurrentlyLive 
      })
      
      setIsLive(isCurrentlyLive)
    }

    updateVisibility()
    const interval = setInterval(updateVisibility, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Live Indicator */}
      {isLive && (
        <div className="fixed top-[44px] right-2 z-50 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-[12px] rounded-full py-2.5 px-3 lg:px-4">
          <div className="dot w-3 h-3 bg-[var(--brand-red)] rounded-full shadow-[inset_0_0_5px_rgba(255,255,255,0.32)] filter drop-shadow-[0_0_9px_rgba(255,0,0,0.7)]"></div>
          <div className="text-black text-sm uppercase font-medium">Live Now</div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isLive && (
        <div className="fixed top-[44px] right-2 z-50 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-[12px] rounded-full py-2.5 px-3 lg:px-4">
          <div className="dot grey w-3 h-3 bg-[#a1a1a1] rounded-full"></div>
          <div className="text-black text-sm uppercase font-medium">Offline</div>
        </div>
      )}
    </>
  )
}