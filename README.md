# Transfermarkt Clone

A full-stack clone of Transfermarkt - a comprehensive football/soccer transfer database and statistics platform built with modern web technologies.

## 🎯 Mission

Build a feature-rich platform that provides:
- Detailed player profiles with career statistics and market values
- Club pages with squad information and transfer history
- League standings with advanced filtering
- Global search across players, clubs, and leagues
- Transfer rumors and market trends
- Admin panel for data management

## 🚀 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization

### Backend
- **Next.js API Routes** (or standalone Express/FastAPI)
- **Prisma ORM** for database access
- **PostgreSQL** as primary database
- **Redis** for high-performance caching

### DevOps
- **Vercel** for frontend deployment
- **Railway/Render** for backend (if separate)
- **GitHub Actions** for CI/CD

## 📁 Project Structure

```
/transfermarkt-clone/
├── apps/
│   ├── web/              # Next.js frontend application
│   └── api/              # Backend API (optional standalone)
├── packages/
│   ├── ui/               # Shared React components
│   ├── types/            # TypeScript definitions
│   └── utils/            # Shared utilities
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Prisma schema definition
│   └── database-schema.sql  # Raw SQL schema (reference)
├── ARCHITECTURE/         # Architecture documentation
│   └── tech-stack.md     # Tech stack decisions and justifications
├── SCHEMA/               # Database schema documentation
│   ├── ER-diagram.md     # Entity relationship diagram
│   └── database-schema.sql # SQL migrations
├── docs/                 # Project documentation
├── tests/                # Test suites
└── TASKS.md              # Development roadmap
```

## ✅ Current Progress

### Phase 1: Planning & Setup
- [x] **Define Feature Scope & Requirements** ✅ Complete
  - Comprehensive MVP and full feature list
  - Prioritized feature specifications
  - Success metrics and definition of done
  - [View Requirements →](./DOCUMENTATION/requirements.md)
- [x] **Database Schema Defined** ✅ Complete
  - Complete Prisma schema with 15+ entities
  - Comprehensive ER diagram with relationships
  - Full documentation with enums and constraints
  - [View Schema Documentation →](./docs/database-schema.md)
  - [View Prisma Schema →](./prisma/schema.prisma)
- [x] Choose and document tech stack with justifications ✅
  - Comprehensive tech stack documentation with justifications for each technology
  - Frontend, backend, database, and infrastructure decisions documented
  - [View Tech Stack →](./ARCHITECTURE/tech-stack.md)
  - [View Architecture Docs →](./ARCHITECTURE/)
- [x] Initialize monorepo structure with frontend and backend packages ✅
  - Complete monorepo with pnpm workspaces configured
  - Apps: Next.js frontend (web) and Express API (api)
  - Packages: shared UI, types, and utilities
  - Prisma schema and documentation folders ready

### Phase 2: Core Infrastructure & Backend Development
- [x] **Set up Prisma with PostgreSQL** ✅ Complete
  - ✅ Complete Prisma schema with 15+ models (Player, Club, Competition, Transfer, etc.)
  - ✅ Comprehensive seed script with realistic sample data
  - ✅ Initial migration created and versioned
  - ✅ Prisma Client generated successfully
  - ✅ Database configuration in .env ready
  - ✅ Automated setup script (setup-database.sh)
  - 📝 **Next step**: Install PostgreSQL and run `./setup-database.sh` to initialize database
- [x] **Implement authentication system with NextAuth.js** ✅ Complete
  - ✅ Email/password authentication with bcrypt password hashing
  - ✅ Google OAuth integration (requires Google Cloud credentials)
  - ✅ Session management with JWT strategy
  - ✅ Complete auth flow: registration, login, logout, password reset
  - ✅ Protected routes and API endpoints
  - ✅ User watchlist functionality (players and clubs)
   - 📝 **Files**:
     - `apps/web/lib/auth.ts` - NextAuth configuration
     - `apps/web/app/api/auth/[...nextauth]/route.ts` - Auth API handler
     - `apps/web/app/api/auth/register/route.ts` - Registration endpoint
     - `apps/web/app/api/auth/forgot-password/route.ts` - Password reset request
     - `apps/web/app/api/auth/reset-password/route.ts` - Password reset confirmation
     - `apps/web/app/api/watchlist/route.ts` - User watchlist CRUD (players & clubs)
     - `apps/web/components/Header.tsx` - Header with watchlist badge count
     - `apps/web/app/watchlist/page.tsx` - Watchlist management page
     - `apps/web/components/auth/*` - Auth UI components
     - `apps/web/app/login/page.tsx` - Login page
     - `apps/web/app/register/page.tsx` - Registration page
     - `apps/web/app/forgot-password/page.tsx` - Forgot password page
     - `apps/web/app/reset-password/page.tsx` - Reset password page
   - 📝 **Watchlist Feature**:
     - Add/remove players and clubs to personal watchlist from any profile page
     - Dedicated watchlist page at `/watchlist` showing all saved items
     - Real-time badge count in header showing total watchlist items
     - Tabs to switch between players and clubs
     - Remove items directly from watchlist page
     - Responsive design with empty states
     - Test coverage: API tests + page integration tests
   - 📝 **Environment Variables** (see `.env.example`):
    - `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)
    - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (optional)
    - `NEXTAUTH_SECRET` - Secret key for JWT signing (required)
    - `NEXTAUTH_URL` - Application URL (e.g., http://localhost:3000)
- [x] **Build CRUD API endpoints for core entities** ✅ Complete
  - ✅ RESTful API endpoints with proper error handling and validation
  - ✅ Endpoints: GET/POST/PUT/DELETE for players, clubs, competitions
  - ✅ Request validation (Zod), response formatting, pagination, filtering
  - 📝 **Files**:
    - `apps/web/lib/validations.ts` - Zod schemas for request validation
    - `apps/web/app/api/players/route.ts` - Player list + create
    - `apps/web/app/api/players/[id]/route.ts` - Player get + update + delete (with cache)
    - `apps/web/app/api/clubs/route.ts` - Club list + create (with cache)
    - `apps/web/app/api/clubs/[id]/route.ts` - Club get + update + delete (with cache)
    - `apps/web/app/api/competitions/route.ts` - Competition list + create (with cache)
    - `apps/web/app/api/competitions/[id]/route.ts` - Competition get + update + delete (with cache)
   - [x] **Create data seeding scripts with sample football data** ✅ Complete
   - ✅ Comprehensive seed with realistic sample data for testing
   - ✅ Includes: positions, countries, clubs, players, stats, transfers
   - ✅ Run: `pnpm db:seed` (requires PostgreSQL running)
   - [x] **Implement caching strategy with Redis** ✅ Complete
   - ✅ Redis integration with ioredis client and connection pooling
   - ✅ Cache helper with TTL management and pattern invalidation
   - ✅ Cached data: league standings, player market values, team rosters
   - ✅ Optimized endpoints: players list, player detail, clubs list, club detail, competitions list, competition detail, league standings
   - ✅ Automatic cache invalidation on mutations (create/update/delete)
   - ✅ Pattern-based invalidation for related data consistency
   - 📝 **Configuration**: `REDIS_URL` in `.env` (default: `redis://localhost:6379`)
   - 📝 **Files**:
     - `apps/web/lib/cache.ts` - Cache client and helpers
     - `apps/web/app/api/competitions/[id]/standings/route.ts` - Standings endpoint with caching
     - Updated API routes with cache invalidation logic

### Phase 3: Frontend Development - Core Pages & Components
- [x] **Build homepage with featured leagues, latest transfers, and search bar** ✅ Complete
  - ✅ Responsive layout with hero section and integrated search
  - ✅ Featured leagues carousel with navigation arrows and club logos
  - ✅ Latest transfers table with infinite scroll pagination
  - ✅ Market value leaders table showing top players
  - ✅ Client-side data fetching with loading and error states
  - 📝 **Files**:
    - `apps/web/app/page.tsx` - Main homepage component
    - `apps/web/components/home/FeaturedLeaguesCarousel.tsx` - Leagues carousel
    - `apps/web/components/home/LatestTransfersTable.tsx` - Transfers table with infinite scroll
    - `apps/web/components/home/MarketValueLeaders.tsx` - Top market value players
    - `apps/web/components/home/SearchBar.tsx` - Global search component
- [x] **Develop player profile page with detailed statistics** ✅ Complete
  - ✅ Comprehensive player profile with detailed statistics and market value tracking
  - ✅ Multi-tab interface: Overview, Statistics, Transfer History, Career History
  - ✅ Market value chart using Recharts with interactive tooltips
  - ✅ Position-specific stats (Goalkeeper, Defender, Midfielder, Forward)
  - ✅ Transfer timeline with club logos, fees, and loan details
  - ✅ Career history table with season-by-season breakdown
  - ✅ **Watchlist integration**: Add/remove players from personal watchlist with visual feedback
  - ✅ Full responsive design with dark mode support
  - ✅ Loading states and error handling
  - ✅ API integration with Redis caching (30 min TTL)
  - 📝 **Files**:
    - `apps/web/app/players/[id]/page.tsx` (776 lines) - Main player profile component
    - `apps/web/app/players/[id]/page.test.tsx` (432 lines) - Comprehensive test suite
    - `apps/web/app/api/players/[id]/route.ts` - Player API with caching
  - 📝 **Features**:
    - Player info card with photo, position, nationality, current club
    - Physical attributes (height, weight, foot, birth date/place)
    - Contract details and jersey number
    - Career totals (appearances, goals, assists)
    - Latest season statistics with competition-specific metrics
    - Market value history visualization
    - Transfer history with filtering and detailed metadata
  - ✅ Test coverage: 12 test cases covering all functionality
    - Loading states, error handling, data display, tab switching, position-specific stats
    - Transfer timeline, career history, market value chart, navigation links
- [x] **Build team page with squad list and statistics** ✅ Complete
  - ✅ Comprehensive team/club page with squad roster and transfer history
  - ✅ Three-tab interface: Squad, Statistics, Transfer History
  - ✅ Squad tab with position filtering and sorting (jersey, market value, age)
  - ✅ Interactive player table with links to player profiles
  - ✅ **Watchlist integration**: Add/remove teams from personal watchlist with visual feedback
  - Team statistics summary: total players, market value, average age, foreign players
  - ✅ Position breakdown cards (GK, DEF, MID, FWD) with counts and values
  - ✅ Season statistics table with player performance data
  - ✅ Transfer history with color-coded timelines (inbound green, outbound red)
  - ✅ Full responsive design with dark mode support
  - ✅ Loading states, error handling, and fallback UI for missing logos
  - ✅ API integration with Redis caching (30 min TTL)
  - 📝 **Files**:
    - `apps/web/app/teams/[id]/page.tsx` (844 lines) - Main team page component
    - `apps/web/app/teams/[id]/page.test.tsx` (719 lines) - Comprehensive test suite (18 tests)
    - `apps/web/app/api/clubs/[id]/route.ts` - Club API with caching and full data relationships
  - 📝 **Features**:
    - Team header with logo, name, short name, country badge, founded year, stadium
    - Squad size and total market value display
    - Stadium capacity, average age, foreign players count, website link
    - Player cards with avatar, position badge, nationality, jersey number, market value, contract
    - Transfer details with dates, fees, loan info, option to buy
    - Links to player pages and club logos in transfer timeline
  - ✅ Test coverage: 18 test cases covering all functionality
    - Loading states, error handling, tab switching, squad table, filtering, sorting
    - Statistics cards, position breakdown, season stats, transfer history
    - Team badge fallback, age calculation, foreign player count, stadium capacity
    - Player navigation links, transfer formatting
- [x] **Create transfer history page with filters and advanced search** ✅ Complete
  - ✅ Comprehensive transfer history page with advanced filtering and search
  - ✅ Filters: player name (debounced), position, league (competition), from club, to club, fee range (min/max), date range (min/max)
  - ✅ URL query parameter persistence for all filters, pagination, and sorting
  - ✅ Debounced search input (500ms delay) to reduce API calls
  - ✅ Pagination with configurable items per page (10, 20, 50, 100)
  - ✅ Sorting by transfer date and fee (ascending/descending)
  - ✅ Clear filters button with active filter count badge
  - ✅ Responsive filter layout with 4-column grid
  - ✅ Interactive transfers table with player info, club logos, dates, fees, and badges
  - ✅ Transfer type badges (PERMANENT, LOAN, etc.) and fee formatting
  - ✅ Legend explaining badge meanings
  - ✅ Loading and error states with retry functionality
  - ✅ API integration with Redis caching and competition filtering via season relationship
  - 📝 **Files**:
    - `apps/web/app/transfers/page.tsx` (updated with league filter)
    - `apps/web/app/transfers/page.test.tsx` (new test suite with 12 tests)
    - `apps/web/app/api/transfers/route.ts` (updated to support competitionId filter)
    - `apps/web/lib/validations.ts` (added competitionId to transferSearchSchema)
  - 📝 **Features**:
    - Search by player name with debouncing
    - Filter by position, league/competition, from/to clubs
    - Filter by transfer fee range (supports free transfers)
    - Filter by date range (YYYY-MM-DD format)
    - Active filter count badge on clear button
    - Table columns: Player (with avatar), From Club, To Club, Date, Type, Fee, Season
    - Pagination controls and per-page selector
    - Sorting controls for date and fee
    - Full dark mode support
  - ✅ Test coverage: 12 test cases covering rendering, filtering, pagination, URL updates, error/empty states

## 🔧 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18+)
- **PostgreSQL** (v14+)
- **pnpm** (recommended) or npm

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
# Install pnpm globally if needed
npm install -g pnpm

# Install project dependencies (once monorepo is initialized)
pnpm install
```

### 2. Set Up PostgreSQL Database

**Prisma Client has already been generated.** You need a running PostgreSQL database to proceed.

#### Option A: Using Docker (Recommended if Docker is available)

```bash
# From the project root, start PostgreSQL container
docker-compose up -d postgres

# Verify it's running
docker ps | grep postgres

# The database will be available at:
# host: localhost
# port: 5432
# user: postgres
# password: password
# database: transfermarkt_clone
```

#### Option B: Native Installation (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb transfermarkt_clone

# Set password for postgres user (optional, if needed)
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"

# The DATABASE_URL in .env is already configured for:
# postgresql://postgres:password@localhost:5432/transfermarkt_clone
```

#### Option C: macOS

```bash
# Install PostgreSQL via Homebrew
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb transfermarkt_clone
```

#### Option D: Windows

Download and install PostgreSQL from https://www.postgresql.org/download/windows/. Use the installer to create a database named `transfermarkt_clone` and configure the connection in `.env`.

### 3. Verify Database Connection

```bash
# Test connection using Prisma
npx prisma db push
```

If successful, Prisma will sync the schema to the database.

### 4. Run Initial Migration (if needed)

The initial migration is already created in `prisma/migrations/`. To apply it:

```bash
npx prisma migrate dev --name init
```

### 5. Seed Sample Data

```bash
npx prisma db seed
```

This will populate the database with:
- 4 player positions (Goalkeeper, Defender, Midfielder, Forward)
- 9 countries with flag URLs
- 1 season (2024/2025)
- 3 competitions (Premier League, La Liga, Bundesliga)
- 3 clubs (Manchester United, Real Madrid, Bayern Munich)
- 3 players with full stats and market value history
- Transfer and player statistics data

### 6. Start Development Server

```bash
# Frontend
cd apps/web
pnpm dev

# API (if standalone)
cd apps/api
pnpm dev
```

### 7. Access the Application

- Frontend: http://localhost:3000
- Prisma Studio (database viewer): `npx prisma studio` (http://localhost:5555)

## 🐛 Troubleshooting

### PostgreSQL Connection Refused
- Ensure PostgreSQL service is running: `sudo systemctl status postgresql` or `pg_isready`
- Check if port 5432 is available: `netstat -tulpn | grep 5432`
- Verify credentials in `.env` match your PostgreSQL setup

### Migration Errors
- If `prisma db push` fails, ensure the database exists: `createdb transfermarkt_clone`
- Check that the PostgreSQL user has permission to create tables
- Review the SQL generated in `prisma/migrations/` for errors

### Seed Script Fails
- Ensure migrations have been applied before seeding
- Check for duplicate data; the seed uses `upsert` so it should be idempotent
- Review error messages for constraint violations

## 📊 Database Schema

The database consists of the following core entities:

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **Player** | Player profile and current state | name, position, currentClubId, marketValue |
| **Club** | Team information | name, founded, stadium, leagueId |
| **Competition** | League/cup data | name, country, type |
| **Transfer** | Player movement records | playerId, fromClubId, toClubId, fee |
| **PlayerStats** | Season statistics | playerId, season, goals, assists |
| **MarketValue** | Value history | playerId, date, value |
| **Season** | Season context | year, startDate, endDate |
| **User** | User accounts (for watchlist) | email, passwordHash, role |

See [ER Diagram →](./SCHEMA/ER-diagram.md) for full entity relationships.

## 📊 Database Schema

The database consists of the following core entities:

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **Player** | Player profile and current state | name, position, currentClubId, marketValue |
| **Club** | Team information | name, founded, stadium, leagueId |
| **League** | Competition data | name, country, season |
| **Transfer** | Player movement records | playerId, fromClubId, toClubId, fee |
| **PlayerStat** | Season statistics | playerId, season, goals, assists |
| **MarketValue** | Value history | playerId, date, value |
| **Season** | League season context | leagueId, year, isCurrent |
| **ContractHistory** | Contract timeline | playerId, clubId, startDate, endDate |

See [ER Diagram →](./SCHEMA/ER-diagram.md) for full entity relationships.

## 📋 Development Workflow

1. Check `TASKS.md` for the current task list
2. Each task should include:
   - Clean, well-tested code
   - Documentation updates
   - Git commit with proper message
   - Progress update in TASKS.md

### Git Commands

```bash
git add .
git commit -m "Feature: [description]"
git push origin main
```

## ⚡ Performance Optimizations

The application implements a comprehensive performance strategy to achieve Lighthouse scores > 90:

### Implemented Optimizations

| Category | Implementation |
|----------|----------------|
| **Image Optimization** | Next.js Image component with WebP/AVIF support, lazy loading, responsive sizing |
| **Code Splitting** | Dynamic imports for heavy components (charts, tables), chunk splitting for vendor libraries |
| **Font Optimization** | Preloading critical fonts, DNS prefetch for external image domains |
| **Bundle Size** | SWC minification, dependency optimization (recharts, date-fns), splitChunks config |
| **Caching** | Redis caching for API responses (5-60 min TTL), static asset caching with long TTL |
| **Prefetching** | Route prefetching for navigation links to improve perceived performance |
| **Error Boundaries** | Graceful error handling with retry functionality |
| **Analytics** | Simple Analytics (privacy-friendly, no cookies) |

### Performance Testing

#### Build Analysis

```bash
# Generate bundle analysis report
cd apps/web
npm run analyze

# Open bundle-analysis.html in your browser to visualize bundle composition
```

#### Performance Check Script

```bash
cd apps/web
npm run performance
```

This script analyzes:
- Total bundle size
- Largest chunks
- Configuration completeness
- Recommendations for improvements

#### Lighthouse Audit

1. Start the development server: `npm run dev`
2. Open http://localhost:3000
3. Open Chrome DevTools → Lighthouse tab
4. Run audit with "Performance" category selected
5. Target score: > 90

#### Key Metrics to Monitor

- **LCP (Largest Contentful Paint)**: < 2.5s (font preloading + image optimization)
- **FID (First Input Delay)**: < 100ms (code splitting + React optimizations)
- **CLS (Cumulative Layout Shift)**: < 0.1 (sized images + font display swap)
- **TTI (Time to Interactive)**: < 3.8s (bundle analysis + minification)

### Configuration Files

- `apps/web/next.config.js` - Next.js configuration with performance settings
- `apps/web/app/layout.tsx` - Font preloading and DNS prefetch
- `apps/web/components/ErrorBoundary.tsx` - Error handling component
- `apps/web/scripts/performance-check.ts` - Performance analysis script

### Ongoing Optimization

- Regularly check bundle sizes with `npm run analyze`
- Monitor Lighthouse scores on each major feature update
- Use React DevTools Profiler to identify component rendering issues
- Keep dependencies up to date and remove unused imports
- Consider code splitting for any new heavy components

## 🔥 Redis Caching Implementation

The application implements a comprehensive Redis caching strategy to improve performance and reduce database load for frequently accessed data.

### Cached Data & TTL

| Data Type | TTL | Endpoint |
|-----------|-----|----------|
| Players list | 5 min | `GET /api/players` |
| Player detail | 30 min | `GET /api/players/[id]` |
| Clubs list | 10 min | `GET /api/clubs` |
| Club detail (squad) | 30 min | `GET /api/clubs/[id]` |
| Competitions list | 30 min | `GET /api/competitions` |
| Competition detail | 1 hour | `GET /api/competitions/[id]` |
| League standings | 5 min | `GET /api/competitions/[id]/standings` |

### Cache Invalidation

Automatic cache invalidation on mutations:
- **Player update/delete**: Invalidates player cache + players list pattern
- **Club update/delete**: Invalidates club cache + clubs list + players list + standings patterns
- **Competition update/delete**: Invalidates competition cache + competitions list + clubs + standings patterns

### Setup

1. Install Redis:
   ```bash
   # Ubuntu/Debian
   sudo apt install redis-server
   sudo systemctl start redis-server
   
   # macOS
   brew install redis
   brew services start redis
   
   # Docker
   docker run -d -p 6379:6379 redis:alpine
   ```

2. Configure in `.env`:
   ```env
   REDIS_URL=redis://localhost:6379
   ```

3. The cache client auto-connects on first use. If Redis is unavailable, the app falls back to direct database queries.

### Implementation Files

- `apps/web/lib/cache.ts` - Cache client, TTL constants, key generators, `withCache` helper
- API routes - Use `withCache()` to cache responses, `cache.invalidatePattern()` on mutations

## 🔄 Market Value Updates (Cron Job)

The application includes an automated market value update system that runs on a schedule to keep player valuations current.

### Features

- **Automated Daily Updates**: Cron job runs daily at 2:00 AM UTC (configurable)
- **Smart Update Strategy**: Only updates stale players (not updated in last 7 days) by default
- **Comprehensive Algorithm**: Calculates new values based on:
  - Player age and development curve
  - Recent performance statistics
  - Position-based multipliers
  - Club/league tier
  - Market trends and daily volatility
- **Historical Tracking**: All updates are recorded in the `MarketValue` table for audit and visualization
- **Manual Trigger**: Admin API endpoint for immediate updates

### How to Run

#### Option 1: Standalone Cron Runner (Recommended for Production)

Start the cron scheduler as a separate background process:

```bash
cd apps/web
pnpm cron
```

This will:
- Start the cron scheduler with the default daily 2 AM schedule
- Log all update activity to console
- Run until stopped (Ctrl+C)

For production, set up as a systemd service or use a process manager like PM2:

```bash
# Using PM2
cd apps/web
pm2 start npm --name "market-value-cron" -- run cron
```

#### Option 2: Programmatic Scheduler

The scheduler can be imported and controlled programmatically:

```typescript
import { marketValueScheduler } from "@/lib/cron-service";

// Start the scheduler
marketValueScheduler.start();

// Stop the scheduler
marketValueScheduler.stop();

// Run a manual update immediately
await marketValueScheduler.runUpdate();
```

### Manual Updates via API

Admin users can trigger updates manually through the API:

```bash
# Update only stale players (default)
curl -X POST http://localhost:3000/api/admin/market-values/update \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Force update all players
curl -X POST "http://localhost:3000/api/admin/market-values/update?all=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get update statistics
curl http://localhost:3000/api/admin/market-values/update \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Configuration

Change the cron schedule by setting a custom cron expression when instantiating the scheduler:

```typescript
const scheduler = new MarketValueScheduler("0 */6 * * *"); // Every 6 hours
```

Common cron patterns:
- `0 2 * * *` - Daily at 2 AM (default)
- `0 */6 * * *` - Every 6 hours
- `*/30 * * * *` - Every 30 minutes
- `0 0 * * 0` - Weekly on Sunday at midnight

### Display on UI

Market value displays on player profiles now include:
- **As of** timestamp showing the last update date
- **Change percentage** indicator (↑/↓ with color coding) compared to previous value
- Smooth color transitions: green for increases, red for decreases, gray for stable

### Data Structure

The system uses two database fields:
- `Player.marketValue` - Current market value (EUR)
- `Player.marketValueDate` - Last update timestamp
- `MarketValue` table - Historical records for charting and audit trail

### Monitoring

Check the scheduler status and statistics:

```typescript
import { marketValueScheduler, getMarketValueStats } from "@/lib/marketValueUpdater";

console.log("Scheduler running:", marketValueScheduler.getIsRunning());
console.log("Next run:", marketValueScheduler.getNextRun());

const stats = await getMarketValueStats();
console.log("Stats:", stats);
```

## 🧪 Testing

Unit tests and E2E tests will be implemented in later phases:

- **Unit**: Jest for API routes and utilities
- **E2E**: Cypress for critical user flows
- **Coverage Target**: >80%

## 📖 Documentation

- **API Guide**: Coming soon
- **Deployment Guide**: Coming soon
- **Contributing**: Coming soon

## 🤝 Contributing

This project is under active development. Fork and submit PRs once ready!

## 📄 License

MIT

## 🔗 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Transfermarkt Official](https://www.transfermarkt.com)

---

**Status**: Phase 3 in progress - Homepage, Player Profile, and Team pages complete ✅