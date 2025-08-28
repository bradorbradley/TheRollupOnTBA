// Name resolution with ENS/Basename support
class NameResolver {
    constructor() {
        this.cache = new Map();
        this.CACHE_TTL = 10 * 60 * 1000; // 10 minutes
    }

    async resolveName(address) {
        // Check cache first
        const cacheKey = address.toLowerCase();
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.name;
        }

        try {
            // TODO: Implement actual ENS/Basename resolution
            // For now, just return shortened address
            const resolved = await this.resolveNameFromProviders(address);
            
            // Cache the result
            this.cache.set(cacheKey, {
                name: resolved,
                timestamp: Date.now()
            });
            
            return resolved;
        } catch (error) {
            console.error('Name resolution failed:', error);
            return this.shortAddr(address);
        }
    }

    async resolveNameFromProviders(address) {
        // TODO: Add actual ENS/Basename providers
        // Example implementation structure:
        
        try {
            // 1. Try reverse lookup for ENS
            // const ensName = await reverseENSLookup(address);
            // if (ensName) {
            //     // 2. Verify forward resolution matches
            //     const forwardAddr = await forwardENSLookup(ensName);
            //     if (forwardAddr.toLowerCase() === address.toLowerCase()) {
            //         return ensName;
            //     }
            // }

            // 3. Try Basename lookup
            // const basename = await reverseBasenameLookup(address);
            // if (basename) {
            //     const forwardAddr = await forwardBasenameLookup(basename);
            //     if (forwardAddr.toLowerCase() === address.toLowerCase()) {
            //         return basename;
            //     }
            // }
        } catch (error) {
            console.error('Provider resolution failed:', error);
        }

        // Fallback to shortened address
        return this.shortAddr(address);
    }

    shortAddr(address) {
        if (!address || address.length <= 10) {
            return address;
        }
        return `${address.slice(0, 6)}…${address.slice(-4)}`;
    }

    // Clean up expired cache entries periodically
    cleanCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp >= this.CACHE_TTL) {
                this.cache.delete(key);
            }
        }
    }
}

// Create singleton instance
const nameResolver = new NameResolver();

// Clean cache every 5 minutes
setInterval(() => {
    nameResolver.cleanCache();
}, 5 * 60 * 1000);

module.exports = { nameResolver };