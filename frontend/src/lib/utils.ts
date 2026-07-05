import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string) {
  switch (status) {
    case "New":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Analysed":
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    case "Proposal Drafted":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "Archived":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export function getRiskColor(risk: string | null) {
  switch (risk) {
    case "Low":
      return "text-green-400";
    case "Medium":
      return "text-yellow-400";
    case "High":
      return "text-red-400";
    default:
      return "text-muted-foreground";
  }
}
