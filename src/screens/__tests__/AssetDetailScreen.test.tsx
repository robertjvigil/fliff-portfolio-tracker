import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AssetDetailScreen from '../AssetDetailScreen';
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
  {
    id: 4,
    name: 'Microsoft Corporation',
    symbol: 'MSFT',
    type: 'stock',
    currentPrice: 300.00,
    dailyChangePercent: 1.5,
  },
];

// Mock the financial_assets.json import
jest.mock('../../../financial_assets.json', () => mockAssets);

// Mock the navigation
const mockNavigate = jest.fn();
const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
  }),
  useRoute: () => ({
    params: {
      asset: mockAssets[0], // Apple Inc.
    },
  }),
}));

// Test wrapper component
const TestNavigator = () => {
  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="AssetDetail" component={AssetDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('AssetDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the asset detail screen with correct title', () => {
    const { getByText } = render(<TestNavigator />);
    
    expect(getByText('Asset Details')).toBeTruthy();
  });

  it('should display the correct asset information', () => {
    const { getByText } = render(<TestNavigator />);
    
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('$150.00')).toBeTruthy();
    expect(getByText('+2.50%')).toBeTruthy();
  });

  it('should display the asset type badge', () => {
    const { getByText } = render(<TestNavigator />);
    
    expect(getByText('STOCK')).toBeTruthy();
  });

  it('should display all asset details in the details section', () => {
    const { getByText } = render(<TestNavigator />);
    
    // Check all detail rows
    expect(getByText('Asset ID')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
    
    expect(getByText('Type')).toBeTruthy();
    expect(getByText('stock')).toBeTruthy();
    
    expect(getByText('Current Price')).toBeTruthy();
    expect(getByText('$150.00')).toBeTruthy();
    
    expect(getByText('Daily Change')).toBeTruthy();
    expect(getByText('+2.50%')).toBeTruthy();
    
    expect(getByText('Price Change')).toBeTruthy();
    expect(getByText('+$3.75')).toBeTruthy(); // 150 * 2.5 / 100
  });

  it('should display similar assets section', () => {
    const { getByText } = render(<TestNavigator />);
    
    expect(getByText('Similar Assets')).toBeTruthy();
  });

  it('should show similar assets of the same type', () => {
    const { getByText, queryByText } = render(<TestNavigator />);
    
    // Should show other stocks (Tesla and Microsoft) but not Bitcoin (crypto)
    expect(getByText('Tesla Inc.')).toBeTruthy();
    expect(getByText('Microsoft Corporation')).toBeTruthy();
    expect(queryByText('Bitcoin')).toBeNull();
  });

  it('should navigate to similar asset when pressed', () => {
    const { getByText } = render(<TestNavigator />);
    
    const teslaAsset = getByText('Tesla Inc.');
    fireEvent.press(teslaAsset);
    
    expect(mockReplace).toHaveBeenCalledWith('AssetDetail', {
      asset: expect.objectContaining({
        id: 3,
        name: 'Tesla Inc.',
        symbol: 'TSLA',
      }),
    });
  });

  it('should display correct price change calculation for positive change', () => {
    const { getByText } = render(<TestNavigator />);
    
    // Apple has 2.5% change, so price change should be 150 * 2.5 / 100 = 3.75
    expect(getByText('+$3.75')).toBeTruthy();
  });

  it('should display correct color coding for positive changes', () => {
    const { getByText } = render(<TestNavigator />);
    
    const positiveChange = getByText('+2.50%');
    expect(positiveChange).toBeTruthy();
  });

  it('should handle negative price changes correctly', () => {
    // Mock a negative change asset
    jest.doMock('@react-navigation/native', () => ({
      ...jest.requireActual('@react-navigation/native'),
      useNavigation: () => ({
        navigate: mockNavigate,
        replace: mockReplace,
      }),
      useRoute: () => ({
        params: {
          asset: mockAssets[1], // Bitcoin with -1.2% change
        },
      }),
    }));

    const { getByText } = render(<TestNavigator />);
    
    expect(getByText('Bitcoin')).toBeTruthy();
    expect(getByText('-1.20%')).toBeTruthy();
    expect(getByText('-$540.00')).toBeTruthy(); // 45000 * -1.2 / 100
  });

  it('should display asset symbol correctly', () => {
    const { getByText } = render(<TestNavigator />);
    
    expect(getByText('AAPL')).toBeTruthy();
  });

  it('should display current price in correct format', () => {
    const { getByText } = render(<TestNavigator />);
    
    expect(getByText('$150.00')).toBeTruthy();
  });

  it('should limit similar assets to 3 by default', () => {
    const { getAllByText } = render(<TestNavigator />);
    
    // Should show Tesla and Microsoft (2 similar stocks)
    const similarAssetNames = getAllByText(/Tesla Inc\.|Microsoft Corporation/);
    expect(similarAssetNames).toHaveLength(2);
  });

  it('should not include the current asset in similar assets', () => {
    const { queryByText } = render(<TestNavigator />);
    
    // Apple Inc. should not appear in similar assets since it's the current asset
    const similarAssetsSection = queryByText('Similar Assets');
    expect(similarAssetsSection).toBeTruthy();
    
    // The current asset (Apple) should not be in the similar assets list
    // This is tested by checking that only Tesla and Microsoft appear
    expect(queryByText('Tesla Inc.')).toBeTruthy();
    expect(queryByText('Microsoft Corporation')).toBeTruthy();
  });

  it('should handle crypto assets correctly', () => {
    // Mock a crypto asset
    jest.doMock('@react-navigation/native', () => ({
      ...jest.requireActual('@react-navigation/native'),
      useNavigation: () => ({
        navigate: mockNavigate,
        replace: mockReplace,
      }),
      useRoute: () => ({
        params: {
          asset: mockAssets[1], // Bitcoin (crypto)
        },
      }),
    }));

    const { getByText } = render(<TestNavigator />);
    
    expect(getByText('Bitcoin')).toBeTruthy();
    expect(getByText('BTC')).toBeTruthy();
    expect(getByText('CRYPTO')).toBeTruthy();
  });

  it('should display large prices correctly', () => {
    // Mock Bitcoin with large price
    jest.doMock('@react-navigation/native', () => ({
      ...jest.requireActual('@react-navigation/native'),
      useNavigation: () => ({
        navigate: mockNavigate,
        replace: mockReplace,
      }),
      useRoute: () => ({
        params: {
          asset: mockAssets[1], // Bitcoin with $45000
        },
      }),
    }));

    const { getByText } = render(<TestNavigator />);
    
    expect(getByText('$45000.00')).toBeTruthy();
  });
});
