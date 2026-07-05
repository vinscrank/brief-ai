"use client";

import { motion } from "framer-motion";
import { Brain, Cpu, Sparkles, Zap } from "lucide-react";

interface AILoadingProps {
  message?: string;
  steps?: string[];
  currentStep?: number;
}

export function AILoading({
  message = "Processing with AI...",
  steps,
  currentStep = 0,
}: AILoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-2xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-12 w-12 text-white" />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ y: [0, -5, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 shadow-lg shadow-purple-500/50">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </motion.div>

        <motion.div
          className="absolute -bottom-1 -left-3"
          animate={{ y: [0, -5, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
        </motion.div>

        <motion.div
          className="absolute top-1/2 -right-4"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/80 shadow-lg">
            <Cpu className="h-3 w-3 text-white" />
          </div>
        </motion.div>
      </div>

      <div className="text-center space-y-2">
        <motion.p
          className="text-xl font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
        <p className="text-sm text-muted-foreground">
          This may take a few seconds
        </p>
      </div>

      {steps && steps.length > 0 && (
        <div className="w-full max-w-xs space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: i <= currentStep ? 1 : 0.3,
                x: 0,
              }}
              transition={{ delay: i * 0.15, duration: 0.3 }}
            >
              <div className="relative">
                <motion.div
                  className={`h-3 w-3 rounded-full ${
                    i < currentStep
                      ? "bg-green-500"
                      : i === currentStep
                      ? "bg-cyan-500"
                      : "bg-muted"
                  }`}
                  animate={
                    i === currentStep
                      ? {
                          scale: [1, 1.4, 1],
                          boxShadow: [
                            "0 0 0 0 rgba(6,182,212,0.4)",
                            "0 0 0 8px rgba(6,182,212,0)",
                            "0 0 0 0 rgba(6,182,212,0.4)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
              <span
                className={`text-sm ${
                  i <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
              {i < currentStep && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto text-green-500 text-xs"
                >
                  Done
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
            animate={{
              opacity: [0.3, 1, 0.3],
              scaleX: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
