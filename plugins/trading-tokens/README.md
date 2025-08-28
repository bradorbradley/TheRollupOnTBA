# Trading Token Editor

A host control panel for managing tradeable tokens dynamically. Allows streamers and content creators to add, remove, and configure tokens without hardcoding.

## 🎯 Features

- **🔗 Multi-Chain Support** - Base, Ethereum, Optimism, Polygon
- **🔍 Auto-Metadata Fetching** - Automatically resolve token name, symbol, decimals from blockchain
- **🖼️ Logo Resolution** - Auto-fetch logos from TrustWallet, Uniswap, or generate identicons
- **✅ Enable/Disable Tokens** - Control which tokens appear in mini-app
- **🎨 Custom Overrides** - Override logos, names if needed
- **🔄 Real-Time Updates** - Changes reflect immediately in mini-app
- **🔒 Admin Authentication** - Secure with admin key protection

## 🚀 Quick Start

### 1. Access Editor
```
http://localhost:3000/plugins/trading-tokens/editor.html?streamId=rollup
```

### 2. Set Admin Key
- On first visit, you'll be prompted for an admin key
- This key is stored in localStorage for future sessions
- Must match `ADMIN_KEY` environment variable on server

### 3. Manage Tokens
- **Stream ID**: Choose which stream's tokens to manage (default: 'rollup')
- **Add Token**: Enter contract address, fetch metadata, add to list
- **Enable/Disable**: Toggle tokens on/off without deleting
- **Delete**: Permanently remove tokens
- **Reset**: Restore default token list

## 🛠️ Adding Tokens

1. Select blockchain (Base, Ethereum, etc.)
2. Paste contract address (0x...)
3. Click "Fetch Metadata" to preview
4. Optionally add custom logo URL
5. Click "Add Token"

### Supported Token Standards
- **ERC-20** tokens on supported chains
- Must implement `name()`, `symbol()`, `decimals()` functions
- Auto-validates contract address format

## 🎨 Customization

### Logo Sources (in order of priority):
1. Custom logo URL (if provided)
2. TrustWallet assets repository
3. Uniswap assets repository  
4. DiceBear identicon (fallback)

### Chain Configuration
- **Base**: Chain ID 8453
- **Ethereum**: Chain ID 1
- **Optimism**: Chain ID 10
- **Polygon**: Chain ID 137

## 🔒 Security

- **Admin Key Required**: All mutations require `x-admin-key` header
- **Address Validation**: Contract addresses verified before metadata fetch
- **Error Handling**: Safe failures with user feedback
- **Rate Limiting**: Debounced API calls to prevent spam

## 📱 Integration

Tokens managed here automatically appear in:
- Mini-app trading buttons  
- Real-time updates via API
- Maintains sort order and enabled state
- No app restarts required

## 🧪 Development Mode

For testing without server API:
- Editor works in demo mode
- Simulates token metadata fetching
- Changes stored locally
- Connect to real API when server is configured

## 📊 API Integration

The editor interfaces with these endpoints:
```
GET    /api/tokens?streamId=rollup    # List tokens
POST   /api/tokens                   # Add token  
PUT    /api/tokens/:id               # Update token
DELETE /api/tokens/:id               # Remove token
```

## 🎯 Perfect For
- **Live Streams**: Dynamic token promotion during shows
- **Community Polls**: Add trending tokens on demand
- **Sponsored Content**: Temporarily promote specific tokens  
- **Multi-Show Support**: Different token lists per stream

## 🔄 Current Status

**Legacy System**: The main app currently uses hardcoded tokens in `/components/SponsorSection.tsx`

**Dynamic System**: This plugin provides the dynamic token management system as a separate module

**Migration Path**: Replace SponsorSection with `DynamicTradingTokens` component when ready to switch

## 📁 Files Structure

```
plugins/trading-tokens/
├── README.md                    # This documentation
├── editor.html                 # Host control panel interface
├── editor.js                   # Editor functionality
├── editor.css                  # Editor styles
└── DynamicTradingTokens.tsx    # React component for mini-app
```

## 🔧 Server Infrastructure

The plugin works with these server components:
```
server/
├── chains.js                   # Blockchain network configurations
├── tokenMetadata.js           # Metadata fetching with ethers.js
├── tokenStorage.js            # JSON-based atomic file storage
└── tokenRoutes.js             # CRUD API endpoints
```

## 🎯 React Component Usage

Replace hardcoded token sections:
```tsx
// Instead of hardcoded SponsorSection tokens
import { DynamicTradingTokens } from '@/plugins/trading-tokens/DynamicTradingTokens'

export default function YourComponent() {
  return (
    <div>
      <DynamicTradingTokens streamId="rollup" />
    </div>
  )
}
```

The trading editor transforms hardcoded token lists into a dynamic, host-controlled system perfect for productization and reuse across different shows and creators.