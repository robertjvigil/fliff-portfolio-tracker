export interface Asset {
  id: number;
  name: string;
  symbol: string;
  type: 'stock' | 'crypto';
  currentPrice: number;
  dailyChangePercent: number;
}

export type SortField = 'name' | 'dailyChangePercent';
export type SortDirection = 'asc' | 'desc';
export type FilterType = 'all' | 'topGainers' | 'topLosers' | 'stocks' | 'crypto';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  type: FilterType;
}
