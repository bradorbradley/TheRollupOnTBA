// Bull-Meter API: Update Prompt
// POST /api/bullmeter/update

import { NextRequest, NextResponse } from 'next/server';

const state = require('../../../../server/bullmeter/state');
const { emitPromptUpdate } = require('../../../../server/bullmeter/socket');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { streamId, text, extendSec } = body;
        
        // Validation
        if (!streamId || typeof streamId !== 'string') {
            return NextResponse.json(
                { error: 'streamId is required and must be a string' },
                { status: 400 }
            );
        }
        
        // At least one update field is required
        if (!text && !extendSec) {
            return NextResponse.json(
                { error: 'At least one of text or extendSec is required' },
                { status: 400 }
            );
        }
        
        // Validate text if provided
        if (text !== undefined && (typeof text !== 'string' || text.length === 0)) {
            return NextResponse.json(
                { error: 'text must be a non-empty string if provided' },
                { status: 400 }
            );
        }
        
        // Validate extendSec if provided
        if (extendSec !== undefined && (typeof extendSec !== 'number' || extendSec < 1)) {
            return NextResponse.json(
                { error: 'extendSec must be a positive number if provided' },
                { status: 400 }
            );
        }
        
        // Update the prompt
        const updates: any = {};
        if (text !== undefined) updates.text = text.trim();
        if (extendSec !== undefined) updates.extendSec = extendSec;
        
        const prompt = state.updatePrompt(streamId, updates);
        
        // Emit update to clients
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
        console.error('Bull-Meter update prompt error:', error);
        
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