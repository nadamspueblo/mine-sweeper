// Game settings
let width = 10;
let height = 8;
let bombCount = 10;
let difficulty = "easy";
let flagCount = bombCount;
let timeElapsed = 0;
let timerId = null;

// Player Stats
let playCount = 0;
let winCount = 0;
let bestTime = 0;

// Game state and references
let locations = [];
let overlayLocations = [];
let gameboard = document.getElementById("gameboard");
let gameOverlay = document.getElementById("gameoverlay");
let timerDisplay = document.getElementById("timer");
let gameArea = document.getElementById("game-area");

loadStats();
createGameBoard();

function startEasy() {
    clearAll();
    difficulty = "easy";
    bombCount = 10;
    flagCount = bombCount;
    width = 10;
    height = 8;
    document.getElementById("flag-count").innerText = flagCount;
    timerDisplay.innerText = "000";
    createGameBoard();
}

function startMedium() {
    clearAll();
    difficulty = "medium";
    bombCount = 40;
    flagCount = bombCount;
    width = 18;
    height = 14;
    document.getElementById("flag-count").innerText = flagCount;
    timerDisplay.innerText = "000";
    createGameBoard();
}

function startHard() {
    clearAll();
    difficulty = "hard";
    bombCount = 99;
    flagCount = bombCount;
    width = 30;
    height = 24;
    document.getElementById("flag-count").innerText = flagCount;
    timerDisplay.innerText = "000";
    createGameBoard();
}

function clearAll() {
    if (timerId != null) {
        clearInterval(timerId);
        timeElapsed = 0;
    }
    gameboard.innerHTML = "";
    gameOverlay = document.createElement("div");
    gameOverlay.id = "gameoverlay";
    gameboard.appendChild(gameOverlay);
    locations = [];
    overlayLocations = [];
}


function createGameBoard() {
    for (let r = 0; r < height; r++) {
        createRow(r);
    }
    placeBombs();
    placeNumbers();
}

function createRow(r) {
    let rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    gameboard.appendChild(rowDiv);
    let row = [];

    let overlayRowDiv = document.createElement("div");
    overlayRowDiv.classList.add("row");
    gameOverlay.appendChild(overlayRowDiv);
    let overlayRow = [];

    for (let c = 0; c < width; c++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        cell.classList.add(difficulty);
        cell.innerText = "0";
        rowDiv.appendChild(cell);
        row.push(cell);

        let overlayCell = document.createElement("div");
        overlayCell.classList.add("cell");
        overlayCell.classList.add(difficulty);
        overlayCell.classList.add("overlay");
        overlayCell.setAttribute("data-set", JSON.stringify({ row: r, col: c }));
        overlayCell.addEventListener("click", revealCell);
        overlayCell.addEventListener("contextmenu", toggleFlag);
        overlayRow.push(overlayCell);
        overlayRowDiv.appendChild(overlayCell);
    }
    locations.push(row);
    overlayLocations.push(overlayRow);
}

function placeBombs() {
    let count = 0;
    while (count < bombCount) {
        let r = Math.floor(Math.random() * height);
        let c = Math.floor(Math.random() * width);
        let cell = locations[r][c];
        if (cell.innerText != "💣") {
            cell.innerText = "💣";
            count++;
        }
    }
}

function placeNumbers() {
    for (let r = 0; r < locations.length; r++) {
        let row = locations[r];
        for (let c = 0; c < row.length; c++) {
            let cell = row[c];
            if (cell.innerText == "💣") continue;
            let count = countBombs(r, c);
            cell.innerText = count;
            if (count == 0) cell.classList.add("zero");
            else if (count == 1) cell.classList.add("one");
            else if (count == 2) cell.classList.add("two");
            else if (count >= 3) cell.classList.add("three");
        }
    }
}

function countBombs(r, c) {
    let count = 0;

    for (let i = r - 1; i <= r + 1; i++) {
        for (let j = c - 1; j <= c + 1; j++) {
            let cell = i >= 0 && i < height && j >= 0 && j < width ? locations[i][j] : null;
            if (cell && cell.innerText == "💣") count++;
        }
    }

    return count;
}

function revealCell(event) {
    let overlayCell = event.target;
    if (timerId == null) {
        timerId = setInterval(updateTimer, 1000);
    }
    let data = JSON.parse(overlayCell.getAttribute("data-set"));

    let cell = locations[data.row][data.col];
    if (cell.innerText == "💣") {
        cell.innerText = "💥"
        cell.classList.add("explode");
        revealAll();
    }
    else if (overlayCell.innerText != "🚩"){
        if (cell.innerText == "0") {
            gameArea.classList.add("shake");
            setTimeout(() => {
                gameArea.classList.remove("shake");
                revealGroup(data.row, data.col);
                checkBoard();
            }, 300);
        } else {
            revealGroup(data.row, data.col);
            checkBoard();
        }
    }
}

function revealGroup(r, c) {
    if (r < 0 || r >= height || c < 0 || c >= width) return false;
    let cell = locations[r][c];
    if (cell.innerText == "💣") return true;
    else {
        let overlayCell = overlayLocations[r][c];
        if (overlayCell.style.opacity == "0") return;
        overlayCell.style.opacity = "0";
        createShards(cell);
        if (cell.innerText == "0") {
            setTimeout(revealGroup, 100, r - 1, c);
            setTimeout(revealGroup, 200, r - 1, c - 1);
            setTimeout(revealGroup, 300, r - 1, c + 1);
            setTimeout(revealGroup, 400, r, c + 1);
            setTimeout(revealGroup, 500, r, c - 1);
            setTimeout(revealGroup, 600, r + 1, c);
            setTimeout(revealGroup, 700, r + 1, c - 1);
            setTimeout(revealGroup, 800, r + 1, c + 1);
        }
    }
}

function createShards(cell) {
    let shard = document.createElement("div");
    shard.style.position = "absolute";
    shard.style.width = cell.offsetWidth / 2 + "px";
    shard.style.height = cell.offsetHeight / 2 + "px";
    shard.style.backgroundColor = "green";
    shard.style.left = cell.offsetLeft + "px";
    shard.style.top = cell.offsetTop + "px";
    shard.classList.add("shatter-left");
    gameboard.appendChild(shard);
    shard = document.createElement("div");
    shard.style.position = "absolute";
    shard.style.width = cell.offsetWidth / 2 + "px";
    shard.style.height = cell.offsetHeight / 2 + "px";
    shard.style.backgroundColor = "green";
    shard.style.left = cell.offsetLeft + cell.offsetWidth / 2 + "px";
    shard.style.top = cell.offsetTop + "px";
    shard.classList.add("shatter-right");
    gameboard.appendChild(shard);

}

function revealAll() {
    localStorage.setItem("playCount", ++playCount);
    updateStatDisplay();
    clearInterval(timerId);
    timerId = null;
    let count = 0;
    for (let r = 0; r < overlayLocations.length; r++) {
        let overlayRow = overlayLocations[r];
        let row = locations[r];
        for (let c = 0; c < overlayRow.length; c++) {
            let overlayCell = overlayRow[c];
            let cell = row[c];
            setTimeout(() => {
                overlayCell.style.opacity = "0";
                if (cell.innerText == "💣") {
                    count++;
                    setTimeout(() => {
                        cell.innerText = "💥";
                        cell.classList.add("explode");
                    }, 100 * count);

                }
            }, 100);
        }
    }
}

function toggleFlag(event) {
    event.preventDefault();
    let overlayCell = event.target;
    if (overlayCell.innerText == "🚩") {
        overlayCell.innerText = "";
        flagCount++;
    }
    else if (flagCount > 0 && overlayCell.style.opacity != "0") {
        overlayCell.innerText = "🚩";
        flagCount--;
    }
    document.getElementById("flag-count").innerText = flagCount;
}

function checkBoard() {
    let bombCells = [];
    for (let r = 0; r < locations.length; r++) {
        for (let c = 0; c < locations[0].length; c++) {
            let cell = locations[r][c];
            let overlayCell = overlayLocations[r][c];
            if (cell.innerText != "💣" && overlayCell.style.opacity != "0") return false;
            else if (cell.innerText == "💣") bombCells.push({ row: r, col: c });

        }
    }
    alert("You won!");
    localStorage.setItem("playCount", ++playCount);
    localStorage.setItem("winCount", ++winCount);
    if (timeElapsed < bestTime || bestTime == 0) {
        bestTime = timeElapsed;
        localStorage.setItem("bestTime", bestTime);
    }
    updateStatDisplay();
    for (let i = 0; i < bombCells.length; i++) {
        let cellOverlay = overlayLocations[bombCells[i].row][bombCells[i].col];
        setTimeout(() => {
            cellOverlay.style.opacity = "0";
        }, 100 * i);
    }
    clearInterval(timerId);
    timerId = null;
    return true;
}

function updateTimer() {
    timeElapsed++;
    if (timeElapsed < 9)
        timerDisplay.innerText = "00" + timeElapsed;
    else if (timeElapsed < 99)
        timerDisplay.innerText = "0" + timeElapsed;
    else
        timerDisplay.innerText = timeElapsed;
}

function loadStats() {
    playCount = localStorage.playCount ? localStorage.playCount : 0;
    winCount = localStorage.winCount ? localStorage.winCount : 0;
    bestTime = localStorage.bestTime ? localStorage.bestTime : 0;

    updateStatDisplay();
}

function updateStatDisplay() {
    let playCountDisplay = document.getElementById("play-count-stat");
    playCountDisplay.innerText = playCount;

    let winCountDisplay = document.getElementById("win-stat");
    winCountDisplay.innerText = winCount;

    let timeDisplay = document.getElementById("time-stat");
    timeDisplay.innerText = bestTime == 0 ? "---" : bestTime + "s";
}

function sidebarClick(event) {
    let sidebar = document.getElementById("stats");
    let heading = document.getElementById("sidebar-heading");
    if (heading.innerText == "+") {
        sidebar.style.width = "200px";
        setTimeout(() => {
            heading.innerText = "Stats";
        for (e of sidebar.children) {
            e.classList.remove("hidden");
        }
        }, 1000);
    }
    else {
        heading.innerText = "+";
        sidebar.style.width = "50px";
        for (e of sidebar.children) {
            if (e.id == "sidebar-heading") continue;
            e.classList.add("hidden");
        }
    }
}