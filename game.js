/* SUPER LEAGUE SOCCER — BULLETPROOF GAME.JS
   Replace your old game.js with this file.
*/
(() => {
  "use strict";

  const SAVE_KEY = "superLeagueSoccerSave_v4";
  const ROSTER_SIZE = 6;
  const SUPER_SIZE = 11;
  const SEASON_MATCHES = 19;
  const DEFAULT_DIFFICULTY = "easy";

  const PACKS = {
    bronze: {
      name: "Bronze Pack",
      cost: 50,
      cards: 5,
      odds: { icon: 0.04, rare: 0.20, common: 0.76 }
    },
    gold: {
      name: "Gold Pack",
      cost: 100,
      cards: 5,
      odds: { icon: 0.10, rare: 0.30, common: 0.60 }
    },
    icon: {
      name: "Icon Pack",
      cost: 1000,
      cards: 1,
      odds: { icon: 1, rare: 0, common: 0 }
    }
  };

  const DIFFICULTY = {
    easy: {
      name: "Easy",
      min: 72,
      max: 84,
      win: 100,
      draw: 50,
      loss: 0
    },
    hard: {
      name: "Hard",
      min: 82,
      max: 95,
      win: 200,
      draw: 100,
      loss: 0
    }
  };

  let game = makeDefaultGame();
  let initialized = false;

  const $ = id => document.getElementById(id);

  const safeText = value => String(value ?? "");

  const clamp = (n, min, max) =>
    Math.max(min, Math.min(max, Number(n) || 0));

  const rand = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const pick = arr =>
    arr && arr.length
      ? arr[Math.floor(Math.random() * arr.length)]
      : null;

  const esc = value =>
    safeText(value).replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[c]));

  function id() {
    return "p_" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 9);
  }

  function clonePlayer(player) {
    if (!player) return null;

    return {
      ...player,
      id: player.id || id()
    };
  }

  function cfg() {
    return typeof CONFIG !== "undefined" && CONFIG
      ? CONFIG
      : {};
  }

  function allPlayers() {
    const players =
      Array.isArray(cfg().players)
        ? cfg().players
        : [];

    return players
      .map(clonePlayer)
      .filter(Boolean);
  }

  function leagueTeams(league) {
    const c = cfg();

    const key =
      league === "LaLiga"
        ? "laLigaTeams"
        : "premierLeagueTeams";

    return Array.isArray(c[key])
      ? c[key].slice()
      : [];
  }

  function playersForTeam(team, league) {
    let list = allPlayers().filter(
      player =>
        player.team === team &&
        (!league || player.league === league)
    );

    while (list.length < 6) {
      list.push({
        name: `${team} Squad Player ${list.length + 1}`,
        team,
        league,
        position: ["GK", "DEF", "MID", "FWD"][list.length % 4],
        rating: rand(70, 84),
        id: id()
      });
    }

    return list;
  }

  function normalPlayers() {
    return allPlayers().filter(player => !isIcon(player));
  }

  function isIcon(player) {
    return !!player &&
      (
        player.rarity === "Icon" ||
        /\bicon\b/i.test(player.name || "") ||
        player.team === "Icons" ||
        player.league === "Icons"
      );
  }

  function isRare(player) {
    return !!player &&
      (
        player.rarity === "Rare" ||
        player.rating >= 88
      ) &&
      !isIcon(player);
  }

  function iconPlayers() {
    const wanted = [
      ["Pelé", 98],
      ["Diego Maradona", 97],
      ["Johan Cruyff", 96],
      ["Franz Beckenbauer", 96],
      ["Paolo Maldini", 95],
      ["Zinedine Zidane", 95],
      ["Ronaldo Nazario", 96],
      ["Ronaldinho", 94],
      ["Thierry Henry", 94],
      ["Xavi", 94],
      ["Andres Iniesta", 94],
      ["David Beckham", 92],
      ["Andrea Pirlo", 93],
      ["Roberto Carlos", 94],
      ["Cafu", 93],
      ["Gianluigi Buffon", 95],
      ["Iker Casillas", 94],
      ["Lev Yashin", 97],
      ["George Best", 95],
      ["Eusebio", 95],
      ["Marco van Basten", 94],
      ["Ruud Gullit", 93],
      ["Lothar Matthaus", 94],
      ["Patrick Vieira", 92],
      ["Luis Figo", 93],
      ["Kaká", 93],
      ["Alessandro Del Piero", 93],
      ["Franco Baresi", 94],
      ["Sergio Busquets", 91],
      ["Samuel Eto'o", 93]
    ];

    const existing = allPlayers().filter(isIcon);

    return wanted.map(([name, rating]) => {
      const found = existing.find(player =>
        player.name
          .toLowerCase()
          .includes(name.toLowerCase())
      );

      return found || {
        name: `${name} Icon`,
        team: "Icons",
        league: "Icons",
        position: "MID",
        rating,
        rarity: "Icon",
        id: id()
      };
    });
  }

  function makeDefaultGame() {
    return {
      roster: {
        league: "Premier League",
        team: "",
        players: [],
        match: 0,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        results: [],
        standings: []
      },

      superSquad: {
        teamName: "",
        collection: [],
        lineup: [],
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        season: 0,
        difficulty: DEFAULT_DIFFICULTY,
        matchHistory: []
      },

      activeMode: "mainMenu"
    };
  }

  function normalize(raw) {
    const base = makeDefaultGame();

    if (!raw || typeof raw !== "object")
      return base;

    base.activeMode =
      ["mainMenu", "rosterMode", "superSquadMode"]
        .includes(raw.activeMode)
        ? raw.activeMode
        : "mainMenu";

    base.roster = {
      ...base.roster,
      ...(raw.roster || {})
    };

    base.superSquad = {
      ...base.superSquad,
      ...(raw.superSquad || {})
    };

    base.roster.players =
      Array.isArray(base.roster.players)
        ? base.roster.players
            .slice(0, ROSTER_SIZE)
            .map(clonePlayer)
            .filter(Boolean)
        : [];

    base.roster.results =
      Array.isArray(base.roster.results)
        ? base.roster.results.slice(0, SEASON_MATCHES)
        : [];

    base.roster.standings =
      Array.isArray(base.roster.standings)
        ? base.roster.standings
        : [];

    base.superSquad.collection =
      Array.isArray(base.superSquad.collection)
        ? base.superSquad.collection
            .map(clonePlayer)
            .filter(Boolean)
        : [];

    base.superSquad.lineup =
      Array.isArray(base.superSquad.lineup)
        ? base.superSquad.lineup
            .map(clonePlayer)
            .filter(Boolean)
        : [];

    base.superSquad.lineup =
      uniqueById(base.superSquad.lineup)
        .filter(player =>
          base.superSquad.collection.some(
            collected => collected.id === player.id
          )
        );

    base.superSquad.difficulty =
      DIFFICULTY[base.superSquad.difficulty]
        ? base.superSquad.difficulty
        : DEFAULT_DIFFICULTY;

    return base;
  }

  function uniqueById(list) {
    const seen = new Set();

    return (list || []).filter(player => {
      const key = player.id || player.name;

      if (seen.has(key))
        return false;

      seen.add(key);
      return true;
    });
  }

  function save() {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(game)
      );
    } catch (_) {
      notify(
        "Save storage is unavailable in this browser."
      );
    }
  }

  function load() {
    try {
      const raw =
        localStorage.getItem(SAVE_KEY);

      if (raw)
        game = normalize(JSON.parse(raw));

    } catch (_) {
      game = makeDefaultGame();
    }
  }

  function resetSave() {
    game = makeDefaultGame();

    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (_) {}

    renderAll();
    showScreen("mainMenu");
    notify("Game reset.");
  }

  function notify(message) {
    const el = $("notification");

    if (!el)
      return;

    el.textContent = message;
    el.style.display = "block";

    clearTimeout(notify.timer);

    notify.timer = setTimeout(() => {
      el.style.display = "none";
    }, 3200);
  }

  function showScreen(screenId) {
    document
      .querySelectorAll(".screen")
      .forEach(el => {
        el.classList.add("hidden");
        el.classList.remove("active");
        el.style.display = "none";
      });

    const screen = $(screenId);

    if (screen) {
      screen.classList.remove("hidden");
      screen.classList.add("active");
      screen.style.display = "block";
    }

    game.activeMode = screenId;
    save();
  }

  window.openMode = mode => {
    if (mode === "rosterMode")
      openRoster();
    else if (mode === "superSquadMode")
      openSuper();
    else
      showScreen("mainMenu");
  };

  window.resetGame = resetSave;

  function ensureRosterControls() {
    const teamSelect = $("rosterTeam");

    if (!teamSelect)
      return;

    if (!$("rosterLeague")) {
      const wrapper =
        teamSelect.parentElement || teamSelect;

      const leagueSelect =
        document.createElement("select");

      leagueSelect.id = "rosterLeague";

      leagueSelect.innerHTML = `
        <option value="Premier League">
          Premier League
        </option>
        <option value="LaLiga">
          LaLiga
        </option>
      `;

      wrapper.insertBefore(
        leagueSelect,
        teamSelect
      );

      leagueSelect.addEventListener(
        "change",
        () => {
          game.roster.league =
            leagueSelect.value;

          game.roster.team = "";
          game.roster.players = [];

          populateRosterTeams();
          renderRosterPlayers();
        }
      );
    }
  }

  function populateRosterTeams() {
    const leagueSelect =
      $("rosterLeague");

    const teamSelect =
      $("rosterTeam");

    if (!teamSelect)
      return;

    const oldTeam =
      game.roster.team;

    const league =
      leagueSelect
        ? leagueSelect.value
        : game.roster.league;

    const teams =
      leagueTeams(league);

    teamSelect.innerHTML =
      `<option value="">
        Choose a team
      </option>` +
      teams
        .map(team =>
          `<option value="${esc(team)}">
            ${esc(team)}
          </option>`
        )
        .join("");

    if (teams.includes(oldTeam))
      teamSelect.value = oldTeam;

    teamSelect.onchange = () => {
      game.roster.team =
        teamSelect.value;

      game.roster.players = [];

      renderRosterPlayers();
      save();
    };
  }

  function openRoster() {
    showScreen("rosterMode");

    ensureRosterControls();

    const league =
      $("rosterLeague");

    if (league)
      league.value = game.roster.league;

    populateRosterTeams();
    renderRosterPlayers();
    renderRosterSeason();
  }

  function renderRosterPlayers() {
    const box =
      $("rosterPlayers");

    if (!box)
      return;

    const team =
      game.roster.team;

    const players =
      team
        ? playersForTeam(
            team,
            game.roster.league
          )
        : [];

    const selected =
      new Set(
        game.roster.players.map(
          player => player.id
        )
      );

    box.innerHTML =
      players.map((player, index) => `
        <button
          type="button"
          class="player-card ${
            selected.has(player.id)
              ? "selected"
              : ""
          }"
          data-roster-index="${index}"
        >
          <strong>
            ${esc(player.name)}
          </strong>

          <span>
            ${esc(player.position || "Player")}
            •
            ${clamp(player.rating, 1, 99)}
          </span>
        </button>
      `).join("");

    box
      .querySelectorAll("[data-roster-index]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            const player =
              players[
                Number(
                  button.dataset.rosterIndex
                )
              ];

            if (!player)
              return;

            const existing =
              game.roster.players.findIndex(
                p => p.id === player.id
              );

            if (existing >= 0) {
              game.roster.players.splice(
                existing,
                1
              );
            } else {
              if (
                game.roster.players.length >=
                ROSTER_SIZE
              ) {
                notify(
                  `You can select exactly ${ROSTER_SIZE} players.`
                );

                return;
              }

              game.roster.players.push(
                clonePlayer(player)
              );
            }

            updateRosterCount();
            renderRosterPlayers();
            save();
          }
        );
      });

    updateRosterCount();
  }

  function updateRosterCount() {
    const el =
      $("selectedCount");

    if (el)
      el.textContent =
        `${game.roster.players.length}/${ROSTER_SIZE}`;
  }

  function startRoster() {
    if (!game.roster.team) {
      notify("Choose a team first.");
      return;
    }

    if (
      game.roster.players.length !==
      ROSTER_SIZE
    ) {
      notify(
        `Pick exactly ${ROSTER_SIZE} players.`
      );

      return;
    }

    game.roster.match = 0;
    game.roster.points = 0;
    game.roster.wins = 0;
    game.roster.draws = 0;
    game.roster.losses = 0;
    game.roster.results = [];

    game.roster.standings =
      makeStandings(
        game.roster.league,
        game.roster.team
      );

    save();
    renderRosterSeason();

    notify("Season started!");
  }

  window.startRosterSeason =
    startRoster;

  function rosterOpponent() {
    const teams =
      leagueTeams(
        game.roster.league
      ).filter(
        team => team !== game.roster.team
      );

    if (!teams.length)
      return "League Opponent";

    return teams[
      game.roster.match %
      teams.length
    ];
  }

  function average(players) {
    if (!players.length)
      return 0;

    return players.reduce(
      (total, player) =>
        total +
        clamp(player.rating, 1, 99),
      0
    ) / players.length;
  }

  function simulate(teamA, teamB) {
    const ratingA =
      clamp(
        average(teamA),
        50,
        99
      );

    const ratingB =
      clamp(
        average(teamB),
        50,
        99
      );

    const goalsA =
      clamp(
        Math.round(
          Math.random() * 3 +
          (ratingA - ratingB) / 18
        ),
        0,
        5
      );

    const goalsB =
      clamp(
        Math.round(
          Math.random() * 3 +
          (ratingB - ratingA) / 18
        ),
        0,
        5
      );

    return {
      aGoals: goalsA,
      bGoals: goalsB
    };
  }

  function playRoster() {
    if (
      game.roster.players.length !==
      ROSTER_SIZE
    ) {
      notify(
        `Pick exactly ${ROSTER_SIZE} players.`
      );

      return;
    }

    if (
      game.roster.match >=
      SEASON_MATCHES
    ) {
      notify(
        "The season is already finished."
      );

      return;
    }

    const opponent =
      rosterOpponent();

    const opponentPlayers =
      playersForTeam(
        opponent,
        game.roster.league
      );

    const score =
      simulate(
        game.roster.players,
        opponentPlayers
      );

    const result =
      score.aGoals > score.bGoals
        ? "win"
        : score.aGoals < score.bGoals
          ? "loss"
          : "draw";

    const points =
      result === "win"
        ? 100
        : result === "draw"
          ? 50
          : 0;

    if (result === "win")
      game.roster.wins++;

    if (result === "draw")
      game.roster.draws++;

    if (result === "loss")
      game.roster.losses++;

    game.roster.points += points;
    game.roster.match++;

    game.roster.results.push({
      match: game.roster.match,
      opponent,
      score:
        `${score.aGoals}-${score.bGoals}`,
      result,
      points
    });

    updateStandingsAfterMatch(
      opponent,
      result,
      score
    );

    save();
    renderRosterSeason();

    notify(
      `${game.roster.team} ${
        result === "win"
          ? "beat"
          : result === "draw"
            ? "drew with"
            : "lost to"
      } ${opponent} ${
        score.aGoals
      }-${score.bGoals} — ${
        points
      } points`
    );
  }

  window.playRosterMatch =
    playRoster;

  function makeStandings(
    league,
    userTeam
  ) {
    return leagueTeams(league).map(
      team => ({
        team,
        played: 0,
        wins
