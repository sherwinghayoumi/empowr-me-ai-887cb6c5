import { Header } from "@/components/Header";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, AlertTriangle, Calendar, Star } from "lucide-react";
import { Link } from "react-router-dom";

const mainReport = {
  id: 1,
  title: "Future Role-Skill-Matrix (fRST) for Senior Associate",
  date: "2025-01-15",
  type: "Skill Analysis",
  priority: "high",
  isMain: true,
  description: "Comprehensive Future Role-Skill-Matrix for the next 12-18 months based on deep research analysis",
};

const reports = [
  { id: 2, title: "Legal Tech AI Integration - Q1 2025 Update", date: "2025-01-10", type: "Technology", priority: "medium" },
  { id: 3, title: "EU AI Act Compliance Requirements", date: "2025-01-08", type: "Compliance", priority: "high" },
  { id: 4, title: "ESG Due Diligence - New Standards 2025", date: "2025-01-05", type: "Regulation", priority: "medium" },
  { id: 5, title: "Team Performance Q4 2024", date: "2024-12-20", type: "Performance", priority: "low" },
  { id: 6, title: "Skill Gap Analysis - Corporate Advisory", date: "2024-12-15", type: "Skill Analysis", priority: "medium" },
];

const ReportsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      <main className="container py-8">
        <ScrollReveal>
          <h1 className="text-3xl font-bold text-foreground mb-8">Reports</h1>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <ScrollReveal delay={0}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group">
                  <FileText className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCounter value={reports.length} duration={1500} />
                  </p>
                  <p className="text-sm text-muted-foreground">Available Reports</p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
          
          <ScrollReveal delay={100}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[hsl(var(--skill-weak))]/20 flex items-center justify-center group">
                  <AlertTriangle className="w-6 h-6 text-[hsl(var(--skill-weak))] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCounter value={reports.filter(r => r.priority === "high").length} duration={1500} delay={100} />
                  </p>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[hsl(var(--skill-very-strong))]/20 flex items-center justify-center group">
                  <TrendingUp className="w-6 h-6 text-[hsl(var(--skill-very-strong))] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCounter value={3} duration={1500} delay={200} />
                  </p>
                  <p className="text-sm text-muted-foreground">New This Week</p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* Main Report - Highlighted */}
        <ScrollReveal delay={300}>
          <Link to="/admin/reports/future-skill-matrix">
            <GlassCard className="border-2 border-primary/50 mb-6 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer group">
              <GlassCardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Star className="w-7 h-7 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-primary text-primary-foreground">Q1 2025 Main Report</Badge>
                      <Badge variant="destructive">High</Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{mainReport.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{mainReport.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{mainReport.date}</span>
                      <span>•</span>
                      <span>{mainReport.type}</span>
                    </div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle className="text-foreground">Additional Reports</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="space-y-3">
              {reports.map((report, index) => (
                <ScrollReveal key={report.id} delay={index * 50}>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 backdrop-blur hover:bg-secondary/50 transition-all duration-200 cursor-pointer group">
                    <FileText className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">{report.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{report.date}</span>
                        <span>•</span>
                        <span>{report.type}</span>
                      </div>
                    </div>
                    <Badge variant={report.priority === "high" ? "destructive" : report.priority === "medium" ? "default" : "secondary"}>
                      {report.priority === "high" ? "High" : report.priority === "medium" ? "Medium" : "Low"}
                    </Badge>
                  </div>
                </ScrollReveal>
              ))}
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>
      </main>
    </div>
  );
};

export default ReportsPage;
