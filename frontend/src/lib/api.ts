const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Brief {
  id: string;
  title: string;
  client_name: string | null;
  source_type: string;
  brief_text: string;
  status: string;
  risk_level: string | null;
  complexity: string | null;
  estimated_effort: string | null;
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: string;
  brief_id: string;
  summary: string | null;
  required_skills: string[];
  nice_to_have_skills: string[];
  technical_scope: string | null;
  deliverables: string[];
  missing_information: string[];
  risks: string[];
  questions: string[];
  complexity: string | null;
  estimated_effort: string | null;
  suggested_daily_rate: string | null;
  implementation_plan: string | null;
  created_at: string;
}

export interface Proposal {
  id: string;
  brief_id: string;
  short_proposal: string | null;
  technical_proposal: string | null;
  client_questions: string[];
  next_step: string | null;
  created_at: string;
}

export interface CreateBriefData {
  title: string;
  client_name?: string;
  source_type: string;
  brief_text: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export async function getBriefs(): Promise<Brief[]> {
  return fetchApi<Brief[]>("/briefs");
}

export async function getBrief(id: string): Promise<Brief> {
  return fetchApi<Brief>(`/briefs/${id}`);
}

export async function createBrief(data: CreateBriefData): Promise<Brief> {
  return fetchApi<Brief>("/briefs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBrief(
  id: string,
  data: Partial<Brief>
): Promise<Brief> {
  return fetchApi<Brief>(`/briefs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteBrief(id: string): Promise<void> {
  return fetchApi<void>(`/briefs/${id}`, {
    method: "DELETE",
  });
}

export async function analyzeBrief(id: string): Promise<Analysis> {
  return fetchApi<Analysis>(`/briefs/${id}/analyze`, {
    method: "POST",
  });
}

export async function getAnalysis(id: string): Promise<Analysis> {
  return fetchApi<Analysis>(`/briefs/${id}/analysis`);
}

export async function generateProposal(id: string): Promise<Proposal> {
  return fetchApi<Proposal>(`/briefs/${id}/generate-proposal`, {
    method: "POST",
  });
}

export async function getProposal(id: string): Promise<Proposal> {
  return fetchApi<Proposal>(`/briefs/${id}/proposal`);
}

export async function checkHealth(): Promise<{ status: string; database: string }> {
  return fetchApi("/health");
}
