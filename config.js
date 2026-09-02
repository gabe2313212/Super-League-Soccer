// ============================================
// SUPER LEAGUE SOCCER - GAME CONFIGURATION
// ============================================

const CONFIG = {

  // -------------------------
  // GAME SETTINGS
  // -------------------------

  rosterSize: 6,
  superSquadSize: 11,

  seasonMatches: 19,

  startingPoints: 100,

  // Points earned from matches
  matchPoints: {
    win: 100,
    draw: 50,
    loss: 0
  },

  // -------------------------
  // PACK SETTINGS
  // -------------------------

  packs: {
    bronze: {
      name: "Bronze Pack",
      cost: 50,
      cards: 5
    },

    gold: {
      name: "Gold Pack",
      cost: 100,
      cards: 5
    }
  },

  // Pack chances
  packOdds: {
    common: 0.75,
    rare: 0.20,
    icon: 0.05
  },

  // -------------------------
  // LEAGUES
  // -------------------------

  leagues: {
    premierLeague: "Premier League",
    laLiga: "LaLiga"
  },

  // -------------------------
  // PREMIER LEAGUE TEAMS
  // -------------------------

  premierLeagueTeams: [
    "Arsenal",
    "Aston Villa",
    "Bournemouth",
    "Brentford",
    "Brighton",
    "Chelsea",
    "Crystal Palace",
    "Everton",
    "Fulham",
    "Ipswich Town",
    "Leicester City",
    "Liverpool",
    "Manchester City",
    "Manchester United",
    "Newcastle United",
    "Nottingham Forest",
    "Southampton",
    "Tottenham Hotspur",
    "West Ham United",
    "Wolverhampton Wanderers"
  ],

  // -------------------------
  // LA LIGA TEAMS
  // -------------------------

  laLigaTeams: [
    "Athletic Club",
    "Atletico Madrid",
    "Barcelona",
    "Celta Vigo",
    "Espanyol",
    "Getafe",
    "Girona",
    "Las Palmas",
    "Leganes",
    "Mallorca",
    "Osasuna",
    "Rayo Vallecano",
    "Real Betis",
    "Real Madrid",
    "Real Sociedad",
    "Sevilla",
    "Valencia",
    "Valladolid",
    "Villarreal"
  ],

  // -------------------------
  // PLAYER DATABASE
  // -------------------------

  players: [

    // ARSENAL
    {
      name: "Bukayo Saka",
      team: "Arsenal",
      league: "Premier League",
      position: "RW",
      rating: 87
    },
    {
      name: "Martin Odegaard",
      team: "Arsenal",
      league: "Premier League",
      position: "CAM",
      rating: 89
    },
    {
      name: "Declan Rice",
      team: "Arsenal",
      league: "Premier League",
      position: "CM",
      rating: 87
    },
    {
      name: "William Saliba",
      team: "Arsenal",
      league: "Premier League",
      position: "CB",
      rating: 87
    },
    {
      name: "Gabriel Magalhaes",
      team: "Arsenal",
      league: "Premier League",
      position: "CB",
      rating: 86
    },
    {
      name: "Kai Havertz",
      team: "Arsenal",
      league: "Premier League",
      position: "ST",
      rating: 85
    },

    // CHELSEA
    {
      name: "Cole Palmer",
      team: "Chelsea",
      league: "Premier League",
      position: "CAM",
      rating: 88
    },
    {
      name: "Enzo Fernandez",
      team: "Chelsea",
      league: "Premier League",
      position: "CM",
      rating: 85
    },
    {
      name: "Moises Caicedo",
      team: "Chelsea",
      league: "Premier League",
      position: "CDM",
      rating: 84
    },
    {
      name: "Reece James",
      team: "Chelsea",
      league: "Premier League",
      position: "RB",
      rating: 84
    },
    {
      name: "Nicolas Jackson",
      team: "Chelsea",
      league: "Premier League",
      position: "ST",
      rating: 83
    },
    {
      name: "Christopher Nkunku",
      team: "Chelsea",
      league: "Premier League",
      position: "ST",
      rating: 84
    },

    // LIVERPOOL
    {
      name: "Mohamed Salah",
      team: "Liverpool",
      league: "Premier League",
      position: "RW",
      rating: 89
    },
    {
      name: "Virgil van Dijk",
      team: "Liverpool",
      league: "Premier League",
      position: "CB",
      rating: 89
    },
    {
      name: "Alisson Becker",
      team: "Liverpool",
      league: "Premier League",
      position: "GK",
      rating: 89
    },
    {
      name: "Trent Alexander-Arnold",
      team: "Liverpool",
      league: "Premier League",
      position: "RB",
      rating: 86
    },
    {
      name: "Luis Diaz",
      team: "Liverpool",
      league: "Premier League",
      position: "LW",
      rating: 86
    },
    {
      name: "Dominik Szoboszlai",
      team: "Liverpool",
      league: "Premier League",
      position: "CM",
      rating: 84
    },

    // MANCHESTER CITY
    {
      name: "Erling Haaland",
      team: "Manchester City",
      league: "Premier League",
      position: "ST",
      rating: 91
    },
    {
      name: "Kevin De Bruyne",
      team: "Manchester City",
      league: "Premier League",
      position: "CAM",
      rating: 90
    },
    {
      name: "Rodri",
      team: "Manchester City",
      league: "Premier League",
      position: "CDM",
      rating: 91
    },
    {
      name: "Phil Foden",
      team: "Manchester City",
      league: "Premier League",
      position: "RW",
      rating: 89
    },
    {
      name: "Bernardo Silva",
      team: "Manchester City",
      league: "Premier League",
      position: "CM",
      rating: 88
    },
    {
      name: "Ruben Dias",
      team: "Manchester City",
      league: "Premier League",
      position: "CB",
      rating: 89
    },

    // MANCHESTER UNITED
    {
      name: "Bruno Fernandes",
      team: "Manchester United",
      league: "Premier League",
      position: "CAM",
      rating: 87
    },
    {
      name: "Marcus Rashford",
      team: "Manchester United",
      league: "Premier League",
      position: "LW",
      rating: 84
    },
    {
      name: "Kobbie Mainoo",
      team: "Manchester United",
      league: "Premier League",
      position: "CM",
      rating: 82
    },
    {
      name: "Lisandro Martinez",
      team: "Manchester United",
      league: "Premier League",
      position: "CB",
      rating: 85
    },
    {
      name: "Andre Onana",
      team: "Manchester United",
      league: "Premier League",
      position: "GK",
      rating: 84
    },
    {
      name: "Matthijs de Ligt",
      team: "Manchester United",
      league: "Premier League",
      position: "CB",
      rating: 84
    },

    // TOTTENHAM
    {
      name: "Son Heung-min",
      team: "Tottenham Hotspur",
      league: "Premier League",
      position: "LW",
      rating: 87
    },
    {
      name: "James Maddison",
      team: "Tottenham Hotspur",
      league: "Premier League",
      position: "CAM",
      rating: 86
    },
    {
      name: "Cristian Romero",
      team: "Tottenham Hotspur",
      league: "Premier League",
      position: "CB",
      rating: 87
    },
    {
      name: "Micky van de Ven",
      team: "Tottenham Hotspur",
      league: "Premier League",
      position: "CB",
      rating: 85
    },
    {
      name: "Dejan Kulusevski",
      team: "Tottenham Hotspur",
      league: "Premier League",
      position: "RW",
      rating: 85
    },
    {
      name: "Dominic Solanke",
      team: "Tottenham Hotspur",
      league: "Premier League",
      position: "ST",
      rating: 84
    },

    // ASTON VILLA
    {
      name: "Ollie Watkins",
      team: "Aston Villa",
      league: "Premier League",
      position: "ST",
      rating: 86
    },
    {
      name: "Emiliano Martinez",
      team: "Aston Villa",
      league: "Premier League",
      position: "GK",
      rating: 86
    },
    {
      name: "John McGinn",
      team: "Aston Villa",
      league: "Premier League",
      position: "CM",
      rating: 84
    },
    {
      name: "Youri Tielemans",
      team: "Aston Villa",
      league: "Premier League",
      position: "CM",
      rating: 84
    },

    // NEWCASTLE
    {
      name: "Alexander Isak",
      team: "Newcastle United",
      league: "Premier League",
      position: "ST",
      rating: 88
    },
    {
      name: "Bruno Guimaraes",
      team: "Newcastle United",
      league: "Premier League",
      position: "CM",
      rating: 86
    },
    {
      name: "Anthony Gordon",
      team: "Newcastle United",
      league: "Premier League",
      position: "LW",
      rating: 84
    },
    {
      name: "Kieran Trippier",
      team: "Newcastle United",
      league: "Premier League",
      position: "RB",
      rating: 83
    },

    // BARCELONA
    {
      name: "Lamine Yamal",
      team: "Barcelona",
      league: "LaLiga",
      position: "RW",
      rating: 89
    },
    {
      name: "Robert Lewandowski",
      team: "Barcelona",
      league: "LaLiga",
      position: "ST",
      rating: 90
    },
    {
      name: "Pedri",
      team: "Barcelona",
      league: "LaLiga",
      position: "CM",
      rating: 89
    },
    {
      name: "Gavi",
      team: "Barcelona",
      league: "LaLiga",
      position: "CM",
      rating: 84
    },
    {
      name: "Raphinha",
      team: "Barcelona",
      league: "LaLiga",
      position: "LW",
      rating: 88
    },
    {
      name: "Frenkie de Jong",
      team: "Barcelona",
      league: "LaLiga",
      position: "CM",
      rating: 87
    },

    // REAL MADRID
    {
      name: "Vinicius Junior",
      team: "Real Madrid",
      league: "LaLiga",
      position: "LW",
      rating: 90
    },
    {
      name: "Kylian Mbappe",
      team: "Real Madrid",
      league: "LaLiga",
      position: "ST",
      rating: 91
    },
    {
      name: "Jude Bellingham",
      team: "Real Madrid",
      league: "LaLiga",
      position: "CAM",
      rating: 90
    },
    {
      name: "Federico Valverde",
      team: "Real Madrid",
      league: "LaLiga",
      position: "CM",
      rating: 88
    },
    {
      name: "Antonio Rudiger",
      team: "Real Madrid",
      league: "LaLiga",
      position: "CB",
      rating: 88
    },
    {
      name: "Thibaut Courtois",
      team: "Real Madrid",
      league: "LaLiga",
      position: "GK",
      rating: 89
    },

    // ATLETICO MADRID
    {
      name: "Antoine Griezmann",
      team: "Atletico Madrid",
      league: "LaLiga",
      position: "CF",
      rating: 88
    },
    {
      name: "Julian Alvarez",
      team: "Atletico Madrid",
      league: "LaLiga",
      position: "ST",
      rating: 87
    },
    {
      name: "Rodrigo De Paul",
      team: "Atletico Madrid",
      league: "LaLiga",
      position: "CM",
      rating: 84
    },
    {
      name: "Jan Oblak",
      team: "Atletico Madrid",
      league: "LaLiga",
      position: "GK",
      rating: 88
    },

    // GENERIC PLAYERS FOR OTHER CLUBS
    {
      name: "Club Star",
      team: "Bournemouth",
      league: "Premier League",
      position: "ST",
      rating: 82
    },
    {
      name: "Club Star",
      team: "Brentford",
      league: "Premier League",
      position: "ST",
      rating: 81
    },
    {
      name: "Club Star",
      team: "Brighton",
      league: "Premier League",
      position: "CAM",
      rating: 82
    },
    {
      name: "Club Star",
      team: "Crystal Palace",
      league: "Premier League",
      position: "LW",
      rating: 82
    },
    {
      name: "Club Star",
      team: "Everton",
      league: "Premier League",
      position: "CB",
      rating: 80
    },
    {
      name: "Club Star",
      team: "Fulham",
      league: "Premier League",
      position: "CM",
      rating: 81
    },
    {
      name: "Club Star",
      team: "West Ham United",
      league: "Premier League",
      position: "ST",
      rating: 83
    },

    // -------------------------
    // ICONS
    // -------------------------

    {
      name: "Thierry Henry",
      team: "Icon",
      league: "Icons",
      position: "ST",
      rating: 94,
      rarity: "Icon"
    },
    {
      name: "Zinedine Zidane",
      team: "Icon",
      league: "Icons",
      position: "CAM",
      rating: 95,
      rarity: "Icon"
    },
    {
      name: "Ronaldo Nazario",
      team: "Icon",
      league: "Icons",
      position: "ST",
      rating: 96,
      rarity: "Icon"
    },
    {
      name: "Ronaldinho",
      team: "Icon",
      league: "Icons",
      position: "LW",
      rating: 94,
      rarity: "Icon"
    },
    {
      name: "David Beckham",
      team: "Icon",
      league: "Icons",
      position: "RM",
      rating: 92,
      rarity: "Icon"
    },
    {
      name: "Andrea Pirlo",
      team: "Icon",
      league: "Icons",
      position: "CM",
      rating: 93,
      rarity: "Icon"
    },
    {
      name: "Paolo Maldini",
      team: "Icon",
      league: "Icons",
      position: "CB",
      rating: 95,
      rarity: "Icon"
    },
    {
      name: "Xavi",
      team: "Icon",
      league: "Icons",
      position: "CM",
      rating: 94,
      rarity: "Icon"
    }
  ]
};
