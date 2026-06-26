import {
  House,
  Package,
  PlusCircle,
  AirplaneTakeoff,
  AirplaneTilt,
  Tag,
  Receipt,
  ChatCircle,
  UserCircle,
  Bell,
  PaperPlaneTilt,
  Lock,
  LockOpen,
  MagnifyingGlass,
  Wallet,
  CheckCircle,
  Warning,
  WarningOctagon,
  Star,
  SealCheck,
  IdentificationCard,
  Handshake,
  MapPin,
  XCircle,
  CaretRight,
  CaretLeft,
  CalendarBlank,
  PencilSimple,
  Trash,
  Camera,
  Phone,
  type IconProps,
  type IconWeight,
} from 'phosphor-react-native';
import { colors } from '@/theme';

/**
 * Single source of truth for iconography (Phosphor, outline weight per CLAUDE.md).
 * Use semantic names so swapping a glyph is a one-line change everywhere.
 */
const REGISTRY = {
  home: House,
  package: Package,
  post: PlusCircle,
  trips: AirplaneTakeoff,
  inTransit: AirplaneTilt,
  bids: Tag,
  orders: Receipt,
  chat: ChatCircle,
  profile: UserCircle,
  bell: Bell,
  send: PaperPlaneTilt,
  lock: Lock,
  unlock: LockOpen,
  search: MagnifyingGlass,
  wallet: Wallet,
  check: CheckCircle,
  warning: Warning,
  alert: WarningOctagon,
  star: Star,
  verified: SealCheck,
  identity: IdentificationCard,
  handshake: Handshake,
  location: MapPin,
  cross: XCircle,
  chevronRight: CaretRight,
  back: CaretLeft,
  calendar: CalendarBlank,
  edit: PencilSimple,
  delete: Trash,
  camera: Camera,
  phone: Phone,
} as const;

export type IconName = keyof typeof REGISTRY;

export function Icon({
  name,
  size = 22,
  color = colors.textSecondary,
  weight = 'regular',
}: {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
} & Pick<IconProps, never>) {
  const Glyph = REGISTRY[name];
  return <Glyph size={size} color={color} weight={weight} />;
}
