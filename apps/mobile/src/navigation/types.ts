import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Phone: undefined;
  Otp: { phone: string };
  Profile: undefined;
  Kyc: undefined;
  Home: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
