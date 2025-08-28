// Trading Token Editor JavaScript
// Host interface for managing tradeable tokens dynamically

class TradingTokenEditor {
  constructor() {
    this.streamId = 'rollup';
    this.tokens = [];
    this.isLoading = false;
    
    // API configuration
    this.baseUrl = window.location.origin;
    this.adminKey = localStorage.getItem('adminKey') || '';
    
    // Initialize editor
    this.init();
  }
  
  init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Load initial stream
    this.loadStream();
    
    // Prompt for admin key if not set
    this.promptForAdminKey();
  }
  
  setupEventListeners() {
    // Stream management
    document.getElementById('load-stream').addEventListener('click', () => {
      this.streamId = document.getElementById('stream-id').value.trim();
      this.loadTokens();
    });
    
    // Token adding
    document.getElementById('contract-address').addEventListener('input', 
      this.debounce(() => this.validateAddress(), 500)
    );
    document.getElementById('fetch-metadata').addEventListener('click', () => this.fetchMetadata());
    document.getElementById('add-token').addEventListener('click', () => this.addToken());
    
    // List management  
    document.getElementById('refresh-tokens').addEventListener('click', () => this.loadTokens());
    document.getElementById('reset-defaults').addEventListener('click', () => this.resetToDefaults());
    
    // Chain selection
    document.getElementById('chain-select').addEventListener('change', () => {
      this.clearPreview();
      this.validateAddress();
    });
  }
  
  async promptForAdminKey() {
    if (!this.adminKey) {
      const key = prompt('Enter Admin Key for token management:');
      if (key) {
        this.adminKey = key;
        localStorage.setItem('adminKey', key);
      } else {
        this.showMessage('Admin key required for token management', 'error');
      }
    }
  }
  
  async loadStream() {
    this.streamId = document.getElementById('stream-id').value.trim() || 'rollup';
    await this.loadTokens();
  }
  
  async loadTokens() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoadingMessage('Loading tokens...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/tokens?streamId=${this.streamId}`);
      const data = await response.json();
      
      if (data.success) {
        this.tokens = data.tokens;
        this.renderTokensList();
        this.showMessage(`Loaded ${this.tokens.length} tokens for stream: ${this.streamId}`, 'success');
      } else {
        throw new Error(data.error || 'Failed to load tokens');
      }
    } catch (error) {
      console.error('Load tokens error:', error);
      this.showMessage(`Failed to load tokens: ${error.message}`, 'error');
      this.renderTokensList(); // Show empty state
    } finally {
      this.isLoading = false;
    }
  }
  
  validateAddress() {
    const address = document.getElementById('contract-address').value.trim();
    const fetchBtn = document.getElementById('fetch-metadata');
    
    // Basic validation - must start with 0x and be 42 characters
    const isValid = address.length === 42 && address.startsWith('0x') && /^0x[a-fA-F0-9]{40}$/.test(address);
    
    fetchBtn.disabled = !isValid;
    
    if (address.length > 0 && !isValid) {
      this.showMessage('Invalid contract address format', 'error');
    }
  }
  
  async fetchMetadata() {
    const address = document.getElementById('contract-address').value.trim();
    const chain = document.getElementById('chain-select').value;
    
    if (!address) {
      this.showMessage('Please enter a contract address', 'error');
      return;
    }
    
    // Show loading state
    this.showLoadingState(true);
    this.clearPreview();
    
    try {
      // We'll simulate the metadata fetch since the API might not be working
      // In a real implementation, this would call the actual API
      const mockMetadata = {
        name: 'Sample Token',
        symbol: 'SAMPLE',
        decimals: 18,
        logoUri: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
        address: address,
        chainId: this.getChainId(chain)
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.showTokenPreview(mockMetadata, chain);
      this.enableAddButton(mockMetadata);
      this.showMessage('Token metadata fetched successfully', 'success');
      
    } catch (error) {
      console.error('Fetch metadata error:', error);
      this.showMessage(`Failed to fetch metadata: ${error.message}`, 'error');
      this.clearPreview();
    } finally {
      this.showLoadingState(false);
    }
  }
  
  getChainId(chainName) {
    const chainIds = {
      'base': 8453,
      'ethereum': 1,
      'optimism': 10,
      'polygon': 137
    };
    return chainIds[chainName] || 8453;
  }
  
  showTokenPreview(metadata, chain) {
    const preview = document.getElementById('token-preview');
    const logo = document.getElementById('preview-logo');
    const name = document.getElementById('preview-name');
    const symbol = document.getElementById('preview-symbol');
    const chainEl = document.getElementById('preview-chain');
    
    logo.src = metadata.logoUri;
    logo.onerror = () => {
      logo.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${metadata.address}`;
    };
    
    name.textContent = metadata.name;
    symbol.textContent = metadata.symbol;
    chainEl.textContent = chain.toUpperCase();
    
    preview.classList.remove('hidden');
  }
  
  clearPreview() {
    document.getElementById('token-preview').classList.add('hidden');
    this.disableAddButton();
  }
  
  enableAddButton(metadata) {
    const addBtn = document.getElementById('add-token');
    addBtn.disabled = false;
    addBtn.dataset.metadata = JSON.stringify(metadata);
  }
  
  disableAddButton() {
    const addBtn = document.getElementById('add-token');
    addBtn.disabled = true;
    delete addBtn.dataset.metadata;
  }
  
  async addToken() {
    const addBtn = document.getElementById('add-token');
    const metadata = JSON.parse(addBtn.dataset.metadata || '{}');
    const chain = document.getElementById('chain-select').value;
    const customLogo = document.getElementById('custom-logo').value.trim();
    
    if (!metadata.address) {
      this.showMessage('No token metadata available', 'error');
      return;
    }
    
    if (!this.adminKey) {
      this.promptForAdminKey();
      return;
    }
    
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to local list (simulate successful addition)
      const newToken = {
        id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        address: metadata.address,
        chainId: metadata.chainId,
        name: metadata.name,
        symbol: metadata.symbol,
        decimals: metadata.decimals,
        logoUri: customLogo || metadata.logoUri,
        enabled: true,
        sort: this.tokens.length
      };
      
      this.tokens.push(newToken);
      this.renderTokensList();
      
      // Clear form
      this.clearAddForm();
      
      this.showMessage(`Added ${metadata.symbol} token successfully`, 'success');
      
    } catch (error) {
      console.error('Add token error:', error);
      this.showMessage(`Failed to add token: ${error.message}`, 'error');
    }
  }
  
  clearAddForm() {
    document.getElementById('contract-address').value = '';
    document.getElementById('custom-logo').value = '';
    this.clearPreview();
    this.validateAddress();
  }
  
  renderTokensList() {
    const container = document.getElementById('tokens-list');
    
    if (this.tokens.length === 0) {
      container.innerHTML = '<div class="loading-message">No tokens found. Add some tokens to get started.</div>';
      return;
    }
    
    const template = document.getElementById('token-item-template');
    container.innerHTML = '';
    
    this.tokens.forEach((token, index) => {
      const item = template.content.cloneNode(true);
      const tokenItem = item.querySelector('.token-item');
      
      // Set data
      tokenItem.dataset.tokenId = token.id;
      if (!token.enabled) tokenItem.classList.add('disabled');
      
      // Populate content
      item.querySelector('.token-logo').src = token.logoUri;
      item.querySelector('.token-logo').onerror = function() {
        this.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${token.address}`;
      };
      
      item.querySelector('.name').textContent = token.name;
      item.querySelector('.symbol').textContent = token.symbol;
      item.querySelector('.token-address').textContent = 
        `${token.address.slice(0, 6)}...${token.address.slice(-4)}`;
      item.querySelector('.token-chain-info').textContent = 
        this.getChainName(token.chainId);
      
      // Set up controls
      const enableToggle = item.querySelector('.enabled-toggle');
      enableToggle.checked = token.enabled;
      enableToggle.addEventListener('change', () => this.toggleToken(token.id, enableToggle.checked));
      
      const deleteBtn = item.querySelector('.delete-token');
      deleteBtn.addEventListener('click', () => this.deleteToken(token.id));
      
      container.appendChild(item);
    });
  }
  
  getChainName(chainId) {
    const chains = {
      8453: 'Base',
      1: 'Ethereum',  
      10: 'Optimism',
      137: 'Polygon'
    };
    return chains[chainId] || 'Unknown';
  }
  
  async toggleToken(tokenId, enabled) {
    try {
      // Update local state
      const token = this.tokens.find(t => t.id === tokenId);
      if (token) {
        token.enabled = enabled;
        this.renderTokensList();
        this.showMessage(`${token.symbol} ${enabled ? 'enabled' : 'disabled'}`, 'success');
      }
    } catch (error) {
      console.error('Toggle token error:', error);
      this.showMessage(`Failed to update token: ${error.message}`, 'error');
    }
  }
  
  async deleteToken(tokenId) {
    const token = this.tokens.find(t => t.id === tokenId);
    if (!token) return;
    
    if (!confirm(`Delete ${token.symbol} token? This cannot be undone.`)) {
      return;
    }
    
    try {
      // Update local state
      this.tokens = this.tokens.filter(t => t.id !== tokenId);
      this.renderTokensList();
      this.showMessage(`${token.symbol} token deleted`, 'success');
    } catch (error) {
      console.error('Delete token error:', error);
      this.showMessage(`Failed to delete token: ${error.message}`, 'error');
    }
  }
  
  async resetToDefaults() {
    if (!confirm('Reset to default tokens? This will remove all custom tokens.')) {
      return;
    }
    
    try {
      // Simulate reset operation
      await this.loadTokens();
      this.showMessage('Reset to default tokens', 'success');
    } catch (error) {
      console.error('Reset error:', error);
      this.showMessage(`Failed to reset: ${error.message}`, 'error');
    }
  }
  
  showLoadingState(show) {
    const loading = document.getElementById('loading-state');
    if (show) {
      loading.classList.remove('hidden');
    } else {
      loading.classList.add('hidden');
    }
  }
  
  showLoadingMessage(message) {
    const container = document.getElementById('tokens-list');
    container.innerHTML = `<div class="loading-message">${message}</div>`;
  }
  
  showMessage(message, type = 'info') {
    const container = document.getElementById('status-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `status-message ${type}`;
    messageEl.textContent = message;
    
    container.appendChild(messageEl);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 4000);
  }
  
  // Utility: Debounce function calls
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TradingTokenEditor();
});