# Veri VTuber Gallery — Product Requirements

## Problem Statement
Personal site for a VTuber character (Veri) — gallery + character hub, deployment-ready.
Inspired by Toyhouse / Carrd. Dark theme, navy→wine gradient, glassmorphism, gold/white/magenta accents, heavy rounding (55px buttons, 22-35px cards).

## Core Sections
1. **Landing** — parallax splash with particle effect
2. **Home** — entry hub
3. **Dashboard** — tabbed: **Lore** (paginated story images, Part I live, II/III placeholders) + **Profile** (palette, theme song, likes/dislikes, abilities, motifs)
4. **Art Gallery** — 500x500 cards, folders, tags, upload/edit/delete, horizontal folder carousel
5. **Brand Library** — assets & licenses
6. **Debut Assets** — password-gated
7. **Commissions** — NEW (this build): full CRUD, 4 views, rich data model

## Implemented (2026-02)
- Parallax landing, MainLayout w/ sidebar, Bento dashboard
- Lore/Profile tab split with paginated lore parts
- Gallery CRUD + chunked upload via Emergent Object Storage
- Debut password auth (JWT, 24h) + Google OAuth admin
- **Commissions module**: artist info, platform, type, status flow, split payments, deadlines + overdue, usage rights, public/admin/debut visibility, 4 views (Kanban/List/Timeline/Gallery), filters, stats
- **Credits Wall**: public `/credits` + per-artist dynamic routing
- **Twitch Widget**: static offline state with "Watch Live" CTA
- **Fourthwall Merch** at `/merch` (proxy)
- **Design page** `/design`: hotspot canvas with click-to-drop in admin mode, sliding detail pane, **drag-and-drop card reordering** (admin), legend
- **Fan Art** `/fanart` (Phase 2B, 2026-04): public submit modal w/ chunked upload, admin moderation tabs (approved/pending/rejected) with approve/reject/delete + pending count badge
- **Floating AuthPill** (top-right, persistent): one-click sign in / out from any page; opens shared `AdminLoginModal` (Google + legacy password)
- **ImagePicker component**: file-first drag-and-drop drop zone with preview + Replace/Remove and a collapsed "Use a URL instead" fallback. Used in FanArt submit + DesignElementModal (full_image + thumbnail)

## Architecture
- React 19 + react-scripts (craco) + Tailwind + shadcn/ui
- FastAPI + MongoDB (motor)
- Emergent Object Storage (chunked uploads)
- JWT auth for admin/debut

## Key Routes
- Public: `/`, `/home`, `/dashboard`, `/gallery`, `/brand`, `/commissions` (public items only)
- Gated: `/debut`, admin actions on `/commissions`

## Backend Endpoints
- `/api/character` GET, PUT
- `/api/gallery` GET/POST, `/api/gallery/{id}` PUT/DELETE
- `/api/brand`, `/api/licenses`, `/api/debut` (auth)
- `/api/commissions` GET (optional auth — gates by visibility), POST/PUT/DELETE (auth)
- `/api/commissions/stats` GET
- `/api/auth/verify-debut`, `/api/upload/*`, `/api/files/{path}`

## Data Models (key)
- `commissions`: id, title, description, artist{name,discord,twitter,vgen,portfolio}, platform, type, status, payment_status, budget, currency, payments[{amount,date,note}], deadline, finished_date, usage_rights, visibility(public|admin|debut), reference_urls[], final_urls[], notes, created_at, updated_at, is_deleted

## Testing
- `/app/backend/tests/test_commissions.py` — 17/17 pass
- `/app/backend/tests/test_fanart_design.py` — 21/21 pass (Phase 2B)
- test_credentials.md — debut password `veri2024`; localStorage key `veri_admin_token`

## Prioritized Backlog
- **P1** Lore Part II/III artwork when ready (drop URL into `LORE_PARTS` in Dashboard.jsx)
- **P1** Trigger production deployment from Emergent dashboard
- **P2** Random Veri floating button (random gallery item lightbox)
- **P2** Inline tip-jar / Ko-fi button
- **P2** Dynamic favicon (time/mood-based)
- **P2** Replace native `<input type=date>` with shadcn Calendar/Popover on Commissions
- **P2** Add `GET /api/commissions/{id}` for single retrieval
- **P2** Lightbox / fullscreen zoom for lore images
- **P3** Refactor `Commissions.jsx` by splitting views into sub-files
- **P3** Merge-style `PATCH /api/commissions/{id}` instead of full replace
- **P3** Keyboard-accessible (up/down) reorder buttons on Design admin cards (a11y)
- **P3** Validate http(s) scheme on fanart `image_url` submission

## Deployment Status
Deployment-ready. Readiness check passed previously. User triggers deploy from Emergent dashboard.
