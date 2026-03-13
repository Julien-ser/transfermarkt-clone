import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create positions
  for (const position of [
    { name: 'Goalkeeper', category: 'GK' },
    { name: 'Defender', category: 'DEF' },
    { name: 'Midfielder', category: 'MID' },
    { name: 'Forward', category: 'FWD' },
  ]) {
    await prisma.position.upsert({
      where: { name: position.name },
      update: {},
      create: position,
    })
  }
  console.log('✓ Created positions')

  // Get positions for reference
  const gk = await prisma.position.findFirst({ where: { category: 'GK' } })
  const def = await prisma.position.findFirst({ where: { category: 'DEF' } })
  const mid = await prisma.position.findFirst({ where: { category: 'MID' } })
  const fwd = await prisma.position.findFirst({ where: { category: 'FWD' } })

  // Create countries
  const countries = [
    { name: 'England', code: 'GBR', flagUrl: 'https://flagcdn.com/w320/gb.png' },
    { name: 'Spain', code: 'ESP', flagUrl: 'https://flagcdn.com/w320/es.png' },
    { name: 'Germany', code: 'DEU', flagUrl: 'https://flagcdn.com/w320/de.png' },
    { name: 'Italy', code: 'ITA', flagUrl: 'https://flagcdn.com/w320/it.png' },
    { name: 'France', code: 'FRA', flagUrl: 'https://flagcdn.com/w320/fr.png' },
    { name: 'Portugal', code: 'PRT', flagUrl: 'https://flagcdn.com/w320/pt.png' },
    { name: 'Netherlands', code: 'NLD', flagUrl: 'https://flagcdn.com/w320/nl.png' },
    { name: 'Brazil', code: 'BRA', flagUrl: 'https://flagcdn.com/w320/br.png' },
    { name: 'Argentina', code: 'ARG', flagUrl: 'https://flagcdn.com/w320/ar.png' },
    { name: 'Belgium', code: 'BEL', flagUrl: 'https://flagcdn.com/w320/be.png' },
    { name: 'Norway', code: 'NOR', flagUrl: 'https://flagcdn.com/w320/no.png' },
    { name: 'Egypt', code: 'EGY', flagUrl: 'https://flagcdn.com/w320/eg.png' },
    { name: 'Croatia', code: 'HRV', flagUrl: 'https://flagcdn.com/w320/hr.png' },
    { name: 'Poland', code: 'POL', flagUrl: 'https://flagcdn.com/w320/pl.png' },
    { name: 'Ghana', code: 'GHA', flagUrl: 'https://flagcdn.com/w320/gh.png' },
    { name: 'Uruguay', code: 'URY', flagUrl: 'https://flagcdn.com/w320/uy.png' },
  ]

  for (const country of countries) {
    await prisma.country.upsert({
      where: { name: country.name },
      update: {},
      create: country,
    })
  }
  console.log('✓ Created countries')

  // Create demo users
  const demoPasswordHash = await bcrypt.hash('password123', 10)
  const adminPasswordHash = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash: demoPasswordHash,
      role: 'USER',
      isActive: true,
      isVerified: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    },
  })

  console.log('✓ Created demo users')

  // Get country references
  const countryRefs = {}
  for (const c of countries) {
    const country = await prisma.country.findFirst({ where: { name: c.name } })
    if (country) countryRefs[c.name] = country
  }

  // Create seasons
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

  await prisma.season.upsert({
    where: { year: '2023/2024' },
    update: {},
    create: {
      year: '2023/2024',
      startDate: new Date('2023-08-01'),
      endDate: new Date('2024-05-31'),
      isCurrent: false,
    },
  })
  console.log('✓ Created seasons')

  // Create competitions
  const competitions = [
    { name: 'Premier League', type: 'LEAGUE', countryId: countryRefs['England'].id, externalId: 'GB1' },
    { name: 'La Liga', type: 'LEAGUE', countryId: countryRefs['Spain'].id, externalId: 'ES1' },
    { name: 'Bundesliga', type: 'LEAGUE', countryId: countryRefs['Germany'].id, externalId: 'DE1' },
    { name: 'Serie A', type: 'LEAGUE', countryId: countryRefs['Italy'].id, externalId: 'IT1' },
    { name: 'Ligue 1', type: 'LEAGUE', countryId: countryRefs['France'].id, externalId: 'FR1' },
  ]

  const compIds = {}
  for (const comp of competitions) {
    const created = await prisma.competition.upsert({
      where: { externalId: comp.externalId },
      update: {},
      create: { ...comp, logoUrl: `https://example.com/logos/${comp.externalId.toLowerCase()}.png` },
    })
    compIds[comp.externalId] = created.id
  }
  console.log('✓ Created competitions')

  // Create clubs (16 teams)
  const clubs = [
    { name: 'Manchester City', slug: 'manchester-city', extId: 'MCI', compExtId: 'GB1' },
    { name: 'Liverpool', slug: 'liverpool', extId: 'LIV', compExtId: 'GB1' },
    { name: 'Chelsea', slug: 'chelsea', extId: 'CHE', compExtId: 'GB1' },
    { name: 'Arsenal', slug: 'arsenal', extId: 'ARS', compExtId: 'GB1' },
    { name: 'Manchester United', slug: 'manchester-united', extId: 'MANU', compExtId: 'GB1' },
    { name: 'Barcelona', slug: 'barcelona', extId: 'BAR', compExtId: 'ES1' },
    { name: 'Real Madrid', slug: 'real-madrid', extId: 'RMA', compExtId: 'ES1' },
    { name: 'Atletico Madrid', slug: 'atletico-madrid', extId: 'ATM', compExtId: 'ES1' },
    { name: 'Bayern Munich', slug: 'bayern-munich', extId: 'BAY', compExtId: 'DE1' },
    { name: 'Borussia Dortmund', slug: 'borussia-dortmund', extId: 'BVB', compExtId: 'DE1' },
    { name: 'RB Leipzig', slug: 'rb-leipzig', extId: 'RBL', compExtId: 'DE1' },
    { name: 'Juventus', slug: 'juventus', extId: 'JUV', compExtId: 'IT1' },
    { name: 'AC Milan', slug: 'ac-milan', extId: 'ACM', compExtId: 'IT1' },
    { name: 'Inter Milan', slug: 'inter-milan', extId: 'INT', compExtId: 'IT1' },
    { name: 'Paris Saint-Germain', slug: 'paris-saint-germain', extId: 'PSG', compExtId: 'FR1' },
    { name: 'Olympique Marseille', slug: 'marseille', extId: 'OM', compExtId: 'FR1' },
  ]

  const clubRefs = []
  for (const clubData of clubs) {
    const country = clubData.extId.startsWith('M') || clubData.extId === 'CHE' || clubData.extId === 'ARS' 
      ? countryRefs['England'] 
      : clubData.extId === 'BAR' || clubData.extId === 'RMA' || clubData.extId === 'ATM'
      ? countryRefs['Spain']
      : clubData.extId === 'BAY' || clubData.extId === 'BVB' || clubData.extId === 'RBL'
      ? countryRefs['Germany']
      : clubData.extId === 'JUV' || clubData.extId === 'ACM' || clubData.extId === 'INT'
      ? countryRefs['Italy']
      : countryRefs['France']

    const club = await prisma.club.upsert({
      where: { slug: clubData.slug },
      update: {},
      create: {
        name: clubData.name,
        slug: clubData.slug,
        countryId: country.id,
        externalId: clubData.extId,
        logoUrl: `https://example.com/logos/${clubData.slug}.png`,
        stadiumName: 'Main Stadium',
        stadiumCapacity: 50000,
        website: `https://www.${clubData.slug.replace(/ /g, '')}.com`,
      },
    })

    await prisma.clubCompetition.upsert({
      where: {
        clubId_competitionId_seasonId: {
          clubId: club.id,
          competitionId: compIds[clubData.compExtId],
          seasonId: currentSeason.id,
        },
      },
      update: {},
      create: {
        clubId: club.id,
        competitionId: compIds[clubData.compExtId],
        seasonId: currentSeason.id,
      },
    })

    clubRefs.push({ id: club.id, slug: club.slug })
  }
  console.log(`✓ Created ${clubRefs.length} clubs`)

  // Create 50+ players (expanded list)
  console.log('Creating players...')
  
  const playerList = [
    // Man City players
    { first: 'Erling', last: 'Haaland', slug: 'haaland', pos: fwd, nat: 'Norway', foot: 'LEFT', num: 9, mv: 180000000 },
    { first: 'Kevin', last: 'De Bruyne', slug: 'debruyne', pos: mid, nat: 'Belgium', foot: 'RIGHT', num: 17, mv: 60000000 },
    { first: 'Phil', last: 'Foden', slug: 'foden', pos: mid, nat: 'England', foot: 'RIGHT', num: 47, mv: 90000000 },
    { first: 'Jack', last: 'Grealish', slug: 'grealish', pos: fwd, nat: 'England', foot: 'LEFT', num: 10, mv: 60000000 },
    { first: 'Rúben', last: 'Dias', slug: 'dias', pos: def, nat: 'Portugal', foot: 'RIGHT', num: 3, mv: 75000000 },
    { first: 'Ederson', last: 'Moraes', slug: 'ederson', pos: gk, nat: 'Brazil', foot: 'RIGHT', num: 31, mv: 30000000 },
    
    // Liverpool players
    { first: 'Mohamed', last: 'Salah', slug: 'salah', pos: fwd, nat: 'Egypt', foot: 'LEFT', num: 11, mv: 65000000 },
    { first: 'Virgil', last: 'van Dijk', slug: 'vandijk', pos: def, nat: 'Netherlands', foot: 'RIGHT', num: 4, mv: 40000000 },
    { first: 'Alisson', last: 'Becker', slug: 'alisson', pos: gk, nat: 'Brazil', foot: 'RIGHT', num: 1, mv: 35000000 },
    { first: 'Trent', last: 'Alexander-Arnold', slug: 'alexanderarnold', pos: def, nat: 'England', foot: 'RIGHT', num: 66, mv: 75000000 },
    { first: 'Darwin', last: 'Núñez', slug: 'nunez', pos: fwd, nat: 'Uruguay', foot: 'RIGHT', num: 9, mv: 65000000 },
    { first: 'Curtis', last: 'Jones', slug: 'jones', pos: mid, nat: 'England', foot: 'RIGHT', num: 17, mv: 30000000 },
    
    // Arsenal players
    { first: 'Bukayo', last: 'Saka', slug: 'saka', pos: fwd, nat: 'England', foot: 'RIGHT', num: 7, mv: 120000000 },
    { first: 'Martin', last: 'Ødegaard', slug: 'odegaard', pos: mid, nat: 'Norway', foot: 'LEFT', num: 8, mv: 90000000 },
    { first: 'William', last: 'Saliba', slug: 'saliba', pos: def, nat: 'France', foot: 'RIGHT', num: 2, mv: 70000000 },
    { first: 'Aaron', last: 'Ramsdale', slug: 'ramsdale', pos: gk, nat: 'England', foot: 'RIGHT', num: 1, mv: 30000000 },
    { first: 'Gabriel', last: 'Martinelli', slug: 'martinelli', pos: fwd, nat: 'Brazil', foot: 'LEFT', num: 11, mv: 70000000 },
    { first: 'Thomas', last: 'Partey', slug: 'partey', pos: mid, nat: 'Ghana', foot: 'RIGHT', num: 5, mv: 20000000 },
    
    // Real Madrid players
    { first: 'Jude', last: 'Bellingham', slug: 'bellingham', pos: mid, nat: 'England', foot: 'RIGHT', num: 5, mv: 120000000 },
    { first: 'Vinicius', last: 'Júnior', slug: 'vinicius', pos: fwd, nat: 'Brazil', foot: 'LEFT', num: 7, mv: 150000000 },
    { first: 'Rodrygo', last: 'Silva', slug: 'rodrygo', pos: fwd, nat: 'Brazil', foot: 'RIGHT', num: 11, mv: 100000000 },
    { first: 'Toni', last: 'Kroos', slug: 'kroos', pos: mid, nat: 'Germany', foot: 'LEFT', num: 8, mv: 25000000 },
    { first: 'Luka', last: 'Modrić', slug: 'modric', pos: mid, nat: 'Croatia', foot: 'LEFT', num: 10, mv: 15000000 },
    { first: 'Thibaut', last: 'Courtois', slug: 'courtois', pos: gk, nat: 'Belgium', foot: 'LEFT', num: 1, mv: 45000000 },
    
    // Barcelona players
    { first: 'Lamine', last: 'Yamal', slug: 'yamal', pos: fwd, nat: 'Spain', foot: 'LEFT', num: 19, mv: 60000000 },
    { first: 'Robert', last: 'Lewandowski', slug: 'lewandowski', pos: fwd, nat: 'Poland', foot: 'RIGHT', num: 9, mv: 30000000 },
    { first: 'Raphinha', last: 'Vieira', slug: 'raphinha', pos: fwd, nat: 'Brazil', foot: 'LEFT', num: 11, mv: 50000000 },
    { first: 'Frenkie', last: 'de Jong', slug: 'dejong', pos: mid, nat: 'Netherlands', foot: 'LEFT', num: 21, mv: 75000000 },
    { first: 'Pedri', last: 'González', slug: 'pedri', pos: mid, nat: 'Spain', foot: 'LEFT', num: 8, mv: 80000000 },
    { first: 'Iñigo', last: 'Martínez', slug: 'inigomartinez', pos: def, nat: 'Spain', foot: 'LEFT', num: 4, mv: 25000000 },
    
    // Bayern players
    { first: 'Harry', last: 'Kane', slug: 'kane', pos: fwd, nat: 'England', foot: 'RIGHT', num: 9, mv: 110000000 },
    { first: 'Joshua', last: 'Kimmich', slug: 'kimmich', pos: mid, nat: 'Germany', foot: 'RIGHT', num: 6, mv: 75000000 },
    { first: 'Manuel', last: 'Neuer', slug: 'neuer', pos: gk, nat: 'Germany', foot: 'RIGHT', num: 1, mv: 15000000 },
    { first: 'Leroy', last: 'Sané', slug: 'sane', pos: fwd, nat: 'Germany', foot: 'LEFT', num: 10, mv: 70000000 },
    { first: 'Leon', last: 'Goretzka', slug: 'goretzka', pos: mid, nat: 'Germany', foot: 'RIGHT', num: 8, mv: 40000000 },
    { first: 'Matthijs', last: 'de Ligt', slug: 'deligt', pos: def, nat: 'Netherlands', foot: 'RIGHT', num: 4, mv: 70000000 },
    { first: 'Alphonso', last: 'Davies', slug: 'davies', pos: def, nat: 'Canada', foot: 'LEFT', num: 19, mv: 60000000 },
    
    // Additional players to reach 50+
    { first: 'Karim', last: 'Benzema', slug: 'benzema', pos: fwd, nat: 'France', foot: 'LEFT', num: 9, mv: 35000000 },
    { first: 'Zlatan', last: 'Ibrahimović', slug: 'ibrahimovic', pos: fwd, nat: 'Sweden', foot: 'LEFT', num: 11, mv: 2000000 },
    { first: 'Lionel', last: 'Messi', slug: 'messi', pos: fwd, nat: 'Argentina', foot: 'LEFT', num: 10, mv: 30000000 },
    { first: 'Neymar', last: 'Jr.', slug: 'neymar', pos: fwd, nat: 'Brazil', foot: 'LEFT', num: 10, mv: 45000000 },
    { first: 'Bruno', last: 'Fernandes', slug: 'bruno', pos: mid, nat: 'Portugal', foot: 'RIGHT', num: 8, mv: 75000000 },
    { first: 'Bernardo', last: 'Silva', slug: 'bernardo', pos: mid, nat: 'Portugal', foot: 'RIGHT', num: 20, mv: 75000000 },
    { first: 'João', last: 'Félix', slug: 'joaofelix', pos: fwd, nat: 'Portugal', foot: 'LEFT', num: 7, mv: 75000000 },
    { first: 'Rafael', last: 'Leão', slug: 'leaorafael', pos: fwd, nat: 'Portugal', foot: 'LEFT', num: 10, mv: 90000000 },
    { first: 'Khvicha', last: 'Kvaratskhelia', slug: 'kvaratskhelia', pos: fwd, nat: 'Georgia', foot: 'LEFT', num: 7, mv: 80000000 },
    { first: 'Victor', last: 'Osimhen', slug: 'osimhen', pos: fwd, nat: 'Nigeria', foot: 'RIGHT', num: 9, mv: 110000000 },
  ]

  const createdPlayers = []
  let count = 0
  for (const p of playerList) {
    if (count >= 52) break

    const positionId = p.pos.id || mid!.id
    const country = countryRefs[p.nat]
    if (!country) continue

    const player = await prisma.player.create({
      data: {
        firstName: p.first,
        lastName: p.last,
        fullName: `${p.first} ${p.last}`,
        slug: p.slug,
        birthDate: new Date(`199${Math.floor(Math.random()*10)}-${String(Math.floor(Math.random()*12)+1).padStart(2,'0')}-${String(Math.floor(Math.random()*28)+1).padStart(2,'0')}`),
        nationalityId: country.id,
        positionId: positionId,
        foot: p.foot,
        jerseyNumber: p.num,
        marketValue: p.mv,
        marketValueDate: new Date(),
        imageUrl: `https://example.com/players/${p.slug}.png`,
      },
    })
    createdPlayers.push(player)
    count++
  }
  console.log(`✓ Created ${createdPlayers.length} players`)

  // Create player-club relationships
  console.log('Creating player-club relationships...')
  for (let i = 0; i < createdPlayers.length; i++) {
    const player = createdPlayers[i]
    const clubIdx = Math.floor(i / 4) % clubRefs.length
    const club = clubRefs[clubIdx]
    
    const appearances = 15 + Math.floor(Math.random() * 25)
    const goals = Math.floor(appearances * (0.2 + Math.random() * 0.6))
    const assists = Math.floor(appearances * (0.1 + Math.random() * 0.4))
    const minutes = appearances * 80 + Math.floor(Math.random() * 300)

    await prisma.playerClub.create({
      data: {
        playerId: player.id,
        clubId: club.id,
        seasonId: currentSeason.id,
        jerseyNumber: player.jerseyNumber,
        appearances: appearances,
        goals: goals,
        assists: assists,
        minutesPlayed: minutes,
      },
    })
  }
  console.log('✓ Created player-club relationships')

  // Create market value history
  console.log('Creating market value history...')
  const now = new Date()
  let mvCount = 0
  for (const player of createdPlayers) {
    for (let month = 0; month < 24; month++) {
      const date = new Date(now.getFullYear(), now.getMonth() - month, 1)
      const fluctuation = 0.9 + Math.random() * 0.2
      const value = Math.round(player.marketValue * fluctuation)
      
      await prisma.marketValue.create({
        data: {
          playerId: player.id,
          value: value,
          currency: 'EUR',
          date: date,
          source: 'Transfermarkt',
        },
      })
      mvCount++
    }
  }
  console.log(`✓ Created market value history (${mvCount} records)`)

  // Create transfers
  console.log('Creating transfers...')
  const transfers = [
    { playerIdx: 0, fromClubIdx: 8, toClubIdx: 0, fee: 60000000 }, // Haaland
    { playerIdx: 29, fromClubIdx: 0, toClubIdx: 8, fee: 45000000 }, // Kane
    { playerIdx: 18, fromClubIdx: 6, toClubIdx: 5, fee: 103000000 }, // Bellingham
  ]

  for (const transfer of transfers) {
    const player = createdPlayers[transfer.playerIdx]
    if (!player) continue
    
    const fromClub = clubRefs[transfer.fromClubIdx]
    const toClub = clubRefs[transfer.toClubIdx]
    if (!fromClub || !toClub) continue

    await prisma.transfer.create({
      data: {
        playerId: player.id,
        fromClubId: fromClub.id,
        toClubId: toClub.id,
        seasonId: currentSeason.id,
        transferDate: new Date('2023-09-01'),
        fee: transfer.fee,
        currency: 'EUR',
        type: 'PERMANENT',
      },
    })
  }
  console.log(`✓ Created ${transfers.length} transfers`)

  // Create player stats
  console.log('Creating player stats...')
  let statsCount = 0
  for (let i = 0; i < createdPlayers.length; i++) {
    const player = createdPlayers[i]
    const clubIdx = Math.floor(i / 4) % clubRefs.length
    const club = clubRefs[clubIdx]

    await prisma.playerStats.create({
      data: {
        playerId: player.id,
        clubId: club.id,
        seasonId: currentSeason.id,
        competitionType: 'LEAGUE',
        appearances: 10 + Math.floor(Math.random() * 30),
        starts: 8 + Math.floor(Math.random() * 25),
        minutesPlayed: 900 + Math.floor(Math.random() * 2500),
        goals: Math.floor(Math.random() * 25),
        assists: Math.floor(Math.random() * 20),
        yellowCards: Math.floor(Math.random() * 10),
        redCards: 0,
        shots: 30 + Math.floor(Math.random() * 120),
        shotsOnTarget: 15 + Math.floor(Math.random() * 60),
        passes: 200 + Math.floor(Math.random() * 1000),
        keyPasses: 10 + Math.floor(Math.random() * 50),
        tackles: 10 + Math.floor(Math.random() * 50),
        interceptions: 5 + Math.floor(Math.random() * 35),
        foulsDrawn: 10 + Math.floor(Math.random() * 40),
        foulsCommitted: 5 + Math.floor(Math.random() * 30),
      },
    })
    statsCount++
  }
  console.log(`✓ Created player stats (${statsCount} records)`)

  console.log('\n✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })