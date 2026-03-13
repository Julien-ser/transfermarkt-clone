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
- **Redis** for caching (planned)

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
- [x] **Define Feature Scope & Requirements** ✅
  - Comprehensive MVP and full feature list
  - Prioritized feature specifications
  - Success metrics and definition of done
  - [View Requirements →](./DOCUMENTATION/requirements.md)
- [x] **Database Schema Defined** ✅
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
- [ ] **Set up Prisma with PostgreSQL** ⚠️ In Progress
  - ✅ Prisma schema defined (see `prisma/schema.prisma`)
  - ✅ Prisma Client generated successfully
  - ⚠️ PostgreSQL database connection pending (see setup options below)
  - ✅ Initial migration script ready (`prisma/migrations/20260313124109_init`)
  - ✅ Seed script ready with sample data (`prisma/seed.ts`)
  - 📝 **Next step**: Install and start PostgreSQL, then run `prisma migrate dev` and `prisma db seed`

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

**Status**: Phase 1 in progress - Database schema complete ✅