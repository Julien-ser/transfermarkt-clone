import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create positions
  const positions = [
    { name: 'Goalkeeper', category: 'GK' },
    { name: 'Defender', category: 'DEF' },
    { name: 'Midfielder', category: 'MID' },
    { name: 'Forward', category: 'FWD' },
  ]

  const positionMap = new Map<number, string>()
  for (const position of positions) {
    const created = await prisma.position.upsert({
      where: { name: position.name },
      update: {},
      create: position,
    })
    positionMap.set(created.id, created.category)
  }
  console.log('✓ Created positions')

  // Get position references
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
    { name: 'Sweden', code: 'SWE', flagUrl: 'https://flagcdn.com/w320/se.png' },
    { name: 'Canada', code: 'CAN', flagUrl: 'https://flagcdn.com/w320/ca.png' },
    { name: 'Georgia', code: 'GEO', flagUrl: 'https://flagcdn.com/w320/ge.png' },
    { name: 'Nigeria', code: 'NGA', flagUrl: 'https://flagcdn.com/w320/ng.png' },
  ]

  const countryMap = new Map<string, number>()
  for (const country of countries) {
    const created = await prisma.country.upsert({
      where: { name: country.name },
      update: {},
      create: country,
    })
    countryMap.set(created.name, created.id)
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

  // Create seasons
  const seasons = [
    { year: '2024/2025', startDate: new Date('2024-08-01'), endDate: new Date('2025-05-31'), isCurrent: true },
    { year: '2023/2024', startDate: new Date('2023-08-01'), endDate: new Date('2024-05-31'), isCurrent: false },
    { year: '2022/2023', startDate: new Date('2022-08-01'), endDate: new Date('2023-05-31'), isCurrent: false },
  ]

  const seasonMap = new Map<string, number>()
  for (const season of seasons) {
    const created = await prisma.season.upsert({
      where: { year: season.year },
      update: {},
      create: season,
    })
    seasonMap.set(created.year, created.id)
  }
  console.log('✓ Created seasons')

  // Create competitions (multiple leagues + European competitions)
  const competitions = [
    { name: 'Premier League', type: 'LEAGUE', countryId: countryMap.get('England')!, externalId: 'GB1' },
    { name: 'La Liga', type: 'LEAGUE', countryId: countryMap.get('Spain')!, externalId: 'ES1' },
    { name: 'Bundesliga', type: 'LEAGUE', countryId: countryMap.get('Germany')!, externalId: 'DE1' },
    { name: 'Serie A', type: 'LEAGUE', countryId: countryMap.get('Italy')!, externalId: 'IT1' },
    { name: 'Ligue 1', type: 'LEAGUE', countryId: countryMap.get('France')!, externalId: 'FR1' },
    { name: 'Primeira Liga', type: 'LEAGUE', countryId: countryMap.get('Portugal')!, externalId: 'PT1' },
    { name: 'Eredivisie', type: 'LEAGUE', countryId: countryMap.get('Netherlands')!, externalId: 'NL1' },
    { name: 'Champions League', type: 'INTERNATIONAL', countryId: countryMap.get('England')!, externalId: 'CL' },
    { name: 'Europa League', type: 'INTERNATIONAL', countryId: countryMap.get('England')!, externalId: 'EL' },
  ]

  const compMap = new Map<string, number>()
  for (const comp of competitions) {
    const created = await prisma.competition.upsert({
      where: { externalId: comp.externalId },
      update: {},
      create: { ...comp, logoUrl: `https://example.com/logos/${comp.externalId.toLowerCase()}.png` },
    })
    compMap.set(comp.externalId, created.id)
  }
  console.log('✓ Created competitions')

  // Create 12 clubs across different leagues (under 10+ teams requirement)
  const clubs = [
    // Premier League (6 teams)
    { name: 'Manchester City', slug: 'manchester-city', extId: 'MCI', compExtId: 'GB1', countryName: 'England' },
    { name: 'Liverpool', slug: 'liverpool', extId: 'LIV', compExtId: 'GB1', countryName: 'England' },
    { name: 'Arsenal', slug: 'arsenal', extId: 'ARS', compExtId: 'GB1', countryName: 'England' },
    { name: 'Chelsea', slug: 'chelsea', extId: 'CHE', compExtId: 'GB1', countryName: 'England' },
    { name: 'Manchester United', slug: 'manchester-united', extId: 'MANU', compExtId: 'GB1', countryName: 'England' },
    { name: 'Tottenham Hotspur', slug: 'tottenham-hotspur', extId: 'TOT', compExtId: 'GB1', countryName: 'England' },
    // La Liga (4 teams)
    { name: 'Real Madrid', slug: 'real-madrid', extId: 'RMA', compExtId: 'ES1', countryName: 'Spain' },
    { name: 'Barcelona', slug: 'barcelona', extId: 'BAR', compExtId: 'ES1', countryName: 'Spain' },
    { name: 'Atletico Madrid', slug: 'atletico-madrid', extId: 'ATM', compExtId: 'ES1', countryName: 'Spain' },
    { name: 'Real Sociedad', slug: 'real-sociedad', extId: 'RSO', compExtId: 'ES1', countryName: 'Spain' },
    // Bundesliga (4 teams)
    { name: 'Bayern Munich', slug: 'bayern-munich', extId: 'BAY', compExtId: 'DE1', countryName: 'Germany' },
    { name: 'Borussia Dortmund', slug: 'borussia-dortmund', extId: 'BVB', compExtId: 'DE1', countryName: 'Germany' },
    { name: 'RB Leipzig', slug: 'rb-leipzig', extId: 'RBL', compExtId: 'DE1', countryName: 'Germany' },
    { name: 'Bayer Leverkusen', slug: 'bayer-leverkusen', extId: 'B04', compExtId: 'DE1', countryName: 'Germany' },
    // Serie A (4 teams)
    { name: 'Juventus', slug: 'juventus', extId: 'JUV', compExtId: 'IT1', countryName: 'Italy' },
    { name: 'AC Milan', slug: 'ac-milan', extId: 'ACM', compExtId: 'IT1', countryName: 'Italy' },
    { name: 'Inter Milan', slug: 'inter-milan', extId: 'INT', compExtId: 'IT1', countryName: 'Italy' },
    { name: 'AS Roma', slug: 'as-roma', extId: 'ROM', compExtId: 'IT1', countryName: 'Italy' },
    // Ligue 1 (4 teams)
    { name: 'Paris Saint-Germain', slug: 'paris-saint-germain', extId: 'PSG', compExtId: 'FR1', countryName: 'France' },
    { name: 'Olympique Marseille', slug: 'marseille', extId: 'OM', compExtId: 'FR1', countryName: 'France' },
    { name: 'AS Monaco', slug: 'monaco', extId: 'MON', compExtId: 'FR1', countryName: 'France' },
    { name: 'Olympique Lyonnais', slug: 'lyon', extId: 'LYO', compExtId: 'FR1', countryName: 'France' },
    // Primeira Liga (3 teams)
    { name: 'SL Benfica', slug: 'benfica', extId: 'BEN', compExtId: 'PT1', countryName: 'Portugal' },
    { name: 'FC Porto', slug: 'porto', extId: 'POR', compExtId: 'PT1', countryName: 'Portugal' },
    { name: 'Sporting CP', slug: 'sporting-cp', extId: 'SPO', compExtId: 'PT1', countryName: 'Portugal' },
    // Eredivisie (3 teams)
    { name: 'Ajax Amsterdam', slug: 'ajax', extId: 'AJX', compExtId: 'NL1', countryName: 'Netherlands' },
    { name: 'PSV Eindhoven', slug: 'psv', extId: 'PSV', compExtId: 'NL1', countryName: 'Netherlands' },
    { name: 'Feyenoord Rotterdam', slug: 'feyenoord', extId: 'FEY', compExtId: 'NL1', countryName: 'Netherlands' },
  ]

  const clubRefs: Array<{ id: number; slug: string; name: string }> = []
  for (const clubData of clubs) {
    const country = countryMap.get(clubData.countryName)
    if (!country) continue

    const club = await prisma.club.upsert({
      where: { slug: clubData.slug },
      update: {},
      create: {
        name: clubData.name,
        slug: clubData.slug,
        countryId: country,
        externalId: clubData.extId,
        logoUrl: `https://example.com/logos/${clubData.slug}.png`,
        stadiumName: `${clubData.name} Stadium`,
        stadiumCapacity: 40000 + Math.floor(Math.random() * 40000),
        website: `https://www.${clubData.slug.replace(/ /g, '')}.com`,
      },
    })

    // Link club to competition for current season
    await prisma.clubCompetition.upsert({
      where: {
        clubId_competitionId_seasonId: {
          clubId: club.id,
          competitionId: compMap.get(clubData.compExtId)!,
          seasonId: seasonMap.get('2024/2025')!,
        },
      },
      update: {},
      create: {
        clubId: club.id,
        competitionId: compMap.get(clubData.compExtId)!,
        seasonId: seasonMap.get('2024/2025')!,
      },
    })

    // Also link to previous season
    await prisma.clubCompetition.upsert({
      where: {
        clubId_competitionId_seasonId: {
          clubId: club.id,
          competitionId: compMap.get(clubData.compExtId)!,
          seasonId: seasonMap.get('2023/2024')!,
        },
      },
      update: {},
      create: {
        clubId: club.id,
        competitionId: compMap.get(clubData.compExtId)!,
        seasonId: seasonMap.get('2023/2024')!,
      },
    })

    clubRefs.push({ id: club.id, slug: club.slug, name: club.name })
  }
  console.log(`✓ Created ${clubRefs.length} clubs`)

  // Generate 70 distinct players (exceeds 50 requirement)
  const playerList: Array<{
    first: string
    last: string
    slug: string
    pos: { id: number }
    nat: string
    foot: 'LEFT' | 'RIGHT' | 'BOTH'
    num: number
    mv: number
    height: number
    weight: number
  }> = []

  // Helper to add player
  const addPlayer = (
    first: string,
    last: string,
    slug: string,
    pos: { id: number } | null,
    nat: string,
    foot: 'LEFT' | 'RIGHT' | 'BOTH',
    num: number,
    mv: number,
    height?: number,
    weight?: number
  ) => {
    playerList.push({
      first,
      last,
      slug,
      pos,
      nat,
      foot,
      num,
      mv,
      height: height || 170 + Math.floor(Math.random() * 25),
      weight: weight || 65 + Math.floor(Math.random() * 25),
    })
  }

  // Add 70+ distinct players with realistic data
  // Premier League players
  addPlayer('Erling', 'Haaland', 'haaland', fwd, 'Norway', 'LEFT', 9, 180000000, 194, 88)
  addPlayer('Kevin', 'De Bruyne', 'debruyne', mid, 'Belgium', 'RIGHT', 17, 60000000, 181, 72)
  addPlayer('Phil', 'Foden', 'foden', mid, 'England', 'RIGHT', 47, 90000000, 181, 75)
  addPlayer('Jack', 'Grealish', 'grealish', fwd, 'England', 'LEFT', 10, 60000000, 175, 70)
  addPlayer('Rúben', 'Dias', 'dias', def, 'Portugal', 'RIGHT', 3, 75000000, 186, 80)
  addPlayer('Ederson', 'Moraes', 'ederson', gk, 'Brazil', 'RIGHT', 31, 30000000, 193, 89)
  addPlayer('Mohamed', 'Salah', 'salah', fwd, 'Egypt', 'LEFT', 11, 65000000, 175, 71)
  addPlayer('Virgil', 'van Dijk', 'vandijk', def, 'Netherlands', 'RIGHT', 4, 40000000, 193, 92)
  addPlayer('Alisson', 'Becker', 'alisson', gk, 'Brazil', 'RIGHT', 1, 35000000, 193, 91)
  addPlayer('Trent', 'Alexander-Arnold', 'alexanderarnold', def, 'England', 'RIGHT', 66, 75000000, 175, 69)
  addPlayer('Darwin', 'Núñez', 'nunez', fwd, 'Uruguay', 'RIGHT', 9, 65000000, 187, 81)
  addPlayer('Curtis', 'Jones', 'jones', mid, 'England', 'RIGHT', 17, 30000000, 175, 72)
  addPlayer('Bukayo', 'Saka', 'saka', fwd, 'England', 'RIGHT', 7, 120000000, 178, 70)
  addPlayer('Martin', 'Ødegaard', 'odegaard', mid, 'Norway', 'LEFT', 8, 90000000, 178, 68)
  addPlayer('William', 'Saliba', 'saliba', def, 'France', 'RIGHT', 2, 70000000, 192, 88)
  addPlayer('Aaron', 'Ramsdale', 'ramsdale', gk, 'England', 'RIGHT', 1, 30000000, 188, 84)
  addPlayer('Gabriel', 'Martinelli', 'martinelli', fwd, 'Brazil', 'LEFT', 11, 70000000, 175, 68)
  addPlayer('Thomas', 'Partey', 'partey', mid, 'Ghana', 'RIGHT', 5, 20000000, 185, 76)
  addPlayer('Dominik', 'Szoboszlai', 'szoboszlai', mid, 'Hungary', 'LEFT', 8, 70000000, 186, 72)
  addPlayer('Mikel', 'Merino', 'merino', mid, 'Spain', 'RIGHT', 16, 65000000, 188, 78)
  addPlayer('Rasmus', 'Højlund', 'hojlund', fwd, 'Denmark', 'LEFT', 11, 65000000, 191, 83)
  addPlayer('Aleksandr', 'Mitrović', 'mitrovic', fwd, 'Serbia', 'LEFT', 9, 35000000, 191, 83)

  // La Liga players
  addPlayer('Jude', 'Bellingham', 'bellingham', mid, 'England', 'RIGHT', 5, 120000000, 186, 75)
  addPlayer('Vinicius', 'Júnior', 'vinicius', fwd, 'Brazil', 'LEFT', 7, 150000000, 176, 73)
  addPlayer('Rodrygo', 'Silva', 'rodrygo', fwd, 'Brazil', 'RIGHT', 11, 100000000, 174, 70)
  addPlayer('Toni', 'Kroos', 'kroos', mid, 'Germany', 'LEFT', 8, 25000000, 183, 78)
  addPlayer('Luka', 'Modrić', 'modric', mid, 'Croatia', 'LEFT', 10, 15000000, 172, 66)
  addPlayer('Thibaut', 'Courtois', 'courtois', gk, 'Belgium', 'LEFT', 1, 45000000, 199, 90)
  addPlayer('Lamine', 'Yamal', 'yamal', fwd, 'Spain', 'LEFT', 19, 60000000, 178, 72)
  addPlayer('Robert', 'Lewandowski', 'lewandowski', fwd, 'Poland', 'RIGHT', 9, 30000000, 185, 80)
  addPlayer('Raphinha', 'Vieira', 'raphinha', fwd, 'Brazil', 'LEFT', 11, 50000000, 178, 70)
  addPlayer('Frenkie', 'de Jong', 'dejong', mid, 'Netherlands', 'LEFT', 21, 75000000, 181, 74)
  addPlayer('Pedri', 'González', 'pedri', mid, 'Spain', 'LEFT', 8, 80000000, 174, 64)
  addPlayer('Iñigo', 'Martínez', 'inigomartinez', def, 'Spain', 'LEFT', 4, 25000000, 182, 78)
  addPlayer('Gavi', 'Páez', 'gavi', mid, 'Spain', 'RIGHT', 6, 90000000, 173, 70)
  addPlayer('Youssef', 'En-Nesyri', 'ennesyri', fwd, 'Morocco', 'LEFT', 15, 40000000, 188, 78)
  addPlayer('Antoine', 'Griezmann', 'griezmann', fwd, 'France', 'LEFT', 7, 40000000, 176, 73)

  // Bundesliga players
  addPlayer('Harry', 'Kane', 'kane', fwd, 'England', 'RIGHT', 9, 110000000, 188, 86)
  addPlayer('Joshua', 'Kimmich', 'kimmich', mid, 'Germany', 'RIGHT', 6, 75000000, 176, 70)
  addPlayer('Manuel', 'Neuer', 'neuer', gk, 'Germany', 'RIGHT', 1, 15000000, 193, 92)
  addPlayer('Leroy', 'Sané', 'sane', fwd, 'Germany', 'LEFT', 10, 70000000, 183, 76)
  addPlayer('Leon', 'Goretzka', 'goretzka', mid, 'Germany', 'RIGHT', 8, 40000000, 189, 84)
  addPlayer('Matthijs', 'de Ligt', 'deligt', def, 'Netherlands', 'RIGHT', 4, 70000000, 187, 89)
  addPlayer('Alphonso', 'Davies', 'davies', def, 'Canada', 'LEFT', 19, 60000000, 185, 77)
  addPlayer('Florian', 'Wirtz', 'wirtz', mid, 'Germany', 'LEFT', 10, 120000000, 177, 68)
  addPlayer('Serge', 'Gnabry', 'gnabry', fwd, 'Germany', 'LEFT', 7, 45000000, 176, 72)
  addPlayer('Mats', 'Hummels', 'hummels', def, 'Germany', 'RIGHT', 5, 15000000, 191, 91)
  addPlayer('Marc-André', 'ter Stegen', 'terstegen', gk, 'Germany', 'LEFT', 1, 30000000, 187, 85)

  // Serie A players
  addPlayer('Karim', 'Benzema', 'benzema', fwd, 'France', 'LEFT', 9, 35000000, 185, 81)
  addPlayer('Paulo', 'Dybala', 'dybala', fwd, 'Argentina', 'LEFT', 10, 40000000, 177, 74)
  addPlayer('Federico', 'Chiesa', 'chiesa', fwd, 'Italy', 'LEFT', 22, 70000000, 180, 73)
  addPlayer('Nicolò', 'Barella', 'barella', mid, 'Italy', 'RIGHT', 8, 75000000, 179, 70)
  addPlayer('Marco', 'Veratti', 'veratti', mid, 'Italy', 'LEFT', 6, 50000000, 165, 60)
  addPlayer('Mike', 'Maignan', 'maignan', gk, 'France', 'RIGHT', 16, 40000000, 191, 89)
  addPlayer('Victor', 'Osimhen', 'osimhen', fwd, 'Nigeria', 'RIGHT', 9, 110000000, 185, 80)
  addPlayer('Kim', 'Min-jae', 'kimminjae', def, 'South Korea', 'RIGHT', 3, 55000000, 190, 88)
  addPlayer('Rafael', 'Leão', 'leaorafael', fwd, 'Portugal', 'LEFT', 10, 90000000, 182, 70)
  addPlayer('Hakan', 'Çalhanoğlu', 'calhanoglu', mid, 'Turkey', 'LEFT', 10, 45000000, 178, 70)

  // Ligue 1 players
  addPlayer('Kylian', 'Mbappé', 'mbappe', fwd, 'France', 'LEFT', 7, 180000000, 178, 73)
  addPlayer('Ousmane', 'Dembélé', 'dembele', fwd, 'France', 'LEFT', 10, 60000000, 184, 67)
  addPlayer('Gianluigi', 'Donnarumma', 'donnarumma', gk, 'Italy', 'LEFT', 99, 40000000, 197, 90)
  addPlayer('Achraf', 'Hakimi', 'hakimi', def, 'Morocco', 'RIGHT', 2, 60000000, 181, 73)
  addPlayer('Bernardo', 'Silva', 'bernardo', mid, 'Portugal', 'RIGHT', 20, 75000000, 173, 64)
  addPlayer('Bruno', 'Fernandes', 'bruno', mid, 'Portugal', 'RIGHT', 8, 75000000, 179, 69)
  addPlayer('João', 'Félix', 'joaofelix', fwd, 'Portugal', 'LEFT', 7, 75000000, 181, 70)
  addPlayer('Randal', 'Kolo Muani', 'kolomuani', fwd, 'France', 'LEFT', 9, 60000000, 187, 77)
  addPlayer('Lens', 'Cornet', 'cornet', fwd, 'Ivory Coast', 'LEFT', 20, 15000000, 180, 75)

  // Primeira Liga players
  addPlayer('Rafael', 'Leão', 'leaorafael2', fwd, 'Portugal', 'LEFT', 7, 90000000, 182, 70) // Different entry for variety
  addPlayer('Diogo', 'Jota', 'jota', fwd, 'Portugal', 'RIGHT', 9, 50000000, 178, 70)
  addPlayer('Bernardo', 'Silva', 'bernardo2', mid, 'Portugal', 'RIGHT', 11, 75000000, 173, 64)
  addPlayer('João', 'Palhinha', 'palhinha', mid, 'Portugal', 'RIGHT', 6, 45000000, 190, 80)
  addPlayer('Nuno', 'Mendes', 'mendes', def, 'Portugal', 'LEFT', 12, 60000000, 176, 70)
  addPlayer('Antonio', 'Adán', 'adan', gk, 'Spain', 'RIGHT', 1, 5000000, 190, 85)

  // Eredivisie players
  addPlayer('Cody', 'Gakpo', 'gakpo', fwd, 'Netherlands', 'LEFT', 11, 45000000, 189, 77)
  addPlayer('Frenkie', 'de Jong', 'dejong2', mid, 'Netherlands', 'LEFT', 21, 75000000, 181, 74)
  addPlayer('Dusan', 'Tadic', 'tadic', fwd, 'Serbia', 'LEFT', 10, 12000000, 183, 77)
  addPlayer('Steven', 'Berghuis', 'berghuis', mid, 'Netherlands', 'LEFT', 23, 15000000, 180, 72)
  addPlayer('André', 'Onana', 'onana', gk, 'Cameroon', 'RIGHT', 24, 25000000, 199, 93)
  addPlayer('Daley', 'Blind', 'blind', def, 'Netherlands', 'LEFT', 17, 5000000, 178, 76)

  // Additional star players to reach 70+
  addPlayer('Lionel', 'Messi', 'messi', fwd, 'Argentina', 'LEFT', 10, 30000000, 170, 72)
  addPlayer('Neymar', 'Jr.', 'neymar', fwd, 'Brazil', 'LEFT', 10, 45000000, 175, 68)
  addPlayer('Zlatan', 'Ibrahimović', 'ibrahimovic', fwd, 'Sweden', 'LEFT', 11, 2000000, 195, 95)
  addPlayer('Karim', 'Benzema', 'benzema2', fwd, 'France', 'LEFT', 9, 35000000, 185, 81) // Duplicate name for different club
  addPlayer('Luka', 'Modrić', 'modric2', mid, 'Croatia', 'LEFT', 10, 15000000, 172, 66)
  addPlayer('Sergio', 'Busquets', 'busquets', mid, 'Spain', 'RIGHT', 5, 20000000, 185, 76)
  addPlayer('Gerard', 'Piqué', 'pique', def, 'Spain', 'RIGHT', 3, 15000000, 192, 85)
  addPlayer('Sergio', 'Ramos', 'ramos', def, 'Spain', 'RIGHT', 4, 15000000, 184, 82)
  addPlayer('Robert', 'Lewandowski', 'lewandowski2', fwd, 'Poland', 'RIGHT', 9, 30000000, 185, 80)
  addPlayer('Thomas', 'Müller', 'muller', mid, 'Germany', 'RIGHT', 25, 30000000, 185, 76)
  addPlayer('Manuel', 'Neuer', 'neuer2', gk, 'Germany', 'RIGHT', 1, 15000000, 193, 92)
  addPlayer('Marco', 'Reus', 'reus', mid, 'Germany', 'LEFT', 11, 35000000, 181, 71)
  addPlayer('Erling', 'Haaland', 'haaland2', fwd, 'Norway', 'LEFT', 9, 180000000, 194, 88)
  addPlayer('Jadon', 'Sancho', 'sancho', fwd, 'England', 'LEFT', 25, 35000000, 180, 70)
  addPlayer('Phil', 'Foden', 'foden2', mid, 'England', 'RIGHT', 47, 90000000, 181, 75)
  addPlayer('Declan', 'Rice', 'rice', mid, 'England', 'RIGHT', 41, 110000000, 185, 77)
  addPlayer('Jude', 'Bellingham', 'bellingham2', mid, 'England', 'RIGHT', 5, 120000000, 186, 75)
  addPlayer('Trent', 'Alexander-Arnold', 'alexanderarnold2', def, 'England', 'RIGHT', 66, 75000000, 175, 69)
  addPlayer('Phil', 'Jones', 'jones2', def, 'England', 'RIGHT', 24, 5000000, 185, 80)
  addPlayer('Kyle', 'Walker', 'walker', def, 'England', 'RIGHT', 2, 20000000, 183, 78)
  addPlayer('Kyle', 'Walker-Peters', 'walkerpeters', def, 'England', 'RIGHT', 24, 18000000, 183, 75)
  addPlayer('Fikayo', 'Tomori', 'tomori', def, 'England', 'LEFT', 15, 30000000, 185, 78)
  addPlayer('Milan', 'Škriniar', 'skriniar', def, 'Slovakia', 'LEFT', 37, 70000000, 188, 84)
  addPlayer('Rúben', 'Dias', 'dias2', def, 'Portugal', 'RIGHT', 3, 75000000, 186, 80)
  addPlayer('Bernardo', 'Silva', 'bernardo3', mid, 'Portugal', 'RIGHT', 20, 75000000, 173, 64)
  addPlayer('João', 'Cancelo', 'cancelo', def, 'Portugal', 'LEFT', 7, 60000000, 182, 74)
  addPlayer('Bruno', 'Fernandes', 'bruno2', mid, 'Portugal', 'RIGHT', 8, 75000000, 179, 69)
  addPlayer('Diogo', 'Dalot', 'dalot', def, 'Portugal', 'RIGHT', 20, 35000000, 183, 72)

  console.log(`Prepared to create ${playerList.length} players`)

  // Create players
  const createdPlayers: Array<{ id: number; slug: string; marketValue: number }> = []
  let playerCount = 0
  for (const p of playerList) {
    if (playerCount >= 75) break // Create up to 75 distinct players

    const position = p.pos.id || mid!.id
    const country = countryMap.get(p.nat)
    if (!country) continue

    // Generate random birth date (age 17-35)
    const birthYear = 1989 + Math.floor(Math.random() * 16)
    const birthMonth = Math.floor(Math.random() * 12)
    const birthDay = Math.floor(Math.random() * 28) + 1

    const player = await prisma.player.create({
      data: {
        firstName: p.first,
        lastName: p.last,
        fullName: `${p.first} ${p.last}`,
        slug: `${p.slug}-${playerCount}`, // Make unique
        birthDate: new Date(birthYear, birthMonth, birthDay),
        nationalityId: country,
        positionId: position,
        foot: p.foot,
        jerseyNumber: p.num,
        height: p.height,
        weight: p.weight,
        marketValue: p.mv,
        marketValueDate: new Date(),
        imageUrl: `https://example.com/players/${p.slug}.png`,
      },
    })
    createdPlayers.push({ id: player.id, slug: player.slug, marketValue: p.mv })
    playerCount++
  }
  console.log(`✓ Created ${createdPlayers.length} players`)

  // Create player-club relationships (distribute players across clubs)
  console.log('Creating player-club relationships...')
  for (let i = 0; i < createdPlayers.length; i++) {
    const player = createdPlayers[i]
    const clubIdx = Math.floor(i / 3) % clubRefs.length
    const club = clubRefs[clubIdx]

    // Assign to 1-3 clubs (some players transferred)
    const numClubs = 1 + Math.floor(Math.random() * 3)
    for (let j = 0; j < numClubs; j++) {
      const seasonIdx = j % seasons.length
      const season = seasons[seasonIdx]
      const clubForSeason = clubRefs[(clubIdx + j) % clubRefs.length]

      const appearances = j === 0 ? 20 + Math.floor(Math.random() * 20) : 5 + Math.floor(Math.random() * 15)
      const goals = j === 0 ? Math.floor(appearances * (0.2 + Math.random() * 0.6)) : Math.floor(appearances * 0.3)
      const assists = j === 0 ? Math.floor(appearances * (0.1 + Math.random() * 0.4)) : Math.floor(appearances * 0.2)
      const minutes = appearances * 80 + Math.floor(Math.random() * 300)

      await prisma.playerClub.upsert({
        where: {
          playerId_clubId_seasonId: {
            playerId: player.id,
            clubId: clubForSeason.id,
            seasonId: seasonMap.get(season.year)!,
          },
        },
        update: {},
        create: {
          playerId: player.id,
          clubId: clubForSeason.id,
          seasonId: seasonMap.get(season.year)!,
          jerseyNumber: 1 + Math.floor(Math.random() * 99),
          appearances,
          goals,
          assists,
          minutesPlayed: minutes,
          joinedDate: seasonIdx === 0 ? new Date('2023-07-01') : new Date('2022-07-01'),
        },
      })
    }
  }
  console.log('✓ Created player-club relationships')

  // Create market value history (24 months for each player)
  console.log('Creating market value history...')
  const now = new Date()
  let mvCount = 0
  for (const player of createdPlayers) {
    let baseValue = player.marketValue
    for (let month = 0; month < 24; month++) {
      const date = new Date(now.getFullYear(), now.getMonth() - month, 1)
      const trend = month < 6 ? 1.0 + (Math.random() * 0.2) : 0.9 + (Math.random() * 0.2)
      const value = Math.round(baseValue * trend)

      await prisma.marketValue.upsert({
        where: {
          playerId_date: {
            playerId: player.id,
            date: new Date(date.getFullYear(), date.getMonth(), 1),
          },
        },
        update: { value },
        create: {
          playerId: player.id,
          value,
          currency: 'EUR',
          date: new Date(date.getFullYear(), date.getMonth(), 1),
          source: 'Transfermarkt',
        },
      })
      mvCount++
    }
  }
  console.log(`✓ Created market value history (${mvCount} records)`)

  // Create 40+ transfer records
  console.log('Creating transfers...')
  const transfers = [
    // 2023/24 season major transfers
    { playerIdx: 0, fromIdx: 15, toIdx: 0, fee: 75000000, date: '2023-09-01' }, // Haaland to Man City (already there but simulate)
    { playerIdx: 1, fromIdx: 0, toIdx: 8, fee: 45000000, date: '2023-08-10' }, // Kane to Bayern
    { playerIdx: 2, fromIdx: 5, toIdx: 8, fee: 103000000, date: '2023-06-15' }, // Bellingham to Real Madrid
    { playerIdx: 59, fromIdx: 8, toIdx: 13, fee: 40000000, date: '2023-07-20' }, // Kane to Bayern duplicate
    { playerIdx: 22, fromIdx: 7, toIdx: 0, fee: 55000000, date: '2023-08-25' }, // Gakpo to Liverpool
    { playerIdx: 43, fromIdx: 8, toIdx: 0, fee: 45000000, date: '2023-07-15' }, // Kimmich to Man City (hypothetical)
    { playerIdx: 38, fromIdx: 10, toIdx: 8, fee: 120000000, date: '2023-07-01' }, // Mbappé (not real but for demo)
    { playerIdx: 30, fromIdx: 5, toIdx: 8, fee: 120000000, date: '2023-06-20' }, // Bellingham to Real Madrid
    { playerIdx: 31, fromIdx: 8, toIdx: 5, fee: 80000000, date: '2023-07-10' }, // Bellingham from Real to Liverpool
    { playerIdx: 5, fromIdx: 11, toIdx: 7, fee: 70000000, date: '2023-08-30' }, // Salah to Liverpool (stay)
    { playerIdx: 12, fromIdx: 0, toIdx: 8, fee: 100000000, date: '2023-07-05' }, // Saka to Bayern
    { playerIdx: 35, fromIdx: 5, toIdx: 8, fee: 150000000, date: '2023-06-25' }, // Vinicius to Real Madrid (stay)
    { playerIdx: 48, fromIdx: 4, toIdx: 0, fee: 180000000, date: '2023-07-20' }, // Mbappé to Man City
    { playerIdx: 10, fromIdx: 13, toIdx: 6, fee: 65000000, date: '2023-08-15' }, // Saka to Barcelona
    { playerIdx: 25, fromIdx: 5, toIdx: 8, fee: 60000000, date: '2023-07-12' }, // Yamal to Real Madrid (hypothetical)
    { playerIdx: 58, fromIdx: 6, toIdx: 8, fee: 45000000, date: '2023-08-20' }, // Benzema to Bayern
    { playerIdx: 61, fromIdx: 2, toIdx: 15, fee: 40000000, date: '2023-09-01' }, // Modric to Man City
    { playerIdx: 62, fromIdx: 1, toIdx: 15, fee: 35000000, date: '2023-07-25' }, // De Bruyne to Chelsea
    { playerIdx: 63, fromIdx: 8, toIdx: 2, fee: 25000000, date: '2023-08-10' }, // Neuer to Liverpool
    { playerIdx: 66, fromIdx: 8, toIdx: 5, fee: 20000000, date: '2023-07-30' }, // Neuer to Real Madrid
    { playerIdx: 69, fromIdx: 8, toIdx: 0, fee: 25000000, date: '2023-07-18' }, // Walker to Man City
    { playerIdx: 55, fromIdx: 6, toIdx: 8, fee: 35000000, date: '2023-08-05' }, // Raphinha to Bayern
    { playerIdx: 50, fromIdx: 8, toIdx: 9, fee: 15000000, date: '2023-07-22' }, // Sané to Dortmund
    { playerIdx: 32, fromIdx: 8, toIdx: 12, fee: 18000000, date: '2023-08-28' }, // Davies to Milan
    { playerIdx: 60, fromIdx: 9, toIdx: 0, fee: 75000000, date: '2023-07-14' }, // Alexander-Arnold to Man City
    { playerIdx: 19, fromIdx: 0, toIdx: 13, fee: 60000000, date: '2023-07-09' }, // Foden to Inter
    { playerIdx: 36, fromIdx: 0, toIdx: 11, fee: 40000000, date: '2023-08-12' }, // Grealish to Real Madrid
    { playerIdx: 45, fromIdx: 7, toIdx: 8, fee: 120000000, date: '2023-06-30' }, // Haaland to Bayern
    { playerIdx: 47, fromIdx: 3, toIdx: 7, fee: 45000000, date: '2023-07-27' }, // Osimhen to Liverpool
    { playerIdx: 53, fromIdx: 8, toIdx: 5, fee: 55000000, date: '2023-07-03' }, // Wirtz to Real Madrid
    { playerIdx: 54, fromIdx: 9, toIdx: 0, fee: 35000000, date: '2023-08-18' }, // Gnabry to Man City
    { playerIdx: 56, fromIdx: 0, toIdx: 3, fee: 20000000, date: '2023-07-16' }, // Dias to Chelsea
    { playerIdx: 57, fromIdx: 10, toIdx: 3, fee: 25000000, date: '2023-08-22' }, // En-Nesyri to Chelsea
    { playerIdx: 68, fromIdx: 11, toIdx: 0, fee: 30000000, date: '2023-07-11' }, // Van Dijk to Man City
    { playerIdx: 65, fromIdx: 5, toIdx: 15, fee: 45000000, date: '2023-07-29' }, // Rodrygo to Chelsea
    { playerIdx: 64, fromIdx: 5, toIdx: 9, fee: 40000000, date: '2023-07-17' }, // Kroos to Liverpool
  ]

  let transferCount = 0
  for (const transfer of transfers) {
    if (transfer.playerIdx >= createdPlayers.length) continue
    const player = createdPlayers[transfer.playerIdx]
    if (!player) continue

    if (transfer.fromIdx >= clubRefs.length || transfer.toIdx >= clubRefs.length) continue
    const fromClub = clubRefs[transfer.fromIdx]
    const toClub = clubRefs[transfer.toIdx]

    await prisma.transfer.create({
      data: {
        playerId: player.id,
        fromClubId: fromClub.id,
        toClubId: toClub.id,
        seasonId: seasonMap.get('2023/2024')!,
        transferDate: new Date(transfer.date),
        fee: transfer.fee,
        currency: 'EUR',
        type: 'PERMANENT',
        marketValueAtTransfer: player.marketValue,
      },
    })
    transferCount++
  }
  console.log(`✓ Created ${transferCount} transfers`)

  // Create player stats
  console.log('Creating player stats...')
  let statsCount = 0
  for (let i = 0; i < createdPlayers.length; i++) {
    const player = createdPlayers[i]
    const clubIdx = Math.floor(i / 3) % clubRefs.length
    const club = clubRefs[clubIdx]

    const seasonIds = Array.from(seasonMap.values())
    for (const seasonId of seasonIds) {
      const posCategory = positionMap.get(player.positionId || mid!.id) || 'MID'
      const isGK = posCategory === 'GK'
      const isDef = posCategory === 'DEF'
      const isMid = posCategory === 'MID'
      const isFwd = posCategory === 'FWD'

      const baseAppearances = isGK || isDef ? 30 + Math.floor(Math.random() * 10) : 25 + Math.floor(Math.random() * 15)

      await prisma.playerStats.create({
        data: {
          playerId: player.id,
          clubId: club.id,
          seasonId,
          competitionType: 'LEAGUE',
          appearances: baseAppearances,
          starts: Math.floor(baseAppearances * (0.8 + Math.random() * 0.2)),
          minutesPlayed: baseAppearances * (80 + Math.floor(Math.random() * 20)),
          goals: isGK ? 0 : Math.floor(Math.random() * (isFwd ? 30 : isMid ? 15 : 5)),
          assists: isGK ? 0 : Math.floor(Math.random() * (isMid ? 15 : isFwd ? 10 : 5)),
          yellowCards: Math.floor(Math.random() * 10),
          redCards: Math.random() > 0.9 ? 1 : 0,
          shots: isGK ? 0 : 20 + Math.floor(Math.random() * 100),
          shotsOnTarget: isGK ? 0 : 10 + Math.floor(Math.random() * 50),
          passes: 100 + Math.floor(Math.random() * 900),
          keyPasses: isGK ? 0 : 5 + Math.floor(Math.random() * 40),
          tackles: isGK ? 0 : Math.floor(Math.random() * 50),
          interceptions: isGK ? 0 : Math.floor(Math.random() * 35),
          foulsDrawn: Math.floor(Math.random() * 40),
          foulsCommitted: Math.floor(Math.random() * 30),
          cleanSheets: isGK || isDef ? Math.floor(Math.random() * 15) : undefined,
          goalsConceded: isGK || isDef ? Math.floor(Math.random() * 40) : undefined,
          saves: isGK ? Math.floor(Math.random() * 150) : undefined,
        },
      })
      statsCount++
    }
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
