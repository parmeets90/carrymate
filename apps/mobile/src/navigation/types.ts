import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DeliveryRequestDto, TravelRouteDto } from '@carrymate/shared';

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
  EditRequest: { request: DeliveryRequestDto };
  RequestDetail: { requestId: string };
  AddRoute: { route: TravelRouteDto } | undefined;
  Browse: { routeId: string };
  PlaceBid: { requestId: string; routeId: string; title: string };
  OpenBox: { orderId: string; title: string };
  Deliver: { orderId: string; title: string };
  Dispute: { orderId: string; title: string };
  Rate: { orderId: string; counterparty: string };
  Chat: { conversationId: string; title: string; counterparty?: string | null };
  Notifications: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
