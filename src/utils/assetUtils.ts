import { Asset, SortField, SortDirection, FilterType } from '../types';

export const sortAssets = (assets: Asset[], field: SortField, direction: SortDirection): Asset[] => {
  return [...assets].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (field === 'name') {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    } else {
      aValue = a.dailyChangePercent;
      bValue = b.dailyChangePercent;
    }

    if (direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
};

export const filterAssets = (assets: Asset[], filterType: FilterType): Asset[] => {
  switch (filterType) {
    case 'topGainers':
      return assets.filter(asset => asset.dailyChangePercent > 0);
    case 'topLosers':
      return assets.filter(asset => asset.dailyChangePercent < 0);
    case 'stocks':
      return assets.filter(asset => asset.type === 'stock');
    case 'crypto':
      return assets.filter(asset => asset.type === 'crypto');
    default:
      return assets;
  }
};

export const updateAssetPrices = (assets: Asset[]): Asset[] => {
  return assets.map(asset => {
    const changePercent = (Math.random() - 0.5) * 10; // Random change between -5% and +5%
    const newPrice = asset.currentPrice * (1 + changePercent / 100);
    
    return {
      ...asset,
      currentPrice: Math.round(newPrice * 100) / 100,
      dailyChangePercent: Math.round(changePercent * 100) / 100,
    };
  });
};

export const getSimilarAssets = (assets: Asset[], currentAsset: Asset, limit: number = 3): Asset[] => {
  return assets
    .filter(asset => asset.id !== currentAsset.id && asset.type === currentAsset.type)
    .slice(0, limit);
};
