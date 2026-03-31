# Solara: Sunfall

Browser roguelite RPG where every player death dims a shared sun.

## What exists

- Full browser RPG runtime with combat, gathering, crafting, quests, factions, pets, prestige, and offline progression
- Daily Rites seeded dungeon with share card output
- Living Map graves, shrine evolution, and global sun-state hooks
- Roguelite run mode with relic progression
- Front door, traveler identity, async echoes, public archive, sun widget, Discord bot, and Twitch extension surfaces

## Local development

```bash
npm install
npm run build
npm run smoke
npm run dev
```

Supabase is optional. When not configured, the game stays playable locally and shared-world features degrade gracefully.

## Backend activation

- Runtime client: [src/supabase.js](/C:/Users/p4cka/documents/development/solara/src/supabase.js)
- Activation checklist: [docs/SUPABASE_ACTIVATION_PACK.md](/C:/Users/p4cka/documents/development/solara/docs/SUPABASE_ACTIVATION_PACK.md)
- Latest handoff SQL blocks: [context/LATEST_HANDOFF.md](/C:/Users/p4cka/documents/development/solara/context/LATEST_HANDOFF.md)

## Public surfaces

- Main game: `https://vaultsparkstudios.com/solara/`
- Archive of the Fallen: `public/archive.html`
- Sun Observatory widget: `public/sun-widget.html`
- Discord bot: `discord-bot/index.js`
- Twitch extension: `twitch-extension/panel.html`
