import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  Building2,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@/components/ui/sheet';

import starLogo from '@/assets/star-logo.png';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Anwälte', href: '/admin/employees', icon: Users },
  { label: 'Teams', href: '/admin/teams', icon: Building2 },
  { label: 'Skill Gaps', href: '/admin/skill-gaps', icon: AlertTriangle },
  { label: 'Maßnahmen & Lernpfade', href: '/admin/measures', icon: BookOpen },
  { label: 'Budget & ROI', href: '/admin/budget', icon: TrendingUp },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const breadcrumbLabels: Record<string, string> = {
  admin: 'Dashboard',
  employees: 'Anwälte',
  teams: 'Teams',
  'skill-gaps': 'Skill Gaps',
  measures: 'Maßnahmen & Lernpfade',
  budget: 'Budget & ROI',
  reports: 'Reports',
  settings: 'Einstellungen',
  'future-skill-matrix': 'Future Skill Matrix',
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { profile, organization, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Erfolgreich abgemeldet');
      navigate('/login');
    } catch {
      toast.error('Fehler beim Abmelden');
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-3 group" onClick={onNavigate}>
          <img
            src={starLogo}
            alt="FUTURA TEAMS"
            className="h-7 w-auto transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <div>
              <span className="text-sm font-bold tracking-wide text-primary">FUTURA</span>
              <span className="text-sm font-light tracking-wide text-sidebar-foreground ml-1">TEAMS</span>
            </div>
            {organization && (
              <span className="text-[10px] text-sidebar-foreground/40 uppercase tracking-wider truncate max-w-[140px]">
                {organization.name}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 px-3 py-2">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-primary font-medium border-l-2 border-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 hover:translate-x-0.5"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
              {profile?.full_name || 'Admin'}
            </p>
            <p className="text-[10px] text-sidebar-foreground/40 truncate">
              {profile?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-sidebar-foreground/40 hover:text-destructive shrink-0 h-7 w-7"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="text-[10px] text-sidebar-foreground/25 uppercase tracking-wider mt-2">
          v3.0 · FUTURA TEAMS
        </p>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Erfolgreich abgemeldet');
      navigate('/login');
    } catch {
      toast.error('Fehler beim Abmelden');
    }
  };

  // Build breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = breadcrumbLabels[segment] || segment;
    return { label, href };
  });

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 bg-[hsl(var(--sidebar-background))] border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0 bg-[hsl(var(--sidebar-background))]">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-[260px]">
        {/* Header — compact Bloomberg bar */}
        <header className="sticky top-0 z-40 h-11 border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between h-full px-4">
            {/* Left: Mobile Menu + Breadcrumb */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-7 w-7"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>

              <nav className="hidden sm:flex items-center gap-1 text-xs">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="w-3 h-3 mx-1 text-muted-foreground/50" />
                    )}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="font-medium text-foreground">{crumb.label}</span>
                    ) : (
                      <Link
                        to={crumb.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              <span className="hidden lg:block text-[10px] text-muted-foreground/40 uppercase tracking-widest ml-4">
                Futura Teams v3
              </span>
            </div>

            {/* Right: User */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-7 w-7">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                        {profile?.full_name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="py-1.5">
                    <div className="flex flex-col">
                      <span className="text-xs">{profile?.full_name || 'Admin'}</span>
                      <span className="text-[10px] font-normal text-muted-foreground">
                        {profile?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive text-xs"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
