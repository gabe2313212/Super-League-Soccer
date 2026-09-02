// ============================================
// SUPER LEAGUE SOCCER - MAIN GAME
// ============================================

let game = loadGame() || {
  mode: null,

  points: CONFIG.startingPoints,

  rosterTeam: null,
  roster: [],
  rosterSeason: null,

  squadName: "My Super Squad",
  collection: [],
  lineup: [],
  squadSeason: null,

  notification: ""
};


// ============================================
// STARTUP
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  setupEventListeners();

  renderAll();

});


// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {

  document
    .getElementById("resetGame")
    .addEventListener("click", resetGame);

  document
    .getElementById("buildRosterButton")
    .addEventListener("click", openRosterMode);

  document
    .getElementById("superSquadButton")
    .addEventListener("click", openSuperSquadMode);

  document
    .getElementById("backFromRoster")
    .addEventListener("click", showMenu);

  document
    .getElementById("backFromSquad")
    .addEventListener("click", showMenu);

  document
    .getElementById("rosterTeam")
    .addEventListener("change", renderRosterPlayers);

  document
    .getElementById("startRosterSeason")
    .addEventListener("click", startRosterSeason);

  document
    .getElementById("simulateRosterMatch")
    .addEventListener("click", simulateRosterMatch);

  document
    .getElementById("saveSquadName")
    .addEventListener("click", saveSquadName);

  document
    .getElementById("openBronzePack")
    .addEventListener("click", () => openPack("bronze"));

  document
    .getElementById("openGoldPack")
    .addEventListener("click", () => openPack("gold"));

  document
    .getElementById("simulateSquadMatch")
    .addEventListener("click", simulateSquadMatch);

}


// ============================================
// SCREEN MANAGEMENT
// ============================================

function showScreen(screenID) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {
      screen.classList.remove("active");
    });

  const screen = document.getElementById(screenID);

  if (screen) {
    screen.classList.add("active");
  }

}


function showMenu() {

  game.mode = null;

  showScreen("mainMenu");

  renderAll();

}


function openRosterMode() {

  game.mode = "roster";

  showScreen("rosterScreen");

  populateRosterTeams();

  renderRosterPlayers();

  renderRosterSeason();

}


function openSuperSquadMode() {

  game.mode = "squad";

  showScreen("squadScreen");

  renderSuperSquad();

}


// ============================================
// ROSTER MODE
// ============================================

function populateRosterTeams() {

  const select = document.getElementById("rosterTeam");

  if (!select) {
    return;
  }

  select.innerHTML = "";

  CONFIG.premierLeagueTeams.forEach(team => {

    const option = document.createElement("option");

    option.value = team;
    option.textContent = team;

    select.appendChild(option);

  });

  if (game.rosterTeam) {

    select.value = game.rosterTeam;

  }

}


function renderRosterPlayers() {

  const teamSelect = document.getElementById("rosterTeam");
  const container = document.getElementById("rosterPlayers");

  if (!teamSelect || !container) {
    return;
  }

  const team = teamSelect.value;

  game.rosterTeam = team;

  let players = getCompleteTeam(
    team,
    "Premier League"
  );

  container.innerHTML = "";

  players.slice(0, 11).forEach(player => {

    const card = document.createElement("div");

    card.className = "player-card";

    const alreadySelected =
      game.roster.some(
        selected =>
          selected.name === player.name &&
          selected.team === player.team
      );

    if (alreadySelected) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <div class="player-name">
        ${escapeHTML(player.name)}
      </div>

      <div class="player-position">
        ${escapeHTML(player.position)}
      </div>

      <div class="player-rating">
        Rating: ${player.rating}
      </div>
    `;

    card.addEventListener("click", () => {

      const index = game.roster.findIndex(
        selected =>
          selected.name === player.name &&
          selected.team === player.team
      );

      if (index !== -1) {

        game.roster.splice(index, 1);

      } else {

        if (game.roster.length >= CONFIG.rosterSize) {

          notify(
            `You can only choose ${CONFIG.rosterSize} players.`
          );

          return;
        }

        game.roster.push({
          ...player
        });

      }

      saveGame(game);

      renderRosterPlayers();

      renderRosterStats();

    });

    container.appendChild(card);

  });

  renderRosterStats();

}


function renderRosterStats() {

  const container =
    document.getElementById("rosterStats");

  if (!container) {
    return;
  }

  const rating =
    averageRating(game.roster);

  container.innerHTML = `
    <div class="stats-grid">

      <div class="stat-box">
        <span class="stat-number">
          ${game.roster.length}
        </span>
        <span class="stat-label">
          Players
        </span>
      </div>

      <div class="stat-box">
        <span class="stat-number">
          ${CONFIG.rosterSize}
        </span>
        <span class="stat-label">
          Required
        </span>
      </div>

      <div class="stat-box">
        <span class="stat-number">
          ${rating}
        </span>
        <span class="stat-label">
          Average Rating
        </span>
      </div>

      <div class="stat-box">
        <span class="stat-number">
          ${game.rosterTeam || "-"}
        </span>
        <span class="stat-label">
          Club
        </span>
      </div>

    </div>
  `;

}


function startRosterSeason() {

  if (game.roster.length !== CONFIG.rosterSize) {

    notify(
      `Choose exactly ${CONFIG.rosterSize} players first.`
    );

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

  saveGame(game);

  renderRosterSeason();

  notify("Season started!");

}


function simulateRosterMatch() {

  if (!game.rosterSeason) {

    notify("Start the season first.");

    return;
  }

  if (
    game.rosterSeason.match >=
    CONFIG.seasonMatches
  ) {

    notify("The season is already finished.");

    return;
  }

  const teamRating =
    averageRating(game.roster);

  const opponentRating =
    generateOpponentRating();

  const result =
    simulateMatch(
      teamRating,
      opponentRating
    );

  game.rosterSeason.match++;

  game.rosterSeason.points += result.points;

  if (result.result === "win") {
    game.rosterSeason.wins++;
  }

  if (result.result === "draw") {
    game.rosterSeason.draws++;
  }

  if (result.result === "loss") {
    game.rosterSeason.losses++;
  }

  game.rosterSeason.results.push(result.result);

  saveGame(game);

  renderRosterSeason();

  notify(
    `${resultText(result.result)}! +${result.points} points`
  );

}


function renderRosterSeason() {

  const container =
    document.getElementById("rosterSeason");

  if (!container) {
    return;
  }

  if (!game.rosterSeason) {

    container.innerHTML = `
      <div class="empty-message">
        No season started yet.
      </div>
    `;

    return;
  }

  const season =
    game.rosterSeason;

  let resultsHTML = "";

  season.results.forEach(
    (result, index) => {

      resultsHTML += `
        <div class="match">

          <span>
            Match ${index + 1}
          </span>

          <strong class="${resultClass(result)}">
            ${resultText(result)}
          </strong>

          <span>
            +${result === "win"
              ? CONFIG.matchPoints.win
              : result === "draw"
              ? CONFIG.matchPoints.draw
              : CONFIG.matchPoints.loss}
          </span>

        </div>
      `;

    }
  );

  container.innerHTML = `

    <div class="stats-grid">

      <div class="stat-box">
        <span class="stat-number">
          ${season.match}
        </span>
        <span class="stat-label">
          Matches
        </span>
      </div>

      <div class="stat-box">
        <span class="stat-number">
          ${season.points}
        </span>
        <span class="stat-label">
          Points
        </span>
      </div>

      <div class="stat-box">
        <span class="stat-number">
          ${season.wins}
        </span>
        <span class="stat-label">
          Wins
        </span>
      </div>

      <div class="stat-box">
        <span class="stat-number">
          ${season.draws}
        </span>
        <span class="stat-label">
          Draws
        </span>
      </div>

    </div>

    <button
      class="primary-button"
      id="simulateRosterMatch"
      ${season.match >= CONFIG.seasonMatches
        ? "disabled"
        : ""}
    >
      ${season.match >= CONFIG.seasonMatches
        ? "Season Finished"
        : "Simulate Next Match"}
    </button>

    <div class="results">
      ${resultsHTML || `
        <div class="empty-message">
          Your matches will appear here.
        </div>
      `}
    </div>
  `;

  const button =
    document.getElementById(
      "simulateRosterMatch"
    );

  if (button) {

    button.addEventListener(
      "click",
      simulateRosterMatch
    );

  }

}


// ============================================
// SUPER SQUAD
// ============================================

function saveSquadName() {

  const input =
    document.getElementById("squadName");

  if (!input) {
    return;
  }

  game.squadName =
    cleanTeamName(input.value);

  input.value =
    game.squadName;

  saveGame(game);

  renderSuperSquad();

  notify("Team name saved!");

}


function renderSuperSquad() {

  const input =
    document.getElementById("squadName");

  if (input) {
    input.value =
      game.squadName;
  }

  renderPoints();

  renderLineup();

  renderCollection();

  renderSquadSeason();

}


function renderPoints() {

  document
    .querySelectorAll(".points-display")
    .forEach(element => {

      element.textContent =
        `Points: ${formatNumber(game.points)}`;

    });

}


function renderLineup() {

  const container =
    document.getElementById("lineup");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  for (
    let i = 0;
    i < CONFIG.superSquadSize;
    i++
  ) {

    const player =
      game.lineup[i];

    const slot =
      document.createElement("div");

    slot.className =
      "lineup-slot";

    if (player) {

      slot.innerHTML = `
        <strong>
          ${escapeHTML(player.position)}
        </strong>

        ${escapeHTML(player.name)}

        <br>

        <span class="player-rating">
          ${player.rating}
        </span>

        <br>

        <small>
          ${escapeHTML(player.rarity || "Common")}
        </small>
      `;

      slot.addEventListener(
        "click",
        () => {

          game.lineup.splice(i, 1);

          saveGame(game);

          renderLineup();

          renderCollection();

        }
      );

    } else {

      slot.innerHTML = `
        <strong>
          Slot ${i + 1}
        </strong>

        Empty
      `;

    }

    container.appendChild(slot);

  }

}


function renderCollection() {

  const container =
    document.getElementById(
      "collection"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (game.collection.length === 0) {

    container.innerHTML = `
      <div class="empty-message">
        Your collection is empty.
        Open a pack to get players!
      </div>
    `;

    return;
  }

  game.collection.forEach(
    (player, index) => {

      const card =
        document.createElement("div");

      card.className =
        `player-card ${rarityClass(player.rarity)}`;

      card.innerHTML = `
        <div class="player-name">
          ${escapeHTML(player.name)}
        </div>

        <div class="player-position">
          ${escapeHTML(player.position)}
        </div>

        <div class="player-rating">
          ${player.rating} OVR
        </div>

        <div>
          ${escapeHTML(player.team)}
        </div>

        <div>
          ${escapeHTML(player.rarity)}
        </div>
      `;

      card.addEventListener(
        "click",
        () => addToLineup(index)
      );

      container.appendChild(card);

    }
  );

}


function addToLineup(collectionIndex) {

  if (
    game.lineup.length >=
    CONFIG.superSquadSize
  ) {

    notify(
      `Your lineup already has ${CONFIG.superSquadSize} players.`
    );

    return;
  }

  const player =
    game.collection[collectionIndex];

  if (!player) {
    return;
  }

  game.lineup.push(player);

  game.collection.splice(
    collectionIndex,
    1
  );

  saveGame(game);

  renderLineup();

  renderCollection();

  notify(
    `${player.name} added to your lineup!`
  );

}


// ============================================
// PACKS
// ============================================

function openPack(packType) {

  const pack =
    CONFIG.packs[packType];

  if (!pack) {
    return;
  }

  if (game.points < pack.cost) {

    notify(
      `You need ${pack.cost} points.`
    );

    return;
  }

  game.points -= pack.cost;

  const cards = [];

  for (
    let i = 0;
    i < pack.cards;
    i++
  ) {

    const card =
      getPackPlayer(packType);

    cards.push(card);

    game.collection.push(card);

  }

  saveGame(game);

  renderSuperSquad();

  showPackResults(
    pack.name,
    cards
  );

}


function showPackResults(
  packName,
  cards
) {

  const container =
    document.getElementById(
      "packResults"
    );

  if (!container) {
    return;
  }

  let html = `
    <div class="card">
      <h3>
        ${escapeHTML(packName)} opened!
      </h3>

      <div class="collection-grid">
  `;

  cards.forEach(card => {

    html += `
      <div class="player-card ${rarityClass(card.rarity)}">

        <div class="player-name">
          ${escapeHTML(card.name)}
        </div>

        <div>
          ${escapeHTML(card.position)}
        </div>

        <div class="player-rating">
          ${card.rating} OVR
        </div>

        <div>
          ${escapeHTML(card.team)}
        </div>

        <div>
          ${escapeHTML(card.rarity)}
        </div>

      </div>
    `;

  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML =
    html;

}


// ============================================
// SUPER SQUAD MATCHES
// ============================================

function simulateSquadMatch() {

  if (
    game.lineup.length !==
    CONFIG.superSquadSize
  ) {

    notify(
      `You need ${CONFIG.superSquadSize} players in your lineup.`
    );

    return;
  }

  const teamRating =
    calculateSquadStrength(
      game.lineup
    );

  const opponentRating =
    generateOpponentRating();

  const result =
    simulateMatch(
      teamRating,
      opponentRating
    );

  game.points +=
    result.points;

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

  if (
    game.squadSeason.match >=
    CONFIG.seasonMatches
  ) {

    notify(
      "Your season is finished!"
    );

    return;
  }

  game.squadSeason.match++;

  game.squadSeason.points +=
    result.points;

  if (result.result === "win") {
    game.squadSeason.wins++;
  }

  if (result.result === "draw") {
    game.squadSeason.draws++;
  }

  if (result.result === "loss") {
    game.squadSeason.losses++;
  }

  game.squadSeason.results.push(
    result.result
  );

  saveGame(game);

  renderSuperSquad();

  notify(
    `${resultText(result.result)}! +${result.points} points`
  );

}


function renderSquadSeason() {

  const container =
    document.getElementById(
      "squadSeason"
    );

  if (!container) {
    return;
  }

  if (!game.squadSeason) {

    container.innerHTML = `
      <div class="empty-message">
        No Super Squad season matches played yet.
      </div>
    `;

    return;
  }

  const season =
    game.squadSeason;

  let resultsHTML = "";

  season.results.forEach(
    (result, index) => {

      resultsHTML += `
        <div class="match">

          <span>
            Match ${index + 1}
          </span>

          <strong class="${resultClass(result)}">
            ${resultText(result)}
          </strong>

          <span>
            +${result === "win"
              ? CONFIG.matchPoints.win
              : result === "draw"
              ? CONFIG.matchPoints.draw
              : CONFIG.matchPoints.loss}
          </span>

        </div>
      `;

    }
  );

  container.innerHTML = `

    <div class="stats-grid">

      <div class="stat-box">
        <span class="stat-number">
          ${season.match}
        </span>

        <span class="stat-label">
          Matches
        </span>
      </div>

      <div class="stat-box">
        <span class="stat-number">
          ${season.points}
        </span>

        <span class="stat-label">
          Season Points
        </span>
      </div>

      <div class="stat-box">
        <span class="stat-number">
          ${season.wins}
        </span>

        <span class="stat-label">
          Wins
        </span>
      </div>

      <div class="stat-box">
        <span class="stat-number">
          ${season.losses}
        </span>

        <span class="stat-label">
          Losses
        </span>
      </div>

    </div>

    <div class="results">
      ${resultsHTML}
    </div>

  `;

}


// ============================================
// NOTIFICATIONS
// ============================================

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

  notification.classList.add(
    "show"
  );

  setTimeout(() => {

    notification.classList.remove(
      "show"
    );

  }, 2500);

}


// ============================================
// RESET GAME
// ============================================

function resetGame() {

  const confirmed =
    confirm(
      "Are you sure you want to reset your entire game?"
    );

  if (!confirmed) {
    return;
  }

  deleteSave();

  game = {

    mode: null,

    points: CONFIG.startingPoints,

    rosterTeam: null,

    roster: [],

    rosterSeason: null,

    squadName: "My Super Squad",

    collection: [],

    lineup: [],

    squadSeason: null

  };

  showMenu();

  notify(
    "Game reset!"
  );

}


// ============================================
// RENDER EVERYTHING
// ============================================

function renderAll() {

  renderPoints();

  renderRosterStats();

  renderRosterSeason();

  renderSuperSquad();

}
