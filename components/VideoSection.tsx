'use client'

import { useEffect, useRef } from 'react'

export default function VideoSection() {
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function checkLive() {
      try {
        const liveRes = await fetch('https://tbpn-scroll.vercel.app/api/getCurrentVideo')
        const liveData = await liveRes.json()
        embedVideo(liveData.videoId)
      } catch (e) {
        console.error('Failed to load video:', e)
        handleError()
      }
    }

    function embedVideo(videoId: string) {
      if (!videoContainerRef.current) return

      const iframe = document.createElement("iframe")
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1`
      iframe.setAttribute("playsinline", "true")
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture")
      iframe.setAttribute("allowfullscreen", "true")
      iframe.style.width = "100%"
      iframe.style.height = "100%"
      iframe.style.border = "none"

      // Clear container and add iframe
      videoContainerRef.current.innerHTML = ''
      videoContainerRef.current.appendChild(iframe)
    }

    function handleError() {
      if (!videoContainerRef.current) return
      
      videoContainerRef.current.innerHTML = `
        <div class="flex items-center justify-center h-full text-white">
          <div class="text-center">
            <p class="text-lg mb-2">Unable to load video</p>
            <p class="text-sm opacity-75">Please check back later</p>
          </div>
        </div>
      `
      console.error('Error loading video')
    }

    checkLive()
  }, [])

  return (
    <div className="w-full h-[200px] lg:fixed lg:top-9 lg:left-0 lg:w-[63%] lg:h-[calc(100vh-2.25rem)] bg-black border-r border-[#656565] flex items-center justify-center pt-0 lg:pt-0 static lg:static">
      <div 
        ref={videoContainerRef}
        className="video-container"
      >
        <div className="loading hidden"></div>
      </div>
    </div>
  )
}