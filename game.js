/* =========================================================
   SUPER LEAGUE SOCCER
   COMPLETE GAME.JS
   ========================================================= */

let game = createDefaultGame();

/* =========================================================
   DEFAULT GAME
   ========================================================= */

function createDefaultGame() {
  return {
    mode: null,

    /* BUILD A ROSTER */
    rosterLeague: "Premier League",
    rosterTeam: "",
    roster: [],
    rosterSeason: null,
    rosterStandings: [],

    /* SUPER SQUAD */
    squadName: "",
    points: 100,
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
   30 ICONS
   ========================================================= */

const ICONS = [
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

function addIcons() {
  if (!CONFIG.players) {
    CONFIG.players = [];
  }

  ICONS.forEach(icon => {
    const name = icon[0];
    const rating = icon[1];

    const exists = CONFIG.players.some(
      player =>
        player.name &&
        player.name.toLowerCase() === name.toLowerCase()
    );

    if (!exists) {
      CONFIG.players.push({
        name: name,
        rating: rating,
        position: "ICON",
        team: "Icons",
        league: "Icons",
        rarity: "Icon"
      });
    }
  });
}

/* =========================================================
   START
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  addIcons();

  const saved = loadGame();

  if (saved) {
    game = {
      ...createDefaultGame(),
      ...saved
    };
  }

  setupEvents();
  renderEverything();

  showScreen("mainMenu");
});

/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

  bind("resetGame", "click", resetGame);

  /* ROSTER */
  bind("rosterTeam", "change", function () {
    game.rosterTeam = this.value;
    game.roster = [];
    renderRosterPlayers();
    updateRosterCount();
    saveGame(game);
  });

  bind("startRosterSeason", "click", startRosterSeason);

  bind("playRosterMatch", "click", playRosterMatch);

  /* SUPER SQUAD */
  bind("createTeamButton", "click", createSuperTeam);

  bind("bronzePack", "click", function () {
    openPack("bronze");
  });

  bind("goldPack", "click", function () {
    openPack("gold");
  });

  bind("playSuperMatch", "click", playSuperMatch);

  /* BACK BUTTONS */
  bind("backFromRoster", "click", function () {
    openMode("mainMenu");
  });

  bind("backFromSquad", "click", function () {
    openMode("mainMenu");
  });
}

function bind(id, event, callback) {
  const element = document.getElementById(id);

  if (element) {
    element.addEventListener(event, callback);
  }
}

/* =========================================================
   SCREEN SYSTEM
   ========================================================= */

function openMode(mode) {

  if (mode === "rosterMode") {
    openRosterMode();
    return;
  }

  if (mode === "superSquadMode") {
    openSuperSquadMode();
    return;
  }

  showScreen(mode);
}

window.openMode = openMode;

function showScreen(id) {

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
    screen.classList.add("hidden");
    screen.style.display = "none";
  });

  const screen = document.getElementById(id);

  if (!screen) {
    console.error("Screen not found:", id);
    return;
  }

  screen.classList.remove("hidden");
  screen.classList.add("active");
  screen.style.display = "block";
}

/* =========================================================
   MAIN RENDER
   ========================================================= */

function renderEverything() {
  populateRosterTeams();
  renderRosterPlayers();
  renderRosterSeason();
  renderRosterStandings();

  renderSuperSquad();
}

/* =========================================================
   BUILD A ROSTER
   ========================================================= */

/*
   IMPORTANT:
   The HTML already has #rosterTeam.

   We create a league selector automatically so you can choose:

   Premier League
   OR
   LaLiga
*/

function createLeagueSelector() {

  const select = document.getElementById("rosterTeam");

  if (!select) return;

  let leagueSelector =
    document.getElementById("rosterLeague");

  if (leagueSelector) return;

  leagueSelector = document.createElement("select");

  leagueSelector.id = "rosterLeague";
  leagueSelector.className = "main-button";

  leagueSelector.innerHTML = `
    <option value="Premier League">
      Premier League
    </option>

    <option value="LaLiga">
      LaLiga
    </option>
  `;

  select.parentNode.insertBefore(
    leagueSelector,
    select
  );

  leagueSelector.value =
    game.rosterLeague || "Premier League";

  leagueSelector.addEventListener(
    "change",
    function () {

      game.rosterLeague = this.value;

      game.rosterTeam = "";
      game.roster = [];
      game.rosterSeason = null;
      game.rosterStandings = [];

      populateRosterTeams();
      renderRosterPlayers();
      renderRosterSeason();
      renderRosterStandings();

      saveGame(game);
    }
  );
}

/* =========================================================
   OPEN ROSTER
   ========================================================= */

function openRosterMode() {

  game.mode = "roster";

  showScreen("rosterMode");

  createLeagueSelector();

  populateRosterTeams();

  renderRosterPlayers();
  renderRosterSeason();
  renderRosterStandings();

  saveGame(game);
}

/* =========================================================
   POPULATE TEAMS
   ========================================================= */

function populateRosterTeams() {

  const select =
    document.getElementById("rosterTeam");

  if (!select) return;

  const league =
    game.rosterLeague || "Premier League";

  let teams = [];

  if (league === "LaLiga") {

    teams =
      CONFIG.laLigaTeams ||
      [];

  } else {

    teams =
      CONFIG.premierLeagueTeams ||
      [];
  }

  select.innerHTML = `
    <option value="">
      Choose a ${escapeHTML(league)} team
    </option>

    ${teams.map(team => `
      <option value="${escapeHTML(team)}">
        ${escapeHTML(team)}
      </option>
    `).join("")}
  `;

  if (teams.includes(game.rosterTeam)) {
    select.value = game.rosterTeam;
  }
}

/* =========================================================
   GET PLAYERS FOR SELECTED TEAM
   ========================================================= */

function getRosterTeamPlayers(team) {

  let players =
    getPlayersFromTeam(team);

  if (
    players &&
    players.length > 0
  ) {
    return players;
  }

  const league =
    game.rosterLeague === "LaLiga"
      ? "LaLiga"
      : "Premier League";

  players =
    generateClubPlayers(
      team,
      league
    );

  return players || [];
}

/* =========================================================
   RENDER PLAYERS
   ========================================================= */

function renderRosterPlayers() {

  const container =
    document.getElementById("rosterPlayers");

  const teamSelect =
    document.getElementById("rosterTeam");

  if (!container || !teamSelect) {
    return;
  }

  const team =
    teamSelect.value;

  game.rosterTeam = team;

  if (!team) {

    container.innerHTML = `
      <div class="info-box">
        Choose a league and team first.
      </div>
    `;

    updateRosterCount();

    return;
  }

  const players =
    getRosterTeamPlayers(team);

  if (!players.length) {

    container.innerHTML = `
      <div class="info-box">
        No players were found for this team.
      </div>
    `;

    return;
  }

  container.innerHTML =
    players.map(player => {

      const selected =
        game.roster.some(
          selectedPlayer =>
            selectedPlayer.name === player.name
        );

      return `
        <button
          class="player-card ${selected ? "selected" : ""}"
          type="button"
          onclick="selectRosterPlayer('${escapeJS(player.name)}')"
        >

          <strong>
            ${escapeHTML(player.name)}
          </strong>

          <span>
            ${escapeHTML(
              player.position || "Player"
            )}
          </span>

          <span>
            Rating: ${player.rating}
          </span>

        </button>
      `;

    }).join("");

  updateRosterCount();
}

/* =========================================================
   SELECT ROSTER PLAYER
   ========================================================= */

function selectRosterPlayer(playerName) {

  const player =
    findPlayer(playerName);

  if (!player) {
    notify("Player could not be found.");
    return;
  }

  const alreadySelected =
    game.roster.some(
      p => p.name === player.name
    );

  if (alreadySelected) {

    game.roster =
      game.roster.filter(
        p => p.name !== player.name
      );

  } else {

    if (game.roster.length >= 6) {

      notify(
        "You already selected 6 players."
      );

      return;
    }

    game.roster.push(player);
  }

  renderRosterPlayers();
  updateRosterCount();

  saveGame(game);
}

window.selectRosterPlayer =
  selectRosterPlayer;

/* =========================================================
   COUNT
   ========================================================= */

function updateRosterCount() {

  const count =
    document.getElementById("selectedCount");

  if (!count) return;

  count.textContent =
    `${game.roster.length}/6 players selected`;
}

/* =========================================================
   START ROSTER SEASON
   ========================================================= */

function startRosterSeason() {

  if (!game.rosterTeam) {

    notify(
      "Choose a team first."
    );

    return;
  }

  if (game.roster.length !== 6) {

    notify(
      "Choose exactly 6 players."
    );

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

  game.rosterStandings =
    createLeagueStandings();

  renderRosterSeason();

  renderRosterStandings();

  saveGame(game);

  notify(
    `${game.rosterTeam} season started!`
  );
}

/* =========================================================
   CREATE STANDINGS
   ========================================================= */

function createLeagueStandings() {

  let teams = [];

  if (game.rosterLeague === "LaLiga") {

    teams =
      CONFIG.laLigaTeams || [];

  } else {

    teams =
      CONFIG.premierLeagueTeams || [];
  }

  return teams.map(team => ({

    team: team,

    played: 0,

    wins: 0,

    draws: 0,

    losses: 0,

    points: 0

  }));
}

/* =========================================================
   PLAY ROSTER MATCH
   ========================================================= */

function playRosterMatch() {

  if (!game.rosterSeason) {

    notify(
      "Start your season first."
    );

    return;
  }

  if (
    game.rosterSeason.match >= 19
  ) {

    notify(
      "Your season is already complete."
    );

    return;
  }

  let teams =
    game.rosterLeague === "LaLiga"
      ? CONFIG.laLigaTeams || []
      : CONFIG.premierLeagueTeams || [];

  let opponents =
    teams.filter(
      team =>
        team !== game.rosterTeam
    );

  if (!opponents.length) {

    notify(
      "No opponents found."
    );

    return;
  }

  const opponent =
    randomItem(opponents);

  const teamRating =
    Math.round(
      averageRating(game.roster)
    );

  /*
     Roster mode keeps the original style:

     Win  = 100
     Draw = 50
     Loss = 0
  */

  const opponentRating =
    randomNumber(72, 88);

  const result =
    createMatchResult(
      teamRating,
      opponentRating,
      100,
      50
    );

  game.rosterSeason.match++;

  if (result.result === "win") {
    game.rosterSeason.wins++;
  }

  if (result.result === "draw") {
    game.rosterSeason.draws++;
  }

  if (result.result === "loss") {
    game.rosterSeason.losses++;
  }

  game.rosterSeason.points +=
    result.points;

  game.rosterSeason.results.push({

    match:
      game.rosterSeason.match,

    opponent:
      opponent,

    score:
      `${result.teamGoals}-${result.opponentGoals}`,

    result:
      result.result,

    points:
      result.points

  });

  updateRosterStanding();

  showRosterMatchResult(
    opponent,
    result
  );

  renderRosterSeason();

  renderRosterStandings();

  saveGame(game);
}

/* =========================================================
   MATCH ENGINE
   ========================================================= */

function createMatchResult(
  teamRating,
  opponentRating,
  winPoints,
  drawPoints
) {

  const difference =
    teamRating -
    opponentRating;

  let winChance =
    0.50 +
    difference * 0.025;

  winChance =
    Math.max(
      0.15,
      Math.min(
        0.85,
        winChance
      )
    );

  const roll =
    Math.random();

  let result;

  if (
    roll <
    winChance - 0.12
  ) {

    result = "win";

  } else if (
    roll <
    winChance + 0.12
  ) {

    result = "draw";

  } else {

    result = "loss";
  }

  let teamGoals;
  let opponentGoals;

  if (result === "draw") {

    teamGoals =
      randomNumber(0, 3);

    opponentGoals =
      teamGoals;

  } else if (result === "win") {

    teamGoals =
      randomNumber(2, 5);

    opponentGoals =
      randomNumber(
        0,
        Math.max(
          0,
          teamGoals - 1
        )
      );

  } else {

    opponentGoals =
      randomNumber(2, 5);

    teamGoals =
      randomNumber(
        0,
        Math.max(
          0,
          opponentGoals - 1
        )
      );
  }

  let points = 0;

  if (result === "win") {
    points = winPoints;
  }

  if (result === "draw") {
    points = drawPoints;
  }

  return {

    result,

    points,

    teamGoals,

    opponentGoals,

    teamRating,

    opponentRating

  };
}

/* =========================================================
   ROSTER MATCH RESULT
   ========================================================= */

function showRosterMatchResult(
  opponent,
  result
) {

  const title =
    document.getElementById(
      "rosterMatchTitle"
    );

  const display =
    document.getElementById(
      "rosterMatch"
    );

  if (title) {

    title.textContent =
      `Match ${game.rosterSeason.match}`;
  }

  if (!display) return;

  let description;

  if (result.result === "win") {

    description =
      `${game.rosterTeam} beat ${opponent}`;

  } else if (
    result.result === "draw"
  ) {

    description =
      `${game.rosterTeam} drew with ${opponent}`;

  } else {

    description =
      `${game.rosterTeam} lost to ${opponent}`;
  }

  display.innerHTML = `

    <div class="game-card">

      <h2>
        ${escapeHTML(game.rosterTeam)}
        ${result.teamGoals}
        -
        ${result.opponentGoals}
        ${escapeHTML(opponent)}
      </h2>

      <p>
        ${escapeHTML(description)}
      </p>

      <h3>
        ${result.points} points
      </h3>

    </div>

  `;
}

/* =========================================================
   UPDATE STANDING
   ========================================================= */

function updateRosterStanding() {

  const standing =
    game.rosterStandings.find(
      s =>
        s.team ===
        game.rosterTeam
    );

  if (!standing) return;

  const season =
    game.rosterSeason;

  standing.played =
    season.match;

  standing.wins =
    season.wins;

  standing.draws =
    season.draws;

  standing.losses =
    season.losses;

  standing.points =
    season.points;

  game.rosterStandings.sort(
    (a, b) =>
      b.points - a.points
  );
}

/* =========================================================
   ROSTER SEASON DISPLAY
   ========================================================= */

function renderRosterSeason() {

  const container =
    document.getElementById(
      "rosterSeason"
    );

  if (!container) return;

  if (!game.rosterSeason) {

    container.innerHTML = `
      <div class="info-box">
        Choose 6 players and start your season.
      </div>
    `;

    return;
  }

  const season =
    game.rosterSeason;

  container.innerHTML = `

    <div class="stats-grid">

      <div>
        <strong>Match</strong>
        <span>
          ${season.match}/19
        </span>
      </div>

      <div>
        <strong>Points</strong>
        <span>
          ${season.points}
        </span>
      </div>

      <div>
        <strong>Wins</strong>
        <span>
          ${season.wins}
        </span>
      </div>

      <div>
        <strong>Draws</strong>
        <span>
          ${season.draws}
        </span>
      </div>

      <div>
        <strong>Losses</strong>
        <span>
          ${season.losses}
        </span>
      </div>

    </div>

  `;

  const results =
    document.getElementById(
      "rosterResults"
    );

  if (
    season.match >= 19 &&
    results
  ) {

    results.innerHTML = `

      <div class="info-box">

        <h2>
          Season Complete!
        </h2>

        <p>
          ${season.wins} wins
        </p>

        <p>
          ${season.draws} draws
        </p>

        <p>
          ${season.losses} losses
        </p>

        <h3>
          ${season.points} points
        </h3>

      </div>

    `;
  }
}

/* =========================================================
   STANDINGS DISPLAY
   ========================================================= */

function renderRosterStandings() {

  const body =
    document.getElementById(
      "standingsBody"
    );

  if (!body) return;

  if (
    !game.rosterStandings ||
    !game.rosterStandings.length
  ) {

    game.rosterStandings =
      createLeagueStandings();
  }

  const standings =
    [...game.rosterStandings].sort(
      (a, b) =>
        b.points - a.points
    );

  body.innerHTML =
    standings.map(
      (team, index) => `

        <tr>

          <td>
            ${index + 1}
          </td>

          <td>
            ${escapeHTML(team.team)}
          </td>

          <td>
            ${team.played}
          </td>

          <td>
            ${team.wins}
          </td>

          <td>
            ${team.draws}
          </td>

          <td>
            ${team.losses}
          </td>

          <td>
            <strong>
              ${team.points}
            </strong>
          </td>

        </tr>

      `
    ).join("");
}

/* =========================================================
   SUPER SQUAD
   ========================================================= */

function openSuperSquadMode() {

  game.mode =
    "superSquad";

  showScreen(
    "superSquadMode"
  );

  renderSuperSquad();

  saveGame(game);
}

function createSuperTeam() {

  const input =
    document.getElementById(
      "teamName"
    );

  if (!input) return;

  const name =
    input.value.trim();

  if (!name) {

    notify(
      "Enter a team name."
    );

    return;
  }

  const cleaned =
    cleanTeamName(name);

  if (!cleaned) {

    notify(
      "Please choose another team name."
    );

    return;
  }

  game.squadName =
    cleaned;

  game.points = 100;

  game.wins = 0;
  game.draws = 0;
  game.losses = 0;

  game.collection = [];
  game.lineup = [];

  game.superDifficulty =
    "easy";

  game.squadSeason = {
    match: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
    results: []
  };

  renderSuperSquad();

  saveGame(game);

  notify(
    `Welcome to ${game.squadName}!`
  );
}

/* =========================================================
   SUPER SQUAD RENDER
   ========================================================= */

function renderSuperSquad() {

  const createBox =
    document.getElementById(
      "createTeamBox"
    );

  const superGame =
    document.getElementById(
      "superGame"
    );

  if (!game.squadName) {

    if (createBox) {
      createBox.style.display =
        "block";
    }

    if (superGame) {
      superGame.style.display =
        "none";
    }

    return;
  }

  if (createBox) {
    createBox.style.display =
      "none";
  }

  if (superGame) {
    superGame.style.display =
      "block";
  }

  const name =
    document.getElementById(
      "superTeamName"
    );

  if (name) {
    name.textContent =
      game.squadName;
  }

  renderSuperStats();
  renderDifficulty();
  renderPacks();
  renderCollection();
  renderLineup();
  renderSuperSeason();
}

/* =========================================================
   SUPER STATS
   ========================================================= */

function renderSuperStats() {

  const points =
    document.getElementById(
      "superPoints"
    );

  const wins =
    document.getElementById(
      "superWins"
    );

  const draws =
    document.getElementById(
      "superDraws"
    );

  const losses =
    document.getElementById(
      "superLosses"
    );

  if (points) {
    points.textContent =
      formatNumber(game.points);
  }

  if (wins) {
    wins.textContent =
      game.wins;
  }

  if (draws) {
    draws.textContent =
      game.draws;
  }

  if (losses) {
    losses.textContent =
      game.losses;
  }
}

/* =========================================================
   EASY / HARD
   ========================================================= */

function getDifficulty() {

  if (
    game.superDifficulty ===
    "hard"
  ) {

    return {
      name: "Hard Mode",
      min: 82,
      max: 95,
      win: 200,
      draw: 100
    };
  }

  return {
    name: "Easy Mode",
    min: 72,
    max: 84,
    win: 100,
    draw: 50
  };
}

function renderDifficulty() {

  const superGame =
    document.getElementById(
      "superGame"
    );

  if (!superGame) return;

  let box =
    document.getElementById(
      "difficultyBox"
    );

  if (!box) {

    box =
      document.createElement(
        "div"
      );

    box.id =
      "difficultyBox";

    box.className =
      "info-box";

    superGame.prepend(box);
  }

  const difficulty =
    getDifficulty();

  box.innerHTML = `

    <h3>
      ${difficulty.name}
    </h3>

    <p>
      Opponent rating:
      ${difficulty.min}-${difficulty.max}
    </p>

    <p>
      Win: ${difficulty.win}
      |
      Draw: ${difficulty.draw}
      |
      Loss: 0
    </p>

    <button
      type="button"
      class="main-button"
      id="difficultyToggle"
    >
      Switch to
      ${
        game.superDifficulty === "easy"
          ? "Hard"
          : "Easy"
      }
    </button>

  `;

  document
    .getElementById(
      "difficultyToggle"
    )
    .onclick =
    toggleDifficulty;
}

function toggleDifficulty() {

  if (
    game.superDifficulty ===
    "easy"
  ) {

    game.superDifficulty =
      "hard";

    notify(
      "Hard Mode enabled!"
    );

  } else {

    game.superDifficulty =
      "easy";

    notify(
      "Easy Mode enabled. Rewards are 100/50/0."
    );
  }

  renderSuperSquad();

  saveGame(game);
}

/* =========================================================
   PACKS
   ========================================================= */

function renderPacks() {

  const bronze =
    document.getElementById(
      "bronzePack"
    );

  const gold =
    document.getElementById(
      "goldPack"
    );

  if (bronze) {
    bronze.disabled =
      game.points < 50;
  }

  if (gold) {
    gold.disabled =
      game.points < 100;
  }

  createIconPackButton();
}

function createIconPackButton() {

  if (
    document.getElementById(
      "iconPack"
    )
  ) {
    return;
  }

  const bronze =
    document.getElementById(
      "bronzePack"
    );

  const gold =
    document.getElementById(
      "goldPack"
    );

  if (!bronze && !gold) {
    return;
  }

  const parent =
    bronze?.parentElement ||
    gold?.parentElement;

  if (!parent) return;

  const button =
    document.createElement(
      "button"
    );

  button.id =
    "iconPack";

  button.type =
    "button";

  button.className =
    "pack";

  button.innerHTML = `

    <strong>
      Icon Pack
    </strong>

    <span>
      1,000 points
    </span>

    <small>
      1 guaranteed Icon
    </small>

  `;

  button.onclick =
    function () {
      openPack("icon");
    };

  parent.appendChild(
    button
  );
}

/* =========================================================
   PACK PLAYER
   ========================================================= */

function getCustomPackPlayer(
  packType
) {

  const players =
    CONFIG.players || [];

  const icons =
    players.filter(
      player =>
        player.rarity === "Icon"
    );

  if (
    packType === "icon"
  ) {

    return randomItem(
      icons
    );
  }

  let roll =
    Math.random();

  let iconChance;
  let rareChance;

  if (
    packType === "bronze"
  ) {

    iconChance =
      0.04;

    rareChance =
      0.20;

  } else {

    iconChance =
      0.10;

    rareChance =
      0.30;
  }

  if (
    roll < iconChance &&
    icons.length
  ) {

    return randomItem(
      icons
    );
  }

  const normal =
    players.filter(
      player =>
        player.rarity !== "Icon"
    );

  roll =
    Math.random();

  if (
    roll < rareChance
  ) {

    const rare =
      normal.filter(
        player =>
          player.rarity ===
            "Rare" ||
          player.rarity ===
            "rare"
      );

    if (rare.length) {
      return randomItem(
        rare
      );
    }
  }

  return randomItem(
    normal
  );
}

/* =========================================================
   OPEN PACK
   ========================================================= */

function openPack(
  packType
) {

  const costs = {
    bronze: 50,
    gold: 100,
    icon: 1000
  };

  const amounts = {
    bronze: 5,
    gold: 5,
    icon: 1
  };

  const cost =
    costs[packType];

  if (
    game.points < cost
  ) {

    notify(
      `You need ${cost} points.`
    );

    return;
  }

  game.points -=
    cost;

  const pulled = [];

  for (
    let i = 0;
    i < amounts[packType];
    i++
  ) {

    const player =
      getCustomPackPlayer(
        packType
      );

    if (!player) continue;

    const card = {
      ...player,
      id: createID(),
      rarity:
        player.rarity ||
        "Common"
    };

    game.collection.push(
      card
    );

    pulled.push(
      card
    );
  }

  showPackResults(
    pulled
  );

  renderSuperSquad();

  saveGame(game);
}

/* =========================================================
   PACK RESULTS
   ========================================================= */

function showPackResults(
  players
) {

  const container =
    document.getElementById(
      "packResults"
    );

  if (!container) return;

  container.innerHTML = `

    <div class="collection-grid">

      ${players.map(
        player => `

          <div
            class="card ${rarityClass(
              player.rarity
            )}"
          >

            <strong>
              ${escapeHTML(
                player.name
              )}
            </strong>

            <span>
              ${escapeHTML(
                player.position ||
                "Player"
              )}
            </span>

            <span>
              Rating:
              ${player.rating}
            </span>

            <small>
              ${escapeHTML(
                player.rarity ||
                "Common"
              )}
            </small>

          </div>

        `
      ).join("")}

    </div>

  `;
}

/* =========================================================
   COLLECTION
   ========================================================= */

function renderCollection() {

  const container =
    document.getElementById(
      "collection"
    );

  if (!container) return;

  if (
    !game.collection.length
  ) {

    container.innerHTML =
      "<p>Your collection is empty. Open a pack!</p>";

    return;
  }

  container.innerHTML =
    game.collection.map(
      (player, index) => {

        const selected =
          game.lineup.some(
            p =>
              p.id ===
              player.id
          );

        return `

          <div
            class="card ${rarityClass(
              player.rarity
            )}"
          >

            <strong>
              ${escapeHTML(
                player.name
              )}
            </strong>

            <span>
              ${escapeHTML(
                player.position ||
                "Player"
              )}
            </span>

            <span>
              Rating:
              ${player.rating}
            </span>

            <small>
              ${escapeHTML(
                player.rarity ||
                "Common"
              )}
            </small>

            <button
              type="button"
              class="main-button"
              onclick="addToLineup(${index})"
              ${
                selected ||
                game.lineup.length >= 11
                  ? "disabled"
                  : ""
              }
            >
              ${
                selected
                  ? "In Lineup"
                  : "Add to Lineup"
              }
            </button>

          </div>

        `;
      }
    ).join("");
}

function addToLineup(
  index
) {

  if (
    game.lineup.length >= 11
  ) {

    notify(
      "Your lineup already has 11 players."
    );

    return;
  }

  const player =
    game.collection[index];

  if (!player) return;

  if (
    game.lineup.some(
      p =>
        p.id === player.id
    )
  ) {
    return;
  }

  game.lineup.push(
    player
  );

  renderSuperSquad();

  saveGame(game);
}

window.addToLineup =
  addToLineup;

/* =========================================================
   REMOVE LINEUP
   ========================================================= */

function removeFromLineup(
  index
) {

  game.lineup.splice(
    index,
    1
  );

  renderSuperSquad();

  saveGame(game);
}

window.removeFromLineup =
  removeFromLineup;

/* =========================================================
   LINEUP
   ========================================================= */

function renderLineup() {

  const container =
    document.getElementById(
      "superLineup"
    );

  const count =
    document.getElementById(
      "lineupCount"
    );

  if (count) {

    count.textContent =
      `${game.lineup.length}/11`;
  }

  if (!container) return;

  if (
    !game.lineup.length
  ) {

    container.innerHTML =
      "<p>Add players from your collection.</p>";

    return;
  }

  container.innerHTML =
    game.lineup.map(
      (player, index) => `

        <div class="lineup-slot">

          <strong>
            ${escapeHTML(
              player.name
            )}
          </strong>

          <span>
            ${escapeHTML(
              player.position ||
              "Player"
            )}
          </span>

          <span>
            ${player.rating}
          </span>

          <button
            type="button"
            class="main-button"
            onclick="removeFromLineup(${index})"
          >
            Remove
          </button>

        </div>

      `
    ).join("");
}

/* =========================================================
   SUPER SQUAD MATCH
   ========================================================= */

function playSuperMatch() {

  if (!game.squadName) {

    notify(
      "Create your Super Squad first."
    );

    return;
  }

  if (
    game.lineup.length !== 11
  ) {

    notify(
      "You need exactly 11 players."
    );

    return;
  }

  const difficulty =
    getDifficulty();

  const opponents = [
    ...(CONFIG.premierLeagueTeams || []),
    ...(CONFIG.laLigaTeams || [])
  ];

  const opponent =
    randomItem(
      opponents
    );

  const teamRating =
    calculateSquadRating(
      game.lineup
    );

  const opponentRating =
    randomNumber(
      difficulty.min,
      difficulty.max
    );

  const result =
    createMatchResult(
      teamRating,
      opponentRating,
      difficulty.win,
      difficulty.draw
    );

  game.points +=
    result.points;

  if (
    result.result === "win"
  ) {
    game.wins++;
  }

  if (
    result.result === "draw"
  ) {
    game.draws++;
  }

  if (
    result.result === "loss"
  ) {
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

  game.squadSeason.points +=
    result.points;

  if (
    result.result === "win"
  ) {
    game.squadSeason.wins++;
  }

  if (
    result.result === "draw"
  ) {
    game.squadSeason.draws++;
  }

  if (
    result.result === "loss"
  ) {
    game.squadSeason.losses++;
  }

  game.squadSeason.results.push({

    match:
      game.squadSeason.match,

    opponent,

    score:
      `${result.teamGoals}-${result.opponentGoals}`,

    result:
      result.result,

    points:
      result.points

  });

  showSuperMatchResult(
    opponent,
    result
  );

  renderSuperSquad();

  saveGame(game);
}

/* =========================================================
   SUPER MATCH RESULT
   ========================================================= */

function showSuperMatchResult(
  opponent,
  result
) {

  const container =
    document.getElementById(
      "superResults"
    );

  if (!container) return;

  let text;

  if (
    result.result === "win"
  ) {

    text =
      `${game.squadName} beat ${opponent}`;

  } else if (
    result.result === "draw"
  ) {

    text =
      `${game.squadName} drew with ${opponent}`;

  } else {

    text =
      `${game.squadName} lost to ${opponent}`;
  }

  container.innerHTML = `

    <div class="info-box">

      <h2>
        ${escapeHTML(
          game.squadName
        )}

        ${result.teamGoals}
        -
        ${result.opponentGoals}

        ${escapeHTML(
          opponent
        )}
      </h2>

      <p>
        ${escapeHTML(text)}
      </p>

      <h3>
        +${result.points} points
      </h3>

    </div>

  `;
}

/* =========================================================
   SUPER SEASON
   ========================================================= */

function renderSuperSeason() {

  const info =
    document.getElementById(
      "superSeasonInfo"
    );

  if (!info) return;

  if (!game.squadSeason) {

    info.innerHTML =
      "<p>Your season has not started yet.</p>";

    return;
  }

  const season =
    game.squadSeason;

  info.innerHTML = `

    <div class="stats-grid">

      <div>
        <strong>Matches</strong>
        <span>
          ${season.match}/19
        </span>
      </div>

      <div>
        <strong>Points</strong>
        <span>
          ${season.points}
        </span>
      </div>

      <div>
        <strong>Wins</strong>
        <span>
          ${season.wins}
        </span>
      </div>

      <div>
        <strong>Draws</strong>
        <span>
          ${season.draws}
        </span>
      </div>

      <div>
        <strong>Losses</strong>
        <span>
          ${season.losses}
        </span>
      </div>

    </div>

  `;
}

/* =========================================================
   RESET
   ========================================================= */

function resetGame() {

  if (
    !confirm(
      "Are you sure you want to reset your entire game?"
    )
  ) {
    return;
  }

  game =
    createDefaultGame();

  deleteSave();

  const teamName =
    document.getElementById(
      "teamName"
    );

  if (teamName) {
    teamName.value = "";
  }

  renderEverything();

  showScreen(
    "mainMenu"
  );

  notify(
    "Game reset."
  );
}

/* =========================================================
   NOTIFICATION
   ========================================================= */

function notify(message) {

  const notification =
    document.getElementById(
      "notification"
    );

  if (!notification) {

    alert(message);

    return;
  }

  notification.textContent =
    message;

  notification.style.display =
    "block";

  clearTimeout(
    window.slsNotificationTimer
  );

  window.slsNotificationTimer =
    setTimeout(
      function () {

        notification.style.display =
          "none";

      },
      3000
    );
}

/* =========================================================
   SAFE JAVASCRIPT STRING
   ========================================================= */

function escapeJS(text) {

  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}
