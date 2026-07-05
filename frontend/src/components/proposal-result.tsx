"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  FileText,
  HelpCircle,
  MessageSquare,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/feature-card";
import { GradientText } from "@/components/ui/animated-text";
import { Proposal } from "@/lib/api";

interface ProposalResultProps {
  proposal: Proposal;
}

export function ProposalResult({ proposal }: ProposalResultProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sections = [
    {
      id: "short",
      title: "Short Proposal",
      subtitle: "Quick pitch for initial contact",
      icon: MessageSquare,
      content: proposal.short_proposal,
      color: "cyan",
    },
    {
      id: "technical",
      title: "Technical Proposal",
      subtitle: "Detailed technical approach",
      icon: FileText,
      content: proposal.technical_proposal,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4">
          <Sparkles className="h-4 w-4" />
          Proposal Generated Successfully
        </div>
      </motion.div>

      {sections.map((section, i) => {
        if (!section.content) return null;
        const Icon = section.icon;
        const isCopied = copiedSection === section.id;

        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <BentoCard
              className={`p-6 border ${
                section.color === "cyan"
                  ? "border-cyan-500/20"
                  : "border-purple-500/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      section.color === "cyan"
                        ? "bg-cyan-500/10"
                        : "bg-purple-500/10"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        section.color === "cyan"
                          ? "text-cyan-400"
                          : "text-purple-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {section.subtitle}
                    </p>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(section.content || "", section.id)}
                    className={`gap-2 transition-all ${
                      isCopied
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : ""
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-cyan-500 to-purple-500 opacity-50" />
                <p className="pl-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {section.content}
                </p>
              </div>
            </BentoCard>
          </motion.div>
        );
      })}

      {proposal.client_questions && proposal.client_questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BentoCard className="p-6 border border-yellow-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <HelpCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold">Questions for Client</h3>
                <p className="text-sm text-muted-foreground">
                  Ask these to clarify requirements
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {proposal.client_questions.map((question, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 text-xs font-medium">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{question}</span>
                </motion.li>
              ))}
            </ul>
          </BentoCard>
        </motion.div>
      )}

      {proposal.next_step && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <BentoCard className="relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(6,182,212,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(139,92,246,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(6,182,212,0.1) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Rocket className="h-6 w-6 text-cyan-400" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold">
                    <GradientText>Suggested Next Step</GradientText>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Recommended action to move forward
                  </p>
                </div>
              </div>
              <p className="text-foreground font-medium leading-relaxed">
                {proposal.next_step}
              </p>
            </div>
          </BentoCard>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center pt-4"
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() =>
            copyToClipboard(
              `${proposal.short_proposal}\n\n---\n\n${proposal.technical_proposal}`,
              "all"
            )
          }
          className="gap-2"
        >
          {copiedSection === "all" ? (
            <>
              <Check className="h-4 w-4 text-green-400" />
              All Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Full Proposal
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
