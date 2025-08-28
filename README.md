# Rollup Mini-App Platform

A modular mini-app platform with plugin architecture for streamers and content creators. Built for easy customization and productization.

## Features

- 🎉 **Dynamic Tip Alerts** - Animated alerts that appear only on tips with confetti
- 🏆 **Live Leaderboard** - Real-time ranking of top tippers with brand styling
- 📱 **QR Code Integration** - Upload custom branded QR images (PNG/SVG)
- 👤 **Name Resolution** - ENS/Basename support with fallback to shortened addresses
- 🔊 **Audio Notifications** - Customizable tip sounds with volume control
- 🛡️ **Anti-abuse Protection** - Rate limiting, deduplication, minimum amounts
- ✨ **Visual Editor** - Drag, resize, and customize all overlay components
- 🎨 **Rollup Brand Design** - Blue rounded pill containers with 3D shadows
- 📐 **Safe Zones** - TV-safe area guides for broadcast positioning
- 💾 **Layout Persistence** - Save and share custom layouts via URL
- ⌨️ **Keyboard Controls** - Arrow keys for precise positioning
- 🎊 **Confetti Effects** - Celebratory animations on tips

## 🔧 Plugin Architecture

This platform uses a modular plugin system for easy customization and productization:

### 📁 Plugin Structure
```
plugins/
├── base-overlay/    # Core OBS overlay (tips, QR codes, notifications)
├── base-pay/       # Payment component (React)
├── bullmeter/      # Tekken-style voting overlay
├── trading-tokens/ # Dynamic token trading system (host-managed)
└── [future]/       # Additional plugins...
```

### Available Plugins

#### 🎯 Base Overlay (`/plugins/base-overlay/`)
- Core OBS overlay system
- Tip notifications and sound effects
- QR code display and customization
- Drag & drop editor for positioning
- **URL:** `http://localhost:3000/plugins/base-overlay/overlay.html?streamId=rollup`

#### 💳 Base Pay (`/plugins/base-pay/`)
- React payment component
- Base blockchain integration
- Wallet connection handling

#### 🥊 BullMeter (`/plugins/bullmeter/`)
- Tekken-style fight arena for predictions
- PFP fighter animations with combat moves
- Real-time voting system with anti-spoiler health bars
- Host controls for fighter customization
- **URL:** `http://localhost:3000/plugins/bullmeter/overlay.html?streamId=rollup`

#### 🪙 Trading Tokens (`/plugins/trading-tokens/`)
- Dynamic token trading system with host management
- Multi-chain support (Base, Ethereum, Optimism, Polygon)
- Automatic token metadata fetching from blockchain
- Host editor for adding/removing tokens during streams
- JSON-based atomic storage with per-stream configurations
- **Editor URL:** `http://localhost:3000/plugins/trading-tokens/editor.html?streamId=rollup`
- **Component:** Available as React component `DynamicTradingTokens`

**Note:** The main app currently uses legacy hardcoded token trading in `/components/SponsorSection.tsx`. The dynamic system is available as a separate plugin for future integration.

### 🚀 Using Plugins
Each plugin includes its own README with setup instructions. Plugins can be:
- Mixed and matched for different use cases
- Easily removed or disabled
- Extended with custom functionality
- Used independently or combined

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Start the Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 3. Add Overlay to OBS

1. Open OBS Studio
2. Add a new **Browser Source**
3. Set the URL to: `http://localhost:3000/plugins/base-overlay/overlay.html?streamId=rollup`
4. Set Width: `1920`, Height: `1080`
5. **Important**: In the Audio Mixer, make sure the Browser Source audio channel is **enabled/unmuted**

### 4. Test the System

Send a test tip:

```bash
curl -X POST http://localhost:3000/api/admin/test-tip \\
  -H "Content-Type: application/json" \\
  -d '{"address":"0x1234567890abcdef1234567890abcdef12345678","amount":5.00}'
```

You should see:
- A tip alert appear on the overlay
- The leaderboard update
- Audio play (if tip.mp3 is present)

## API Endpoints

### Webhook Endpoint
`POST /api/webhooks/basepay`

Receives Base Pay webhook payloads:
```json
{
  "from_address": "0x...",
  "amount": 5.00,
  "asset": "USDC",
  "tx_hash": "0x...",
  "stream_id": "rollup"
}
```

### Leaderboard
`GET /api/leaderboard?streamId=rollup`

Returns top 10 tippers:
```json
[
  {
    "rank": 1,
    "name": "0x1234...abcd",
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "total": 25.50
  }
]
```

### Trading Tokens API
`GET /api/tokens?streamId=rollup`

Returns enabled tokens for a stream:
```json
{
  "success": true,
  "tokens": [
    {
      "id": "noice",
      "chainName": "base",
      "address": "0x9cb41fd9dc6891bae8187029461bfaadf6cc0c69",
      "name": "noice",
      "symbol": "NOICE",
      "decimals": 18,
      "logoUrl": "https://...",
      "enabled": true,
      "sort": 1
    }
  ]
}
```

`POST /api/tokens` - Add new token (requires x-admin-key header)
`PUT /api/tokens/:id` - Update token (requires x-admin-key header)  
`DELETE /api/tokens/:id` - Delete token (requires x-admin-key header)

### Test Endpoint
`POST /api/admin/test-tip`

Simulates a tip for testing:
```json
{
  "address": "0x...",
  "amount": 5.00,
  "streamId": "rollup"
}
```

## Project Structure

```
├── server/
│   ├── index.js          # Main Express server
│   ├── realtime.js       # Socket.IO setup  
│   ├── chains.js         # Blockchain network configurations
│   ├── tokenMetadata.js  # Token metadata fetching with ethers.js
│   ├── tokenStorage.js   # JSON-based atomic file storage
│   └── tokenRoutes.js    # Token management CRUD API endpoints
├── plugins/
│   ├── base-overlay/     # Core OBS overlay system
│   ├── base-pay/         # Payment component
│   ├── bullmeter/        # Tekken-style voting overlay
│   └── trading-tokens/   # Dynamic token trading system
├── components/
│   ├── SponsorSection.tsx # Legacy hardcoded token trading (active)
│   └── [other components...]
├── data/
│   └── tokens.default.json # Seed data for new streams
├── public/
│   ├── overlay.html      # Overlay page
│   ├── overlay.js        # Overlay functionality
│   ├── overlay.css       # Overlay styles
│   ├── brand/
│   │   └── rollup.css    # Brand variables and theming
│   └── assets/
│       └── tip.mp3       # Audio file for alerts
└── package.json
```

## Configuration

### Stream ID
Change the stream ID in the overlay URL:
`http://localhost:3000/plugins/base-overlay/overlay.html?streamId=your-stream-id`

### Audio
1. Add your `tip.mp3` file to `public/assets/`
2. Ensure OBS Browser Source audio is enabled
3. Adjust volume in `public/overlay.js` (default: 0.7)

### Anti-Abuse Settings
- Minimum tip: $0.50 USDC
- Rate limit: Max 5 alerts per 10 seconds
- Duplicate prevention by transaction hash

## OBS Setup Notes

### Browser Source Settings
- **URL**: `http://localhost:3000/overlay.html?streamId=rollup`
- **Width**: 1920
- **Height**: 1080
- **FPS**: 30
- **CSS**: Leave empty (styling handled in overlay.css)

### Audio Configuration
1. In OBS Audio Mixer, find your Browser Source
2. Click the gear icon → **Advanced Audio Properties**
3. Ensure it's **not muted** and set to desired volume
4. The overlay will play `tip.mp3` when tips are received

### Layer Order
Place the Browser Source as the **top layer** in your scene to ensure alerts appear over your video content.

## Development

### Adding BaseName/ENS Support
Update the `resolveName()` function in `server/index.js`:
```javascript
async function resolveName(address) {
  // Add your ENS/BaseName resolution logic here
  // For now, returns shortened address
  return address.slice(0, 6) + '...' + address.slice(-4);
}
```

### Customizing Alerts
- Edit `public/overlay.css` for styling
- Modify `showTipAlert()` in `public/overlay.js` for content
- Adjust animation timing and effects

### Testing Production Webhooks
Replace the test endpoint with real Base Pay webhook integration when ready for production.

## Overlay Editor & Presets

### Editor Mode

Access the visual editor to customize your overlay layout:

1. **Open Editor**: Visit `http://localhost:3000/plugins/base-overlay/overlay.html?streamId=rollup&edit=1`
2. **Move Components**: Click and drag the header bars of Alert or Leaderboard boxes
3. **Resize Components**: Drag the corner handles when a box is selected
4. **Keyboard Controls**: 
   - Arrow keys = 1px movement
   - Shift + Arrow keys = 10px movement
5. **Use Presets**: Choose from preset layouts in the toolbar dropdown
6. **Show Safe Margins**: Toggle TV-safe zone guides (90% title safe, 95% action safe)

### Editor Toolbar Controls

- **Presets Dropdown**: Quick layouts (X Safe, Compact, Wide, etc.)
- **Save Button**: Save current layout to localStorage
- **Reset Button**: Restore default X Safe layout
- **Copy Overlay URL**: Generate shareable URL with embedded layout
- **Show Safe Margins**: Display broadcast-safe zone guides (90%/95%)
- **Show QR**: Toggle QR code visibility
- **Upload QR Image**: Replace with custom branded QR (PNG/SVG)
- **Reset QR**: Restore default QR position and placeholder
- **Mute/Volume**: Control tip alert audio (respects OBS audio settings)

### Layout Persistence

**Local Storage**: Changes are automatically saved in edit mode
**Shareable URLs**: Click "Copy Overlay URL" to generate a URL like:
```
http://localhost:3000/plugins/base-overlay/overlay.html?streamId=rollup&layout=eyJ...
```

**For OBS**: Use the copied URL (without `&edit=1`) in your Browser Source

### Available Presets

1. **X Safe - Bottom Right Alert**: Alert bottom-right, leaderboard top-right
2. **X Safe - Top Right Leaderboard**: Both components in top-right area
3. **Compact**: Smaller, overlapping layout for minimal screen space
4. **Wide**: Full-width alert bar with side leaderboard

### QR Code Integration

**Adding Your QR Code**:
1. Open editor mode: `?streamId=rollup&edit=1`
2. Check "Show QR" to enable the QR container
3. Click "Upload QR" to replace with your branded QR image (PNG/SVG)
4. Drag and resize the QR container as needed
5. Save and copy the overlay URL for OBS

**QR Features**:
- **Default Hidden**: QR is hidden unless explicitly enabled
- **Custom Images**: Upload PNG or SVG files
- **Brand Styling**: Blue rounded pill design with shadow offset
- **Drag & Resize**: Full editor support like other components
- **Persistent**: QR visibility, position, and image saved in layout
- **Shareable**: QR settings embedded in copied overlay URLs

**Default Position**: Bottom-left corner (80,820) at 220x220 pixels

### Dynamic Tip Alerts

**New Alert System**:
- Alerts only appear when tips are received (no persistent empty box)
- Smooth enter/exit animations with scale and position transitions
- 4-second display duration with automatic cleanup
- Confetti burst animation on each tip (rate-limited to prevent spam)
- Positioned dynamically at the Alert Box editor location

**Animation Sequence**:
1. **Enter**: Fade in from below with scale up (180ms)
2. **Active**: Full opacity and scale for 4 seconds
3. **Exit**: Fade out upward (160ms)
4. **Confetti**: 12 colorful particles with physics animation

### ENS & Basename Resolution

**Smart Name Display**:
- Automatic ENS and Basename reverse lookup for tip addresses
- Safe forward→reverse verification to prevent spoofing
- 10-minute in-memory cache for performance
- Graceful fallback to shortened addresses (0x1234…abcd)
- API endpoint available: `GET /api/resolve?address=0x...`

### Customization Tips

- **Brand Colors**: Edit `/public/brand/rollup.css` (--brand-blue, --brand-surface, --brand-shadow)
- **Grid Snapping**: All movements snap to 8px grid for clean alignment
- **Position Readout**: Shows exact x,y,w,h coordinates in toolbar
- **Audio Controls**: Volume slider and mute toggle affect tip sound effects
- **QR Replacement**: Upload via editor or replace `/public/assets/qr-placeholder.png`
- **Z-Index Order**: Alerts (top) → Leaderboard → QR Code (bottom)
- **Brand Design**: Blue rounded pills with black 8px offset shadows

### OBS Integration

1. Design your layout in editor mode: `?streamId=rollup&edit=1`
2. Click "Copy Overlay URL" when satisfied
3. In OBS, add **Browser Source** with the copied URL
4. Set Width: `1920`, Height: `1080`
5. **Enable audio** in OBS mixer for the Browser Source
6. Position as top layer in your scene

## Troubleshooting

### No Audio in OBS
- Check Browser Source audio is enabled in OBS mixer
- Verify `tip.mp3` exists in `public/assets/`
- Test audio playback in browser first

### Overlay Not Updating
- Check browser console for JavaScript errors
- Verify WebSocket connection in Network tab
- Ensure server is running and accessible

### Alerts Not Showing
- Verify overlay URL includes correct streamId parameter
- Check server logs for webhook processing
- Test with `/api/admin/test-tip` endpoint

## License

MIT