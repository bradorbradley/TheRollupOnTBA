const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { setupSocketIO } = require('./realtime');
const { nameResolver } = require('./tips');

const app = express();
const server = http.createServer(app);
const io = setupSocketIO(server);

const PORT = process.env.PORT || 3000;

// In-memory storage
const totals = {};
const processedTxHashes = new Set();
const alertQueue = [];
let lastAlertTime = 0;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Helper function to resolve name 
async function resolveName(address) {
  return await nameResolver.resolveName(address);
}

// Rate limiting for alerts
function canSendAlert() {
  const now = Date.now();
  const recentAlerts = alertQueue.filter(time => now - time < 10000);
  alertQueue.length = 0;
  alertQueue.push(...recentAlerts);
  
  return recentAlerts.length < 5;
}

// Base Pay webhook endpoint
app.post('/api/webhooks/basepay', async (req, res) => {
  try {
    const { 
      from_address: address, 
      amount, 
      asset = 'USDC', 
      tx_hash: txHash,
      stream_id: streamId = 'rollup'
    } = req.body;

    // Validation
    if (!address || !amount || !txHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (asset !== 'USDC') {
      return res.status(400).json({ error: 'Only USDC tips are supported' });
    }

    if (amount < 0.50) {
      return res.status(400).json({ error: 'Minimum tip amount is $0.50' });
    }

    if (processedTxHashes.has(txHash)) {
      return res.status(400).json({ error: 'Transaction already processed' });
    }

    // Process the tip
    processedTxHashes.add(txHash);
    totals[address] = (totals[address] || 0) + amount;

    const name = await resolveName(address);
    const tipData = {
      name,
      address,
      amount,
      asset,
      txHash,
      ts: Date.now()
    };

    // Rate limiting
    if (canSendAlert()) {
      alertQueue.push(Date.now());
      io.to(`stream-${streamId}`).emit('tip', tipData);
      console.log(`Tip alert sent: ${name} tipped ${amount} ${asset}`);
    } else {
      console.log(`Tip received but rate limited: ${name} tipped ${amount} ${asset}`);
    }

    res.json({ success: true, message: 'Tip processed successfully' });
  } catch (error) {
    console.error('Error processing tip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
  const { streamId = 'rollup' } = req.query;
  
  try {
    const entries = Object.entries(totals);
    const resolvedEntries = await Promise.all(
      entries.map(async ([address, total]) => ({
        address,
        name: await resolveName(address),
        total: parseFloat(total.toFixed(2))
      }))
    );
    
    const leaderboard = resolvedEntries
      .sort((a, b) => b.total - a.total)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry
      }))
      .slice(0, 10); // Top 10

    res.json(leaderboard);
  } catch (error) {
    console.error('Error generating leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin test tip endpoint
app.post('/api/admin/test-tip', async (req, res) => {
  try {
    const { 
      address = '0x1234567890abcdef1234567890abcdef12345678',
      amount = 5.00,
      streamId = 'rollup'
    } = req.body;

    const txHash = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Process through webhook logic
    processedTxHashes.add(txHash);
    totals[address] = (totals[address] || 0) + amount;

    const name = await resolveName(address);
    const tipData = {
      name,
      address,
      amount,
      asset: 'USDC',
      txHash,
      ts: Date.now()
    };

    if (canSendAlert()) {
      alertQueue.push(Date.now());
      io.to(`stream-${streamId}`).emit('tip', tipData);
      console.log(`Test tip sent: ${name} tipped ${amount} USDC`);
    }

    res.json({ success: true, message: 'Test tip sent', data: tipData });
  } catch (error) {
    console.error('Error processing test tip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Optional resolve endpoint for client fallback
app.get('/api/resolve', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Address parameter required' });
    }
    
    const name = await resolveName(address);
    res.json({ address, name });
  } catch (error) {
    console.error('Error resolving name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Overlay available at: http://localhost:${PORT}/overlay.html?streamId=rollup`);
});