// Bull-Meter API: Submit Vote (Testing Only)
// POST /api/bullmeter/vote

import { NextRequest, NextResponse } from 'next/server';

const state = require('../../../../server/bullmeter/state');
const { emitVote, checkRateLimit } = require('../../../../server/bullmeter/socket');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { streamId, side, credits, user } = body;
        
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
        
        if (!credits || typeof credits !== 'number' || credits < 1) {
            return NextResponse.json(
                { error: 'credits must be a positive number' },
                { status: 400 }
            );
        }
        
        if (!user || !user.name) {
            return NextResponse.json(
                { error: 'user.name is required' },
                { status: 400 }
            );
        }
        
        // Rate limiting (basic IP-based for testing)
        const clientIP = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown';
        
        if (!checkRateLimit(clientIP, 10)) {
            return NextResponse.json(
                { error: 'Rate limit exceeded - max 10 votes per second' },
                { status: 429 }
            );
        }
        
        // Add the vote
        const vote = state.addVote(streamId, {
            side,
            credits,
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
            emitVote(io, streamId, vote);
        }
        
        return NextResponse.json({
            success: true,
            vote: {
                id: vote.id,
                side: vote.side,
                credits: vote.credits,
                user: vote.user,
                timestamp: vote.timestamp
            }
        });
        
    } catch (error) {
        console.error('Bull-Meter vote error:', error);
        
        if (error.message === 'No active prompt found') {
            return NextResponse.json(
                { error: 'No active prompt found for this stream' },
                { status: 404 }
            );
        }
        
        if (error.message === 'Prompt is not accepting votes') {
            return NextResponse.json(
                { error: 'Prompt is not currently accepting votes' },
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