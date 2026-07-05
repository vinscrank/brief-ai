"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  FileSearch,
  Lightbulb,
  MousePointer2,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingOrbs, GridPattern, FloatingIcon } from "@/components/ui/floating-elements";
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem, BlurIn, Parallax } from "@/components/ui/scroll-animations";
import { Typewriter, GradientText, CountUp, TextReveal } from "@/components/ui/animated-text";
import { FeatureCard, BentoCard } from "@/components/ui/feature-card";
import { ShimmerButton, AnimatedBorder, MagneticButton } from "@/components/ui/animated-border";
import { AIBackground } from "@/components/ai-background";

const features = [
  {
    icon: FileSearch,
    title: "Brief Analysis",
    description: "Extract scope, required skills, and technical requirements from any job posting or client request.",
  },
  {
    icon: Target,
    title: "Risk Detection",
    description: "Identify missing information, unclear requirements, and potential project risks automatically.",
  },
  {
    icon: Lightbulb,
    title: "Smart Questions",
    description: "Get AI-generated questions to clarify requirements before starting the project.",
  },
  {
    icon: Zap,
    title: "Effort Estimation",
    description: "Receive data-driven estimates for project complexity, timeline, and daily rates.",
  },
  {
    icon: Sparkles,
    title: "Proposal Generator",
    description: "Generate professional proposals tailored to each brief with one click.",
  },
  {
    icon: Brain,
    title: "AI-Powered",
    description: "Powered by advanced LLMs to understand context and provide accurate analysis.",
  },
];

const stats = [
  { value: 95, suffix: "%", label: "Accuracy" },
  { value: 10, suffix: "x", label: "Faster" },
  { value: 500, suffix: "+", label: "Briefs Analyzed" },
];

const steps = [
  { num: "01", title: "Paste Brief", desc: "Copy any job post, email, or RFP" },
  { num: "02", title: "AI Analysis", desc: "Extract scope, risks, skills needed" },
  { num: "03", title: "Get Proposal", desc: "Ready-to-send professional proposal" },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="fixed inset-0 noise pointer-events-none" />
      <AIBackground />
      <FloatingOrbs />
      <GridPattern />

      <div className="relative z-10">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <motion.div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/25"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Brain className="h-6 w-6 text-white" />
                </motion.div>
                <span className="text-xl font-bold">
                  <GradientText>BriefScope AI</GradientText>
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="hidden sm:flex">Dashboard</Button>
                </Link>
                <MagneticButton>
                  <Link href="/briefs/new">
                    <ShimmerButton>
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </ShimmerButton>
                  </Link>
                </MagneticButton>
              </div>
            </nav>
          </div>
        </header>

        <main>
          <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
            <motion.div
              className="container mx-auto px-4 py-20"
              style={{ opacity: heroOpacity, scale: heroScale }}
            >
              <div className="mx-auto max-w-5xl text-center">
                <BlurIn delay={0.1}>
                  <motion.div
                    className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm text-cyan-400"
                    animate={{ boxShadow: ["0 0 20px rgba(6,182,212,0.2)", "0 0 40px rgba(6,182,212,0.4)", "0 0 20px rgba(6,182,212,0.2)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="h-4 w-4" />
                    AI-Powered Brief Analysis
                  </motion.div>
                </BlurIn>

                <h1 className="mb-8 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                  <FadeIn delay={0.2}>
                    <span className="block">Analyze Briefs.</span>
                  </FadeIn>
                  <FadeIn delay={0.4}>
                    <span className="block mt-2">
                      <GradientText animate>Generate Proposals.</GradientText>
                    </span>
                  </FadeIn>
                </h1>

                <FadeIn delay={0.6}>
                  <p className="mb-12 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    <Typewriter
                      text="Transform job postings and client emails into structured analysis with AI. Extract scope, identify risks, and generate winning proposals in seconds."
                      speed={20}
                      delay={800}
                    />
                  </p>
                </FadeIn>

                <FadeIn delay={0.8}>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <MagneticButton>
                      <Link href="/briefs/new">
                        <AnimatedBorder borderRadius="0.75rem">
                          <button className="flex items-center gap-2 px-8 py-4 text-lg font-medium">
                            <Brain className="h-5 w-5 text-cyan-400" />
                            Start Analyzing
                            <ArrowRight className="h-5 w-5" />
                          </button>
                        </AnimatedBorder>
                      </Link>
                    </MagneticButton>
                    <Link href="/dashboard">
                      <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                        View Dashboard
                      </Button>
                    </Link>
                  </div>
                </FadeIn>

                <FadeIn delay={1}>
                  <motion.div
                    className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MousePointer2 className="h-4 w-4" />
                    Scroll to explore
                  </motion.div>
                </FadeIn>
              </div>
            </motion.div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
          </section>

          <section className="relative py-32">
            <div className="container mx-auto px-4">
              <FadeIn>
                <div className="text-center mb-20">
                  <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                    <TextReveal>How It Works</TextReveal>
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Three simple steps to transform any brief into actionable insights
                  </p>
                </div>
              </FadeIn>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {steps.map((step, i) => (
                  <ScaleIn key={step.num} delay={i * 0.15}>
                    <BentoCard className="p-8 text-center h-full">
                      <motion.div
                        className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        <span className="text-2xl font-bold text-cyan-400">{step.num}</span>
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground">{step.desc}</p>
                      {i < steps.length - 1 && (
                        <motion.div
                          className="hidden md:block absolute top-1/2 -right-4 w-8"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="h-5 w-5 text-cyan-500/50" />
                        </motion.div>
                      )}
                    </BentoCard>
                  </ScaleIn>
                ))}
              </div>
            </div>
          </section>

          <section className="relative py-32">
            <div className="container mx-auto px-4">
              <FadeIn>
                <div className="text-center mb-20">
                  <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                    Everything You Need to{" "}
                    <GradientText>Win Projects</GradientText>
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    From initial analysis to final proposal, BriefScope AI handles
                    the heavy lifting so you can focus on what matters.
                  </p>
                </div>
              </FadeIn>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                  <StaggerItem key={feature.title}>
                    <FeatureCard
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      index={index}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </section>

          <section className="relative py-32">
            <div className="container mx-auto px-4">
              <Parallax speed={-0.2}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {stats.map((stat, i) => (
                    <ScaleIn key={stat.label} delay={i * 0.1}>
                      <BentoCard className="p-8 text-center">
                        <div className="text-5xl sm:text-6xl font-bold mb-2 text-glow">
                          <GradientText>
                            <CountUp end={stat.value} suffix={stat.suffix} />
                          </GradientText>
                        </div>
                        <p className="text-muted-foreground text-lg">{stat.label}</p>
                      </BentoCard>
                    </ScaleIn>
                  ))}
                </div>
              </Parallax>
            </div>
          </section>

          <section className="relative py-32">
            <div className="container mx-auto px-4">
              <FadeIn>
                <BentoCard className="relative overflow-hidden p-12 md:p-20 text-center max-w-5xl mx-auto">
                  <FloatingIcon delay={0} className="absolute top-10 left-10 opacity-20">
                    <Brain className="h-12 w-12 text-cyan-400" />
                  </FloatingIcon>
                  <FloatingIcon delay={1} className="absolute top-20 right-16 opacity-20">
                    <Sparkles className="h-8 w-8 text-purple-400" />
                  </FloatingIcon>
                  <FloatingIcon delay={2} className="absolute bottom-16 left-20 opacity-20">
                    <Zap className="h-10 w-10 text-cyan-400" />
                  </FloatingIcon>

                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  <div className="relative z-10">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                      Ready to Transform Your Workflow?
                    </h2>
                    <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
                      Stop spending hours analyzing briefs manually. Let AI do the
                      work while you focus on winning clients.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <MagneticButton>
                        <Link href="/briefs/new">
                          <ShimmerButton className="text-lg px-8 py-4">
                            <Brain className="h-5 w-5" />
                            Create Your First Brief
                          </ShimmerButton>
                        </Link>
                      </MagneticButton>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        No credit card required
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        Free to start
                      </div>
                    </div>
                  </div>
                </BentoCard>
              </FadeIn>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/5 bg-background/50 backdrop-blur">
          <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-cyan-400" />
                <span className="font-semibold">BriefScope AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Built with Next.js, FastAPI, and OpenAI
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
