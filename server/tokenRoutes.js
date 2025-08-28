// Express routes for token management API
// Integrates with existing Express server

const express = require('express');
const {
  loadTokenStorage,
  addToken,
  updateToken,
  removeToken,
  getDisplayTokens,
} = require('./tokenStorage');
const {
  fetchTokenMetadata,
  isValidContractAddress,
} = require('./tokenMetadata');

const router = express.Router();

// Admin authentication middleware
function requireAdmin(req, res, next) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    console.warn('ADMIN_KEY not set - token mutations disabled');
    return res.status(401).json({
      success: false,
      error: 'Admin authentication not configured',
    });
  }
  
  const providedKey = req.headers['x-admin-key'];
  if (providedKey !== adminKey) {
    return res.status(401).json({
      success: false,
      error: 'Admin authentication required',
    });
  }
  
  next();
}

// GET /api/tokens?streamId=rollup
router.get('/tokens', async (req, res) => {
  try {
    const streamId = req.query.streamId || 'default';
    
    const storage = await loadTokenStorage(streamId);
    const tokens = getDisplayTokens(storage);
    
    // Return public-facing token data
    const publicTokens = tokens.map(token => ({
      id: token.id,
      address: token.metadata.address,
      chainId: token.metadata.chainId,
      name: token.overrides?.name || token.metadata.name,
      symbol: token.overrides?.symbol || token.metadata.symbol,
      decimals: token.metadata.decimals,
      logoUri: token.overrides?.logoUri || token.metadata.logoUri,
      enabled: token.enabled,
      sort: token.sort,
    }));
    
    res.json({
      success: true,
      tokens: publicTokens,
      streamId,
      lastUpdated: storage.lastUpdated,
    });
  } catch (error) {
    console.error('Failed to load tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load tokens',
      details: error.message,
    });
  }
});

// POST /api/tokens - Add new token (requires admin auth)
router.post('/tokens', requireAdmin, async (req, res) => {
  try {
    const { streamId, chain, address, overrides } = req.body;
    
    // Validation
    if (!streamId || typeof streamId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'streamId is required',
      });
    }
    
    if (!chain || typeof chain !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'chain is required',
      });
    }
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'address is required',
      });
    }
    
    if (!isValidContractAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contract address',
      });
    }
    
    // Fetch metadata from blockchain
    const metadata = await fetchTokenMetadata(chain, address);
    
    // Add to storage
    const token = await addToken(streamId, metadata, overrides);
    
    res.json({
      success: true,
      message: 'Token added successfully',
      token: {
        id: token.id,
        address: token.metadata.address,
        chainId: token.metadata.chainId,
        name: token.overrides?.name || token.metadata.name,
        symbol: token.overrides?.symbol || token.metadata.symbol,
        decimals: token.metadata.decimals,
        logoUri: token.overrides?.logoUri || token.metadata.logoUri,
        enabled: token.enabled,
        sort: token.sort,
      },
    });
  } catch (error) {
    console.error('Failed to add token:', error);
    
    // Handle specific error types
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Token already exists in this stream',
      });
    }
    if (error.message.includes('Unsupported chain')) {
      return res.status(400).json({
        success: false,
        error: `Unsupported chain: ${error.message}`,
      });
    }
    if (error.message.includes('Failed to fetch token metadata')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ERC-20 contract or network error',
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to add token',
      details: error.message,
    });
  }
});

// PUT /api/tokens/:id - Update token (requires admin auth)
router.put('/tokens/:id', requireAdmin, async (req, res) => {
  try {
    const { streamId, enabled, sort, overrides } = req.body;
    const tokenId = req.params.id;
    
    // Validation
    if (!streamId || typeof streamId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'streamId is required',
      });
    }
    
    if (!tokenId || typeof tokenId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Token ID is required',
      });
    }
    
    // Validate optional fields
    const updates = {};
    
    if (enabled !== undefined) {
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'enabled must be a boolean',
        });
      }
      updates.enabled = enabled;
    }
    
    if (sort !== undefined) {
      if (!Number.isInteger(sort) || sort < 0) {
        return res.status(400).json({
          success: false,
          error: 'sort must be a non-negative integer',
        });
      }
      updates.sort = sort;
    }
    
    if (overrides !== undefined) {
      if (typeof overrides !== 'object' || overrides === null) {
        return res.status(400).json({
          success: false,
          error: 'overrides must be an object',
        });
      }
      updates.overrides = overrides;
    }
    
    // Update token
    const updatedToken = await updateToken(streamId, tokenId, updates);
    
    res.json({
      success: true,
      message: 'Token updated successfully',
      token: {
        id: updatedToken.id,
        address: updatedToken.metadata.address,
        chainId: updatedToken.metadata.chainId,
        name: updatedToken.overrides?.name || updatedToken.metadata.name,
        symbol: updatedToken.overrides?.symbol || updatedToken.metadata.symbol,
        decimals: updatedToken.metadata.decimals,
        logoUri: updatedToken.overrides?.logoUri || updatedToken.metadata.logoUri,
        enabled: updatedToken.enabled,
        sort: updatedToken.sort,
      },
    });
  } catch (error) {
    console.error('Failed to update token:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Token not found',
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update token',
      details: error.message,
    });
  }
});

// DELETE /api/tokens/:id - Delete token (requires admin auth)
router.delete('/tokens/:id', requireAdmin, async (req, res) => {
  try {
    const streamId = req.query.streamId;
    const tokenId = req.params.id;
    
    // Validation
    if (!streamId || typeof streamId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'streamId query parameter is required',
      });
    }
    
    if (!tokenId || typeof tokenId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Token ID is required',
      });
    }
    
    // Remove token
    await removeToken(streamId, tokenId);
    
    res.json({
      success: true,
      message: 'Token removed successfully',
      tokenId,
    });
  } catch (error) {
    console.error('Failed to remove token:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Token not found',
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to remove token',
      details: error.message,
    });
  }
});

module.exports = router;