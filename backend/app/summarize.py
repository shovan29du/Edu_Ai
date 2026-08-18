import re
from collections import Counter

_STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "if", "of", "to", "in", "on", "for",
    "with", "as", "is", "was", "were", "are", "be", "been", "being", "it",
    "its", "this", "that", "these", "those", "at", "by", "from", "into",
    "up", "down", "out", "about", "than", "then", "so", "such", "not",
    "he", "she", "they", "we", "you", "i", "his", "her", "their", "our",
    "your", "my", "him", "them", "us", "which", "who", "whom", "what",
    "when", "where", "why", "how", "all", "any", "each", "few", "more",
    "most", "some", "no", "nor", "too", "very", "can", "will", "just",
    "do", "does", "did", "has", "have", "had", "had", "would", "could",
    "should", "shall", "may", "might", "must",
}


def _split_sentences(text: str) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [s.strip() for s in sentences if len(s.strip()) > 0]


def summarize(text: str, max_sentences: int = 5) -> str:
    """Extractive summary: pick the highest-scoring sentences (by word
    frequency, excluding common stopwords) and return them in their
    original order. No external API or generation — only sentences
    pulled directly from the source text."""
    sentences = _split_sentences(text)
    if len(sentences) <= max_sentences:
        return " ".join(sentences)

    word_counts = Counter()
    for sentence in sentences:
        words = re.findall(r"[a-zA-Z']+", sentence.lower())
        word_counts.update(w for w in words if w not in _STOPWORDS and len(w) > 2)

    scored = []
    for index, sentence in enumerate(sentences):
        words = re.findall(r"[a-zA-Z']+", sentence.lower())
        score = sum(word_counts[w] for w in words if w not in _STOPWORDS)
        if len(words) > 0:
            score /= len(words) ** 0.5  # avoid favoring very long sentences
        scored.append((score, index, sentence))

    top = sorted(scored, key=lambda item: item[0], reverse=True)[:max_sentences]
    top_in_order = [sentence for _, _, sentence in sorted(top, key=lambda item: item[1])]
    return " ".join(top_in_order)
