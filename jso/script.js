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

function calculateScore(skill, targetStrategy) {
    let score = 0;
    if (targetStrategy === 'Verteidigung') {
        score = 0;
    } else if (targetStrategy === 'Ausweichen') {
        if (Math.random() < 0.5) {
            score = skill === 'Schlagen' ? 0.5 : 1.5;
        } else {
            score = skill === 'Schlagen' ? 1 : 3;
        }
    } else if (targetStrategy === 'Angriff') {
        score = skill === 'Schlagen' ? 1 : 3;
    }
    return score;
}

function handleDefensiveStrategy() {
    // 处理防守策略
    return 0;
}

function handleDodgeStrategy(skill) {
    // 处理躲避策略
    let score = 0;
    if (Math.random() < 0.5) {
        score = skill === 'Schlagen' ? 0.5 : 1.5;
    } else {
        score = skill === 'Schlagen' ? 1 : 3;
    }
    return score;
}

function handleAttackStrategy(skill) {
    // 处理攻击策略
    let score = skill === 'Schlagen' ? 1 : 3;
    if (skill === 'Stechen' || skill === 'Schlagen') {
        playerScore -= 1; // 目标攻击时减少玩家分数1分
    }
    return score;
}

function attack(skill) {
    if (currentRound > 5) {
        alert("Das Spiel ist vorbei!");
        return;
    }

    targetStrategy = selectTargetStrategy();
    let score = 0;

    switch (targetStrategy) {
        case 'Verteidigung':
            score = handleDefensiveStrategy();
            break;
        case 'Ausweichen':
            score = handleDodgeStrategy(skill);
            break;
        case 'Angriff':
            score = handleAttackStrategy(skill);
            break;
        default:
            score = 0;
            break;
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
        playerDefense = true;
    } else {
        if (playerDefense) {
            score *= 2;
            playerDefense = false;
        }
        playerScore += score;
    }

    if (playerDefense && targetStrategy === 'Angriff') {
        playerScore += 0;
    }

    // 记录回合历史
    roundHistory.push({
        round: currentRound,
        playerScore: playerScore,
        strategy: targetStrategy,
        playerSkill: skill // 记录玩家使用的策略
    });

    // 显示回合结束提示
    alert(`Runde ${currentRound} beendet, Punkte in dieser Runde: ${score}`);

    // 增加当前回合号
    currentRound++;

    // 更新显示
    updateDisplay();

    // 检查胜利条件
    checkVictory();
}

function startGame() {
    resetGame();
}