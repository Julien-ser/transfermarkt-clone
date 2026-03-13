-- Database Schema for Transfermarkt Clone (PostgreSQL)
-- Generated from Prisma schema

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- League/Competition table
CREATE TABLE League (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    season VARCHAR(20) NOT NULL,
    logo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Season table
CREATE TABLE Season (
    id SERIAL PRIMARY KEY,
    league_id INTEGER NOT NULL,
    year VARCHAR(20) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (league_id) REFERENCES League(id) ON DELETE CASCADE
);

-- Club/Team table
CREATE TABLE Club (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    founded INTEGER,
    stadium VARCHAR(255),
    stadium_capacity INTEGER,
    website TEXT,
    logo TEXT,
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    league_id INTEGER,
    current_league_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (league_id) REFERENCES League(id) ON DELETE SET NULL,
    FOREIGN KEY (current_league_id) REFERENCES League(id) ON DELETE SET NULL
);

-- ClubSeason junction table
CREATE TABLE ClubSeason (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL,
    league_id INTEGER NOT NULL,
    season VARCHAR(20) NOT NULL,
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES Club(id) ON DELETE CASCADE,
    FOREIGN KEY (league_id) REFERENCES League(id) ON DELETE CASCADE,
    UNIQUE(club_id, league_id, season)
);

-- Player table
CREATE TABLE Player (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date TIMESTAMP,
    birth_place VARCHAR(255),
    nationality VARCHAR(100)[],
    position VARCHAR(100),
    height INTEGER,
    weight INTEGER,
    foot VARCHAR(10),
    current_club_id INTEGER,
    contract_until TIMESTAMP,
    market_value DECIMAL(15, 2),
    market_value_currency VARCHAR(10) DEFAULT 'EUR',
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (current_club_id) REFERENCES Club(id) ON DELETE SET NULL
);

-- Transfer table
CREATE TABLE Transfer (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    from_club_id INTEGER NOT NULL,
    to_club_id INTEGER NOT NULL,
    transfer_date TIMESTAMP NOT NULL,
    transfer_type VARCHAR(50) NOT NULL,
    fee DECIMAL(15, 2),
    fee_currency VARCHAR(10) DEFAULT 'EUR',
    loan_fee DECIMAL(15, 2),
    loan_duration INTEGER,
    option_to_buy BOOLEAN DEFAULT FALSE,
    option_fee DECIMAL(15, 2),
    contract_until TIMESTAMP,
    source_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES Player(id) ON DELETE CASCADE,
    FOREIGN KEY (from_club_id) REFERENCES Club(id) ON DELETE CASCADE,
    FOREIGN KEY (to_club_id) REFERENCES Club(id) ON DELETE CASCADE
);

-- PlayerStat table
CREATE TABLE PlayerStat (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    season VARCHAR(20) NOT NULL,
    competition VARCHAR(255) NOT NULL,
    appearances INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    shots INTEGER DEFAULT 0,
    shots_on_target INTEGER DEFAULT 0,
    passes INTEGER DEFAULT 0,
    key_passes INTEGER DEFAULT 0,
    tackles INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES Player(id) ON DELETE CASCADE,
    UNIQUE(player_id, season, competition)
);

-- MarketValue table
CREATE TABLE MarketValue (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    date TIMESTAMP NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES Player(id) ON DELETE CASCADE,
    UNIQUE(player_id, date)
);

-- ContractHistory table
CREATE TABLE ContractHistory (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    club_id INTEGER NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    jersey_number INTEGER,
    salary DECIMAL(15, 2),
    clauses TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES Player(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES Club(id) ON DELETE CASCADE
);

-- User table (for authentication)
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password VARCHAR(255),
    image TEXT,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session table
CREATE TABLE Session (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    session_token VARCHAR(255) UNIQUE,
    access_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- WatchlistItem table
CREATE TABLE WatchlistItem (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    player_id INTEGER,
    club_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES Player(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES Club(id) ON DELETE CASCADE,
    UNIQUE(user_id, player_id),
    UNIQUE(user_id, club_id)
);

-- Indexes for performance
CREATE INDEX idx_player_name ON Player(name);
CREATE INDEX idx_player_current_club ON Player(current_club_id);
CREATE INDEX idx_player_market_value ON Player(market_value);
CREATE INDEX idx_transfer_player_date ON Transfer(player_id, transfer_date);
CREATE INDEX idx_transfer_clubs ON Transfer(from_club_id, to_club_id);
CREATE INDEX idx_transfer_date ON Transfer(transfer_date);
CREATE INDEX idx_club_league ON Club(league_id);
CREATE INDEX idx_player_stat_lookup ON PlayerStat(player_id, season, competition);
CREATE INDEX idx_market_value_lookup ON MarketValue(player_id, date);
CREATE INDEX idx_user_email ON "User"(email);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_league_updated_at BEFORE UPDATE ON League
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_updated_at BEFORE UPDATE ON Club
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_updated_at BEFORE UPDATE ON Player
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();