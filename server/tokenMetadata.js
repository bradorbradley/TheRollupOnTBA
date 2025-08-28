// Token metadata fetcher using ethers.js
// Resolves ERC-20 token information from blockchain contracts

const { ethers } = require('ethers');
const { getChainConfig } = require('./chains');

// Standard ERC-20 ABI for metadata calls
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

/**
 * Fetch token metadata from blockchain contract
 */
async function fetchTokenMetadata(chainName, address) {
  const chainConfig = getChainConfig(chainName);
  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chainName}`);
  }

  // Validate and checksum the address
  const checksummedAddress = ethers.getAddress(address);
  
  // Create provider and contract
  const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
  const contract = new ethers.Contract(checksummedAddress, ERC20_ABI, provider);

  try {
    // Call contract methods in parallel
    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ]);

    // Resolve logo URI
    const logoUri = await resolveTokenLogo(checksummedAddress, chainConfig.chainId);

    return {
      address: checksummedAddress,
      chainId: chainConfig.chainId,
      name: name.toString(),
      symbol: symbol.toString(),
      decimals: Number(decimals),
      logoUri,
    };
  } catch (error) {
    console.error(`Failed to fetch metadata for ${checksummedAddress} on ${chainName}:`, error);
    throw new Error('Failed to fetch token metadata. Ensure this is a valid ERC-20 contract.');
  }
}

/**
 * Resolve token logo URI from various sources
 */
async function resolveTokenLogo(address, chainId) {
  const sources = [
    // TrustWallet assets
    `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`,
    // Uniswap assets  
    `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/${address}/logo.png`,
    // Base-specific for Base chain
    ...(chainId === 8453 ? [
      `https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.svg`
    ] : []),
  ];

  // Try each source
  for (const url of sources) {
    if (await isImageAccessible(url)) {
      return url;
    }
  }

  // Fallback to DiceBear identicon
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}&backgroundColor=transparent`;
}

/**
 * Check if an image URL is accessible
 */
async function isImageAccessible(url) {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Validate if an address could be a valid contract
 */
function isValidContractAddress(address) {
  try {
    ethers.getAddress(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get checksummed address
 */
function getChecksumAddress(address) {
  return ethers.getAddress(address);
}

module.exports = {
  fetchTokenMetadata,
  isValidContractAddress,
  getChecksumAddress,
};