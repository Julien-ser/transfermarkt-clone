// Project-wide type definitions
export interface Player {
  id: string;
  name: string;
  position: string;
  age: number;
  nationality: string;
  teamId: string;
  marketValue: number;
  imageUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  crestUrl?: string;
  leagueId: string;
  founded: number;
  stadium: string;
}

export interface League {
  id: string;
  name: string;
  country: string;
  logoUrl?: string;
  season: string;
}

export interface Transfer {
  id: string;
  playerId: string;
  fromTeamId: string;
  toTeamId: string;
  fee: number;
  date: Date;
  transferType: 'permanent' | 'loan' | 'free';
}

export interface MarketValueHistory {
  id: string;
  playerId: string;
  value: number;
  date: Date;
}
