import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Farcaster webhook called')
    
    const body = await request.json()
    console.log('Webhook payload:', JSON.stringify(body, null, 2))
    
    // Handle different webhook events here
    // For now, just log and return success
    
    return NextResponse.json({ 
      success: true,
      message: 'Webhook received successfully'
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'The Rollup webhook is active',
    timestamp: new Date().toISOString()
  })
}