from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
EXTRACTED = ROOT / ".codex_tmp" / "extracted"
OUT_FILE = ROOT / "src" / "data" / "blogDraftOverrides.ts"


FIRST_DRAFT_MAP = {
    "INTRO": "hyperanthropism-reckoning-of-intelligence",
    "I": "hyperanthropism-against-fatalistic-transhumanism",
    "II": "hyperanthropism-biology-as-engine",
    "III": "hyperanthropism-the-case",
    "IV": "hyperanthropism-dimensional-evolution",
    "V": "hyperanthropism-sentience-must-lead",
    "VI": "hyperanthropism-cognitive-nutrition",
    "VII": "hyperanthropism-emotional-intelligence",
    "VIII": "hyperanthropism-substrate-question",
    "IX": "hyperanthropism-overman-kardashev",
    "X": "hyperanthropism-the-singularity-myth",
    "XI": "hyperanthropism-evolution-without-end",
    "XII": "hyperanthropism-the-moral-axis",
    "XIII": "hyperanthropism-sovereign-agency",
    "XIV": "hyperanthropism-spiritual-integration",
    "XV": "hyperanthropism-cosmic-stewardship",
    "XVI": "hyperanthropism-against-infantilization",
    "XVII": "hyperanthropism-technologies-of-integration",
    "XVIII": "hyperanthropism-decentralization",
    "XIX": "hyperanthropism-psychopolitics-overman",
    "XX": "hyperanthropism-constitution",
    "XXI": "hyperanthropism-praxis-and-participation",
    "XXII": "hyperanthropism-hyperanthropic-vanguard",
    "XXIII": "hyperanthropism-destiny-function",
    "XXIV": "hyperanthropism-mythopoetic-closing",
}


SECOND_DRAFT_MAP = {
    "PREFACE": "hyperanthropism-completion-recursion-re-beginning",
    "One": "hyperanthropism-imperative-of-transvaluation-exponential-mutation",
    "Two": "hyperanthropism-mythosynthetic-civilizations-archetypes-evolution",
    "Three": "hyperanthropism-value-symphonics-transvalue-cores",
    "Four": "hyperanthropism-telos-of-morality-becoming-meaning",
    "Five": "hyperanthropism-mythosynthetic-archetypes-architectonics-of-transcendence",
    "Six": "hyperanthropism-kardashev-evolution-planetary-overman",
    "Seven": "hyperanthropism-dimensional-expansion-recursive-sublime",
    "Eight": "hyperanthropism-telos-toward-civilizational-apotheosis",
}


THIRD_DRAFT_MAP = {
    "1": "hyperanthropism-age-of-transvaluation-revisited",
    "2": "hyperanthropism-life-intelligence-and-the-cosmic-axis",
    "3": "hyperanthropism-transhumanism-and-its-discontents",
    "4": "hyperanthropism-false-dichotomy-carbon-vs-silicon",
    "5": "hyperanthropism-reintroducing-embodiment",
    "6": "hyperanthropism-recursive-civilizational-design",
    "7": "hyperanthropism-nietzschean-overman-as-cosmic-agent",
    "8": "hyperanthropism-kardashev-scale-reimagined-energetics-and-myth",
    "9": "hyperanthropism-mythosynthesis-archetype-intelligence-and-evolution",
    "10": "hyperanthropism-re-sacralizing-intelligence",
    "11": "hyperanthropism-the-vertical-engine",
    "12": "hyperanthropism-telos-of-morality-self-transcendence-not-compliance",
    "13": "hyperanthropism-becoming-of-meaning",
    "14": "hyperanthropism-post-nietzschean-telos",
    "15": "hyperanthropism-toward-the-future-of-meaningful-evolution",
}


FOURTH_DRAFT_DATE = "2026-02-24"
FIFTH_DRAFT_DATE = "2026-02-24"


FOURTH_DRAFT_SLUGS = {
    "PROLOGUE": "hyperanthropism-the-world-does-not-care-if-you-are-weak",
    "I": "hyperanthropism-man-is-not-the-end-he-is-the-rope",
    "II": "hyperanthropism-against-the-last-man",
    "III": "hyperanthropism-ten-principles-of-the-overman-reforged",
    "IV": "hyperanthropism-meaning-as-an-engine-of-becoming",
    "V": "hyperanthropism-quantum-thinking-and-consciousness-agency",
    "VI": "hyperanthropism-transhumanism-vs-hyperanthropism",
    "VII": "hyperanthropism-epigenetics-and-the-will-to-rewire",
    "VIII": "hyperanthropism-the-mythosynthetic-function",
    "IX": "hyperanthropism-toward-vertical-civilization",
    "X": "hyperanthropism-closing-invocation-the-war-is-sacred",
}


FIFTH_DRAFT_SLUGS = {
    4: "hyperanthropism-last-man-and-the-great-flattening",
    10: "hyperanthropism-biology-of-the-overman-epigenetics-and-energy-sovereignty",
    11: "hyperanthropism-quantum-thinking-and-conscious-state-selection",
    20: "hyperanthropism-aesthetics-style-as-self-overcoming",
    21: "hyperanthropism-bioethics-beyond-the-herd",
    23: "hyperanthropism-education-raising-spiral-minds",
    24: "hyperanthropism-vertical-governance",
    25: "hyperanthropism-overman-and-the-kardashev-horizon",
    26: "hyperanthropism-against-technological-utopianism",
    27: "hyperanthropism-cyborgs-ai-civilizations-and-the-ontological-ceiling",
    28: "hyperanthropism-return-to-the-body-natural-intelligence",
    30: "hyperanthropism-hyperanthropist-mythosynthesis-rebuilding-meaning",
    31: "hyperanthropism-value-symphonics-codes-of-the-next-epoch",
    32: "hyperanthropism-symbolic-warfare-seizing-the-semiotic-terrain",
    33: "hyperanthropism-telos-of-morality-becoming-not-belonging",
    34: "hyperanthropism-hyperanthropist-education-cultivating-the-species-of-the-future",
    35: "hyperanthropism-spiral-of-intelligence",
    36: "hyperanthropism-vertical-biocentrism",
    37: "hyperanthropism-ontological-flame",
}


ARTIFACT_CUT_MARKERS = [
    "\nNext Section Preview:",
    "\nComing Up:",
    "\nNext Chapter:",
    "\nTransition to Chapter",
    "\nTransition to ",
    "\nNext Step:",
    "\nThe continuation of the Third Draft will elaborate on:",
    "\nShall I continue with the concluding section",
    "\nShall I begin now to append this full Third Draft",
]

FOURTH_FIFTH_CUT_MARKERS = [
    "\nWould you like",
    "\nPerfect. ",
    "\nExcellent. ",
    "\nContinuing the Fifth Draft",
    "\nContinuing the Fourth Draft",
    "\nNext Section:",
    "\nAwaiting your instruction",
    "\nShall we now proceed with the Book Front- and Backmatter",
    "\nLet me know how you'd like to proceed.",
]


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n")


def first_cut(text: str, markers: list[str]) -> str:
    idxs = [text.find(m) for m in markers if text.find(m) != -1]
    if not idxs:
        return text
    return text[: min(idxs)]


def normalize_section_text(text: str) -> str:
    text = text.replace("\ufeff", "")
    text = text.replace("\u00a0", " ")
    text = text.replace("💡", "")
    text = text.replace("📌", "")
    text = text.replace("📚", "")
    text = text.replace("✅", "")
    text = text.replace("▸ ", "")
    # Preserve the original wording but remove conversion artifacts.
    text = text.replace("?? ", "")
    text = text.replace("Footnote Reference: ", "")
    text = text.replace("(see Chapter Two)", "(see earlier discussion)")
    text = re.sub(r"\bsee Chapter [A-Za-z0-9IVXLC\- ]+\b", "see an earlier discussion", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def clean_first_draft_section(key: str, text: str) -> str:
    if key == "IV":
        text = re.sub(
            r"\n\[Chapters V through XII forthcoming[\s\S]*?\]\s*",
            "\n",
            text,
            flags=re.MULTILINE,
        )
        text = re.sub(r"\*\*\*!!FAILED OUTPUT!![\s\S]*", "", text)
    if key == "XXIV":
        text = first_cut(text, ["\nFront Matter"])
    return normalize_section_text(text)


def clean_second_third_section(text: str) -> str:
    text = first_cut(text, ARTIFACT_CUT_MARKERS)
    lines = []
    for line in text.splitlines():
        s = line.strip()
        if not s:
            lines.append("")
            continue
        if s in {"4o", "proceed", "continue"}:
            continue
        if s in {"You said:", "ChatGPT said:"}:
            continue
        if s.startswith("Excellent. Continuing directly, I will now begin the Third Draft"):
            continue
        if s.startswith("Excellent. Proceeding with the Third Draft"):
            continue
        if s.startswith("Continuing with the Second Draft"):
            continue
        if s.startswith("Continuing the Second Draft"):
            continue
        if s.startswith("Continuing with the Third Draft"):
            continue
        if s.startswith("[THIRD DRAFT:"):
            continue
        if s.startswith("✦ Annotations and Glossary Preparation"):
            continue
        if s.startswith("Would you like me to proceed into the final annotation phase"):
            continue
        if s.startswith("Excellent. Let us now proceed with the Final Annotation"):
            continue
        if s.startswith("Excellent. We now move into the Final Phase"):
            continue
        if s.startswith("Phase One: "):
            continue
        if s.startswith("Phase Two: "):
            continue
        if s.startswith("Now that Part I and II are annotated and primed for integration"):
            continue
        if s.startswith("Next: We’ll annotate Part II"):
            continue
        if s.startswith("Next: We'll annotate Part II"):
            continue
        if s == "Preface to the Second Draft: On the Nature of Completion and Recursion":
            continue
        if s == "This is the final edge of the Second Draft’s conceptual ascent.":
            lines.append("This is the final edge of the conceptual ascent.")
            continue
        lines.append(line)
    cleaned = "\n".join(lines)
    cleaned = cleaned.replace("the upcoming final integration stage", "the upcoming integration stage")
    return normalize_section_text(cleaned)


def clean_fourth_fifth_section(text: str, *, chapter_key: str | int | None = None) -> str:
    text = first_cut(text, FOURTH_FIFTH_CUT_MARKERS)
    # Remove obvious inline conversation/transfer artifacts.
    text = re.sub(
        r"\n\(Chapters IV–X,[\s\S]*?will follow\.\)\s*",
        "\n",
        text,
        flags=re.MULTILINE,
    )
    text = re.sub(
        r"\n#{20,}[\s\S]*?#{20,}\s*",
        "\n",
        text,
        flags=re.MULTILINE,
    )
    text = text.replace("Either is possible—I am ready.", "")

    lines: list[str] = []
    for line in text.splitlines():
        s = line.strip()
        if not s:
            lines.append("")
            continue
        if s in {"4o", "proceed", "continue"}:
            continue
        if s in {"You said:", "ChatGPT said:"}:
            continue
        if s.startswith("Would you like"):
            continue
        if s.startswith("Perfect. "):
            continue
        if s.startswith("Excellent. "):
            continue
        if s.startswith("Continuing the Fifth Draft"):
            continue
        if s.startswith("Continuing the Fourth Draft"):
            continue
        if s.startswith("Next Section:"):
            continue
        if s.startswith("Awaiting your instruction"):
            continue
        if s.startswith("Shall we now proceed with the Book Front- and Backmatter"):
            continue
        if s.startswith("Let me know how you'd like to proceed."):
            continue
        if re.fullmatch(r"\((?:Expanded|New|Refined|Clarified|Enhanced|Integration|Reintegration|The Esoteric Capstone|Further Expansion Pending)[^)]*\)", s, flags=re.IGNORECASE):
            continue
        # Placeholder heading duplicates in 5th draft.
        if chapter_key in {34, 35, 36, 37} and re.fullmatch(r"Chapter (34|35|36|37): .+", s):
            continue
        lines.append(line)

    cleaned = normalize_section_text("\n".join(lines))
    return cleaned


def parse_first_draft(text: str) -> dict[str, str]:
    sections: dict[str, str] = {}
    intro_m = re.search(r"^Introduction: The Reckoning of Intelligence\s*$", text, re.MULTILINE)
    ch1_m = re.search(r"^Chapter I: ", text, re.MULTILINE)
    if not intro_m or not ch1_m:
        raise RuntimeError("Failed to locate 1st draft intro/chapter I headings")
    intro_body = text[intro_m.end() : ch1_m.start()]
    sections["INTRO"] = clean_first_draft_section("INTRO", intro_body)

    chapter_re = re.compile(r"^Chapter (?P<num>[IVXLC]+): (?P<title>.+)$", re.MULTILINE)
    matches = list(chapter_re.finditer(text))
    for i, m in enumerate(matches):
        num = m.group("num")
        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[body_start:body_end]
        sections[num] = clean_first_draft_section(num, body)
    return sections


def parse_second_draft(text: str) -> dict[str, str]:
    sections: dict[str, str] = {}
    ch1_m = re.search(r"^Chapter One: ", text, re.MULTILINE)
    if not ch1_m:
        raise RuntimeError("Failed to locate 2nd draft Chapter One")
    preface_heading = re.search(r"^Preface to the Second Draft: .+$", text, re.MULTILINE)
    preface_start = preface_heading.end() if preface_heading else 0
    sections["PREFACE"] = clean_second_third_section(text[preface_start : ch1_m.start()])

    chapter_re = re.compile(r"^Chapter (?P<num>One|Two|Three|Four|Five|Six|Seven|Eight): (?P<title>.+)$", re.MULTILINE)
    matches = list(chapter_re.finditer(text))
    for i, m in enumerate(matches):
        num = m.group("num")
        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = clean_second_third_section(text[body_start:body_end])
        sections[num] = body
    return sections


def parse_third_draft(text: str) -> dict[str, str]:
    start_m = re.search(
        r"^1\. Introduction: The Age of Transvaluation Revisited\s*$",
        text,
        re.MULTILINE,
    )
    if not start_m:
        raise RuntimeError("Failed to locate 3rd draft section 1 heading")

    end_m = re.search(r"^Excellent\. We now move into the Final Phase", text, re.MULTILINE)
    main = text[start_m.start() : (end_m.start() if end_m else len(text))]

    section_re = re.compile(
        r"^(?P<num>(?:1[0-5]|[1-9]))\. (?P<title>.+)$",
        re.MULTILINE,
    )
    matches = list(section_re.finditer(main))
    sections: dict[str, str] = {}
    for i, m in enumerate(matches):
        num = m.group("num")
        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(main)
        body = clean_second_third_section(main[body_start:body_end])
        # Keep only the first occurrence of duplicate headings if ever present.
        sections.setdefault(num, body)
    return sections


def parse_fourth_draft(text: str) -> list[tuple[str, str, str]]:
    entries: list[tuple[str, str, str]] = []

    prologue_marker = re.search(r"^✦ Prologue ✦\s*$", text, re.MULTILINE)
    first_chapter = re.search(r"^Chapter I: ", text, re.MULTILINE)
    if not prologue_marker or not first_chapter:
        raise RuntimeError("Failed to locate 4th draft prologue/chapter headings")

    prologue_block = text[prologue_marker.end() : first_chapter.start()]
    prologue_lines = [ln.strip() for ln in prologue_block.splitlines() if ln.strip()]
    if not prologue_lines:
        raise RuntimeError("Empty 4th draft prologue block")
    prologue_title = prologue_lines[0].rstrip(".")
    prologue_body = "\n".join(prologue_lines[1:])
    entries.append(("PROLOGUE", prologue_title, clean_fourth_fifth_section(prologue_body, chapter_key="PROLOGUE")))

    chapter_re = re.compile(r"^Chapter (?P<num>[IVXLC]+): (?P<title>.+)$", re.MULTILINE)
    matches = list(chapter_re.finditer(text))
    for i, m in enumerate(matches):
        num = m.group("num")
        title = m.group("title").strip().rstrip(".")
        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = clean_fourth_fifth_section(text[body_start:body_end], chapter_key=num)
        entries.append((num, title, body))
    return entries


def _clean_fifth_title(title: str) -> str:
    title = re.sub(r"\s+\((?:Expanded|New|Refined|Integration|Further)[^)]*\)$", "", title, flags=re.IGNORECASE)
    title = re.sub(r"\s+\((?:Expanded with [^)]+)\)$", "", title, flags=re.IGNORECASE)
    title = title.strip()
    return title


def parse_fifth_draft(text: str) -> list[tuple[int, str, str]]:
    chapter_re = re.compile(r"^Chapter (?P<num>\d+): (?P<title>.+)$", re.MULTILINE)
    matches = list(chapter_re.finditer(text))
    candidates: dict[int, list[tuple[str, str]]] = {}

    for i, m in enumerate(matches):
        num = int(m.group("num"))
        title = _clean_fifth_title(m.group("title").strip())
        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = clean_fourth_fifth_section(text[body_start:body_end], chapter_key=num)
        if not body.strip():
            continue
        if "Further Expansion Pending in Next Section" in body:
            continue
        if body.strip().startswith("Would you like"):
            continue
        candidates.setdefault(num, []).append((title, body))

    selected: list[tuple[int, str, str]] = []
    for num in sorted(candidates):
        # Skip placeholder-only entries if richer duplicates exist.
        best_title, best_body = max(
            candidates[num],
            key=lambda t: (len(re.findall(r"\w+", t[1])), len(t[0])),
        )
        # Skip very short placeholder duplicates (e.g., chapter list prompt headings).
        if len(re.findall(r"\w+", best_body)) < 20:
            continue
        selected.append((num, best_title, best_body))
    return selected


def is_artifact_line(line: str) -> bool:
    s = line.strip()
    if not s:
        return False
    patterns = [
        r"^Shall I ",
        r"^Would you like ",
        r"^You said:$",
        r"^ChatGPT said:$",
        r"^4o$",
        r"^Next Step:",
        r"^Next Section Preview:",
        r"^Coming Up:",
        r"^Next Chapter:",
        r"^Transition to ",
        r"^\[THIRD DRAFT:",
        r"^Excellent\.",
        r"^Continuing ",
        r"^Proceeding ",
        r"^Annotations and Glossary",
        r"^Glossary Entry",
        r"^Annotation \[",
        r"^✦",
    ]
    return any(re.search(p, s) for p in patterns)


def is_subheading_line(line: str) -> bool:
    s = line.strip()
    if len(s) > 140:
        return False
    if s.endswith(":") and len(s.split()) <= 18:
        return True
    if re.match(r"^[IVXLC]+\.\s", s):
        return True
    if re.match(r"^[A-Z][A-Za-z'’\-]+(?: [A-Z][A-Za-z'’\-]+){0,7} \(.+\)$", s):
        return True
    if s in {"Dimensional Intelligence Lattice (DIL)"}:
        return True
    return False


def list_item_text(line: str) -> str | None:
    s = line.strip()
    m = re.match(r"^(?:[-*•]\s+)(.+)$", s)
    if m:
        return m.group(1).strip()
    m = re.match(r"^(?:\d+\.\s+)(.+)$", s)
    if m:
        return m.group(1).strip()
    return None


def looks_like_colon_list_item(line: str) -> bool:
    s = line.strip()
    if len(s) > 220:
        return False
    if s.endswith(":"):
        return False
    if ":" not in s:
        return False
    # Heuristic for "Label: description" style lines.
    label, _, rest = s.partition(":")
    return 1 <= len(label.split()) <= 8 and len(rest.strip()) > 0


def build_content_blocks(section_text: str) -> list[dict]:
    blocks: list[dict] = []
    lines = [ln.rstrip() for ln in section_text.splitlines()]
    i = 0
    while i < len(lines):
        raw = lines[i]
        s = raw.strip()
        if not s:
            i += 1
            continue
        if is_artifact_line(s):
            i += 1
            continue

        # Group explicit bullet/numbered lists.
        li = list_item_text(s)
        if li is not None:
            items = [li]
            i += 1
            while i < len(lines):
                nxt = lines[i].strip()
                nxt_li = list_item_text(nxt) if nxt else None
                if nxt_li is None:
                    break
                items.append(nxt_li)
                i += 1
            blocks.append({"type": "list", "items": items})
            continue

        # Group consecutive "Label: description" lines as a list.
        if looks_like_colon_list_item(s):
            tmp = [s]
            j = i + 1
            while j < len(lines) and looks_like_colon_list_item(lines[j]):
                tmp.append(lines[j].strip())
                j += 1
            if len(tmp) >= 2:
                blocks.append({"type": "list", "items": tmp})
                i = j
                continue

        if is_subheading_line(s):
            blocks.append({"type": "subheading", "text": s.rstrip(":")})
            i += 1
            continue

        if (s.startswith("“") and "”" in s) or (s.startswith('"') and '"' in s[1:]):
            blocks.append({"type": "quote", "text": s})
            i += 1
            continue

        blocks.append({"type": "paragraph", "text": s})
        i += 1

    # Remove accidental empty/duplicate artifacts post-parse.
    cleaned: list[dict] = []
    for block in blocks:
        if block["type"] == "paragraph":
            text = block["text"].strip()
            if not text:
                continue
            if is_artifact_line(text):
                continue
            cleaned.append({"type": "paragraph", "text": text})
        elif block["type"] == "subheading":
            text = block["text"].strip()
            if not text or is_artifact_line(text):
                continue
            cleaned.append({"type": "subheading", "text": text})
        elif block["type"] == "quote":
            text = block["text"].strip()
            if not text:
                continue
            cleaned.append({"type": "quote", "text": text})
        elif block["type"] == "list":
            items = [it.strip() for it in block["items"] if it.strip() and not is_artifact_line(it)]
            if items:
                cleaned.append({"type": "list", "items": items})
    return cleaned


def build_summary(blocks: list[dict]) -> str:
    source = ""
    for block in blocks:
        if block["type"] in {"paragraph", "quote"}:
            source = block["text"]
            break
    if not source and blocks and blocks[0]["type"] == "list":
        source = " ".join(blocks[0]["items"])
    source = re.sub(r"\s+", " ", source).strip()
    if len(source) <= 320:
        return source
    # Prefer sentence boundary within range.
    for delim in [". ", "? ", "! "]:
        pos = source.find(delim)
        if 80 <= pos <= 300:
            return source[: pos + 1].strip()
    clipped = source[:317].rsplit(" ", 1)[0].rstrip(",;:")
    return clipped + "..."


def generate_overrides() -> list[dict]:
    first = parse_first_draft(read_text(EXTRACTED / "1st Draft.txt"))
    second = parse_second_draft(read_text(EXTRACTED / "2nd Draft.txt"))
    third = parse_third_draft(read_text(EXTRACTED / "3rd Draft.txt"))
    fourth = parse_fourth_draft(read_text(EXTRACTED / "4th Draft.txt"))
    fifth = parse_fifth_draft(read_text(EXTRACTED / "5th Draft.txt"))

    overrides: list[dict] = []

    def add_from_section(slug: str, text: str):
        blocks = build_content_blocks(text)
        if not blocks:
            raise RuntimeError(f"No content blocks generated for {slug}")
        overrides.append({"slug": slug, "summary": build_summary(blocks), "content": blocks})

    def infer_tags(title: str) -> list[str]:
        t = title.lower()
        if "quantum" in t:
            return ["Consciousness", "Quantum", "Will"]
        if "epigenetic" in t or "biology" in t or "body" in t or "bio" in t:
            return ["Biology", "Embodiment", "Evolution"]
        if "education" in t:
            return ["Education", "Culture", "Development"]
        if "governance" in t:
            return ["Governance", "Civilization", "Power"]
        if "myth" in t or "mythos" in t:
            return ["Mythosynthesis", "Culture", "Meaning"]
        if "morality" in t or "ethic" in t:
            return ["Ethics", "Values", "Becoming"]
        if "kardashev" in t or "cosmic" in t:
            return ["Cosmology", "Civilization", "Evolution"]
        if "aesthetic" in t or "style" in t or "symbolic" in t:
            return ["Aesthetics", "Culture", "Meaning"]
        if "last man" in t:
            return ["Nietzsche", "Culture", "Agency"]
        return ["Hyperanthropism", "Philosophy", "Evolution"]

    def add_new_post(slug: str, title: str, text: str, published_at: str):
        blocks = build_content_blocks(text)
        if not blocks:
            return
        overrides.append(
            {
                "slug": slug,
                "title": title,
                "publishedAt": published_at,
                "tags": infer_tags(title),
                "summary": build_summary(blocks),
                "content": blocks,
            }
        )

    for key, slug in SECOND_DRAFT_MAP.items():
        add_from_section(slug, second[key])
    for key, slug in THIRD_DRAFT_MAP.items():
        add_from_section(slug, third[key])
    for key, slug in FIRST_DRAFT_MAP.items():
        add_from_section(slug, first[key])

    for key, title, body in fourth:
        slug = FOURTH_DRAFT_SLUGS.get(key)
        if not slug:
            continue
        add_new_post(slug, title, body, FOURTH_DRAFT_DATE)

    for num, title, body in fifth:
        slug = FIFTH_DRAFT_SLUGS.get(num)
        if not slug:
            continue
        add_new_post(slug, title, body, FIFTH_DRAFT_DATE)

    # Stable ordering roughly matches existing series blocks.
    slug_index = {o["slug"]: i for i, o in enumerate(overrides)}
    desired = [
        *SECOND_DRAFT_MAP.values(),
        *THIRD_DRAFT_MAP.values(),
        *FIRST_DRAFT_MAP.values(),
        *FOURTH_DRAFT_SLUGS.values(),
        *FIFTH_DRAFT_SLUGS.values(),
    ]
    overrides.sort(key=lambda o: desired.index(o["slug"]) if o["slug"] in desired else slug_index[o["slug"]])
    return overrides


def main() -> None:
    overrides = generate_overrides()
    payload = json.dumps(overrides, ensure_ascii=False, indent=2)
    ts = (
        "// Auto-generated from 1st/2nd/3rd draft RTF sources for high-fidelity blog content overrides.\n"
        "// Regenerate with: python .codex_tmp/build_blog_draft_overrides.py\n"
        f"export const DRAFT_BLOG_POST_OVERRIDES = {payload};\n"
    )
    OUT_FILE.write_text(ts, encoding="utf-8")
    print(f"Wrote {OUT_FILE} with {len(overrides)} overrides")


if __name__ == "__main__":
    main()
