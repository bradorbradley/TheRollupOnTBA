'use client'

import { useEffect, useRef } from 'react'

export default function VideoSection() {
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function checkLive() {
      try {
        console.log('Loading The Rollup stream')
        embedTheRollupStream()
      } catch (e) {
        console.error('Failed to load The Rollup stream:', e)
        handleError()
      }
    }

    function embedTheRollupStream() {
      if (!videoContainerRef.current) return

      console.log('Creating iframe for The Rollup')
      
      // Clear container first
      videoContainerRef.current.innerHTML = ''
      
      // Create iframe with proper attributes
      const iframe = document.createElement("iframe")
      
      // The Rollup's channel live stream URL
      iframe.src = `https://www.youtube.com/embed/live_stream?channel=UCC2UPtfjtdAgofzuxUPZJ6g&autoplay=0&mute=0`
      iframe.width = "100%"
      iframe.height = "100%"
      iframe.frameBorder = "0"
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      iframe.allowFullscreen = true
      iframe.style.width = "100%"
      iframe.style.height = "100%"
      iframe.style.border = "none"
      iframe.style.display = "block"

      console.log('Iframe created with src:', iframe.src)
      console.log('Video container element:', videoContainerRef.current)

      // Append iframe
      videoContainerRef.current.appendChild(iframe)
      
      console.log('Iframe appended to container')
    }

    function handleError() {
      if (!videoContainerRef.current) return
      
      videoContainerRef.current.innerHTML = `
        <div class="flex items-center justify-center h-full text-white">
          <div class="text-center">
            <p class="text-lg mb-2">The Rollup Stream Loading...</p>
            <p class="text-sm opacity-75">Check back during live hours</p>
          </div>
        </div>
      `
      console.error('Error loading video')
    }

    checkLive()
  }, [])

  return (
    <div className="w-full h-[200px] lg:fixed lg:top-9 lg:left-0 lg:w-[63%] lg:h-[calc(100vh-2.25rem)] bg-black border-r border-line flex items-center justify-center pt-0 lg:pt-0 static lg:static">
      <div 
        ref={videoContainerRef}
        className="w-full h-full bg-gray-900"
        style={{ minHeight: '200px', minWidth: '100%' }}
      >
        <div className="loading hidden"></div>
      </div>
    </div>
  )
}