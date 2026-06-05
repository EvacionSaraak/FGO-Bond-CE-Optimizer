# FGO-Bond-CE-Optimizer
For dumbos like me who don't want to open the FGO wiki page every time and click through everything.

## Data sources and fallback
- Primary data source: Atlas Academy APIs.
  - Servants: `/export/JP/nice_servant_lang_en.json`
  - Craft Essences: `/export/JP/nice_equip_lore_lang_en.json` filtered locally for bond-related effects
- Local fallback snapshots:
  - `/JSON/fallback-servants.json`
  - `/JSON/nice_equip_lore_lang_en.json`

Servants still use Atlas Academy first with fallback to `/JSON/fallback-servants.json`.
Craft Essences now load from the local JSON snapshot first, then the app checks Atlas Academy in the background and replaces the list when a fresh fetch succeeds.

The servant sidebar now uses pagination (default 10 per page, configurable to 25 or 50) instead of a long scrolling list.
