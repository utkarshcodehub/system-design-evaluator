from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os, json, re

load_dotenv()
router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class DesignInput(BaseModel):
    problem: str
    requirements: str
    capacity: str
    high_level: str
    deep_dive: str
    tradeoffs: str

class FollowupInput(BaseModel):
    problem: str
    evaluation: dict

def extract_json(text: str):
    """Robustly extract the first valid JSON object or array from a string."""
    # Strip markdown fences
    text = re.sub(r"```(?:json)?", "", text).strip()
    # Find outermost { } or [ ]
    for start_char, end_char in [('{', '}'), ('[', ']')]:
        start = text.find(start_char)
        if start == -1:
            continue
        depth = 0
        for i, ch in enumerate(text[start:], start):
            if ch == start_char:
                depth += 1
            elif ch == end_char:
                depth -= 1
                if depth == 0:
                    return json.loads(text[start:i+1])
    raise ValueError(f"No valid JSON found in response: {text[:300]}")

SYSTEM_PROMPT = """You are a Senior Staff Software Engineer conducting a rigorous system design interview evaluation.
Your response MUST be strict, raw JSON matching the requested schema.
Rules:
- Do NOT wrap output in markdown code blocks (NO ``` or ```json).
- Do NOT output preamble, intro, or concluding text.
- Do NOT output extra fields outside the schema.
- The output must pass json.loads() directly without cleaning."""

EVAL_PROMPT = """Evaluate the following system design submission for the problem: "{problem}".

CANDIDATE SUBMISSION:
1. Requirements Clarification:
{requirements}

2. Capacity Estimation:
{capacity}

3. High-Level Design:
{high_level}

4. Deep Dive (DB schema, APIs, components):
{deep_dive}

5. Bottlenecks & Trade-offs:
{tradeoffs}

EVALUATION CRITERIA (1-10):
- 1-3 (Junior): Vague, missing core non-functional requirements, back-of-envelope math errors, missing single points of failure.
- 4-6 (Mid-Level): Standard architecture, decent estimates, basic schema/APIs, but lacks concrete scaling mechanics or thorough trade-off analysis.
- 7-8 (Senior): Strong schema design, accurate capacity calculations, realistic API design, proactive identification of bottlenecks (caching, partitioning, queues).
- 9-10 (Staff): Exceptional clarity, highly actionable schema/API specs, addresses edge cases, fault tolerance, data consistency (CAP/BASE), and cost/operational trade-offs.

INSTRUCTIONS:
1. Score each of the 5 sections from 1 to 10.
2. Provide a concise 2-3 sentence technical feedback comment per section.
3. Calculate 'overall_score' as the average of the 5 section scores (rounded to 1 decimal place).
4. Assign 'band': "Junior" (1.0-3.9), "Mid" (4.0-6.4), "Senior" (6.5-8.4), or "Staff" (8.5-10.0).
5. Extract top 2-3 key strengths and top 2-3 key technical gaps.

Return ONLY the following JSON structure:
{{
  "scores": {{
    "requirements": {{"score": 7, "comment": "..."}},
    "capacity": {{"score": 6, "comment": "..."}},
    "high_level": {{"score": 8, "comment": "..."}},
    "deep_dive": {{"score": 5, "comment": "..."}},
    "tradeoffs": {{"score": 6, "comment": "..."}}
  }},
  "overall_score": 6.4,
  "band": "Mid",
  "summary": "Concise 2-3 sentence overall evaluation of the design.",
  "strengths": ["...", "..."],
  "gaps": ["...", "..."]
}}"""

FOLLOWUP_PROMPT = """You are a Staff Engineer interviewing a candidate about their design for: "{problem}".

EVALUATION SUMMARY: {summary}
IDENTIFIED GAPS: {gaps}

TASK:
Generate exactly 3 deep-dive, probing follow-up questions targeting the specific technical gaps identified.
Requirements for questions:
- Focus on practical trade-offs, failure modes, data consistency, or scaling bottlenecks.
- Be concrete and specific to the candidate's architecture (avoid generic questions like "How would you monitor this?").

Return ONLY a JSON array containing exactly 3 strings:
[
  "Probing technical question 1...",
  "Probing technical question 2...",
  "Probing technical question 3..."
]"""

@router.post("/evaluate")
async def evaluate_design(data: DesignInput):
    prompt = EVAL_PROMPT.format(
        problem=data.problem,
        requirements=data.requirements or "(not provided)",
        capacity=data.capacity or "(not provided)",
        high_level=data.high_level or "(not provided)",
        deep_dive=data.deep_dive or "(not provided)",
        tradeoffs=data.tradeoffs or "(not provided)",
    )
    try:
        resp = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=1500,
        )
        raw = resp.choices[0].message.content.strip()
        return extract_json(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/followup")
async def get_followup(data: FollowupInput):
    prompt = FOLLOWUP_PROMPT.format(
        problem=data.problem,
        summary=data.evaluation.get("summary", ""),
        gaps=data.evaluation.get("gaps", []),
    )
    try:
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=500,
        )
        raw = resp.choices[0].message.content.strip()
        questions = extract_json(raw)
        return {"questions": questions if isinstance(questions, list) else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))