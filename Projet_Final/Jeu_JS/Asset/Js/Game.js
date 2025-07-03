let GRID_SIZE, level = 1, score = 0, highScore = Number(localStorage.getItem('highScore')) || 0;
let timer = 0, interval;
let player, visited, coloredTargets, disabledCells;
const moveImages = [
    "Asset/Image/Base.png",
    "Asset/Image/Bouge_1.png",
    "Asset/Image/Bouge_2.png",
    "Asset/Image/Bouge_3.png"
];
let moveFrame = 0;
const gridElement = document.querySelector('.grid');
const timerElement = document.getElementById('timer');
const levelElement = document.getElementById('level');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highscore');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function isValid(row, col) {
    return (
        row >= 0 && row < GRID_SIZE &&
        col >= 0 && col < GRID_SIZE &&
        !disabledCells[row][col]
    );
}

function dfs(row, col, visitedDFS) {
    if (!isValid(row, col) || visitedDFS[row][col]) return;
    visitedDFS[row][col] = true;
    const dirs = [[0,1],[1,0],[-1,0],[0,-1]];
    for (let [dx, dy] of dirs) {
        dfs(row + dy, col + dx, visitedDFS);
    }
}

function generatePlayableGrid() {
    let attempts = 0;
    do {
        attempts++;
        coloredTargets = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
        visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
        disabledCells = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
        const start = getRandomCell();
        player = { row: start.row, col: start.col };
        const allCells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (!(r === player.row && c === player.col)) {
                    allCells.push([r, c]);
                }
            }
        }
        shuffle(allCells);
        const nbToRemove = Math.floor(allCells.length * Math.min(0.05 + level * 0.03, 0.4));
        for (let i = 0; i < nbToRemove; i++) {
            let [r, c] = allCells[i];
            disabledCells[r][c] = true;
        }
        const candidates = allCells.filter(([r, c]) => !disabledCells[r][c]);
        const nbToColor = Math.floor(candidates.length * Math.min(0.3 + level * 0.04, 0.8));
        for (let i = 0; i < nbToColor; i++) {
            let [r, c] = candidates[i];
            coloredTargets[r][c] = true;
        }
        const reachable = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
        dfs(player.row, player.col, reachable);
        const allReachable = candidates.every(([r, c]) => !coloredTargets[r][c] || reachable[r][c]);
        if (allReachable) break;
    } while (attempts < 10);
}

function getRandomCell() {
    let row = 0, col = 0;
    do {
        row = Math.floor(Math.random() * GRID_SIZE);
        col = Math.floor(Math.random() * GRID_SIZE);
    } while (disabledCells[row]?.[col]);
    return { row, col };
}

function createGrid() {
    GRID_SIZE = Math.min(4 + Math.floor(level / 2), 14);
    clearInterval(interval);
    timer = 0;
    timerElement.textContent = `🕓 Temps : 0s`;
    interval = setInterval(() => {
        timer++;
        timerElement.textContent = `🕓 Temps : ${timer}s`;
    }, 1000);
    gridElement.innerHTML = '';
    generatePlayableGrid();
    gridElement.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 40px)`;
    gridElement.style.gridTemplateRows = `repeat(${GRID_SIZE}, 40px)`;
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (disabledCells[row][col]) {
                cell.classList.add('disabled');
            }
            cell.dataset.row = row;
            cell.dataset.col = col;
            gridElement.appendChild(cell);
        }
    }
    visited[player.row][player.col] = true;
    updateUI();
    render();
}

function render() {
    document.querySelectorAll('.cell').forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (disabledCells[row][col]) {
            cell.style.backgroundColor = 'black';
            return;
        }
        if (visited[row][col]) {
            cell.style.backgroundColor = '#671aa7';
        } else if (coloredTargets[row][col]) {
            cell.style.backgroundColor = '#eee';
        } else {
            cell.style.backgroundColor = 'transparent';
        }
        cell.innerHTML = '';
    });
    const index = player.row * GRID_SIZE + player.col;
    const cell = gridElement.children[index];
    const img = document.createElement('img');
    img.src = moveImages[moveFrame];
    img.className = 'perso';
    cell.appendChild(img);
    moveFrame = (moveFrame + 1) % moveImages.length;
}

function movePlayer(dRow, dCol) {
    const newRow = player.row + dRow;
    const newCol = player.col + dCol;
    if (
        newRow >= 0 && newRow < GRID_SIZE &&
        newCol >= 0 && newCol < GRID_SIZE &&
        !visited[newRow][newCol] &&
        !disabledCells[newRow][newCol]
    ) {
        player.row = newRow;
        player.col = newCol;
        visited[newRow][newCol] = true;
        render();
        checkWin();
        if (isPlayerBlocked()) {
            setTimeout(() => {
                alert("Vous êtes bloqué ! La partie redémarre.");
                level = 1;
                score = 0;
                createGrid();
            }, 100);
        }
    }
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': movePlayer(-1, 0); break;
        case 'ArrowDown': movePlayer(1, 0); break;
        case 'ArrowLeft': movePlayer(0, -1); break;
        case 'ArrowRight': movePlayer(0, 1); break;
        case 'r':
        case 'R':
            level = 1;
            score = 0;
            createGrid();
            break;
    }
});

function checkWin() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (coloredTargets[row][col] && !visited[row][col]) return;
        }
    }
    clearInterval(interval);
    score += Math.max(0, 100 - timer);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    level++;
    updateUI();
    alert(`🎉 Niveau terminé ! Score actuel : ${score}`);
    createGrid();
}

function updateUI() {
    levelElement.textContent = `🎯 Niveau : ${level}`;
    scoreElement.textContent = `⭐ Score : ${score}`;
    highScoreElement.textContent = `🏆 Meilleur score : ${highScore}`;
}

document.getElementById('restartBtn').addEventListener('click', () => {
    level = 1;
    score = 0;
    createGrid();
});

function isPlayerBlocked() {
    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];
    for (const [dRow, dCol] of directions) {
        const newRow = player.row + dRow;
        const newCol = player.col + dCol;
        if (
            newRow >= 0 && newRow < GRID_SIZE &&
            newCol >= 0 && newCol < GRID_SIZE &&
            !visited[newRow][newCol] &&
            !disabledCells[newRow][newCol]
        ) {
            return false;
        }
    }
    return true;
}

createGrid();