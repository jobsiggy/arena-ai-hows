# Arena AI Agent Mode — Prompt, Plan, Goal & Context Examples

Arena Agent Mode (arena.ai) gives the agent built-in tools: web search, image generation, file upload, coding help, a bash sandbox for running/testing code, and file writing. A good Arena prompt is a *minimum viable task spec*: **goal, hard constraints, permissions, definition of done**, plus context so the agent can work autonomously. Based on Arena's Agent Mode description and public guidance on tool-using agents.

## 1. Anatomy of a good Arena prompt

| Part | What to write |
|---|---|
| Goal | One sentence of the outcome you want. |
| Definition of done | How you'll know it's finished, with verifiable evidence. |
| Context | Absolute paths of relevant files, audience, stack, conventions, data. |
| Hard constraints | What must not change, what must be used, scope limits. |
| Permissions | What the agent may change; irreversible actions should be excluded or gated by you. |

## 2. Examples

### Example A — build a small business website (Arena's core use case)

Bad:

```
Build me a small business website.
```

Good:

```
Build a responsive one-page marketing site for "Maple & Ash", a small bakery in Asheville.

Where to put things:
- Create the site in `site/`; do not modify anything outside it.

Requirements:
- Sections: hero, menu, about, contact.
- A link to "220 Oak Street, Asheville" (Google Maps) and an email link to hello@mapleash.bakery.
- Warm palette (cream, terracotta, sage). No stock images.

Constraints:
- Self-contained: plain HTML/CSS/JS, no framework or new dependencies.
- Must render correctly from 375px to 1440px wide.

Definition of done:
- All files are in `site/` and the page opens with `python3 -m http.server` from the repo root.
```

### Example B — refactor in a GitHub-connected repo

Bad:

```
Let's improve the payment module — what do you think?
```

Good:

```
Refactor the payment module to use the strategy pattern. Update all tests so they pass after the change.
```

### Example C — deep research

Bad:

```
Research AI agents.
```

Good:

```
Research AI agents. Goal: a 1200-word digest in markdown at `docs/ai-agents.md`. Sources: the frameworks named in [2] and [3] on Arena's Agent Arena page. Definition of done: TL;DR (3 bullets), ranked list of the 10 best-known frameworks with links, short risks section.
```

### Example D — document from data

```
Draft a one-page onboarding doc for new hires from `/abs/path/team.md` and `/abs/path/policies/`:
Format: bullet points only, ≤ 300 words. Must cover: first day, tools we use, team norms, where to find things.
```

## 3. Goal / definition-of-done examples

- "All tests pass."
- "The page renders correctly at both mobile (375px) and desktop widths."
- "The report covers Q1 revenue by region, and every number cites its source."
- "The output zip contains the 4 deliverables listed below."
- "The deployed preview at <url> loads without errors and the mobile viewport looks right."

## 4. Plans

Arena's agent writes its own plan from your prompt — write prompts so the plan is on-target. If you want to review it first, add to the prompt: "First present your plan as a short list; wait for my approval before executing."

## 5. Context

- Upload files in the Arena prompt; absolute paths help the agent read them.
- Connectors (Arena offers Vercel, Supabase, Drive, Dropbox, Docs/Sheets/Slides, Linear, Gmail, Calendar, Notion, GitHub). With a connector on, you can say: "Pull my product spec from Notion and list the 3 highest-priority gaps vs. the current MVP."

## 6. Evals — make sure the agent performs at its best

### Arena's public signals (Agent Arena leaderboard)

| Signal | What it scores |
|---|---|
| Confirmed Success | You answer "yes" to a pop-up asking "Did this complete your task?" — no partial credit. |
| Praise vs. Complaint | More unprompted praise than complaints in the session. |
| Steerability | Steering effort per turn: none, low (one correction that lands), high (repeated). |
| Bash Reliability | Agent-caused bash failures per call; searches that find nothing count as successes. |
| Tool Hallucination | Rate of calls to nonexistent tools, bad signatures, or claimed capabilities the agent lacks. |

Two Arena-observed failure patterns to watch for: "Bluffing" (incomplete work presented as complete) and "Bluster" (assertive pushback that melts under pressure).

### Practical self-evals per session

1. **STATE CHECK** — define what "done with verifiable evidence" means for this agent.
2. **TOOL VERIFICATION** — record which tools it calls; define what a fallback or wrong result looks like for each; when outputs are sets of items, verify the whole set and report the count, not a sample.
3. **IRREVERSIBLE-ACTION GATE** — list irreversible actions it can take; require a gate (you or a permission) for spend, deletion, email, deploy, etc.
4. **CONSTRAINT CARRY-THROUGH** — pick the 3 constraints most likely to drift across a long session and find a way to confirm each across the entire output.

### Representative eval set

Include: common inputs; edge cases (empty/malformed); missing information; conflicting instructions; long context; tool failures; malicious/foreign content; operations that should be refused or paused.

### Generic agent eval dimensions (tool-using agents)

Goal success; tool selection; tool arguments; action safety; state correctness; handoff correctness; failure recovery; verification; completion; efficiency (turns/tool calls); latency; cost.

## 7. Caveats

- Arena picks an orchestrator model at random each chat and does not reveal it; you cannot choose or request a model.
- Arena says prompts may be shared with model providers and research datasets after de-identification — keep sensitive data out of prompts.
