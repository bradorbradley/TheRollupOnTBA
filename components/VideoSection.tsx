'use client'

import { useState, useEffect } from 'react'

export default function VideoSection() {
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    // Simple check - you can enhance this with actual live status API call
    const checkLiveStatus = () => {
      const now = new Date()
      const day = now.getDay() // 0 = Sunday, 3 = Wednesday
      const hour = now.getHours()
      
      // Wednesday between 11 AM and 2 PM ET (approximate live hours)
      const isLiveTime = day === 3 && hour >= 11 && hour < 14
      setIsLive(isLiveTime)
    }

    checkLiveStatus()
    const interval = setInterval(checkLiveStatus, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [])

  if (isLive) {
    return (
      <div className="w-full h-[200px] lg:fixed lg:top-9 lg:left-0 lg:w-[63%] lg:h-[calc(100vh-2.25rem)] bg-black border-r border-line flex items-center justify-center pt-0 lg:pt-0 static lg:static">
        <iframe
          src="https://www.youtube.com/embed/live_stream?channel=UCC2UPtfjtdAgofzuxUPZJ6g&autoplay=0&mute=0"
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="The Rollup Live Stream"
        />
      </div>
    )
  }

  return (
    <div className="w-full h-[200px] lg:fixed lg:top-9 lg:left-0 lg:w-[63%] lg:h-[calc(100vh-2.25rem)] bg-black border-r border-line flex items-center justify-center pt-0 lg:pt-0 static lg:static">
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <p className="text-white text-xl font-bold mb-2" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
            NOT LIVE
          </p>
          <p className="text-white/70 text-sm" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
            The Rollup streams Wednesdays
          </p>
        </div>
      </div>
    </div>
  )
}