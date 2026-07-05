"use client";

import { motion } from "framer-motion";

interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: string;
}

export function AnimatedBorder({ children, className, borderRadius = "1rem" }: AnimatedBorderProps) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute -inset-[1px] overflow-hidden"
        style={{ borderRadius }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: "conic-gradient(from 0deg, #06b6d4, #8b5cf6, #06b6d4)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div
        className="relative bg-card"
        style={{ borderRadius }}
      >
        {children}
      </div>
    </div>
  );
}

interface PulsingBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function PulsingBorder({ children, className }: PulsingBorderProps) {
  return (
    <div className={`relative group ${className}`}>
      <motion.div
        className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-75"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />
      <motion.div
        className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 blur-lg opacity-50"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />
      <div className="relative bg-card rounded-2xl">{children}</div>
    </div>
  );
}

interface ShimmerButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function ShimmerButton({ children, className, onClick, type = "button", disabled }: ShimmerButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-lg px-6 py-3 font-medium text-white transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 ${className}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500" />
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function MagneticButton({ children, className }: MagneticButtonProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    e.currentTarget.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "translate(0, 0)";
  };

  return (
    <div
      className={`transition-transform duration-200 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
