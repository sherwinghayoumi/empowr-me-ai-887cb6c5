import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  ClipboardList,
  ScrollText,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  Menu,
  X,
  Plus,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

import starLogo from '@/assets/star-logo.png';

const navItems = [
  { label: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { label: 'Organisationen', href: '/super-admin/organizations', icon: Building2 },
  { label: 'Quarterly Reports', href: '/super-admin/reports', icon: FileText },
  { label: 'Role Profiles', href: '/super-admin/role-profiles', icon: ClipboardList },
  { label: 'Users', href: '/super-admin/users', icon: Users },
  { label: 'Audit Log', href: '/super-admin/audit-log', icon: ScrollText },
  { label: 'Settings', href: '/super-admin/settings', icon: Settings },
];

const breadcrumbLabels: Record<string, string> = {
  'super-admin': 'Dashboard',
  'organizations': 'Organisationen',
  'reports': 'Quarterly Reports',
  'role-profiles': 'Role Profiles',
  'users': 'Users',
  'audit-log': 'Audit Log',
  'settings': 'Einstellungen',
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { profile, signOut } = useAuth();
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
    if (href === '/super-admin') {
      return location.pathname === '/super-admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo & Badge */}
      <div className="p-6 pb-4">
        <Link to="/super-admin" className="flex items-center gap-3 group" onClick={onNavigate}>
          <img 
            src={starLogo} 
            alt="FUTURA TEAMS" 
            className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">FUTURA TEAMS</span>
            <Badge variant="outline" className="mt-1 text-[10px] px-2 py-0 border-primary/50 text-primary">
              <Shield className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          </div>
        </Link>
      </div>

      <Separator className="mx-4 w-auto opacity-30" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/15 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn("w-4 h-4", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="mx-4 w-auto opacity-30" />

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'SA'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.full_name || 'Super Admin'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminLayout() {
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
      <aside className="hidden lg:flex lg:flex-col lg:w-[280px] lg:fixed lg:inset-y-0 bg-card/50 border-r border-border/50 backdrop-blur-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 bg-card/95 backdrop-blur-xl">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-[280px]">
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Left: Mobile Menu + Breadcrumb */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Breadcrumb */}
              <nav className="hidden sm:flex items-center gap-1 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
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
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Quick Action */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="hidden sm:flex">
                    <Plus className="w-4 h-4 mr-2" />
                    Neu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/super-admin/organizations">
                      <Building2 className="w-4 h-4 mr-2" />
                      Organisation
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/super-admin/reports">
                      <FileText className="w-4 h-4 mr-2" />
                      Quarterly Report
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/super-admin/role-profiles">
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Role Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      2
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Benachrichtigungen</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="font-medium">GDPR Anfrage</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Neue Löschanfrage von Müller & Partner
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="font-medium">Trial läuft ab</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Kanzlei Becker - Trial endet in 3 Tagen
                    </p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {profile?.full_name?.charAt(0) || 'SA'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{profile?.full_name || 'Super Admin'}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {profile?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/super-admin/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Einstellungen
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
