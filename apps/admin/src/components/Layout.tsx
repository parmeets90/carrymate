import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Scale,
  Package,
  Users,
  AlertTriangle,
  Plane,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/kyc', label: 'KYC Review', icon: ShieldCheck },
  { to: '/disputes', label: 'Disputes', icon: Scale },
  { to: '/requests', label: 'Requests', icon: Package },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/risk', label: 'Risk & Fraud', icon: AlertTriangle },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold">CarryMate</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 text-xs text-muted-foreground">v0.1.0 · Phase 0</div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-card px-6">
          <h1 className="text-sm font-semibold text-muted-foreground">India → UAE corridor</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">admin@carrymate.in</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent" />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
