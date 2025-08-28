// Bull-Meter Fight Arena JavaScript
// Tekken-style fight system with PFP fighters and combat animations

// Global state
let isEditMode = false;
let selectedElement = null;
let isDragging = false;
let isResizing = false;
let socket = null;
let streamId = 'rollup';
let fightState = null;
let timerInterval = null;
let activeFighters = new Map(); // Track active PFP fighters
let fightQueue = []; // Queue for managing fight density

// Editor state
let editorState = {
    prompt: 'ETH will be the best performer in 12 months',
    durationMin: 5,
    leftFighter: { name: 'BEAR', image: null, color: '#FF5A5A' },
    rightFighter: { name: 'BULL', image: null, color: '#22C55E' },
    layout: {
        promptBox: { x: 460, y: 50, w: 1000, h: 100 },
        arenaBox: { x: 200, y: 200, w: 1520, h: 600 }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFightArena();
    setupSocket();
    loadEditorState();
    scaleToFit();
    window.addEventListener('resize', scaleToFit);
});

// Main initialization
function initializeFightArena() {
    const urlParams = new URLSearchParams(window.location.search);
    streamId = urlParams.get('streamId') || 'rollup';
    isEditMode = urlParams.get('edit') === '1';
    
    // Set edit mode class
    document.body.classList.toggle('edit-mode', isEditMode);
    
    // Initialize editor if in edit mode
    if (isEditMode) {
        initializeEditor();
        updateFighterDisplay();
    }
    
    // Start neutral shimmer animation
    startNeutralShimmer();
}

// Socket.IO setup for Bull-Meter namespace
function setupSocket() {
    socket = io('/bullmeter');
    
    // Join the stream room
    socket.emit('join-room', streamId);
    
    // Socket event listeners
    socket.on('prompt:start', handleFightStart);
    socket.on('prompt:update', handleFightUpdate);
    socket.on('vote:new', handleVoteFight);
    socket.on('spam:new', handleSpamFight);
    socket.on('prompt:reveal', handleFightReveal);
    
    socket.on('connect', () => {
        console.log('Connected to Fight Arena');
        socket.emit('join-room', streamId);
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from Fight Arena');
    });
}

// Scale container to fit screen
function scaleToFit() {
    const container = document.getElementById('scale-container');
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const scaleX = windowWidth / 1920;
    const scaleY = windowHeight / 1080;
    const scale = Math.min(scaleX, scaleY);
    
    container.style.transform = `scale(${scale})`;
}

// Editor initialization
function initializeEditor() {
    setupEditorControls();
    setupDragResize();
    
    // Load fighter config from inputs
    document.getElementById('prompt-input').value = editorState.prompt;
    document.getElementById('timer-select').value = editorState.durationMin;
    document.getElementById('left-name').value = editorState.leftFighter.name;
    document.getElementById('right-name').value = editorState.rightFighter.name;
    document.getElementById('left-color').value = editorState.leftFighter.color;
    document.getElementById('right-color').value = editorState.rightFighter.color;
}

function setupEditorControls() {
    // Fighter configuration
    document.getElementById('left-name').addEventListener('input', updateLeftFighter);
    document.getElementById('right-name').addEventListener('input', updateRightFighter);
    document.getElementById('left-color').addEventListener('change', updateLeftFighter);
    document.getElementById('right-color').addEventListener('change', updateRightFighter);
    document.getElementById('left-image').addEventListener('input', updateLeftFighter);
    document.getElementById('right-image').addEventListener('input', updateRightFighter);
    
    // File uploads
    document.getElementById('left-upload').addEventListener('change', (e) => handleImageUpload(e, 'left'));
    document.getElementById('right-upload').addEventListener('change', (e) => handleImageUpload(e, 'right'));
    
    // Fight controls
    document.getElementById('swap-fighters').addEventListener('click', swapFighters);
    document.getElementById('start-fight').addEventListener('click', startFight);
    document.getElementById('extend-timer').addEventListener('click', extendTimer);
    document.getElementById('end-fight').addEventListener('click', endFight);
    document.getElementById('reveal-winner').addEventListener('click', revealWinner);
    
    // Preview buttons
    document.getElementById('preview-left').addEventListener('click', () => previewPunch('bear'));
    document.getElementById('preview-right').addEventListener('click', () => previewPunch('bull'));
    
    // Layout controls
    document.getElementById('save-layout').addEventListener('click', saveEditorState);
    document.getElementById('reset-layout').addEventListener('click', resetLayout);
    document.getElementById('copy-obs-url').addEventListener('click', copyObsUrl);
    
    updateFightControls();
}

// Fighter configuration updates
function updateLeftFighter() {
    editorState.leftFighter.name = document.getElementById('left-name').value.toUpperCase() || 'BEAR';
    editorState.leftFighter.color = document.getElementById('left-color').value;
    editorState.leftFighter.image = document.getElementById('left-image').value;
    updateFighterDisplay();
    updateHealthBarColors();
}

function updateRightFighter() {
    editorState.rightFighter.name = document.getElementById('right-name').value.toUpperCase() || 'BULL';
    editorState.rightFighter.color = document.getElementById('right-color').value;
    editorState.rightFighter.image = document.getElementById('right-image').value;
    updateFighterDisplay();
    updateHealthBarColors();
}

function updateFighterDisplay() {
    // Update left fighter
    const leftNameEl = document.getElementById('left-name-display');
    const leftPortraitEl = document.getElementById('left-portrait');
    leftNameEl.textContent = editorState.leftFighter.name;
    
    if (editorState.leftFighter.image) {
        leftPortraitEl.innerHTML = `<img src="${editorState.leftFighter.image}" alt="${editorState.leftFighter.name}">`;
    } else {
        leftPortraitEl.innerHTML = '🐻';
    }
    
    // Update right fighter
    const rightNameEl = document.getElementById('right-name-display');
    const rightPortraitEl = document.getElementById('right-portrait');
    rightNameEl.textContent = editorState.rightFighter.name;
    
    if (editorState.rightFighter.image) {
        rightPortraitEl.innerHTML = `<img src="${editorState.rightFighter.image}" alt="${editorState.rightFighter.name}">`;
    } else {
        rightPortraitEl.innerHTML = '🐂';
    }
}

function updateHealthBarColors() {
    document.documentElement.style.setProperty('--bear-color', editorState.leftFighter.color);
    document.documentElement.style.setProperty('--bull-color', editorState.rightFighter.color);
}

function handleImageUpload(event, side) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        if (side === 'left') {
            document.getElementById('left-image').value = e.target.result;
            updateLeftFighter();
        } else {
            document.getElementById('right-image').value = e.target.result;
            updateRightFighter();
        }
    };
    reader.readAsDataURL(file);
}

function swapFighters() {
    const temp = { ...editorState.leftFighter };
    editorState.leftFighter = { ...editorState.rightFighter };
    editorState.rightFighter = temp;
    
    // Update inputs
    document.getElementById('left-name').value = editorState.leftFighter.name;
    document.getElementById('right-name').value = editorState.rightFighter.name;
    document.getElementById('left-color').value = editorState.leftFighter.color;
    document.getElementById('right-color').value = editorState.rightFighter.color;
    document.getElementById('left-image').value = editorState.leftFighter.image || '';
    document.getElementById('right-image').value = editorState.rightFighter.image || '';
    
    updateFighterDisplay();
    updateHealthBarColors();
}

// Fight control functions
async function startFight() {
    const promptText = document.getElementById('prompt-input').value.trim();
    const timerMinutes = parseInt(document.getElementById('timer-select').value);
    
    if (!promptText) {
        alert('Please enter a prompt');
        return;
    }
    
    try {
        const response = await fetch('/api/bullmeter/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                streamId: streamId,
                text: promptText,
                durationSec: timerMinutes * 60,
                mode: 'fight'
            })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('Fight started:', result.prompt);
            updateFightControls();
        } else {
            alert('Error starting fight: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error starting fight:', error);
        alert('Error starting fight: ' + error.message);
    }
}

async function extendTimer() {
    try {
        const response = await fetch('/api/bullmeter/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                streamId: streamId,
                extendSec: 60
            })
        });
        
        const result = await response.json();
        if (!result.success) {
            alert('Error extending timer: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error extending timer:', error);
        alert('Error extending timer: ' + error.message);
    }
}

async function endFight() {
    if (!confirm('End the fight early?')) return;
    
    try {
        const response = await fetch('/api/bullmeter/end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ streamId: streamId })
        });
        
        const result = await response.json();
        if (!result.success) {
            alert('Error ending fight: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error ending fight:', error);
        alert('Error ending fight: ' + error.message);
    }
}

async function revealWinner() {
    if (!confirm('Reveal the winner?')) return;
    
    try {
        const response = await fetch('/api/bullmeter/reveal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ streamId: streamId })
        });
        
        const result = await response.json();
        if (!result.success) {
            alert('Error revealing winner: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error revealing winner:', error);
        alert('Error revealing winner: ' + error.message);
    }
}

// Preview functions
function previewPunch(side) {
    const testUser = {
        name: side === 'bear' ? 'TestBear' : 'TestBull',
        pfpUrl: 'https://i.pravatar.cc/48?u=' + side
    };
    
    spawnFighter(side, testUser, 5); // 5 credits = heavy punch
}

// Socket event handlers
function handleFightStart(data) {
    console.log('Fight started:', data);
    fightState = { ...data, status: 'live' };
    
    // Update prompt display
    document.querySelector('.prompt-text').textContent = data.text;
    
    // Start timer
    startTimer(data.endsAt);
    
    // Hide KO overlay
    document.getElementById('ko-overlay').className = 'ko-hidden';
    
    // Reset health bars to neutral
    resetHealthBars();
    
    if (isEditMode) {
        updateFightControls();
    }
}

function handleFightUpdate(data) {
    console.log('Fight updated:', data);
    
    if (data.text) {
        document.querySelector('.prompt-text').textContent = data.text;
        if (fightState) fightState.text = data.text;
    }
    
    if (data.endsAt) {
        startTimer(data.endsAt);
        if (fightState) fightState.endsAt = data.endsAt;
    }
    
    if (isEditMode) {
        updateFightControls();
    }
}

function handleVoteFight(data) {
    console.log('Vote fight:', data);
    
    // Spawn PFP fighter and execute move
    spawnFighter(data.side, data.user, data.credits);
}

function handleSpamFight(data) {
    console.log('Spam fight:', data);
    
    // Spam = rapid light punches
    spawnFighter(data.side, data.user, data.tier);
}

function handleFightReveal(data) {
    console.log('Fight revealed:', data);
    
    // Update fight state
    if (fightState) {
        fightState.status = 'revealed';
    }
    
    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Animate health bars to final percentages
    animateHealthBars(data);
    
    // Show KO animation
    setTimeout(() => {
        showKoAnimation(data);
    }, 1200); // Wait for health bar animation
    
    if (isEditMode) {
        updateFightControls();
    }
}

// Timer functionality
function startTimer(endsAt) {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    const endTime = new Date(endsAt).getTime();
    const display = document.getElementById('main-timer');
    
    timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            display.textContent = '0:00';
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Fight animation system
function spawnFighter(side, user, weight) {
    // Cap concurrent fighters at 20
    if (activeFighters.size >= 20) {
        // Remove oldest fighter
        const oldestId = activeFighters.keys().next().value;
        removeFighter(oldestId);
    }
    
    const fighter = document.createElement('div');
    const fighterId = 'fighter_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    fighter.id = fighterId;
    fighter.className = 'pfp-fighter';
    
    // Scale by weight (credits)
    const scale = Math.max(0.9, Math.min(1.3, 1 + (weight - 1) * 0.1));
    fighter.style.transform = `scale(${scale})`;
    
    // Create PFP image or initials
    if (user.pfpUrl) {
        const img = document.createElement('img');
        img.src = user.pfpUrl;
        img.onerror = () => {
            fighter.classList.add('initials');
            fighter.textContent = getInitials(user.name);
        };
        fighter.appendChild(img);
    } else {
        fighter.classList.add('initials');
        fighter.textContent = getInitials(user.name);
    }
    
    // Position at center of fight stage
    const stage = document.querySelector('.fight-stage');
    const stageRect = stage.getBoundingClientRect();
    const containerRect = document.getElementById('arenaBox').getBoundingClientRect();
    
    const centerX = (stageRect.width / 2) - 24; // Half fighter width
    const centerY = (stageRect.height / 2) - 24; // Half fighter height
    
    fighter.style.left = centerX + 'px';
    fighter.style.top = centerY + 'px';
    
    // Add to fighters container
    document.getElementById('fighters-container').appendChild(fighter);
    activeFighters.set(fighterId, fighter);
    
    // Execute move based on weight and side
    setTimeout(() => {
        executeFightMove(fighter, side, weight);
    }, 100);
}

function executeFightMove(fighter, side, weight) {
    // Determine move type based on weight
    let moveClass;
    if (weight >= 5) {
        moveClass = side === 'bear' ? 'heavy-left' : 'heavy-right';
        createImpactEffect(side === 'bear' ? 'right' : 'left', 'heavy');
        screenShake();
    } else {
        moveClass = side === 'bear' ? 'punch-left' : 'punch-right';
        createImpactEffect(side === 'bear' ? 'right' : 'left', 'light');
    }
    
    // Apply animation
    fighter.classList.add(moveClass);
    
    // Remove fighter after animation
    const duration = weight >= 5 ? 900 : 700;
    setTimeout(() => {
        removeFighter(fighter.id);
    }, duration);
}

function removeFighter(fighterId) {
    const fighter = activeFighters.get(fighterId);
    if (fighter && fighter.parentNode) {
        fighter.remove();
        activeFighters.delete(fighterId);
    }
}

function createImpactEffect(side, intensity) {
    const stage = document.querySelector('.fight-stage');
    const effect = document.createElement('div');
    effect.className = 'impact-flash';
    
    // Position based on side
    const x = side === 'left' ? '20%' : '80%';
    const y = '50%';
    
    effect.style.left = x;
    effect.style.top = y;
    effect.style.transform = 'translate(-50%, -50%)';
    
    if (intensity === 'heavy') {
        effect.style.width = '150px';
        effect.style.height = '150px';
    }
    
    document.getElementById('impact-effects').appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.remove();
        }
    }, 300);
}

function screenShake() {
    const arena = document.getElementById('arenaBox');
    arena.classList.add('screen-shake-effect');
    setTimeout(() => {
        arena.classList.remove('screen-shake-effect');
    }, 200);
}

// Health bar animations
function startNeutralShimmer() {
    // Shimmer animation is handled by CSS
}

function resetHealthBars() {
    document.getElementById('left-health').style.width = '50%';
    document.getElementById('right-health').style.width = '50%';
    document.getElementById('percentages').style.display = 'none';
}

function animateHealthBars(data) {
    // Animate from 50/50 to actual percentages
    const leftPct = data.winnerSide === 'bear' ? data.bearPct : (100 - data.bullPct);
    const rightPct = data.winnerSide === 'bull' ? data.bullPct : (100 - data.bearPct);
    
    document.getElementById('left-health').style.width = leftPct + '%';
    document.getElementById('right-health').style.width = rightPct + '%';
    
    // Show percentages
    document.getElementById('left-percentage').textContent = leftPct + '%';
    document.getElementById('right-percentage').textContent = rightPct + '%';
    document.getElementById('percentages').style.display = 'flex';
    
    // Hide percentages after 3 seconds
    setTimeout(() => {
        document.getElementById('percentages').style.display = 'none';
    }, 3000);
}

function showKoAnimation(data) {
    const overlay = document.getElementById('ko-overlay');
    const winner = document.getElementById('ko-winner');
    const bullPct = document.getElementById('final-bull-pct');
    const bearPct = document.getElementById('final-bear-pct');
    
    // Set winner
    const winnerName = data.winnerSide === 'bull' ? editorState.rightFighter.name : editorState.leftFighter.name;
    winner.textContent = `${winnerName} WINS!`;
    winner.style.color = data.winnerSide === 'bull' ? editorState.rightFighter.color : editorState.leftFighter.color;
    
    // Set stats
    bullPct.textContent = data.bullPct + '%';
    bearPct.textContent = data.bearPct + '%';
    
    // Show overlay
    overlay.className = 'ko-shown';
    
    // Create confetti
    createConfetti();
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        overlay.className = 'ko-hidden';
    }, 5000);
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        
        container.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 4000);
    }
}

// Utility functions
function getInitials(name) {
    if (!name) return '??';
    
    const parts = name.split(/[\s.]+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Drag and resize functionality
function setupDragResize() {
    const draggableElements = document.querySelectorAll('.draggable');
    draggableElements.forEach(element => {
        bindDragResize(element, saveEditorState);
    });
}

function bindDragResize(element, onUpdate) {
    let startX, startY, startWidth, startHeight, startLeft, startTop;
    let isResizeHandle = false;
    let resizeDirection = '';
    
    // Main element drag (not resize handles)
    element.addEventListener('pointerdown', function(e) {
        if (e.target.classList.contains('resize-handle')) return;
        if (!isEditMode) return;
        
        selectedElement = element;
        updateSelection();
        
        isDragging = true;
        isResizeHandle = false;
        
        const rect = element.getBoundingClientRect();
        const container = document.getElementById('scale-container');
        const containerRect = container.getBoundingClientRect();
        const scale = containerRect.width / 1920;
        
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(element.style.left);
        startTop = parseInt(element.style.top);
        
        e.preventDefault();
        element.style.cursor = 'grabbing';
        
        const handleDrag = (e) => {
            if (!isDragging) return;
            
            const deltaX = (e.clientX - startX) / scale;
            const deltaY = (e.clientY - startY) / scale;
            
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;
            
            // Snap to 8px grid
            newLeft = Math.round(newLeft / 8) * 8;
            newTop = Math.round(newTop / 8) * 8;
            
            // Boundary constraints
            newLeft = Math.max(0, Math.min(1920 - parseInt(element.style.width), newLeft));
            newTop = Math.max(0, Math.min(1080 - parseInt(element.style.height), newTop));
            
            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
            
            onUpdate();
        };
        
        const handleDragEnd = () => {
            isDragging = false;
            element.style.cursor = 'grab';
            document.removeEventListener('pointermove', handleDrag);
            document.removeEventListener('pointerup', handleDragEnd);
        };
        
        document.addEventListener('pointermove', handleDrag);
        document.addEventListener('pointerup', handleDragEnd);
    });
    
    // Resize handles
    const resizeHandles = element.querySelectorAll('.resize-handle');
    resizeHandles.forEach(handle => {
        handle.addEventListener('pointerdown', function(e) {
            if (!isEditMode) return;
            
            selectedElement = element;
            updateSelection();
            
            isResizing = true;
            resizeDirection = handle.className.split(' ')[1];
            
            const container = document.getElementById('scale-container');
            const containerRect = container.getBoundingClientRect();
            const scale = containerRect.width / 1920;
            
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(element.style.width);
            startHeight = parseInt(element.style.height);
            startLeft = parseInt(element.style.left);
            startTop = parseInt(element.style.top);
            
            e.preventDefault();
            e.stopPropagation();
            
            const handleResize = (e) => {
                if (!isResizing) return;
                
                const deltaX = (e.clientX - startX) / scale;
                const deltaY = (e.clientY - startY) / scale;
                
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;
                
                switch (resizeDirection) {
                    case 'se':
                        newWidth = startWidth + deltaX;
                        newHeight = startHeight + deltaY;
                        break;
                    case 'sw':
                        newWidth = startWidth - deltaX;
                        newHeight = startHeight + deltaY;
                        newLeft = startLeft + deltaX;
                        break;
                    case 'ne':
                        newWidth = startWidth + deltaX;
                        newHeight = startHeight - deltaY;
                        newTop = startTop + deltaY;
                        break;
                    case 'nw':
                        newWidth = startWidth - deltaX;
                        newHeight = startHeight - deltaY;
                        newLeft = startLeft + deltaX;
                        newTop = startTop + deltaY;
                        break;
                }
                
                // Minimum size constraints
                newWidth = Math.max(200, newWidth);
                newHeight = Math.max(100, newHeight);
                
                // Snap to 8px grid
                newWidth = Math.round(newWidth / 8) * 8;
                newHeight = Math.round(newHeight / 8) * 8;
                newLeft = Math.round(newLeft / 8) * 8;
                newTop = Math.round(newTop / 8) * 8;
                
                element.style.width = newWidth + 'px';
                element.style.height = newHeight + 'px';
                element.style.left = newLeft + 'px';
                element.style.top = newTop + 'px';
                
                onUpdate();
            };
            
            const handleResizeEnd = () => {
                isResizing = false;
                document.removeEventListener('pointermove', handleResize);
                document.removeEventListener('pointerup', handleResizeEnd);
            };
            
            document.addEventListener('pointermove', handleResize);
            document.addEventListener('pointerup', handleResizeEnd);
        });
    });
}

function updateSelection() {
    document.querySelectorAll('.draggable').forEach(el => {
        el.classList.remove('selected');
    });
    if (selectedElement) {
        selectedElement.classList.add('selected');
    }
}

// State management
function saveEditorState() {
    // Save current layout
    editorState.layout.promptBox = getElementLayout('promptBox');
    editorState.layout.arenaBox = getElementLayout('arenaBox');
    
    // Save to localStorage
    localStorage.setItem('bullmeterEditor', JSON.stringify(editorState));
    
    console.log('Editor state saved:', editorState);
}

function loadEditorState() {
    const saved = localStorage.getItem('bullmeterEditor');
    if (saved) {
        try {
            const savedState = JSON.parse(saved);
            editorState = { ...editorState, ...savedState };
            applyLayout();
            console.log('Editor state loaded:', editorState);
        } catch (e) {
            console.warn('Invalid saved editor state');
        }
    }
}

function getElementLayout(id) {
    const el = document.getElementById(id);
    return {
        x: parseInt(el.style.left),
        y: parseInt(el.style.top),
        w: parseInt(el.style.width),
        h: parseInt(el.style.height)
    };
}

function applyLayout() {
    if (editorState.layout.promptBox) {
        setElementLayout('promptBox', editorState.layout.promptBox);
    }
    if (editorState.layout.arenaBox) {
        setElementLayout('arenaBox', editorState.layout.arenaBox);
    }
}

function setElementLayout(id, layout) {
    const el = document.getElementById(id);
    el.style.left = layout.x + 'px';
    el.style.top = layout.y + 'px';
    el.style.width = layout.w + 'px';
    el.style.height = layout.h + 'px';
}

function resetLayout() {
    editorState.layout = {
        promptBox: { x: 460, y: 50, w: 1000, h: 100 },
        arenaBox: { x: 200, y: 200, w: 1520, h: 600 }
    };
    applyLayout();
    saveEditorState();
}

function copyObsUrl() {
    const encodedState = btoa(JSON.stringify(editorState));
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?streamId=${streamId}&cfg=${encodedState}`;
    
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('copy-obs-url');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

function updateFightControls() {
    const hasActiveFight = fightState && fightState.status === 'live';
    const hasEndedFight = fightState && ['ended', 'live'].includes(fightState.status);
    
    document.getElementById('start-fight').disabled = hasActiveFight;
    document.getElementById('extend-timer').disabled = !hasActiveFight;
    document.getElementById('end-fight').disabled = !hasActiveFight;
    document.getElementById('reveal-winner').disabled = !hasEndedFight;
    
    // Update status
    const statusEl = document.getElementById('status-text');
    const timerEl = document.getElementById('timer-remaining');
    
    if (!fightState) {
        statusEl.textContent = 'No active fight';
        timerEl.textContent = '';
    } else {
        switch (fightState.status) {
            case 'live':
                statusEl.textContent = '🥊 Fight in progress';
                const timeLeft = Math.max(0, new Date(fightState.endsAt) - new Date());
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
                break;
            case 'ended':
                statusEl.textContent = '⏸️ Fight ended - Ready to reveal';
                timerEl.textContent = 'Voting closed';
                break;
            case 'revealed':
                statusEl.textContent = '🏆 Winner revealed';
                timerEl.textContent = 'Fight complete';
                break;
            default:
                statusEl.textContent = 'Unknown status';
                timerEl.textContent = '';
        }
    }
}