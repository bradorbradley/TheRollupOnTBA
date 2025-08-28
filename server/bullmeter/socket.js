// Bull-Meter Socket.IO Namespace Handler
// Manages real-time communication for Bull-Meter overlay

const state = require('./state');

function initBullmeterNamespace(io) {
    // Create separate namespace for Bull-Meter
    const bullmeterNamespace = io.of('/bullmeter');
    
    bullmeterNamespace.on('connection', (socket) => {
        console.log('Bull-Meter client connected:', socket.id);
        
        // Room management
        socket.on('join-room', (streamId) => {
            if (!streamId) return;
            
            // Leave any existing rooms
            socket.rooms.forEach(room => {
                if (room !== socket.id) {
                    socket.leave(room);
                }
            });
            
            // Join the stream room
            socket.join(streamId);
            console.log(`Socket ${socket.id} joined Bull-Meter room: ${streamId}`);
            
            // Send current prompt state if exists
            const prompt = state.getPrompt(streamId);
            if (prompt && prompt.status === 'live') {
                socket.emit('prompt:start', {
                    id: prompt.id,
                    text: prompt.text,
                    endsAt: prompt.endsAt,
                    mode: prompt.mode
                });
            }
        });
        
        // Test events (for development)
        socket.on('test-vote', (data) => {
            console.log('Test vote received:', data);
            
            try {
                // Add vote to state
                const vote = state.addVote(data.streamId, {
                    side: data.side,
                    credits: data.credits,
                    user: data.user,
                    userId: 'test_user',
                    ipAddress: socket.handshake.address
                });
                
                // Emit to room
                bullmeterNamespace.to(data.streamId).emit('vote:new', {
                    side: vote.side,
                    credits: vote.credits,
                    user: vote.user,
                    ts: vote.timestamp
                });
                
            } catch (error) {
                console.error('Test vote error:', error);
                socket.emit('error', { message: error.message });
            }
        });
        
        socket.on('test-spam', (data) => {
            console.log('Test spam received:', data);
            
            try {
                // Add spam to state
                const spamEvent = state.addSpam(data.streamId, {
                    side: data.side,
                    tier: data.tier,
                    user: data.user,
                    userId: 'test_user',
                    ipAddress: socket.handshake.address
                });
                
                // Emit to room
                bullmeterNamespace.to(data.streamId).emit('spam:new', {
                    side: spamEvent.side,
                    tier: spamEvent.tier,
                    user: spamEvent.user,
                    ts: spamEvent.timestamp
                });
                
            } catch (error) {
                console.error('Test spam error:', error);
                socket.emit('error', { message: error.message });
            }
        });
        
        socket.on('test-reveal', (data) => {
            console.log('Test reveal received:', data);
            
            // Emit reveal directly (for testing)
            bullmeterNamespace.to(data.streamId).emit('prompt:reveal', {
                winnerSide: data.winnerSide,
                bullCredits: data.bullCredits,
                bearCredits: data.bearCredits,
                bullPct: data.bullPct,
                bearPct: data.bearPct
            });
        });
        
        // Heartbeat to keep connection alive
        socket.on('heartbeat', (data) => {
            socket.emit('heartbeat-ack', { 
                timestamp: Date.now(),
                streamId: data.streamId 
            });
        });
        
        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log('Bull-Meter client disconnected:', socket.id, reason);
        });
        
        // Error handling
        socket.on('error', (error) => {
            console.error('Bull-Meter socket error:', error);
        });
    });
    
    return bullmeterNamespace;
}

// Helper functions for API to emit events
function emitPromptStart(io, streamId, prompt) {
    io.of('/bullmeter').to(streamId).emit('prompt:start', {
        id: prompt.id,
        text: prompt.text,
        endsAt: prompt.endsAt,
        mode: prompt.mode
    });
}

function emitPromptUpdate(io, streamId, prompt) {
    io.of('/bullmeter').to(streamId).emit('prompt:update', {
        text: prompt.text,
        endsAt: prompt.endsAt
    });
}

function emitVote(io, streamId, vote) {
    io.of('/bullmeter').to(streamId).emit('vote:new', {
        side: vote.side,
        credits: vote.credits,
        user: vote.user,
        ts: vote.timestamp
    });
}

function emitSpam(io, streamId, spamEvent) {
    io.of('/bullmeter').to(streamId).emit('spam:new', {
        side: spamEvent.side,
        tier: spamEvent.tier,
        user: spamEvent.user,
        ts: spamEvent.timestamp
    });
}

function emitReveal(io, streamId, result) {
    io.of('/bullmeter').to(streamId).emit('prompt:reveal', {
        winnerSide: result.winnerSide,
        bullCredits: result.bullCredits,
        bearCredits: result.bearCredits,
        bullPct: result.bullPct,
        bearPct: result.bearPct
    });
}

// Rate limiting helpers
const rateLimits = new Map(); // userId -> { lastAction, actionCount }

function checkRateLimit(userId, maxActionsPerSecond = 10) {
    const now = Date.now();
    const userLimits = rateLimits.get(userId) || { lastAction: 0, actionCount: 0 };
    
    // Reset counter if more than 1 second has passed
    if (now - userLimits.lastAction > 1000) {
        userLimits.actionCount = 0;
    }
    
    userLimits.lastAction = now;
    userLimits.actionCount++;
    rateLimits.set(userId, userLimits);
    
    return userLimits.actionCount <= maxActionsPerSecond;
}

// Cleanup rate limits every minute
setInterval(() => {
    const cutoff = Date.now() - 60000; // 1 minute ago
    for (const [userId, limits] of rateLimits.entries()) {
        if (limits.lastAction < cutoff) {
            rateLimits.delete(userId);
        }
    }
}, 60000);

module.exports = {
    initBullmeterNamespace,
    emitPromptStart,
    emitPromptUpdate,
    emitVote,
    emitSpam,
    emitReveal,
    checkRateLimit
};