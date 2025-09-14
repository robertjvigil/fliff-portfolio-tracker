import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import initialAssets from '../../financial_assets.json';
import { Asset, SortField, SortDirection, FilterType } from '../types';
import { sortAssets, filterAssets, updateAssetPrices } from '../utils/assetUtils';

type RootStackParamList = {
  Home: undefined;
  AssetDetail: { asset: Asset };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [assets, setAssets] = useState<Asset[]>(initialAssets as Asset[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prevAssets => updateAssetPrices(prevAssets));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Memoized filtered and sorted assets
  const processedAssets = useMemo(() => {
    let filtered = filterAssets(assets, filterType);
    
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return sortAssets(filtered, sortField, sortDirection);
  }, [assets, searchQuery, sortField, sortDirection, filterType]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const handleAssetPress = useCallback((asset: Asset) => {
    navigation.navigate('AssetDetail', { asset });
  }, [navigation]);

  const renderAssetItem = useCallback(({ item }: { item: Asset }) => {
    const isPositive = item.dailyChangePercent >= 0;
    
    return (
      <TouchableOpacity
        style={styles.assetItem}
        onPress={() => handleAssetPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.assetHeader}>
          <View>
            <Text style={styles.assetName}>{item.name}</Text>
            <Text style={styles.assetSymbol}>{item.symbol}</Text>
          </View>
          <View style={styles.assetTypeContainer}>
            <Text style={styles.assetType}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.assetFooter}>
          <Text style={styles.assetPrice}>${item.currentPrice.toFixed(2)}</Text>
          <Text style={[
            styles.assetChange,
            { color: isPositive ? '#00C853' : '#FF1744' }
          ]}>
            {isPositive ? '+' : ''}{item.dailyChangePercent.toFixed(2)}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleAssetPress]);

  const renderFilterButton = useCallback((type: FilterType, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterType === type && styles.filterButtonActive
      ]}
      onPress={() => setFilterType(type)}
    >
      <Text style={[
        styles.filterButtonText,
        filterType === type && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  ), [filterType]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio Tracker</Text>
        <Text style={styles.subtitle}>Real-time Financial Assets</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search assets..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('topGainers', 'Gainers')}
          {renderFilterButton('topLosers', 'Losers')}
        </View>
        <View style={styles.filterRow}>
          {renderFilterButton('stocks', 'Stocks')}
          {renderFilterButton('crypto', 'Crypto')}
        </View>
      </View>

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => handleSort('name')}
        >
          <Text style={styles.sortButtonText}>
            Name {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => handleSort('dailyChangePercent')}
        >
          <Text style={styles.sortButtonText}>
            Performance {sortField === 'dailyChangePercent' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={processedAssets}
        renderItem={renderAssetItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.assetList}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 100,
          offset: 100 * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  sortButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  assetList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  assetItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  assetSymbol: {
    fontSize: 14,
    color: '#888',
  },
  assetTypeContainer: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assetType: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  assetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  assetChange: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
