// Bull-Meter API: Submit Spam Reaction (Testing Only)
// POST /api/bullmeter/spam

import { NextRequest, NextResponse } from 'next/server';

const state = require('../../../../server/bullmeter/state');
const { emitSpam, checkRateLimit } = require('../../../../server/bullmeter/socket');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { streamId, side, tier, user } = body;
        
        // Validation
        if (!streamId || typeof streamId !== 'string') {
            return NextResponse.json(
                { error: 'streamId is required and must be a string' },
                { status: 400 }
            );
        }
        
        if (!side || !['bull', 'bear'].includes(side)) {
            return NextResponse.json(
                { error: 'side must be either "bull" or "bear"' },
                { status: 400 }
            );
        }
        
        if (!tier || ![1, 2, 3].includes(tier)) {
            return NextResponse.json(
                { error: 'tier must be 1, 2, or 3' },
                { status: 400 }
            );
        }
        
        if (!user || !user.name) {
            return NextResponse.json(
                { error: 'user.name is required' },
                { status: 400 }
            );
        }
        
        // Rate limiting (more permissive for spam)
        const clientIP = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown';
        
        if (!checkRateLimit(clientIP + '_spam', 5)) {
            return NextResponse.json(
                { error: 'Rate limit exceeded - max 5 spam per second' },
                { status: 429 }
            );
        }
        
        // Add the spam event
        const spamEvent = state.addSpam(streamId, {
            side,
            tier,
            user: {
                name: user.name,
                pfpUrl: user.pfpUrl || null
            },
            userId: 'test_api_user',
            ipAddress: clientIP
        });
        
        // Emit to clients
        const io = (global as any).bullmeterIO;
        if (io) {
            emitSpam(io, streamId, spamEvent);
        }
        
        return NextResponse.json({
            success: true,
            spam: {
                id: spamEvent.id,
                side: spamEvent.side,
                tier: spamEvent.tier,
                user: spamEvent.user,
                timestamp: spamEvent.timestamp
            }
        });
        
    } catch (error) {
        console.error('Bull-Meter spam error:', error);
        
        if (error.message === 'No active prompt found') {
            return NextResponse.json(
                { error: 'No active prompt found for this stream' },
                { status: 404 }
            );
        }
        
        if (error.message === 'Prompt is not accepting spam') {
            return NextResponse.json(
                { error: 'Prompt is not currently accepting spam' },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}