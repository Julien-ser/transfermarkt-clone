"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Card, Tabs, Badge, Avatar, Table, Select, Button } from "ui";
import { formatDate } from "@/lib/format";

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string;
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
  PlayerClub: {
    id: number;
    appearances: number;
    goals: number;
    assists: number;
    minutesPlayed: number;
    season: {
      id: number;
      year: string;
    } | null;
  };
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
  player: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    position: {
      id: number;
      name: string;
      category: string;
    };
    imageUrl?: string | null;
  };
}

interface TeamData {
  id: number;
  name: string;
  shortName?: string | null;
  slug: string;
  foundedYear?: number | null;
  stadiumName?: string | null;
  stadiumCapacity?: number | null;
  website?: string | null;
  logoUrl?: string | null;
  country: {
    id: number;
    name: string;
    code?: string | null;
    flagUrl?: string | null;
  };
  currentPlayers: Player[];
  transfersFrom: Transfer[];
  transfersTo: Transfer[];
  playerStats: Array<{
    id: number;
    player: {
      id: number;
      firstName: string;
      lastName: string;
      fullName: string;
      position: {
        id: number;
        name: string;
        category: string;
      };
      imageUrl?: string | null;
    };
    season: {
      id: number;
      year: string;
    };
    appearances: number;
    goals: number;
    assists: number;
    minutesPlayed: number;
    competitionType: string;
  }>;
  seasons: Array<{
    id: number;
    season: {
      id: number;
      year: string;
    };
    rank?: number | null;
    points?: number | null;
    averageAge?: number | null;
    foreignPlayers?: number | null;
    totalMarketValue?: number | null;
  }>;
}

interface TeamPageProps {
  params: {
    id: string;
  };
}

export default function TeamPage({ params }: TeamPageProps) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [positionFilter, setPositionFilter] = useState<string>("ALL");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Player | 'jerseyNumber' | 'marketValue' | 'age';
    direction: 'asc' | 'desc';
  }>({ key: 'jerseyNumber', direction: 'asc' });

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/clubs/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Team not found");
        }
        throw new Error("Failed to fetch team data");
      }

      const data = await response.json();
      setTeam(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const positionCategories = useMemo(() => {
    if (!team) return [];
    const positions = new Set(
      team.currentPlayers
        .map((p) => p.position.category)
        .filter((category): category is string => category !== null)
    );
    return ["ALL", ...Array.from(positions)];
  }, [team]);

  const filteredAndSortedPlayers = useMemo(() => {
    if (!team) return [];

    let filtered = team.currentPlayers;

    if (positionFilter !== "ALL") {
      filtered = filtered.filter((p) => p.position.category === positionFilter);
    }

    return [...filtered].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortConfig.key) {
        case 'jerseyNumber':
          aValue = a.jerseyNumber ?? Infinity;
          bValue = b.jerseyNumber ?? Infinity;
          break;
        case 'marketValue':
          aValue = a.marketValue ?? 0;
          bValue = b.marketValue ?? 0;
          break;
        case 'age':
          aValue = new Date(a.birthDate);
          bValue = new Date(b.birthDate);
          break;
        case 'firstName':
          aValue = a.firstName.toLowerCase();
          bValue = b.firstName.toLowerCase();
          break;
        case 'lastName':
          aValue = a.lastName.toLowerCase();
          bValue = b.lastName.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  }, [team, positionFilter, sortConfig]);

  const handleSort = (key: keyof Player | 'jerseyNumber' | 'marketValue' | 'age') => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIndicator = (columnKey: keyof Player | 'jerseyNumber' | 'marketValue' | 'age') => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const totalMarketValue = useMemo(() => {
    if (!team) return 0;
    return team.currentPlayers.reduce((sum, player) => sum + (player.marketValue ?? 0), 0);
  }, [team]);

  const averageAge = useMemo(() => {
    if (!team) return 0;
    const ages = team.currentPlayers.map((player) => {
      const birthDate = new Date(player.birthDate);
      const today = new Date();
      return Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
    });
    return ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;
  }, [team]);

  const foreignPlayersCount = useMemo(() => {
    if (!team) return 0;
    return team.currentPlayers.filter((p) => p.nationality.name !== team.country.name).length;
  }, [team]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
              </div>
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>{error || "Team not found"}</p>
            <Link href="/teams" className="mt-4 inline-block text-blue-600 hover:underline">
              ← Back to Teams
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Squad" },
    { key: "stats", label: "Statistics" },
    { key: "transfers", label: "Transfer History" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Team Header */}
      <Card variant="elevated" padding="large" className="mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Team Logo */}
          <div className="flex-shrink-0">
            {team.logoUrl ? (
              <Avatar
                src={team.logoUrl}
                alt={team.name}
                size="xlarge"
                className="border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">
                  {team.shortName?.[0] ?? team.name[0]}
                </span>
              </div>
            )}
          </div>

          {/* Team Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {team.name}
                  {team.shortName && (
                    <span className="ml-2 text-lg font-normal text-gray-600 dark:text-gray-400">
                      ({team.shortName})
                    </span>
                  )}
                </h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="primary" size="lg">
                    {team.country.name}
                  </Badge>
                  {team.foundedYear && (
                    <Badge variant="secondary" size="lg">
                      Founded {team.foundedYear}
                    </Badge>
                  )}
                  {team.stadiumName && (
                    <Badge variant="outline" size="lg">
                      {team.stadiumName}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Squad Stats */}
              <div className="text-right space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">Squad Size</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {team.currentPlayers.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Market Value</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  €{(totalMarketValue / 1_000_000).toFixed(1)}m
                </div>
              </div>
            </div>

            {/* Team Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {team.stadiumCapacity && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Stadium Capacity</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {team.stadiumCapacity.toLocaleString()}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Age</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {averageAge.toFixed(1)} years
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Foreign Players</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {foreignPlayersCount} / {team.currentPlayers.length}
                </div>
              </div>

              {team.website && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Website</div>
                  <a
                    href={team.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Visit Site
                  </a>
                </div>
              )}
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
          <div className="space-y-6">
            {/* Squad Filters */}
            <Card variant="outlined" padding="medium">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Position
                  </label>
                  <Select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    options={positionCategories.map((pos) => ({
                      value: pos,
                      label: pos === "ALL" ? "All Positions" : pos,
                    }))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortConfig({ key: 'jerseyNumber', direction: 'asc' })
                    }
                  >
                    Sort by Jersey{getSortIndicator('jerseyNumber')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortConfig({ key: 'marketValue', direction: 'desc' })
                    }
                  >
                    Sort by Value{getSortIndicator('marketValue')}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Squad Table */}
            <Card variant="elevated" padding="large">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Current Squad ({filteredAndSortedPlayers.length} players)
              </h2>
              {filteredAndSortedPlayers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table striped hoverable>
                    <Table.Head>
                      <Table.Row>
                        <Table.Header>Player</Table.Header>
                        <Table.Header>Position</Table.Header>
                        <Table.Header>Nationality</Table.Header>
                        <Table.Header
                          onClick={() => handleSort('jerseyNumber')}
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Jersey{getSortIndicator('jerseyNumber')}
                        </Table.Header>
                        <Table.Header
                          onClick={() => handleSort('age')}
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Age{getSortIndicator('age')}
                        </Table.Header>
                        <Table.Header
                          onClick={() => handleSort('marketValue')}
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Market Value{getSortIndicator('marketValue')}
                        </Table.Header>
                        <Table.Header>Contract Until</Table.Header>
                      </Table.Row>
                    </Table.Head>
                    <Table.Body>
                      {filteredAndSortedPlayers.map((player) => {
                        const age = Math.floor(
                          (new Date().getTime() - new Date(player.birthDate).getTime()) /
                            (1000 * 60 * 60 * 24 * 365)
                        );
                        const latestStats = player.PlayerClub[0];

                        return (
                          <Table.Row key={player.id}>
                            <TableCell>
                              <Link
                                href={`/players/${player.id}`}
                                className="flex items-center gap-3 hover:underline"
                              >
                                {player.imageUrl ? (
                                  <Avatar
                                    src={player.imageUrl}
                                    alt={player.fullName}
                                    size="sm"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                                    {player.firstName[0]}{player.lastName[0]}
                                  </div>
                                )}
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {player.fullName}
                                </span>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge variant="primary" size="sm">
                                {player.position.name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {player.nationality.name}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {player.jerseyNumber ?? '-'}
                            </TableCell>
                            <TableCell>{age}</TableCell>
                            <TableCell>
                              {player.marketValue ? (
                                <span className="font-bold text-green-600 dark:text-green-400">
                                  €{(player.marketValue / 1_000_000).toFixed(1)}m
                                </span>
                              ) : (
                                <span className="text-gray-500">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {player.contractUntil ? (
                                <span className="text-gray-900 dark:text-white">
                                  {formatDate(player.contractUntil)}
                                </span>
                              ) : (
                                <span className="text-gray-500">N/A</span>
                              )}
                            </TableCell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No players found for the selected filter.
                </p>
              )}
            </Card>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Team Statistics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card variant="elevated" padding="large">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {team.currentPlayers.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Players</div>
                </div>
              </Card>
              <Card variant="elevated" padding="large">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    €{(totalMarketValue / 1_000_000).toFixed(1)}m
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Market Value</div>
                </div>
              </Card>
              <Card variant="elevated" padding="large">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {averageAge.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Age</div>
                </div>
              </Card>
              <Card variant="elevated" padding="large">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {foreignPlayersCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Foreign Players</div>
                </div>
              </Card>
            </div>

            {/* Position Breakdown */}
            <Card variant="elevated" padding="large">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Squad Composition by Position
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["GK", "DEF", "MID", "FWD"].map((category) => {
                  const count = team.currentPlayers.filter(
                    (p) => p.position.category === category
                  ).length;
                  const totalValue = team.currentPlayers
                    .filter((p) => p.position.category === category)
                    .reduce((sum, p) => sum + (p.marketValue ?? 0), 0);

                  return (
                    <Card key={category} variant="outlined" padding="medium">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {count}
                        </div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {category}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          €{(totalValue / 1_000_000).toFixed(1)}m total value
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>

            {/* Season Statistics */}
            {team.playerStats.length > 0 && (
              <Card variant="elevated" padding="large">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Season Statistics
                </h2>
                <div className="overflow-x-auto">
                  <Table striped hoverable>
                    <Table.Head>
                      <Table.Row>
                        <Table.Header>Season</Table.Header>
                        <Table.Header>Competition</Table.Header>
                        <Table.Header>Player</Table.Header>
                        <Table.Header>Apps</Table.Header>
                        <Table.Header>Goals</Table.Header>
                        <Table.Header>Assists</Table.Header>
                        <Table.Header>Minutes</Table.Header>
                      </Table.Row>
                    </Table.Head>
                    <Table.Body>
                      {team.playerStats.map((stat) => (
                        <Table.Row key={stat.id}>
                          <TableCell>{stat.season.year}</TableCell>
                          <TableCell>{stat.competitionType}</TableCell>
                          <TableCell>
                            <Link
                              href={`/players/${stat.player.id}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {stat.player.fullName}
                            </Link>
                          </TableCell>
                          <TableCell>{stat.appearances}</TableCell>
                          <TableCell className="font-bold text-green-600 dark:text-green-400">
                            {stat.goals}
                          </TableCell>
                          <TableCell>{stat.assists}</TableCell>
                          <TableCell>{stat.minutesPlayed.toLocaleString()}</TableCell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Transfer History Tab */}
        {activeTab === "transfers" && (
          <div className="space-y-6">
            {/* Inbound Transfers */}
            <Card variant="elevated" padding="large">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Inbound Transfers ({team.transfersTo.length})
              </h2>
              {team.transfersTo.length > 0 ? (
                <div className="space-y-4">
                  {team.transfersTo.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="border-l-4 border-green-500 pl-4 py-2 relative"
                    >
                      <div className="absolute -left-[9px] top-4 w-4 h-4 bg-green-500 rounded-full"></div>

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {transfer.player.imageUrl && (
                              <Avatar
                                src={transfer.player.imageUrl}
                                alt={transfer.player.fullName}
                                size="sm"
                              />
                            )}
                            <Link
                              href={`/players/${transfer.player.id}`}
                              className="font-medium text-gray-900 dark:text-white hover:underline"
                            >
                              {transfer.player.fullName}
                            </Link>
                            <Badge variant="secondary" size="sm">
                              {transfer.player.position.name}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            From: {transfer.fromClub.name} ({transfer.fromClub.country.name})
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(transfer.transferDate)} • {transfer.type}
                            {transfer.loanDuration && ` (Loan: ${transfer.loanDuration} months)`}
                            {transfer.optionToBuy && ' • Option to buy'}
                          </div>
                        </div>

                        <div className="mt-2 md:mt-0">
                          {transfer.fee ? (
                            <Badge variant="success" size="lg">
                              {transfer.fee >= 1_000_000
                                ? `€${(transfer.fee / 1_000_000).toFixed(1)}m`
                                : `€${(transfer.fee / 1_000).toFixed(1)}k`}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" size="lg">
                              {transfer.isUndisclosed ? 'Undisclosed' : 'Free/Loan'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No inbound transfers recorded.
                </p>
              )}
            </Card>

            {/* Outbound Transfers */}
            <Card variant="elevated" padding="large">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Outbound Transfers ({team.transfersFrom.length})
              </h2>
              {team.transfersFrom.length > 0 ? (
                <div className="space-y-4">
                  {team.transfersFrom.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="border-l-4 border-red-500 pl-4 py-2 relative"
                    >
                      <div className="absolute -left-[9px] top-4 w-4 h-4 bg-red-500 rounded-full"></div>

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {transfer.player.imageUrl && (
                              <Avatar
                                src={transfer.player.imageUrl}
                                alt={transfer.player.fullName}
                                size="sm"
                              />
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {transfer.player.fullName}
                            </span>
                            <Badge variant="secondary" size="sm">
                              {transfer.player.position.name}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            To: {transfer.toClub.name} ({transfer.toClub.country.name})
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(transfer.transferDate)} • {transfer.type}
                            {transfer.loanDuration && ` (Loan: ${transfer.loanDuration} months)`}
                            {transfer.optionToBuy && ' • Option to buy'}
                          </div>
                        </div>

                        <div className="mt-2 md:mt-0">
                          {transfer.fee ? (
                            <Badge variant="success" size="lg">
                              {transfer.fee >= 1_000_000
                                ? `€${(transfer.fee / 1_000_000).toFixed(1)}m`
                                : `€${(transfer.fee / 1_000).toFixed(1)}k`}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" size="lg">
                              {transfer.isUndisclosed ? 'Undisclosed' : 'Free/Loan'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No outbound transfers recorded.
                </p>
              )}
            </Card>
          </div>
        )}
      </Tabs>
    </div>
  );
}
