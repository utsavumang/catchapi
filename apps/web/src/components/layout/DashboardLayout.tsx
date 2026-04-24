import { Outlet } from 'react-router-dom';
import { Webhook, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavItem } from '@/components/layout/NavItem';
import { UserAvatar } from '@/components/layout/UserAvatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/lib/constants';

export const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ─── Logo ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
          <Webhook className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-foreground font-bold text-lg tracking-tight">
          CatchAPI
        </span>
      </div>

      <Separator />

      {/* ─── Navigation ──────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Workspace
        </p>
        <NavItem
          to={ROUTES.DASHBOARD}
          icon={<Webhook className="w-4 h-4" />}
          label="Endpoints"
        />
      </nav>

      <Separator />

      {/* ─── User Section ────────────────────────────────────────────── */}
      <div className="px-3 py-4 space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <UserAvatar name={user.name} className="w-8 h-8" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}
        {/* Todo - Wire Logout */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          disabled
        >
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* ─── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex w-60 flex-col bg-card border-r border-border shrink-0">
        {sidebarContent}
      </aside>

      {/* ─── Mobile Sidebar Overlay ───────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar panel */}
          <aside className="absolute left-0 top-0 h-full w-60 bg-card border-r border-border z-50">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          <span className="font-bold text-foreground">CatchAPI</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
