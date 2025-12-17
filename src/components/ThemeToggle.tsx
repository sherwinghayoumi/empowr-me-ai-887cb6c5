import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        className
      )}
    >
      <Sun
        className={cn(
          "h-5 w-5 absolute transition-all duration-500",
          theme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        )}
      />
      <Moon
        className={cn(
          "h-5 w-5 absolute transition-all duration-500",
          theme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
