// Supported blockchain networks for token trading
// RPC URLs are loaded from environment variables

const SUPPORTED_CHAINS = {
  base: {
    chainId: 8453,
    name: 'Base',
    shortName: 'base',
    rpcUrl: process.env.RPC_BASE || 'https://mainnet.base.org',
    blockExplorerUrl: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    shortName: 'eth',
    rpcUrl: process.env.RPC_ETH || 'https://cloudflare-eth.com',
    blockExplorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  optimism: {
    chainId: 10,
    name: 'Optimism',
    shortName: 'op',
    rpcUrl: process.env.RPC_OP || 'https://mainnet.optimism.io',
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    shortName: 'poly',
    rpcUrl: process.env.RPC_POLY || 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
};

function getChainConfig(chainName) {
  return SUPPORTED_CHAINS[chainName.toLowerCase()] || null;
}

function getChainByChainId(chainId) {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.chainId === chainId) || null;
}

function getSupportedChainNames() {
  return Object.keys(SUPPORTED_CHAINS);
}

module.exports = {
  SUPPORTED_CHAINS,
  getChainConfig,
  getChainByChainId,
  getSupportedChainNames,
};