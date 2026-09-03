/* =========================================================
   SUPER LEAGUE SOCCER
   Complete game controller
   ========================================================= */

let game = createDefaultGame();

function createDefaultGame() {
  return {
    mode: null,

    // Build a Roster
    rosterTeam: "",
    roster: [],
    rosterSeason: null,
    rosterStandings: [],

    // Super Squad
    squadName: "",
    points: CONFIG.startingPoints || 100,
    wins: 0,
    draws: 0,
    losses: 0,

    collection: [],
    lineup: [],

    superDifficulty: "easy",
    squadSeason: null
  };
}

/* =========================================================
   ICON DATABASE
   Adds Icons without replacing your existing players.
   ========================================================= */

const EXTRA_ICONS = [
  ["Pele", 98],
  ["Diego Maradona", 97],
  ["Ronaldo Nazario", 96],
  ["Johan Cruyff", 96],
  ["Zinedine Zidane", 95],
  ["Paolo Maldini", 95],
  ["Franz Beckenbauer", 95],
  ["Ronaldinho", 94],
  ["Thierry Henry", 94],
  ["Xavi", 94],
  ["Andres Iniesta", 94],
  ["Andrea Pirlo", 93],
  ["Roberto Carlos", 94],
  ["Cafu", 93],
  ["Iker Casillas", 94],
  ["Gianluigi Buffon", 94],
  ["Alessandro Nesta", 93],
  ["Franco Baresi", 94],
  ["David Beckham", 92],
  ["Luis Figo", 93],
  ["Rivaldo", 93],
  ["Kaka", 93],
  ["Patrick Vieira", 93],
  ["Clarence Seedorf", 92],
  ["Eric Cantona", 93],
  ["George Best", 94],
  ["Eusebio", 95],
  ["Marco van Basten", 94],
  ["Ruud Gullit", 93],
  ["Bobby Charlton", 93]
];

function addExtraIcons() {
  if (!CONFIG.players) CONFIG.players = [];

  EXTRA_ICONS.forEach(([name, rating]) => {
    const exists = CONFIG.players.some(
      p => p.name.toLowerCase() === name.toLowerCase()
    );

    if (!exists) {
      CONFIG.players.push({
        name,
        rating,
        position: "ICON",
        team: "Icons",
        league: "Icons",
        rarity: "Icon"
      });
    }
  });
}

/* =========================================================
   STARTUP
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  addExtraIcons();

  const saved = loadGame();

  if (saved) {
    game = {
      ...createDefaultGame(),
      ...saved
    };
  }

  setupEventListeners();
  renderAll();
  showScreen("mainMenu");
});

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {
  bind("resetGame", "click", resetGame);

  bind("rosterTeam", "change", renderRosterPlayers);
  bind("startRosterSeason", "click", startRosterSeason);
  bind("playRosterMatch", "click", playRosterMatch);

  bind("createTeamButton", "click", createSuperTeam);
  bind("bronzePack", "click", () => openPack("bronze"));
  bind("goldPack", "click", () => openPack("gold"));
  bind("playSuperMatch", "click", playSuperMatch);

  bind("backFromRoster", "click", () => openMode("mainMenu"));
  bind("backFromSquad", "click", () => openMode("mainMenu"));
}

function bind(id, event, fn) {
  const element = document.getElementById(id);

  if (element) {
    element.addEventListener(event, fn);
  }
}

/* =========================================================
   SCREEN CONTROL
   ========================================================= */

function openMode(modeId) {
  if (modeId === "rosterMode") {
    openRosterMode();
    return;
  }

  if (modeId === "superSquadMode") {
    openSuperSquadMode();
    return;
  }

  showScreen(modeId);
}

window.openMode = openMode;

function showScreen(id) {
  const screens = document.querySelectorAll(".screen");

  screens.forEach(screen => {
    screen.classList.remove("active");
    screen.classList.add("hidden");
    screen.style.display = "none";
  });

  const target = document.getElementById(id);

  if (!target) return;

  target.classList.remove("hidden");
  target.classList.add("active");
  target.style.display = "block";
}

function openRosterMode() {
  game.mode = "roster";

  showScreen("rosterMode");

  populateRosterTeams();
  renderRosterPlayers();
  renderRosterSeason();
  renderRosterStandings();

  saveGame(game);
}

function openSuperSquadMode() {
  game.mode = "superSquad";

  showScreen("superSquadMode");

  renderSuperSquad();

  saveGame(game);
}

/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderAll() {
  populateRosterTeams();
  renderRosterPlayers();
  renderRosterSeason();
  renderRosterStandings();
  renderSuperSquad();
}

/* =========================================================
   BUILD A ROSTER
   ========================================================= */

function populateRosterTeams() {
  const select = document.getElementById("rosterTeam");

  if (!select) return;

  const teams = CONFIG.premierLeagueTeams || [];

  const current = game.rosterTeam;

  select.innerHTML = `
    <option value="">Choose a Premier League team</option>
    ${teams.map(team => `
      <option value="${escapeHTML(team)}">
        ${escapeHTML(team)}
      </option>
    `).join("")}
  `;

  if (current && teams.includes(current)) {
    select.value = current;
  }
}

function renderRosterPlayers() {
  const container = document.getElementById("rosterPlayers");
  const select = document.getElementById("rosterTeam");

  if (!container || !select) return;

  game.rosterTeam = select.value;

  if (!game.rosterTeam) {
    container.innerHTML = "<p>Choose a team to see its players.</p>";
    updateSelectedCount();
    return;
  }

  let players = getPlayersFromTeam(game.rosterTeam);

  if (!players || players.length === 0) {
    players = generateClubPlayers(
      game.rosterTeam,
      "Premier League"
    );
  }

  container.innerHTML = players.map(player => {
    const selected = game.roster.some(
      p => p.name === player.name
    );

    return `
      <button
        class="player-card ${selected ? "selected" : ""}"
        onclick='toggleRosterPlayer(${JSON.stringify(player.name)})'
      >
        <strong>${escapeHTML(player.name)}</strong>
        <span>${escapeHTML(player.position || "Player")}</span>
        <span>Rating: ${player.rating}</span>
      </button>
    `;
  }).join("");

  updateSelectedCount();
}

window.toggleRosterPlayer = toggleRosterPlayer;

function toggleRosterPlayer(playerName) {
  const player = findPlayer(playerName);

  if (!player) return;

  const alreadySelected = game.roster.some(
    p => p.name === player.name
  );

  if (alreadySelected) {
    game.roster = game.roster.filter(
      p => p.name !== player.name
    );
  } else {
    if (game.roster.length >= 6) {
      notify("You can only select 6 players.");
      return;
    }

    game.roster.push(player);
  }

  renderRosterPlayers();
  saveGame(game);
}

function updateSelectedCount() {
  const count = document.getElementById("selectedCount");

  if (count) {
    count.textContent = `${game.roster.length}/6 players selected`;
  }
}

function startRosterSeason() {
  if (game.roster.length !== 6) {
    notify("Select exactly 6 players first.");
    return;
  }

  game.rosterSeason = {
    match: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
    results: []
  };

  game.rosterStandings = createRosterStandings();

  renderRosterSeason();
  renderRosterStandings();

  saveGame(game);

  notify("Season started!");
}

function playRosterMatch() {
  if (!game.rosterSeason) {
    notify("Start your season first.");
    return;
  }

  if (game.rosterSeason.match >= CONFIG.seasonMatches) {
    notify("Your season is already complete.");
    return;
  }

  const opponents = (CONFIG.premierLeagueTeams || [])
    .filter(team => team !== game.rosterTeam);

  const opponent = randomItem(opponents);

  const teamRating = Math.round(
    averageRating(game.roster)
  );

  const opponentRating = randomNumber(74, 88);

  const result = simulateMatchScore(
    teamRating,
    opponentRating,
    100,
    50
  );

  game.rosterSeason.match++;

  if (result.result === "win") {
    game.rosterSeason.wins++;
  } else if (result.result === "draw") {
    game.rosterSeason.draws++;
  } else {
    game.rosterSeason.losses++;
  }

  game.rosterSeason.points += result.points;

  game.rosterSeason.results.push({
    match: game.rosterSeason.match,
    opponent,
    score: `${result.teamGoals}-${result.opponentGoals}`,
    result: result.result,
    points: result.points
  });

  updateRosterStandings(
    game.rosterTeam,
    game.rosterSeason.points,
    game.rosterSeason.wins,
    game.rosterSeason.draws,
    game.rosterSeason.losses
  );

  showRosterMatchResult(opponent, result);
  renderRosterSeason();
  renderRosterStandings();

  saveGame(game);
}

function simulateMatchScore(
  teamRating,
  opponentRating,
  winPoints,
  drawPoints
) {
  const difference = teamRating - opponentRating;

  let chance = 0.5 + difference * 0.025;

  chance = Math.max(0.15, Math.min(0.85, chance));

  const roll = Math.random();

  let result;

  if (roll < chance - 0.12) {
    result = "win";
  } else if (roll < chance + 0.12) {
    result = "draw";
  } else {
    result = "loss";
  }

  let teamGoals;
  let opponentGoals;

  if (result === "draw") {
    teamGoals = randomNumber(0, 3);
    opponentGoals = teamGoals;
  } else if (result === "win") {
    teamGoals = randomNumber(2, 5);
    opponentGoals = randomNumber(0, Math.max(0, teamGoals - 1));
  } else {
    opponentGoals = randomNumber(2, 5);
    teamGoals = randomNumber(0, Math.max(0, opponentGoals - 1));
  }

  return {
    result,
    points:
      result === "win"
        ? winPoints
        : result === "draw"
          ? drawPoints
          : 0,
    teamGoals,
    opponentGoals
  };
}

function showRosterMatchResult(opponent, result) {
  const title = document.getElementById("rosterMatchTitle");
  const display = document.getElementById("rosterMatch");

  if (!title || !display) return;

  const resultWord =
    result.result === "win"
      ? "beat"
      : result.result === "draw"
        ? "drew with"
        : "lost to";

  title.textContent = `Match ${game.rosterSeason.match}`;

  display.innerHTML = `
    <div class="game-card">
      <h3>
        ${escapeHTML(game.rosterTeam)}
        ${result.teamGoals}
        -
        ${result.opponentGoals}
        ${escapeHTML(opponent)}
      </h3>

      <p>
        ${escapeHTML(game.rosterTeam)}
        ${resultWord}
        ${escapeHTML(opponent)}
      </p>

      <strong>
        +${result.points} points
      </strong>
    </div>
  `;
}

/* =========================================================
   ROSTER SEASON
   ========================================================= */

function renderRosterSeason() {
  const container = document.getElementById("rosterSeason");

  if (!container) return;

  if (!game.rosterSeason) {
    container.innerHTML = `
      <div class="info-box">
        Select 6 players and start your season.
      </div>
    `;
    return;
  }

  const season = game.rosterSeason;

  container.innerHTML = `
    <div class="stats-grid">
      <div>
        <strong>Match</strong>
        <span>${season.match}/${CONFIG.seasonMatches}</span>
      </div>

      <div>
        <strong>Points</strong>
        <span>${season.points}</span>
      </div>

      <div>
        <strong>Wins</strong>
        <span>${season.wins}</span>
      </div>

      <div>
        <strong>Draws</strong>
        <span>${season.draws}</span>
      </div>

      <div>
        <strong>Losses</strong>
        <span>${season.losses}</span>
      </div>
    </div>
  `;

  if (season.match >= CONFIG.seasonMatches) {
    const results = document.getElementById("rosterResults");

    if (results) {
      results.innerHTML = `
        <div class="info-box">
          <h3>Season Complete!</h3>
          <p>
            ${season.wins} wins,
            ${season.draws} draws,
            ${season.losses} losses
          </p>
          <strong>
            ${season.points} points
          </strong>
        </div>
      `;
    }
  }
}

function createRosterStandings() {
  const teams = CONFIG.premierLeagueTeams || [];

  return teams.map(team => ({
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0
  }));
}

function findStanding(team) {
  return game.rosterStandings.find(
    standing => standing.team === team
  );
}

function updateRosterStandings(
  team,
  points,
  wins,
  draws,
  losses
) {
  if (!game.rosterStandings.length) {
    game.rosterStandings = createRosterStandings();
  }

  const standing = findStanding(team);

  if (!standing) return;

  standing.played = wins + draws + losses;
  standing.wins = wins;
  standing.draws = draws;
  standing.losses = losses;
  standing.points = points;

  game.rosterStandings.sort(
    (a, b) => b.points - a.points
  );
}

function renderRosterStandings() {
  const body = document.getElementById("standingsBody");

  if (!body) return;

  if (!game.rosterStandings.length) {
    game.rosterStandings = createRosterStandings();
  }

  const standings = [...game.rosterStandings]
    .sort((a, b) => b.points - a.points);

  body.innerHTML = standings.map((standing, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHTML(standing.team)}</td>
      <td>${standing.played}</td>
      <td>${standing.wins}</td>
      <td>${standing.draws}</td>
      <td>${standing.losses}</td>
      <td><strong>${standing.points}</strong></td>
    </tr>
  `).join("");
}

/* =========================================================
   SUPER SQUAD
   ========================================================= */

function createSuperTeam() {
  const input = document.getElementById("teamName");

  if (!input) return;

  const rawName = input.value.trim();

  if (!rawName) {
    notify("Enter a team name.");
    return;
  }

  game.squadName = cleanTeamName(rawName);

  if (!game.squadName) {
    notify("Please choose a different team name.");
    return;
  }

  game.points = CONFIG.startingPoints || 100;
  game.wins = 0;
  game.draws = 0;
  game.losses = 0;
  game.collection = [];
  game.lineup = [];
  game.squadSeason = {
    match: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
    results: []
  };

  game.superDifficulty =
    CONFIG.defaultSuperSquadMode || "easy";

  renderSuperSquad();
  saveGame(game);

  notify(`Welcome to Super Squad, ${game.squadName}!`);
}

function renderSuperSquad() {
  const createBox = document.getElementById("createTeamBox");
  const superGame = document.getElementById("superGame");

  if (!game.squadName) {
    if (createBox) createBox.style.display = "block";
    if (superGame) superGame.style.display = "none";
    return;
  }

  if (createBox) createBox.style.display = "none";
  if (superGame) superGame.style.display = "block";

  const name = document.getElementById("superTeamName");

  if (name) {
    name.textContent = game.squadName;
  }

  renderSuperStats();
  renderPacks();
  renderCollection();
  renderLineup();
  renderSuperSeason();
  renderDifficultyButton();
}

function renderSuperStats() {
  const points = document.getElementById("superPoints");
  const wins = document.getElementById("superWins");
  const draws = document.getElementById("superDraws");
  const losses = document.getElementById("superLosses");

  if (points) points.textContent = formatNumber(game.points);
  if (wins) wins.textContent = game.wins;
  if (draws) draws.textContent = game.draws;
  if (losses) losses.textContent = game.losses;
}

/* =========================================================
   DIFFICULTY
   ========================================================= */

function getDifficultySettings() {
  const modes = CONFIG.superSquadModes || {
    easy: {
      name: "Easy Mode",
      opponentMin: 72,
      opponentMax: 84,
      winPoints: 100,
      drawPoints: 50,
      lossPoints: 0
    },
    hard: {
      name: "Hard Mode",
      opponentMin: 82,
      opponentMax: 95,
      winPoints: 200,
      drawPoints: 100,
      lossPoints: 0
    }
  };

  return modes[game.superDifficulty] || modes.easy;
}

function renderDifficultyButton() {
  const superGame = document.getElementById("superGame");

  if (!superGame) return;

  let box = document.getElementById("difficultyBox");

  if (!box) {
    box = document.createElement("div");
    box.id = "difficultyBox";
    box.className = "info-box";

    superGame.insertBefore(
      box,
      superGame.firstChild
    );
  }

  const settings = getDifficultySettings();

  box.innerHTML = `
    <h3>Difficulty: ${escapeHTML(settings.name)}</h3>

    <p>
      Opponents:
      ${settings.opponentMin}-${settings.opponentMax}
    </p>

    <p>
      Win: ${settings.winPoints} |
      Draw: ${settings.drawPoints} |
      Loss: ${settings.lossPoints}
    </p>

    <button
      class="main-button"
      id="difficultyToggle"
    >
      Switch to ${
        game.superDifficulty === "easy"
          ? "Hard"
          : "Easy"
      }
    </button>
  `;

  const button = document.getElementById(
    "difficultyToggle"
  );

  if (button) {
    button.onclick = toggleDifficulty;
  }
}

function toggleDifficulty() {
  if (game.superDifficulty === "easy") {
    game.superDifficulty = "hard";
    notify("Hard Mode enabled. Opponents are stronger and rewards are higher.");
  } else {
    game.superDifficulty = "easy";
    notify("Easy Mode enabled. Rewards are now 100/50/0.");
  }

  renderSuperSquad();
  saveGame(game);
}

/* =========================================================
   PACKS
   ========================================================= */

function renderPacks() {
  const bronze = document.getElementById("bronzePack");
  const gold = document.getElementById("goldPack");

  if (bronze) {
    bronze.disabled =
      game.points < 50;
  }

  if (gold) {
    gold.disabled =
      game.points < 100;
  }

  let iconButton =
    document.getElementById("iconPack");

  const packContainer =
    bronze?.parentElement?.parentElement ||
    gold?.parentElement?.parentElement;

  if (!iconButton && packContainer) {
    iconButton = document.createElement("button");
    iconButton.id = "iconPack";
    iconButton.className = "pack icon";
    iconButton.innerHTML = `
      <strong>Icon Pack</strong>
      <span>1,000 points</span>
      <small>1 guaranteed Icon</small>
    `;

    iconButton.onclick = () => openPack("icon");

    packContainer.appendChild(iconButton);
  }

  if (iconButton) {
    iconButton.disabled =
      game.points < 1000;
  }
}

function getPackPlayerCustom(packType) {
  const normalPlayers = (CONFIG.players || [])
    .filter(p => p.rarity !== "Icon");

  const icons = (CONFIG.players || [])
    .filter(p => p.rarity === "Icon");

  if (packType === "icon") {
    return randomItem(icons);
  }

  let roll = Math.random();

  let iconChance;
  let rareChance;

  if (packType === "bronze") {
    iconChance = 0.04;
    rareChance = 0.20;
  } else {
    iconChance = 0.10;
    rareChance = 0.30;
  }

  if (roll < iconChance && icons.length) {
    return randomItem(icons);
  }

  roll = Math.random();

  if (roll < rareChance) {
    const rarePlayers = normalPlayers.filter(
      p =>
        p.rarity === "Rare" ||
        p.rarity === "rare"
    );

    if (rarePlayers.length) {
      return randomItem(rarePlayers);
    }
  }

  return randomItem(normalPlayers);
}

function openPack(packType) {
  const costs = {
    bronze: 50,
    gold: 100,
    icon: 1000
  };

  const cards = {
    bronze: 5,
    gold: 5,
    icon: 1
  };

  const cost = costs[packType];

  if (game.points < cost) {
    notify(`You need ${cost} points.`);
    return;
  }

  game.points -= cost;

  const pulled = [];

  for (let i = 0; i < cards[packType]; i++) {
    const player = getPackPlayerCustom(packType);

    if (!player) continue;

    const rarity =
      player.rarity || "Common";

    const card = {
      ...player,
      id: createID(),
      rarity
    };

    game.collection.push(card);
    pulled.push(card);
  }

  showPackResults(pulled);

  renderSuperSquad();
  saveGame(game);
}

function showPackResults(players) {
  const container =
    document.getElementById("packResults");

  if (!container) return;

  container.innerHTML = `
    <div class="collection-grid">
      ${players.map(player => `
        <div class="card ${rarityClass(player.rarity)}">
          <strong>${escapeHTML(player.name)}</strong>
          <span>${escapeHTML(player.position || "Player")}</span>
          <span>Rating: ${player.rating}</span>
          <small>${escapeHTML(player.rarity || "Common")}</small>
        </div>
      `).join("")}
    </div>
  `;
}

/* =========================================================
   COLLECTION
   ========================================================= */

function renderCollection() {
  const container =
    document.getElementById("collection");

  if (!container) return;

  if (!game.collection.length) {
    container.innerHTML =
      "<p>Your collection is empty. Open a pack!</p>";
    return;
  }

  container.innerHTML =
    game.collection.map((player, index) => {
      const selected = game.lineup.some(
        p => p.id === player.id
      );

      return `
        <div class="card ${rarityClass(player.rarity)}">
          <strong>${escapeHTML(player.name)}</strong>
          <span>${escapeHTML(player.position || "Player")}</span>
          <span>Rating: ${player.rating}</span>
          <small>${escapeHTML(player.rarity || "Common")}</small>

          <button
            class="main-button"
            onclick="addToLineup(${index})"
            ${selected || game.lineup.length >= 11 ? "disabled" : ""}
          >
            ${selected ? "In Lineup" : "Add to Lineup"}
          </button>
        </div>
      `;
    }).join("");
}

function addToLineup(index) {
  if (game.lineup.length >= 11) {
    notify("Your lineup already has 11 players.");
    return;
  }

  const player = game.collection[index];

  if (!player) return;

  if (
    game.lineup.some(p => p.id === player.id)
  ) {
    return;
  }

  game.lineup.push(player);

  renderSuperSquad();
  saveGame(game);
}

window.addToLineup = addToLineup;

function removeFromLineup(index) {
  game.lineup.splice(index, 1);

  renderSuperSquad();
  saveGame(game);
}

window.removeFromLineup = removeFromLineup;

function renderLineup() {
  const container =
    document.getElementById("superLineup");

  const count =
    document.getElementById("lineupCount");

  if (count) {
    count.textContent =
      `${game.lineup.length}/11`;
  }

  if (!container) return;

  if (!game.lineup.length) {
    container.innerHTML =
      "<p>Add players from your collection.</p>";
    return;
  }

  container.innerHTML =
    game.lineup.map((player, index) => `
      <div class="lineup-slot">
        <strong>${escapeHTML(player.name)}</strong>
        <span>${escapeHTML(player.position || "Player")}</span>
        <span>${player.rating}</span>

        <button
          class="main-button"
          onclick="removeFromLineup(${index})"
        >
          Remove
        </button>
      </div>
    `).join("");
}

/* =========================================================
   SUPER SQUAD MATCH
   ========================================================= */

function playSuperMatch() {
  if (!game.squadName) {
    notify("Create your Super Squad first.");
    return;
  }

  if (game.lineup.length !== 11) {
    notify("You need exactly 11 players in your lineup.");
    return;
  }

  const settings = getDifficultySettings();

  const opponents = [
    ...(CONFIG.premierLeagueTeams || []),
    ...(CONFIG.laLigaTeams || [])
  ];

  const opponent = randomItem(opponents);

  const teamRating =
    calculateSquadRating(game.lineup);

  const opponentRating =
    randomNumber(
      settings.opponentMin,
      settings.opponentMax
    );

  const result = simulateMatchScore(
    teamRating,
    opponentRating,
    settings.winPoints,
    settings.drawPoints
  );

  game.points += result.points;

  if (result.result === "win") {
    game.wins++;
  } else if (result.result === "draw") {
    game.draws++;
  } else {
    game.losses++;
  }

  if (!game.squadSeason) {
    game.squadSeason = {
      match: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      results: []
    };
  }

  game.squadSeason.match++;
  game.squadSeason.points += result.points;

  if (result.result === "win") {
    game.squadSeason.wins++;
  } else if (result.result === "draw") {
    game.squadSeason.draws++;
  } else {
    game.squadSeason.losses++;
  }

  game.squadSeason.results.push({
    match: game.squadSeason.match,
    opponent,
    score: `${result.teamGoals}-${result.opponentGoals}`,
    result: result.result,
    points: result.points,
    difficulty: game.superDifficulty
  });

  showSuperMatchResult(
    opponent,
    result,
    settings
  );

  renderSuperSquad();
  saveGame(game);
}

function showSuperMatchResult(
  opponent,
  result,
  settings
) {
  const container =
    document.getElementById("superResults");

  if (!container) return;

  let sentence;

  if (result.result === "win") {
    sentence =
      `${game.squadName} beat ${opponent}`;
  } else if (result.result === "draw") {
    sentence =
      `${game.squadName} drew with ${opponent}`;
  } else {
    sentence =
      `${game.squadName} lost to ${opponent}`;
  }

  container.innerHTML = `
    <div class="info-box">
      <h3>
        ${escapeHTML(game.squadName)}
        ${result.teamGoals}
        -
        ${result.opponentGoals}
        ${escapeHTML(opponent)}
      </h3>

      <p>${escapeHTML(sentence)}</p>

      <p>
        Difficulty:
        <strong>${escapeHTML(settings.name)}</strong>
      </p>

      <h3>
        +${result.points} points
      </h3>
    </div>
  `;
}

/* =========================================================
   SUPER SQUAD SEASON
   ========================================================= */

function renderSuperSeason() {
  const info =
    document.getElementById("superSeasonInfo");

  const results =
    document.getElementById("superResults");

  if (!game.squadSeason) {
    if (info) {
      info.innerHTML =
        "<p>Your season has not started yet.</p>";
    }

    return;
  }

  const season = game.squadSeason;

  if (info) {
    info.innerHTML = `
      <div class="stats-grid">
        <div>
          <strong>Matches</strong>
          <span>${season.match}/19</span>
        </div>

        <div>
          <strong>Points</strong>
          <span>${season.points}</span>
        </div>

        <div>
          <strong>Wins</strong>
          <span>${season.wins}</span>
        </div>

        <div>
          <strong>Draws</strong>
          <span>${season.draws}</span>
        </div>

        <div>
          <strong>Losses</strong>
          <span>${season.losses}</span>
        </div>
      </div>
    `;
  }

  if (
    season.match >= 19 &&
    results
  ) {
    results.innerHTML += `
      <div class="info-box">
        <h3>Super Squad Season Complete!</h3>
        <p>
          ${season.wins} wins,
          ${season.draws} draws,
          ${season.losses} losses
        </p>
        <strong>
          ${season.points} season points
        </strong>
      </div>
    `;
  }
}

/* =========================================================
   RESET
   ========================================================= */

function resetGame() {
  const confirmed = confirm(
    "Are you sure you want to reset your entire game?"
  );

  if (!confirmed) return;

  game = createDefaultGame();

  deleteSave();

  const teamName =
    document.getElementById("teamName");

  if (teamName) {
    teamName.value = "";
  }

  const rosterTeam =
    document.getElementById("rosterTeam");

  if (rosterTeam) {
    rosterTeam.value = "";
  }

  renderAll();
  showScreen("mainMenu");

  notify("Game reset.");
}

/* =========================================================
   NOTIFICATION
   ========================================================= */

function notify(message) {
  const notification =
    document.getElementById("notification");

  if (!notification) {
    alert(message);
    return;
  }

  notification.textContent = message;
  notification.style.display = "block";

  clearTimeout(window.superLeagueNotificationTimer);

  window.superLeagueNotificationTimer =
    setTimeout(() => {
      notification.style.display = "none";
    }, 3000);
}
