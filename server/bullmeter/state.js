// Bull-Meter State Management
// In-memory state for prompts, votes, and game logic per streamId

const prompts = new Map(); // streamId -> prompt state
const votes = new Map();   // promptId -> array of votes
const spam = new Map();    // promptId -> array of spam events

// Prompt state structure
function createPrompt(data) {
    return {
        id: generatePromptId(),
        streamId: data.streamId,
        text: data.text,
        status: 'live', // 'idle', 'live', 'revealed', 'settled'
        startedAt: new Date(),
        endsAt: new Date(Date.now() + (data.durationSec * 1000)),
        mode: data.mode || 'balloons',
        minVoteCredits: data.minVoteCredits || 2,
        spamCreditCost: data.spamCreditCost || 1,
        
        // Hidden tallies (not sent to client during round)
        bullCredits: 0,
        bearCredits: 0,
        
        // Metadata
        createdAt: new Date(),
        hostId: data.hostId || 'default',
        guestAddr: data.guestAddr || null
    };
}

// Vote structure
function createVote(data) {
    return {
        id: generateVoteId(),
        promptId: data.promptId,
        userId: data.userId || 'anonymous',
        side: data.side, // 'bull' or 'bear'
        credits: data.credits,
        user: data.user, // {name, pfpUrl}
        timestamp: new Date(),
        ipAddress: data.ipAddress || null
    };
}

// Spam structure
function createSpamEvent(data) {
    return {
        id: generateSpamId(),
        promptId: data.promptId,
        userId: data.userId || 'anonymous',
        side: data.side,
        tier: data.tier, // 1, 2, or 3
        user: data.user,
        timestamp: new Date(),
        ipAddress: data.ipAddress || null
    };
}

// State management functions
function startPrompt(streamId, data) {
    const prompt = createPrompt({ ...data, streamId });
    
    // End any existing prompt for this stream
    const existing = prompts.get(streamId);
    if (existing && existing.status === 'live') {
        existing.status = 'ended';
    }
    
    prompts.set(streamId, prompt);
    votes.set(prompt.id, []);
    spam.set(prompt.id, []);
    
    console.log(`Started prompt for stream ${streamId}:`, prompt.text);
    return prompt;
}

function updatePrompt(streamId, updates) {
    const prompt = prompts.get(streamId);
    if (!prompt) {
        throw new Error('No active prompt found');
    }
    
    if (updates.text !== undefined) {
        prompt.text = updates.text;
    }
    
    if (updates.extendSec !== undefined) {
        const currentEnd = new Date(prompt.endsAt);
        prompt.endsAt = new Date(currentEnd.getTime() + (updates.extendSec * 1000));
    }
    
    console.log(`Updated prompt for stream ${streamId}`);
    return prompt;
}

function endPrompt(streamId) {
    const prompt = prompts.get(streamId);
    if (!prompt) {
        throw new Error('No active prompt found');
    }
    
    prompt.status = 'ended';
    prompt.endsAt = new Date(); // End immediately
    
    console.log(`Ended prompt for stream ${streamId}`);
    return prompt;
}

function addVote(streamId, voteData) {
    const prompt = prompts.get(streamId);
    if (!prompt) {
        throw new Error('No active prompt found');
    }
    
    if (prompt.status !== 'live') {
        throw new Error('Prompt is not accepting votes');
    }
    
    const vote = createVote({
        ...voteData,
        promptId: prompt.id
    });
    
    // Add to votes array
    const promptVotes = votes.get(prompt.id) || [];
    promptVotes.push(vote);
    votes.set(prompt.id, promptVotes);
    
    // Update hidden tallies
    if (vote.side === 'bull') {
        prompt.bullCredits += vote.credits;
    } else {
        prompt.bearCredits += vote.credits;
    }
    
    console.log(`Added vote: ${vote.side} ${vote.credits} credits (${prompt.bullCredits} bull, ${prompt.bearCredits} bear)`);
    return vote;
}

function addSpam(streamId, spamData) {
    const prompt = prompts.get(streamId);
    if (!prompt) {
        throw new Error('No active prompt found');
    }
    
    if (prompt.status !== 'live') {
        throw new Error('Prompt is not accepting spam');
    }
    
    const spamEvent = createSpamEvent({
        ...spamData,
        promptId: prompt.id
    });
    
    // Add to spam array
    const promptSpam = spam.get(prompt.id) || [];
    promptSpam.push(spamEvent);
    spam.set(prompt.id, promptSpam);
    
    console.log(`Added spam: ${spamEvent.side} tier ${spamEvent.tier}`);
    return spamEvent;
}

function revealPrompt(streamId) {
    const prompt = prompts.get(streamId);
    if (!prompt) {
        throw new Error('No active prompt found');
    }
    
    prompt.status = 'revealed';
    
    const total = prompt.bullCredits + prompt.bearCredits;
    const bullPct = total > 0 ? Math.round((prompt.bullCredits / total) * 100) : 0;
    const bearPct = total > 0 ? Math.round((prompt.bearCredits / total) * 100) : 0;
    const winnerSide = prompt.bullCredits > prompt.bearCredits ? 'bull' : 'bear';
    
    const result = {
        promptId: prompt.id,
        winnerSide,
        bullCredits: prompt.bullCredits,
        bearCredits: prompt.bearCredits,
        bullPct,
        bearPct,
        totalCredits: total
    };
    
    console.log(`Revealed prompt for stream ${streamId}:`, result);
    return result;
}

// Query functions
function getPrompt(streamId) {
    return prompts.get(streamId);
}

function getPromptVotes(promptId) {
    return votes.get(promptId) || [];
}

function getPromptSpam(promptId) {
    return spam.get(promptId) || [];
}

function getAllPrompts() {
    return Array.from(prompts.values());
}

function getActivePrompts() {
    return Array.from(prompts.values()).filter(p => p.status === 'live');
}

// Cleanup functions
function cleanupExpiredPrompts() {
    const now = new Date();
    let cleaned = 0;
    
    for (const [streamId, prompt] of prompts.entries()) {
        // Auto-end expired prompts
        if (prompt.status === 'live' && new Date(prompt.endsAt) < now) {
            prompt.status = 'ended';
            console.log(`Auto-ended expired prompt for stream ${streamId}`);
        }
        
        // Clean up old revealed/settled prompts (older than 1 hour)
        if (['revealed', 'settled'].includes(prompt.status)) {
            const ageMs = now - new Date(prompt.createdAt);
            if (ageMs > 60 * 60 * 1000) { // 1 hour
                prompts.delete(streamId);
                votes.delete(prompt.id);
                spam.delete(prompt.id);
                cleaned++;
            }
        }
    }
    
    if (cleaned > 0) {
        console.log(`Cleaned up ${cleaned} old prompts`);
    }
}

// Auto-cleanup every 5 minutes
setInterval(cleanupExpiredPrompts, 5 * 60 * 1000);

// Utility functions
function generatePromptId() {
    return 'prompt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateVoteId() {
    return 'vote_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateSpamId() {
    return 'spam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Public stats (safe to expose)
function getPromptStats(streamId) {
    const prompt = prompts.get(streamId);
    if (!prompt) return null;
    
    const promptVotes = votes.get(prompt.id) || [];
    const promptSpam = spam.get(prompt.id) || [];
    
    return {
        id: prompt.id,
        text: prompt.text,
        status: prompt.status,
        startedAt: prompt.startedAt,
        endsAt: prompt.endsAt,
        mode: prompt.mode,
        voteCount: promptVotes.length,
        spamCount: promptSpam.length,
        // Don't expose bullCredits/bearCredits unless revealed
        ...(prompt.status === 'revealed' ? {
            bullCredits: prompt.bullCredits,
            bearCredits: prompt.bearCredits
        } : {})
    };
}

module.exports = {
    startPrompt,
    updatePrompt,
    endPrompt,
    addVote,
    addSpam,
    revealPrompt,
    getPrompt,
    getPromptVotes,
    getPromptSpam,
    getAllPrompts,
    getActivePrompts,
    getPromptStats,
    cleanupExpiredPrompts
};