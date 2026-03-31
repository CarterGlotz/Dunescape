# Supabase Activation Pack

Purpose: turn Solara's prepared async world into a live shared system without changing game code.

## Required env vars

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Set them in local `.env.local` and in GitHub Actions secrets before expecting live leaderboard/grave/sun/echo behavior.

## Required tables / RPC

Run the SQL blocks in [context/LATEST_HANDOFF.md](/C:/Users/p4cka/documents/development/solara/context/LATEST_HANDOFF.md):

1. `daily_scores`
2. `graves`
3. `sun_state` plus `increment_death_counter()`
4. `player_echoes`

## Surfaces that activate immediately after setup

- Main game daily leaderboard
- Living Map grave persistence
- Shared sun brightness + death counter
- Async player echoes feed
- Public archive page
- Public sun widget
- Discord bot slash commands
- Twitch extension panel

## Verification checklist

1. Start the app and confirm the menu reports live async services detected.
2. Run `npm run build`.
3. Run `npm run smoke`.
4. Start a Daily Rite and confirm scores write to `daily_scores`.
5. Die once and confirm a grave record plus sun-state update.
6. Trigger an echo event and confirm `player_echoes` receives the record.

## Notes

- The repo already degrades gracefully when Supabase is absent; activation should not require additional feature flags.
- If one surface appears offline after setup, verify the anon key has read/write policy coverage for the expected table first.
