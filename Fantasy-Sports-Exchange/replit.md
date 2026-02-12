# FantasyFC - Fantasy Football Card Platform

## Overview
A Sorare-inspired fantasy football platform without blockchain. Users deposit digital funds and use them for player card transfers. Features collectible player cards with rarity tiers, an onboarding card pack system, marketplace trading, and squad management.

## Recent Changes
- 2026-02-12: Initial MVP built with full schema, frontend components, backend API, seed data
  - Replit Auth integration for user authentication
  - PostgreSQL database with Drizzle ORM
  - Player cards with 4 rarity tiers (Common, Rare, Unique, Legendary)
  - Onboarding flow with 3 card packs, choose best 5, confetti celebration
  - Digital wallet system with deposit functionality
  - Marketplace for trading non-common cards
  - Collection gallery with rarity filtering
  - Dark/light theme support

## User Preferences
- Dark theme by default (fantasy sports aesthetic)
- Professional card designs with rarity-specific gradients and glows
- No blockchain - pure digital fund system

## Project Architecture
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI
- **Backend**: Express.js with Replit Auth (OIDC)
- **Database**: PostgreSQL with Drizzle ORM
- **Key Routes**:
  - `/` - Landing page (logged out) or Dashboard (logged in)
  - `/collection` - View and manage owned cards
  - `/marketplace` - Buy/sell rare+ cards
  - `/wallet` - Deposit funds, view transactions
- **Auth**: Replit Auth via `/api/login`, `/api/logout`
- **Onboarding**: First-time users get 3 packs of 3 common players, choose 5 for lineup + $100 welcome bonus
- **Common cards are NOT tradable** on the marketplace

## Key Files
- `shared/schema.ts` - All data models (players, cards, wallets, transactions, lineups, onboarding)
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database storage layer
- `server/seed.ts` - 27 real football players seed data
- `client/src/components/PlayerCard.tsx` - Reusable card component with rarity styling
- `client/src/pages/` - All page components
