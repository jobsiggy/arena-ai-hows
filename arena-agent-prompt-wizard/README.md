# Arena AI Agent Prompt Wizard

Free, static, interactive web app that helps developers build the ultimate prompt for the
Arena AI Agent (Arena Agent Mode), plus tools to develop evals and rubrics that guarantee
top-quality agent outputs.

## Try it

Open `index.html` in any browser, or host it on GitHub Pages / Vercel (fully static, zero
dependencies).

```bash
python3 -m http.server   # from this folder, then open http://localhost:8000
```

## What it does

- **Wizard interview** — guided steps (Task type → Prompt Brief) that build a self-contained
  Arena prompt: objective & definition of done, required deliverables, done criteria, context
  & ground truth, technical/style constraints, tool & execution boundaries, phased plan, output
  contract.
- **Live Prompt Brief preview** — the rendered prompt updates as you answer; "Copy Prompt
  Brief" copies it to the clipboard.
- **Send to Arena** — opens `arena.ai/agent` so you can paste the prompt.
- **Eval & Rubric Tools** — generate a rubric markdown (criteria, scales, pass thresholds),
  a self-contained Arena prompt spec, and the output contract.
- **Template Library** — copy the Prompt Brief Template, Arena Prompt & Guardrails Spec,
  Eval & Rubric Design Template, and Phased Execution Plan with one click.
- **Animated steps** — fade/slide transitions, progress bar, reduced-motion friendly.

### New: research-backed tools

- **Arena Signals Reference** — the Agent Arena signals (Confirmed Success, Praise vs. Complaint, Steerability, Bash Reliability, Tool Hallucination, plus the newer UA/FA/DC Alignment Index signals) with definitions and the prompt implications for each.
- **Prompt Quality Checker** — paste any prompt (or check the live wizard prompt) and get an automated pass/fail checklist against Arena best practices.
- **Best-of-N Runner** — generate N-run packs of the prompt for best-of-N execution in Arena (Arena assigns models randomly per chat, so N runs of the same prompt is the practical way to get more model diversity).
- **Export** — export the Prompt Brief (.md) or the wizard state (.json).

State is saved in your browser's localStorage and is reset via the "Reset wizard" button.
