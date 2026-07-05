"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBrief } from "@/lib/api";

const SOURCE_TYPES = [
  "LinkedIn Job",
  "Upwork Job",
  "Client Email",
  "Tender / RFP",
  "Internal Project",
  "Other",
];

export function BriefForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      client_name: (formData.get("client_name") as string) || undefined,
      source_type: formData.get("source_type") as string,
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
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle>Brief Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., E-commerce Dashboard Redesign"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_name">Client Name</Label>
            <Input
              id="client_name"
              name="client_name"
              placeholder="e.g., Acme Corp"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source_type">Source Type *</Label>
            <select
              id="source_type"
              name="source_type"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={loading}
            >
              {SOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brief_text">Brief Text *</Label>
            <Textarea
              id="brief_text"
              name="brief_text"
              placeholder="Paste the job description, client email, or project requirements here..."
              className="min-h-[200px]"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Include all relevant details: requirements, timeline, budget, technical constraints.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="glow" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Brief
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
