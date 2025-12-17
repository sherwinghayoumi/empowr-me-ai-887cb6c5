import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, AlertTriangle, Calendar, Target, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const FutureSkillReportPage = () => {
  const tier1Skills = [
    { name: "Prompt Engineering for Legal GenAI", priority: "5/5", status: "NEW", description: "Gating skill for AI efficiency" },
    { name: "AI Output Validation & QA", priority: "5/5", status: "NEW", description: "69-88% hallucination risk mitigation" },
    { name: "AI Compliance & Regulatory Risk Management", priority: "5/5", status: "NEW", description: "EU AI Act Enforcement 2026" },
    { name: "Managing Technology in Deal Process", priority: "5/5", status: "3→5", description: "From optional to baseline" },
  ];

  const tier2Skills = [
    { name: "Understanding Client Business Case", priority: "5/5", status: "4→5", description: "For AI output interpretation" },
    { name: "ESG Due Diligence & Sustainability", priority: "4/5", status: "NEW", description: "CSDRD mandatory since 2024" },
    { name: "Cross-Border Regulatory Expertise", priority: "4/5", status: "NEW", description: "Multi-jurisdiction standard" },
    { name: "Advanced Deal Analytics & Valuation Models", priority: "4/5", status: "NEW", description: "AI-powered valuation literacy" },
  ];

  const skillChanges = [
    { type: "RISING", skills: "AI Output Assessment (4→5), Tech Deployment (3→5), Business Case (4→5)", trend: "↑" },
    { type: "STABLE", skills: "Negotiations (5→5), SPA Drafting (5→5), Client Relationships (5→5)", trend: "→" },
    { type: "DECLINING", skills: "Standards Development (3→2), Stakeholder Coordination (4→3), Coaching (5→4)", trend: "↓" },
    { type: "NEW", skills: "8 completely new skills (Prompt Engineering, AI-Compliance, ESG, Analytics)", trend: "NEW" },
  ];

  const roadmap = [
    { quarter: "Q1 2025", action: "Prompt Engineering Bootcamp, AI Output Validation SOP, EU AI Act Briefing", priority: "CRITICAL" },
    { quarter: "Q2 2025", action: "ESG Training, Valuation Workshop, AI-Compliance Governance", priority: "HIGH" },
    { quarter: "Q3 2025", action: "Cross-Border Regulatory Deep-Dives, Agentic AI Governance", priority: "MEDIUM" },
    { quarter: "Q4-Q1 2026", action: "Skills Assessment, Continuous Learning Program, Annual Review", priority: "ONGOING" },
  ];

  const trends = [
    {
      title: "Technology Adoption",
      points: [
        "Legal AI Market: 13.1% CAGR to 2035 (USD 2.1B → 7.4B)",
        "53% of Am Law 200 Firms already use Legal AI",
        "Contract Review: 85% time savings possible (92 min → 26 sec)",
      ],
      impact: "Prompt Engineering & Validation become baseline skills",
    },
    {
      title: "Regulatory Intensification",
      points: [
        "EU AI Act Enforcement 2026 (Penalties: EUR 35M or 7% revenue)",
        "ESG Regulation (CSDRD) mandatory since 2024",
        "GDPR 2025 with AI-specific rules",
      ],
      impact: "Compliance skills become deal standard",
    },
    {
      title: "Labor Market Shift",
      points: [
        "Top 3 Skills 2025: Commercial Awareness, Tech Proficiency, Regulatory Expertise",
        "AI Proficiency: +20-30% Salary Premium",
        "79% of Law Firms expect transformational AI impact",
      ],
      impact: "Tech literacy becomes career accelerator",
    },
    {
      title: "M&A Market Expansion",
      points: [
        "2024: +12% Deal Value, +20% in Large Deals",
        "Tech M&A: +16% ($640B) - AI/Cloud/Cyber Acquisitions",
        "Deal Complexity: ESG, AI, Multi-Regulatory, Remote Teams",
      ],
      impact: "Commercial + Tech + Regulatory Expertise mandatory",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />

      <main className="container py-8">
        {/* Back Button & Header */}
        <div className="mb-8">
          <Link to="/admin/reports">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-primary text-primary-foreground">Q1 2025 Main Report</Badge>
                <Badge variant="outline">Senior Associate</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Future Role-Skill-Matrix (fRST) for Senior Associate
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created: January 2025 • Timeframe: 12-18 months
              </p>
            </div>
          </div>
        </div>

        {/* Critical Insights */}
        <Card className="bg-card border-border border-l-4 border-l-primary mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Critical Insights - Top 8 Future Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tier 1 */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Badge variant="destructive">Tier 1</Badge>
                  Address IMMEDIATELY (Q1 2025)
                </h3>
                <div className="space-y-3">
                  {tier1Skills.map((skill, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[hsl(var(--skill-weak))]/10 border border-[hsl(var(--skill-weak))]/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">[{skill.priority}] {skill.name}</span>
                        <Badge variant="outline" className="text-xs">{skill.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tier 2 */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Badge className="bg-[hsl(var(--skill-moderate))]">Tier 2</Badge>
                  6-12 Months (Q2-Q3 2025)
                </h3>
                <div className="space-y-3">
                  {tier2Skills.map((skill, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[hsl(var(--skill-moderate))]/10 border border-[hsl(var(--skill-moderate))]/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">[{skill.priority}] {skill.name}</span>
                        <Badge variant="outline" className="text-xs">{skill.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Portfolio Rebalancing */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Skill Portfolio Rebalancing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillChanges.map((change, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-secondary/30">
                  <Badge 
                    variant="outline" 
                    className={`min-w-[80px] justify-center ${
                      change.type === "RISING" ? "border-[hsl(var(--skill-very-strong))] text-[hsl(var(--skill-very-strong))]" :
                      change.type === "DECLINING" ? "border-[hsl(var(--skill-weak))] text-[hsl(var(--skill-weak))]" :
                      change.type === "NEW" ? "border-primary text-primary" : ""
                    }`}
                  >
                    {change.trend} {change.type}
                  </Badge>
                  <span className="text-foreground">{change.skills}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Research Foundation */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">Research Foundation (4 Master Trends)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {trends.map((trend, i) => (
                <div key={i} className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <h4 className="font-semibold text-foreground mb-3">Trend {i + 1}: {trend.title}</h4>
                  <ul className="space-y-1 mb-3">
                    {trend.points.map((point, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm font-medium text-primary">
                    Impact: {trend.impact}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Implementation Roadmap */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Implementation Roadmap (Q1 2025 - Q1 2026)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roadmap.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
                  <Badge 
                    className={`min-w-[100px] justify-center ${
                      item.priority === "CRITICAL" ? "bg-[hsl(var(--skill-weak))]" :
                      item.priority === "HIGH" ? "bg-[hsl(var(--skill-moderate))]" :
                      item.priority === "MEDIUM" ? "bg-primary" : "bg-secondary text-foreground"
                    }`}
                  >
                    {item.quarter}
                  </Badge>
                  <span className="text-foreground flex-1">{item.action}</span>
                  <Badge variant="outline">{item.priority}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Warning */}
        <Card className="bg-card border-border border-l-4 border-l-[hsl(var(--skill-weak))]">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--skill-weak))]" />
              Critical Insight: Legacy Lawyer Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[hsl(var(--skill-weak))] mb-3">WITHOUT these skills in 12-18 months:</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-[hsl(var(--skill-weak))]">✗</span>
                    -40-50% productivity vs. AI-competent peers
                  </li>
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-[hsl(var(--skill-weak))]">✗</span>
                    Partner transition problematic
                  </li>
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-[hsl(var(--skill-weak))]">✗</span>
                    Compliance gaps in regulated deals
                  </li>
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-[hsl(var(--skill-weak))]">✗</span>
                    Clients switch to modern lawyers
                  </li>
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-[hsl(var(--skill-weak))]">✗</span>
                    Salary stagnation (vs. +20-30% AI premium for others)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[hsl(var(--skill-very-strong))] mb-3">WITH these skills:</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-[hsl(var(--skill-very-strong))]">✓</span>
                    +40-50% deal efficiency
                  </li>
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-[hsl(var(--skill-very-strong))]">✓</span>
                    +10-15% accuracy (AI-human collaboration)
                  </li>
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-[hsl(var(--skill-very-strong))]">✓</span>
                    100% AI Act/ESG/GDPR compliance
                  </li>
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-[hsl(var(--skill-very-strong))]">✓</span>
                    Multi-jurisdictional deal leadership
                  </li>
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-[hsl(var(--skill-very-strong))]">✓</span>
                    Partner track accelerated
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FutureSkillReportPage;
