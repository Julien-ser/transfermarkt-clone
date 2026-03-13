#!/bin/bash

# Transfermarkt Clone - Database Setup Script
# This script sets up PostgreSQL and initializes the database

set -e  # Exit on any error

echo "=========================================="
echo "Transfermarkt Clone - Database Setup"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "Please install PostgreSQL first:"
    echo "  Ubuntu/Debian: sudo apt update && sudo apt install postgresql postgresql-contrib"
    echo "  macOS: brew install postgresql"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Check if PostgreSQL service is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "⚠️  PostgreSQL is not running. Starting service..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    elif command -v service &> /dev/null; then
        sudo service postgresql start
    else
        echo "❌ Cannot start PostgreSQL automatically. Please start it manually."
        exit 1
    fi
    echo "✅ PostgreSQL started"
fi

# Check if database exists
if ! psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw transfermarkt_clone; then
    echo "Creating database 'transfermarkt_clone'..."
    createdb -h localhost -U postgres transfermarkt_clone
    echo "✅ Database created"
else
    echo "✅ Database already exists"
fi

# Run Prisma migration
echo ""
echo "Running Prisma migration..."
pnpm db:migrate || npx prisma migrate dev --name init
echo "✅ Migration completed"

# Seed the database
echo ""
echo "Seeding database with sample data..."
pnpm db:seed || npx prisma db seed
echo "✅ Database seeded successfully"

echo ""
echo "=========================================="
echo "✅ Database setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start the development server: pnpm dev"
echo "2. Access Prisma Studio: npx prisma studio"
echo "3. Open your browser: http://localhost:3000"
echo ""
