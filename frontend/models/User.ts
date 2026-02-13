import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  NavigationContainer,
  ParamListBase,
  RouteProp,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {
  View,
  Text,
  Image,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import axios, { AxiosResponse } from 'axios';

/* ==================== User Model ==================== */
export interface IUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export class User implements IUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;

  constructor(params: IUser) {
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;
    this.avatarUrl = params.avatarUrl;
  }

  static fromJson(json: any): User {
    return new User({
      id: json.id ?? '',
      name: json.name ?? '',
      email: json.email ?? '',
      avatarUrl: json.avatarUrl,
    });
  }

  toJson(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatarUrl: this.avatarUrl,
    };
  }

  copyWith(update: Partial<IUser>): User {
    return new User({
      id: update.id ?? this.id,
      name: update.name ?? this.name,
      email: update.email ?? this.email,
      avatarUrl: update.avatarUrl ?? this.avatarUrl,
    });
  }
}

/* ==================== API Service ==================== */
const API_BASE_URL = 'https://api.example.com/users';

export const fetchUser = async (id: string): Promise<User> => {
  const response: AxiosResponse = await axios.get(`${API_BASE_URL}/${id}`);
  return User.fromJson(response.data);
};

export const updateUser = async (user: User): Promise<User> => {
  const response: AxiosResponse = await axios.put(
    `${API_BASE_URL}/${user.id}`,
    user.toJson(),
  );
  return User.fromJson(response.data);
};

/* ==================== User Context ==================== */
interface IUserContext {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

export const UserProvider = ({
  children,
  initialUserId,
}: {
  children: ReactNode;
  initialUserId: string;
}): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUser = await fetchUser(initialUserId);
      setUser(fetchedUser);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUserId]);

  const refresh = async () => {
    await loadUser();
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, error, refresh }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): IUserContext => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

/* ==================== Navigation Types ==================== */
type RootStackParamList = {
  UserProfile: undefined;
  EditUser: undefined;
};

type UserProfileNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'UserProfile'
>;

type EditUserNavProp = NativeStackNavigationProp<RootStackParamList, 'EditUser'>;

type EditUserRouteProp = RouteProp<RootStackParamList, 'EditUser'>;

/* ==================== Screens ==================== */
const UserProfileScreen = ({
  navigation,
}: {
  navigation: UserProfileNavProp;
}): JSX.Element => {
  const { user, loading, error, refresh } = useUser();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={refresh} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>No user data.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={
            user.avatarUrl
              ? { uri: user.avatarUrl }
              : require('./assets/default-avatar.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditUser')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const EditUserScreen = ({
  navigation,
  route,
}: {
  navigation: EditUserNavProp;
  route: EditUserRouteProp;
}): JSX.Element => {
  const { user, setUser } = useUser();
  const [name, setName] = useState<string>(user?.name ?? '');
  const [email, setEmail] = useState<string>(user?.email ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl ?? '');
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = user.copyWith({ name, email, avatarUrl });
      const savedUser = await updateUser(updated);
      setUser(savedUser);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Avatar URL</Text>
        <TextInput
          style={styles.input}
          value={avatarUrl}
          onChangeText={setAvatarUrl}
          placeholder="Enter avatar image URL"
        />
        {saving ? (
          <ActivityIndicator size="large" style={styles.saveIndicator} />
        ) : (
          <Button title="Save Changes" onPress={handleSave} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/* ==================== Navigator ==================== */
const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = ({
  initialUserId,
}: {
  initialUserId: string;
}): JSX.Element => (
  <UserProvider initialUserId={initialUserId}>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="UserProfile"
        screenOptions={{
          headerStyle: {
            backgroundColor: Platform.OS === 'android' ? '#6200ee' : '',
          },
          headerTintColor: Platform.OS === 'android' ? '#fff' : '#6200ee',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="UserProfile"
          component={UserProfileScreen}
          options={{ title: 'Profile' }}
        />
        <Stack.Screen
          name="EditUser"
          component={EditUserScreen}
          options={{ title: 'Edit Profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  </UserProvider>
);

/* ==================== Styles ==================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#b00020',
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: '#e0e0e0',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#212121',
  },
  email: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 20,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bdbdbd',
  },
  saveIndicator: {
    marginTop: 10,
  },
});