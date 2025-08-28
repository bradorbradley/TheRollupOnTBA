// Token storage utilities for JSON-based persistence
// Atomic file operations to prevent data corruption

const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Get token storage file path
 */
function getStorageFilePath(streamId) {
  return path.join(DATA_DIR, `tokens.${streamId}.json`);
}

/**
 * Get default/fallback token storage file path
 */
function getDefaultStorageFilePath() {
  return path.join(DATA_DIR, 'tokens.default.json');
}

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

/**
 * Load token storage for a stream
 */
async function loadTokenStorage(streamId) {
  await ensureDataDir();
  
  const filePath = getStorageFilePath(streamId);
  const defaultPath = getDefaultStorageFilePath();
  
  try {
    // Try to load stream-specific config
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    // Fall back to default config
    try {
      const data = await fs.readFile(defaultPath, 'utf8');
      const defaultStorage = JSON.parse(data);
      // Create stream-specific copy
      const streamStorage = {
        ...defaultStorage,
        streamId,
        lastUpdated: new Date().toISOString(),
      };
      await saveTokenStorage(streamStorage);
      return streamStorage;
    } catch {
      // Create empty storage if no default exists
      const emptyStorage = {
        streamId,
        tokens: [],
        lastUpdated: new Date().toISOString(),
      };
      await saveTokenStorage(emptyStorage);
      return emptyStorage;
    }
  }
}

/**
 * Save token storage atomically
 */
async function saveTokenStorage(storage) {
  await ensureDataDir();
  
  const filePath = getStorageFilePath(storage.streamId);
  const tempPath = `${filePath}.tmp`;
  
  // Update timestamp
  storage.lastUpdated = new Date().toISOString();
  
  try {
    // Write to temp file first
    await fs.writeFile(tempPath, JSON.stringify(storage, null, 2), 'utf8');
    // Atomic rename
    await fs.rename(tempPath, filePath);
  } catch (error) {
    // Cleanup temp file on error
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

/**
 * Generate unique token ID
 */
function generateTokenId() {
  return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add token to storage
 */
async function addToken(streamId, metadata, overrides) {
  const storage = await loadTokenStorage(streamId);
  
  // Check if token already exists
  const existing = storage.tokens.find(
    t => t.metadata.address.toLowerCase() === metadata.address.toLowerCase() &&
         t.metadata.chainId === metadata.chainId
  );
  
  if (existing) {
    throw new Error('Token already exists in this stream');
  }
  
  const newToken = {
    id: generateTokenId(),
    metadata,
    enabled: true,
    sort: storage.tokens.length,
    overrides,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  storage.tokens.push(newToken);
  await saveTokenStorage(storage);
  
  return newToken;
}

/**
 * Update token in storage
 */
async function updateToken(streamId, tokenId, updates) {
  const storage = await loadTokenStorage(streamId);
  
  const tokenIndex = storage.tokens.findIndex(t => t.id === tokenId);
  if (tokenIndex === -1) {
    throw new Error('Token not found');
  }
  
  const token = storage.tokens[tokenIndex];
  storage.tokens[tokenIndex] = {
    ...token,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await saveTokenStorage(storage);
  return storage.tokens[tokenIndex];
}

/**
 * Remove token from storage
 */
async function removeToken(streamId, tokenId) {
  const storage = await loadTokenStorage(streamId);
  
  const tokenIndex = storage.tokens.findIndex(t => t.id === tokenId);
  if (tokenIndex === -1) {
    throw new Error('Token not found');
  }
  
  storage.tokens.splice(tokenIndex, 1);
  
  // Reorder remaining tokens
  storage.tokens.forEach((token, index) => {
    token.sort = index;
    token.updatedAt = new Date().toISOString();
  });
  
  await saveTokenStorage(storage);
}

/**
 * Get tokens for display (sorted, enabled first)
 */
function getDisplayTokens(storage) {
  return storage.tokens
    .sort((a, b) => {
      // Enabled tokens first
      if (a.enabled && !b.enabled) return -1;
      if (!a.enabled && b.enabled) return 1;
      // Then by sort order
      return a.sort - b.sort;
    });
}

module.exports = {
  loadTokenStorage,
  saveTokenStorage,
  generateTokenId,
  addToken,
  updateToken,
  removeToken,
  getDisplayTokens,
};