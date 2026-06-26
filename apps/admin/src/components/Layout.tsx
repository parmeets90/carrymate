import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  ShieldCheck,
  Scale,
  Package,
  Users,
  AlertTriangle,
  Plane,
  Wallet,
  Banknote,
  ScanLine,
  Quote,
  UsersRound,
  HelpCircle,
  Palette,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import type { ReactNode } from 'react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/queue', label: 'Work Queue', icon: Inbox },
  { to: '/kyc', label: 'KYC Review', icon: ShieldCheck },
  { to: '/disputes', label: 'Disputes', icon: Scale },
  { to: '/requests', label: 'Requests', icon: Package },
  { to: '/transactions', label: 'Transactions', icon: Wallet },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/risk', label: 'Risk & Fraud', icon: AlertTriangle },
  { to: '/flights', label: 'Flight Verify', icon: Plane },
  { to: '/payouts', label: 'Failed Payouts', icon: Banknote },
  { to: '/scan-rules', label: 'Smart Scan Rules', icon: ScanLine },
];

// Marketing-site CMS — content the public website pulls live.
const WEBSITE_NAV = [
  { to: '/site/testimonials', label: 'Testimonials', icon: Quote },
  { to: '/site/founders', label: 'Founders', icon: UsersRound },
  { to: '/site/faq', label: 'FAQ', icon: HelpCircle },
  { to: '/site/branding', label: 'Branding & Contact', icon: Palette },
];

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-white/10 text-white' : 'text-sidebar-foreground hover:bg-white/5 hover:text-white',
  );

export function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
            <img src="/logo-mark.png" alt="CarryMate" className="h-7 w-7" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">CarryMate</p>
            <p className="text-xs text-sidebar-muted">Operations</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navItemClass}>
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-4 w-4', isActive ? 'text-sidebar-accent' : 'text-sidebar-muted')} />
                  {label}
                </>
              )}
            </NavLink>
          ))}

          <p className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted">
            Website
          </p>
          {WEBSITE_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navItemClass}>
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-4 w-4', isActive ? 'text-sidebar-accent' : 'text-sidebar-muted')} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 text-xs text-sidebar-muted">v0.1.0 · India → UAE corridor</div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-card px-6">
          <h1 className="text-sm font-semibold text-muted-foreground">India → UAE corridor</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user?.fullName ?? user?.phone ?? 'admin'}
            </span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent" />
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
