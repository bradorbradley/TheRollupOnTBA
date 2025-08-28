// Bull-Meter API: Reveal Results
// POST /api/bullmeter/reveal

import { NextRequest, NextResponse } from 'next/server';

const state = require('../../../../server/bullmeter/state');
const { emitReveal } = require('../../../../server/bullmeter/socket');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { streamId } = body;
        
        // Validation
        if (!streamId || typeof streamId !== 'string') {
            return NextResponse.json(
                { error: 'streamId is required and must be a string' },
                { status: 400 }
            );
        }
        
        // Reveal the prompt results
        const result = state.revealPrompt(streamId);
        
        // Emit reveal to clients
        const io = (global as any).bullmeterIO;
        if (io) {
            emitReveal(io, streamId, result);
        }
        
        return NextResponse.json({
            success: true,
            result: {
                promptId: result.promptId,
                winnerSide: result.winnerSide,
                bullCredits: result.bullCredits,
                bearCredits: result.bearCredits,
                bullPct: result.bullPct,
                bearPct: result.bearPct,
                totalCredits: result.totalCredits
            }
        });
        
    } catch (error) {
        console.error('Bull-Meter reveal prompt error:', error);
        
        if (error.message === 'No active prompt found') {
            return NextResponse.json(
                { error: 'No active prompt found for this stream' },
                { status: 404 }
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