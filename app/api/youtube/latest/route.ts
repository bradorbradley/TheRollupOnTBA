import { NextRequest, NextResponse } from 'next/server'

// Returns the latest YouTube videoId for a given channelId
// Example: /api/youtube/latest?channelId=UCC2UPtfjtdAgofzuxUPZJ6g
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId') || 'UCC2UPtfjtdAgofzuxUPZJ6g'

    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`

    const upstream = await fetch(rssUrl, {
      // Cache at the edge for a short period to avoid hammering YouTube
      next: { revalidate: 300 },
      headers: {
        accept: 'application/atom+xml, text/xml, application/xml;q=0.9, */*;q=0.8',
        'user-agent': 'TheRollupOnTBA/1.0 (+https://therollup.co)'
      }
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch RSS' }, { status: upstream.status })
    }

    const xml = await upstream.text()

    // Prefer yt:videoId if present
    let match = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
    let videoId = match?.[1] || null

    if (!videoId) {
      // Fallback: parse from link href param v=VIDEO_ID
      match = xml.match(/<link[^>]+href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/)
      videoId = match?.[1] || null
    }

    if (!videoId) {
      return NextResponse.json({ error: 'Unable to parse latest videoId' }, { status: 502 })
    }

    return NextResponse.json(
      { videoId },
      {
        headers: {
          // Cache for 5 minutes on the CDN, allow brief staleness while revalidating
          'Cache-Control': 's-maxage=300, stale-while-revalidate=120'
        }
      }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


