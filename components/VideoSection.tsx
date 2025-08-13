'use client'

import { useState, useEffect } from 'react'

export default function VideoSection() {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const channelId = 'UCC2UPtfjtdAgofzuxUPZJ6g'
  const fallbackVideoId = 'dQw4w9WgXcQ'

  useEffect(() => {
    async function fetchLatestVideo() {
      setIsLoading(true)
      
      try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`
        
        const response = await fetch(proxyUrl)
        const data = await response.json()
        
        if (data.contents) {
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(data.contents, 'text/xml')
          const entries = xmlDoc.querySelectorAll('entry')
          
          if (entries.length > 0) {
            const latestEntry = entries[0]
            const videoUrl = latestEntry.querySelector('link')?.getAttribute('href')
            const extractedVideoId = videoUrl?.split('v=')[1]
            
            if (extractedVideoId) {
              setVideoId(extractedVideoId)
              setIsLoading(false)
              return
            }
          }
        }
        
        throw new Error('RSS feed failed')
        
      } catch (err) {
        setVideoId(fallbackVideoId)
      }
      
      setIsLoading(false)
    }

    const checkLiveStatus = () => {
      const now = new Date()
      const day = now.getDay()
      const hour = now.getHours()
      
      const isLiveTime = day === 3 && hour >= 11 && hour < 14
      setIsLive(isLiveTime)
    }

    checkLiveStatus()
    fetchLatestVideo()
    
    const interval = setInterval(() => {
      checkLiveStatus()
      if (Math.random() < 0.1) {
        fetchLatestVideo()
      }
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="w-full h-[200px] lg:fixed lg:top-9 lg:left-0 lg:w-[63%] lg:h-[calc(100vh-2.25rem)] bg-black border-r border-line flex items-center justify-center pt-0 lg:pt-0 static lg:static">
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <p className="text-white text-xl font-bold mb-2" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
              LOADING...
            </p>
            <p className="text-white/70 text-sm" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
              Fetching latest video
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (videoId) {
    const embedUrl = isLive 
      ? `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=0&mute=0`
      : `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0`
    
    return (
      <div className="w-full h-[200px] lg:fixed lg:top-9 lg:left-0 lg:w-[63%] lg:h-[calc(100vh-2.25rem)] bg-black border-r border-line flex items-center justify-center pt-0 lg:pt-0 static lg:static">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={isLive ? "The Rollup Live Stream" : "Latest The Rollup Video"}
        />
      </div>
    )
  }

  return (
    <div className="w-full h-[200px] lg:fixed lg:top-9 lg:left-0 lg:w-[63%] lg:h-[calc(100vh-2.25rem)] bg-black border-r border-line flex items-center justify-center pt-0 lg:pt-0 static lg:static">
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <p className="text-white text-xl font-bold mb-2" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
            {isLive ? 'LIVE NOW' : 'NOT LIVE'}
          </p>
          <p className="text-white/70 text-sm" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
            The Rollup streams Wednesdays
          </p>
        </div>
      </div>
    </div>
  )
}