---
description: Mandatory workflow for every task - safe minimal code modification rules
---

# Safe Modification Workflow

**This workflow MUST be followed for every task. No exceptions.**

## CRITICAL RULE
This is an EXISTING project. You are NOT allowed to rewrite the entire codebase.
You must ONLY modify the parts that are required for the requested feature.

### DO NOT:
- Delete existing systems
- Rewrite large sections of code
- Change working mechanics
- Rename important variables
- Modify unrelated files

---

## STEP 1 — ANALYZE
First analyze the existing code and identify:
- How the relevant system works
- Where the relevant controller/logic is implemented
- Which script controls the behavior being modified

Explain findings briefly before writing any code.

## STEP 2 — PLAN
Before writing code, explain the modification plan:
- Which function will be changed
- Which variables will be added
- Why the change is safe

## STEP 3 — MINIMAL CODE CHANGE
Write ONLY the necessary code modification.

Rules:
- Keep the current architecture
- Modify the smallest possible amount of code
- Do not remove existing features

## STEP 4 — SAFETY CHECK
Verify that changes do not break:
- Player movement
- Shooting system
- Enemy behavior
- Collision system
- Any other existing gameplay system

## STEP 5 — OUTPUT
Response must contain:
1. Analysis
2. Modification plan
3. Code changes
4. Explanation of how it works

## IMPORTANT
If not 100% sure about something, ask a clarification question instead of guessing.

## GOAL
Extend the project safely without breaking existing gameplay systems.
