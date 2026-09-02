/* =========================================================
   SUPER LEAGUE SOCCER
   Main Game JavaScript
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
    points: CONFIG.startingPoints,
    wins: 0,
    draws: 0,
    losses: 0,
    collection: [],
    lineup: [],
    squadSeason: null
  };
}

/* =========================================================
   STARTUP
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  loadSavedGame();
  setupEventListeners();
  renderAll();
});

function loadSavedGame() {
  const saved = loadGame();

  if (!saved) {
    game = createDefaultGame();
    return;
  }

  game = {
    ...createDefaultGame(),
    ...saved
  };

  game.roster = Array.isArray(saved.roster) ? saved.roster : [];
  game.collection = Array.isArray(saved.collection)
    ? saved.collection
    : [];
  game.lineup = Array.isArray(saved.lineup)
    ? saved.lineup
    : [];
  game.rosterStandings = Array.isArray(saved.rosterStandings)
    ? saved.rosterStandings
    : [];

  /*
    Older versions used "My Super Squad" automatically.
    Treat that as an uncreated team so the player can choose
    their own team name.
  */
  if (game.squadName === "My Super Squad") {
    game.squadName = "";
  }
}

function setupEventListeners() {
  bind("resetGame", "click", resetGame);

  bind("rosterTeam", "change", function () {
    game.rosterTeam = this.value;
    game.roster = [];
    renderRosterPlayers();
    saveGame(game);
  });

  bind("startRosterSeason", "click", startRosterSeason);

  /*
    IMPORTANT:
    This is the button that automatically simulates the match.
  */
  bind("playRosterMatch", "click", playRosterMatch);

  bind("createTeamButton", "click", createSuperTeam);

  bind("bronzePack", "click", function () {
    openPack("bronze");
  });

  bind("goldPack", "click", function () {
    openPack("gold");
  });

  bind("playSuperMatch", "click", playSuperMatch);
}

function bind(id, event, functionToRun) {
  const element = document.getElementById(id);

  if (element) {
    element.addEventListener(event, functionToRun);
  }
}

/* =========================================================
   SCREEN NAVIGATION
   ========================================================= */

function openMode(screenId) {
  const screens = document.querySelectorAll(".screen");

  screens.forEach(function (screen) {
    screen.classList.remove("active");
    screen.style.display = "none";
  });

  const screen = document.getElementById(screenId);

  if (!screen) {
    return;
  }

  screen.classList.add("active");
  screen.style.display = "block";

  if (screenId === "rosterMode") {
    game.mode = "roster";

    populateRosterTeams();
    renderRosterPlayers();
    renderRosterSeason();
    renderRosterStandings();
  }

  if (screenId === "superSquadMode") {
    game.mode = "superSquad";
    renderSuperSquad();
  }

  saveGame(game);
}

/*
  index.html uses onclick="openMode(...)",
  so it must be available globally.
*/
window.openMode = openMode;
window.resetGame = resetGame;

/* =========================================================
   MAIN RENDER
   ========================================================= */

function renderAll() {
  showMainMenu();

  populateRosterTeams();
  renderRosterPlayers();
  renderRosterSeason();
  renderRosterStandings();

  renderSuperSquad();
}

function showMainMenu() {
  const screens = document.querySelectorAll(".screen");

  screens.forEach(function (screen) {
    screen.classList.remove("active");
    screen.style.display = "none";
  });

  const mainMenu = document.getElementById("mainMenu");

  if (mainMenu) {
    mainMenu.classList.add("active");
    mainMenu.style.display = "block";
  }
}

/* =========================================================
   BUILD A ROSTER
   ========================================================= */

function populateRosterTeams() {
  const select = document.getElementById("rosterTeam");

  if (!select) {
    return;
  }

  const currentValue = game.rosterTeam || select.value;

  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a Premier League team";
  select.appendChild(placeholder);

  CONFIG.premierLeagueTeams.forEach(function (team) {
    const option = document.createElement("option");

    option.value = team;
    option.textContent = team;

    select.appendChild(option);
  });

  if (
    currentValue &&
    CONFIG.premierLeagueTeams.includes(currentValue)
  ) {
    select.value = currentValue;
  }
}

function renderRosterPlayers() {
  const container = document.getElementById("rosterPlayers");
  const countElement = document.getElementById("selectedCount");
  const startButton = document.getElementById("startRosterSeason");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const team = game.rosterTeam;

  if (!team) {
    if (countElement) {
      countElement.textContent = "0";
    }

    if (startButton) {
      startButton.disabled = true;
    }

    container.innerHTML =
      "<p>Choose a Premier League team first.</p>";

    return;
  }

  const players = getCompleteTeam(team, CONFIG.leagues.premierLeague);

  players.forEach(function (player) {
    const card = document.createElement("div");

    card.className = "player-card";

    const selected = game.roster.some(function (p) {
      return p.name === player.name;
    });

    if (selected) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <div class="player-name">
        ${escapeHTML(player.name)}
      </div>

      <div class="player-position">
        ${escapeHTML(player.position || "Player")}
      </div>

      <div class="player-rating">
        ${player.rating}
      </div>
    `;

    card.addEventListener("click", function () {
      toggleRosterPlayer(player);
    });

    container.appendChild(card);
  });

  if (countElement) {
    countElement.textContent = game.roster.length;
  }

  if (startButton) {
    startButton.disabled =
      game.roster.length !== CONFIG.rosterSize;
  }
}

function toggleRosterPlayer(player) {
  const index = game.roster.findIndex(function (p) {
    return p.name === player.name;
  });

  if (index !== -1) {
    game.roster.splice(index, 1);
  } else {
    if (game.roster.length >= CONFIG.rosterSize) {
      notify("You can only select 6 players.");
      return;
    }

    game.roster.push(player);
  }

  saveGame(game);
  renderRosterPlayers();
}

function startRosterSeason() {
  if (game.roster.length !== CONFIG.rosterSize) {
    notify("Choose exactly 6 players first.");
    return;
  }

  game.rosterSeason = {
    match: 0,
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    results: []
  };

  createRosterStandings();

  saveGame(game);

  renderRosterSeason();
  renderRosterStandings();

  notify("Your season has started!");
}

/* =========================================================
   ROSTER MATCH SIMULATION
   ========================================================= */

function playRosterMatch() {
  if (!game.rosterSeason) {
    notify("Start your season first.");
    return;
  }

  if (game.rosterSeason.match >= CONFIG.seasonMatches) {
    notify("Your season is already finished.");
    return;
  }

  const myTeam = game.rosterTeam;

  const opponents = CONFIG.premierLeagueTeams.filter(
    function (team) {
      return team !== myTeam;
    }
  );

  const opponent =
    opponents[game.rosterSeason.match % opponents.length];

  const myRating = averageRating(game.roster);

  const opponentPlayers = getCompleteTeam(
    opponent,
    CONFIG.leagues.premierLeague
  );

  const opponentRating = averageRating(opponentPlayers);

  const result = simulateMatch(
    myRating,
    opponentRating
  );

  /*
    Generate a believable score.
  */
  const score = generateScore(
    result.result,
    myRating,
    opponentRating
  );

  game.rosterSeason.match += 1;
  game.rosterSeason.points += result.points;

  if (result.result === "win") {
    game.rosterSeason.wins += 1;
  }

  if (result.result === "draw") {
    game.rosterSeason.draws += 1;
  }

  if (result.result === "loss") {
    game.rosterSeason.losses += 1;
  }

  game.rosterSeason.results.push({
    match: game.rosterSeason.match,
    opponent: opponent,
    result: result.result,
    points: result.points,
    myScore: score.myScore,
    opponentScore: score.opponentScore
  });

  updateRosterStandings(
    myTeam,
    opponent,
    result.result,
    result.points
  );

  saveGame(game);

  /*
    Automatically display the result.
  */
  showRosterMatchResult(
    myTeam,
    opponent,
    score.myScore,
    score.opponentScore,
    result.result,
    result.points
  );

  renderRosterSeason();
  renderRosterStandings();

  if (
    game.rosterSeason.match ===
    CONFIG.seasonMatches
  ) {
    notify("Season complete!");
  }
}

function generateScore(result, myRating, opponentRating) {
  let myScore;
  let opponentScore;

  if (result === "draw") {
    const drawScores = [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3]
    ];

    const score =
      randomItem(drawScores);

    return {
      myScore: score[0],
      opponentScore: score[1]
    };
  }

  if (result === "win") {
    myScore = randomNumber(1, 5);
    opponentScore = randomNumber(0, myScore - 1);

    return {
      myScore: myScore,
      opponentScore: opponentScore
    };
  }

  opponentScore = randomNumber(1, 5);
  myScore = randomNumber(0, opponentScore - 1);

  return {
    myScore: myScore,
    opponentScore: opponentScore
  };
}

function showRosterMatchResult(
  myTeam,
  opponent,
  myScore,
  opponentScore,
  result,
  points
) {
  const title = document.getElementById(
    "rosterMatchTitle"
  );

  const matchBox = document.getElementById(
    "rosterMatch"
  );

  if (!matchBox) {
    return;
  }

  let resultWord = "DREW";

  if (result === "win") {
    resultWord = "BEAT";
  }

  if (result === "loss") {
    resultWord = "LOST TO";
  }

  if (title) {
    title.textContent =
      `Match ${game.rosterSeason.match} Result`;
  }

  matchBox.innerHTML = `
    <div class="match-result">
      <h2>
        ${escapeHTML(myTeam)}
        ${resultWord}
        ${escapeHTML(opponent)}
      </h2>

      <div class="score">
        ${myScore} - ${opponentScore}
      </div>

      <div class="points-earned">
        ${resultText(result)}
        — +${points} points
      </div>
    </div>
  `;

  matchBox.style.display = "block";
}

/* =========================================================
   ROSTER SEASON DISPLAY
   ========================================================= */

function renderRosterSeason() {
  const seasonBox =
    document.getElementById("rosterSeason");

  const title =
    document.getElementById("rosterMatchTitle");

  const matchBox =
    document.getElementById("rosterMatch");

  const playButton =
    document.getElementById("playRosterMatch");

  const resultsBox =
    document.getElementById("rosterResults");

  if (!seasonBox) {
    return;
  }

  if (!game.rosterSeason) {
    seasonBox.style.display = "none";

    if (matchBox) {
      matchBox.innerHTML = "";
    }

    if (resultsBox) {
      resultsBox.innerHTML = "";
    }

    return;
  }

  seasonBox.style.display = "block";

  const matchNumber =
    game.rosterSeason.match + 1;

  if (
    game.rosterSeason.match >=
    CONFIG.seasonMatches
  ) {
    if (title) {
      title.textContent = "Season Complete!";
    }

    if (playButton) {
      playButton.disabled = true;
      playButton.textContent = "Season Complete";
    }
  } else {
    if (title) {
      title.textContent =
        `Match ${matchNumber} of ${CONFIG.seasonMatches}`;
    }

    if (playButton) {
      playButton.disabled = false;
      playButton.textContent = "Start Match";
    }
  }

  if (resultsBox) {
    if (game.rosterSeason.results.length === 0) {
      resultsBox.innerHTML =
        "<p>No matches played yet.</p>";
    } else {
      resultsBox.innerHTML = `
        <h3>Season Results</h3>

        ${game.rosterSeason.results
          .map(function (match) {
            return `
              <div class="result-row">
                <strong>
                  ${escapeHTML(game.rosterTeam)}
                  ${match.myScore}-${match.opponentScore}
                  ${escapeHTML(match.opponent)}
                </strong>

                <span>
                  ${resultText(match.result)}
                  +${match.points} pts
                </span>
              </div>
            `;
          })
          .join("")}
      `;
    }
  }
}

/* =========================================================
   ROSTER STANDINGS
   ========================================================= */

function createRosterStandings() {
  game.rosterStandings =
    CONFIG.premierLeagueTeams.map(function (team) {
      return {
        team: team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0
      };
    });
}

function findStanding(teamName) {
  return game.rosterStandings.find(
    function (team) {
      return team.team === teamName;
    }
  );
}

function updateRosterStandings(
  myTeam,
  opponent,
  result,
  points
) {
  if (!game.rosterStandings.length) {
    createRosterStandings();
  }

  const myStanding = findStanding(myTeam);
  const opponentStanding = findStanding(opponent);

  if (!myStanding || !opponentStanding) {
    return;
  }

  myStanding.played += 1;
  opponentStanding.played += 1;

  myStanding.points += points;

  if (result === "win") {
    myStanding.wins += 1;
    opponentStanding.losses += 1;
  }

  if (result === "draw") {
    myStanding.draws += 1;
    opponentStanding.draws += 1;

    /*
      Draws are worth 50 points in this game.
    */
    opponentStanding.points +=
      CONFIG.matchPoints.draw;
  }

  if (result === "loss") {
    myStanding.losses += 1;
    opponentStanding.wins += 1;

    opponentStanding.points +=
      CONFIG.matchPoints.win;
  }
}

function renderRosterStandings() {
  const body =
    document.getElementById("standingsBody");

  if (!body) {
    return;
  }

  if (!game.rosterStandings.length) {
    body.innerHTML =
      "<tr><td colspan='7'>Start a season to see the standings.</td></tr>";

    return;
  }

  const sorted =
    [...game.rosterStandings].sort(function (a, b) {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      return b.wins - a.wins;
    });

  body.innerHTML = sorted
    .map(function (team, index) {
      const isUser =
        team.team === game.rosterTeam;

      return `
        <tr ${isUser ? 'class="user-team"' : ""}>
          <td>${index + 1}</td>
          <td>${escapeHTML(team.team)}</td>
          <td>${team.played}</td>
          <td>${team.wins}</td>
          <td>${team.draws}</td>
          <td>${team.losses}</td>
          <td><strong>${team.points}</strong></td>
        </tr>
      `;
    })
    .join("");
}

/* =========================================================
   SUPER SQUAD
   ========================================================= */

function createSuperTeam() {
  const input =
    document.getElementById("teamName");

  if (!input) {
    return;
  }

  const rawName =
    input.value.trim();

  if (!rawName) {
    notify("Enter a team name first.");
    return;
  }

  /*
    Family-friendly profanity filter from utils.js
  */
  game.squadName =
    cleanTeamName(rawName);

  game.points =
    CONFIG.startingPoints;

  game.wins = 0;
  game.draws = 0;
  game.losses = 0;

  game.collection = [];
  game.lineup = [];
  game.squadSeason = null;

  saveGame(game);

  renderSuperSquad();

  notify(
    `Welcome to Super Squad, ${game.squadName}!`
  );
}

function renderSuperSquad() {
  const createBox =
    document.getElementById("createTeamBox");

  const gameBox =
    document.getElementById("superGame");

  if (!game.squadName) {
    if (createBox) {
      createBox.style.display = "block";
    }

    if (gameBox) {
      gameBox.style.display = "none";
    }

    return;
  }

  if (createBox) {
    createBox.style.display = "none";
  }

  if (gameBox) {
    gameBox.style.display = "block";
  }

  const teamName =
    document.getElementById("superTeamName");

  if (teamName) {
    teamName.textContent =
      game.squadName;
  }

  renderSuperStats();
  renderPacks();
  renderCollection();
  renderLineup();
  renderSuperSeason();
}

/* =========================================================
   SUPER SQUAD STATS
   ========================================================= */

function renderSuperStats() {
  const points =
    document.getElementById("superPoints");

  const wins =
    document.getElementById("superWins");

  const draws =
    document.getElementById("superDraws");

  const losses =
    document.getElementById("superLosses");

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
   PACKS
   ========================================================= */

function renderPacks() {
  const bronze =
    document.getElementById("bronzePack");

  const gold =
    document.getElementById("goldPack");

  if (bronze) {
    bronze.disabled =
      game.points < CONFIG.packs.bronze.cost;
  }

  if (gold) {
    gold.disabled =
      game.points < CONFIG.packs.gold.cost;
  }
}

function openPack(packType) {
  if (!game.squadName) {
    notify("Create your team first.");
    return;
  }

  const pack =
    CONFIG.packs[packType];

  if (!pack) {
    return;
  }

  if (game.points < pack.cost) {
    notify(
      `You need ${pack.cost} points for this pack.`
    );

    return;
  }

  game.points -= pack.cost;

  const newCards = [];

  for (let i = 0; i < pack.cards; i++) {
    const player =
      getPackPlayer(packType);

    if (!player) {
      continue;
    }

    const card = {
      ...player,
      id: createID(),
      rarity:
        player.rarity || "Common"
    };

    game.collection.push(card);
    newCards.push(card);
  }

  saveGame(game);

  renderSuperSquad();

  showPackResults(
    pack.name,
    newCards
  );
}

function showPackResults(
  packName,
  cards
) {
  const results =
    document.getElementById("packResults");

  if (!results) {
    return;
  }

  results.innerHTML = `
    <div class="pack-opening">
      <h3>${escapeHTML(packName)}</h3>

      <div class="collection-grid">
        ${cards
          .map(function (card) {
            return `
              <div class="card ${rarityClass(card.rarity)}">
                <strong>
                  ${escapeHTML(card.name)}
                </strong>

                <div>
                  ${escapeHTML(card.position || "Player")}
                </div>

                <div>
                  Rating: ${card.rating}
                </div>

                <div>
                  ${escapeHTML(card.rarity || "Common")}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

/* =========================================================
   COLLECTION
   ========================================================= */

function renderCollection() {
  const container =
    document.getElementById("collection");

  if (!container) {
    return;
  }

  if (game.collection.length === 0) {
    container.innerHTML =
      "<p>Open a pack to collect players.</p>";

    return;
  }

  container.innerHTML = `
    <h3>Your Collection</h3>

    <div class="collection-grid">
      ${game.collection
        .map(function (player) {
          const alreadyInLineup =
            game.lineup.some(function (p) {
              return p.id === player.id;
            });

          return `
            <div
              class="card ${rarityClass(player.rarity)}"
              data-player-id="${player.id}"
              style="${
                alreadyInLineup
                  ? "opacity:0.5;"
                  : ""
              }"
            >
              <strong>
                ${escapeHTML(player.name)}
              </strong>

              <div>
                ${escapeHTML(
                  player.position || "Player"
                )}
              </div>

              <div>
                Rating: ${player.rating}
              </div>

              <div>
                ${escapeHTML(
                  player.rarity || "Common"
                )}
              </div>

              ${
                alreadyInLineup
                  ? "<small>In lineup</small>"
                  : "<small>Click to add</small>"
              }
            </div>
          `;
        })
        .join("")}
    </div>
  `;

  container
    .querySelectorAll("[data-player-id]")
    .forEach(function (card) {
      card.addEventListener(
        "click",
        function () {
          const id =
            card.getAttribute(
              "data-player-id"
            );

          addToLineup(id);
        }
      );
    });
}

function addToLineup(playerId) {
  if (game.lineup.length >= CONFIG.superSquadSize) {
    notify(
      `Your lineup already has ${CONFIG.superSquadSize} players.`
    );

    return;
  }

  const player =
    game.collection.find(function (p) {
      return String(p.id) === String(playerId);
    });

  if (!player) {
    return;
  }

  const exists =
    game.lineup.some(function (p) {
      return p.id === player.id;
    });

  if (exists) {
    return;
  }

  game.lineup.push(player);

  saveGame(game);

  renderCollection();
  renderLineup();
}

/* =========================================================
   LINEUP
   ========================================================= */

function renderLineup() {
  const container =
    document.getElementById("superLineup");

  const count =
    document.getElementById("lineupCount");

  if (!container) {
    return;
  }

  if (count) {
    count.textContent =
      game.lineup.length;
  }

  container.innerHTML = "";

  for (
    let i = 0;
    i < CONFIG.superSquadSize;
    i++
  ) {
    const slot =
      document.createElement("div");

    slot.className =
      "lineup-slot";

    if (game.lineup[i]) {
      const player =
        game.lineup[i];

      slot.innerHTML = `
        <strong>
          ${escapeHTML(player.name)}
        </strong>

        <span>
          ${escapeHTML(
            player.position || "Player"
          )}
        </span>

        <span>
          ${player.rating}
        </span>

        <small>Click to remove</small>
      `;

      slot.addEventListener(
        "click",
        function () {
          removeFromLineup(i);
        }
      );
    } else {
      slot.innerHTML = `
        <span>
          Empty Slot
        </span>
      `;
    }

    container.appendChild(slot);
  }
}

function removeFromLineup(index) {
  if (!game.lineup[index]) {
    return;
  }

  const player =
    game.lineup[index];

  game.lineup.splice(index, 1);

  saveGame(game);

  renderCollection();
  renderLineup();

  notify(
    `${player.name} removed from lineup.`
  );
}

/* =========================================================
   SUPER SQUAD MATCH
   ========================================================= */

function playSuperMatch() {
  if (!game.squadName) {
    notify("Create your team first.");
    return;
  }

  if (
    game.lineup.length !==
    CONFIG.superSquadSize
  ) {
    notify(
      `You need exactly ${CONFIG.superSquadSize} players in your lineup.`
    );

    return;
  }

  if (!game.squadSeason) {
    game.squadSeason = {
      match: 0,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      results: []
    };
  }

  if (
    game.squadSeason.match >=
    CONFIG.seasonMatches
  ) {
    notify("Your season is finished.");
    return;
  }

  const opponents =
    CONFIG.premierLeagueTeams;

  const opponent =
    randomItem(opponents);

  const myRating =
    calculateSquadRating(
      game.lineup
    );

  const opponentRating =
    generateOpponentRating();

  const result =
    simulateMatch(
      myRating,
      opponentRating
    );

  const score =
    generateScore(
      result.result,
      myRating,
      opponentRating
    );

  game.squadSeason.match += 1;
  game.squadSeason.points +=
    result.points;

  game.points +=
    result.points;

  if (result.result === "win") {
    game.wins += 1;
    game.squadSeason.wins += 1;
  }

  if (result.result === "draw") {
    game.draws += 1;
    game.squadSeason.draws += 1;
  }

  if (result.result === "loss") {
    game.losses += 1;
    game.squadSeason.losses += 1;
  }

  game.squadSeason.results.push({
    match: game.squadSeason.match,
    opponent: opponent,
    result: result.result,
    points: result.points,
    myScore: score.myScore,
    opponentScore: score.opponentScore
  });

  saveGame(game);

  showSuperMatchResult(
    opponent,
    score.myScore,
    score.opponentScore,
    result.result,
    result.points
  );

  renderSuperSquad();
}

function showSuperMatchResult(
  opponent,
  myScore,
  opponentScore,
  result,
  points
) {
  const results =
    document.getElementById(
      "superResults"
    );

  if (!results) {
    return;
  }

  let resultWord = "DREW";

  if (result === "win") {
    resultWord = "BEAT";
  }

  if (result === "loss") {
    resultWord = "LOST TO";
  }

  results.innerHTML = `
    <div class="match-result">
      <h2>
        ${escapeHTML(game.squadName)}
        ${resultWord}
        ${escapeHTML(opponent)}
      </h2>

      <div class="score">
        ${myScore} - ${opponentScore}
      </div>

      <div class="points-earned">
        ${resultText(result)}
        — +${points} points
      </div>
    </div>
  `;
}

/* =========================================================
   SUPER SQUAD SEASON
   ========================================================= */

function renderSuperSeason() {
  const info =
    document.getElementById(
      "superSeasonInfo"
    );

  const results =
    document.getElementById(
      "superResults"
    );

  if (!info || !results) {
    return;
  }

  if (!game.squadSeason) {
    info.innerHTML =
      "<p>No season started yet. Build your 11-player lineup and play a match.</p>";

    return;
  }

  if (
    game.squadSeason.match >=
    CONFIG.seasonMatches
  ) {
    info.innerHTML = `
      <h3>Season Complete!</h3>

      <p>
        ${game.squadSeason.wins} wins,
        ${game.squadSeason.draws} draws,
        ${game.squadSeason.losses} losses
      </p>

      <p>
        Season Points:
        <strong>
          ${game.squadSeason.points}
        </strong>
      </p>
    `;
  } else {
    info.innerHTML = `
      <h3>
        Match
        ${game.squadSeason.match}
        /
        ${CONFIG.seasonMatches}
      </h3>

      <p>
        Season Points:
        <strong>
          ${game.squadSeason.points}
        </strong>
      </p>
    `;
  }

  if (
    game.squadSeason.results.length === 0
  ) {
    return;
  }

  results.innerHTML = `
    ${game.squadSeason.results
      .map(function (match) {
        return `
          <div class="result-row">
            <strong>
              ${escapeHTML(game.squadName)}
              ${match.myScore}-${match.opponentScore}
              ${escapeHTML(match.opponent)}
            </strong>

            <span>
              ${resultText(match.result)}
              +${match.points} pts
            </span>
          </div>
        `;
      })
      .join("")}
  `;
}

/* =========================================================
   RESET
   ========================================================= */

function resetGame() {
  const confirmed =
    window.confirm(
      "Are you sure you want to reset your game?"
    );

  if (!confirmed) {
    return;
  }

  deleteSave();

  game =
    createDefaultGame();

  const teamName =
    document.getElementById("teamName");

  if (teamName) {
    teamName.value = "";
  }

  saveGame(game);

  renderAll();

  notify("Game reset.");
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

let notificationTimer = null;

function notify(message) {
  const notification =
    document.getElementById(
      "notification"
    );

  if (!notification) {
    return;
  }

  notification.textContent =
    message;

  notification.style.display =
    "block";

  clearTimeout(
    notificationTimer
  );

  notificationTimer =
    setTimeout(function () {
      notification.style.display =
        "none";
    }, 3000);
}
