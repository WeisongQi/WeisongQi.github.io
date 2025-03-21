let currentRound = 1;
let playerScore = 0;
let bUsageCount = 0;
let lastBUsageRound = 0;
let targetStrategy = '';
let roundHistory = [];
let playerDefense = false; // 新增变量，表示玩家是否使用了防守

// 目标策略数组
const strategies = ['Verteidigung', 'Ausweichen', 'Angriff'];

function selectTargetStrategy() {
    // 随机选择目标策略
    const randomIndex = Math.floor(Math.random() * strategies.length);
    return strategies[randomIndex];
}

function updateDisplay() {
    document.getElementById('currentRound').textContent = currentRound;
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('targetStrategy').textContent = targetStrategy;
    updateRoundHistory();
}

function updateRoundHistory() {
    const roundList = document.getElementById('roundList');
    roundList.innerHTML = roundHistory.map(entry => `
        <li>
            Runde ${entry.round}：
            Spieler Gesamtpunktzahl: ${entry.playerScore} Punkte
            Zielstrategie: ${entry.strategy}
            Spielerstrategie: ${entry.playerSkill}
        </li>
    `).join('');
}

function checkVictory() {
    if (playerScore >= 8) {
        alert('Sieg! Spiel beendet!');
        displayFinalResults();
        resetGame();
    } else if (currentRound > 5) {
        alert('Niederlage! Spiel beendet.');
        displayFinalResults();
        resetGame();
    }
}

function displayFinalResults() {
    let results = 'Spiel beendet!\n\nRundenprotokoll:\n';
    roundHistory.forEach(entry => {
        results += `Runde ${entry.round}：Spieler Gesamtpunktzahl: ${entry.playerScore} Punkte，Zielstrategie: ${entry.strategy}，Spielerstrategie: ${entry.playerSkill}\n`;
    });
    alert(results);
}

function resetGame() {
    currentRound = 1;
    playerScore = 0;
    bUsageCount = 0;
    lastBUsageRound = 0;
    roundHistory = [];
    targetStrategy = '';
    playerDefense = false; // 重置防守状态
    updateDisplay();
}

function attack(skill) {
    if (currentRound > 5) return;

    targetStrategy = selectTargetStrategy();
    let score = 0;

    if (targetStrategy === 'Verteidigung') {
        score = 0;
    } else if (targetStrategy === 'Ausweichen') {
        score = skill === 'Schlagen' ? (Math.random() < 0.5 ? 0.5 : 1) : (Math.random() < 0.5 ? 1.5 : 3);
    } else if (targetStrategy === 'Angriff') {
        if (skill === 'Stechen') {
            playerScore -= 1; // 目标攻击时减少玩家分数1分
            if (Math.random() < 0.5) {
                playerScore -= 1; // 有50%几率再减少1分
            }
        } else if (skill === 'Schlagen') {
            playerScore -= 1; // 目标攻击时减少玩家分数1分
        }
        score = skill === 'Schlagen' ? 1 : 3;
    }

    if (skill === 'Stechen') {
        if (bUsageCount >= 2) {
            alert('Stechen-Fähigkeit wurde zweimal verwendet, kann nicht mehr verwendet werden!');
            return;
        }
        if (currentRound > 1 && lastBUsageRound === currentRound - 1) {
            alert('Stechen-Fähigkeit kann nicht hintereinander verwendet werden!');
            return;
        }
        bUsageCount++;
        lastBUsageRound = currentRound;
    }

    if (skill === 'Verteidigung') {
        playerDefense = true; // 玩家使用防守
    } else {
        if (playerDefense) {
            score *= 2; // 使用防守后的第一回合中攻击动作的得分加倍
            playerDefense = false; // 第二回合消除效果
        }
        playerScore += score;
    }

    roundHistory.push({
        round: currentRound,
        playerScore: playerScore,
        strategy: targetStrategy,
        playerSkill: skill // 记录玩家使用的策略
    });

    alert(`Runde ${currentRound} beendet, Punkte in dieser Runde: ${score}`);

    currentRound++;
    updateDisplay();
    checkVictory();
}

function startGame() {
    resetGame();
}