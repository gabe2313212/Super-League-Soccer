// ==========================================
// SUPER LEAGUE SOCCER - GAME.JS
// ==========================================

// ---------- GLOBAL GAME DATA ----------

let game = {
    mode: null,

    roster: {
        league: "Premier League",
        team: "",
        players: [],
        season: {
            currentMatch: 0,
            points: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            history: []
        }
    },

    superSquad: {
        teamName: "",
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        lineup: [],
        collection: [],
        difficulty: "Easy",
        season: {
            currentMatch: 0,
            history: []
        }
    }
};


// ---------- HELPERS ----------

function $(id) {
    return document.getElementById(id);
}

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.add("hidden");
        screen.classList.remove("active");
    });

    const screen = $(id);

    if (screen) {
        screen.classList.remove("hidden");
        screen.classList.add("active");
    }
}

function notify(message) {
    const box = $("notification");

    if (!box) {
        alert(message);
        return;
    }

    box.textContent = message;
    box.classList.remove("hidden");

    setTimeout(() => {
        box.classList.add("hidden");
    }, 3000);
}


// ---------- NAVIGATION ----------

function openMode(mode) {
    game.mode = mode;

    if (mode === "mainMenu") {
        showScreen("mainMenu");
        return;
    }

    if (mode === "rosterMode") {
        showScreen("rosterMode");
        setupRosterMode();
        return;
    }

    if (mode === "superSquadMode") {
        showScreen("superSquadMode");
        setupSuperSquadMode();
        return;
    }
}


// ---------- ROSTER MODE ----------

function setupRosterMode() {

    const teamSelect = $("rosterTeam");

    if (!teamSelect) return;

    teamSelect.innerHTML = "";

    const leagueSelect = document.createElement("select");
    leagueSelect.id = "rosterLeague";

    leagueSelect.innerHTML = `
        <option value="Premier League">Premier League</option>
        <option value="LaLiga">LaLiga</option>
    `;

    teamSelect.parentNode.insertBefore(
        leagueSelect,
        teamSelect
    );

    leagueSelect.addEventListener("change", () => {
        game.roster.league = leagueSelect.value;
        loadRosterTeams();
    });

    game.roster.league = "Premier League";

    loadRosterTeams();
}

function loadRosterTeams() {

    const teamSelect = $("rosterTeam");

    if (!teamSelect) return;

    teamSelect.innerHTML = "";

    let teams = [];

    if (game.roster.league === "Premier League") {
        teams = CONFIG.premierLeagueTeams || [];
    } else {
        teams = CONFIG.laLigaTeams || [];
    }

    teams.forEach(team => {

        const option = document.createElement("option");

        option.value = team;
        option.textContent = team;

        teamSelect.appendChild(option);
    });

    if (teams.length > 0) {
        game.roster.team = teams[0];
    }

    teamSelect.onchange = function () {
        game.roster.team = this.value;
        loadRosterPlayers();
    };

    loadRosterPlayers();
}

function loadRosterPlayers() {

    const grid = $("rosterPlayers");

    if (!grid) return;

    grid.innerHTML = "";

    const teamSelect = $("rosterTeam");

    if (teamSelect) {
        game.roster.team = teamSelect.value;
    }

    let players = getPlayersFromTeam(
        game.roster.team
    );

    if (!players || players.length < 6) {
        players = generateClubPlayers(
            game.roster.team,
            game.roster.league
        );
    }

    players.forEach((player, index) => {

        const card = document.createElement("div");

        card.className = "player-card";

        card.innerHTML = `
            <div class="player-name">
                ${escapeHTML(player.name)}
            </div>

            <div class="player-position">
                ${escapeHTML(player.position)}
            </div>

            <div class="player-rating">
                ${player.rating}
            </div>
        `;

        card.onclick = () => {

            const alreadySelected =
                game.roster.players.some(
                    p => p.name === player.name
                );

            if (alreadySelected) {

                game.roster.players =
                    game.roster.players.filter(
                        p => p.name !== player.name
                    );

                card.classList.remove("selected");

            } else {

                if (game.roster.players.length >= 6) {
                    notify("You can only select 6 players.");
                    return;
                }

                game.roster.players.push(player);
                card.classList.add("selected");
            }

            updateRosterSelection();
        };

        grid.appendChild(card);
    });

    game.roster.players = [];

    updateRosterSelection();
}

function updateRosterSelection() {

    const count = $("selectedCount");

    if (count) {
        count.textContent =
            game.roster.players.length;
    }

    const startButton =
        $("startRosterSeason");

    if (startButton) {

        startButton.disabled =
            game.roster.players.length !== 6;
    }
}


// ---------- START ROSTER SEASON ----------

function startRosterSeason() {

    if (game.roster.players.length !== 6) {

        notify(
            "Select exactly 6 players before starting."
        );

        return;
    }

    game.roster.season = {
        currentMatch: 0,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        history: []
    };

    const season =
        $("rosterSeason");

    if (season) {
        season.classList.remove("hidden");
    }

    updateRosterSeasonDisplay();

    notify("Your 19-match season has started!");
}


// ---------- ROSTER MATCH ----------

function playRosterMatch() {

    if (
        game.roster.season.currentMatch >=
        CONFIG.seasonMatches
    ) {

        notify(
            "The season is finished. Go to Presentations!"
        );

        return;
    }

    const squadRating =
        calculateSquadRating(
            game.roster.players
        );

    const opponentRating =
        generateOpponentRating();

    const result =
        simulateMatch(
            squadRating,
            opponentRating
        );

    let points = 0;

    if (result === "win") {
        points = 100;
        game.roster.season.wins++;
    }

    if (result === "draw") {
        points = 50;
        game.roster.season.draws++;
    }

    if (result === "loss") {
        points = 0;
        game.roster.season.losses++;
    }

    game.roster.season.points += points;
    game.roster.season.currentMatch++;

    const opponent =
        randomOpponent(
            game.roster.team
        );

    const homeScore =
        result === "win"
            ? randomNumber(2, 4)
            : result === "draw"
                ? randomNumber(0, 2)
                : randomNumber(0, 1);

    const awayScore =
        result === "loss"
            ? randomNumber(2, 4)
            : result === "draw"
                ? homeScore
                : randomNumber(0, 1);

    const match = {
        match:
            game.roster.season.currentMatch,

        opponent: opponent,

        result: result,

        points: points,

        homeScore: homeScore,

        awayScore: awayScore
    };

    game.roster.season.history.push(match);

    displayRosterMatch(match);

    updateRosterSeasonDisplay();

    saveGame(game);
}


// ---------- ROSTER MATCH DISPLAY ----------

function displayRosterMatch(match) {

    const title =
        $("rosterMatchTitle");

    const display =
        $("rosterMatch");

    if (title) {

        title.textContent =
            `Match ${match.match} of 19`;
    }

    if (display) {

        const resultWord =
            match.result === "win"
                ? "beat"
                : match.result === "draw"
                    ? "drew with"
                    : "lost to";

        display.innerHTML = `
            <div class="match-result">
                <h2>
                    ${escapeHTML(game.roster.team)}
                    ${resultWord}
                    ${escapeHTML(match.opponent)}
                </h2>

                <h1>
                    ${match.homeScore}
                    -
                    ${match.awayScore}
                </h1>

                <p>
                    ${match.points} points
                </p>
            </div>
        `;
    }
}


// ---------- PRESENTATIONS ----------

function goToPresentations() {

    const remaining =
        CONFIG.seasonMatches -
        game.roster.season.currentMatch;

    if (remaining <= 0) {

        showRosterPresentation();
        return;
    }

    for (let i = 0; i < remaining; i++) {
        playRosterMatch();
    }

    showRosterPresentation();
}

function showRosterPresentation() {

    const results =
        $("rosterResults");

    if (!results) return;

    results.innerHTML = `
        <div class="presentation">
            <h2>🏆 Season Presentation</h2>

            <h3>
                ${escapeHTML(game.roster.team)}
            </h3>

            <p>
                ${game.roster.season.wins}
                Wins
            </p>

            <p>
                ${game.roster.season.draws}
                Draws
            </p>

            <p>
                ${game.roster.season.losses}
                Losses
            </p>

            <h1>
                ${game.roster.season.points}
                Points
            </h1>

            <h3>Match Results</h3>

            <div>
                ${game.roster.season.history.map(match => `
                    <p>
                        Match ${match.match}:
                        ${escapeHTML(match.opponent)}
                        —
                        ${match.homeScore}-${match.awayScore}
                        —
                        ${match.points} points
                    </p>
                `).join("")}
            </div>
        </div>
    `;

    updateStandings();
}


// ---------- STANDINGS ----------

function updateStandings() {

    const body =
        $("standingsBody");

    if (!body) return;

    const teams =
        game.roster.league === "Premier League"
            ? CONFIG.premierLeagueTeams
            : CONFIG.laLigaTeams;

    body.innerHTML = "";

    teams.forEach((team, index) => {

        let points = 0;

        if (team === game.roster.team) {
            points =
                game.roster.season.points;
        } else {
            points =
                randomNumber(35, 95);
        }

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHTML(team)}</td>
            <td>${points}</td>
        `;

        body.appendChild(row);
    });
}


// ---------- ROSTER SEASON DISPLAY ----------

function updateRosterSeasonDisplay() {

    const seasonInfo =
        $("rosterSeason");

    if (!seasonInfo) return;

    seasonInfo.innerHTML = `
        <h2>
            ${escapeHTML(game.roster.team)}
        </h2>

        <p>
            Match:
            ${game.roster.season.currentMatch}
            / 19
        </p>

        <p>
            Points:
            ${game.roster.season.points}
        </p>

        <p>
            Wins:
            ${game.roster.season.wins}
        </p>

        <p>
            Draws:
            ${game.roster.season.draws}
        </p>

        <p>
            Losses:
            ${game.roster.season.losses}
        </p>

        <button onclick="goToPresentations()">
            Go to Presentations
        </button>
    `;
}


// ---------- SUPER SQUAD ----------

function setupSuperSquadMode() {

    const gameBox =
        $("superGame");

    if (!game.superSquad.teamName) {

        if (gameBox) {
            gameBox.classList.add("hidden");
        }

        return;
    }

    const createBox =
        $("createTeamBox");

    if (createBox) {
        createBox.classList.add("hidden");
    }

    if (gameBox) {
        gameBox.classList.remove("hidden");
    }

    updateSuperSquadDisplay();
}


// ---------- CREATE TEAM ----------

function createSuperTeam() {

    const input =
        $("teamName");

    if (!input) return;

    const name =
        cleanTeamName(input.value);

    if (!name) {

        notify(
            "Please enter a team name."
        );

        return;
    }

    game.superSquad.teamName =
        name;

    game.superSquad.points = 0;
    game.superSquad.wins = 0;
    game.superSquad.draws = 0;
    game.superSquad.losses = 0;

    game.superSquad.lineup = [];

    game.superSquad.collection = [];

    game.superSquad.season = {
        currentMatch: 0,
        history: []
    };

    saveGame(game);

    setupSuperSquadMode();

    notify(
        `${name} has been created!`
    );
}


// ---------- SUPER SQUAD DISPLAY ----------

function updateSuperSquadDisplay() {

    if ($("superTeamName")) {
        $("superTeamName").textContent =
            game.superSquad.teamName;
    }

    if ($("superPoints")) {
        $("superPoints").textContent =
            game.superSquad.points;
    }

    if ($("superWins")) {
        $("superWins").textContent =
            game.superSquad.wins;
    }

    if ($("superDraws")) {
        $("superDraws").textContent =
            game.superSquad.draws;
    }

    if ($("superLosses")) {
        $("superLosses").textContent =
            game.superSquad.losses;
    }

    if ($("lineupCount")) {
        $("lineupCount").textContent =
            game.superSquad.lineup.length;
    }

    displayCollection();
    displayLineup();
}


// ---------- PACKS ----------

function openBronzePack() {

    if (game.superSquad.points < 50) {

        notify(
            "You need 50 points."
        );

        return;
    }

    game.superSquad.points -= 50;

    const cards = [];

    for (let i = 0; i < 5; i++) {

        const player =
            getPackPlayer(
                "bronze"
            );

        cards.push(player);

        addToCollection(player);
    }

    displayPackResults(
        "Bronze Pack",
        cards
    );

    updateSuperSquadDisplay();

    saveGame(game);
}

function openGoldPack() {

    if (game.superSquad.points < 100) {

        notify(
            "You need 100 points."
        );

        return;
    }

    game.superSquad.points -= 100;

    const cards = [];

    for (let i = 0; i < 5; i++) {

        const player =
            getPackPlayer(
                "gold"
            );

        cards.push(player);

        addToCollection(player);
    }

    displayPackResults(
        "Gold Pack",
        cards
    );

    updateSuperSquadDisplay();

    saveGame(game);
}


// ---------- ICON PACK ----------

function openIconPack() {

    if (game.superSquad.points < 1000) {

        notify(
            "You need 1,000 points."
        );

        return;
    }

    game.superSquad.points -= 1000;

    const icon =
        getRandomIcon();

    addToCollection(icon);

    displayPackResults(
        "Icon Pack",
        [icon]
    );

    updateSuperSquadDisplay();

    saveGame(game);
}


// ---------- COLLECTION ----------

function addToCollection(player) {

    const copy = {
        ...player,
        id:
            createID()
    };

    game.superSquad.collection.push(
        copy
    );
}

function displayCollection() {

    const collection =
        $("collection");

    if (!collection) return;

    collection.innerHTML = "";

    game.superSquad.collection.forEach(
        player => {

            const card =
                document.createElement("div");

            card.className =
                "player-card";

            card.innerHTML = `
                <div>
                    ${escapeHTML(player.name)}
                </div>

                <div>
                    ${escapeHTML(player.position)}
                </div>

                <strong>
                    ${player.rating}
                </strong>

                <div>
                    ${player.rarity || "Common"}
                </div>
            `;

            card.onclick = () => {

                addToLineup(player);
            };

            collection.appendChild(card);
        }
    );
}


// ---------- LINEUP ----------

function addToLineup(player) {

    if (game.superSquad.lineup.length >= 11) {

        notify(
            "Your lineup already has 11 players."
        );

        return;
    }

    if (
        game.superSquad.lineup.some(
            p => p.id === player.id
        )
    ) {

        notify(
            "That player is already in your lineup."
        );

        return;
    }

    game.superSquad.lineup.push(
        player
    );

    updateSuperSquadDisplay();

    saveGame(game);
}

function removeFromLineup(id) {

    game.superSquad.lineup =
        game.superSquad.lineup.filter(
            p => p.id !== id
        );

    updateSuperSquadDisplay();

    saveGame(game);
}

function displayLineup() {

    const lineup =
        $("superLineup");

    if (!lineup) return;

    lineup.innerHTML = "";

    game.superSquad.lineup.forEach(
        player => {

            const card =
                document.createElement("div");

            card.className =
                "player-card lineup-card";

            card.innerHTML = `
                <strong>
                    ${escapeHTML(player.name)}
                </strong>

                <span>
                    ${player.rating}
                </span>

                <button>
                    Remove
                </button>
            `;

            card.querySelector("button")
                .onclick = () => {

                    removeFromLineup(
                        player.id
                    );
                };

            lineup.appendChild(card);
        }
    );
}


// ---------- PACK DISPLAY ----------

function displayPackResults(
    packName,
    cards
) {

    const results =
        $("packResults");

    if (!results) return;

    results.innerHTML = `
        <h2>${packName}</h2>

        <div class="pack-cards">

            ${cards.map(player => `
                <div class="player-card">

                    <h3>
                        ${escapeHTML(player.name)}
                    </h3>

                    <p>
                        ${escapeHTML(player.team)}
                    </p>

                    <p>
                        ${escapeHTML(player.position)}
                    </p>

                    <strong>
                        ${player.rating}
                    </strong>

                    <p>
                        ${player.rarity || "Common"}
                    </p>

                </div>
            `).join("")}

        </div>
    `;
}


// ---------- SUPER SQUAD MATCH ----------

function playSuperSquadMatch() {

    if (
        game.superSquad.lineup.length !== 11
    ) {

        notify(
            "You need exactly 11 players in your lineup."
        );

        return;
    }

    const easy =
        game.superSquad.difficulty ===
        "Easy";

    const opponentRating =
        easy
            ? randomNumber(72, 84)
            : randomNumber(82, 95);

    const squadRating =
        calculateSquadRating(
            game.superSquad.lineup
        );

    const result =
        simulateMatch(
            squadRating,
            opponentRating
        );

    let points = 0;

    if (result === "win") {

        points =
            easy ? 100 : 200;

        game.superSquad.wins++;
    }

    if (result === "draw") {

        points =
            easy ? 50 : 100;

        game.superSquad.draws++;
    }

    if (result === "loss") {

        points = 0;

        game.superSquad.losses++;
    }

    game.superSquad.points +=
        points;

    game.superSquad.season.currentMatch++;

    const opponent =
        randomOpponent(
            "Super League"
        );

    const match = {
        match:
            game.superSquad.season.currentMatch,

        opponent: opponent,

        result: result,

        points: points
    };

    game.superSquad.season.history.push(
        match
    );

    const results =
        $("superResults");

    if (results) {

        results.innerHTML = `
            <h2>
                ${result.toUpperCase()}
            </h2>

            <p>
                Your team played
                ${escapeHTML(opponent)}
            </p>

            <h1>
                +${points} points
            </h1>

            <p>
                Opponent Rating:
                ${opponentRating}
            </p>
        `;
    }

    updateSuperSquadDisplay();

    saveGame(game);
}


// ---------- DIFFICULTY ----------

function setDifficulty(level) {

    if (
        level !== "Easy" &&
        level !== "Hard"
    ) {
        return;
    }

    game.superSquad.difficulty =
        level;

    notify(
        `Difficulty set to ${level}`
    );

    saveGame(game);
}


// ---------- RANDOM OPPONENT ----------

function randomOpponent(exclude) {

    let teams = [
        ...(CONFIG.premierLeagueTeams || []),
        ...(CONFIG.laLigaTeams || [])
    ];

    teams =
        teams.filter(
            team => team !== exclude
        );

    return randomItem(teams);
}


// ---------- SAVE / LOAD ----------

function loadSavedGame() {

    const saved =
        loadGame();

    if (!saved) return;

    game = saved;

    updateSuperSquadDisplay();
}


// ---------- BUTTON CONNECTIONS ----------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const startRoster =
            $("startRosterSeason");

        if (startRoster) {
            startRoster.onclick =
                startRosterSeason;
        }

        const playRoster =
            $("playRosterMatch");

        if (playRoster) {
            playRoster.onclick =
                playRosterMatch;
        }

        const createTeam =
            $("createTeamButton");

        if (createTeam) {
            createTeam.onclick =
                createSuperTeam;
        }

        const bronze =
            $("bronzePack");

        if (bronze) {
            bronze.onclick =
                openBronzePack;
        }

        const gold =
            $("goldPack");

        if (gold) {
            gold.onclick =
                openGoldPack;
        }

        const superMatch =
            $("playSuperMatch");

        if (superMatch) {
            superMatch.onclick =
                playSuperSquadMatch;
        }

        loadSavedGame();
    }
);


// ==========================================
// EXTRA SUPER SQUAD CONTROLS
// ==========================================

function createExtraControls() {

    const gameBox =
        $("superGame");

    if (!gameBox) return;

    if (!$("difficultyControls")) {

        const controls =
            document.createElement("div");

        controls.id =
            "difficultyControls";

        controls.innerHTML = `
            <h3>Difficulty</h3>

            <button
                onclick="setDifficulty('Easy')">
                Easy
            </button>

            <button
                onclick="setDifficulty('Hard')">
                Hard
            </button>

            <button
                onclick="openIconPack()">
                Icon Pack — 1,000 Points
            </button>
        `;

        gameBox.prepend(
            controls
        );
    }
}

setTimeout(
    createExtraControls,
    500
);
