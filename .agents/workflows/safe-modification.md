---
description: Mandatory workflow for every task - safe minimal code modification rules
---

# Safe Modification Rules

## BEFORE writing any code:
1. **Analyze ALL files** in the relevant system before making changes
2. **Explain** how the current system works to the user
3. **Show plan** and get user approval before proceeding to code changes

## ASSET RULES (CRITICAL):
1. **NEVER delete or regenerate** existing asset files (images, sprites, backgrounds)
2. If an asset already exists in the assets folder, **DO NOT recreate it**
3. Only fix **missing references** — connect existing assets to code
4. **DO NOT change** the existing folder structure
5. All images should be loaded from their current locations:
   - `assets/sprites/` — character and enemy sprites
   - `assets/maps/` — map background layers
   - `Buz_magarası/` — ice cave specific assets
   - Root level PNGs (e.g., `neonsehir_harita.png`)

## CODE CHANGE RULES:
1. Make the **minimum necessary changes** to fix the issue
2. Do not refactor unrelated code
3. Preserve all existing functionality
4. Test changes before reporting completion
