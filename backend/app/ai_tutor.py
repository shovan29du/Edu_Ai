import os
import re
from .safety import SafetyFilter

_sf = SafetyFilter()

_SYSTEM_TEMPLATE = """You are EduBot, a warm and encouraging tutor for children aged 5–16 in Grade {grade}.
The student is studying: {subject}.
Rules:
- Keep all answers age-appropriate, positive, and educational.
- Never discuss violence, adult content, politics beyond curriculum, or anything inappropriate.
- Use simple language for lower grades; more precise language for higher grades.
- Encourage curiosity. Use examples, analogies, and real-world connections.
- Keep responses under 200 words unless a detailed explanation is genuinely needed.
- Format with bullet points or numbered steps when listing things.
- Always end with one encouraging sentence."""

_FLASHCARD_TEMPLATE = """You are creating educational flashcards for a Grade {grade} student studying {subject}.
Generate exactly {count} flashcard pairs as a numbered list.
Format each pair as:
Q: [question]
A: [answer]
Keep questions concise and answers to 1–2 sentences. Be age-appropriate."""

_STUDY_PLAN_TEMPLATE = """You are a study planner helping a Grade {grade} student prepare for {subject}.
They have {days} days to study.
Create a day-by-day study schedule with:
- Daily focus topic
- Estimated time (minutes)
- One key activity
Keep it motivating and achievable."""


def _get_client():
    key = os.getenv("ANTHROPIC_API_KEY", "")
    if not key:
        return None
    try:
        import anthropic
        return anthropic.Anthropic(api_key=key)
    except Exception:
        return None


def _call(system: str, user: str, max_tokens: int = 512) -> str:
    client = _get_client()
    if not client:
        return "EduBot is offline. Please ask your teacher or parent for help with this question."
    safe_user = _sf.clean(user)
    try:
        import anthropic
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": safe_user}],
        )
        return _sf.clean(msg.content[0].text)
    except Exception as exc:
        return f"EduBot is temporarily unavailable. ({type(exc).__name__})"


def ask(question: str, grade: int = 1, subject: str = "", context: str = "") -> str:
    system = _SYSTEM_TEMPLATE.format(grade=grade, subject=subject or "general topics")
    user = question if not context else f"Lesson context:\n{context[:600]}\n\nStudent question:\n{question}"
    return _call(system, user, max_tokens=512)


def explain_concept(concept: str, grade: int = 1, subject: str = "") -> str:
    system = _SYSTEM_TEMPLATE.format(grade=grade, subject=subject or "general topics")
    return _call(system, f"Please explain this concept clearly for a Grade {grade} student: {concept}", max_tokens=600)


def generate_flashcards(topic: str, grade: int = 1, subject: str = "", count: int = 8) -> list[dict]:
    system = _FLASHCARD_TEMPLATE.format(grade=grade, subject=subject or topic, count=count)
    raw = _call(system, f"Topic: {topic}", max_tokens=800)
    cards = []
    for block in re.split(r"\n(?=\d+\.)", raw.strip()):
        q_match = re.search(r"Q:\s*(.+)", block)
        a_match = re.search(r"A:\s*(.+)", block)
        if q_match and a_match:
            cards.append({"q": q_match.group(1).strip(), "a": a_match.group(1).strip()})
    return cards or [{"q": topic, "a": "Ask your teacher for more information on this topic."}]


def generate_quiz(topic: str, grade: int = 1, subject: str = "", count: int = 5) -> list[dict]:
    system = f"""You create multiple-choice quiz questions for Grade {grade} students studying {subject or topic}.
Generate exactly {count} questions. Format each as:
Q: [question]
A) [option]
B) [option]
C) [option]
D) [option]
Answer: [A/B/C/D]
Explanation: [one sentence]
"""
    raw = _call(system, f"Topic: {topic}", max_tokens=1000)
    questions = []
    blocks = re.split(r"\n(?=Q:)", raw.strip())
    for block in blocks:
        q_m = re.search(r"Q:\s*(.+)", block)
        opts = re.findall(r"([A-D])\)\s*(.+)", block)
        ans_m = re.search(r"Answer:\s*([A-D])", block)
        exp_m = re.search(r"Explanation:\s*(.+)", block)
        if q_m and len(opts) >= 2 and ans_m:
            questions.append({
                "question": q_m.group(1).strip(),
                "options": {o[0]: o[1].strip() for o in opts},
                "answer": ans_m.group(1).strip(),
                "explanation": exp_m.group(1).strip() if exp_m else "",
            })
    return questions


def make_study_plan(subject: str, grade: int = 1, days: int = 7) -> str:
    system = _STUDY_PLAN_TEMPLATE.format(grade=grade, subject=subject, days=days)
    return _call(system, f"Create a {days}-day study plan for {subject} in Grade {grade}.", max_tokens=600)
