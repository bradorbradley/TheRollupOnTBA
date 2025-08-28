'use client'

import { useState, useEffect } from 'react'

export default function VideoSection() {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)

  const channelId = 'UCC2UPtfjtdAgofzuxUPZJ6g'
  const uploadsPlaylistId = `UU${channelId.slice(2)}`

  useEffect(() => {
    async function resolveEmbeddable() {
      try {
        const response = await fetch(`/api/youtube/resolve?channelId=${channelId}`, { cache: 'no-store' })
        if (!response.ok) return
        const data: { isLive?: boolean; videoId?: string | null } = await response.json()
        if (typeof data.isLive === 'boolean') setIsLive(data.isLive)
        if (data.videoId) setVideoId(data.videoId)
      } catch {
        // swallow; fallback is playlist
      }
    }

    const checkLiveStatus = () => {
      const now = new Date()
      const day = now.getDay()
      const hour = now.getHours()
      
      const isLiveTime = day === 3 && hour >= 11 && hour < 14
      setIsLive(isLiveTime)
    }

    // Prefer server resolution; fall back to time-based hint only
    resolveEmbeddable()
    checkLiveStatus()
    
    const interval = setInterval(() => {
      checkLiveStatus()
      if (Math.random() < 0.1) {
        resolveEmbeddable()
      }
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const embedUrl = isLive
    ? `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&autoplay=0&mute=0`
    : videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&mute=0`
      : `https://www.youtube-nocookie.com/embed/videoseries?list=${uploadsPlaylistId}&autoplay=0&mute=0`

  return (
    <div className="w-full h-[260px] lg:fixed lg:top-9 lg:left-0 lg:w-[63%] lg:h-[calc(100vh-2.25rem)] bg-black border-r border-line flex items-center justify-center pt-0 lg:pt-0 static lg:static mt-2 lg:mt-0">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        frameBorder="0"
        referrerPolicy="origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={isLive ? "The Rollup Live Stream" : "Latest The Rollup Video"}
      />
    </div>
  )
}