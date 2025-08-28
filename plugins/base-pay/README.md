# Base Pay Plugin

React component for handling tip payments and Base integration.

## 🎯 Features  
- **💳 Base Integration** - Native Base blockchain payments
- **💰 Tip Interface** - Clean UI for sending tips
- **🔒 Wallet Connect** - Secure wallet integration
- **📱 Mobile Friendly** - Responsive design for all devices

## Quick Start

### 1. Import Component
```tsx
import BasePay from '@/plugins/base-pay/BasePay';

// Use in your React app
<BasePay streamerId="rollup" />
```

### 2. Required Props
- `streamerId` - Unique identifier for the stream/creator

## 🔧 Integration
This component handles the payment flow for tips and integrates with the Base blockchain for transactions.

## 📁 Files
- `BasePay.tsx` - Main React component for payment interface

## Dependencies
- Base blockchain integration
- Wallet connection libraries
- React/Next.js framework

## Usage in Templates
This plugin can be easily integrated into any React-based mini-app template by importing the BasePay component and providing the necessary props.