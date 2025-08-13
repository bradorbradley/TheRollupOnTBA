import { NextRequest, NextResponse } from 'next/server'

// Resolve a playable embed for a channel: prefer live if truly live; otherwise first embeddable recent upload
// Example: /api/youtube/resolve?channelId=UCC2UPtfjtdAgofzuxUPZJ6g
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId') || 'UCC2UPtfjtdAgofzuxUPZJ6g'

    // 1) Check if live embed is embeddable via oEmbed (no API key)
    const liveEmbedUrl = `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(channelId)}`
    const liveOembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(liveEmbedUrl)}&format=json`
    let isLive = false

    try {
      const liveProbe = await fetch(liveOembedUrl, { next: { revalidate: 60 } })
      if (liveProbe.ok) {
        isLive = true
        return NextResponse.json(
          { isLive, videoId: null },
          { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=60' } }
        )
      }
    } catch {}

    // 2) Not live. Fetch RSS and find the first embeddable upload
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`
    const rss = await fetch(rssUrl, { next: { revalidate: 300 } })
    if (!rss.ok) {
      return NextResponse.json(
        { isLive: false, videoId: null, error: 'Failed to fetch RSS' },
        { status: 502, headers: { 'Cache-Control': 's-maxage=60' } }
      )
    }

    const xml = await rss.text()
    // Extract multiple yt:videoId entries (grab up to first 10)
    const idMatches = Array.from(xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)).map(m => m[1]).slice(0, 10)

    for (const candidateId of idMatches) {
      const watchUrl = `https://www.youtube.com/watch?v=${candidateId}`
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`
      try {
        const res = await fetch(oembedUrl, { next: { revalidate: 300 } })
        if (res.ok) {
          return NextResponse.json(
            { isLive: false, videoId: candidateId },
            { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=120' } }
          )
        }
      } catch {}
    }

    return NextResponse.json(
      { isLive: false, videoId: null, error: 'No embeddable uploads found' },
      { status: 404, headers: { 'Cache-Control': 's-maxage=60' } }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


