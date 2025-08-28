// Bull-Meter API: End Prompt Early
// POST /api/bullmeter/end

import { NextRequest, NextResponse } from 'next/server';

const state = require('../../../../server/bullmeter/state');
const { emitPromptUpdate } = require('../../../../server/bullmeter/socket');

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
        
        // End the prompt
        const prompt = state.endPrompt(streamId);
        
        // Emit update to clients (with immediate end time)
        const io = (global as any).bullmeterIO;
        if (io) {
            emitPromptUpdate(io, streamId, prompt);
        }
        
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
        console.error('Bull-Meter end prompt error:', error);
        
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