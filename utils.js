// ============================================
// SUPER LEAGUE SOCCER - UTILITY FUNCTIONS
// ============================================

// Get a random number between min and max
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Shuffle an array
function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

// Calculate the average rating of players
function averageRating(players) {
  if (!players || players.length === 0) {
    return 0;
  }

  const total = players.reduce((sum, player) => {
    return sum + Number(player.rating || 0);
  }, 0);

  return Math.round(total / players.length);
}

// Find a player by name
function findPlayer(name) {
  return CONFIG.players.find(player => player.name === name);
}

// Get players from a specific team
function getPlayersFromTeam(teamName) {
  return CONFIG.players.filter(player => player.team === teamName);
}

// Get players from a specific league
function getPlayersFromLeague(leagueName) {
  return CONFIG.players.filter(player => player.league === leagueName);
}

// Generate players for clubs that don't have a full database
function generateClubPlayers(teamName, leagueName) {
  const positions = [
    "GK",
    "CB",
    "CB",
    "LB",
    "RB",
    "CM",
    "CM",
    "CAM",
    "LW",
    "RW",
    "ST"
  ];

  return positions.map((position, index) => {
    return {
      name: `${teamName} Player ${index + 1}`,
      team: teamName,
      league: leagueName,
      position: position,
      rating: randomNumber(72, 82)
    };
  });
}

// Get a complete team
function getCompleteTeam(teamName, leagueName) {
  const realPlayers = getPlayersFromTeam(teamName);

  if (realPlayers.length >= 6) {
    return realPlayers;
  }

  const generatedPlayers = generateClubPlayers(
    teamName,
    leagueName
  );

  return [...realPlayers, ...generatedPlayers];
}

// Save data to browser storage
function saveGame(data) {
  localStorage.setItem(
    "superLeagueSoccerSave",
    JSON.stringify(data)
  );
}

// Load saved data
function loadGame() {
  const saved = localStorage.getItem(
    "superLeagueSoccerSave"
  );

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error("Could not load saved game:", error);
    return null;
  }
}

// Delete saved game
function deleteSave() {
  localStorage.removeItem(
    "superLeagueSoccerSave"
  );
}

// Escape HTML so player/team names are safe to display
function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = String(text);

  return div.innerHTML;
}

// Simple profanity filter
const BAD_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "asshole",
  "dick",
  "piss",
  "bastard"
];

function cleanTeamName(name) {
  let cleaned = String(name || "").trim();

  if (!cleaned) {
    return "My Super Squad";
  }

  for (const word of BAD_WORDS) {
    const pattern = new RegExp(word, "gi");

    cleaned = cleaned.replace(
      pattern,
      "*".repeat(word.length)
    );
  }

  return cleaned.substring(0, 25);
}

// Calculate squad rating
function calculateSquadRating(players) {
  if (!players || players.length === 0) {
    return 0;
  }

  return averageRating(players);
}

// Calculate the strength of a squad
function calculateSquadStrength(players) {
  if (!players || players.length === 0) {
    return 50;
  }

  const rating = averageRating(players);

  return Math.max(50, Math.min(99, rating));
}

// Create a random opponent rating
function generateOpponentRating() {
  return randomNumber(72, 90);
}

// Simulate a football match
function simulateMatch(teamRating, opponentRating) {

  const teamPower =
    teamRating + randomNumber(-12, 12);

  const opponentPower =
    opponentRating + randomNumber(-12, 12);

  let result;

  if (teamPower > opponentPower + 5) {
    result = "win";
  } else if (opponentPower > teamPower + 5) {
    result = "loss";
  } else {
    result = "draw";
  }

  let points = 0;

  if (result === "win") {
    points = CONFIG.matchPoints.win;
  }

  if (result === "draw") {
    points = CONFIG.matchPoints.draw;
  }

  if (result === "loss") {
    points = CONFIG.matchPoints.loss;
  }

  return {
    result: result,
    points: points,
    teamRating: teamRating,
    opponentRating: opponentRating
  };
}

// Convert result to a readable word
function resultText(result) {
  if (result === "win") {
    return "WIN";
  }

  if (result === "draw") {
    return "DRAW";
  }

  if (result === "loss") {
    return "LOSS";
  }

  return result;
}

// Get CSS class for result
function resultClass(result) {
  if (result === "win") {
    return "win";
  }

  if (result === "draw") {
    return "draw";
  }

  if (result === "loss") {
    return "loss";
  }

  return "";
}

// Create a unique ID
function createID() {
  return Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8);
}

// Create a player card object
function createCard(player, rarity = "Common") {
  return {
    id: createID(),
    name: player.name,
    team: player.team,
    league: player.league,
    position: player.position,
    rating: player.rating,
    rarity: rarity
  };
}

// Get the color/style class for card rarity
function rarityClass(rarity) {
  if (rarity === "Icon") {
    return "icon-card";
  }

  if (rarity === "Rare") {
    return "rare-card";
  }

  return "";
}

// Check whether a player is already in a squad
function playerInSquad(squad, player) {
  return squad.some(
    existing =>
      existing.name === player.name &&
      existing.team === player.team
  );
}

// Get a random normal player
function getRandomNormalPlayer() {
  const players = CONFIG.players.filter(
    player => player.rarity !== "Icon"
  );

  return randomItem(players);
}

// Get a random Icon
function getRandomIcon() {
  const icons = CONFIG.players.filter(
    player => player.rarity === "Icon"
  );

  return randomItem(icons);
}

// Get a random Rare player
function getRandomRarePlayer() {
  const players = CONFIG.players.filter(
    player => player.rarity !== "Icon"
  );

  const strongPlayers = players.filter(
    player => player.rating >= 84
  );

  return randomItem(
    strongPlayers.length ? strongPlayers : players
  );
}

// Pick a player for a pack
function getPackPlayer(packType) {

  const roll = Math.random();

  let rarity;

  if (roll < CONFIG.packOdds.icon) {
    rarity = "Icon";
  } else if (
    roll <
    CONFIG.packOdds.icon + CONFIG.packOdds.rare
  ) {
    rarity = "Rare";
  } else {
    rarity = "Common";
  }

  let player;

  if (rarity === "Icon") {
    player = getRandomIcon();
  } else if (rarity === "Rare") {
    player = getRandomRarePlayer();
  } else {
    player = getRandomNormalPlayer();
  }

  return createCard(player, rarity);
}

// Format a number
function formatNumber(number) {
  return Number(number || 0).toLocaleString();
}
