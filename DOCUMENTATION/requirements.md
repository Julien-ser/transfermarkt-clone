# Transfermarkt Clone - Requirements Document

## Project Overview

A comprehensive football/soccer transfer database and statistics platform that provides detailed player profiles, team information, league standings, transfer history, and market values. The project will be built with a modern stack (Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL) and deployed on Vercel.

---

## Feature Prioritization

### 🎯 MVP (Phase 1-2 Core)
These features are essential for a functional Transfermarkt clone:

1. **Player Profile Pages** - Core entity display with basic info and stats
2. **Team Pages** - Club information and current squad
3. **League Standings** - Basic table view with sorting
4. **Transfer History** - List view with filtering
5. **Market Values** - Current values and historical chart
6. **Search Functionality** - Global search across main entities
7. **Database Schema** - Complete normalized schema with Prisma
8. **API Endpoints** - RESTful CRUD operations with pagination
9. **Data Seeding** - Sample data for testing
10. **Responsive Design** - Mobile-first Tailwind CSS

### 🚀 Enhanced (Phase 3-4 Polish)
Features that improve UX and visual appeal:

11. **Advanced Search Filters** - Date ranges, fee ranges, position filters
12. **Interactive Charts** - Market value trends with Recharts
13. **Dark/Light Theme** - Theme switcher with system preference detection
14. **Skeleton Loaders** - Loading states for all data fetches
15. **Error Boundaries** - Graceful error handling
16. **Infinite Scroll** - For long lists (transfers, players)
17. **CSV Export** - Export standings and data tables

### ⭐ Advanced (Phase 4+ Optional)
Nice-to-have features that require additional infrastructure:

18. **User Authentication** - Sign up, login, watchlist feature
19. **Watchlist System** - Save favorite players and teams
20. **Real-time Updates** - Cron jobs for market value simulation
21. **Caching Layer** - Redis integration for performance
22. **Analytics** - Plausible/Simple Analytics tracking
23. **Image Optimization** - Cloudinary/Uploadcare integration
24. **Admin Panel** - CMS for data management
25. **Multi-language** - i18n support (English, German, Spanish)
26. **API Rate Limiting** - Protection for public endpoints

---

## Detailed Feature Specifications

### 1. Player Profiles (MVP)

**Scope:**
- Display player bio: name, age, nationality, height, weight, position
- Show current club, jersey number, contract expiry
- Current market value with change indicator
- Season statistics (appearances, goals, assists, cards) based on position
- Career history (clubs played for with dates)
- Transfer history timeline (inbound/outbound transfers)
- Market value chart (last 12-24 months)

**Data Model:**
- `Player`: personal info, current club, market value
- `PlayerStat`: season-specific performance metrics
- `Transfer`: player movement records
- `MarketValue`: historical value tracking
- `ContractHistory`: contract timeline

**API Endpoints:**
- `GET /api/players/[id]` - Single player profile
- `GET /api/players` - List with filters (position, age, nationality, club)
- `GET /api/players/[id]/stats` - Season statistics
- `GET /api/players/[id]/transfers` - Transfer history
- `GET /api/players/[id]/market-value-history` - Chart data

**Frontend Pages:**
- `/players/[id]` - Dynamic route for player profiles

---

### 2. Team Pages (MVP)

**Scope:**
- Team overview: name, founded year, stadium, capacity, city, country
- Current league position and recent form
- Current squad list (grouped by position: GK, DF, MF, FW)
- Player details: name, age, nationality, market value, contract expiry
- Transfer history for the team
- Manager/coach information (if available)

**Data Model:**
- `Club`: team information with league relationship
- `Player`: currentClubId foreign key
- `Transfer`: fromClubId/toClubId foreign keys
- `LeagueSeason`: current standing position

**API Endpoints:**
- `GET /api/clubs/[id]` - Single club with current squad
- `GET /api/clubs/[id]/squad` - Full squad list with filters
- `GET /api/clubs/[id]/transfers` - Team transfer activity
- `GET /api/clubs/[id]/standing` - Current league position

**Frontend Pages:**
- `/teams/[id]` - Dynamic route for team pages

---

### 3. League Standings (MVP)

**Scope:**
- Full league table with standard columns: Pos, Club, P, W, D, L, GF, GA, GD, Pts
- Sortable columns (ascending/descending)
- Home/away split view (toggle)
- Form guide (last 5 matches results)
- Season selector (if multiple seasons available)
- Export to CSV functionality

**Data Model:**
- `League`: competition info
- `LeagueSeason`: season with current flag
- `Standing`: team position, matches, points, goals
- `Match`: individual games with scores

**API Endpoints:**
- `GET /api/leagues/[id]/standings?season=2024` - Current standings
- `GET /api/leagues/[id]/standings?season=2023&homeAway=home` - Filtered view
- `GET /api/leagues/[id]/seasons` - Available seasons

**Frontend Pages:**
- `/leagues/[id]` - League page with standings table

---

### 4. Transfer History (MVP)

**Scope:**
- List of all transfers with pagination
- Filters: date range, minimum fee, maximum fee, transfer type (in/out), player position
- Sortable by date and fee
- Key details: player, from club, to club, fee, date, transfer type
- Loan deals distinguishable from permanent transfers

**Data Model:**
- `Transfer`: core transfer record with relationships
- `TransferType`: enum (PERMANENT, LOAN, LOAN_WITH_OPTION, etc.)
- `Player.currentClubId` - derived from latest transfer

**API Endpoints:**
- `GET /api/transfers` - List with filters
  - Query params: `page`, `limit`, `startDate`, `endDate`, `minFee`, `maxFee`, `position`, `leagueId`, `clubId`
- `GET /api/transfers/stats` - Aggregated stats (total fee, count by league/club)

**Frontend Pages:**
- `/transfers` - Main transfer history page with filter UI

---

### 5. Market Values (MVP)

**Scope:**
- Current market value displayed prominently on player profile
- Historical value chart (line chart) showing value changes over time
- Value change indicators (↑ ↓ with percentage)
- Explanation of market value calculation (if algorithm defined)
- "As of" timestamp for last update

**Data Model:**
- `Player.marketValue` - current value cached
- `MarketValue` table: playerId, date, value, reason/note (optional)

**API Endpoints:**
- `GET /api/players/[id]/market-value` - Current value
- `GET /api/players/[id]/market-value-history` - Timeline data for chart

**Frontend Components:**
- Recharts LineChart component for visualization
- Market value badge with trend indicator

---

### 6. Search Functionality (MVP)

**Scope:**
- Global search bar in header/navigation
- Search across: players, clubs, leagues
- Real-time autocomplete suggestions (dropdown with 5-10 results)
- Debounced input (300ms) for API calls
- Search results page with grouped results
- URL query parameter support for deep linking
- Keyboard navigation (arrow keys, Enter)

**API Endpoints:**
- `GET /api/search?q=ronaldo&limit=10` - Autocomplete
- `GET /api/search?q=madrid&include=players,clubs,leagues` - Full results

**Frontend Components:**
- SearchInput component with autocomplete dropdown
- SearchResults page (`/search?q=...`)

---

### 7. Database Schema & Backend (MVP)

**Scope:**
- Complete normalized schema with 10+ entities
- Prisma ORM setup with PostgreSQL
- Type-safe database access via Prisma Client
- Proper foreign key constraints and indexes
- Database migrations tracked
- Seed script with realistic sample data (~50 players, 10 clubs, 2 leagues)

**Entities:**
- `Player`, `Club`, `League`, `LeagueSeason`, `Standing`
- `Transfer`, `TransferType`, `PlayerStat`, `MarketValue`
- `Match`, `MatchResult`, `ContractHistory`
- `Position` (lookup table)

**Performance:**
- Indexes on frequently queried columns (player.name, club.name, league.name)
- Composite indexes for filtering (player.position, player.currentClubId)
- Foreign key constraints for data integrity

**Deliverables:**
- `prisma/schema.prisma` complete
- `SCHEMA/database-schema.sql` (for reference)
- `SCHEMA/ER-diagram.md` with relationships
- `prisma/seed.ts` with sample data

---

### 8. API Design Standards (MVP)

**Conventions:**
- RESTful endpoints following `/api/[resource]/[id]` pattern
- Consistent response format: `{ data: ..., meta: { pagination } }`
- Error responses: `{ error: { code, message } }`
- Pagination: `?page=1&limit=20` with total count in meta
- Filtering: query parameters for all filterable fields
- Sorting: `?sortBy=name&order=asc`
- Caching: ETag/Last-Modified headers (optional)
- Rate limiting: 100 requests per minute per IP (if public API)

**Validation:**
- Zod schemas for request validation
- TypeScript types for all API responses
- Proper HTTP status codes (200, 201, 400, 404, 500)

**Documentation:**
- OpenAPI/Swagger spec (future)
- Inline JSDoc comments for all endpoints

---

### 9. Frontend Design System (Enhanced)

**Components:**
- `Button` - primary, secondary, ghost variants, sizes
- `Card` - for player/club cards with hover effects
- `Table` - sortable, paginated, responsive
- `Badge` - position badges, status indicators
- `Avatar` - player/team photos with fallback
- `Input` - text, select, search with validation states
- `Modal` - confirmation dialogs, detail views
- `Tabs` - for switching between views (e.g., squad/stats/transfers)

**Styling:**
- Tailwind CSS utility-first approach
- Dark/light mode with CSS variables
- Responsive breakpoints: sm, md, lg, xl
- Consistent spacing scale (4px base)
- Color palette: primary blue, secondary gray, semantic colors

**Accessibility:**
- Semantic HTML elements
- ARIA labels for interactive components
- Keyboard navigation support
- Focus visible states
- Alt text for images

---

### 10. Performance Targets (Enhanced)

**Lighthouse Scores:**
- Performance > 90
- Accessibility > 90
- Best Practices > 90
- SEO > 90

**Optimizations:**
- Next.js Image component for all images
- Lazy loading for below-the-fold content
- Dynamic imports for heavy components (charts)
- Code splitting by route
- Font optimization with `next/font`
- Minified production bundles
- CDN for static assets
- Redis caching for API responses (if implemented)

---

## Definition of Done

For MVP completion, each feature must have:

✅ **Functional** - Feature works as specified without critical bugs  
✅ **Tested** - Unit/integration tests cover core logic (80%+ coverage)  
✅ **Documented** - Code comments, API docs, README updates  
✅ **Styled** - Tailwind CSS applied, responsive across devices  
✅ **Performant** - Page load < 3s on 3G, Lighthouse score > 85  
✅ **Accessible** - Keyboard navigation, ARIA labels, color contrast  
✅ **Commited** - Clear git commit message following convention  
✅ **Reviewed** - Code self-reviewed before submission  

---

## Out of Scope (Future Phases)

The following are **not** included in MVP or enhanced phases:

- User-generated content/reviews
- Fantasy football/team management
- Live match scores/minutes
- Multi-language support
- Mobile apps (iOS/Android)
- AI predictions or transfer rumors
- Social features (comments, likes, shares)
- Payment processing
- Admin dashboard for non-technical users
- Advanced analytics dashboards
- Historical data beyond 5 seasons

---

## Success Metrics

- **MVP Completion**: All MVP features marked complete in TASKS.md
- **Performance**: Lighthouse > 90, page load < 2s
- **Code Quality**: ESLint + Prettier passing, TypeScript strict mode
- **Testing**: Jest unit tests > 80% coverage, Cypress E2E for critical flows
- **Documentation**: README with setup instructions, API docs, component docs
- **Deployment**: Production URL accessible on Vercel

---

## Related Documents

- `TASKS.md` - Development roadmap with task checklist
- `SCHEMA/database-schema.sql` - SQL schema reference
- `SCHEMA/ER-diagram.md` - Entity relationship diagram
- `prisma/schema.prisma` - Prisma schema definition
- `ARCHITECTURE/tech-stack.md` - Technology choices and justifications
- `README.md` - Project overview and setup instructions

---

**Document Version**: 1.0  
**Last Updated**: 2025-03-13  
**Status**: Draft - Ready for review
