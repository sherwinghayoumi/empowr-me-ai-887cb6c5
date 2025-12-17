import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Shield, ArrowRight, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import futuraLogo from "@/assets/futura-teams-logo.png";
import futuraStar from "@/assets/futura-star-icon.png";
const LoginSelect = () => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<"employee" | "admin" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePosition({
        x,
        y
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  const handleLogin = (type: "employee" | "admin") => {
    if (type === "employee") {
      navigate("/employee");
    } else {
      navigate("/admin");
    }
  };
  return <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden">

      {/* Enhanced animated background with FUTURA theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gold orb */}
        <div className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] animate-gradient-shift" style={{
        background: "radial-gradient(circle, hsl(45 75% 50% / 0.4), hsl(45 75% 50% / 0.1) 40%, transparent 70%)",
        top: "-10%",
        left: "-10%",
        transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
        transition: "transform 0.2s ease-out"
      }} />
        {/* Secondary blue orb */}
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] animate-gradient-shift-reverse" style={{
        background: "radial-gradient(circle, hsl(222 60% 30% / 0.6), transparent 70%)",
        bottom: "-5%",
        right: "-5%",
        transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)`,
        transition: "transform 0.2s ease-out"
      }} />
        {/* Center pulse orb */}
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[80px] animate-gradient-pulse" style={{
        background: "radial-gradient(circle, hsl(45 75% 55% / 0.3), transparent 70%)",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px)`,
        transition: "transform 0.2s ease-out"
      }} />
        {/* Additional floating orbs */}
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-15 blur-[60px]" style={{
        background: "radial-gradient(circle, hsl(45 75% 50% / 0.4), transparent 70%)",
        top: "60%",
        left: "20%",
        transform: `translate(${mousePosition.x * -1.2}px, ${mousePosition.y * 1.2}px)`,
        transition: "transform 0.25s ease-out",
        animation: "float 8s ease-in-out infinite"
      }} />
        <div className="absolute w-[250px] h-[250px] rounded-full opacity-10 blur-[50px]" style={{
        background: "radial-gradient(circle, hsl(222 60% 40% / 0.4), transparent 70%)",
        top: "20%",
        right: "25%",
        transform: `translate(${mousePosition.x * 1}px, ${mousePosition.y * -1}px)`,
        transition: "transform 0.25s ease-out",
        animation: "float 6s ease-in-out infinite reverse"
      }} />
        
        {/* Hexagon pattern overlay */}
        <div className="absolute inset-0 hex-pattern opacity-50" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
              linear-gradient(hsl(45 75% 50%) 1px, transparent 1px),
              linear-gradient(90deg, hsl(45 75% 50%) 1px, transparent 1px)
            `,
        backgroundSize: "60px 60px",
        transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
        transition: "transform 0.3s ease-out"
      }} />
        
        {/* Subtle radial gradient overlay */}
        <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, transparent 0%, hsl(222 47% 6% / 0.6) 70%)"
      }} />
      </div>

      {/* Logo */}
      <div className="mb-8 text-center animate-fade-in-up relative">
        <div className="flex items-center justify-center mb-4">
          <img alt="FUTURA TEAMS" src={futuraLogo} className="h-24 w-auto object-scale-down" />
        </div>
        <p className="text-muted-foreground text-base max-w-md italic">
          „Empower your teams for the future"
        </p>
      </div>

      {/* Login Cards */}
      <div className="grid md:grid-cols-2 gap-5 w-full max-w-3xl relative">
        {/* Employee Login */}
        <div className={`group relative p-6 rounded-2xl transition-all duration-500 animate-fade-in-up stagger-1 opacity-0 glass-card
            ${activePanel === "employee" ? "ring-2 ring-primary/50 shadow-2xl glow-gold" : ""}`}>
          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl glass-subtle flex items-center justify-center mb-5 group-hover:scale-105 transition-all duration-300 border border-primary/20">
              <Users className="w-7 h-7 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h2 className="text-xl font-semibold mb-1.5 text-foreground">Employee Login</h2>
            <p className="text-muted-foreground text-sm mb-5">
              View your skills, progress tracking, and learning paths.
            </p>
            
            {/* Login Form */}
            <div className="space-y-4 mb-5">
              <div className="space-y-1.5">
                <Label htmlFor="emp-email" className="text-xs font-medium text-foreground/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="emp-email" type="email" placeholder="employee@company.com" className="pl-10 h-10 bg-background/40 backdrop-blur-sm border-border/30 rounded-xl focus:bg-background/60 focus:border-primary/50 transition-all" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setActivePanel("employee")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emp-password" className="text-xs font-medium text-foreground/80">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="emp-password" type="password" placeholder="••••••••" className="pl-10 h-10 bg-background/40 backdrop-blur-sm border-border/30 rounded-xl focus:bg-background/60 focus:border-primary/50 transition-all" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setActivePanel("employee")} />
                </div>
              </div>
            </div>

            <Button onClick={() => handleLogin("employee")} className="w-full h-10 rounded-xl group/btn font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              <span>Sign in as Employee</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>

        {/* Admin Login */}
        <div className={`group relative p-6 rounded-2xl transition-all duration-500 animate-fade-in-up stagger-2 opacity-0 glass-card
            ${activePanel === "admin" ? "ring-2 ring-primary/50 shadow-2xl glow-gold" : ""}`}>
          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl glass-subtle flex items-center justify-center mb-5 group-hover:scale-105 transition-all duration-300 border border-primary/20">
              <Shield className="w-7 h-7 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h2 className="text-xl font-semibold mb-1.5 text-foreground">Admin Login</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Manage teams, analyze skill gaps, and generate reports.
            </p>
            
            {/* Login Form */}
            <div className="space-y-4 mb-5">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs font-medium text-foreground/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="admin-email" type="email" placeholder="hr-admin@company.com" className="pl-10 h-10 bg-background/40 backdrop-blur-sm border-border/30 rounded-xl focus:bg-background/60 focus:border-primary/50 transition-all" onFocus={() => setActivePanel("admin")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-password" className="text-xs font-medium text-foreground/80">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="admin-password" type="password" placeholder="••••••••" className="pl-10 h-10 bg-background/40 backdrop-blur-sm border-border/30 rounded-xl focus:bg-background/60 focus:border-primary/50 transition-all" onFocus={() => setActivePanel("admin")} />
                </div>
              </div>
            </div>

            <Button onClick={() => handleLogin("admin")} className="w-full h-10 rounded-xl group/btn font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              <span>Sign in as HR Admin</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center animate-fade-in stagger-3 opacity-0 relative">
        <p className="text-xs text-muted-foreground">
          FUTURA TEAMS • AI-Driven Team Intelligence Platform
        </p>
      </div>
    </div>;
};
export default LoginSelect;