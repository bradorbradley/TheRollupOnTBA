import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const cronSecret = request.headers.get('x-vercel-cron')
    if (cronSecret !== process.env.CRON_SECRET) {
      console.error('Unauthorized request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Cron job triggered at:', new Date().toISOString())
    
    console.log('Sending notification to Neynar...')
    const response = await fetch('https://api.neynar.com/v2/farcaster/frame/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEYNAR_API_KEY || '',
      },
      body: JSON.stringify({
        target_fids: [],
        notification: {
          title: 'TBPN is Live',
          body: 'John and Jordi are streaming now on Farcaster',
          target_url: 'https://tbpn-tba.vercel.app',
          uuid: randomUUID(),
        },
      }),
    })

    const data = await response.json()
    console.log('Neynar API response:', data)

    if (!response.ok) {
      throw new Error(`Failed to send notification: ${JSON.stringify(data)}`)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}