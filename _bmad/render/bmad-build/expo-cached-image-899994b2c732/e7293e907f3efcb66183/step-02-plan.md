# Step 2: Plan

## RULES

- No intermediate approvals.
- **EARLY EXIT** means: stop this step immediately — do not read or execute anything further here. Read and fully follow the target file instead. Return here ONLY if a later step explicitly says to loop back.

## INSTRUCTIONS

1. Draft resume check. If `{plan_file}` exists with `status: draft`, read it and capture the verbatim `<frozen-after-approval>...</frozen-after-approval>` block as `preserved_intent`. Otherwise `preserved_intent` is empty.
2. Investigate the codebase. When you can, send deep searches to subagents and wait for them in this turn. Tell them to return short summaries only, so this session does not fill up with their notes. Keep only what the work needs: the specific files, symbols or lines, what to reuse, and what not to change. Write that into the Code Map. Do not retell the investigation when implementation starts — the plan already has it.

   Treat a codebase research document as evidence for this investigation, read at its `commit`. Before the plan uses a claim from it, re-check it against the current code when the plan rests on it or its cited file changed since that commit (`git diff --stat <commit> -- <path>`). Investigate afresh any claim that no longer holds.

   Do not ask the human during investigation. When something is unclear, look in the ticket and the companions it names, or the planning documents loaded without one, then the repository or history. Keep looking until you know, or until those sources have nothing more to say. Leave any remaining choice for the next step.

   Then score the change's `risk` for `{plan_file}` frontmatter: `low`, `medium`, or `high`, the business impact if this change is wrong. For a ticket from the tree, start from `risk` in `tickets.py find`'s output and raise it when the investigation shows more; go below it only when the user says so. Write `risk` wherever this step writes `{plan_file}`.
3. Read `/Users/dmitry/hacks/wisaw/expo-cached-image/_bmad/render/bmad-build/expo-cached-image-899994b2c732/e7293e907f3efcb66183/plan-template.md` fully and write `{plan_file}`.
   Set `route: 'oneshot'`, `route_source: 'pinned'`, and `status: 'in-progress'`, resolving `date` to the current system date.
   If `preserved_intent` is non-empty, use it as the frozen block.
   **EARLY EXIT** → `/Users/dmitry/hacks/wisaw/expo-cached-image/_bmad/render/bmad-build/expo-cached-image-899994b2c732/e7293e907f3efcb66183/step-oneshot.md`.
