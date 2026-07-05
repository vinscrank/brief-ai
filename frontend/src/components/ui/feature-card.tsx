"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export function FeatureCard({ icon: Icon, title, description, index = 0 }: FeatureCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-cyan-500/50 opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
      
      <div className="relative h-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 overflow-hidden">
        {isHovered && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: 200,
              height: 200,
              left: mousePosition.x - 100,
              top: mousePosition.y - 100,
              background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        <motion.div
          className="relative z-10 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Icon className="h-7 w-7 text-cyan-400" />
        </motion.div>

        <h3 className="relative z-10 mb-2 text-lg font-semibold">{title}</h3>
        <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
  return (
    <motion.div
      className={`relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden ${className}`}
      whileHover={hoverEffect ? { y: -5, scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  spotlight?: boolean;
}

export function BentoCard({ children, className, spotlight = true }: BentoCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      className={`relative group rounded-3xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      {spotlight && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(6,182,212,0.1) 0%, transparent 50%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
