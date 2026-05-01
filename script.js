let width = 10;
let height = 10;

let locations = [];
let overlayLocations = [];
let gameboard = document.getElementById("gameboard");
let gameOverlay = document.getElementById("gameoverlay");

createGameBoard();


function createGameBoard() {
    for (let r = 0; r < width; r++) {
        createRow(r);
    }
    console.log(locations);
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
        if (placeBomb()) {
            cell.innerText = "💣";
            cell.classList.add("bomb");
        }
        else {
            cell.innerText = "0";
        }
        rowDiv.appendChild(cell);
        row.push(cell);

        let overlayCell = document.createElement("div");
        overlayCell.classList.add("cell");
        overlayCell.classList.add("overlay");
        overlayCell.setAttribute("data-set", JSON.stringify({row: r, col: c}));
        overlayCell.addEventListener("click", revealCell);
        overlayRow.push(overlayCell);
        overlayRowDiv.appendChild(overlayCell);
    }
    locations.push(row);
    overlayLocations.push(overlayRow);
}

function placeBomb() {
    return Math.random() < 0.1;
}

function placeNumbers() {
    for (let r = 0; r < locations.length; r++) {
        let row = locations[r];
        for (let c = 0; c < row.length; c++) {
            let cell = row[c];
            if (cell.innerText == "💣") continue;
            let count = countBombs(r, c);
            cell.innerText = count;
            if (count == 1) cell.classList.add("one");
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
    let cell = event.target;
    cell.style.opacity = "0";
    let data = JSON.parse(cell.getAttribute("data-set"));
    console.log(data);
}