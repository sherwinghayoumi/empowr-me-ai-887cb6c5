import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, LogOut, Users, TrendingUp, LayoutDashboard, FileText, Award, GraduationCap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


interface HeaderProps {
  variant: "admin" | "employee";
}

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Teams", href: "/admin/teams", icon: Users },
  { label: "Employees", href: "/admin/employees", icon: Users },
  { label: "Skill Gaps", href: "/admin/skill-gaps", icon: AlertTriangle },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];

const employeeNavItems = [
  { label: "My Dashboard", href: "/employee", icon: LayoutDashboard },
  { label: "My Skills", href: "/employee/skills", icon: Award },
  { label: "My Skill Gaps", href: "/employee/learning", icon: AlertTriangle },
];

export function Header({ variant }: HeaderProps) {
  const location = useLocation();
  const navItems = variant === "admin" ? adminNavItems : employeeNavItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 backdrop-blur-2xl bg-background/70">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold tracking-tight text-foreground font-montserrat transition-transform duration-300 group-hover:scale-105">
            Skill<span className="text-primary">Ship</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 group",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon 
                  className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    !isActive && "group-hover:scale-110 group-hover:rotate-6"
                  )} 
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground group">
              <LogOut className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
              Logout
            </Button>
          </Link>

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link to={item.href} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
