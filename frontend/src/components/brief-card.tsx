"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Calendar, FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Brief } from "@/lib/api";
import { cn, formatDate, getStatusColor, getRiskColor } from "@/lib/utils";

interface BriefCardProps {
  brief: Brief;
  index?: number;
}

export function BriefCard({ brief, index = 0 }: BriefCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/briefs/${brief.id}`}>
        <div className="group relative h-full">
          <motion.div
            className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-cyan-500/50 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500"
            animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
          />
          <motion.div
            className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-70 transition-all duration-500"
            style={{ backgroundSize: "200% 200%" }}
            animate={isHovered ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="relative h-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 overflow-hidden">
            {isHovered && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(6,182,212,0.1) 0%, transparent 50%)`,
                }}
              />
            )}

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold leading-tight group-hover:text-cyan-400 transition-colors line-clamp-1 text-lg">
                    {brief.title}
                  </h3>
                  {brief.client_name && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      {brief.client_name}
                    </div>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0", getStatusColor(brief.status))}
                >
                  {brief.status}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {brief.brief_text}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5">
                  <FileText className="h-3 w-3" />
                  {brief.source_type}
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5">
                  <Calendar className="h-3 w-3" />
                  {formatDate(brief.created_at)}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-3">
                  {brief.complexity && (
                    <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {brief.complexity}
                    </span>
                  )}
                  {brief.risk_level && (
                    <span className={cn("text-xs", getRiskColor(brief.risk_level))}>
                      Risk: {brief.risk_level}
                    </span>
                  )}
                </div>
                
                <motion.div
                  className="flex items-center gap-2"
                  animate={isHovered ? { x: 5 } : { x: 0 }}
                >
                  {brief.estimated_effort ? (
                    <span className="text-sm font-medium text-cyan-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {brief.estimated_effort}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Not analyzed
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                </motion.div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
