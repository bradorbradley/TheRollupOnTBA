import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { target_fids, title, body: notificationBody, target_url } = body

    if (!target_fids || !title || !notificationBody || !target_url) {
      return NextResponse.json(
        { error: 'Missing required fields: target_fids, title, body, or target_url' },
        { status: 400 }
      )
    }

    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

    if (!NEYNAR_API_KEY) {
      return NextResponse.json(
        { error: 'NEYNAR_API_KEY not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.neynar.com/v2/farcaster/frame/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NEYNAR_API_KEY,
      },
      body: JSON.stringify({
        target_fids, // can be "all" or an array of fids
        notification: {
          title,
          body: notificationBody,
          target_url,
          uuid: randomUUID(),
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: 'Failed to send notification', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}