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
      <div className="mx-auto flex h-14 min-w-0 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 sm:h-9 sm:w-9">
            <Brain className="h-4 w-4 text-white sm:h-5 sm:w-5" />
          </div>
          <span className="hidden truncate text-lg font-bold gradient-text sm:block sm:text-xl">
            BriefScope AI
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link href="/dashboard">
            <Button
              variant={isActive("/dashboard") ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-9 w-9 px-0 sm:w-auto sm:px-3",
                isActive("/dashboard") && "bg-secondary"
              )}
              aria-label="Dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <Link href="/briefs/new">
            <Button
              variant="glow"
              size="sm"
              className="h-9 w-9 px-0 sm:w-auto sm:px-3"
              aria-label="New Brief"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Brief</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
