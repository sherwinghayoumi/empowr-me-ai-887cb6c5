import { Header } from "@/components/Header";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building2, 
  Users, 
  Shield, 
  Activity, 
  Settings, 
  Database,
  FileText,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";

const SuperAdminDashboard = () => {
  const { profile } = useAuth();

  const stats = [
    { 
      label: "Organisationen", 
      value: "12", 
      icon: Building2, 
      change: "+2 diesen Monat",
      link: "/super-admin/organizations"
    },
    { 
      label: "Aktive Benutzer", 
      value: "847", 
      icon: Users, 
      change: "+34 diese Woche",
      link: "/super-admin/users"
    },
    { 
      label: "Mitarbeiter Gesamt", 
      value: "2,341", 
      icon: Activity, 
      change: "+156 diesen Monat",
      link: "/super-admin/employees"
    },
    { 
      label: "Aktive Abos", 
      value: "9", 
      icon: TrendingUp, 
      change: "3 Trial",
      link: "/super-admin/subscriptions"
    },
  ];

  const quickActions = [
    { 
      label: "Organisationen verwalten", 
      description: "Neue Kunden anlegen und verwalten",
      icon: Building2, 
      link: "/super-admin/organizations" 
    },
    { 
      label: "Benutzer & Rollen", 
      description: "Admins und Mitarbeiter verwalten",
      icon: Shield, 
      link: "/super-admin/users" 
    },
    { 
      label: "System-Einstellungen", 
      description: "Globale Konfiguration",
      icon: Settings, 
      link: "/super-admin/settings" 
    },
    { 
      label: "Datenbank", 
      description: "Backups und Wartung",
      icon: Database, 
      link: "/super-admin/database" 
    },
    { 
      label: "Audit Log", 
      description: "Alle Systemaktivitäten",
      icon: FileText, 
      link: "/super-admin/audit-log" 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Willkommen zurück, {profile?.full_name || 'Super Admin'}. Hier ist der aktuelle Systemstatus.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} to={stat.link}>
              <GlassCard className="hover-lift cursor-pointer">
                <GlassCardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-primary mt-1">{stat.change}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl glass-subtle flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Schnellzugriff</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.link}>
                  <div className="p-4 rounded-xl glass-subtle hover:bg-secondary/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <action.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{action.label}</p>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
