# Edu_Ai — Global Education Platform

Educational software for children, with parental controls and a safety-first content model. Built for five profiles, switchable via the header dropdown (no login required): **Aliza** and **Saifan** (children), and **Parent**, **Shovan** (dad), and **Bely** (mom) (resource curation/oversight, no learner content).

## Current status

This repo currently contains a **working core skeleton**, not the full 10‑grade, 22‑subject curriculum described in the original spec. That spec is too large to populate honestly in one pass — generating thousands of book/video entries up front would mean mostly fabricated placeholder data. Instead, the skeleton below is real and runnable, and content should be filled in grade-by-grade, subject-by-subject as a deliberate next step.

What's here:

- FastAPI backend with child profiles, progress storage, a safety/profanity filter, upload scanning, a kid-safe resource search endpoint, a live web-search endpoint (parent-only), and a curation endpoint to add reviewed resources into a grade's syllabus.
- React + Vite + Tailwind frontend with child/parent selector, parental control panel (Restricted Mode), grade selector, syllabus cards, video/book sections, a progress dashboard (Recharts radar chart), a cross-subject resource library browser, an in-browser sandboxed code editor, a colouring/drawing canvas, a per-subject exam with auto-grading and retry, and a parent-only curation page.
- Eight real, populated grades (`backend/syllabus/grade1.json` through `grade8.json`). Every grade now includes **Math, English, Science, Geography, World History, Islamic Studies, World Literature, Art, Music, and General Knowledge**; **Coding** is included from grade 2 onward (drag-and-drop blocks are a poor fit for pre-readers in grade 1); **Survival Skills** and **Cooking** are included from grade 3 onward (both assume a slightly older, more independent reader). All use genuinely free/public resources — Project Gutenberg, CK-12, Khan Academy, BBC Bitesize (including BBC Bitesize Religious Studies for Islamic Studies, and BBC Bitesize Art and Design for Art), NASA Space Place, National Geographic Kids, Quran.com, Code.org, Scratch (MIT), Storyweaver (Pratham Books), LibriVox, Make Beliefs Comix, Crayola's free colouring pages, Classics for Kids, musictheory.net, Free Music Archive, IMSLP, Ready.gov Kids, Wonderopolis, USDA MyPlate, and KidsHealth.
- A `infographics` resource type alongside books/videos/text/cartoons, rendered as an image grid (`InfographicGrid`), and selectable when a Parent curates new content.
- Four more resource types — `textbooks`, `audio_resources`, `comics`, and `drawing_activities` — alongside the existing ones, rendered as simple linked lists (`LinkResourceList`) on each subject's syllabus card and browsable in the Library tab and Parent curation form.
- An `info_cards` resource type: short, authored "Did You Know?" facts (one per subject per grade), rendered as a card grid (`InfoCardGrid`) — a quick, low-effort way for kids to pick up a fact between lessons. Unlike linked resources, these are short factual statements written directly into the syllabus rather than external links, the same way exam/quiz questions already are.
- A "Read aloud" button (browser `SpeechSynthesis` API, no external service) on books and videos, so younger children can have titles/descriptions read out loud.
- A "Favourites" feature: children can star any book, video, or infographic and revisit it from a dedicated Favourites tab. Stored per-child in `localStorage` (`favorites_<Child>`) — no backend persistence needed since it's a personal, non-graded bookmark list.
- A Parent-only "Overview" tab showing both children's exam scores and badges side by side, reusing the existing per-child progress endpoint.
- A "Study Timer" tab: a simple Pomodoro-style focus/break timer (25 minutes focus, 5 minutes break) for children to use while studying. Purely client-side, no backend persistence.
- A "Fact of the Day" tab: deterministically picks one `info_card` from across the current grade's subjects, rotating once per calendar day. Purely client-side (no new backend data) — it reuses the existing authored info cards rather than introducing any new content.
- A "Music" tab (`SafeMusicPlayer`) consuming the existing `/api/safe-music` endpoint, listing only entries marked `safe: true` from `backend/safe/safe_songs.json` (Super Simple Songs, Cocomelon, The Kiboomers — all verified real YouTube channels — and the Free Music Archive).
- **Data integrity fix**: every `channel_id` in `backend/safe/safe_channels.json` was previously incorrect (verified by resolving each ID against the real channel) — in one case (Khan Academy Kids) the old ID actually pointed to a different, unrelated channel. All IDs were re-verified and corrected, three more genuinely real children's-education channels (Cocomelon, The Kiboomers, SciShow Kids) were added, and `safe_songs.json`'s Super Simple Songs link (which had inherited the same wrong ID) was fixed to match.
- Backend tests (pytest, 107 passing) and frontend tests (Vitest + Testing Library, 41 passing).
- Docker Compose for local dev, plus a backend Dockerfile.
- A **Physical Education & Self-Defense** subject (all grades): video resources link to GoNoodle (free, kid-safe movement/exercise videos); text resources link to the NSPCC's "Talk PANTS" body-safety guidance, a genuinely real, vetted child-safety resource for the self-defense/personal-safety angle. **Survival Skills** also gained a video resource (Ready.gov's official Preparedness Videos) where it previously had none.
- Voice input (browser `SpeechRecognition`/`webkitSpeechRecognition` API, no external service): a microphone button on the Search tab and on each exam short-answer question, transcribing speech into the existing text input — pairs with the existing `SpeechSynthesis`-based "Read aloud" output.
- File upload support extended (`/api/upload-safe-book`) to accept PDF, TXT, PNG, JPG/JPEG, MP3, and WAV files (previously TXT/PDF only); PDF and TXT contents are still extracted and run through the safety filter before being accepted.
- Export/download support in multiple formats: a child's progress report as CSV or PDF, an exam result as PDF, and a grade's curated syllabus as JSON or CSV — all generated server-side (`reportlab` for PDF, plain CSV/JSON for the rest) and downloadable via buttons in the Progress Dashboard, Exam result screen, and Parent Curation page respectively.
- More famous literature and art: one additional Project Gutenberg classic per grade added to **World Literature** (*Alice's Adventures in Wonderland*, *The Wonderful Wizard of Oz*, *The Jungle Book*, *Robinson Crusoe*, *Gulliver's Travels*, *The Adventures of Sherlock Holmes*, *The Odyssey*, *Romeo and Juliet*, *Don Quixote*, *Moby-Dick* for grades 1–10 respectively), plus **Google Arts & Culture** and **Smithsonian Open Access** added to the **Art** subject's text resources (previously only on General Knowledge) and a tiered "Famous Painting" info card per grade.
- All ten grades, K-12-equivalent, now real and populated (`backend/syllabus/grade1.json` through `grade10.json`). Grades 9-10 reuse the same verified, real sources as earlier grades, pointed at next-difficulty pages (e.g. Khan Academy's "Algebra 2"/"Precalculus" instead of "Algebra 1", CK-12's Biology/Chemistry FlexBooks instead of Physical Science, BBC Bitesize's GCSE specs instead of KS3, Khan Academy's "World History Project (AP)" alongside the existing KS3 history resources, and Project Gutenberg editions of *Pride and Prejudice*, *Frankenstein*, *Great Expectations*, and *A Tale of Two Cities* for English/World Literature).
- `full_install.py`: a one-command installer that checks the Python version, creates the backend virtualenv and installs its dependencies, installs Node.js automatically via the OS package manager (Homebrew/apt/winget) if `npm` isn't already on PATH, runs `npm install` for the frontend, writes a launcher script (`start_edu_ai.bat`/`.sh`) that starts both dev servers and opens the app in a browser, creates a desktop shortcut to that launcher — checking both the normal user Desktop and a OneDrive-redirected Desktop (`%OneDrive%\Desktop` or `~/OneDrive/Desktop`) and creating a shortcut in each one that exists, since Windows' OneDrive "Known Folder Move" feature commonly redirects the Desktop folder there — and finally launches the app immediately so there's nothing left to click.
- `.github/workflows/ci.yml`: runs backend pytest and frontend Vitest+build on every push/PR.
- `vercel.json` / `render.yaml`: deploy configs for hosting the frontend on Vercel and the backend on Render.

What's **not** built yet (left for future iterations): additional subjects beyond the current set, karaoke/singing, and games.

### A note on Islamic Studies

Islamic Studies content links to **BBC Bitesize's Religious Studies** section (a long-established, editorially reviewed, neutral educational resource used in UK schools) and, for grades 5–6, **Quran.com** as a primary-source reference. No original religious commentary was written for this app — every claim a child sees comes from one of those two vetted, real sources, not from fabricated text.

### A note on World Literature, Art, and the new resource types

`World Literature` and `Art` were added as full subjects across grades 1–6, and four new resource-type categories (`textbooks`, `audio_resources`, `comics`, `drawing_activities`) were added across every subject. As with everything else in this app, every new array is either populated from a genuinely real, free source or left empty rather than fabricated:

- **World Literature**: books and comics link to Storyweaver (Pratham Books) and Project Gutenberg world classics (Grimm's Fairy Tales, Aesop's Fables); audio links to LibriVox. There is no honest free *textbook* or dedicated *video* source for this subject, so those arrays are intentionally empty.
- **Art**: video links to BBC Bitesize Art and Design (and, for grades 5–6, Khan Academy Art History); comics use Make Beliefs Comix; drawing activities use Crayola's free colouring pages. There is no honest free *book*, *audio*, or *textbook* source for this subject, so those arrays are intentionally empty.
- **Math** and **Science** gain `textbooks` (CK-12) and `drawing_activities` (Crayola); **English** gains `comics` (Make Beliefs Comix) and `audio_resources` (LibriVox); **Geography** and **World History** gain `drawing_activities` (Crayola).
- **Islamic Studies** gains `audio_resources` linking to Quran.com's recitations, but `comics` and `drawing_activities` are intentionally left empty for this subject — out of respect for the norm against cartoon/illustrated depictions in a religious-studies context, not because no source exists.
- **Coding** intentionally has no `textbooks`, `audio_resources`, `comics`, or `drawing_activities` — its existing resources (Code.org, Scratch) are interactive tools, and no honest free source for those formats fits a coding subject built around them.

### A note on Grade 8

Grade 8 reuses the same vetted, real sources as grades 1–7 (CK-12, Khan Academy, BBC Bitesize KS3, Project Gutenberg, Quran.com, Code.org/Scratch, Classics for Kids/musictheory.net/IMSLP, Ready.gov Kids, USDA MyPlate/KidsHealth, Wonderopolis/Google Arts & Culture/Smithsonian, Loecsen), pointed at their next-difficulty pages (e.g. Khan Academy's "Algebra 1"/"Geometry" instead of "Pre-Algebra", CK-12's Algebra/Physical Science instead of Middle School Math/Earth Science) rather than fabricated grade-8-specific URLs. Grades 9–10 are left for a future iteration, built the same deliberate way.

### A note on Grades 9-10

Grade 9 reuses the same vetted, real sources as grades 1-8, pointed at their next-difficulty pages: Khan Academy's "Algebra 2" (instead of "Algebra 1"), CK-12's Biology FlexBook (instead of Physical Science), BBC Bitesize's GCSE Biology and English specs (instead of KS3), and Khan Academy's "World History Project (AP)" added alongside the existing KS3 history resources. English and World Literature gain *Pride and Prejudice* (Jane Austen) and *Frankenstein* (Mary Shelley), both via their real Project Gutenberg editions.

Grade 10 continues the same pattern one level further: Khan Academy's "Precalculus" (instead of "Algebra 2"), CK-12's Chemistry FlexBook (instead of Biology), and BBC Bitesize's GCSE Chemistry spec. English and World Literature gain *Great Expectations* and *A Tale of Two Cities* (both Charles Dickens), again via their real Project Gutenberg editions. With Grade 10 in place, all ten grades now have real, populated syllabus data.

### A note on Foreign Languages

A **Foreign Languages** subject was added across grades 2–8 (mirroring Coding's "starts at grade 2" pattern, since reading is needed). Its `audio_resources` link to [Loecsen](https://www.loecsen.com/), a free, no-signup, native-speaker-recorded beginner course, covering French, Spanish, German, Estonian, Mandarin Chinese, and Arabic. No video/book/textbook source was identified that's both free and verifiably real for this subject across all six languages, so those arrays are intentionally empty rather than guessed at.

### A note on the General Knowledge quote and info cards

Every grade's **General Knowledge** subject now includes four additional authored `info_cards`, varied per grade rather than duplicated: a real, accurately attributed philosophical quote, a real famous quote, a short fact about a real famous person ("Famous Person: ..."), and a short summary of a real, published non-fiction book ("Book Summary: ..."). As with every other authored fact in this app, these are real and correctly attributed — not invented — covering figures and works such as Marie Curie, Albert Einstein, Nelson Mandela, Ada Lovelace, Ibn al-Haytham, *Silent Spring* (Rachel Carson), *A Brief History of Time* (Stephen Hawking), *The Diary of a Young Girl* (Anne Frank), and *Sapiens* (Yuval Noah Harari).

### A note on Music, Survival Skills, and General Knowledge

Three new subjects were added across grades 1–7 (Survival Skills from grade 3 onward, mirroring the existing "Coding from grade 2" pattern), and every grade's `Art` subject now includes the Khan Academy Art History video resource (previously grade 5–6 only) so Art and Art History are merged everywhere rather than split by grade:

- **Music**: `text_resources` link to Classics for Kids and musictheory.net Lessons; `audio_resources` link to the Free Music Archive's free, legal recordings; `textbooks` link to the IMSLP Petrucci Music Library for grade 5+ (its scores assume an older reader). There is no honest free *video* source identified for this subject, so `video_resources` is intentionally empty rather than guessing at a BBC Bitesize Music URL that couldn't be verified.
- **Survival Skills** (grade 3+): `text_resources` link to Ready.gov Kids (FEMA), a vetted official source for age-appropriate emergency preparedness content. No honest free *video*, *audio*, or *book* source was identified, so those arrays are intentionally empty.
- **General Knowledge**: `text_resources` link to Wonderopolis (National Center for Families Learning) and National Geographic Kids. Designed to be interactive via several authored `info_cards` per grade plus a dedicated `quiz_bank` and `exam`, reusing the same mechanics already used elsewhere in the app rather than introducing new UI.
- **World Literature** also gained two additional public-domain classics per grade, spread by reading-level complexity (e.g. *The Tale of Peter Rabbit* and *The Velveteen Rabbit* for grades 1–2; *A Little Princess* and *Peter Pan* for grades 3–4; *Black Beauty* and *Treasure Island* for grades 5–6; *Around the World in Eighty Days* for grade 7), each linking to its real Project Gutenberg edition.
- **Cooking** (grade 3+, mirroring Survival Skills' grade-3 start): `text_resources` link to USDA's MyPlate Kitchen and KidsHealth's Recipes section — both vetted, free, official/non-profit sources for kid-appropriate nutrition and recipe content. No honest free *video*, *audio*, or *book* source was identified, so those arrays are intentionally empty.
- **General Knowledge** also gained one authored fact per grade about a famous world landmark (Eiffel Tower, Great Wall of China, the pyramids of Giza, Taj Mahal, Sydney Opera House, Machu Picchu, the Colosseum), plus links to **Google Arts & Culture** and **Smithsonian Open Access** — both real, free, curated platforms for exploring world art, architecture, and museum collections firsthand, rather than embedding specific scraped images. No nude classical sculpture/painting is referenced directly in this app's authored text; that content, where it exists, lives only inside those platforms' own editorial curation.

### A note on Social Studies and Environmental Science

Two new subjects were added across all ten grades (1–10), bringing the per-grade subject count to 16:

- **Social Studies**: `video_resources` link to Khan Academy's US Government and Civics course for every grade, plus Khan Academy's AP US Government & Politics for grades 8–10. Authored `quiz_bank`/`exam` content scales with grade (community helpers and voting for grades 1–3; constitutions and civic responsibility for grades 4–7; checks and balances for grades 8–10). No honest free *book*, *audio*, or *text_resource* source covering citizenship/civics for young readers was identified, so those arrays are intentionally empty.
- **Environmental Science**: `video_resources`/`textbooks` link to CK-12's free Earth Science Essentials and Middle School Earth Science FlexBook for every grade, plus Khan Academy's AP Environmental Science course for grades 8–10. Authored content scales similarly (recycling and trees for grades 1–3; pollution and renewable resources for grades 4–7; the greenhouse effect and sustainability for grades 8–10).

### A note on Physical Education & Self-Defense

A new **Physical Education & Self-Defense** subject was added across all ten grades. `video_resources` link to [GoNoodle](https://www.gonoodle.com/), a free, widely-used kid-safe movement/exercise video platform; `text_resources` link to the NSPCC's ["Talk PANTS"](https://www.nspcc.org.uk/advice-for-families/pants-underwear-rule/) body-safety guidance — a real, established UK child-safety charity resource, used here for the "self-defense" angle rather than any invented martial-arts curriculum. No honest free *book*, *audio*, or *textbook* source was identified for this subject, so those arrays are intentionally empty. The existing **Survival Skills** subject also gained a `video_resources` entry (Ready.gov's official Preparedness Videos) where it previously had none.

### A note on voice input, file uploads, and exports

- **Voice input**: uses the browser-native `SpeechRecognition`/`webkitSpeechRecognition` API (Chrome/Edge/Safari support it; no external speech service, no audio leaves the device for this feature) to fill in the Search box and exam short-answer fields by speaking. Where the API isn't available (e.g. Firefox), the microphone button simply doesn't render — there's no broken fallback UI.
- **File uploads**: `/api/upload-safe-book` now accepts PDF, TXT, PNG, JPG/JPEG, MP3, and WAV files (previously just PDF/TXT). Image and audio files are accepted by extension/safety-checked filename only (there's no honest way to "read" unsafe content out of a JPG or MP3 server-side without a vision/audio-transcription model, which this app doesn't add); PDF and TXT files still have their text extracted and run through the same safety filter as everything else.
- **Exports**: progress reports (CSV/PDF), exam results (PDF), and curated syllabus data (JSON/CSV) can all be downloaded via buttons in the Progress Dashboard, Exam result screen, and Parent Curation page. All are generated from the same data already shown in the UI — no new content is introduced, just a different output format.

### A note on Economics, Finance, First Aid, and method-centric Cooking

- **Economics** and **Finance** (grades 8–10, new subjects): Economics' `video_resources` link to Khan Academy's Microeconomics/Macroeconomics/AP Macroeconomics/AP Microeconomics courses; Finance's `video_resources` link to Khan Academy's Personal Finance course, with `text_resources` linking to Practical Money Skills (Visa's free financial-literacy site) and Investor.gov (the U.S. SEC's free investor-education site). Authored `info_cards`/`quiz_bank`/`exam` content covers core concepts (scarcity, opportunity cost, GDP, budgeting, compound interest, credit) the same way every other subject's quiz/exam content is authored directly rather than scraped.
- **First Aid** (grades 8–10, new subject): `text_resources` link to KidsHealth's teen safety section and the American Red Cross's First Aid classes page — both real, established child-safety/first-aid resources. No honest free *video* or *book* source for this subject was identified, so those arrays are intentionally empty.
- **Cooking** is now method-centric: each grade 3–10 introduces one cooking technique — Boiling (3), Frying (4), Baking (5), Steaming (6), Stir-frying (7), Grilling/BBQ (8), Roasting (9), Sautéing (10) — with a `text_resources` link to that technique's real Wikibooks Cookbook page, an authored info card explaining the science behind it, and a quiz question, layered on top of the existing MyPlate/KidsHealth/Wikibooks Cookbook resources (nothing removed).

### A note on the additional parent profiles, lesson streaks, mini-checks, and adaptive practice

- **Two new parent profiles**: **Shovan** (dad) and **Bely** (mom) join the existing **Parent** profile as selectable, learner-content-free profiles (`backend/app/storage.py`'s `PARENT_PROFILES`, mirrored by `isParentProfile()` in `frontend/src/contexts/ChildContext.jsx`). Like **Parent**, they see the Overview/Library/Search/Curate tabs but have no progress record of their own.
- **Lesson streaks/badges**: completing at least one lesson on consecutive calendar days now builds a streak (`lesson_streak_dates`/`lesson_streak` in each child's progress record), shown in the Progress Dashboard as "🔥 N-day lesson streak". Reaching 3, 7, 14, or 30 days awards a `lesson-streak-N` badge, alongside the existing exam-pass badges.
- **Per-lesson mini-checks**: the Learn/Watch/Explore lesson stages now show a short comprehension question (reusing that subject's existing `quiz_bank` — no new content authored) instead of a plain "Mark lesson complete" button; the lesson is marked complete only after answering correctly. Subjects without a `quiz_bank` keep the original plain button, so nothing regresses.
- **Adaptive practice queue**: the ungraded Practice stage (`PracticeQuiz`) now tracks, per child and per subject in `localStorage`, which questions were answered incorrectly, and resurfaces those missed questions first the next time the Practice stage is opened, until answered correctly.
- **Reading-level adaptation**: after an exam, if the score was below 60% (and a lower grade exists) or 90%+ (and a higher grade exists), the subject card shows a one-click suggestion to switch to that subject in the adjacent grade — reusing the grades' existing, already-curated real content rather than fabricating any new "difficulty" tag or content.

### A note on the expanded World Literature classics, the Quran, and the Art/General Knowledge additions

Each grade's **World Literature** list gained a handful of additional classics, distributed by reading level (lower grades get simpler titles, higher grades get more advanced ones), plus a Quran entry. For these titles we couldn't responsibly guess an exact Project Gutenberg ebook ID without risking a broken or wrong link, so each new classic links to Project Gutenberg's own **search results page** for that title and author — always a real, live URL, rather than a fabricated direct link. The Quran is included as `quran.com`, the standard free, accurate online source for the text.

Each grade's **Art** subject also gained one authored `info_cards` entry per grade for a real, famous painting, sculpture, or photograph (rotating through a curated pool, so every grade sees something different over time), and **General Knowledge** gained one additional authored "Book Summary" card per grade for a real, published non-fiction book. As requested, this content was explicitly curated to be child-safe: well-known but unsuitable works (nudity in classical paintings/sculpture, or violent/distressing photographs) were deliberately excluded from the pool in favor of safe, iconic alternatives (e.g. *Earthrise*, *The Blue Marble*, *Migrant Mother*, the Statue of Liberty, Mount Rushmore). As with art elsewhere in this app, no images are reproduced — only the real title and creator, as a short factual attribution.

Given the scale of "200 classics / 200 paintings / 100 sculptures / 200 photographs / 200 non-fiction summaries" originally requested, and this app's standing rule against fabricating unverified content, this was built as a real but intentionally curated subset rather than an attempt to hit those exact counts — confirmed with the project owner before implementation. World Literature was later expanded further to 50 real classics per grade, again all via honest Project Gutenberg search links.

### A note on topic-wise lessons and the subject dropdown

The Subjects tab now shows one subject at a time, chosen from a dropdown, instead of every subject stacked on one long page. Each subject is broken into a sequence of lessons built from its existing resources — no new content is fabricated, the existing books/videos/info cards/exam are just grouped and gated:

1. **Learn** — books, textbooks, and text resources
2. **Watch** — videos and cartoons (skipped if a subject has none)
3. **Explore** — info cards, infographics, audio, comics, and drawing activities
4. **Practice** — a no-pressure, ungraded run through the subject's `quiz_bank` questions, with a "Show answer" toggle per question (skipped if a subject has no quiz bank)
5. **Show what you know** — the subject's exam (if it has one)

A lesson is locked until the previous lesson is marked complete; the child clicks **"Mark lesson complete"** after engaging with a lesson to unlock the next one. Completed lessons are tracked per child per subject in their progress record (`completed_lessons`), the same file that already stores scores and badges, via the existing `POST /api/progress/{child}` endpoint. Each lesson's intro text was also expanded with a bit more guidance on what to do at that stage and why it helps before moving on.

### A note on the expanded paintings, sculptures, and per-grade textbooks

The Art subject's info cards now draw from a curated pool of 100 real, named paintings and 100 real, named sculptures, split into ten unique sets of ten paintings and ten sculptures — one set per grade, so the full pool is used exactly once across grades 1–10 with no repeats. As with the earlier classics/photography curation, every entry is a genuine, well-documented work with its real title and artist; nothing is invented, and the same child-safety exclusions apply (no nudity, no violent or distressing imagery) — a few well-known works that fail that bar (e.g. Michelangelo's *David*, Rodin's *The Thinker*, Goya's war paintings) were deliberately left out rather than relabelled to sneak them in.

Every subject in every grade now has at least one real `textbooks` entry, sourced from the relevant Wikibooks subject shelf (e.g. `Subject:Geography`, `Subject:Literature`, `Wikijunior` for General Knowledge, `Cookbook:Table_of_Contents` for Cooking, `Subject:Social_sciences` for Social Studies, and similar shelves for the rest) — all genuinely live, public, free pages. The one exception is **Physical Education & Self-Defense**, which still has no textbook: there is no honest, age-appropriate PE textbook shelf on Wikibooks (searches only turn up unrelated Physics pages), so — consistent with this project's standing rule — that field stays empty rather than pointing to a fabricated or mismatched source.

### A note on the custom PDF/DOCX export

The Parent Curation page now includes a **Customize export** form above the existing one-click JSON/CSV export buttons. It lets a parent pick specific subjects (leave all unchecked for "all"), specific resource types (same), and a format — PDF or Word (.docx) — then downloads a syllabus document built from only that selection, via `POST /api/grade/{standard}/export/custom`. Like the existing exports, this only reformats data already in the syllabus; no new content is introduced.

### A note on infographics and Pinterest

Pinterest pins are individual, user-posted content — URLs are not stable, and there's no reliable way to verify *in this environment* that a given pin is still live, kid-appropriate, and not just a screenshot of someone else's copyrighted graphic. Rather than fabricate Pinterest pin links, the pre-seeded `infographics` entries point to stable, official sources (Math Salamanders, ReadWriteThink) that are confirmed safe to link to long-term. If you want to pull in a specific Pinterest infographic (or any other one-off image resource), use the **Parent** account's Curate flow: search the web, review the result yourself, then add it — the same human-review step that gates every other resource in this app.

### Search and resource browsing (kid-facing, safe by construction)

- **Search tab**: a search box for children, but it never queries the open web. It calls `GET /api/search/{standard}?q=`, which only searches resources already present in that grade's `syllabus/grade<N>.json` and filters out anything not marked `safe: true`.
- **Library tab**: browses all books/videos/text resources/cartoons across every subject for the selected grade in one place, respecting Restricted Mode.

### Parent account: live web search + curation (parent-only)

Selecting **Parent** in the profile dropdown switches the app into a curation mode with its own tabs (`Library`, `Search`, `Curate`) — no exam, progress dashboard, or code editor, since those are learner features.

The **Curate** tab is the only place in the app that touches the open internet:

1. Parent types a search query and picks a grade/subject/resource type.
2. The frontend calls `GET /api/web-search?q=`, which performs a **live** web search via the [Brave Search API](https://brave.com/search/api/) (`backend/app/websearch.py`).
3. Raw results (title, URL, description) are shown for the parent to review — they are *not* shown to children and are *not* auto-saved.
4. Clicking "Add to syllabus" on a reviewed result calls `POST /api/curate-resource`, which runs the result through `backend/app/safety.py`'s blocked-word filter, force-sets `safe: true`, and appends it into the relevant grade's `syllabus/grade<N>.json` (creating the subject/file if it doesn't exist yet). Only after this step does the resource become visible to children.

**Setup required**: live web search needs a Brave Search API key (free tier available). Set it on the backend before running:

```bash
export BRAVE_SEARCH_API_KEY=your-key-here
```

Without this variable, `/api/web-search` returns `501` with an explanatory message — the rest of the app works fine, but the Curate tab's search will show that error until a key is configured. No key is bundled with this repo.

## Running locally

### One-command install (`full_install.py`)

```bash
python3 full_install.py
```

This creates the backend virtualenv and installs its dependencies, runs `npm install` for the frontend, writes a launcher script (`start_edu_ai.sh` on macOS/Linux, `start_edu_ai.bat` on Windows) that starts both dev servers and opens the app in a browser, and places a desktop shortcut to that launcher on every Desktop folder it finds — the normal user Desktop, and a OneDrive-redirected Desktop if one exists (common on Windows when OneDrive's "Known Folder Move" feature is enabled). On Windows, a real `.lnk` shortcut is created if [pywin32](https://pypi.org/project/pywin32/) is installed (`pip install pywin32`); otherwise a `.bat` launcher is copied to the Desktop as a fallback. Re-running it is safe — it skips creating the virtualenv if one already exists and overwrites the launcher/shortcuts.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export BRAVE_SEARCH_API_KEY=your-key-here  # optional, enables Parent web search
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies `/api/*` to `http://localhost:8000` (see `vite.config.js`).

### Docker Compose

```bash
docker compose up
```

## Tests

```bash
# backend
cd backend && .venv/bin/python -m pytest

# frontend
cd frontend && npm test
```

## Parental Control Panel

Click the 🔒 icon in the header to open the panel. **Restricted Mode** hides any resource that isn't explicitly marked `safe: true` (or has `safe: false`), checked client-side via `frontend/src/utils/safetyFilter.js` and mirrored server-side via `backend/app/safety.py`, which also sanitizes any blocked words found in syllabus text before it reaches the client.

This is independent of the **Parent profile** described above — the lock-icon panel controls what's visible to whichever child profile is currently selected; the Parent profile is a separate account used only for finding and approving new content.

Per-child progress, scores, and badges are stored server-side under `backend/data/progress_<Child>.json` (gitignored — generated at runtime) and fetched through `/api/progress/{child}`. The Parent profile has no progress file — it isn't a learner.

## Adding new resources

Two ways to add resources:

1. **Manually**: edit the relevant `backend/syllabus/grade<N>.json` file directly. Every resource (book, video, cartoon, text) must include a `"safe": true` field to be visible in Restricted Mode.
2. **Via the Parent curation flow**: switch to the Parent profile, search the live web, review results, and click "Add to syllabus" — this writes the resource into the right grade's JSON file automatically with `safe: true` already set, after passing the profanity/safety filter.

Approved video channels are tracked in `backend/safe/safe_channels.json`; only add channels appropriate for children.

## Contributing

Keep additions grade/subject-scoped and verify URLs point to genuinely free, public resources before adding them — don't fabricate links or ratings.
