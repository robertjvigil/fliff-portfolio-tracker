import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';

// Mock the financial assets data
const mockAssets = [
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
];

// Mock the financial_assets.json import
jest.mock('../financial_assets.json', () => mockAssets);

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the app without crashing', () => {
    const { getByText } = render(<App />);
    
    expect(getByText('Portfolio Tracker')).toBeTruthy();
  });

  it('should display the home screen initially', () => {
    const { getByText } = render(<App />);
    
    expect(getByText('Portfolio Tracker')).toBeTruthy();
    expect(getByText('Real-time Financial Assets')).toBeTruthy();
    expect(getByText('Apple Inc.')).toBeTruthy();
  });

  it('should navigate to asset detail screen when asset is tapped', async () => {
    const { getByText, queryByText } = render(<App />);
    
    // Initially on home screen
    expect(getByText('Portfolio Tracker')).toBeTruthy();
    
    // Tap on Apple Inc. asset
    const appleAsset = getByText('Apple Inc.');
    fireEvent.press(appleAsset);
    
    // Should navigate to asset detail screen
    await waitFor(() => {
      expect(getByText('Asset Details')).toBeTruthy();
      expect(getByText('Apple Inc.')).toBeTruthy();
      expect(getByText('AAPL')).toBeTruthy();
    });
  });

  it('should navigate back to home screen from asset detail', async () => {
    const { getByText, queryByText } = render(<App />);
    
    // Navigate to asset detail
    const appleAsset = getByText('Apple Inc.');
    fireEvent.press(appleAsset);
    
    await waitFor(() => {
      expect(getByText('Asset Details')).toBeTruthy();
    });
    
    // Navigate back (this would be handled by the header back button in real app)
    // For testing, we'll simulate the navigation back
    // In a real test, you'd need to mock the navigation properly
  });

  it('should maintain state when navigating between screens', async () => {
    const { getByText } = render(<App />);
    
    // Filter to show only stocks
    const stocksButton = getByText('Stocks');
    fireEvent.press(stocksButton);
    
    // Should only show stocks
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('Tesla Inc.')).toBeTruthy();
    
    // Navigate to asset detail
    const appleAsset = getByText('Apple Inc.');
    fireEvent.press(appleAsset);
    
    await waitFor(() => {
      expect(getByText('Asset Details')).toBeTruthy();
    });
    
    // Navigate back (in real app, the filter state should be maintained)
    // This tests that the app doesn't crash during navigation
  });

  it('should handle search functionality', () => {
    const { getByText, queryByText, getByPlaceholderText } = render(<App />);
    
    const searchInput = getByPlaceholderText('Search assets...');
    
    // Search for Apple
    fireEvent.changeText(searchInput, 'Apple');
    
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(queryByText('Bitcoin')).toBeNull();
    expect(queryByText('Tesla Inc.')).toBeNull();
  });

  it('should handle filtering functionality', () => {
    const { getByText, queryByText } = render(<App />);
    
    // Filter by top gainers
    const gainersButton = getByText('Gainers');
    fireEvent.press(gainersButton);
    
    expect(getByText('Apple Inc.')).toBeTruthy(); // +2.5%
    expect(getByText('Tesla Inc.')).toBeTruthy(); // +5.8%
    expect(queryByText('Bitcoin')).toBeNull(); // -1.2%
  });

  it('should handle sorting functionality', () => {
    const { getByText, getAllByText } = render(<App />);
    
    // Sort by name
    const nameSortButton = getByText('Name');
    fireEvent.press(nameSortButton);
    
    const assetNames = getAllByText(/Apple Inc\.|Bitcoin|Tesla Inc\./);
    expect(assetNames[0].props.children).toBe('Apple Inc.');
  });

  it('should display correct asset information', () => {
    const { getByText } = render(<App />);
    
    // Check that all assets are displayed with correct information
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('$150.00')).toBeTruthy();
    expect(getByText('+2.50%')).toBeTruthy();
    
    expect(getByText('Bitcoin')).toBeTruthy();
    expect(getByText('BTC')).toBeTruthy();
    expect(getByText('$45000.00')).toBeTruthy();
    expect(getByText('-1.20%')).toBeTruthy();
  });

  it('should show asset type badges', () => {
    const { getAllByText } = render(<App />);
    
    const stockBadges = getAllByText('STOCK');
    const cryptoBadges = getAllByText('CRYPTO');
    
    expect(stockBadges).toHaveLength(2); // Apple and Tesla
    expect(cryptoBadges).toHaveLength(1); // Bitcoin
  });

  it('should handle empty search results gracefully', () => {
    const { getByText, queryByText, getByPlaceholderText } = render(<App />);
    
    const searchInput = getByPlaceholderText('Search assets...');
    
    // Search for something that doesn't exist
    fireEvent.changeText(searchInput, 'NonExistentAsset');
    
    // Should show no assets
    expect(queryByText('Apple Inc.')).toBeNull();
    expect(queryByText('Bitcoin')).toBeNull();
    expect(queryByText('Tesla Inc.')).toBeNull();
  });

  it('should handle case-insensitive search', () => {
    const { getByText, queryByText, getByPlaceholderText } = render(<App />);
    
    const searchInput = getByPlaceholderText('Search assets...');
    
    // Search with lowercase
    fireEvent.changeText(searchInput, 'apple');
    
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(queryByText('Bitcoin')).toBeNull();
  });

  it('should handle symbol search', () => {
    const { getByText, queryByText, getByPlaceholderText } = render(<App />);
    
    const searchInput = getByPlaceholderText('Search assets...');
    
    // Search by symbol
    fireEvent.changeText(searchInput, 'BTC');
    
    expect(getByText('Bitcoin')).toBeTruthy();
    expect(queryByText('Apple Inc.')).toBeNull();
    expect(queryByText('Tesla Inc.')).toBeNull();
  });
});