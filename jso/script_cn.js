let currentRound = 1;
let playerScore = 0;
let bUsageCount = 0;
let lastBUsageRound = 0;
let targetStrategy = '';
let roundHistory = [];
let playerDefense = false; // 新增变量，表示玩家是否使用了防守

// 目标策略数组
const strategies = ['防守', '躲避', '攻击'];

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
            回合${entry.round}：
            玩家总分: ${entry.playerScore}分
            目标策略: ${entry.strategy}
            玩家策略: ${entry.playerSkill}
        </li>
    `).join('');
}

function checkVictory() {
    if (playerScore >= 8) { // 修改此处的得分条件
        alert('胜利！游戏结束！');
        displayFinalResults();
        resetGame();
    } else if (currentRound > 5) {
        alert('失败！游戏结束。');
        displayFinalResults();
        resetGame();
    }
}

function displayFinalResults() {
    let results = '游戏结束！\n\n回合记录：\n';
    roundHistory.forEach(entry => {
        results += `回合${entry.round}：玩家总分: ${entry.playerScore}分，目标策略: ${entry.strategy}，玩家策略: ${entry.playerSkill}\n`;
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

    if (targetStrategy === '防守') {
        score = 0;
    } else if (targetStrategy === '躲避') {
        if (Math.random() < 0.5) {
            score = skill === '挥砍' ? 0.5 : 1.5;
        } else {
            score = skill === '挥砍' ? 1 : 3;
        }
    } else if (targetStrategy === '攻击') {
        if (skill === '刺击') {
            playerScore -= 1; // 目标攻击时减少玩家分数1分
            if (Math.random() < 0.5) {
                playerScore -= 1; // 有50%几率再减少1分
            }
        } else if (skill === '挥砍') {
            playerScore -= 1; // 目标攻击时减少玩家分数1分
        }
        score = skill === '挥砍' ? 1 : 3;
    }

    if (skill === '刺击') {
        if (bUsageCount >= 2) {
            alert('刺击技能已使用两次，无法再使用！');
            return;
        }
        if (currentRound > 1 && lastBUsageRound === currentRound - 1) {
            alert('刺击技能不能连续使用！');
            return;
        }
        bUsageCount++;
        lastBUsageRound = currentRound;
    }

    if (skill === '防守') {
        playerDefense = true; // 玩家使用防守
    } else {
        if (playerDefense) {
            score *= 2; // 使用防守后的第一回合中攻击动作的得分加倍
            playerDefense = false; // 第二回合消除效果
        }
        playerScore += score;
    }

    // 当玩家使用防守时，目标的攻击策略无效，玩家总分不增加
    if (playerDefense && targetStrategy === '攻击') {
        playerScore += 0; // 恢复因目标攻击而减少的分数
    }

    roundHistory.push({
        round: currentRound,
        playerScore: playerScore,
        strategy: targetStrategy,
        playerSkill: skill // 记录玩家使用的策略
    });

    alert(`回合${currentRound}结束，本回合得分: ${score}`);

    currentRound++;
    updateDisplay();
    checkVictory();
}

function startGame() {
    resetGame();
}