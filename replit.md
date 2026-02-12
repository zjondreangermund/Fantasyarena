# FantasyFC - Fantasy Football Card Platform

## Overview

FantasyFC is a Sorare-inspired fantasy football platform without blockchain. Users deposit digital funds (N$) and use them to collect, trade, and compete with player cards. The platform features collectible player cards with rarity tiers (Common, Rare, Unique, Legendary), an onboarding flow where new users receive starter packs, a marketplace for trading non-common cards, weekly competitions, and a digital wallet system. An 8% platform fee applies to all financial transactions.

## User Preferences

Preferred communication style: Simple, everyday language.

- Dark theme by default (fantasy sports aesthetic)
- Professional card designs with rarity-specific gradients and glows
- No blockchain — pure digital fund system with virtual currency (N$)
- Common cards are NOT tradable on the marketplace
- Cards cannot be in a lineup AND listed for sale at the same time

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode)
- **UI Components**: Shadcn UI (new-york style) built on Radix UI primitives
- **State Management**: TanStack React Query for server state; no client-side state library
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

**Key Pages**:
| Route | Purpose |
|---|---|
| `/` | Landing page (unauthenticated) or Dashboard (authenticated) |
| `/premier-league` | Live EPL tracker (standings, fixtures, players, injuries) |
| `/competitions` | Weekly competitions with Common (free) and Rare (N$20) tiers |
| `/collection` | View and manage owned cards, edit lineup |
| `/marketplace` | Buy/sell/swap rare+ cards with fee transparency |
| `/wallet` | Deposit funds, view transaction history |

**Onboarding Flow**: First-time users receive 5 position-based packs (3 GK, 3 DEF, 3 MID, 3 FWD, 3 Random Wildcards = 15 cards total). Users pick 1 card from each pack to form their starting 5. Selecting a card triggers a cinematic dismiss animation where non-selected cards fade and the pack collapses to show only the chosen card. Wallet starts at N$0. Confetti celebration on completion.

### Backend
- **Runtime**: Node.js with Express.js, written in TypeScript (tsx for dev, esbuild for production)
- **API Pattern**: REST API under `/api/*` prefix, JSON request/response
- **Authentication**: Replit Auth via OpenID Connect (OIDC). Sessions stored in PostgreSQL via `connect-pg-simple`. Auth routes at `/api/login`, `/api/logout`, `/api/auth/user`.
- **Entry Point**: `server/index.ts` creates HTTP server, registers routes, serves static files in production or uses Vite middleware in development.

**Key Backend Files**:
| File | Purpose |
|---|---|
| `server/routes.ts` | All API route handlers (cards, wallet, marketplace, competitions, swaps, EPL) |
| `server/services/apiFootball.ts` | API-Football integration with caching and rate-limit-aware sync |
| `server/storage.ts` | Database access layer (IStorage interface + Drizzle implementation) |
| `server/seed.ts` | Seeds player data, marketplace cards, and competitions |
| `server/db.ts` | PostgreSQL connection pool and Drizzle ORM instance |
| `server/replit_integrations/auth/` | Replit Auth setup (OIDC strategy, session config, user upsert) |

### Database
- **Engine**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-kit` for schema push (`npm run db:push`)
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)

**Core Tables**:
| Table | Purpose |
|---|---|
| `users` | User accounts (managed by Replit Auth) |
| `sessions` | Express sessions (managed by connect-pg-simple) |
| `players` | Base player data (name, team, position, overall rating) |
| `player_cards` | Card instances with rarity, level, XP, scores, ownership, sale status |
| `wallets` | User wallet balances |
| `transactions` | Transaction history (deposits, purchases, sales, fees, prizes) |
| `lineups` | User's active 5-card lineup with captain selection |
| `user_onboarding` | Tracks onboarding completion state and pack data |
| `competitions` | Competition definitions (tier, entry fee, prize pool, status) |
| `competition_entries` | User entries in competitions with card IDs and scores |
| `swap_offers` | Card swap offers with optional cash top-ups |

**Key Enums**: `rarity` (common/rare/unique/epic/legendary), `position` (GK/DEF/MID/FWD), `transaction_type`, `competition_tier`, `competition_status`, `swap_status`

### Business Rules
- **8% platform fee** (`SITE_FEE_RATE` constant in shared schema) on all financial transactions: deposits, withdrawals, buys, sells, swaps
- **Lineup composition**: 1 GK + 1 DEF + 1 MID + 1 FWD + 1 Utility = 5 cards
- **Captain bonus**: 10% score bonus for the designated captain
- **Competition prizes**: Cards + cash pool split 60/30/10 for top 3
- **Swap fees**: Split 50/50 between parties based on card price
- **Common cards**: Cannot be listed on the marketplace

### Financial Management System (Added Feb 2026)
- **Escrow/Locked Balance**: Wallets have `lockedBalance` field for funds in transit (pending withdrawals, marketplace listings)
- **Payment Methods**: Supports EFT, eWallet, Bank Transfer, Mobile Money with external transaction ID tracking
- **Withdrawal Flow**: User requests withdrawal → funds locked (moved from balance to lockedBalance) → admin reviews → approve (deduct locked) or reject (return to balance)
- **Card Serial IDs**: Immutable serial numbers (e.g., "HAA-001") using player name initials + incremental counter per player, visible as #001/100 on card face
- **Admin Dashboard**: Available at `/admin` for reviewing and approving/rejecting pending withdrawals with bank details (IBAN/SWIFT) visibility
- **Withdrawal Requests Table**: Stores bank details, eWallet info, status workflow (pending → processing → completed/rejected), admin notes

**New Tables**: `withdrawal_requests`
**New Enums**: `withdrawal_status`, `payment_method`
**Updated Tables**: `wallets` (added `locked_balance`), `player_cards` (added `serial_id`, `serial_number`, `max_supply`, `decisive_score`), `transactions` (added `payment_method`, `external_transaction_id`)

### Card Mechanics (Sorare-Style, Added Feb 2026)
- **Fixed Supply**: Each player limited per rarity tier per season — Common: unlimited, Rare: 100, Unique: 1, Epic: 10, Legendary: 5
- **Supply Enforcement**: Server checks supply count before creating non-common cards; blocks creation when cap reached
- **Serial Numbers**: Every card displays #001/100 (serialNumber/maxSupply) etched into the metal corner
- **CSS 3D Card Design (Card3D component)**: Pure CSS 3D transforms with perspective, metallic rarity gradients, Voronoi crystal overlay (SVG), mouse-tracking parallax rotation, player image via `<img>` tag with onError fallback. All info (name, team, position, rating, level, decisive score, serial, rarity label) displayed on card face. No Three.js/WebGL.
- **Decisive Score System**: Level 0 (35pts) → Level 5 (100pts) based on major actions (goals, assists, clean sheets = +1 level; red cards, own goals = -1 level)
- **XP & Leveling**: Cards gain XP from player performance; level badge visible on card face; decisive score displayed as color-coded badge
- **Card Visual Style**: Static Voronoi crystalline holographic overlay, mouse-tracking parallax rotation, player image texture on front face, vignette edge fade, hover-based image parallax, -5 degree default tilt
- **Unified Card Template**: All pages (Collection, Marketplace, Premier League, Competitions, Onboarding) use the same Card3D component via PlayerCard wrapper

### Sorare API Integration (Added Feb 2026)
- **Service**: `server/services/sorare.ts` — queries Sorare's free GraphQL federation API for player images and stats
- **Endpoint**: `GET /api/sorare/player?firstName=...&lastName=...` — returns player image, scores, club info
- **Rate Limiting**: 1 request/sec throttle, 60s backoff on 429, 24h positive cache, 6h negative cache
- **No Auth Required**: Sorare's read-only GraphQL API is free, no API key needed
- **Fallback**: Cards use API-Football player photos by default; Sorare images are an optional enhancement

### Build System
- **Development**: `npm run dev` runs tsx with Vite dev server middleware (HMR enabled)
- **Production Build**: `npm run build` runs `script/build.ts` which builds client with Vite and server with esbuild, outputting to `dist/`
- **Production Start**: `npm start` runs the compiled `dist/index.cjs`

## External Dependencies

### Required Services
- **PostgreSQL**: Primary database, must be provisioned with `DATABASE_URL` environment variable
- **Replit Auth (OIDC)**: Authentication provider, requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables

### Key npm Packages
| Package | Purpose |
|---|---|
| `drizzle-orm` / `drizzle-kit` | ORM and schema management for PostgreSQL |
| `express` / `express-session` | HTTP server and session management |
| `connect-pg-simple` | PostgreSQL session store |
| `openid-client` / `passport` | OIDC authentication with Replit |
| `@tanstack/react-query` | Server state management on frontend |
| `wouter` | Client-side routing |
| `zod` / `drizzle-zod` | Request validation |
| `canvas-confetti` | Celebration effects during onboarding |
| Radix UI / Shadcn | UI component primitives |
| `tailwindcss` | Utility-first CSS framework |
| `recharts` | Chart components (via shadcn chart) |
| `embla-carousel-react` | Carousel component |
| `vaul` | Drawer component |
| `memoizee` | Memoization for OIDC config |
| `three` / `@react-three/fiber` / `@react-three/drei` | 3D card rendering with Three.js |