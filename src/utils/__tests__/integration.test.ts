import { Asset } from '../../types';
import { sortAssets, filterAssets, updateAssetPrices, getSimilarAssets } from '../assetUtils';

describe('Integration Tests - Asset Utils', () => {
  const mockAssets: Asset[] = [
    {
      id: 1,
      name: 'Apple Inc.',
      symbol: 'AAPL',
      type: 'stock',
      currentPrice: 150.00,
      dailyChangePercent: 2.5,
    },
    {
      id: 2,
      name: 'Bitcoin',
      symbol: 'BTC',
      type: 'crypto',
      currentPrice: 45000.00,
      dailyChangePercent: -1.2,
    },
    {
      id: 3,
      name: 'Tesla Inc.',
      symbol: 'TSLA',
      type: 'stock',
      currentPrice: 800.00,
      dailyChangePercent: 5.8,
    },
    {
      id: 4,
      name: 'Ethereum',
      symbol: 'ETH',
      type: 'crypto',
      currentPrice: 3000.00,
      dailyChangePercent: -3.1,
    },
    {
      id: 5,
      name: 'Microsoft Corporation',
      symbol: 'MSFT',
      type: 'stock',
      currentPrice: 300.00,
      dailyChangePercent: 1.5,
    },
  ];

  describe('Complete Asset Processing Pipeline', () => {
    it('should handle the complete filtering and sorting pipeline', () => {
      // Step 1: Filter for stocks only
      const stocksOnly = filterAssets(mockAssets, 'stocks');
      expect(stocksOnly).toHaveLength(3);
      expect(stocksOnly.every(asset => asset.type === 'stock')).toBe(true);

      // Step 2: Sort by performance (descending)
      const sortedStocks = sortAssets(stocksOnly, 'dailyChangePercent', 'desc');
      expect(sortedStocks[0].name).toBe('Tesla Inc.'); // 5.8%
      expect(sortedStocks[1].name).toBe('Apple Inc.'); // 2.5%
      expect(sortedStocks[2].name).toBe('Microsoft Corporation'); // 1.5%

      // Step 3: Get similar assets for the top performer
      const similarAssets = getSimilarAssets(mockAssets, sortedStocks[0], 2);
      expect(similarAssets).toHaveLength(2);
      expect(similarAssets.every(asset => asset.type === 'stock')).toBe(true);
      expect(similarAssets.every(asset => asset.id !== sortedStocks[0].id)).toBe(true);
    });

    it('should handle top gainers filtering and sorting', () => {
      // Filter for top gainers
      const gainers = filterAssets(mockAssets, 'topGainers');
      expect(gainers).toHaveLength(3); // Apple, Tesla, Microsoft

      // Sort by performance (descending) to get best performers first
      const sortedGainers = sortAssets(gainers, 'dailyChangePercent', 'desc');
      expect(sortedGainers[0].name).toBe('Tesla Inc.'); // 5.8%
      expect(sortedGainers[1].name).toBe('Apple Inc.'); // 2.5%
      expect(sortedGainers[2].name).toBe('Microsoft Corporation'); // 1.5%
    });

    it('should handle top losers filtering and sorting', () => {
      // Filter for top losers
      const losers = filterAssets(mockAssets, 'topLosers');
      expect(losers).toHaveLength(2); // Bitcoin, Ethereum

      // Sort by performance (ascending) to get worst performers first
      const sortedLosers = sortAssets(losers, 'dailyChangePercent', 'asc');
      expect(sortedLosers[0].name).toBe('Ethereum'); // -3.1%
      expect(sortedLosers[1].name).toBe('Bitcoin'); // -1.2%
    });

    it('should handle crypto filtering and sorting', () => {
      // Filter for crypto only
      const cryptoAssets = filterAssets(mockAssets, 'crypto');
      expect(cryptoAssets).toHaveLength(2);
      expect(cryptoAssets.every(asset => asset.type === 'crypto')).toBe(true);

      // Sort by name (ascending)
      const sortedCrypto = sortAssets(cryptoAssets, 'name', 'asc');
      expect(sortedCrypto[0].name).toBe('Bitcoin');
      expect(sortedCrypto[1].name).toBe('Ethereum');
    });
  });

  describe('Price Update Simulation', () => {
    it('should simulate realistic price updates', () => {
      const originalAssets = [...mockAssets];
      const updatedAssets = updateAssetPrices(mockAssets);

      // All assets should be updated
      expect(updatedAssets).toHaveLength(mockAssets.length);

      // Each asset should have new prices within reasonable range
      updatedAssets.forEach((asset, index) => {
        const originalAsset = originalAssets[index];
        
        // Price should be within ±50% of original (reasonable for daily changes)
        expect(asset.currentPrice).toBeGreaterThan(originalAsset.currentPrice * 0.5);
        expect(asset.currentPrice).toBeLessThan(originalAsset.currentPrice * 1.5);
        
        // Daily change should be within ±10%
        expect(asset.dailyChangePercent).toBeGreaterThanOrEqual(-10);
        expect(asset.dailyChangePercent).toBeLessThanOrEqual(10);
        
        // Other properties should remain the same
        expect(asset.id).toBe(originalAsset.id);
        expect(asset.name).toBe(originalAsset.name);
        expect(asset.symbol).toBe(originalAsset.symbol);
        expect(asset.type).toBe(originalAsset.type);
      });
    });

    it('should maintain data integrity after multiple price updates', () => {
      let currentAssets = [...mockAssets];
      
      // Simulate multiple price updates
      for (let i = 0; i < 5; i++) {
        currentAssets = updateAssetPrices(currentAssets);
      }

      // All assets should still exist
      expect(currentAssets).toHaveLength(mockAssets.length);
      
      // All assets should have valid data
      currentAssets.forEach(asset => {
        expect(asset.id).toBeGreaterThan(0);
        expect(asset.name).toBeTruthy();
        expect(asset.symbol).toBeTruthy();
        expect(['stock', 'crypto']).toContain(asset.type);
        expect(asset.currentPrice).toBeGreaterThan(0);
        expect(typeof asset.dailyChangePercent).toBe('number');
      });
    });
  });

  describe('Search Simulation', () => {
    it('should simulate search functionality with filtering', () => {
      // Simulate searching for "Apple"
      const searchTerm = 'Apple';
      const filteredAssets = mockAssets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filteredAssets).toHaveLength(1);
      expect(filteredAssets[0].name).toBe('Apple Inc.');
    });

    it('should simulate case-insensitive search', () => {
      const searchTerm = 'bitcoin';
      const filteredAssets = mockAssets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filteredAssets).toHaveLength(1);
      expect(filteredAssets[0].name).toBe('Bitcoin');
    });

    it('should simulate symbol search', () => {
      const searchTerm = 'BTC';
      const filteredAssets = mockAssets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filteredAssets).toHaveLength(1);
      expect(filteredAssets[0].symbol).toBe('BTC');
    });
  });

  describe('Performance Testing', () => {
    it('should handle large datasets efficiently', () => {
      // Create a large dataset
      const largeAssetList: Asset[] = [];
      for (let i = 1; i <= 1000; i++) {
        largeAssetList.push({
          id: i,
          name: `Asset ${i}`,
          symbol: `AST${i}`,
          type: i % 2 === 0 ? 'stock' : 'crypto',
          currentPrice: Math.random() * 1000,
          dailyChangePercent: (Math.random() - 0.5) * 10,
        });
      }

      const startTime = Date.now();
      
      // Perform multiple operations
      const filtered = filterAssets(largeAssetList, 'stocks');
      const sorted = sortAssets(filtered, 'name', 'asc');
      const similar = getSimilarAssets(largeAssetList, sorted[0], 5);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms)
      expect(executionTime).toBeLessThan(100);
      expect(filtered.length).toBeGreaterThan(0);
      expect(sorted.length).toBeGreaterThan(0);
      expect(similar.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty asset arrays', () => {
      expect(filterAssets([], 'all')).toEqual([]);
      expect(sortAssets([], 'name', 'asc')).toEqual([]);
      expect(getSimilarAssets([], mockAssets[0], 5)).toEqual([]);
    });

    it('should handle single asset arrays', () => {
      const singleAsset = [mockAssets[0]];
      expect(filterAssets(singleAsset, 'stocks')).toEqual(singleAsset);
      expect(sortAssets(singleAsset, 'name', 'asc')).toEqual(singleAsset);
      expect(getSimilarAssets(singleAsset, mockAssets[0], 5)).toEqual([]);
    });

    it('should handle assets with zero price changes', () => {
      const zeroChangeAsset: Asset = {
        id: 999,
        name: 'Zero Change Asset',
        symbol: 'ZERO',
        type: 'stock',
        currentPrice: 100.00,
        dailyChangePercent: 0,
      };

      const assetsWithZero = [...mockAssets, zeroChangeAsset];
      const gainers = filterAssets(assetsWithZero, 'topGainers');
      const losers = filterAssets(assetsWithZero, 'topLosers');
      
      // Zero change should not appear in either gainers or losers
      expect(gainers.find(asset => asset.id === 999)).toBeUndefined();
      expect(losers.find(asset => asset.id === 999)).toBeUndefined();
    });
  });
});
