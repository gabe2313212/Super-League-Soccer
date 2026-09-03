/* =========================================================
   SUPER LEAGUE SOCCER
   COMPLETE GAME.JS
   ========================================================= */

let game = {
    roster: {
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
        lastResult: null,
        opponents: [],
        standings: []
    },

    superSquad: {
        teamName: "",
        players: [],
        points: 100,
        wins: 0,
        draws: 0,
        losses: 0,
        mode: "easy",
        seasonMatch: 0,
        started: false
    }
};


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function get(id) {
    return document.getElementById(id);
}

function safeText(text) {
    if (typeof escapeHTML === "function") {
        return escapeHTML(String(text));
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/* =========================================================
   SAVE / LOAD
   ========================================================= */

function saveGameState() {

    try {
        localStorage.setItem(
            "superLeagueSoccerSave",
            JSON.stringify(game)
        );
    } catch (error) {
        console.error("Could not save game:", error);
    }
}

function loadGameState() {

    try {

        const saved = localStorage.getItem(
            "superLeagueSoccerSave"
        );

        if (!saved) return;

        const parsed = JSON.parse(saved);

        if (parsed && typeof parsed === "object") {

            game = {
                ...game,
                ...parsed,

                roster: {
                    ...game.roster,
                    ...(parsed.roster || {})
                },

                superSquad: {
                    ...game.superSquad,
                    ...(parsed.superSquad || {})
                }
            };
        }

    } catch (error) {

        console.error("Could not load save:", error);

    }
}


/* =========================================================
   NOTIFICATION
   ========================================================= */

function notify(message) {

    const box = get("notification");

    if (!box) {
        alert(message);
        return;
    }

    box.textContent = message;
    box.style.display = "block";

    setTimeout(function () {
        box.style.display = "none";
    }, 3000);
}


/* =========================================================
   SCREEN CONTROL
   ========================================================= */

function showScreen(id) {

    document.querySelectorAll(".screen").forEach(screen => {

        screen.classList.remove("active");
        screen.classList.add("hidden");
        screen.style.display = "none";

    });

    const screen = get(id);

    if (!screen) {
        console.error("Screen does not exist:", id);
        return;
    }

    screen.classList.remove("hidden");
    screen.classList.add("active");
    screen.style.display = "block";
}


/* =========================================================
   MAIN MENU
   ========================================================= */

window.openMode = function (mode) {

    if (mode === "rosterMode") {

        openRosterMode();
        return;

    }

    if (mode === "superSquadMode") {

        openSuperSquadMode();
        return;

    }

};


/* =========================================================
   STARTUP
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadGameState();

    setupButtons();

    createRosterLeagueSelector();

    showScreen("mainMenu");

    renderEverything();

});


/* =========================================================
   BUTTONS
   ========================================================= */

function setupButtons() {

    const reset = get("resetGame");

    if (reset) {

        reset.onclick = function () {

            resetGame();

        };

    }


    const startRoster = get("startRosterSeason");

    if (startRoster) {

        startRoster.onclick = function () {

            startRosterSeason();

        };

    }


    const playRoster = get("playRosterMatch");

    if (playRoster) {

        playRoster.onclick = function () {

            playRosterMatch();

        };

    }


    const createTeam = get("createTeamButton");

    if (createTeam) {

        createTeam.onclick = function () {

            createSuperSquad();

        };

    }


    const bronze = get("bronzePack");

    if (bronze) {

        bronze.onclick = function () {

            openPack("bronze");

        };

    }


    const gold = get("goldPack");

    if (gold) {

        gold.onclick = function () {

            openPack("gold");

        };

    }


    const superMatch = get("playSuperMatch");

    if (superMatch) {

        superMatch.onclick = function () {

            playSuperMatch();

        };

    }


    const rosterTeam = get("rosterTeam");

    if (rosterTeam) {

        rosterTeam.onchange = function () {

            game.roster.team = this.value;

            game.roster.players = [];

            loadRosterPlayers();

            saveGameState();

        };

    }

}


/* =========================================================
   ROSTER LEAGUE SELECTOR
   ========================================================= */

function createRosterLeagueSelector() {

    const teamSelect = get("rosterTeam");

    if (!teamSelect) return;

    if (get("rosterLeague")) return;

    const label = document.createElement("label");

    label.textContent = "Choose League";

    label.style.display = "block";
    label.style.marginBottom = "6px";
    label.style.fontWeight = "bold";

    const select = document.createElement("select");

    select.id = "rosterLeague";

    select.innerHTML = `
        <option value="">Choose a league...</option>
        <option value="Premier League">Premier League</option>
        <option value="LaLiga">LaLiga</option>
    `;

    select.onchange = function () {

        game.roster.league = this.value;
        game.roster.team = "";
        game.roster.players = [];

        populateRosterTeams();

        saveGameState();

    };

    teamSelect.parentNode.insertBefore(
        label,
        teamSelect
    );

    teamSelect.parentNode.insertBefore(
        select,
        teamSelect
    );
}


/* =========================================================
   ROSTER MODE
   ========================================================= */

function openRosterMode() {

    showScreen("rosterMode");

    createRosterLeagueSelector();

    const league = get("rosterLeague");

    if (league) {

        league.value =
            game.roster.league || "";

    }

    populateRosterTeams();

    const team = get("rosterTeam");

    if (team && game.roster.team) {

        team.value =
            game.roster.team;

        loadRosterPlayers();

    }

    updateRosterCount();
    updateRosterStartButton();

}


/* =========================================================
   POPULATE ROSTER TEAMS
   ========================================================= */

function populateRosterTeams() {

    const select = get("rosterTeam");

    if (!select) return;

    const currentTeam =
        game.roster.team;

    select.innerHTML = `
        <option value="">Choose a team...</option>
    `;

    let teams = [];

    if (
        game.roster.league ===
        "Premier League"
    ) {

        teams =
            Array.isArray(CONFIG.premierLeagueTeams)
                ? CONFIG.premierLeagueTeams
                : [];

    }

    if (
        game.roster.league ===
        "LaLiga"
    ) {

        teams =
            Array.isArray(CONFIG.laLigaTeams)
                ? CONFIG.laLigaTeams
                : [];

    }

    teams.forEach(teamName => {

        const option =
            document.createElement("option");

        option.value = teamName;
        option.textContent = teamName;

        select.appendChild(option);

    });

    if (teams.includes(currentTeam)) {

        select.value = currentTeam;

    }

}


/* =========================================================
   LOAD PLAYERS
   ========================================================= */

function loadRosterPlayers() {

    const container =
        get("rosterPlayers");

    if (!container) return;

    container.innerHTML = "";

    const team =
        game.roster.team;

    if (!team) {

        updateRosterCount();
        updateRosterStartButton();

        return;

    }

    let players = [];

    try {

        if (
            typeof getPlayersFromTeam ===
            "function"
        ) {

            players =
                getPlayersFromTeam(team);

        }

    } catch (error) {

        console.error(error);

    }


    /*
       Fallback if the team doesn't have
       enough players in the data.
    */

    if (
        !Array.isArray(players) ||
        players.length < 6
    ) {

        try {

            if (
                typeof generateClubPlayers ===
                "function"
            ) {

                const generated =
                    generateClubPlayers(
                        team,
                        game.roster.league
                    );

                if (
                    Array.isArray(generated)
                ) {

                    players = generated;

                }

            }

        } catch (error) {

            console.error(error);

        }

    }


    if (!Array.isArray(players)) {

        players = [];

    }


    players.forEach(player => {

        const card =
            document.createElement("button");

        card.type = "button";
        card.className = "player-card";

        const rating =
            player.rating ||
            player.overall ||
            75;

        const alreadySelected =
            game.roster.players.some(
                p => p.name === player.name
            );

        if (alreadySelected) {

            card.classList.add("selected");

        }

        card.innerHTML = `
            <strong>
                ${safeText(player.name || "Unknown")}
            </strong>

            <span>
                Rating: ${rating}
            </span>
        `;

        card.onclick = function () {

            selectRosterPlayer(
                player,
                card
            );

        };

        container.appendChild(card);

    });


    updateRosterCount();
    updateRosterStartButton();

}


/* =========================================================
   SELECT ROSTER PLAYER
   ========================================================= */

function selectRosterPlayer(player, card) {

    const already =
        game.roster.players.some(
            p => p.name === player.name
        );


    if (already) {

        game.roster.players =
            game.roster.players.filter(
                p => p.name !== player.name
            );

        card.classList.remove("selected");

    } else {

        if (
            game.roster.players.length >= 6
        ) {

            notify(
                "You can only select 6 players."
            );

            return;

        }

        game.roster.players.push(player);

        card.classList.add("selected");

    }


    updateRosterCount();
    updateRosterStartButton();

    saveGameState();

}


/* =========================================================
   ROSTER COUNT
   ========================================================= */

function updateRosterCount() {

    const counter =
        get("selectedCount");

    if (!counter) return;

    counter.textContent =
        game.roster.players.length;

}


/* =========================================================
   START BUTTON
   ========================================================= */

function updateRosterStartButton() {

    const button =
        get("startRosterSeason");

    if (!button) return;

    const ready =
        game.roster.league &&
        game.roster.team &&
        game.roster.players.length === 6;

    button.disabled = !ready;

}


/* =========================================================
   START ROSTER SEASON
   ========================================================= */

function startRosterSeason() {

    if (!game.roster.league) {

        notify("Choose a league first.");

        return;

    }


    if (!game.roster.team) {

        notify("Choose a team first.");

        return;

    }


    if (
        game.roster.players.length !== 6
    ) {

        notify(
            "Choose exactly 6 players."
        );

        return;

    }


    /*
       Reset season statistics.
    */

    game.roster.match = 0;
    game.roster.wins = 0;
    game.roster.draws = 0;
    game.roster.losses = 0;
    game.roster.points = 0;
    game.roster.started = true;
    game.roster.finished = false;
    game.roster.lastResult = null;


    createRosterSchedule();

    saveGameState();

    renderRosterSeason();

    notify(
        "Season started!"
    );

}


/* =========================================================
   CREATE SEASON SCHEDULE
   ========================================================= */

function createRosterSchedule() {

    let teams = [];

    if (
        game.roster.league ===
        "Premier League"
    ) {

        teams =
            [...CONFIG.premierLeagueTeams];

    }

    if (
        game.roster.league ===
        "LaLiga"
    ) {

        teams =
            [...CONFIG.laLigaTeams];

    }


    /*
       Remove user's own team.
    */

    teams =
        teams.filter(
            team =>
                team !== game.roster.team
        );


    /*
       Shuffle opponents.
    */

    teams.sort(
        () => Math.random() - 0.5
    );


    /*
       A 19-match season.
    */

    game.roster.opponents = [];


    for (
        let i = 0;
        i < 19;
        i++
    ) {

        game.roster.opponents.push(
            teams[i % teams.length]
        );

    }

}


/* =========================================================
   ROSTER SEASON HUB
   ========================================================= */

function renderRosterSeason() {

    const season =
        get("rosterSeason");

    if (!season) return;


    if (!game.roster.started) {

        season.innerHTML = "";

        return;

    }


    if (game.roster.finished) {

        renderFinalPresentations();

        return;

    }


    const matchNumber =
        game.roster.match + 1;

    const opponent =
        game.roster.opponents[
            game.roster.match
        ] || "League Opponent";


    season.innerHTML = `

        <div class="game-card">

            <h2>
                ${safeText(game.roster.team)}
                — Season
            </h2>

            <p>
                ${safeText(game.roster.league)}
            </p>

            <h3>
                Match ${matchNumber} of 19
            </h3>

            <p>
                Next opponent:
                <strong>
                    ${safeText(opponent)}
                </strong>
            </p>

            <div class="stats-grid">

                <div>
                    <strong>
                        ${game.roster.wins}
                    </strong>
                    <span>Wins</span>
                </div>

                <div>
                    <strong>
                        ${game.roster.draws}
                    </strong>
                    <span>Draws</span>
                </div>

                <div>
                    <strong>
                        ${game.roster.losses}
                    </strong>
                    <span>Losses</span>
                </div>

                <div>
                    <strong>
                        ${game.roster.points}
                    </strong>
                    <span>Points</span>
                </div>

            </div>


            <div style="
                display:flex;
                gap:12px;
                flex-wrap:wrap;
                margin-top:20px;
            ">

                <button
                    id="seasonPlayButton"
                    class="main-button primary-button"
                >
                    ⚽ Play Match
                </button>

                <button
                    id="seasonPresentationsButton"
                    class="main-button"
                >
                    📊 Go to Presentations
                </button>

            </div>

            <div
                id="seasonMatchResult"
                style="margin-top:20px;"
            ></div>

        </div>

    `;


    /*
       Play Match button.
    */

    const play =
        get("seasonPlayButton");

    if (play) {

        play.onclick = function () {

            playRosterMatch();

        };

    }


    /*
       Presentations button.
       THIS SKIPS THE REST OF THE SEASON.
    */

    const presentations =
        get(
            "seasonPresentationsButton"
        );

    if (presentations) {

        presentations.onclick =
            function () {

                skipToPresentations();

            };

    }


    /*
       Show last match result.
    */

    if (game.roster.lastResult) {

        const result =
            get("seasonMatchResult");

        if (result) {

            result.innerHTML = `
                <
