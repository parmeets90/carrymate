import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAuth } from '@/store/auth';
import { colors } from '@/theme';
import { PhoneScreen } from '@/screens/auth/PhoneScreen';
import { OtpScreen } from '@/screens/auth/OtpScreen';
import { ProfileScreen } from '@/screens/onboarding/ProfileScreen';
import { KycScreen } from '@/screens/kyc/KycScreen';
import { HomeScreen } from '@/screens/main/HomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const user = useAuth((s) => s.user);

  const needsProfile = user && !user.fullName;
  const needsKyc = user && user.kycStatus !== 'VERIFIED';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTitle: '',
        headerTintColor: colors.navy,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {!user ? (
        <Stack.Group>
          <Stack.Screen name="Phone" component={PhoneScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Otp" component={OtpScreen} />
        </Stack.Group>
      ) : needsProfile ? (
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      ) : needsKyc ? (
        <Stack.Screen name="Kyc" component={KycScreen} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}
