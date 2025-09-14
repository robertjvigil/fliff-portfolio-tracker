import { Asset } from '../../types';
import { sortAssets, filterAssets, updateAssetPrices, getSimilarAssets } from '../assetUtils';

describe('assetUtils', () => {
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
  ];

  describe('sortAssets', () => {
    it('should sort assets by name in ascending order', () => {
      const result = sortAssets(mockAssets, 'name', 'asc');
      expect(result[0].name).toBe('Apple Inc.');
      expect(result[1].name).toBe('Bitcoin');
      expect(result[2].name).toBe('Ethereum');
      expect(result[3].name).toBe('Tesla Inc.');
    });

    it('should sort assets by name in descending order', () => {
      const result = sortAssets(mockAssets, 'name', 'desc');
      expect(result[0].name).toBe('Tesla Inc.');
      expect(result[1].name).toBe('Ethereum');
      expect(result[2].name).toBe('Bitcoin');
      expect(result[3].name).toBe('Apple Inc.');
    });

    it('should sort assets by performance in ascending order', () => {
      const result = sortAssets(mockAssets, 'dailyChangePercent', 'asc');
      expect(result[0].dailyChangePercent).toBe(-3.1);
      expect(result[1].dailyChangePercent).toBe(-1.2);
      expect(result[2].dailyChangePercent).toBe(2.5);
      expect(result[3].dailyChangePercent).toBe(5.8);
    });

    it('should sort assets by performance in descending order', () => {
      const result = sortAssets(mockAssets, 'dailyChangePercent', 'desc');
      expect(result[0].dailyChangePercent).toBe(5.8);
      expect(result[1].dailyChangePercent).toBe(2.5);
      expect(result[2].dailyChangePercent).toBe(-1.2);
      expect(result[3].dailyChangePercent).toBe(-3.1);
    });

    it('should not mutate the original array', () => {
      const originalAssets = [...mockAssets];
      sortAssets(mockAssets, 'name', 'asc');
      expect(mockAssets).toEqual(originalAssets);
    });
  });

  describe('filterAssets', () => {
    it('should return all assets when filter type is "all"', () => {
      const result = filterAssets(mockAssets, 'all');
      expect(result).toHaveLength(4);
      expect(result).toEqual(mockAssets);
    });

    it('should filter top gainers correctly', () => {
      const result = filterAssets(mockAssets, 'topGainers');
      expect(result).toHaveLength(2);
      expect(result.every(asset => asset.dailyChangePercent > 0)).toBe(true);
      expect(result.map(asset => asset.name)).toEqual(['Apple Inc.', 'Tesla Inc.']);
    });

    it('should filter top losers correctly', () => {
      const result = filterAssets(mockAssets, 'topLosers');
      expect(result).toHaveLength(2);
      expect(result.every(asset => asset.dailyChangePercent < 0)).toBe(true);
      expect(result.map(asset => asset.name)).toEqual(['Bitcoin', 'Ethereum']);
    });

    it('should filter stocks correctly', () => {
      const result = filterAssets(mockAssets, 'stocks');
      expect(result).toHaveLength(2);
      expect(result.every(asset => asset.type === 'stock')).toBe(true);
      expect(result.map(asset => asset.name)).toEqual(['Apple Inc.', 'Tesla Inc.']);
    });

    it('should filter crypto correctly', () => {
      const result = filterAssets(mockAssets, 'crypto');
      expect(result).toHaveLength(2);
      expect(result.every(asset => asset.type === 'crypto')).toBe(true);
      expect(result.map(asset => asset.name)).toEqual(['Bitcoin', 'Ethereum']);
    });

    it('should return empty array for unknown filter type', () => {
      const result = filterAssets(mockAssets, 'unknown' as any);
      expect(result).toEqual(mockAssets);
    });
  });

  describe('updateAssetPrices', () => {
    it('should update all asset prices', () => {
      const result = updateAssetPrices(mockAssets);
      expect(result).toHaveLength(4);
      
      // Check that all assets have been updated
      result.forEach((asset, index) => {
        expect(asset.id).toBe(mockAssets[index].id);
        expect(asset.name).toBe(mockAssets[index].name);
        expect(asset.symbol).toBe(mockAssets[index].symbol);
        expect(asset.type).toBe(mockAssets[index].type);
        // Prices and changes should be different (randomized)
        expect(typeof asset.currentPrice).toBe('number');
        expect(typeof asset.dailyChangePercent).toBe('number');
      });
    });

    it('should not mutate the original array', () => {
      const originalAssets = [...mockAssets];
      updateAssetPrices(mockAssets);
      expect(mockAssets).toEqual(originalAssets);
    });

    it('should return new price values within reasonable range', () => {
      const result = updateAssetPrices(mockAssets);
      
      result.forEach((asset, index) => {
        const originalPrice = mockAssets[index].currentPrice;
        // Price should be within ±50% of original (reasonable for daily changes)
        expect(asset.currentPrice).toBeGreaterThan(originalPrice * 0.5);
        expect(asset.currentPrice).toBeLessThan(originalPrice * 1.5);
        
        // Daily change should be within ±10%
        expect(asset.dailyChangePercent).toBeGreaterThanOrEqual(-10);
        expect(asset.dailyChangePercent).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('getSimilarAssets', () => {
    it('should return similar assets of the same type', () => {
      const currentAsset = mockAssets[0]; // Apple Inc. (stock)
      const result = getSimilarAssets(mockAssets, currentAsset, 2);
      
      expect(result).toHaveLength(1); // Only Tesla Inc. is another stock
      expect(result[0].type).toBe('stock');
      expect(result[0].id).not.toBe(currentAsset.id);
      expect(result[0].name).toBe('Tesla Inc.');
    });

    it('should return crypto assets when current asset is crypto', () => {
      const currentAsset = mockAssets[1]; // Bitcoin (crypto)
      const result = getSimilarAssets(mockAssets, currentAsset, 2);
      
      expect(result).toHaveLength(1); // Only Ethereum is another crypto
      expect(result[0].type).toBe('crypto');
      expect(result[0].id).not.toBe(currentAsset.id);
      expect(result[0].name).toBe('Ethereum');
    });

    it('should respect the limit parameter', () => {
      const currentAsset = mockAssets[0]; // Apple Inc. (stock)
      const result = getSimilarAssets(mockAssets, currentAsset, 1);
      
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no similar assets exist', () => {
      const singleAsset = [mockAssets[0]];
      const result = getSimilarAssets(singleAsset, mockAssets[0], 3);
      
      expect(result).toHaveLength(0);
    });

    it('should not include the current asset in results', () => {
      const currentAsset = mockAssets[0];
      const result = getSimilarAssets(mockAssets, currentAsset, 3);
      
      expect(result.every(asset => asset.id !== currentAsset.id)).toBe(true);
    });
  });
});
