import type { SVGProps } from 'react';

/**
 * Compact inline icon set in a single technical visual language — 1.6px stroke,
 * round caps, 24px grid (Phosphor/Radix-like). Inline SVG keeps the bundle lean
 * and the stroke perfectly consistent. Decorative by default (aria-hidden);
 * pass a `title` where an icon carries standalone meaning.
 */
type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Base({ children, title, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const IdIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <circle cx="8.5" cy="11" r="2" />
    <path d="M5.5 16c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2" />
    <path d="M14.5 9.5H18M14.5 12.5H18M14.5 15.5h2" />
  </Base>
);

export const PassportIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 3.5h11A2.5 2.5 0 0 1 18.5 6v12A2.5 2.5 0 0 1 16 20.5H5z" />
    <circle cx="11" cy="10" r="3" />
    <path d="M9 17h4" />
  </Base>
);

export const PlaneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M10.5 13.5 4 15l-1-2 5-3-1.5-6 2-1 4 6 5.5-1.2a1.6 1.6 0 0 1 .7 3.1L14 12l-.5 6-2 1z" />
  </Base>
);

export const BoxOpenIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 8.5 12 11l8.5-2.5" />
    <path d="M12 11v9" />
    <path d="m3.5 8.5 2-4 6.5 2 6.5-2 2 4-8.5 2.5z" />
    <path d="M5.5 12v6.2L12 20l6.5-1.8V12" />
  </Base>
);

export const LockIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="4.5" y="10.5" width="15" height="9" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <circle cx="12" cy="15" r="1.2" />
  </Base>
);

export const ShieldIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.4-7 9-4.1-1.6-7-4.7-7-9V6z" />
    <path d="m9 12 2 2 4-4.2" />
  </Base>
);

export const ChatIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 6.5A2 2 0 0 1 6.5 4.5h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10l-4 3.2V15.5H6.5a2 2 0 0 1-2-2z" />
    <path d="M8.5 9h7M8.5 12h4" />
  </Base>
);

export const StarIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m12 4 2.3 4.7 5.2.8-3.8 3.6.9 5.1L12 15.9 7.4 18.3l.9-5.1L4.5 9.5l5.2-.8z" />
  </Base>
);

export const ScaleIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4v16M7 20h10" />
    <path d="M6 7h12M6 7 3.5 13a3 3 0 0 0 5 0zM18 7l-2.5 6a3 3 0 0 0 5 0z" />
    <path d="M9.5 5.5 12 4l2.5 1.5" />
  </Base>
);

export const CameraIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 8.5a2 2 0 0 1 2-2h1l1-1.5h5l1 1.5h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2z" />
    <circle cx="12" cy="12.5" r="3" />
  </Base>
);

export const KeyIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="3.5" />
    <path d="m10.5 10.5 7 7M15 15l2-2M17.5 17.5l1.8-1.8" />
  </Base>
);

export const CpuIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M9 6.5V4M15 6.5V4M9 20v-2.5M15 20v-2.5M6.5 9H4M6.5 15H4M20 9h-2.5M20 15h-2.5" />
  </Base>
);

export const RouteIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="6" r="2" />
    <path d="M8 18h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6" strokeDasharray="0.1 3.4" />
  </Base>
);

export const SparkIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4c.4 3.2 1.8 4.6 5 5-3.2.4-4.6 1.8-5 5-.4-3.2-1.8-4.6-5-5 3.2-.4 4.6-1.8 5-5z" />
  </Base>
);

export const ArrowIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />
  </Base>
);

export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 6v12M6 12h12" />
  </Base>
);

export const MinusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 12h12" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Base>
);

export const HeartIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 19s-6.5-4-8.2-8A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 8.2 4c-1.7 4-8.2 8-8.2 8z" />
  </Base>
);

export const WalletIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 7.5A2 2 0 0 1 6.5 5.5H17a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2z" />
    <path d="M4.5 9.5H17a2 2 0 0 1 2 2V14h-4a2 2 0 1 1 0-4" />
  </Base>
);

export const GlobeIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" />
  </Base>
);
