"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Code2,
  DollarSign,
  HelpCircle,
  Lightbulb,
  ListChecks,
  Target,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BentoCard } from "@/components/ui/feature-card";
import { GradientText } from "@/components/ui/animated-text";
import { Analysis } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AnalysisResultProps {
  analysis: Analysis;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const sections = [
    {
      title: "Summary",
      icon: Target,
      content: analysis.summary,
      type: "text",
      color: "cyan",
    },
    {
      title: "Required Skills",
      icon: Code2,
      content: analysis.required_skills,
      type: "tags",
      color: "cyan",
    },
    {
      title: "Nice to Have",
      icon: Lightbulb,
      content: analysis.nice_to_have_skills,
      type: "tags",
      color: "purple",
    },
    {
      title: "Technical Scope",
      icon: ListChecks,
      content: analysis.technical_scope,
      type: "text",
      color: "blue",
    },
    {
      title: "Deliverables",
      icon: CheckCircle2,
      content: analysis.deliverables,
      type: "list",
      color: "green",
    },
    {
      title: "Missing Information",
      icon: HelpCircle,
      content: analysis.missing_information,
      type: "list",
      color: "yellow",
    },
    {
      title: "Risks",
      icon: AlertTriangle,
      content: analysis.risks,
      type: "list",
      color: "red",
    },
    {
      title: "Questions to Ask",
      icon: HelpCircle,
      content: analysis.questions,
      type: "list",
      color: "orange",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      cyan: {
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        text: "text-cyan-400",
        icon: "text-cyan-400",
      },
      purple: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        text: "text-purple-400",
        icon: "text-purple-400",
      },
      green: {
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        text: "text-green-400",
        icon: "text-green-400",
      },
      yellow: {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        text: "text-yellow-400",
        icon: "text-yellow-400",
      },
      red: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-400",
        icon: "text-red-400",
      },
      blue: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
        icon: "text-blue-400",
      },
      orange: {
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        text: "text-orange-400",
        icon: "text-orange-400",
      },
    };
    return colors[color] || colors.cyan;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: TrendingUp,
            label: "Complexity",
            value: analysis.complexity || "N/A",
            color: "cyan",
          },
          {
            icon: Clock,
            label: "Estimated Effort",
            value: analysis.estimated_effort || "N/A",
            color: "purple",
          },
          {
            icon: DollarSign,
            label: "Suggested Rate",
            value: analysis.suggested_daily_rate || "N/A",
            color: "green",
          },
        ].map((stat, i) => {
          const colors = getColorClasses(stat.color);
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <BentoCard className={cn("p-6 border", colors.border)}>
                <div className="flex items-center gap-4">
                  <motion.div
                    className={cn("p-3 rounded-xl", colors.bg)}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <stat.icon className={cn("h-6 w-6", colors.icon)} />
                  </motion.div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">
                      <GradientText>{stat.value}</GradientText>
                    </p>
                  </div>
                </div>
              </BentoCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map((section, index) => {
          const Icon = section.icon;
          const colors = getColorClasses(section.color);
          const hasContent =
            section.type === "text"
              ? section.content
              : Array.isArray(section.content) && section.content.length > 0;

          if (!hasContent) return null;

          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <BentoCard className="h-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("p-2 rounded-lg", colors.bg)}>
                    <Icon className={cn("h-5 w-5", colors.icon)} />
                  </div>
                  <h3 className="font-semibold">{section.title}</h3>
                  {section.type === "list" && Array.isArray(section.content) && (
                    <Badge variant="outline" className={cn("ml-auto", colors.border, colors.text)}>
                      {section.content.length}
                    </Badge>
                  )}
                </div>

                {section.type === "text" && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {section.content as string}
                  </p>
                )}

                {section.type === "tags" && (
                  <div className="flex flex-wrap gap-2">
                    {(section.content as string[]).map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-3 py-1",
                            colors.border,
                            colors.bg,
                            colors.text
                          )}
                        >
                          {item}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}

                {section.type === "list" && (
                  <ul className="space-y-2">
                    {(section.content as string[]).map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="text-sm flex items-start gap-3 text-muted-foreground"
                      >
                        <span
                          className={cn(
                            "mt-2 h-1.5 w-1.5 rounded-full shrink-0",
                            section.color === "green" && "bg-green-400",
                            section.color === "yellow" && "bg-yellow-400",
                            section.color === "red" && "bg-red-400",
                            section.color === "orange" && "bg-orange-400",
                            !["green", "yellow", "red", "orange"].includes(section.color) &&
                              "bg-cyan-400"
                          )}
                        />
                        <span className="leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </BentoCard>
            </motion.div>
          );
        })}
      </div>

      {analysis.implementation_plan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <BentoCard className="p-6 border border-cyan-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <ListChecks className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="font-semibold">Implementation Plan</h3>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {analysis.implementation_plan}
            </p>
          </BentoCard>
        </motion.div>
      )}
    </div>
  );
}
