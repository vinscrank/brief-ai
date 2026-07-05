"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, LayoutDashboard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">BriefScope AI</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button
              variant={isActive("/dashboard") ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "gap-2",
                isActive("/dashboard") && "bg-secondary"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/briefs/new">
            <Button variant="glow" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Brief
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
