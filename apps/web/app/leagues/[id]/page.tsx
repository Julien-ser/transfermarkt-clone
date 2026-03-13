"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Card, Badge, Avatar, Button } from "ui";
import { formatDate } from "@/lib/format";

interface FormMatch {
  result: 'W' | 'D' | 'L';
  isHome: boolean;
  opponent: string;
  date: string;
}

interface Standing {
  rank: number;
  club: {
    id: number;
    name: string;
    shortName?: string | null;
    slug: string;
    logoUrl?: string | null;
    country: {
      id: number;
      name: string;
      code?: string | null;
      flagUrl?: string | null;
    };
  };
  season: {
    id: number;
    year: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  home: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
  };
  away: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
  };
  averageAge?: number | null;
  totalMarketValue?: number | null;
  foreignPlayers?: number | null;
  form: FormMatch[];
}

interface Competition {
  id: number;
  name: string;
  type: string;
  country?: {
    id: number;
    name: string;
    code?: string | null;
    flagUrl?: string | null;
  } | null;
  logoUrl?: string | null;
}

interface LeaguePageProps {
  params: {
    id: string;
  };
}

export default function LeaguePage({ params }: LeaguePageProps) {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Standing | 'club.name' | 'club.country.name';
    direction: 'asc' | 'desc';
  }>({ key: 'rank', direction: 'asc' });
  const [showHomeAway, setShowHomeAway] = useState(false);

  const fetchCompetition = useCallback(async () => {
    try {
      const response = await fetch(`/api/competitions/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Competition not found");
        }
        throw new Error("Failed to fetch competition data");
      }
      const data = await response.json();
      setCompetition(data);
    } catch (err) {
      console.error("Error fetching competition:", err);
    }
  }, [params.id]);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/competitions/${params.id}/standings`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Standings not found");
        }
        throw new Error("Failed to fetch standings");
      }

      const data = await response.json();
      setStandings(data.standings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchCompetition();
    fetchStandings();
  }, [fetchCompetition, fetchStandings]);

  const getResultColor = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W': return 'bg-green-500 text-white';
      case 'D': return 'bg-yellow-500 text-white';
      case 'L': return 'bg-red-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const sortedStandings = useMemo(() => {
    if (!standings.length) return [];

    const sorted = [...standings].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'club.name':
          aValue = a.club.name.toLowerCase();
          bValue = b.club.name.toLowerCase();
          break;
        case 'club.country.name':
          aValue = a.club.country.name.toLowerCase();
          bValue = b.club.country.name.toLowerCase();
          break;
        case 'played':
          aValue = a.played;
          bValue = b.played;
          break;
        case 'won':
          aValue = a.won;
          bValue = b.won;
          break;
        case 'drawn':
          aValue = a.drawn;
          bValue = b.drawn;
          break;
        case 'lost':
          aValue = a.lost;
          bValue = b.lost;
          break;
        case 'gf':
          aValue = a.gf;
          bValue = b.gf;
          break;
        case 'ga':
          aValue = a.ga;
          bValue = b.ga;
          break;
        case 'gd':
          aValue = a.gd;
          bValue = b.gd;
          break;
        case 'points':
          aValue = a.points;
          bValue = b.points;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return 0;
    });

    // Reassign ranks based on sorted order (except for points sorting which should follow standard ranking)
    if (sortConfig.key !== 'points' && sortConfig.key !== 'rank') {
      // For other sorts, we keep the original rankings based on points
      return sorted;
    }

    return sorted;
  }, [standings, sortConfig]);

  const handleSort = (key: keyof Standing | 'club.name' | 'club.country.name') => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIndicator = (columnKey: keyof Standing | 'club.name' | 'club.country.name') => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const exportToCSV = useCallback(() => {
    if (!standings.length) return;

    const headers = [
      'Rank',
      'Club',
      'Country',
      'Played',
      'Won',
      'Drawn',
      'Lost',
      'GF',
      'GA',
      'GD',
      'Points',
      'Home Played',
      'Home Won',
      'Home Drawn',
      'Home Lost',
      'Home GF',
      'Home GA',
      'Home GD',
      'Away Played',
      'Away Won',
      'Away Drawn',
      'Away Lost',
      'Away GF',
      'Away GA',
      'Away GD',
      'Form',
    ];

    const rows = sortedStandings.map((standing) => [
      standing.rank.toString(),
      `"${standing.club.name}"`,
      `"${standing.club.country.name}"`,
      standing.played.toString(),
      standing.won.toString(),
      standing.drawn.toString(),
      standing.lost.toString(),
      standing.gf.toString(),
      standing.ga.toString(),
      standing.gd.toString(),
      standing.points.toString(),
      standing.home.played.toString(),
      standing.home.won.toString(),
      standing.home.drawn.toString(),
      standing.home.lost.toString(),
      standing.home.gf.toString(),
      standing.home.ga.toString(),
      standing.home.gd.toString(),
      standing.away.played.toString(),
      standing.away.won.toString(),
      standing.away.drawn.toString(),
      standing.away.lost.toString(),
      standing.away.gf.toString(),
      standing.away.ga.toString(),
      standing.away.gd.toString(),
      `"${standing.form.map(f => f.result).join('-')}"`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${competition?.name || 'league'}-standings-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [standings, sortedStandings, competition]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>{error || "Competition not found"}</p>
            <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Competition Header */}
      <Card variant="elevated" padding="large" className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {competition.logoUrl && (
            <Avatar
              src={competition.logoUrl}
              alt={competition.name}
              size="xlarge"
              className="border-4 border-white shadow-lg"
            />
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {competition.name}
              </h1>
              {competition.country && (
                <Badge variant="primary" size="large">
                  {competition.country.name}
                </Badge>
              )}
              <Badge variant="default" size="large">
                {competition.type}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Season standings with home/away splits
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowHomeAway(!showHomeAway)}
            >
              {showHomeAway ? 'Hide Home/Away' : 'Show Home/Away'}
            </Button>
            <Button variant="primary" onClick={exportToCSV}>
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Standings Table */}
      <Card variant="elevated" padding="large">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('rank')}
                >
                  Rank{getSortIndicator('rank')}
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('club.name')}
                >
                  Club{getSortIndicator('club.name')}
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('club.country.name')}
                >
                  Country{getSortIndicator('club.country.name')}
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('played')}
                  title="Matches Played"
                >
                  P{getSortIndicator('played')}
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('won')}
                  title="Won"
                >
                  W{getSortIndicator('won')}
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('drawn')}
                  title="Drawn"
                >
                  D{getSortIndicator('drawn')}
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('lost')}
                  title="Lost"
                >
                  L{getSortIndicator('lost')}
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('gf')}
                  title="Goals For"
                >
                  GF{getSortIndicator('gf')}
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('ga')}
                  title="Goals Against"
                >
                  GA{getSortIndicator('ga')}
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('gd')}
                  title="Goal Difference"
                >
                  GD{getSortIndicator('gd')}
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 bg-green-50 dark:bg-green-900/20"
                  onClick={() => handleSort('points')}
                  title="Points"
                >
                  Pts{getSortIndicator('points')}
                </th>
                {showHomeAway && (
                  <>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Home Played"
                    >
                      HP
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Home Won"
                    >
                      HW
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Home Drawn"
                    >
                      HD
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Home Lost"
                    >
                      HL
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Home GF"
                    >
                      HGF
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Home GA"
                    >
                      HGA
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Home GD"
                    >
                      HGD
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Away Played"
                    >
                      AP
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Away Won"
                    >
                      AW
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Away Drawn"
                    >
                      AD
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Away Lost"
                    >
                      AL
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Away GF"
                    >
                      AGF
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Away GA"
                    >
                      AGA
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Away GD"
                    >
                      AGD
                    </th>
                  </>
                )}
                <th 
                  scope="col" 
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  title="Last 5 Matches Form"
                >
                  Form
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {sortedStandings.map((standing, index) => (
                <tr 
                  key={standing.club.id} 
                  className={`${index % 2 === 1 ? 'bg-gray-50 dark:bg-gray-900/50' : ''} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150`}
                >
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    {standing.rank}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        {standing.club.logoUrl ? (
                          <Avatar
                            src={standing.club.logoUrl}
                            alt={standing.club.name}
                            size="small"
                            className="border border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {standing.club.shortName?.[0] ?? standing.club.name[0]}
                          </div>
                        )}
                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                          <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 shadow-lg min-w-[200px]">
                            <div className="font-bold mb-1">{standing.club.name}</div>
                            {standing.club.country && (
                              <div className="text-gray-300">
                                {standing.club.country.name}
                              </div>
                            )}
                            {standing.totalMarketValue && (
                              <div className="text-gray-300 mt-1">
                                MV: €{(standing.totalMarketValue / 1_000_000).toFixed(1)}m
                              </div>
                            )}
                            {standing.averageAge && (
                              <div className="text-gray-300">
                                Avg Age: {standing.averageAge.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Link
                          href={`/teams/${standing.club.id}`}
                          className="font-medium text-gray-900 dark:text-white hover:underline"
                        >
                          {standing.club.name}
                        </Link>
                        {standing.club.shortName && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {standing.club.shortName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {standing.club.country.name}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900 dark:text-white">
                    {standing.played}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-bold text-green-600 dark:text-green-400">
                    {standing.won}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">
                    {standing.drawn}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-bold text-red-600 dark:text-red-400">
                    {standing.lost}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900 dark:text-white">
                    {standing.gf}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">
                    {standing.ga}
                  </td>
                  <td className={`px-3 py-4 whitespace-nowrap text-sm text-center font-bold ${standing.gd > 0 ? 'text-green-600 dark:text-green-400' : standing.gd < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {standing.gd > 0 ? '+' : ''}{standing.gd}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
                    {standing.points}
                  </td>
                  {showHomeAway && (
                    <>
                      {/* Home Stats */}
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center text-gray-600 dark:text-gray-300">
                        {standing.home.played}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center font-bold text-green-600 dark:text-green-400">
                        {standing.home.won}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center text-gray-600 dark:text-gray-300">
                        {standing.home.drawn}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center font-bold text-red-600 dark:text-red-400">
                        {standing.home.lost}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center font-bold text-gray-700 dark:text-gray-200">
                        {standing.home.gf}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center text-gray-600 dark:text-gray-300">
                        {standing.home.ga}
                      </td>
                      <td className={`px-2 py-2 whitespace-nowrap text-xs text-center font-bold ${standing.home.gd > 0 ? 'text-green-600' : standing.home.gd < 0 ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'}`}>
                        {standing.home.gd > 0 ? '+' : ''}{standing.home.gd}
                      </td>
                      {/* Away Stats */}
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center text-gray-600 dark:text-gray-300">
                        {standing.away.played}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center font-bold text-green-600 dark:text-green-400">
                        {standing.away.won}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center text-gray-600 dark:text-gray-300">
                        {standing.away.drawn}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center font-bold text-red-600 dark:text-red-400">
                        {standing.away.lost}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center font-bold text-gray-700 dark:text-gray-200">
                        {standing.away.gf}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center text-gray-600 dark:text-gray-300">
                        {standing.away.ga}
                      </td>
                      <td className={`px-2 py-2 whitespace-nowrap text-xs text-center font-bold ${standing.away.gd > 0 ? 'text-green-600' : standing.away.gd < 0 ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'}`}>
                        {standing.away.gd > 0 ? '+' : ''}{standing.away.gd}
                      </td>
                    </>
                  )}
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex justify-center gap-1">
                      {standing.form.slice(0, 5).map((match, idx) => (
                        <div
                          key={idx}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getResultColor(match.result)}`}
                          title={`${match.opponent} - ${match.isHome ? 'H' : 'A'} - ${match.result}`}
                        >
                          {match.result}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
