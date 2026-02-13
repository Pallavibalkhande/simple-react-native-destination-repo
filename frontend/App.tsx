import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, Button, StyleSheet } from 'react-native';

// ----- Global State (Context) -----
type AppState = {
  counter: number;
  increment: () => void;
};

const AppContext = createContext<AppState | undefined>(undefined);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [counter, setCounter] = useState<number>(0);
  const increment = () => setCounter(prev => prev + 1);
  return (
    <AppContext.Provider value={{ counter, increment }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// ----- Navigation Types -----
type RootStackParamList = {
  Home: undefined;
  Details: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ----- Screens -----
type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
const HomeScreen = ({ navigation }: HomeProps) => {
  const { counter, increment } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.counter}>Counter: {counter}</Text>
      <Button title="Increment Counter" onPress={increment} />
      <View style={styles.spacer} />
      <Button title="Go to Details" onPress={() => navigation.navigate('Details')} />
    </View>
  );
};

type DetailsProps = NativeStackScreenProps<RootStackParamList, 'Details'>;
const DetailsScreen = ({ navigation }: DetailsProps) => {
  const { counter } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details Screen</Text>
      <Text style={styles.counter}>Current Counter: {counter}</Text>
      <Button title="Back to Home" onPress={() => navigation.goBack()} />
    </View>
  );
};

// ----- App Component -----
const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerTitle: 'Home' }} />
          <Stack.Screen name="Details" component={DetailsScreen} options={{ headerTitle: 'Details' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;

// ----- Styles -----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    fontWeight: '600',
  },
  counter: {
    fontSize: 20,
    marginBottom: 16,
  },
  spacer: {
    height: 12,
  },
});