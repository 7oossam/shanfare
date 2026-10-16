# الشنفرى — مورد الظلال

One complete Arabic, mobile-responsive tactical deckbuilder encounter. Version 4 adds an opt-in, fixed-seed lure encounter to test committed attacks and card sacrifice while retaining the previous encounter and saves.

## Run
Serve `dist/` from any static HTTP host. There are no runtime JavaScript dependencies. Optional Google Fonts have Arabic system-font fallbacks.

## Encounter rules
- 48 health, 3 energy and 5 cards per turn. Tracker: 35 health; archer: 29 health. Five positions.
- Bow attacks have a close-contact alternate mode: lower-damage bow-handle strike that pushes an enemy into a free tile behind it. Aimed ranged shots require standing still; melee use does not.
- Runner's leap is an always-visible action, independent of drawing movement cards: discard any card, gain 1 strain, and choose any empty destination within three positions. It can cross enemies, costs zero energy, and is limited to once per turn. Wear cards can pay the discard cost. Canceling before destination selection spends nothing.
- Rock at both ends reduces incoming enemy arrow damage by 3. The cover card provides 5 block in sand and 8 at rock.
- Move then hit a surviving enemy, or mark it with Tracking then hit, to trigger the wolf's 5-damage follow-up, once per turn. A mark persists until consumed. The wolf is a physical companion rather than a magic summon.
- Sand blinds an adjacent opponent, reducing its attack by 6 and dealing 2 damage. Arrow recovery returns the latest discarded bow card, drawing one card only if none exists.
- Exert once per turn for 2 energy and 2 strain. Every positive strain increase ending at strain 4+ adds one wear card to the discard pile. Breath reduces strain by 2.
- Drink once per turn for 1 energy: heal up to 3 health and remove up to 3 strain, consuming a finite water charge. Default two charges.
- Block expires at the beginning of the player's next turn. Hands discard and draw five; exhausted draw piles reshuffle. The forecast uses the same move/block/damage calculation as enemy resolution.

## Replay choices
Three approaches have the same 18-card pool but different starting positions and opening hands: ridge/aimed bow, wolf trail/tracking, and valley/knife and sand.
Victory keepsakes have a real effect in subsequent attempts: first wolf follow-up +3, first ranged bow hit +3, or one extra water charge. Only one selected keepsake is active.

## Save compatibility
The existing v1 local-storage key is retained. Valid v1 attempts migrate to v2 without replacing their health, hand, deck, position or progress. New fields are initialized in place. Save files remain entirely browser-local.

## Source and art
- `dist/engine.mjs`: deterministic serializable rules, migrations, forecast.
- `dist/app.js`: compact portrait UI, selected-card/skill confirmation, enemy-panel targeting, animation, sound and local saves.
- `dist/presentation.mjs`: pure previews using real engine actions on cloned state; no side effects or RNG advancement.
- `dist/index.html`, `dist/style.css`: responsive Arabic interface and reduced-motion support.
- `dist/assets/oasis.webp`: original generated moonlit Arabian canyon/well background.
- `dist/assets/characters.png`: original generated four-character atlas, consumed via SVG viewports.
- Card glyphs are authored SVG. Existing artwork is preserved in v3.

## Verification
`node tests/encounter.test.mjs`

`node tests/presentation.test.mjs`

`node tests/ui-events.test.mjs`

21 rule suites pass, including all 60 legal two-enemy formations for zero-energy escape, 60 exact forecasts, movement rejection atomicity, melee fallback, push blockage, marks, deck conservation, limited resources, keepsake effects and v1 save migration.
60 complete tactical-search playthroughs across all three approaches win in 3–4 turns. These are automated rule tests, not a claim of human balance validation.
60 card/target preview cases match the actual rules. Canceled previews do not change the saved encounter. DOM-free event smoke tests execute the real UI handlers for selecting/canceling, defense confirmation, leap preview and confirmation, enemy-panel attacks and menu dismissal. These do not verify rendered layout or real touch.

JavaScript syntax and static DOM/asset checks pass. Browser automation is unavailable in this environment; visual and touch QA remain unverified. Native app packaging and campaign content are outside this single encounter.

## Portrait UI
The application uses the dynamic viewport height with a compact header and fixed HUD/intent/action/hand rows; the arena receives remaining space. Only the hand scrolls horizontally in standard portrait mode. Short portrait screens have smaller rows; short landscape screens use a vertically scrollable layout.

Enemy intent/health live on solid panels instead of on top of background art. Selecting an attack previews exact damage, remaining enemy health and incoming damage for each valid target; tapping its panel or sprite executes. Nontarget cards, water and exertion show a preview then require confirmation. Leaps preview a destination and route before confirming. Defeated enemies have an explicit fallen marker and status panel. Health fractions are direction-isolated. The previous local save key and game mechanics are retained.

## Lure encounter: a bounded decision experiment
Entry: `?trial=lure` or the in-game menu. Starting it backs up the existing encounter; the menu can restore that attempt.

The fixed setup starts with 18 health, 3 energy, five known cards, a 35-health tracker and a 13-health archer. No previous keepsake applies. Every replay uses seed 424242. Player and enemy positions still use the original five-slot board; this experiment does not claim that zones are automatically more fun.

Enemy plans (origin, destination, target cells and damage) are frozen at the beginning of a player turn. Player movement cannot retarget them. The tracker commits to a lunge across two cells; the archer alternates a retreat-covering volley and a shot at the old player position. Pushing an enemy away from its announced origin interrupts that attack. Plans refresh only after enemy resolution. Targeted cells and committed lunge route are displayed.

Experimental leap costs one energy and a playable card exhausted for the remainder of the encounter; no extra strain. Wear cannot pay the cost. Wolf support requires the target to be separated from its partner by more than one position. A missed tracker lunge creates an exposure window for a wolf follow-up on the next player turn, even without a new player movement. Other card-movement actions retain their individual costs.

Two tested first turns have opposing immediate benefits:
- Hold: aimed shot kills the archer; cover limits tracker damage to 3; 15 health left; aimed shot remains in the card cycle.
- Bait: sacrifice aimed shot to leap, knife the tracker and guard; 1 damage, 17 health left; both enemies alive, tracker at 26 health and exposed; aimed shot is unavailable for the rest of the encounter.
Both can be completed successfully by automated tactical search. This demonstrates feasibility and consequences, not equal strength or human enjoyment.

The last five opening reports are stored locally with health, enemy state, cards played and sacrificed. Replay starts the exact same setup. No remote analytics or communication is used.

Additional checks: `node tests/lure.test.mjs` (12 rule suites and complete continuations of both opening plans); `node tests/lure-ui.test.mjs` (actual UI handlers with a DOM-free harness: locked-plan rendering, target selection, opening-history persistence and backup restoration). Browser layout/touch QA remains unavailable.

## Nexus v7 — paired card actions

The `/nexus/` prototype gives every base and reward definition two actions. Select a card, select its face, then place and activate a row or column. The face stays committed by physical card UID while on the board, including after swaps. Clearing, self-discard, collapse, or transition removes the commitment; a later draw allows a fresh choice. No generic recall action or per-activation Shelter toggle remains.

The hand shows both names. The face picker shows exact effects and whether the action stays or discards itself. Line previews, combo links, persistent saves and exported reports use the chosen face. Reward replacements include both faces. Saves and reports use v7 keys; older local keys are retained separately.

Validation: `node --test nexus-tests/*.test.mjs` — 53 passing tests, covering all pairs, commitment and reset, both reward faces, combo arithmetic, deterministic replay, swaps/collapse, and real controller handlers through both encounters. DOM-free controller tests do not establish rendered mobile layout or touch behavior. Browser QA was unavailable. These checks establish rules correctness, not human balance or enjoyment.
