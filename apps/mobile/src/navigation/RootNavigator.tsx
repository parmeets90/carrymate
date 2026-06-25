import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAuth } from '@/store/auth';
import { colors } from '@/theme';
import { PhoneScreen } from '@/screens/auth/PhoneScreen';
import { OtpScreen } from '@/screens/auth/OtpScreen';
import { ProfileScreen } from '@/screens/onboarding/ProfileScreen';
import { KycScreen } from '@/screens/kyc/KycScreen';
import { LegalScreen } from '@/screens/legal/LegalScreen';
import { MainNavigator } from './MainNavigator';

const legalTitle = (doc: 'terms' | 'privacy') => (doc === 'terms' ? 'Terms of Service' : 'Privacy Policy');

const Stack = createNativeStackNavigator<RootStackParamList>();

const baseOptions = {
  headerShadowVisible: false,
  headerTitle: '',
  headerTintColor: colors.navyDark,
  contentStyle: { backgroundColor: colors.bgApp },
};

export function RootNavigator() {
  const user = useAuth((s) => s.user);

  // Not signed in → phone + OTP.
  if (!user) {
    return (
      <Stack.Navigator screenOptions={baseOptions}>
        <Stack.Screen name="Phone" component={PhoneScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Otp" component={OtpScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Legal"
          component={LegalScreen}
          options={({ route }) => ({ headerShown: true, title: legalTitle(route.params.doc) })}
        />
      </Stack.Navigator>
    );
  }

  // Signed in but no profile yet → onboarding.
  if (!user.fullName) {
    return (
      <Stack.Navigator screenOptions={baseOptions}>
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  // Not yet verified → KYC.
  if (user.kycStatus !== 'VERIFIED') {
    return (
      <Stack.Navigator screenOptions={baseOptions}>
        <Stack.Screen name="Kyc" component={KycScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  // Verified → marketplace.
  return <MainNavigator />;
}
