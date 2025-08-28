# Bull-Meter Fight Arena

A Tekken-style fight overlay where audience votes become combat moves. Viewers' PFPs spawn as mini fighters executing attacks, building up to an epic KO reveal.

## 🥊 Fight System

**Core Concept:** Every vote is a battle move. Viewers become fighters. The audience controls the fight.

### Features
- **⚔️ Tekken-Style Combat** - PFP fighters spawn and execute moves based on votes
- **🏥 Health Bar Drama** - Neutral shimmer during fight, dramatic reveal at the end  
- **💥 Impact Physics** - Screen shake, impact flashes, and weight-based animations
- **👑 KO Animation** - Winner celebration with confetti and final statistics
- **🎮 Host Editor** - Full control panel for managing fights and customizing fighters
- **📺 OBS Ready** - 1920x1080 overlay with drag/resize editor

## Quick Start

### 1. Start the Server

```bash
npm run dev
```

### 2. Fight Arena URLs

- **Live Overlay:** `http://localhost:3000/plugins/bullmeter/overlay.html?streamId=rollup`
- **Fight Editor:** `http://localhost:3000/plugins/bullmeter/overlay.html?streamId=rollup&edit=1`

### 3. Add to OBS

1. Add **Browser Source** in OBS
2. URL: `http://localhost:3000/plugins/bullmeter/overlay.html?streamId=rollup`
3. Width: `1920`, Height: `1080`

## 🎮 Host Controls

### Fighter Editor
- **Name & Colors** - Customize left/right fighter names and colors
- **Portrait Images** - Upload custom fighter images or use URLs
- **Swap Fighters** - Instantly swap sides with one click
- **Preview Moves** - Test punch animations for both sides

### Fight Management
- **🚀 Start Fight** - Begin voting round with custom prompt and timer
- **⏱️ Extend Timer** - Add 60 seconds during active fight
- **⏹️ End Early** - Stop voting before timer expires
- **👑 Reveal Winner** - Trigger KO animation and show final percentages

### Layout Controls
- **Drag & Resize** - Move prompt and arena boxes anywhere on screen
- **Save Layout** - Persist your custom positioning
- **Copy OBS URL** - Generate shareable URL with embedded layout

## 🥋 Combat System

### Vote Weight = Move Power
- **1-2 Credits:** Light punch (quick animation)
- **3-4 Credits:** Medium combo (more impact)
- **5+ Credits:** Heavy attack (screen shake + big impact)

### Spam = Rapid Attacks
- **Tier 1:** Quick jabs
- **Tier 2:** Combo flurries  
- **Tier 3:** Special move barrage

### Fight Flow
1. **Neutral Phase** - Health bars shimmer, no totals revealed
2. **Combat Phase** - PFP fighters spawn at center, execute moves, fly to sides
3. **Density Control** - Max 20 concurrent fighters, oldest fade out
4. **KO Reveal** - Health bars animate to final %, winner gets celebration

## 🧪 Testing Commands

### Start a Fight (2 minutes)

```bash
curl -X POST http://localhost:3000/api/bullmeter/start \
  -H "Content-Type: application/json" \
  -d '{"streamId":"rollup","text":"ETH vs BTC - who wins in 2025?","durationSec":120,"mode":"fight"}'
```

### Send Combat Votes

```bash
# Light punch (Bear side)
curl -X POST http://localhost:3000/api/bullmeter/vote \
  -H "Content-Type: application/json" \
  -d '{"streamId":"rollup","side":"bear","credits":2,"user":{"name":"TestBear","pfpUrl":"https://i.pravatar.cc/48?u=bear"}}'

# Heavy attack (Bull side)  
curl -X POST http://localhost:3000/api/bullmeter/vote \
  -H "Content-Type: application/json" \
  -d '{"streamId":"rollup","side":"bull","credits":6,"user":{"name":"TestBull","pfpUrl":"https://i.pravatar.cc/48?u=bull"}}'
```

### Spam Attacks

```bash
# Rapid light punches (Tier 2)
curl -X POST http://localhost:3000/api/bullmeter/spam \
  -H "Content-Type: application/json" \
  -d '{"streamId":"rollup","side":"bear","tier":2,"user":{"name":"SpamFighter","pfpUrl":"https://i.pravatar.cc/48?u=spam"}}'
```

### Fight Control

```bash
# Extend timer by 60 seconds
curl -X POST http://localhost:3000/api/bullmeter/update \
  -H "Content-Type: application/json" \
  -d '{"streamId":"rollup","extendSec":60}'

# End fight early
curl -X POST http://localhost:3000/api/bullmeter/end \
  -H "Content-Type: application/json" \
  -d '{"streamId":"rollup"}'

# Trigger KO reveal
curl -X POST http://localhost:3000/api/bullmeter/reveal \
  -H "Content-Type: application/json" \
  -d '{"streamId":"rollup"}'
```

## 🎨 Customization

### Fighter Setup
1. **Names:** Default "BEAR" vs "BULL" - customize in editor
2. **Colors:** Red (#FF5A5A) vs Green (#22C55E) - change with color pickers
3. **Images:** Upload custom fighter portraits or use emoji defaults
4. **Positions:** Drag prompt and arena boxes anywhere on 1920x1080 canvas

### Visual Style
- **Arcade Aesthetic:** Bold fonts, health bars, VS display
- **Rollup Branding:** Blue chrome with black shadow offsets
- **Fight Physics:** Screen shake on heavy hits, impact flashes
- **Neutral Shimmer:** Health bars breathe during voting (no spoilers)

### Animation System
- **PFP Spawn:** Fighters appear at center of arena
- **Move Execution:** Punch/heavy attack animations based on vote weight
- **Impact Effects:** Flash effects on opponent side with screen shake
- **Fighter Cleanup:** Fade out after move completion, cap at 20 concurrent

## 🔧 Technical Details

### Socket Events (Namespace: `/bullmeter`)
```javascript
// Fight lifecycle
socket.on('prompt:start', {text, endsAt, mode: 'fight'})
socket.on('prompt:update', {text?, endsAt?})

// Combat actions
socket.on('vote:new', {side: 'bear'|'bull', user: {name, pfpUrl}, credits})
socket.on('spam:new', {side, user, tier: 1|2|3})

// Results
socket.on('prompt:reveal', {winnerSide, bearPct, bullPct})
```

### State Management
- **Editor State:** Fighter config, layout, colors saved to localStorage
- **Fight State:** Current prompt status, timer, participant tracking
- **Animation Queue:** 20 fighter limit with FIFO cleanup
- **Layout Persistence:** Drag positions encoded in OBS URLs

### Performance
- **Lightweight Animations:** CSS transforms + vanilla JavaScript
- **Fighter Capping:** Max 20 concurrent PFP fighters
- **Impact Optimization:** Brief effects, automatic cleanup
- **Memory Management:** Automatic DOM node removal after animations

## 📱 Integration Ready

The fight system is designed for easy integration with credit systems:

1. **Vote Weight:** Map credit amounts to punch power (1-10+ credits)
2. **Spam Tiers:** Different credit costs for spam intensity
3. **User Identity:** PFP + name from any authentication system
4. **Anti-Spoiler:** No vote totals shown until dramatic reveal

## 🎯 Perfect For

- **Crypto Predictions** - ETH vs BTC, protocol comparisons
- **Sports Betting** - Team vs team with fighter theming  
- **Product Launches** - Feature A vs Feature B with combat drama
- **Community Polls** - Any binary choice with maximum engagement

**The fight is the metaphor. The audience controls the action. Every vote lands as a punch.** 🥊