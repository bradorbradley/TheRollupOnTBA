# Base Overlay Plugin

The core OBS overlay system with tips, notifications, and QR code functionality.

## 🎯 Features
- **💰 Tip Notifications** - Toast animations for incoming tips
- **📱 QR Code Display** - Customizable QR codes for engagement  
- **🎨 Drag & Drop Editor** - OBS-friendly overlay positioning
- **🔊 Sound Effects** - Audio notifications for tips
- **📺 OBS Ready** - 1920x1080 responsive scaling

## Quick Start

### 1. Add to OBS
1. Add **Browser Source** in OBS
2. URL: `http://localhost:3000/plugins/base-overlay/overlay.html?streamId=YOUR_STREAM`
3. Width: `1920`, Height: `1080`

### 2. Editor Mode
- **Live Overlay:** `http://localhost:3000/plugins/base-overlay/overlay.html?streamId=YOUR_STREAM`
- **Editor:** `http://localhost:3000/plugins/base-overlay/overlay.html?streamId=YOUR_STREAM&edit=1`

## 🔧 Customization
- **Presets:** X Safe, Top Right, Compact, Wide layouts
- **QR Codes:** Upload custom QR codes for engagement
- **Safe Zones:** Title-safe and action-safe guides
- **Toast Styles:** Rollup-branded tip notifications

## 🧪 Testing
```bash
# Test tip notification
curl -X POST http://localhost:3000/api/tips/notify \
  -H "Content-Type: application/json" \
  -d '{"amount": 50, "message": "Great stream!", "username": "testuser"}'
```

## 📁 Files
- `overlay.html` - Main overlay interface
- `overlay.css` - Styling and animations
- `overlay.js` - Real-time functionality
- `server.js` - Socket.IO tip handling
- `brand/rollup.css` - Brand variables and styling

## Integration
This plugin provides the foundation overlay system that other plugins can extend or integrate with.