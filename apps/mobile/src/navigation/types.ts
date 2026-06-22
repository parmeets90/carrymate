import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Auth/onboarding/KYC flow + main app stack screens. */
export type RootStackParamList = {
  // Auth + onboarding
  Phone: undefined;
  Otp: { phone: string };
  Profile: undefined;
  Kyc: undefined;
  // Main app
  Tabs: undefined;
  CreateRequest: undefined;
  RequestDetail: { requestId: string };
  AddRoute: undefined;
  Browse: { routeId: string };
  PlaceBid: { requestId: string; routeId: string; title: string };
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
