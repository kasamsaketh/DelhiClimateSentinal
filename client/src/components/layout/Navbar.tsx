import { Link, useLocation } from "wouter";
import { Activity, Map, BarChart3, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/map", label: "Map", icon: Map },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <nav className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover-elevate active-elevate-2 px-3 py-2 rounded-md -ml-3" data-testid="link-home">
          <Activity className="w-6 h-6 text-primary" data-testid="icon-logo" />
          <h1 className="text-xl font-light text-foreground">
            Project <span className="font-medium text-primary">Phoenix</span>
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                className="gap-2"
                data-testid={`button-nav-${item.label.toLowerCase()}`}
                asChild
              >
                <Link href={item.path}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
