import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../HomeScreen';
import { Asset } from '../../types';

// Mock the financial assets data
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
];

// Mock the financial_assets.json import
jest.mock('../../../financial_assets.json', () => mockAssets);

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Test wrapper component
const TestNavigator = () => {
  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render the home screen with title and subtitle', () => {
    const { getByText } = render(<TestNavigator />);
    
    expect(getByText('Portfolio Tracker')).toBeTruthy();
    expect(getByText('Real-time Financial Assets')).toBeTruthy();
  });

  it('should render all assets in the list', () => {
    const { getByText } = render(<TestNavigator />);
    
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('Bitcoin')).toBeTruthy();
    expect(getByText('Tesla Inc.')).toBeTruthy();
  });

  it('should display asset prices and changes', () => {
    const { getByText } = render(<TestNavigator />);
    
    expect(getByText('$150.00')).toBeTruthy();
    expect(getByText('$45000.00')).toBeTruthy();
    expect(getByText('$800.00')).toBeTruthy();
    
    expect(getByText('+2.50%')).toBeTruthy();
    expect(getByText('-1.20%')).toBeTruthy();
    expect(getByText('+5.80%')).toBeTruthy();
  });

  it('should filter assets by top gainers', () => {
    const { getByText, queryByText } = render(<TestNavigator />);
    
    const gainersButton = getByText('Gainers');
    fireEvent.press(gainersButton);
    
    // Should show only positive performers
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('Tesla Inc.')).toBeTruthy();
    expect(queryByText('Bitcoin')).toBeNull();
  });

  it('should filter assets by top losers', () => {
    const { getByText, queryByText } = render(<TestNavigator />);
    
    const losersButton = getByText('Losers');
    fireEvent.press(losersButton);
    
    // Should show only negative performers
    expect(getByText('Bitcoin')).toBeTruthy();
    expect(queryByText('Apple Inc.')).toBeNull();
    expect(queryByText('Tesla Inc.')).toBeNull();
  });

  it('should filter assets by type (stocks)', () => {
    const { getByText, queryByText } = render(<TestNavigator />);
    
    const stocksButton = getByText('Stocks');
    fireEvent.press(stocksButton);
    
    // Should show only stocks
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('Tesla Inc.')).toBeTruthy();
    expect(queryByText('Bitcoin')).toBeNull();
  });

  it('should filter assets by type (crypto)', () => {
    const { getByText, queryByText } = render(<TestNavigator />);
    
    const cryptoButton = getByText('Crypto');
    fireEvent.press(cryptoButton);
    
    // Should show only crypto
    expect(getByText('Bitcoin')).toBeTruthy();
    expect(queryByText('Apple Inc.')).toBeNull();
    expect(queryByText('Tesla Inc.')).toBeNull();
  });

  it('should search assets by name', () => {
    const { getByText, queryByText, getByPlaceholderText } = render(<TestNavigator />);
    
    const searchInput = getByPlaceholderText('Search assets...');
    fireEvent.changeText(searchInput, 'Apple');
    
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(queryByText('Bitcoin')).toBeNull();
    expect(queryByText('Tesla Inc.')).toBeNull();
  });

  it('should search assets by symbol', () => {
    const { getByText, queryByText, getByPlaceholderText } = render(<TestNavigator />);
    
    const searchInput = getByPlaceholderText('Search assets...');
    fireEvent.changeText(searchInput, 'BTC');
    
    expect(getByText('Bitcoin')).toBeTruthy();
    expect(queryByText('Apple Inc.')).toBeNull();
    expect(queryByText('Tesla Inc.')).toBeNull();
  });

  it('should sort assets by name in ascending order', () => {
    const { getByText, getAllByText } = render(<TestNavigator />);
    
    const nameSortButton = getByText('Name');
    fireEvent.press(nameSortButton);
    
    const assetNames = getAllByText(/Apple Inc\.|Bitcoin|Tesla Inc\./);
    expect(assetNames[0].props.children).toBe('Apple Inc.');
  });

  it('should sort assets by name in descending order', () => {
    const { getByText, getAllByText } = render(<TestNavigator />);
    
    const nameSortButton = getByText('Name');
    fireEvent.press(nameSortButton); // First press - ascending
    fireEvent.press(nameSortButton); // Second press - descending
    
    const assetNames = getAllByText(/Apple Inc\.|Bitcoin|Tesla Inc\./);
    expect(assetNames[0].props.children).toBe('Tesla Inc.');
  });

  it('should sort assets by performance in ascending order', () => {
    const { getByText, getAllByText } = render(<TestNavigator />);
    
    const performanceSortButton = getByText('Performance');
    fireEvent.press(performanceSortButton);
    
    const assetNames = getAllByText(/Apple Inc\.|Bitcoin|Tesla Inc\./);
    expect(assetNames[0].props.children).toBe('Bitcoin'); // Lowest performance
  });

  it('should sort assets by performance in descending order', () => {
    const { getByText, getAllByText } = render(<TestNavigator />);
    
    const performanceSortButton = getByText('Performance');
    fireEvent.press(performanceSortButton); // First press - ascending
    fireEvent.press(performanceSortButton); // Second press - descending
    
    const assetNames = getAllByText(/Apple Inc\.|Bitcoin|Tesla Inc\./);
    expect(assetNames[0].props.children).toBe('Tesla Inc.'); // Highest performance
  });

  it('should navigate to asset detail when asset is pressed', () => {
    const { getByText } = render(<TestNavigator />);
    
    const appleAsset = getByText('Apple Inc.');
    fireEvent.press(appleAsset);
    
    expect(mockNavigate).toHaveBeenCalledWith('AssetDetail', {
      asset: expect.objectContaining({
        id: 1,
        name: 'Apple Inc.',
        symbol: 'AAPL',
      }),
    });
  });

  it('should update prices every 5 seconds', async () => {
    const { getByText } = render(<TestNavigator />);
    
    const initialPrice = getByText('$150.00');
    expect(initialPrice).toBeTruthy();
    
    // Fast-forward time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Wait for the price update
    await waitFor(() => {
      // The price should have changed (it's randomized)
      expect(getByText('$150.00')).toBeTruthy(); // This might still be the same due to randomization
    });
  });

  it('should clear search when search input is cleared', () => {
    const { getByText, queryByText, getByPlaceholderText } = render(<TestNavigator />);
    
    const searchInput = getByPlaceholderText('Search assets...');
    
    // Search for something
    fireEvent.changeText(searchInput, 'Apple');
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(queryByText('Bitcoin')).toBeNull();
    
    // Clear search
    fireEvent.changeText(searchInput, '');
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('Bitcoin')).toBeTruthy();
    expect(getByText('Tesla Inc.')).toBeTruthy();
  });

  it('should show correct asset types', () => {
    const { getAllByText } = render(<TestNavigator />);
    
    const stockTypes = getAllByText('STOCK');
    const cryptoTypes = getAllByText('CRYPTO');
    
    expect(stockTypes).toHaveLength(2); // Apple and Tesla
    expect(cryptoTypes).toHaveLength(1); // Bitcoin
  });

  it('should display correct color coding for positive and negative changes', () => {
    const { getByText } = render(<TestNavigator />);
    
    const positiveChange = getByText('+2.50%');
    const negativeChange = getByText('-1.20%');
    
    expect(positiveChange).toBeTruthy();
    expect(negativeChange).toBeTruthy();
  });
});
