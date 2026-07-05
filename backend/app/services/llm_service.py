import json

from openai import OpenAI

from app.config import settings

ANALYSIS_SYSTEM_PROMPT = """You are a technical project analyst for freelance and job briefs.
Analyze the brief and return ONLY valid JSON with exactly these fields:
- summary (string)
- required_skills (array of strings)
- nice_to_have_skills (array of strings)
- technical_scope (string)
- deliverables (array of strings)
- missing_information (array of strings)
- risks (array of strings)
- questions (array of strings)
- complexity (string: Low, Medium, or High)
- estimated_effort (string, e.g. "10-15 days")
- suggested_daily_rate (string, e.g. "EUR 200-250/day")
- implementation_plan (string, multi-line steps)

Be specific to the brief content. Do not invent unrelated technologies."""


def analyze_brief_with_llm(brief_text: str) -> dict:
    if not settings.llm_api_key:
        raise ValueError("LLM_API_KEY is not configured")

    client = OpenAI(api_key=settings.llm_api_key)
    response = client.chat.completions.create(
        model=settings.llm_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": brief_text},
        ],
    )
    content = response.choices[0].message.content or "{}"
    return json.loads(content)


PROPOSAL_SYSTEM_PROMPT = """You are a freelance proposal writer.
Based on the brief and its analysis, return ONLY valid JSON with exactly these fields:
- short_proposal (string, 2-4 paragraphs, professional tone for the client)
- technical_proposal (string, detailed technical approach)
- client_questions (array of strings, questions to clarify before starting)
- next_step (string, one clear call-to-action)

Write in the same language as the brief. Be specific to the project."""


def generate_proposal_with_llm(brief_text: str, analysis: dict) -> dict:
    if not settings.llm_api_key:
        raise ValueError("LLM_API_KEY is not configured")

    client = OpenAI(api_key=settings.llm_api_key)
    user_content = f"Brief:\n{brief_text}\n\nAnalysis:\n{json.dumps(analysis, ensure_ascii=False)}"
    response = client.chat.completions.create(
        model=settings.llm_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": PROPOSAL_SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
    )
    content = response.choices[0].message.content or "{}"
    return json.loads(content)