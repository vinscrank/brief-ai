"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { BriefCard } from "@/components/brief-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brief, getBriefs } from "@/lib/api";
import { FloatingOrbs, GridPattern } from "@/components/ui/floating-elements";
import { FadeIn, ScaleIn } from "@/components/ui/scroll-animations";
import { GradientText, CountUp } from "@/components/ui/animated-text";
import { BentoCard } from "@/components/ui/feature-card";
import { ShimmerButton, MagneticButton } from "@/components/ui/animated-border";

export default function DashboardPage() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadBriefs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBriefs();
      setBriefs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load briefs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBriefs();
  }, []);

  const filteredBriefs = briefs.filter(
    (brief) =>
      brief.title.toLowerCase().includes(search.toLowerCase()) ||
      brief.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      brief.source_type.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: briefs.length,
    analysed: briefs.filter((b) => b.status === "Analysed" || b.status === "Proposal Drafted").length,
    proposals: briefs.filter((b) => b.status === "Proposal Drafted").length,
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 noise pointer-events-none" />
      <FloatingOrbs />
      <GridPattern />
      <Navbar />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-10">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <GradientText>Dashboard</GradientText>
                </h1>
                <p className="text-muted-foreground text-lg">
                  Manage and analyze your project briefs
                </p>
              </div>
              <MagneticButton>
                <Link href="/briefs/new">
                  <ShimmerButton>
                    <Plus className="h-4 w-4" />
                    New Brief
                  </ShimmerButton>
                </Link>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: FileText, label: "Total Briefs", value: stats.total, color: "cyan" },
            { icon: Target, label: "Analysed", value: stats.analysed, color: "purple" },
            { icon: Sparkles, label: "Proposals", value: stats.proposals, color: "green" },
          ].map((stat, i) => (
            <ScaleIn key={stat.label} delay={i * 0.1}>
              <BentoCard className="p-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`p-3 rounded-xl ${
                      stat.color === "cyan"
                        ? "bg-cyan-500/10 border border-cyan-500/20"
                        : stat.color === "purple"
                        ? "bg-purple-500/10 border border-purple-500/20"
                        : "bg-green-500/10 border border-green-500/20"
                    }`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <stat.icon
                      className={`h-6 w-6 ${
                        stat.color === "cyan"
                          ? "text-cyan-400"
                          : stat.color === "purple"
                          ? "text-purple-400"
                          : "text-green-400"
                      }`}
                    />
                  </motion.div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">
                      <CountUp end={stat.value} duration={1} />
                    </p>
                  </div>
                </div>
              </BentoCard>
            </ScaleIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-cyan-400 transition-colors" />
              <Input
                placeholder="Search briefs by title, client, or source..."
                className="pl-11 h-12 bg-card/50 backdrop-blur border-border/50 focus:border-cyan-500/50 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={loadBriefs}
              disabled={loading}
              className="h-12 w-12 border-border/50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </FadeIn>

        {loading && briefs.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="relative mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl opacity-50" />
              <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            </motion.div>
            <p className="text-muted-foreground text-lg">Loading briefs...</p>
          </motion.div>
        ) : error ? (
          <FadeIn>
            <BentoCard className="p-12 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 mb-6">
                <Brain className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-destructive text-lg mb-6">{error}</p>
              <Button variant="outline" onClick={loadBriefs}>
                Try Again
              </Button>
            </BentoCard>
          </FadeIn>
        ) : filteredBriefs.length === 0 ? (
          <FadeIn>
            <BentoCard className="p-16 text-center">
              <motion.div
                className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FileText className="h-10 w-10 text-muted-foreground" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">No briefs found</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                {search
                  ? "Try a different search term"
                  : "Create your first brief to get started with AI analysis"}
              </p>
              {!search && (
                <MagneticButton>
                  <Link href="/briefs/new">
                    <ShimmerButton>
                      <Plus className="h-4 w-4" />
                      Create Brief
                    </ShimmerButton>
                  </Link>
                </MagneticButton>
              )}
            </BentoCard>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBriefs.map((brief, index) => (
              <BriefCard key={brief.id} brief={brief} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
