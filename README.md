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
├── SCHEMA/               # Architecture documentation
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
- [ ] Choose and document tech stack with justifications
- [ ] Initialize monorepo structure with frontend and backend packages

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

### 2. Configure Database

```bash
# Create a PostgreSQL database
createdb transfermarkt_clone

# Set DATABASE_URL in environment
export DATABASE_URL="postgresql://username:password@localhost:5432/transfermarkt_clone"
```

### 3. Generate Prisma Client

```bash
cd prisma
npx prisma generate
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed Sample Data

```bash
npx prisma db seed
```

### 6. Start Development Server

```bash
# Frontend
cd apps/web
pnpm dev

# API (if standalone)
cd apps/api
pnpm dev
```

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