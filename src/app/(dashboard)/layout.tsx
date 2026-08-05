'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Sparkles, Package, CreditCard,
  History, Settings, Shield, FileVideo, ImageIcon,
  Video, ScrollText, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Orders', icon: History },
  { href: '/dashboard/generate', label: 'Generate', icon: Sparkles },
  { href: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const ADMIN_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/packages', label: 'Service Packages', icon: Package },
  { href: '/admin/orders', label: 'All Orders', icon: FileVideo },
  { href: '/admin/users', label: 'Users', icon: Shield },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mik_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  function handleSignOut() {
    localStorage.removeItem('mik_token');
    localStorage.removeItem('mik_user');
    window.location.href = '/sign-in';
  }

  const isAdmin = pathname.startsWith('/admin');

  const nav = isAdmin ? ADMIN_ITEMS : NAV_ITEMS;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar flex flex-col">
        {/* Logo */}
        <div className="h-16 border-b flex items-center px-5 gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">MIKAFAROZE</div>
            <div className="text-[10px] text-muted-foreground">
              {isAdmin ? 'Admin Panel' : 'Dashboard'}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/50" />}
              </Link>
            );
          })}
        </nav>

        {/* User button */}
        <div className="p-4 border-t">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <Link href="/sign-in">
              <div className="text-sm text-primary font-medium">Sign In</div>
            </Link>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
