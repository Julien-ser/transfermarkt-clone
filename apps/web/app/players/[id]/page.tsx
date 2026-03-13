"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, Tabs, Badge, Avatar, Table } from "ui";
import { formatMarketValue, formatDate, getMarketValueChangeIndicator } from "@/lib/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PlayerStats {
  id: number;
  appearances: number;
  starts: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  keyPasses: number;
  tackles: number;
  interceptions: number;
  foulsDrawn: number;
  foulsCommitted: number;
  cleanSheets?: number;
  goalsConceded?: number;
  saves?: number;
  penaltyGoals: number;
  penaltyMissed: number;
  club: {
    id: number;
    name: string;
    logoUrl?: string | null;
  };
  season: {
    id: number;
    year: string;
  };
  competitionType: string;
}

interface PlayerClub {
  id: number;
  playerId: number;
  clubId: number;
  seasonId: number | null;
  joinedDate: string | null;
  leftDate: string | null;
  contractStart: string | null;
  contractEnd: string | null;
  jerseyNumber: number | null;
  isOnLoan: boolean;
  appearances: number;
  goals: number;
  assists: number;
  minutesPlayed: number;
  club: {
    id: number;
    name: string;
    shortName?: string | null;
    logoUrl?: string | null;
    country: {
      id: number;
      name: string;
    };
  };
  season: {
    id: number;
    year: string;
    startDate: string;
    endDate: string;
  } | null;
}

interface Transfer {
  id: number;
  transferDate: string;
  fee: number | null;
  currency: string;
  type: string;
  isUndisclosed: boolean;
  loanDuration?: number | null;
  optionToBuy: boolean;
  fromClub: {
    id: number;
    name: string;
    logoUrl?: string | null;
    country: {
      id: number;
      name: string;
    };
  };
  toClub: {
    id: number;
    name: string;
    logoUrl?: string | null;
    country: {
      id: number;
      name: string;
    };
  };
}

interface MarketValuePoint {
  date: string;
  value: number;
}

interface PlayerData {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string;
  birthPlace?: {
    id: number;
    name: string;
  } | null;
  nationality: {
    id: number;
    name: string;
  };
  position: {
    id: number;
    name: string;
    category: string;
  };
  height?: number | null;
  weight?: number | null;
  foot?: string | null;
  jerseyNumber?: number | null;
  imageUrl?: string | null;
  contractUntil?: string | null;
  marketValue?: number | null;
  marketValueDate?: string | null;
  currentClub?: {
    id: number;
    name: string;
    shortName?: string | null;
    logoUrl?: string | null;
    country: {
      id: number;
      name: string;
    };
  } | null;
  clubs: PlayerClub[];
  transfers: Transfer[];
  stats: PlayerStats[];
  marketValues: {
    id: number;
    value: number;
    currency: string;
    date: string;
  }[];
}

interface PlayerPageProps {
  params: {
    id: string;
  };
}

export default function PlayerPage({ params }: PlayerPageProps) {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchPlayer = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/players/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Player not found");
        }
        throw new Error("Failed to fetch player data");
      }
      
      const data = await response.json();
      setPlayer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

  const getPositionSpecificStats = () => {
    if (!player || player.stats.length === 0) return null;
    
    const latestStats = player.stats[0];
    const position = player.position.category;
    
    if (position === "GK") {
      return (
        <>
          <Table.Row>
            <TableCell>Clean Sheets</TableCell>
            <TableCell>{latestStats.cleanSheets ?? 0}</TableCell>
          </Table.Row>
          <Table.Row>
            <TableCell>Goals Conceded</TableCell>
            <TableCell>{latestStats.goalsConceded ?? 0}</TableCell>
          </Table.Row>
          <Table.Row>
            <TableCell>Saves</TableCell>
            <TableCell>{latestStats.saves ?? 0}</TableCell>
          </Table.Row>
        </>
      );
    }
    
    if (position === "DEF") {
      return (
        <>
          <Table.Row>
            <TableCell>Tackles</TableCell>
            <TableCell>{latestStats.tackles}</TableCell>
          </Table.Row>
          <Table.Row>
            <TableCell>Interceptions</TableCell>
            <TableCell>{latestStats.interceptions}</TableCell>
          </Table.Row>
          <Table.Row>
            <TableCell>Clean Sheets</TableCell>
            <TableCell>{latestStats.cleanSheets ?? 0}</TableCell>
          </Table.Row>
        </>
      );
    }
    
    if (position === "MID") {
      return (
        <>
          <Table.Row>
            <TableCell>Passes</TableCell>
            <TableCell>{latestStats.passes}</TableCell>
          </Table.Row>
          <Table.Row>
            <TableCell>Key Passes</TableCell>
            <TableCell>{latestStats.keyPasses}</TableCell>
          </Table.Row>
          <Table.Row>
            <TableCell>Tackles</TableCell>
            <TableCell>{latestStats.tackles}</TableCell>
          </Table.Row>
        </>
      );
    }
    
    if (position === "FWD") {
      return (
        <>
          <Table.Row>
            <TableCell>Shots</TableCell>
            <TableCell>{latestStats.shots}</TableCell>
          </Table.Row>
          <Table.Row>
            <TableCell>Shots on Target</TableCell>
            <TableCell>{latestStats.shotsOnTarget}</TableCell>
          </Table.Row>
          <Table.Row>
            <TableCell>Fouls Drawn</TableCell>
            <TableCell>{latestStats.foulsDrawn}</TableCell>
          </Table.Row>
        </>
      );
    }
    
    return null;
  };

  const prepareMarketValueData = () => {
    if (!player || !player.marketValues) return [];
    
    return player.marketValues
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(mv => ({
        date: formatDate(mv.date),
        value: mv.value / 1_000_000, // Convert to millions
      }));
  };

  const marketValueData = prepareMarketValueData();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>{error || "Player not found"}</p>
            <Link href="/players" className="mt-4 inline-block text-blue-600 hover:underline">
              ← Back to Players
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const currentStats = player.stats[0];
  const totalAppearances = player.clubs.reduce((sum, club) => sum + club.appearances, 0);
  const totalGoals = player.clubs.reduce((sum, club) => sum + club.goals, 0);
  const totalAssists = player.clubs.reduce((sum, club) => sum + club.assists, 0);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "stats", label: "Statistics" },
    { key: "transfers", label: "Transfer History" },
    { key: "history", label: "Career History" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Player Header */}
      <Card variant="elevated" padding="large" className="mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Player Photo */}
          <div className="flex-shrink-0">
            {player.imageUrl ? (
              <Avatar
                src={player.imageUrl}
                alt={player.fullName}
                size="xl"
                className="border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">
                  {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {player.fullName}
                </h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="primary" size="lg">
                    {player.position.name}
                  </Badge>
                  <Badge variant="secondary" size="lg">
                    {player.nationality.name}
                  </Badge>
                  {player.currentClub && (
                    <Link href={`/teams/${player.currentClub.id}`}>
                      <Badge variant="outline" size="lg" className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                        {player.currentClub.name}
                      </Badge>
                    </Link>
                  )}
                </div>
              </div>

              {/* Market Value */}
              {player.marketValue && (
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Market Value</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatMarketValue(player.marketValue, player.marketValues[0]?.currency)}
                  </div>
                  {player.marketValueDate && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Updated: {formatDate(player.marketValueDate)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatDate(player.birthDate)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ({Math.floor((new Date().getTime() - new Date(player.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years)
                </div>
              </div>
              
              {player.height && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Height</div>
                  <div className="font-medium text-gray-900 dark:text-white">{player.height} cm</div>
                </div>
              )}
              
              {player.weight && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Weight</div>
                  <div className="font-medium text-gray-900 dark:text-white">{player.weight} kg</div>
                </div>
              )}
              
              {player.foot && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Preferred Foot</div>
                  <div className="font-medium text-gray-900 dark:text-white">{player.foot}</div>
                </div>
              )}
              
              {player.birthPlace && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Birth Place</div>
                  <div className="font-medium text-gray-900 dark:text-white">{player.birthPlace.name}</div>
                </div>
              )}
              
              {player.jerseyNumber && player.currentClub && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Jersey Number</div>
                  <div className="font-medium text-gray-900 dark:text-white">#{player.jerseyNumber}</div>
                </div>
              )}
              
              {player.contractUntil && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Contract Until</div>
                  <div className="font-medium text-gray-900 dark:text-white">{formatDate(player.contractUntil)}</div>
                </div>
              )}
            </div>

            {/* Career Totals */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalAppearances}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Appearances</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalGoals}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalAssists}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Assists</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeKey={activeTab}
        onTabChange={(key) => setActiveTab(key as string)}
        className="mb-8"
      >
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Market Value Chart */}
            {marketValueData.length > 0 && (
              <Card variant="elevated" padding="large">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Market Value History
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketValueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#9CA3AF' }}
                        stroke="#6B7280"
                      />
                      <YAxis 
                        tick={{ fill: '#9CA3AF' }}
                        stroke="#6B7280"
                        tickFormatter={(value) => `€${value}m`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`€${value.toFixed(1)}m`, "Market Value"]}
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', r: 3 }}
                        activeDot={{ r: 5 }}
                        name="Market Value (€M)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Latest Stats Summary */}
            {currentStats && (
              <Card variant="elevated" padding="large">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Latest Season Stats ({currentStats.season.year})
                </h2>
                <div className="overflow-x-auto">
                  <Table striped hoverable>
                    <Table.Head>
                      <Table.Row>
                        <Table.Header>Stat</Table.Header>
                        <Table.Header>Value</Table.Header>
                      </Table.Row>
                    </Table.Head>
                    <Table.Body>
                      <Table.Row>
                        <TableCell>Competition</TableCell>
                        <TableCell>{currentStats.competitionType}</TableCell>
                      </Table.Row>
                      <Table.Row>
                        <TableCell>Appearances</TableCell>
                        <TableCell>{currentStats.appearances}</TableCell>
                      </Table.Row>
                      <Table.Row>
                        <TableCell>Starts</TableCell>
                        <TableCell>{currentStats.starts}</TableCell>
                      </Table.Row>
                      <Table.Row>
                        <TableCell>Minutes Played</TableCell>
                        <TableCell>{currentStats.minutesPlayed.toLocaleString()}</TableCell>
                      </Table.Row>
                      <Table.Row>
                        <TableCell>Goals</TableCell>
                        <TableCell className="font-bold text-green-600 dark:text-green-400">{currentStats.goals}</TableCell>
                      </Table.Row>
                      <Table.Row>
                        <TableCell>Assists</TableCell>
                        <TableCell>{currentStats.assists}</TableCell>
                      </Table.Row>
                      {getPositionSpecificStats()}
                      <Table.Row>
                        <TableCell>Yellow Cards</TableCell>
                        <TableCell className="text-yellow-600 dark:text-yellow-400">{currentStats.yellowCards}</TableCell>
                      </Table.Row>
                      <Table.Row>
                        <TableCell>Red Cards</TableCell>
                        <TableCell className="text-red-600 dark:text-red-400">{currentStats.redCards}</TableCell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "stats" && (
          <Card variant="elevated" padding="large">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Season-by-Season Statistics
            </h2>
            {player.stats.length > 0 ? (
              <div className="overflow-x-auto">
                <Table striped hoverable>
                  <Table.Head>
                    <Table.Row>
                      <Table.Header>Season</Table.Header>
                      <Table.Header>Club</Table.Header>
                      <Table.Header>Competition</Table.Header>
                      <Table.Header>Apps</Table.Header>
                      <Table.Header>Goals</Table.Header>
                      <Table.Header>Assists</Table.Header>
                      <Table.Header>Minutes</Table.Header>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {player.stats.map((stat) => (
                      <Table.Row key={`${stat.id}`}>
                        <TableCell>{stat.season.year}</TableCell>
                        <TableCell>
                          <Link href={`/teams/${stat.club.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                            {stat.club.name}
                          </Link>
                        </TableCell>
                        <TableCell>{stat.competitionType}</TableCell>
                        <TableCell>{stat.appearances}</TableCell>
                        <TableCell className="font-bold text-green-600 dark:text-green-400">{stat.goals}</TableCell>
                        <TableCell>{stat.assists}</TableCell>
                        <TableCell>{stat.minutesPlayed.toLocaleString()}</TableCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No statistics available.
              </p>
            )}
          </Card>
        )}

        {/* Transfer History Tab */}
        {activeTab === "transfers" && (
          <Card variant="elevated" padding="large">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Transfer Timeline
            </h2>
            {player.transfers.length > 0 ? (
              <div className="space-y-4">
                {player.transfers.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="border-l-4 border-blue-500 pl-4 py-2 relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-[9px] top-4 w-4 h-4 bg-blue-500 rounded-full"></div>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {transfer.fromClub.logoUrl && (
                            <img
                              src={transfer.fromClub.logoUrl}
                              alt={transfer.fromClub.name}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <span className="font-medium">{transfer.fromClub.name}</span>
                          <span className="text-gray-500">→</span>
                          {transfer.toClub.logoUrl && (
                            <img
                              src={transfer.toClub.logoUrl}
                              alt={transfer.toClub.name}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <span className="font-medium">{transfer.toClub.name}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(transfer.transferDate)} • {transfer.type}
                          {transfer.isUndisclosed ? ' (Undisclosed)' : ''}
                          {transfer.loanDuration && ` (Loan: ${transfer.loanDuration} months)`}
                          {transfer.optionToBuy && ' • Option to buy'}
                        </div>
                      </div>
                      
                      <div className="mt-2 md:mt-0">
                        {transfer.fee ? (
                          <Badge variant="success" size="lg">
                            {formatMarketValue(transfer.fee, transfer.currency)}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" size="lg">
                            Free/Loan
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No transfer history available.
              </p>
            )}
          </Card>
        )}

        {/* Career History Tab */}
        {activeTab === "history" && (
          <Card variant="elevated" padding="large">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Career History
            </h2>
            {player.clubs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table striped hoverable>
                  <Table.Head>
                    <Table.Row>
                      <Table.Header>Period</Table.Header>
                      <Table.Header>Club</Table.Header>
                      <Table.Header>Country</Table.Header>
                      <Table.Header>Season</Table.Header>
                      <Table.Header>Apps</Table.Header>
                      <Table.Header>Goals</Table.Header>
                      <Table.Header>Assists</Table.Header>
                      <Table.Header>Jersey</Table.Header>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {player.clubs.map((club) => (
                      <Table.Row key={club.id}>
                        <TableCell>
                          {club.joinedDate && formatDate(club.joinedDate)}
                          {club.leftDate && ` - ${formatDate(club.leftDate)}`}
                          {!club.joinedDate && 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Link href={`/teams/${club.club.id}`} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                            {club.club.logoUrl && (
                              <img
                                src={club.club.logoUrl}
                                alt={club.club.name}
                                className="w-5 h-5 object-contain"
                              />
                            )}
                            {club.club.name}
                            {club.isOnLoan && (
                              <Badge variant="warning" size="sm">Loan</Badge>
                            )}
                          </Link>
                        </TableCell>
                        <TableCell>{club.club.country.name}</TableCell>
                        <TableCell>{club.season?.year || 'N/A'}</TableCell>
                        <TableCell>{club.appearances}</TableCell>
                        <TableCell className="font-bold text-green-600 dark:text-green-400">{club.goals}</TableCell>
                        <TableCell>{club.assists}</TableCell>
                        <TableCell>{club.jerseyNumber || '-'}</TableCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No career history available.
              </p>
            )}
          </Card>
        )}
      </Tabs>
    </div>
  );
}
