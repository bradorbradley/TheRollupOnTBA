// Bull-Meter API: Start Prompt
// POST /api/bullmeter/start

import { NextRequest, NextResponse } from 'next/server';

// Import state management (will be available after server integration)
const state = require('../../../../server/bullmeter/state');
const { emitPromptStart } = require('../../../../server/bullmeter/socket');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { streamId, text, durationSec, mode } = body;
        
        // Validation
        if (!streamId || typeof streamId !== 'string') {
            return NextResponse.json(
                { error: 'streamId is required and must be a string' },
                { status: 400 }
            );
        }
        
        if (!text || typeof text !== 'string' || text.length === 0) {
            return NextResponse.json(
                { error: 'text is required and must be a non-empty string' },
                { status: 400 }
            );
        }
        
        if (!durationSec || typeof durationSec !== 'number' || durationSec < 10) {
            return NextResponse.json(
                { error: 'durationSec is required and must be at least 10 seconds' },
                { status: 400 }
            );
        }
        
        // Create the prompt
        const prompt = state.startPrompt(streamId, {
            text: text.trim(),
            durationSec,
            mode: mode || 'balloons',
            hostId: 'api_user', // TODO: get from auth
            minVoteCredits: 2,
            spamCreditCost: 1
        });
        
        // Get socket.io instance (will be available after server integration)
        const io = (global as any).bullmeterIO;
        if (io) {
            emitPromptStart(io, streamId, prompt);
        }
        
        // Return prompt info (safe subset)
        return NextResponse.json({
            success: true,
            prompt: {
                id: prompt.id,
                text: prompt.text,
                status: prompt.status,
                startedAt: prompt.startedAt,
                endsAt: prompt.endsAt,
                mode: prompt.mode,
                streamId: prompt.streamId
            }
        });
        
    } catch (error) {
        console.error('Bull-Meter start prompt error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// OPTIONS for CORS
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