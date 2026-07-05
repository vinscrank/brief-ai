"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  FileText,
  Loader2,
  Sparkles,
  Type,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FloatingOrbs, GridPattern } from "@/components/ui/floating-elements";
import { FadeIn, ScaleIn } from "@/components/ui/scroll-animations";
import { GradientText } from "@/components/ui/animated-text";
import { BentoCard } from "@/components/ui/feature-card";
import { ShimmerButton } from "@/components/ui/animated-border";
import { createBrief } from "@/lib/api";

const SOURCE_TYPES = [
  { value: "LinkedIn Job", icon: "LI", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "Upwork Job", icon: "UP", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "Client Email", icon: "EM", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "Tender / RFP", icon: "RFP", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { value: "Internal Project", icon: "INT", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { value: "Other", icon: "OTH", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
];

export default function NewBriefPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState(SOURCE_TYPES[0].value);
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      client_name: (formData.get("client_name") as string) || undefined,
      source_type: selectedSource,
      brief_text: formData.get("brief_text") as string,
    };

    try {
      const brief = await createBrief(data);
      router.push(`/briefs/${brief.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create brief");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 noise pointer-events-none" />
      <FloatingOrbs />
      <GridPattern />
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        <FadeIn>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="text-center mb-10">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm mb-4"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(6,182,212,0.2)",
                  "0 0 40px rgba(6,182,212,0.3)",
                  "0 0 20px rgba(6,182,212,0.2)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4" />
              New Brief
            </motion.div>
            <h1 className="text-4xl font-bold mb-3">
              <GradientText>Create New Brief</GradientText>
            </h1>
            <p className="text-muted-foreground text-lg">
              Paste a job posting, client email, or project request to analyze with AI
            </p>
          </div>
        </FadeIn>

        <ScaleIn delay={0.2}>
          <BentoCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="title" className="flex items-center gap-2 text-base">
                  <Type className="h-4 w-4 text-cyan-400" />
                  Title
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., E-commerce Dashboard Redesign"
                  required
                  disabled={loading}
                  className="h-12 bg-background/50 border-border/50 focus:border-cyan-500/50 transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="client_name" className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4 text-purple-400" />
                  Client Name
                  <span className="text-muted-foreground text-sm">(optional)</span>
                </Label>
                <Input
                  id="client_name"
                  name="client_name"
                  placeholder="e.g., Acme Corp"
                  disabled={loading}
                  className="h-12 bg-background/50 border-border/50 focus:border-cyan-500/50 transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-green-400" />
                  Source Type
                  <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SOURCE_TYPES.map((source) => (
                    <motion.button
                      key={source.value}
                      type="button"
                      onClick={() => setSelectedSource(source.value)}
                      disabled={loading}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        selectedSource === source.value
                          ? `${source.color} border-current`
                          : "bg-card/50 border-border/50 hover:border-border"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedSource === source.value && (
                        <motion.div
                          layoutId="selected-source"
                          className="absolute inset-0 rounded-xl border-2 border-current"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold mb-2 ${
                            selectedSource === source.value
                              ? source.color
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {source.icon}
                        </span>
                        <p className="text-sm font-medium">{source.value}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="brief_text" className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    Brief Text
                    <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {charCount} characters
                  </span>
                </div>
                <Textarea
                  id="brief_text"
                  name="brief_text"
                  placeholder="Paste the job description, client email, or project requirements here...

Include all relevant details:
- Project requirements and scope
- Timeline and deadlines
- Budget (if mentioned)
- Technical constraints
- Team size and roles needed"
                  className="min-h-[300px] bg-background/50 border-border/50 focus:border-cyan-500/50 transition-all resize-none"
                  required
                  disabled={loading}
                  onChange={(e) => setCharCount(e.target.value.length)}
                />
                <p className="text-xs text-muted-foreground">
                  The more details you provide, the better the AI analysis will be.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="h-12 px-6"
                >
                  Cancel
                </Button>
                <ShimmerButton
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating Brief...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Create Brief
                    </>
                  )}
                </ShimmerButton>
              </div>
            </form>
          </BentoCard>
        </ScaleIn>

        <FadeIn delay={0.3}>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              After creating, you can analyze the brief with AI and generate proposals.
            </p>
          </div>
        </FadeIn>
      </main>
    </div>
  );
}
