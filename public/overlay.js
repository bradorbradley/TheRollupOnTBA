// Overlay Editor with Exact Drag/Resize Implementation
const EDIT = new URLSearchParams(location.search).get('edit') === '1';
if (EDIT) document.body.classList.add('edit-mode');

function getScale() {
    const oc = document.getElementById('overlay-container');
    const r = oc.getBoundingClientRect();
    return r.width / 1920;
}

// Generic DRAG+RESIZE binder (reuse for BOTH boxes)
function bindDragResize(el, onDone) {
    const scaleEl = () => getScale();
    
    // Make entire element draggable (not just drag handle)
    el.addEventListener('pointerdown', e => {
        // Skip if clicking on resize handle
        if (e.target.classList.contains('resize-handle')) return;
        
        e.preventDefault();
        const scale = scaleEl();
        const oc = document.getElementById('overlay-container').getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        const start = {
            x: e.clientX,
            y: e.clientY,
            left: (rect.left - oc.left) / scale,
            top: (rect.top - oc.top) / scale
        };
        
        el.style.cursor = 'grabbing';
        
        function move(ev) {
            el.style.left = Math.round(start.left + (ev.clientX - start.x) / scale) + 'px';
            el.style.top = Math.round(start.top + (ev.clientY - start.y) / scale) + 'px';
        }
        
        function up() {
            el.style.cursor = '';
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            onDone?.();
        }
        
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
    });
    
    // resize
    el.querySelectorAll('.resize-handle').forEach(h => {
        h.addEventListener('pointerdown', e => {
            const dir = h.dataset.direction;
            const scale = scaleEl();
            const oc = document.getElementById('overlay-container').getBoundingClientRect();
            const r = el.getBoundingClientRect();
            const start = {
                x: e.clientX,
                y: e.clientY,
                left: (r.left - oc.left) / scale,
                top: (r.top - oc.top) / scale,
                w: r.width / scale,
                h: r.height / scale
            };
            
            function move(ev) {
                const dx = (ev.clientX - start.x) / scale;
                const dy = (ev.clientY - start.y) / scale;
                let X = start.left, Y = start.top, W = start.w, H = start.h;
                
                if (dir.includes('e')) W = Math.max(280, start.w + dx);
                if (dir.includes('s')) H = Math.max(64, start.h + dy);
                if (dir.includes('w')) { X = start.left + dx; W = Math.max(280, start.w - dx); }
                if (dir.includes('n')) { Y = start.top + dy; H = Math.max(64, start.h - dy); }
                
                Object.assign(el.style, {
                    left: `${Math.round(X)}px`,
                    top: `${Math.round(Y)}px`,
                    width: `${Math.round(W)}px`,
                    height: `${Math.round(H)}px`
                });
            }
            
            function up() {
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', up);
                onDone?.();
            }
            
            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up);
        });
    });
}

// Persist BOTH boxes
function loadLayout() {
    try {
        return JSON.parse(localStorage.getItem('rollupOverlayLayout')) || {};
    } catch {
        return {};
    }
}

function saveLayout(l) {
    localStorage.setItem('rollupOverlayLayout', JSON.stringify(l));
}

function persistBox(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    const lay = loadLayout();
    lay[key] = {
        x: parseInt(el.style.left || '0', 10),
        y: parseInt(el.style.top || '0', 10),
        w: parseInt(el.style.width || '0', 10),
        h: parseInt(el.style.height || '0', 10)
    };
    saveLayout(lay);
}

// Real tip pill uses saved tipPreview coords
function showTip({name, amount}) {
    const lay = loadLayout();
    const t = lay.tipPreview || {x: 1340, y: 860, w: 400, h: 60};
    const oc = document.getElementById('overlay-container');
    const pill = document.createElement('div');
    
    pill.className = 'tip-pill enter';
    Object.assign(pill.style, {
        left: `${t.x}px`,
        top: `${t.y}px`,
        width: `${t.w}px`,
        height: `${t.h}px`,
        position: 'absolute',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    pill.innerHTML = `<div class="row"><div class="name">🎉 ${name}</div><div class="amt">${amount} USDC</div></div>`;
    
    oc.appendChild(pill);
    requestAnimationFrame(() => pill.classList.add('active'));
    
    setTimeout(() => {
        pill.classList.add('exit');
        setTimeout(() => pill.remove(), 180);
    }, 4000);
}

// Initialize overlay manager
class OverlayManager {
    constructor() {
        this.socket = null;
        this.streamId = this.getStreamIdFromURL();
        this.isEditMode = EDIT;
        
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.audio = new Audio('/assets/tip.mp3');
        this.audio.volume = 0.7;
        
        this.init();
    }
    
    getStreamIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('streamId') || 'rollup';
    }
    
    init() {
        this.setupEditor();
        this.connectSocket();
        this.updateLeaderboard();
        
        // Update leaderboard every 30 seconds
        setInterval(() => {
            this.updateLeaderboard();
        }, 30000);
    }
    
    setupEditor() {
        if (EDIT) {
            const lay = loadLayout();
            
            // Apply saved sizes
            const lb = document.getElementById('leaderboardBox');
            if (lay.leaderboardBox) {
                Object.assign(lb.style, {
                    left: lay.leaderboardBox.x + 'px',
                    top: lay.leaderboardBox.y + 'px',
                    width: lay.leaderboardBox.w + 'px',
                    height: lay.leaderboardBox.h + 'px'
                });
            }
            
            const tp = document.getElementById('tipPreview');
            if (lay.tipPreview) {
                Object.assign(tp.style, {
                    left: lay.tipPreview.x + 'px',
                    top: lay.tipPreview.y + 'px',
                    width: lay.tipPreview.w + 'px',
                    height: lay.tipPreview.h + 'px'
                });
            }
            
            // Bind drag/resize
            bindDragResize(lb, () => persistBox('leaderboardBox', 'leaderboardBox'));
            bindDragResize(tp, () => persistBox('tipPreview', 'tipPreview'));
            
            // Fire preview toast button
            document.getElementById('fire-preview-toast')?.addEventListener('click', () => {
                showTip({ name: 'Preview User', amount: 5 });
            });
        }
    }
    
    connectSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.socket.emit('join-stream', this.streamId);
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
        
        this.socket.on('tip', (tipData) => {
            showTip(tipData);
            this.playAudio();
            
            setTimeout(() => {
                this.updateLeaderboard();
            }, 1000);
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });
    }
    
    async updateLeaderboard() {
        try {
            const response = await fetch(`/api/leaderboard?streamId=${this.streamId}`);
            const leaderboard = await response.json();
            this.renderLeaderboard(leaderboard);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    }
    
    renderLeaderboard(leaderboard) {
        // If no real data, show placeholder Basename examples
        if (leaderboard.length === 0) {
            const placeholders = [
                { rank: 1, name: 'alice.base.eth', total: 25.50 },
                { rank: 2, name: 'rollupfan.base.eth', total: 18.75 },
                { rank: 3, name: 'crypto-dev.base.eth', total: 12.00 },
                { rank: 4, name: '0x1234...abcd', total: 8.50 },
                { rank: 5, name: 'builder.base.eth', total: 5.25 }
            ];
            
            this.leaderboardList.innerHTML = placeholders
                .map(entry => `
                    <div class="leaderboard-entry placeholder" data-rank="${entry.rank}">
                        <span class="rank">${entry.rank}</span>
                        <span class="name">${entry.name}</span>
                        <span class="total">$${entry.total}</span>
                    </div>
                `)
                .join('') + '<div class="placeholder-note">Placeholder data - waiting for tips!</div>';
            return;
        }
        
        this.leaderboardList.innerHTML = leaderboard
            .map(entry => `
                <div class="leaderboard-entry" data-rank="${entry.rank}"${this.isEditMode ? ` title="${entry.address}"` : ''}>
                    <span class="rank">${entry.rank}</span>
                    <span class="name">${entry.name}</span>
                    <span class="total">$${entry.total}</span>
                </div>
            `)
            .join('');
    }
    
    playAudio() {
        if (this.audio.muted) return;
        
        this.audio.currentTime = 0;
        this.audio.play().catch(error => {
            console.log('Audio play failed:', error);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OverlayManager();
});