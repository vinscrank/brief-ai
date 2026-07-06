"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Loader2,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { AnalysisResult } from "@/components/analysis-result";
import { ProposalResult } from "@/components/proposal-result";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingOrbs, GridPattern } from "@/components/ui/floating-elements";
import { FadeIn, ScaleIn } from "@/components/ui/scroll-animations";
import { GradientText } from "@/components/ui/animated-text";
import { BentoCard } from "@/components/ui/feature-card";
import { ShimmerButton } from "@/components/ui/animated-border";
import {
  Brief,
  Analysis,
  Proposal,
  getBrief,
  getAnalysis,
  getProposal,
  analyzeBrief,
  generateProposal,
} from "@/lib/api";
import { cn, formatDate, getStatusColor, getRiskColor } from "@/lib/utils";

const ANALYZE_STEPS = [
  { label: "Reading brief content", icon: FileText },
  { label: "Extracting requirements", icon: Target },
  { label: "Identifying skills needed", icon: Zap },
  { label: "Detecting risks", icon: Brain },
  { label: "Estimating effort", icon: Clock },
  { label: "Generating insights", icon: Sparkles },
];

const PROPOSAL_STEPS = [
  { label: "Analyzing project scope", icon: Target },
  { label: "Crafting short proposal", icon: FileText },
  { label: "Writing technical approach", icon: Brain },
  { label: "Preparing questions", icon: Zap },
  { label: "Finalizing proposal", icon: Sparkles },
];

function AIProcessing({
  message,
  steps,
  currentStep,
}: {
  message: string;
  steps: { label: string; icon: React.ElementType }[];
  currentStep: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative py-16"
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8">
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-2xl"
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <motion.div
            className="relative h-28 w-28 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 p-[2px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="h-12 w-12 text-cyan-400" />
              </motion.div>
            </div>
          </motion.div>

          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-cyan-400"
              style={{
                top: "50%",
                left: "50%",
              }}
              animate={{
                x: [0, Math.cos((i * Math.PI) / 2) * 60],
                y: [0, Math.sin((i * Math.PI) / 2) * 60],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <motion.h3
          className="text-2xl font-bold mb-2 text-center"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <GradientText>{message}</GradientText>
        </motion.h3>
        <p className="text-muted-foreground mb-10">This may take 10-30 seconds</p>

        <div className="w-full max-w-md space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isComplete = i < currentStep;
            const isActive = i === currentStep;
            const isPending = i > currentStep;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                  isComplete && "bg-green-500/10 border-green-500/30",
                  isActive && "bg-cyan-500/10 border-cyan-500/30 shadow-lg shadow-cyan-500/10",
                  isPending && "bg-card/30 border-border/30 opacity-50"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center transition-all",
                    isComplete && "bg-green-500/20",
                    isActive && "bg-cyan-500/20",
                    isPending && "bg-muted/50"
                  )}
                >
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Icon className="h-5 w-5 text-cyan-400" />
                    </motion.div>
                  ) : (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <span
                  className={cn(
                    "flex-1 font-medium",
                    isComplete && "text-green-400",
                    isActive && "text-cyan-400",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>

                {isComplete && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-green-400 font-medium"
                  >
                    Done
                  </motion.span>
                )}

                {isActive && (
                  <motion.div
                    className="flex gap-1"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {[0, 1, 2].map((j) => (
                      <motion.div
                        key={j}
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: j * 0.2 }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-10 flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.div
              key={i}
              className="h-1 w-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
              animate={{
                opacity: [0.2, 1, 0.2],
                scaleX: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function BriefDetailPage() {
  const params = useParams();
  const router = useRouter();
  const briefId = params.id as string;

  const [brief, setBrief] = useState<Brief | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [proposalStep, setProposalStep] = useState(0);
  const [activeTab, setActiveTab] = useState("brief");
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const briefData = await getBrief(briefId);
      setBrief(briefData);

      try {
        const analysisData = await getAnalysis(briefId);
        setAnalysis(analysisData);
      } catch {
        setAnalysis(null);
      }

      try {
        const proposalData = await getProposal(briefId);
        setProposal(proposalData);
      } catch {
        setProposal(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load brief");
    } finally {
      setLoading(false);
    }
  }, [briefId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeStep(0);
    setError(null);
    setActiveTab("analysis");

    const interval = setInterval(() => {
      setAnalyzeStep((prev) => Math.min(prev + 1, ANALYZE_STEPS.length - 1));
    }, 2500);

    try {
      const data = await analyzeBrief(briefId);
      setAnalysis(data);
      const briefData = await getBrief(briefId);
      setBrief(briefData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setActiveTab("brief");
    } finally {
      clearInterval(interval);
      setAnalyzing(false);
    }
  };

  const handleGenerateProposal = async () => {
    setGenerating(true);
    setProposalStep(0);
    setError(null);
    setActiveTab("proposal");

    const interval = setInterval(() => {
      setProposalStep((prev) => Math.min(prev + 1, PROPOSAL_STEPS.length - 1));
    }, 3000);

    try {
      const data = await generateProposal(briefId);
      setProposal(data);
      const briefData = await getBrief(briefId);
      setBrief(briefData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proposal generation failed");
      setActiveTab("analysis");
    } finally {
      clearInterval(interval);
      setGenerating(false);
    }
  };

  const copyBriefText = async () => {
    if (brief) {
      await navigator.clipboard.writeText(brief.brief_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl opacity-50" />
            <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error && !brief) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <FadeIn>
            <BentoCard className="max-w-md mx-auto p-12 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 mb-6">
                <Brain className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </BentoCard>
          </FadeIn>
        </div>
      </div>
    );
  }

  if (!brief) return null;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 noise pointer-events-none" />
      <FloatingOrbs />
      <GridPattern />
      <Navbar />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <FadeIn>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Button>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-6 rounded-2xl border border-white/10 bg-card/30 p-4 backdrop-blur-sm sm:mb-8 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-4">
                <div className="space-y-3">
                  <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                    <GradientText>{brief.title}</GradientText>
                  </h1>
                  <Badge
                    variant="outline"
                    className={cn("w-fit text-xs sm:text-sm", getStatusColor(brief.status))}
                  >
                    {brief.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                  {brief.client_name && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-muted-foreground sm:rounded-full sm:px-3 sm:text-sm">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{brief.client_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-muted-foreground sm:rounded-full sm:px-3 sm:text-sm">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{brief.source_type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-muted-foreground sm:rounded-full sm:px-3 sm:text-sm">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{formatDate(brief.created_at)}</span>
                  </div>
                  {brief.risk_level && (
                    <div
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs sm:rounded-full sm:px-3 sm:text-sm",
                        getRiskColor(brief.risk_level)
                      )}
                    >
                      <Target className="h-3.5 w-3.5 shrink-0" />
                      <span>Risk: {brief.risk_level}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 lg:pt-1">
                {!analysis && !analyzing && (
                  <ShimmerButton onClick={handleAnalyze} className="w-full gap-2 sm:w-auto">
                    <Brain className="h-4 w-4" />
                    Analyze with AI
                  </ShimmerButton>
                )}
                {analysis && !proposal && !generating && (
                  <ShimmerButton onClick={handleGenerateProposal} className="w-full gap-2 sm:w-auto">
                    <Sparkles className="h-4 w-4" />
                    Generate Proposal
                  </ShimmerButton>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <ScaleIn delay={0.2}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/50 backdrop-blur border border-border/50 p-1">
              <TabsTrigger value="brief" className="data-[state=active]:bg-background">
                <FileText className="h-4 w-4 mr-2" />
                Brief
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                disabled={!analysis && !analyzing}
                className="data-[state=active]:bg-background"
              >
                <Brain className="h-4 w-4 mr-2" />
                Analysis
                {analysis && <CheckCircle2 className="h-3 w-3 ml-2 text-green-400" />}
              </TabsTrigger>
              <TabsTrigger
                value="proposal"
                disabled={!proposal && !generating}
                className="data-[state=active]:bg-background"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Proposal
                {proposal && <CheckCircle2 className="h-3 w-3 ml-2 text-green-400" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="brief">
              <BentoCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Brief Content</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyBriefText}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    {brief.brief_text}
                  </p>
                </div>
              </BentoCard>
            </TabsContent>

            <TabsContent value="analysis">
              {analyzing ? (
                <BentoCard>
                  <AIProcessing
                    message="Analyzing your brief with AI..."
                    steps={ANALYZE_STEPS}
                    currentStep={analyzeStep}
                  />
                </BentoCard>
              ) : analysis ? (
                <AnalysisResult analysis={analysis} />
              ) : null}
            </TabsContent>

            <TabsContent value="proposal">
              {generating ? (
                <BentoCard>
                  <AIProcessing
                    message="Generating your proposal..."
                    steps={PROPOSAL_STEPS}
                    currentStep={proposalStep}
                  />
                </BentoCard>
              ) : proposal ? (
                <ProposalResult proposal={proposal} />
              ) : null}
            </TabsContent>
          </Tabs>
        </ScaleIn>
      </main>
    </div>
  );
}
