import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create positions
  const positions = await prisma.position.createMany({
    data: [
      { name: 'Goalkeeper', category: 'GK' },
      { name: 'Defender', category: 'DEF' },
      { name: 'Midfielder', category: 'MID' },
      { name: 'Forward', category: 'FWD' },
    ],
    skipDuplicates: true,
  })
  console.log(`✓ Created ${positions.count} positions`)

  // Get positions for reference
  const gk = await prisma.position.findFirst({ where: { category: 'GK' } })
  const def = await prisma.position.findFirst({ where: { category: 'DEF' } })
  const mid = await prisma.position.findFirst({ where: { category: 'MID' } })
  const fwd = await prisma.position.findFirst({ where: { category: 'FWD' } })

  // Create countries
  const countries = await prisma.country.createMany({
    data: [
      { name: 'England', code: 'GBR', flagUrl: 'https://flagcdn.com/w320/gb.png' },
      { name: 'Spain', code: 'ESP', flagUrl: 'https://flagcdn.com/w320/es.png' },
      { name: 'Germany', code: 'DEU', flagUrl: 'https://flagcdn.com/w320/de.png' },
      { name: 'Italy', code: 'ITA', flagUrl: 'https://flagcdn.com/w320/it.png' },
      { name: 'France', code: 'FRA', flagUrl: 'https://flagcdn.com/w320/fr.png' },
      { name: 'Portugal', code: 'PRT', flagUrl: 'https://flagcdn.com/w320/pt.png' },
      { name: 'Netherlands', code: 'NLD', flagUrl: 'https://flagcdn.com/w320/nl.png' },
      { name: 'Brazil', code: 'BRA', flagUrl: 'https://flagcdn.com/w320/br.png' },
      { name: 'Argentina', code: 'ARG', flagUrl: 'https://flagcdn.com/w320/ar.png' },
    ],
    skipDuplicates: true,
  })
  console.log(`✓ Created ${countries.count} countries`)

  // Get countries
  const england = await prisma.country.findFirst({ where: { name: 'England' } })
  const spain = await prisma.country.findFirst({ where: { name: 'Spain' } })
  const germany = await prisma.country.findFirst({ where: { name: 'Germany' } })
  const italy = await prisma.country.findFirst({ where: { name: 'Italy' } })
  const france = await prisma.country.findFirst({ where: { name: 'France' } })

  // Create current season
  const currentSeason = await prisma.season.upsert({
    where: { year: '2024/2025' },
    update: {},
    create: {
      year: '2024/2025',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2025-05-31'),
      isCurrent: true,
    },
  })
  console.log(`✓ Created season: ${currentSeason.year}`)

  // Create competitions
  const premierLeague = await prisma.competition.upsert({
    where: { externalId: 'GB1' },
    update: {},
    create: {
      name: 'Premier League',
      type: 'LEAGUE',
      countryId: england!.id,
      externalId: 'GB1',
      logoUrl: 'https://example.com/logos/premier-league.png',
    },
  })

  const laliga = await prisma.competition.upsert({
    where: { externalId: 'ES1' },
    update: {},
    create: {
      name: 'La Liga',
      type: 'LEAGUE',
      countryId: spain!.id,
      externalId: 'ES1',
      logoUrl: 'https://example.com/logos/la-liga.png',
    },
  })

  const bundesliga = await prisma.competition.upsert({
    where: { externalId: 'DE1' },
    update: {},
    create: {
      name: 'Bundesliga',
      type: 'LEAGUE',
      countryId: germany!.id,
      externalId: 'DE1',
      logoUrl: 'https://example.com/logos/bundesliga.png',
    },
  })

  console.log('✓ Created competitions')

  // Create clubs
  const manUnited = await prisma.club.upsert({
    where: { slug: 'manchester-united' },
    update: {},
    create: {
      name: 'Manchester United',
      shortName: 'Man Utd',
      slug: 'manchester-united',
      foundedYear: 1878,
      stadiumName: 'Old Trafford',
      stadiumCapacity: 74000,
      website: 'https://www.manutd.com',
      countryId: england!.id,
      externalId: 'MANU',
      logoUrl: 'https://example.com/logos/manutd.png',
    },
  })

  const realMadrid = await prisma.club.upsert({
    where: { slug: 'real-madrid' },
    update: {},
    create: {
      name: 'Real Madrid',
      shortName: 'Real',
      slug: 'real-madrid',
      foundedYear: 1902,
      stadiumName: 'Santiago Bernabéu',
      stadiumCapacity: 81044,
      website: 'https://www.realmadrid.com',
      countryId: spain!.id,
      externalId: 'RMA',
      logoUrl: 'https://example.com/logos/realmadrid.png',
    },
  })

  const bayern = await prisma.club.upsert({
    where: { slug: 'bayern-munich' },
    update: {},
    create: {
      name: 'Bayern Munich',
      shortName: 'Bayern',
      slug: 'bayern-munich',
      foundedYear: 1900,
      stadiumName: 'Allianz Arena',
      stadiumCapacity: 75000,
      website: 'https://www.fcbayern.com',
      countryId: germany!.id,
      externalId: 'BAY',
      logoUrl: 'https://example.com/logos/bayern.png',
    },
  })

  console.log('✓ Created clubs')

  // Link clubs to competitions (ClubCompetition)
  await prisma.clubCompetition.createMany({
    data: [
      { clubId: manUnited.id, competitionId: premierLeague.id, seasonId: currentSeason.id },
      { clubId: realMadrid.id, competitionId: laliga.id, seasonId: currentSeason.id },
      { clubId: bayern.id, competitionId: bundesliga.id, seasonId: currentSeason.id },
    ],
    skipDuplicates: true,
  })
  console.log('✓ Linked clubs to competitions')

  // Create players
  const player1 = await prisma.player.upsert({
    where: { slug: 'bruno-fernandes' },
    update: {},
    create: {
      firstName: 'Bruno',
      lastName: 'Fernandes',
      fullName: 'Bruno Fernandes',
      slug: 'bruno-fernandes',
      birthDate: new Date('1994-09-08'),
      nationalityId: england!.id, // Actually Portuguese but using England for demo
      positionId: mid!.id,
      foot: 'RIGHT',
      jerseyNumber: 8,
      marketValue: 75000000,
      marketValueDate: new Date(),
      imageUrl: 'https://example.com/players/bruno.png',
    },
  })

  const player2 = await prisma.player.upsert({
    where: { slug: 'kylian-mbappe' },
    update: {},
    create: {
      firstName: 'Kylian',
      lastName: 'Mbappé',
      fullName: 'Kylian Mbappé',
      slug: 'kylian-mbappe',
      birthDate: new Date('1998-12-20'),
      nationalityId: france!.id,
      positionId: fwd!.id,
      foot: 'LEFT',
      jerseyNumber: 7,
      marketValue: 180000000,
      marketValueDate: new Date(),
      imageUrl: 'https://example.com/players/mbappe.png',
    },
  })

  const player3 = await prisma.player.upsert({
    where: { slug: 'harry-kane' },
    update: {},
    create: {
      firstName: 'Harry',
      lastName: 'Kane',
      fullName: 'Harry Kane',
      slug: 'harry-kane',
      birthDate: new Date('1993-07-28'),
      nationalityId: england!.id,
      positionId: fwd!.id,
      foot: 'RIGHT',
      jerseyNumber: 9,
      marketValue: 110000000,
      marketValueDate: new Date(),
      imageUrl: 'https://example.com/players/kane.png',
    },
  })

  console.log('✓ Created players')

  // Create player-club relationships
  await prisma.playerClub.createMany({
    data: [
      {
        playerId: player1.id,
        clubId: manUnited.id,
        seasonId: currentSeason.id,
        jerseyNumber: 8,
        appearances: 25,
        goals: 12,
        assists: 8,
      },
      {
        playerId: player2.id,
        clubId: realMadrid.id,
        seasonId: currentSeason.id,
        jerseyNumber: 7,
        appearances: 30,
        goals: 28,
        assists: 10,
      },
      {
        playerId: player3.id,
        clubId: bayern.id,
        seasonId: currentSeason.id,
        jerseyNumber: 9,
        appearances: 28,
        goals: 24,
        assists: 7,
      },
    ],
    skipDuplicates: true,
  })
  console.log('✓ Created player-club relationships')

  // Create market value history
  await prisma.marketValue.createMany({
    data: [
      { playerId: player1.id, value: 75000000, date: new Date('2024-01-01') },
      { playerId: player1.id, value: 72000000, date: new Date('2024-02-01') },
      { playerId: player1.id, value: 75000000, date: new Date('2024-03-01') },
      { playerId: player2.id, value: 180000000, date: new Date('2024-01-01') },
      { playerId: player2.id, value: 175000000, date: new Date('2024-02-01') },
      { playerId: player2.id, value: 180000000, date: new Date('2024-03-01') },
      { playerId: player3.id, value: 110000000, date: new Date('2024-01-01') },
      { playerId: player3.id, value: 115000000, date: new Date('2024-02-01') },
      { playerId: player3.id, value: 110000000, date: new Date('2024-03-01') },
    ],
    skipDuplicates: true,
  })
  console.log('✓ Created market value history')

  // Create transfer
  const transfer = await prisma.transfer.create({
    data: {
      playerId: player2.id,
      fromClubId: realMadrid.id,
      toClubId: realMadrid.id, // Same club for demo (historical transfer)
      seasonId: currentSeason.id,
      transferDate: new Date('2017-07-01'),
      fee: 180000000,
      currency: 'EUR',
      type: 'PERMANENT',
    },
  })
  console.log('✓ Created sample transfer')

  // Create player stats
  await prisma.playerStats.createMany({
    data: [
      {
        playerId: player1.id,
        clubId: manUnited.id,
        seasonId: currentSeason.id,
        competitionType: 'LEAGUE',
        appearances: 25,
        starts: 24,
        minutesPlayed: 2150,
        goals: 12,
        assists: 8,
        yellowCards: 3,
        redCards: 0,
        shots: 85,
        shotsOnTarget: 40,
        passes: 1200,
        keyPasses: 75,
        tackles: 25,
        interceptions: 18,
        foulsDrawn: 45,
        foulsCommitted: 22,
      },
      {
        playerId: player2.id,
        clubId: realMadrid.id,
        seasonId: currentSeason.id,
        competitionType: 'LEAGUE',
        appearances: 30,
        starts: 29,
        minutesPlayed: 2650,
        goals: 28,
        assists: 10,
        yellowCards: 5,
        redCards: 0,
        shots: 150,
        shotsOnTarget: 85,
        passes: 600,
        keyPasses: 35,
        tackles: 15,
        interceptions: 8,
        foulsDrawn: 65,
        foulsCommitted: 18,
      },
      {
        playerId: player3.id,
        clubId: bayern.id,
        seasonId: currentSeason.id,
        competitionType: 'LEAGUE',
        appearances: 28,
        starts: 28,
        minutesPlayed: 2500,
        goals: 24,
        assists: 7,
        yellowCards: 4,
        redCards: 0,
        shots: 120,
        shotsOnTarget: 70,
        passes: 350,
        keyPasses: 20,
        tackles: 12,
        interceptions: 5,
        foulsDrawn: 45,
        foulsCommitted: 15,
      },
    ],
    skipDuplicates: true,
  })
  console.log('✓ Created player stats')

  console.log('✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
