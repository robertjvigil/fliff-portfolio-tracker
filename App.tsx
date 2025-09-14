import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import AssetDetailScreen from './src/screens/AssetDetailScreen';
import { Asset } from './src/types';

export type RootStackParamList = {
  Home: undefined;
  AssetDetail: { asset: Asset };
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0A0A0A' },
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="AssetDetail" 
          component={AssetDetailScreen}
          options={{
            headerShown: true,
            headerTitle: 'Asset Details',
            headerStyle: { backgroundColor: '#1A1A1A' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;