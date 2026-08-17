"""Grounded tutor orchestration, citation records, budgets and usage logs."""

from __future__ import annotations

import os
import re
from datetime import datetime, timezone

from sqlalchemy import func, select

from app import ai_tutor
from app.database import session_scope
from app.models import AIConversation, AIMessage, AIUsage, Resource, User


def _terms(text: str) -> set[str]:
    return {word.lower() for word in re.findall(r"[A-Za-z][A-Za-z0-9-]{2,}", text)}


def retrieve_sources(question: str, level_id: str = "", subject: str = "", limit: int = 6) -> list[dict]:
    wanted = _terms(f"{subject} {question}")
    with session_scope() as session:
        statement = select(Resource).where(Resource.deleted_at.is_(None))
        resources = list(session.scalars(statement.limit(2000)))
    ranked = []
    for resource in resources:
        text = f"{resource.title} {resource.extracted_text[:4000]}"
        score = len(wanted & _terms(text))
        if score:
            ranked.append((score, resource))
    ranked.sort(key=lambda pair: pair[0], reverse=True)
    return [
        {
            "id": resource.id,
            "title": resource.title,
            "url": resource.url,
            "citation": resource.citation,
            "excerpt": resource.extracted_text[:1200],
            "relevance": score,
        }
        for score, resource in ranked[:limit]
    ]


def _month_start() -> datetime:
    current = datetime.now(timezone.utc)
    return current.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def monthly_usage(user_id: str) -> float:
    with session_scope() as session:
        value = session.scalar(
            select(func.coalesce(func.sum(AIUsage.estimated_cost_usd), 0)).where(
                AIUsage.user_id == user_id,
                AIUsage.created_at >= _month_start(),
            )
        )
    return float(value or 0)


def grounded_answer(
    *,
    user_id: str,
    question: str,
    level_id: str,
    subject: str,
    difficulty: str = "",
    mode: str = "direct",
) -> dict:
    budget = float(os.getenv("AI_MONTHLY_BUDGET_USD", "25"))
    spent = monthly_usage(user_id)
    if spent >= budget:
        raise ValueError(f"Monthly AI budget reached (${spent:.2f} of ${budget:.2f})")

    sources = retrieve_sources(question, level_id, subject)
    context = "\n\n".join(
        f"[Source {index}] {source['title']}\n{source['excerpt']}"
        for index, source in enumerate(sources, start=1)
    )
    instruction = {
        "socratic": "Use Socratic questions before giving the conclusion.",
        "worked_example": "Include a complete worked example.",
        "compare": "Compare competing academic perspectives and their evidence.",
        "direct": "Answer directly and precisely.",
    }.get(mode, "Answer directly and precisely.")
    grounded_question = (
        f"{instruction}\nUse the approved sources below when they support the answer. "
        "Cite them inline as [Source N]. Clearly label any inference not established by a source.\n\n"
        f"{question}"
    )
    answer = ai_tutor.ask(
        grounded_question,
        level=level_id,
        subject=subject,
        context=context,
        difficulty=difficulty,
    )

    estimated_tokens = max(1, (len(grounded_question) + len(context) + len(answer)) // 4)
    estimated_cost = estimated_tokens * 0.000001
    with session_scope() as session:
        user = session.get(User, user_id)
        if not user:
            raise ValueError("Unknown database user")
        conversation = AIConversation(
            user_id=user_id,
            title=question[:120],
            level_id=level_id,
            subject=subject,
            settings={"mode": mode, "difficulty": difficulty},
        )
        session.add(conversation)
        session.flush()
        session.add(AIMessage(conversation_id=conversation.id, role="user", content=question))
        session.add(
            AIMessage(
                conversation_id=conversation.id,
                role="assistant",
                content=answer,
                citations=sources,
                model="claude-haiku-4-5-20251001",
            )
        )
        session.add(
            AIUsage(
                user_id=user_id,
                conversation_id=conversation.id,
                provider="anthropic",
                model="claude-haiku-4-5-20251001",
                input_tokens=estimated_tokens,
                output_tokens=max(1, len(answer) // 4),
                estimated_cost_usd=estimated_cost,
                status="success",
            )
        )
        conversation_id = conversation.id
    return {
        "answer": answer,
        "citations": sources,
        "conversation_id": conversation_id,
        "usage": {
            "estimated_cost_usd": round(estimated_cost, 6),
            "monthly_spent_usd": round(spent + estimated_cost, 4),
            "monthly_budget_usd": budget,
        },
    }
