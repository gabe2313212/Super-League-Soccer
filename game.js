// ============================================
// SUPER LEAGUE SOCCER
// MAIN GAME
// ============================================

let game = loadGame();

if (!game || typeof game !== "object") {
  game = createNewGame();
}

function createNewGame() {
  return {
    mode: "mainMenu",

    points: CONFIG.startingPoints,

    rosterTeam: "",
    roster: [],
    rosterSeason: null,

    squadName: "My Super Squad",
    collection: [],
    lineup: [],
    squadSeason: null
  };
}

// ============================================
// STARTUP
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  setupGame();

  renderAll();
});

function setupGame() {
  const resetButton = document.getElementById("resetGame");

  if (resetButton) {
    resetButton.addEventListener("click", resetGame);
  }

  const rosterTeam = document.getElementById("rosterTeam");

  if (rosterTeam) {
    rosterTeam.addEventListener("change", function () {
      game.rosterTeam = rosterTeam.value;
      game.roster = [];

      saveGame(game);

      renderRosterPlayers();
    });
  }

  const startRosterSeasonButton =
    document.getElementById("startRosterSeason");

  if (startRosterSeasonButton) {
    startRosterSeasonButton.addEventListener(
      "click",
      startRosterSeason
    );
  }

  const createTeamButton =
    document.getElementById("createTeamButton");

  if (createTeamButton) {
    createTeamButton.addEventListener(
      "click",
      createSuperTeam
    );
  }

  const bronzePack =
    document.getElementById("bronzePack");

  if (bronzePack) {
    bronzePack.addEventListener("click", function () {
      openPack("bronze");
    });
  }

  const goldPack =
    document.getElementById("goldPack");

  if (goldPack) {
    goldPack.addEventListener("click", function () {
      openPack("gold");
    });
  }

  const playSuperMatch =
    document.getElementById("playSuperMatch");

  if (playSuperMatch) {
    playSuperMatch.addEventListener(
      "click",
      simulateSquadMatch
    );
  }
}

// ============================================
// SCREEN NAVIGATION
// ============================================

function openMode(modeId) {
  const screens =
    document.querySelectorAll(".screen");

  screens.forEach(function (screen) {
    screen.classList.remove("active");
  });

  const target =
    document.getElementById(modeId);

  if (!target) {
    console.error(
      "Could not find screen:",
      modeId
    );
    return;
  }

  target.classList.add("active");

  game.mode = modeId;

  saveGame(game);

  if (modeId === "rosterMode") {
    populateRosterTeams();
    renderRosterPlayers();
    renderRosterSeason();
  }

  if (modeId === "superSquadMode") {
    renderSuperSquad();
  }
}

// ============================================
// RENDER EVERYTHING
// ============================================

function renderAll() {
  populateRosterTeams();

  if (
    game.mode !== "rosterMode" &&
    game.mode !== "superSquadMode"
  ) {
    game.mode = "mainMenu";
  }

  openMode(game.mode);

  renderRosterPlayers();
  renderRosterSeason();
  renderSuperSquad();
}

// ============================================
// ROSTER MODE
// ============================================

function populateRosterTeams() {
  const select =
    document.getElementById("rosterTeam");

  if (!select) {
    return;
  }

  const currentValue =
    game.rosterTeam || "";

  select.innerHTML =
    '<option value="">Select a team</option>';

  CONFIG.premierLeagueTeams.forEach(
    function (team) {
      const option =
        document.createElement("option");

      option.value = team;
      option.textContent = team;

      select.appendChild(option);
    }
  );

  select.value = currentValue;
}

function renderRosterPlayers() {
  const container =
    document.getElementById("rosterPlayers");

  const count =
    document.getElementById("selectedCount");

  const startButton =
    document.getElementById(
      "startRosterSeason"
    );

  const select =
    document.getElementById("rosterTeam");

  if (!container || !select) {
    return;
  }

  const team = select.value;

  if (!team) {
    container.innerHTML =
      '<p class="empty-message">Choose a Premier League team to see its players.</p>';

    if (count) {
      count.textContent =
        `0 / ${CONFIG.rosterSize} players selected`;
    }

    if (startButton) {
      startButton.disabled = true;
    }

    return;
  }

  const players =
    getCompleteTeam(
      team,
      CONFIG.leagues.premierLeague
    );

  container.innerHTML = "";

  players.forEach(function (player) {
    const selected =
      playerInSquad(
        game.roster,
        player
      );

    const card =
      document.createElement("div");

    card.className = "player-card";

    if (selected) {
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
        ⭐ ${player.rating}
      </div>
    `;

    card.addEventListener(
      "click",
      function () {
        toggleRosterPlayer(player);
      }
    );

    container.appendChild(card);
  });

  updateRosterSelectionUI();
}

function toggleRosterPlayer(player) {
  const existingIndex =
    game.roster.findIndex(
      function (p) {
        return (
          p.name === player.name &&
          p.team === player.team
        );
      }
    );

  if (existingIndex !== -1) {
    game.roster.splice(
      existingIndex,
      1
    );
  } else {
    if (
      game.roster.length >=
      CONFIG.rosterSize
    ) {
      notify(
        `You can only select ${CONFIG.rosterSize} players.`
      );

      return;
    }

    game.roster.push({
      ...player
    });
  }

  saveGame(game);

  renderRosterPlayers();
}

function updateRosterSelectionUI() {
  const count =
    document.getElementById(
      "selectedCount"
    );

  const startButton =
    document.getElementById(
      "startRosterSeason"
    );

  if (count) {
    count.textContent =
      `${game.roster.length} / ${CONFIG.rosterSize} players selected`;
  }

  if (startButton) {
    startButton.disabled =
      game.roster.length !==
      CONFIG.rosterSize;
  }
}

// ============================================
// ROSTER SEASON
// ============================================

function startRosterSeason() {
  if (
    game.roster.length !==
    CONFIG.rosterSize
  ) {
    notify(
      `Select exactly ${CONFIG.rosterSize} players first.`
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

  saveGame(game);

  renderRosterSeason();

  notify("Your season has started!");
}

function simulateRosterMatch() {
  if (!game.rosterSeason) {
    notify("Start your season first.");

    return;
  }

  if (
    game.rosterSeason.match >=
    CONFIG.seasonMatches
  ) {
    notify("Your season is already finished.");

    return;
  }

  const teamRating =
    calculateSquadStrength(
      game.roster
    );

  const opponentRating =
    generateOpponentRating();

  const result =
    simulateMatch(
      teamRating,
      opponentRating
    );

  game.rosterSeason.match++;

  game.rosterSeason.points +=
    result.points;

  if (result.result === "win") {
    game.rosterSeason.wins++;
  }

  if (result.result === "draw") {
    game.rosterSeason.draws++;
  }

  if (result.result === "loss") {
    game.rosterSeason.losses++;
  }

  game.rosterSeason.results.push({
    result: result.result,
    opponentRating:
      result.opponentRating
  });

  saveGame(game);

  renderRosterSeason();

  notify(
    `${resultText(result.result)}! +${result.points} points`
  );
}

function renderRosterSeason() {
  const seasonBox =
    document.getElementById(
      "rosterSeason"
    );

  const title =
    document.getElementById(
      "rosterMatchTitle"
    );

  const matchBox =
    document.getElementById(
      "rosterMatch"
    );

  const resultsBox =
    document.getElementById(
      "rosterResults"
    );

  const playButton =
    document.getElementById(
      "playRosterMatch"
    );

  const standingsBox =
    document.getElementById(
      "rosterStandings"
    );

  if (!seasonBox) {
    return;
  }

  if (!game.rosterSeason) {
    seasonBox.classList.add("hidden");

    if (standingsBox) {
      standingsBox.classList.add(
        "hidden"
      );
    }

    return;
  }

  seasonBox.classList.remove("hidden");

  const season =
    game.rosterSeason;

  if (title) {
    title.textContent =
      `Match ${season.match + 1} / ${CONFIG.seasonMatches}`;
  }

  if (matchBox) {
    if (
      season.match >=
      CONFIG.seasonMatches
    ) {
      matchBox.innerHTML = `
        <div class="game-card">
          <h3>🏆 Season Complete!</h3>

          <p>
            Final Points:
            <strong>
              ${season.points}
            </strong>
          </p>

          <p>
            Wins: ${season.wins}
            &nbsp; Draws: ${season.draws}
            &nbsp; Losses: ${season.losses}
          </p>
        </div>
      `;
    } else {
      const opponent =
        getRosterOpponent();

      matchBox.innerHTML = `
        <div class="game-card">
          <p>
            ${escapeHTML(game.rosterTeam)}
            vs
            <strong>
              ${escapeHTML(opponent)}
            </strong>
          </p>

          <p>
            Your squad rating:
            <strong>
              ${calculateSquadStrength(
                game.roster
              )}
            </strong>
          </p>
        </div>
      `;
    }
  }

  if (playButton) {
    playButton.disabled =
      season.match >=
      CONFIG.seasonMatches;

    playButton.textContent =
      season.match >=
      CONFIG.seasonMatches
        ? "Season Finished"
        : "⚽ Play Match";
  }

  if (resultsBox) {
    if (season.results.length === 0) {
      resultsBox.innerHTML = `
        <p class="empty-message">
          No matches played yet.
        </p>
      `;
    } else {
      resultsBox.innerHTML =
        season.results
          .map(
            function (item, index) {
              return `
                <div class="match">

                  <span>
                    Match ${index + 1}
                  </span>

                  <strong
                    class="${resultClass(
                      item.result
                    )}"
                  >
                    ${resultText(
                      item.result
                    )}
                  </strong>

                  <span>
                    ${
                      item.result ===
                      "win"
                        ? "+100"
                        : item.result ===
                          "draw"
                        ? "+50"
                        : "+0"
                    }
                  </span>

                </div>
              `;
            }
          )
          .join("");
    }
  }

  if (standingsBox) {
    standingsBox.classList.remove(
      "hidden"
    );

    renderStandings();
  }
}

function getRosterOpponent() {
  const teams =
    CONFIG.premierLeagueTeams.filter(
      function (team) {
        return team !== game.rosterTeam;
      }
    );

  if (teams.length === 0) {
    return "League Opponent";
  }

  const index =
    game.rosterSeason.match %
    teams.length;

  return teams[index];
}

// ============================================
// LEAGUE STANDINGS
// ============================================

function renderStandings() {
  const body =
    document.getElementById(
      "standingsBody"
    );

  if (!body) {
    return;
  }

  const selectedTeam =
    game.rosterTeam;

  const userPoints =
    game.rosterSeason
      ? game.rosterSeason.points
      : 0;

  const userWins =
    game.rosterSeason
      ? game.rosterSeason.wins
      : 0;

  const userDraws =
    game.rosterSeason
      ? game.rosterSeason.draws
      : 0;

  const userLosses =
    game.rosterSeason
      ? game.rosterSeason.losses
      : 0;

  const table =
    CONFIG.premierLeagueTeams.map(
      function (team, index) {
        if (team === selectedTeam) {
          return {
            team: team,
            wins: userWins,
            draws: userDraws,
            losses: userLosses,
            points: userPoints
          };
        }

        const rating =
          getTeamAverageRating(team);

        const simulatedWins =
          Math.floor(
            Math.random() * 10 +
            rating / 20
          );

        const simulatedDraws =
          Math.floor(
            Math.random() * 6
          );

        const simulatedLosses =
          Math.max(
            0,
            game.rosterSeason
              ? game.rosterSeason.match -
                simulatedWins -
                simulatedDraws
              : 0
          );

        return {
          team: team,
          wins: simulatedWins,
          draws: simulatedDraws,
          losses: simulatedLosses,
          points:
            simulatedWins * 100 +
            simulatedDraws * 50
        };
      }
    );

  table.sort(
    function (a, b) {
      return b.points - a.points;
    }
  );

  body.innerHTML =
    table
      .map(
        function (team, index) {
          const isUser =
            team.team === selectedTeam;

          return `
            <tr
              ${
                isUser
                  ? 'style="font-weight:bold;"'
                  : ""
              }
            >

              <td>
                ${index + 1}
              </td>

              <td>
                ${escapeHTML(team.team)}
                ${
                  isUser
                    ? " ⭐"
                    : ""
                }
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
                ${team.points}
              </td>

            </tr>
          `;
        }
      )
      .join("");
}

function getTeamAverageRating(team) {
  const players =
    getCompleteTeam(
      team,
      CONFIG.leagues.premierLeague
    );

  return averageRating(players);
}

// ============================================
// SUPER SQUAD
// ============================================

function createSuperTeam() {
  const input =
    document.getElementById("teamName");

  if (!input) {
    return;
  }

  const cleaned =
    cleanTeamName(input.value);

  if (
    !cleaned ||
    cleaned === "My Super Squad"
  ) {
    if (!input.value.trim()) {
      notify(
        "Enter a team name first."
      );

      return;
    }
  }

  game.squadName = cleaned;

  saveGame(game);

  const createBox =
    document.getElementById(
      "createTeamBox"
    );

  const superGame =
    document.getElementById(
      "superGame"
    );

  if (createBox) {
    createBox.classList.add(
      "hidden"
    );

    createBox.style.display = "none";
  }

  if (superGame) {
    superGame.classList.remove(
      "hidden"
    );

    superGame.style.display = "block";
  }

  renderSuperSquad();

  notify(
    `${game.squadName} created!`
  );
}

function renderSuperSquad() {
  const teamName =
    document.getElementById(
      "superTeamName"
    );

  const input =
    document.getElementById(
      "teamName"
    );

  const createBox =
    document.getElementById(
      "createTeamBox"
    );

  const superGame =
    document.getElementById(
      "superGame"
    );

  if (teamName) {
    teamName.textContent =
      game.squadName;
  }

  if (input) {
    input.value =
      game.squadName ===
      "My Super Squad"
        ? ""
        : game.squadName;
  }

  if (
    game.squadName !==
    "My Super Squad"
  ) {
    if (createBox) {
      createBox.classList.add(
        "hidden"
      );

      createBox.style.display =
        "none";
    }

    if (superGame) {
      superGame.classList.remove(
        "hidden"
      );

      superGame.style.display =
        "block";
    }
  }

  renderSuperStats();
  renderLineup();
  renderCollection();
  renderSquadSeason();
}

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

  const season =
    game.squadSeason || {
      wins: 0,
      draws: 0,
      losses: 0
    };

  if (points) {
    points.textContent =
      formatNumber(game.points);
  }

  if (wins) {
    wins.textContent =
      season.wins;
  }

  if (draws) {
    draws.textContent =
      season.draws;
  }

  if (losses) {
    losses.textContent =
      season.losses;
  }
}

// ============================================
// SUPER SQUAD LINEUP
// ============================================

function renderLineup() {
  const container =
    document.getElementById(
      "superLineup"
    );

  const count =
    document.getElementById(
      "lineupCount"
    );

  if (!container) {
    return;
  }

  if (count) {
    count.textContent =
      `${game.lineup.length} / ${CONFIG.superSquadSize} players`;
  }

  container.innerHTML = "";

  game.lineup.forEach(
    function (player, index) {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "player-card";

      card.classList.add(
        rarityClass(
          player.rarity
        )
      );

      card.innerHTML = `
        <div class="player-name">
          ${escapeHTML(
            player.name
          )}
        </div>

        <div class="player-position">
          ${escapeHTML(
            player.position
          )}
        </div>

        <div class="player-rating">
          ⭐ ${player.rating}
        </div>

        <div>
          ${escapeHTML(
            player.team
          )}
        </div>

        <div>
          ${escapeHTML(
            player.rarity ||
              "Common"
          )}
        </div>

        <small>
          Click to remove
        </small>
      `;

      card.addEventListener(
        "click",
        function () {
          removeFromLineup(index);
        }
      );

      container.appendChild(card);
    }
  );

  for (
    let i =
      game.lineup.length;
    i <
    CONFIG.superSquadSize;
    i++
  ) {
    const slot =
      document.createElement(
        "div"
      );

    slot.className =
      "lineup-slot";

    slot.innerHTML = `
      <strong>
        Slot ${i + 1}
      </strong>

      Empty
    `;

    container.appendChild(slot);
  }
}

function removeFromLineup(index) {
  const player =
    game.lineup[index];

  if (!player) {
    return;
  }

  game.collection.push(
    player
  );

  game.lineup.splice(
    index,
    1
  );

  saveGame(game);

  renderLineup();
  renderCollection();

  notify(
    `${player.name} returned to your collection.`
  );
}

// ============================================
// PLAYER COLLECTION
// ============================================

function renderCollection() {
  const container =
    document.getElementById(
      "collection"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (
    game.collection.length ===
    0
  ) {
    container.innerHTML = `
      <p class="empty-message">
        Your collection is empty.
        Open a pack to get players!
      </p>
    `;

    return;
  }

  game.collection.forEach(
    function (player, index) {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "player-card";

      card.classList.add(
        rarityClass(
          player.rarity
        )
      );

      card.innerHTML = `
        <div class="player-name">
          ${escapeHTML(
            player.name
          )}
        </div>

        <div class="player-position">
          ${escapeHTML(
            player.position
          )}
        </div>

        <div class="player-rating">
          ⭐ ${player.rating}
        </div>

        <div>
          ${escapeHTML(
            player.team
          )}
        </div>

        <div>
          ${escapeHTML(
            player.rarity ||
              "Common"
          )}
        </div>

        <small>
          Click to add to squad
        </small>
      `;

      card.addEventListener(
        "click",
        function () {
          addToLineup(index);
        }
      );

      container.appendChild(card);
    }
  );
}

function addToLineup(index) {
  if (
    game.lineup.length >=
    CONFIG.superSquadSize
  ) {
    notify(
      `Your squad can only have ${CONFIG.superSquadSize} players.`
    );

    return;
  }

  const player =
    game.collection[index];

  if (!player) {
    return;
  }

  game.collection.splice(
    index,
    1
  );

  game.lineup.push(
    player
  );

  saveGame(game);

  renderLineup();
  renderCollection();

  notify(
    `${player.name} added to your squad!`
  );
}

// ============================================
// PACKS
// ============================================

function openPack(type) {
  const pack =
    CONFIG.packs[type];

  if (!pack) {
    console.error(
      "Unknown pack:",
      type
    );

    return;
  }

  if (
    game.squadName ===
    "My Super Squad"
  ) {
    notify(
      "Create your Super Squad first."
    );

    return;
  }

  if (
    game.points <
    pack.cost
  ) {
    notify(
      `You need ${pack.cost} points.`
    );

    return;
  }

  game.points -=
    pack.cost;

  const cards = [];

  for (
    let i = 0;
    i < pack.cards;
    i++
  ) {
    const card =
      getPackPlayer(type);

    if (card) {
      cards.push(card);

      game.collection.push(
        card
      );
    }
  }

  saveGame(game);

  renderSuperStats();
  renderCollection();

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
    <div class="game-card">

      <h3>
        🎉 ${escapeHTML(
          packName
        )} opened!
      </h3>

      <div class="collection-grid">
  `;

  cards.forEach(
    function (card) {
      html += `
        <div
          class="player-card ${rarityClass(
            card.rarity
          )}"
        >

          <div class="player-name">
            ${escapeHTML(
              card.name
            )}
          </div>

          <div class="player-position">
            ${escapeHTML(
              card.position
            )}
          </div>

          <div class="player-rating">
            ⭐ ${card.rating}
          </div>

          <div>
            ${escapeHTML(
              card.team
            )}
          </div>

          <div>
            ${escapeHTML(
              card.rarity
            )}
          </div>

        </div>
      `;
    }
  );

  html += `
      </div>
    </div>
  `;

  container.innerHTML =
    html;
}

// ============================================
// SUPER SQUAD SEASON
// ============================================

function simulateSquadMatch() {
  if (
    game.lineup.length !==
    CONFIG.superSquadSize
  ) {
    notify(
      `You need exactly ${CONFIG.superSquadSize} players in your squad.`
    );

    return;
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

  if (
    game.squadSeason.match >=
    CONFIG.seasonMatches
  ) {
    notify(
      "Your season is finished."
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

  game.squadSeason.match++;

  game.squadSeason.points +=
    result.points;

  game.points +=
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

  game.squadSeason.results.push({
    result: result.result,
    opponentRating:
      result.opponentRating
  });

  saveGame(game);

  renderSuperStats();
  renderSquadSeason();

  notify(
    `${resultText(result.result)}! +${result.points} points`
  );
}

function renderSquadSeason() {
  const results =
    document.getElementById(
      "superResults"
    );

  const info =
    document.getElementById(
      "superSeasonInfo"
    );

  if (!results) {
    return;
  }

  if (!game.squadSeason) {
    if (info) {
      info.textContent =
        "Matchday 1";
    }

    results.innerHTML = `
      <p class="empty-message">
        Build an 11-player squad to start playing matches.
      </p>
    `;

    return;
  }

  const season =
    game.squadSeason;

  if (info) {
    info.textContent =
      season.match >=
      CONFIG.seasonMatches
        ? "Season Complete"
        : `Matchday ${season.match + 1} / ${CONFIG.seasonMatches}`;
  }

  if (
    season.results.length ===
    0
  ) {
    results.innerHTML = `
      <p class="empty-message">
        Your match results will appear here.
      </p>
    `;

    return;
  }

  results.innerHTML =
    season.results
      .map(
        function (item, index) {
          const points =
            item.result ===
            "win"
              ? CONFIG.matchPoints.win
              : item.result ===
                "draw"
              ? CONFIG.matchPoints.draw
              : CONFIG.matchPoints.loss;

          return `
            <div class="match">

              <span>
                Match ${index + 1}
              </span>

              <strong
                class="${resultClass(
                  item.result
                )}"
              >
                ${resultText(
                  item.result
                )}
              </strong>

              <span>
                +${points}
              </span>

            </div>
          `;
        }
      )
      .join("");
}

// ============================================
// NOTIFICATION
// ============================================

function notify(message) {
  const box =
    document.getElementById(
      "notification"
    );

  if (!box) {
    return;
  }

  box.textContent =
    message;

  box.classList.add(
    "show"
  );

  setTimeout(
    function () {
      box.classList.remove(
        "show"
      );
    },
    2500
  );
}

// ============================================
// RESET GAME
// ============================================

function resetGame() {
  const confirmed =
    window.confirm(
      "Are you sure you want to reset the entire game?"
    );

  if (!confirmed) {
    return;
  }

  deleteSave();

  game =
    createNewGame();

  location.reload();
}

// ============================================
// SAFETY / SAVE RECOVERY
// ============================================

// Make sure an old save from a previous
// version cannot break the new game.

if (!Array.isArray(game.roster)) {
  game.roster = [];
}

if (!Array.isArray(game.collection)) {
  game.collection = [];
}

if (!Array.isArray(game.lineup)) {
  game.lineup = [];
}

if (
  typeof game.points !==
  "number"
) {
  game.points =
    CONFIG.startingPoints;
}

if (!game.mode) {
  game.mode =
    "mainMenu";
}

saveGame(game);
