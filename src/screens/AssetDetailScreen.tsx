import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import initialAssets from '../../financial_assets.json';
import { Asset, SortField, SortDirection } from '../types';
import { sortAssets, getSimilarAssets } from '../utils/assetUtils';

type RootStackParamList = {
  Home: undefined;
  AssetDetail: { asset: Asset };
};

type AssetDetailRouteProp = RouteProp<RootStackParamList, 'AssetDetail'>;
type AssetDetailNavigationProp = StackNavigationProp<RootStackParamList, 'AssetDetail'>;

interface AssetDetailScreenProps {
  navigation: AssetDetailNavigationProp;
}

const AssetDetailScreen: React.FC<AssetDetailScreenProps> = ({ navigation }) => {
  const route = useRoute<AssetDetailRouteProp>();
  const { asset } = route.params;

  const similarAssets = useMemo(() => {
    return getSimilarAssets(initialAssets as Asset[], asset, 3);
  }, [asset]);

  const handleSimilarAssetPress = useCallback((similarAsset: Asset) => {
    navigation.replace('AssetDetail', { asset: similarAsset });
  }, [navigation]);

  const renderSimilarAsset = useCallback(({ item }: { item: Asset }) => {
    const isPositive = item.dailyChangePercent >= 0;
    
    return (
      <TouchableOpacity
        style={styles.similarAssetItem}
        onPress={() => handleSimilarAssetPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.similarAssetHeader}>
          <Text style={styles.similarAssetName}>{item.name}</Text>
          <Text style={styles.similarAssetSymbol}>{item.symbol}</Text>
        </View>
        <View style={styles.similarAssetFooter}>
          <Text style={styles.similarAssetPrice}>${item.currentPrice.toFixed(2)}</Text>
          <Text style={[
            styles.similarAssetChange,
            { color: isPositive ? '#00C853' : '#FF1744' }
          ]}>
            {isPositive ? '+' : ''}{item.dailyChangePercent.toFixed(2)}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleSimilarAssetPress]);

  const isPositive = asset.dailyChangePercent >= 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.assetInfo}>
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.assetSymbol}>{asset.symbol}</Text>
            <View style={styles.assetTypeContainer}>
              <Text style={styles.assetType}>{asset.type.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.priceInfo}>
            <Text style={styles.currentPrice}>${asset.currentPrice.toFixed(2)}</Text>
            <Text style={[
              styles.dailyChange,
              { color: isPositive ? '#00C853' : '#FF1744' }
            ]}>
              {isPositive ? '+' : ''}{asset.dailyChangePercent.toFixed(2)}%
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Asset ID</Text>
            <Text style={styles.detailValue}>{asset.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{asset.type}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Price</Text>
            <Text style={styles.detailValue}>${asset.currentPrice.toFixed(2)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Daily Change</Text>
            <Text style={[
              styles.detailValue,
              { color: isPositive ? '#00C853' : '#FF1744' }
            ]}>
              {isPositive ? '+' : ''}{asset.dailyChangePercent.toFixed(2)}%
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price Change</Text>
            <Text style={[
              styles.detailValue,
              { color: isPositive ? '#00C853' : '#FF1744' }
            ]}>
              {isPositive ? '+' : ''}${(asset.currentPrice * asset.dailyChangePercent / 100).toFixed(2)}
            </Text>
          </View>
        </View>

        {similarAssets.length > 0 && (
          <View style={styles.similarAssetsContainer}>
            <Text style={styles.similarAssetsTitle}>Similar Assets</Text>
            <FlatList
              data={similarAssets}
              renderItem={renderSimilarAsset}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarAssetsList}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  assetInfo: {
    marginBottom: 20,
  },
  assetName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  assetSymbol: {
    fontSize: 18,
    color: '#888',
    marginBottom: 12,
  },
  assetTypeContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  assetType: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dailyChange: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  detailLabel: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  similarAssetsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  similarAssetsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  similarAssetsList: {
    paddingRight: 20,
  },
  similarAssetItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#333',
  },
  similarAssetHeader: {
    marginBottom: 12,
  },
  similarAssetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  similarAssetSymbol: {
    fontSize: 14,
    color: '#888',
  },
  similarAssetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  similarAssetPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  similarAssetChange: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AssetDetailScreen;
