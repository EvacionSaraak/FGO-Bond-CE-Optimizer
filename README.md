# FGO-Bond-CE-Optimizer
For dumbos like me who don't want to open the FGO wiki page every time and click through everything.

## Data sources and fallback
- Primary data source: Atlas Academy APIs.
  - Servants: `/export/JP/nice_servant_lang_en.json`
  - Craft Essences: `/export/JP/nice_equip_lore_lang_en.json` filtered locally for bond-related effects
- Local fallback snapshots:
  - `/JSON/fallback-servants.json`
  - `/JSON/fallback-ces.json`

If Atlas Academy is unavailable, the app now falls back to these local JSON files.
