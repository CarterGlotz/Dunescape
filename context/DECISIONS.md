# Decisions

Public-safe decisions only. Detailed internal decision history is maintained privately.

## 2026-04-06 — CANON-008: All VaultSpark IP is proprietary by default

**Decision:** All code, content, assets, and designs created by VaultSpark Studios are proprietary and all rights are reserved by VaultSpark Studios LLC unless an open-source license is explicitly declared and approved by the Studio Owner. No agent may apply or imply an open-source license without Studio Owner direction.

**Applies to this project:** Yes — `docs/RIGHTS_PROVENANCE.md` reflects this project's specific license status.

**Rationale:** VaultSpark Studios LLC is a commercial entity building owned IP. Open-sourcing any project without deliberate strategy gives away commercial advantage and creates ownership ambiguity.

**Studio canon:** `vaultspark-studio-ops/docs/STUDIO_CANON.md` → CANON-008

---

## 2026-04-14 — Public shared-world writes require trust boundaries

**Decision:** Client code may sanitize public shared-world writes for player experience and local fallback, but production safety must also be enforced by Supabase RLS, RPC validation, constraints, rate limits, and moderation workflows before scaled public traffic.

**Applies to this project:** Yes — `src/game/trust.js` provides the client-side trust layer, and `docs/SUPABASE_ACTIVATION_PACK.md` records the server-side mirror requirements.

**Rationale:** Solara's core fantasy depends on public records such as graves, scores, echoes, reactions, and offerings remaining readable and abuse-resistant.

---

## 2026-04-14 — Solara canon must remain identity-safe

**Decision:** Player-facing runtime names, bosses, quests, region labels, and lore should use Solara-owned language and avoid borrowed-feel naming from adjacent RPGs or legacy prototypes.

**Applies to this project:** Yes — the runtime now uses `Cinderwake Colossus`, `Cinderwake Slayer`, `Cinderwake emberling`, `Mara's Hearth`, and Solara-owned region comments / labels for the audited targets.

**Rationale:** Proprietary-first ownership requires a distinctive public identity, especially for flagship threats and first-session quests.

---
