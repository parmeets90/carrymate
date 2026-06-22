import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { colors, typography, shadows } from '@/theme';
import { useAuth } from '@/store/auth';
import { MyRequestsScreen } from '@/screens/sender/MyRequestsScreen';
import { CreateRequestScreen } from '@/screens/sender/CreateRequestScreen';
import { RequestDetailScreen } from '@/screens/sender/RequestDetailScreen';
import { TripsScreen } from '@/screens/traveler/TripsScreen';
import { AddRouteScreen } from '@/screens/traveler/AddRouteScreen';
import { BrowseScreen } from '@/screens/traveler/BrowseScreen';
import { PlaceBidScreen } from '@/screens/traveler/PlaceBidScreen';
import { MyBidsScreen } from '@/screens/traveler/MyBidsScreen';
import { OrdersScreen } from '@/screens/orders/OrdersScreen';
import { OpenBoxScreen } from '@/screens/fulfillment/OpenBoxScreen';
import { DeliverScreen } from '@/screens/fulfillment/DeliverScreen';
import { DisputeScreen } from '@/screens/fulfillment/DisputeScreen';
import { RateScreen } from '@/screens/fulfillment/RateScreen';
import { ProfileTabScreen } from '@/screens/profile/ProfileTabScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.skyBlue,
  tabBarInactiveTintColor: colors.textHint,
  tabBarLabelStyle: { ...typography.caption, fontWeight: '600' as const },
  tabBarStyle: {
    height: 64,
    paddingBottom: 10,
    paddingTop: 8,
    backgroundColor: colors.bgCard,
    borderTopColor: colors.borderLight,
    ...shadows.md,
  },
};

const ICONS: Record<string, string> = {
  Requests: '📦',
  Post: '➕',
  Trips: '✈️',
  Bids: '🏷️',
  Orders: '🧾',
  Profile: '👤',
};

const tabIcon =
  (name: string) =>
  ({ focused }: { focused: boolean }) =>
    <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.45 }}>{ICONS[name]}</Text>;

function RoleTabs() {
  const role = useAuth((s) => s.user?.role);
  const isTraveler = role === 'TRAVELER';

  if (isTraveler) {
    return (
      <Tab.Navigator screenOptions={tabScreenOptions}>
        <Tab.Screen name="Trips" component={TripsScreen} options={{ tabBarIcon: tabIcon('Trips') }} />
        <Tab.Screen name="Bids" component={MyBidsScreen} options={{ tabBarIcon: tabIcon('Bids') }} />
        <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: tabIcon('Orders') }} />
        <Tab.Screen name="Profile" component={ProfileTabScreen} options={{ tabBarIcon: tabIcon('Profile') }} />
      </Tab.Navigator>
    );
  }

  // SENDER or BOTH
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Requests" component={MyRequestsScreen} options={{ tabBarIcon: tabIcon('Requests') }} />
      <Tab.Screen name="Post" component={CreateRequestScreen} options={{ tabBarIcon: tabIcon('Post') }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: tabIcon('Orders') }} />
      <Tab.Screen name="Profile" component={ProfileTabScreen} options={{ tabBarIcon: tabIcon('Profile') }} />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: colors.navyDark,
        contentStyle: { backgroundColor: colors.bgApp },
      }}
    >
      <Stack.Screen name="Tabs" component={RoleTabs} options={{ headerShown: false }} />
      <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Bids' }} />
      <Stack.Screen name="AddRoute" component={AddRouteScreen} options={{ title: 'Add trip' }} />
      <Stack.Screen name="Browse" component={BrowseScreen} options={{ title: 'Requests' }} />
      <Stack.Screen name="PlaceBid" component={PlaceBidScreen} options={{ title: 'Place bid' }} />
      <Stack.Screen name="OpenBox" component={OpenBoxScreen} options={{ title: 'Open-box' }} />
      <Stack.Screen name="Deliver" component={DeliverScreen} options={{ title: 'Deliver' }} />
      <Stack.Screen name="Dispute" component={DisputeScreen} options={{ title: 'Dispute' }} />
      <Stack.Screen name="Rate" component={RateScreen} options={{ title: 'Rate' }} />
    </Stack.Navigator>
  );
}
