# TownConnect - Claude Code Instructions

> **Last Updated:** 31 January 2026
> **Purpose:** Context checkpoint for Claude Code - verify alignment before implementing

---

## ⚠️ BEFORE IMPLEMENTING

1. **Check Supermemory** for recent decisions and context
2. **Verify this request doesn't conflict** with established architecture
3. **Flag any contradictions** to Stephen before proceeding
4. **If uncertain, ask** - better to clarify than build the wrong thing

---

## Current State (8 Sites Live)

| Town | Domain | Region | Notes |
|------|--------|--------|-------|
| Vaalwater | vaalwaterconnect.co.za | Limpopo | Original pilot, WhatsApp bot active |
| Menlyn | menlynconnect.co.za | Gauteng | Pretoria East |
| Port Alfred | portalfredconnect.co.za | Eastern Cape | Deirdre (cousin) |
| Modimolle | modimolleconnect.co.za | Limpopo | |
| Blouberg | bloubergconnect.co.za | Western Cape | Premium pricing, WhatsApp bot active |
| Parklands | parklandsconnect.co.za | Western Cape | |
| Garsfontein | garsfonteinconnect.co.za | Gauteng | Pretoria East |
| Lephalale | lephalaleconnect.co.za | Limpopo | Newest |

---

## Tech Stack (Locked)

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Hosting:** Netlify (auto-deploy from GitHub)
- **Database:** Google Sheets (published as CSV, fetched at runtime)
- **Images:** Cloudinary
- **Maps:** Leaflet
- **Payments:** PayFast (working)
- **AI:** Google Gemini (WhatsApp bots + chat assistants)
- **Routing:** Hash-based (/#directory, /#business?id=1)

---

## Architecture

**One codebase, multiple deployments:**
- Each town = own Netlify deployment + own Google Sheet
- Town configs in `src/configs/towns/`
- Register new towns in `src/configs/index.ts`
- Main app: `src/App.tsx` (single file with all views)
- WhatsApp bot: `netlify/functions/whatsapp.js`

**Shared resources:**
- Emergency services Google Sheet (filtered by town)
- Multi-town WhatsApp webhook routing
- TownConnect network badge in all footers

---

## Pricing Tiers

**Standard (most towns):**
- Standard: R199/month | R2,189/year
- Premium: R349/month | R3,839/year
- Enterprise: R599/month | R6,589/year

**Premium markets (Blouberg):**
- Standard: R299 | Premium: R449 | Enterprise: R699

---

## What Exists vs What Doesn't

### ✅ EXISTS
- 8 live town sites
- WhatsApp bots (Vaalwater, Blouberg)
- PayFast payments (working)
- Multi-town webhook routing
- Centralized codebase
- Partner Academy (townconnect-partner-academy.netlify.app) - AI training assistant for franchisees

### ❌ NOT YET BUILT
- TownConnect Hub (central admin dashboard)
- Partner login/dashboard
- Formal franchise agreements
- User accounts/login system

---

## Partner Academy

**URL:** townconnect-partner-academy.netlify.app
**Purpose:** AI-powered training assistant for franchise partners
**Trained on:** Area Partner Training Manual, Sales Scripts, Process Guides, Marketing Conduct Guide, FAQ

---

## Strategic Context

Strategic discussions happen in Claude.ai (regular Claude), not here.

**Confirm with Stephen before implementing:**
- New revenue streams or pricing changes
- Architecture shifts (new stack, databases, auth systems)
- Franchise model changes
- New site launches
- Hub/admin dashboard features

---

## WhatsApp Bots

| Town | Number | Status |
|------|--------|--------|
| Vaalwater | +27 83 666 9298 | Active |
| Blouberg | +27 63 274 0406 | Active |

Gemini-powered, supports EN/AF/SE, sends location pins.

---

## Adding a New Town

1. Create config in `src/configs/towns/[townname].ts`
2. Register in `src/configs/index.ts`
3. Create Google Sheet for business data
4. Deploy to Netlify
5. Configure domain DNS

---

## Owner Notes

- **Stephen Earle** - explain simply, give exact commands
- Prefers Claude.ai for strategy, Claude Code for implementation
- Using Supermemory plugin for persistent context
