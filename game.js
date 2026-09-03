/* =========================================================
   SUPER LEAGUE SOCCER
   COMPLETE / SAFE GAME.JS
   ========================================================= */

(function () {
    "use strict";

    const SAVE_KEY = "superLeagueSoccerSave";

    const ROSTER_SIZE = 6;
    const SUPER_SQUAD_SIZE = 11;
    const SEASON_MATCHES = 19;

    const LEAGUES = {
        premier: "Premier League",
        laliga: "LaLiga"
    };

    const MODES = {
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

    /* =====================================================
       30 ICONS
       ===================================================== */

    const ICONS = [
        ["Paolo Maldini", 95],
        ["Thierry Henry", 94],
        ["Zinedine Zidane", 95],
        ["Ronaldo Nazario", 96],
        ["Ronaldinho", 94],
        ["David Beckham", 92],
        ["Andrea Pirlo", 93],
        ["Xavi", 94],
        ["Lionel Messi", 96],
        ["Cristiano Ronaldo", 96],
        ["Pele", 98],
        ["Diego Maradona", 97],
        ["Johan Cruyff", 95],
        ["Franz Beckenbauer", 95],
        ["Lev Yashin", 94],
        ["George Best", 94],
        ["Bobby Charlton", 94],
        ["Garrincha", 95],
        ["Marco van Basten", 94],
        ["Ruud Gullit", 93],
        ["Patrick Vieira", 91],
        ["Roberto Carlos", 92],
        ["Cafu", 91],
        ["Alessandro Nesta", 92],
        ["Fabio Cannavaro", 91],
        ["Iker Casillas", 93],
        ["Peter Schmeichel", 92],
        ["Luis Figo", 93],
        ["Kaka", 92],
        ["Samuel Eto'o", 92]
    ];

    /* =====================================================
       DEFAULT STATE
       ===================================================== */

    function newRoster() {
        return {
            league: "",
            team: "",
            players: [],
            match: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            points: 0,
            started: false,
            finished: false,
            opponents: [],
            matchHistory: [],
            standings: []
        };
    }

    function newSuperSquad() {
        return {
            teamName: "",
            players: [],
            lineup: [],
            points: 100,
            wins: 0,
            draws: 0,
            losses: 0,
            mode: "easy",
            started: false
        };
    }

    function newGame() {
        return {
            roster: newRoster(),
            superSquad: newSuperSquad()
        };
    }

    let game = newGame();

    /* =====================================================
       SAFE HELPERS
       ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }

    function safeText(value) {
        if (typeof escapeHTML === "function") {
            return escapeHTML(String(value ?? ""));
        }

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function rating(player) {
        if (!player) return 75;

        const value =
            player.rating ??
            player.overall ??
            75;

        const result = Number(value);

        return Number.isFinite(result)
            ? result
            : 75;
    }

    function playerName(player) {
        return player && player.name
            ? String(player.name)
            : "Unknown Player";
    }

    function randomInt(min, max) {
        min = Math.ceil(Number(min));
        max = Math.floor(Number(max));

        if (!Number.isFinite(min)) min = 0;
        if (!Number.isFinite(max)) max = min;

        return Math.floor(
            Math.random() * (max - min + 1)
        ) + min;
    }

    function shuffle(array) {
        const copy = Array.isArray(array)
            ? [...array]
            : [];

        for (let i = copy.length - 1; i > 0; i--) {
            const j = randomInt(0, i);

            const temp = copy[i];

            copy[i] = copy[j];
            copy[j] = temp;
        }

        return copy;
    }

    function clonePlayer(player) {
        if (!player) return null;

        return {
            name: player.name || "Unknown Player",
            rating: rating(player),
            rarity: player.rarity || "Common",
            position: player.position || "MID",
            team: player.team || "",
            league: player.league || ""
        };
    }

    /* =====================================================
       CONFIG SAFETY
       ===================================================== */

    function getConfig() {
        try {
            if (typeof CONFIG !== "undefined") {
                return CONFIG;
            }
        } catch (error) {
            console.warn(error);
        }

        return {};
    }

    function getTeams(league) {
        const config = getConfig();

        if (league === LEAGUES.premier) {
            return Array.isArray(config.premierLeagueTeams)
                ? [...config.premierLeagueTeams]
                : [];
        }

        if (league === LEAGUES.laliga) {
            return Array.isArray(config.laLigaTeams)
                ? [...config.laLigaTeams]
                : [];
        }

        return [];
    }

    function getAllPlayers() {
        const config = getConfig();

        return Array.isArray(config.players)
            ? config.players
            : [];
    }

    /* =====================================================
       SAVE
       ===================================================== */

    function saveGame() {
        try {
            localStorage.setItem(
                SAVE_KEY,
                JSON.stringify(game)
            );
        } catch (error) {
            console.warn(
                "Could not save game.",
                error
            );
        }
    }

    /* =====================================================
       LOAD
       ===================================================== */

    function loadGame() {
        try {
            const saved =
                localStorage.getItem(SAVE_KEY);

            if (!saved) return;

            const data =
                JSON.parse(saved);

            if (
                !data ||
                typeof data !== "object"
            ) {
                return;
            }

            const fresh =
                newGame();

            game = {
                roster: {
                    ...fresh.roster,
                    ...(data.roster || {})
                },

                superSquad: {
                    ...fresh.superSquad,
                    ...(data.superSquad || {})
                }
            };

            if (
                !Array.isArray(
                    game.roster.players
                )
            ) {
                game.roster.players = [];
            }

            if (
                !Array.isArray(
                    game.roster.opponents
                )
            ) {
                game.roster.opponents = [];
            }

            if (
                !Array.isArray(
                    game.roster.matchHistory
                )
            ) {
                game.roster.matchHistory = [];
            }

            if (
                !Array.isArray(
                    game.roster.standings
                )
            ) {
                game.roster.standings = [];
            }

            if (
                !Array.isArray(
                    game.superSquad.players
                )
            ) {
                game.superSquad.players = [];
            }

            if (
                !Array.isArray(
                    game.superSquad.lineup
                )
            ) {
                game.superSquad.lineup = [];
            }

            if (!MODES[game.superSquad.mode]) {
                game.superSquad.mode = "easy";
            }

        } catch (error) {

            console.warn(
                "Save file was damaged. Starting a fresh game.",
                error
            );

            game = newGame();
        }
    }

    /* =====================================================
       NOTIFICATION
       ===================================================== */

    function notify(message) {

        const box =
            $("notification");

        if (!box) {
            console.log(message);
            return;
        }

        box.textContent = message;
        box.style.display = "block";

        clearTimeout(
            window.__slsNotification
        );

        window.__slsNotification =
            setTimeout(function () {
                box.style.display = "none";
            }, 3500);
    }

    /* =====================================================
       SCREEN SYSTEM
       ===================================================== */

    function showScreen(id) {

        const screens =
            document.querySelectorAll(".screen");

        screens.forEach(function (screen) {
            screen.classList.remove("active");
            screen.classList.add("hidden");
            screen.style.display = "none";
        });

        const screen =
            $(id);

        if (!screen) {
            console.error(
                "Missing screen:",
                id
            );

            return false;
        }

        screen.classList.remove("hidden");
        screen.classList.add("active");
        screen.style.display = "block";

        return true;
    }

    /* =====================================================
       MENU
       ===================================================== */

    window.openMode = function (mode) {

        if (mode === "rosterMode") {
            openRosterMode();
            return;
        }

        if (mode === "superSquadMode") {
            openSuperSquadMode();
            return;
        }

        if (mode === "mainMenu") {
            showScreen("mainMenu");
            return;
        }

        showScreen("mainMenu");
    };

    /* =====================================================
       ROSTER LEAGUE SELECTOR
       ===================================================== */

    function createLeagueSelector() {

        const teamSelect =
            $("rosterTeam");

        if (
            !teamSelect ||
            $("rosterLeague")
        ) {
            return;
        }

        const wrapper =
            document.createElement("div");

        wrapper.id =
            "rosterLeagueWrapper";

        wrapper.style.marginBottom =
            "15px";

        const label =
            document.createElement("label");

        label.textContent =
            "Choose League";

        label.style.display =
            "block";

        label.style.fontWeight =
            "bold";

        label.style.marginBottom =
            "6px";

        const select =
            document.createElement("select");

        select.id =
            "rosterLeague";

        select.innerHTML = `
            <option value="">
                Choose a league...
            </option>

            <option value="Premier League">
                Premier League
            </option>

            <option value="LaLiga">
                LaLiga
            </option>
        `;

        select.onchange =
            function () {

                game.roster.league =
                    select.value;

                game.roster.team =
                    "";

                game.roster.players =
                    [];

                populateTeams();
                renderRosterPlayers();
                updateRosterControls();

                saveGame();
            };

        wrapper.appendChild(label);
        wrapper.appendChild(select);

        teamSelect.parentNode.insertBefore(
            wrapper,
            teamSelect
        );
    }

    /* =====================================================
       TEAM SELECTOR
       ===================================================== */

    function populateTeams() {

        const select =
            $("rosterTeam");

        if (!select) return;

        const current =
            game.roster.team;

        select.innerHTML = `
            <option value="">
                Choose a team...
            </option>
        `;

        const teams =
            getTeams(
                game.roster.league
            );

        teams.forEach(function (team) {

            const option =
                document.createElement("option");

            option.value =
                team;

            option.textContent =
                team;

            select.appendChild(option);
        });

        if (
            current &&
            teams.includes(current)
        ) {
            select.value =
                current;
        }
    }

    /* =====================================================
       OPEN BUILD A ROSTER
       ===================================================== */

    function openRosterMode() {

        if (!showScreen("rosterMode")) {
            return;
        }

        createLeagueSelector();

        const league =
            $("rosterLeague");

        if (league) {
            league.value =
                game.roster.league || "";
        }

        populateTeams();

        const team =
            $("rosterTeam");

        if (
            team &&
            game.roster.team
        ) {
            team.value =
                game.roster.team;
        }

        renderRosterPlayers();
        updateRosterControls();
        renderRosterSeason();

    }

    /* =====================================================
       GET TEAM PLAYERS
       ===================================================== */

    function getTeamPlayers(team, league) {

        let players = [];

        try {

            if (
                typeof getPlayersFromTeam ===
                "function"
            ) {
                players =
                    getPlayersFromTeam(team) || [];
            }

        } catch (error) {

            console.warn(
                "Player lookup failed:",
                error
            );

        }

        if (!Array.isArray(players)) {
            players = [];
        }

        players =
            players
                .map(clonePlayer)
                .filter(Boolean);

        /*
         * Existing utility fallback.
         */

        if (
            players.length <
            ROSTER_SIZE
        ) {

            try {

                if (
                    typeof generateClubPlayers ===
                    "function"
                ) {

                    const generated =
                        generateClubPlayers(
                            team,
                            league
                        );

                    if (
                        Array.isArray(generated)
                    ) {

                        generated.forEach(
                            function (player) {

                                const copy =
                                    clonePlayer(player);

                                if (
                                    copy &&
                                    !players.some(
                                        function (p) {
                                            return (
                                                playerName(p) ===
                                                playerName(copy)
                                            );
                                        }
                                    )
                                ) {
                                    players.push(copy);
                                }

                            }
                        );
                    }
                }

            } catch (error) {

                console.warn(
                    "Generated players failed:",
                    error
                );

            }
        }

        /*
         * Last-resort players.
         * This guarantees that every team can be selected.
         */

        const fallback =
            [
                "Squad Player 1",
                "Squad Player 2",
                "Squad Player 3",
                "Squad Player 4",
                "Squad Player 5",
                "Squad Player 6",
                "Squad Player 7",
                "Squad Player 8",
                "Squad Player 9",
                "Squad Player 10",
                "Squad Player 11",
                "Squad Player 12"
            ];

        fallback.forEach(
            function (name, index) {

                if (players.length >= 12) {
                    return;
                }

                players.push({
                    name: name,
                    rating: randomInt(72, 82),
                    rarity: "Common",
                    position:
                        index < 4
                            ? "DEF"
                            : "MID",
                    team: team,
                    league: league
                });

            }
        );

        return players;
    }

    /* =====================================================
       DISPLAY ROSTER PLAYERS
       ===================================================== */

    function renderRosterPlayers() {

        const container =
            $("rosterPlayers");

        if (!container) return;

        container.innerHTML = "";

        if (!game.roster.league) {

            container.innerHTML =
                "<p>Choose a league first.</p>";

            return;
        }

        if (!game.roster.team) {

            container.innerHTML =
                "<p>Choose a team first.</p>";

            return;
        }

        const players =
            getTeamPlayers(
                game.roster.team,
                game.roster.league
            );

        players.forEach(
            function (player) {

                const button =
                    document.createElement("button");

                button.type =
                    "button";

                button.className =
                    "player-card";

                const selected =
                    game.roster.players.some(
                        function (p) {
                            return (
                                playerName(p) ===
                                playerName(player)
                            );
                        }
                    );

                if (selected) {
                    button.classList.add(
                        "selected"
                    );
                }

                button.innerHTML = `
                    <strong>
                        ${safeText(
                            playerName(player)
                        )}
                    </strong>

                    <span>
                        Rating:
                        ${rating(player)}
                    </span>
                `;

                button.onclick =
                    function () {

                        toggleRosterPlayer(
                            player
                        );

                    };

                container.appendChild(
                    button
                );

            }
        );

        updateRosterControls();
    }

    /* =====================================================
       SELECT 6 PLAYERS
       ===================================================== */

    function toggleRosterPlayer(player) {

        const name =
            playerName(player);

        const existing =
            game.roster.players.findIndex(
                function (p) {
                    return (
                        playerName(p) ===
                        name
                    );
                }
            );

        if (existing >= 0) {

            game.roster.players.splice(
                existing,
                1
            );

        } else {

            if (
                game.roster.players.length >=
                ROSTER
