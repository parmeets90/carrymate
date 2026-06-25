import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { colors, typography, shadows } from '@/theme';
import { Icon, type IconName } from '@/components/Icon';
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
import { ConversationsScreen } from '@/screens/chat/ConversationsScreen';
import { ChatScreen } from '@/screens/chat/ChatScreen';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { AllowedItemsScreen } from '@/screens/sender/AllowedItemsScreen';
import { LegalScreen } from '@/screens/legal/LegalScreen';
import { AddPhoneScreen } from '@/screens/profile/AddPhoneScreen';
import { ProfileTabScreen } from '@/screens/profile/ProfileTabScreen';
import { UserProfileScreen } from '@/screens/profile/UserProfileScreen';
import { TransactionsScreen } from '@/screens/wallet/TransactionsScreen';

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

const TAB_ICONS: Record<string, IconName> = {
  Requests: 'package',
  Post: 'post',
  Trips: 'trips',
  Bids: 'bids',
  Orders: 'orders',
  Chat: 'chat',
  Profile: 'profile',
};

const tabIcon =
  (name: string) =>
  ({ focused, color }: { focused: boolean; color: string }) =>
    <Icon name={TAB_ICONS[name]!} size={24} color={color} weight={focused ? 'fill' : 'regular'} />;

function RoleTabs() {
  const role = useAuth((s) => s.user?.role);
  const isTraveler = role === 'TRAVELER';

  if (isTraveler) {
    return (
      <Tab.Navigator screenOptions={tabScreenOptions}>
        <Tab.Screen name="Trips" component={TripsScreen} options={{ tabBarIcon: tabIcon('Trips') }} />
        <Tab.Screen name="Bids" component={MyBidsScreen} options={{ tabBarIcon: tabIcon('Bids') }} />
        <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: tabIcon('Orders') }} />
        <Tab.Screen name="Chat" component={ConversationsScreen} options={{ tabBarIcon: tabIcon('Chat') }} />
        <Tab.Screen name="Profile" component={ProfileTabScreen} options={{ tabBarIcon: tabIcon('Profile') }} />
      </Tab.Navigator>
    );
  }

  // SENDER
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Requests" component={MyRequestsScreen} options={{ tabBarIcon: tabIcon('Requests') }} />
      <Tab.Screen name="Post" component={CreateRequestScreen} options={{ tabBarIcon: tabIcon('Post') }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: tabIcon('Orders') }} />
      <Tab.Screen name="Chat" component={ConversationsScreen} options={{ tabBarIcon: tabIcon('Chat') }} />
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
      <Stack.Screen name="EditRequest" component={CreateRequestScreen} options={{ title: 'Edit request' }} />
      <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Bids' }} />
      <Stack.Screen
        name="AddRoute"
        component={AddRouteScreen}
        options={({ route }) => ({ title: route.params?.route ? 'Edit trip' : 'Add trip' })}
      />
      <Stack.Screen name="Browse" component={BrowseScreen} options={{ title: 'Requests' }} />
      <Stack.Screen name="PlaceBid" component={PlaceBidScreen} options={{ title: 'Place bid' }} />
      <Stack.Screen name="OpenBox" component={OpenBoxScreen} options={{ title: 'Open-box' }} />
      <Stack.Screen name="Deliver" component={DeliverScreen} options={{ title: 'Deliver' }} />
      <Stack.Screen name="Dispute" component={DisputeScreen} options={{ title: 'Dispute' }} />
      <Stack.Screen name="Rate" component={RateScreen} options={{ title: 'Rate' }} />
      <Stack.Screen
        name="ChatThread"
        component={ChatScreen}
        options={({ route }) => ({ title: route.params.counterparty ?? 'Chat' })}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="AllowedItems" component={AllowedItemsScreen} options={{ title: 'What can I send?' }} />
      <Stack.Screen
        name="Legal"
        component={LegalScreen}
        options={({ route }) => ({ title: route.params.doc === 'terms' ? 'Terms of Service' : 'Privacy Policy' })}
      />
      <Stack.Screen name="AddPhone" component={AddPhoneScreen} options={{ title: 'Verify phone' }} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={({ route }) => ({ title: route.params.name ?? 'Profile' })}
      />
    </Stack.Navigator>
  );
}
