/**
 * 五回合游戏核心逻辑
 * 支持多语言配置
 */

const FiveRoundGame = (function() {
    // 默认配置
    const defaultConfig = {
        language: 'de',
        strings: {
            de: {
                skills: {
                    slash: 'Schlagen',
                    stab: 'Stechen',
                    defend: 'Verteidigung'
                },
                targetStrategies: {
                    defend: 'Verteidigung',
                    dodge: 'Ausweichen',
                    attack: 'Angriff'
                },
                messages: {
                    victory: 'Sieg! Spiel beendet!',
                    defeat: 'Niederlage! Spiel beendet.',
                    doubleNext: '使用防守后的第一回合中攻击动作的得分加倍',
                    cannotUseTwice: 'Stechen-Fähigkeit wurde zweimal verwendet, kann nicht mehr verwendet werden!',
                    cannotConsecutive: 'Stechen-Fähigkeit kann nicht hintereinander verwendet werden!',
                    gameOver: 'Das Spiel ist vorbei!',
                    roundEnd: 'Runde ${round} beendet, Punkte in dieser Runde: ${score}'
                }
            },
            cn: {
                skills: {
                    slash: '挥砍',
                    stab: '刺击',
                    defend: '防守'
                },
                targetStrategies: {
                    defend: '防守',
                    dodge: '躲避',
                    attack: '攻击'
                },
                messages: {
                    victory: '胜利！游戏结束！',
                    defeat: '失败！游戏结束。',
                    doubleNext: '使用防守后的第一回合中攻击动作的得分加倍',
                    cannotUseTwice: '刺击技能已使用两次，无法再使用！',
                    cannotConsecutive: '刺击技能不能连续使用！',
                    gameOver: '游戏已结束！',
                    roundEnd: '回合${round}结束，本回合得分: ${score}'
                }
            }
        },
        rules: {
            maxRounds: 5,
            winScore: 8,
            skillLimits: {
                stab: {
                    maxUses: 2,
                    noConsecutive: true
                }
            },
            targetEffects: {
                defend: { points: 0 },
                dodge: { halfChance: 0.5 },
                attack: { minusPoint: 1 }
            }
        }
    };

    let config = { ...defaultConfig };
    let state = {
        currentRound: 1,
        playerScore: 0,
        skillUses: {},
        lastSkillUsed: null,
        roundHistory: [],
        playerDefense: false,
        gameActive: true
    };

    // 私有辅助函数
    function getString(path) {
        const keys = path.split('.');
        let value = config.strings[config.language];
        for (const key of keys) {
            if (value && value[key] !== undefined) {
                value = value[key];
            } else {
                console.warn(`String not found: ${path} for language ${config.language}`);
                return '';
            }
        }
        return value;
    }

    function getRandomTargetStrategy() {
        const strategies = ['defend', 'dodge', 'attack'];
        const randomIndex = Math.floor(Math.random() * strategies.length);
        return strategies[randomIndex];
    }

    function calculateScore(skillType, targetStrategy) {
        const rules = config.rules;
        let score = 0;

        switch (targetStrategy) {
            case 'defend':
                score = 0;
                break;
            case 'dodge':
                // 50% 概率得分减半
                if (Math.random() < rules.targetEffects.dodge.halfChance) {
                    score = skillType === 'slash' ? 0.5 : 1.5;
                } else {
                    score = skillType === 'slash' ? 1 : 3;
                }
                break;
            case 'attack':
                score = skillType === 'slash' ? 1 : 3;
                // 目标攻击时减少玩家分数
                state.playerScore -= rules.targetEffects.attack.minusPoint;
                break;
            default:
                score = 0;
        }

        return score;
    }

    function updateDisplay() {
        // 由具体页面实现
        if (typeof window !== 'undefined' && window.updateGameDisplay) {
            window.updateGameDisplay(state, getString);
        }
    }

    function checkVictory() {
        if (state.playerScore >= config.rules.winScore) {
            alert(getString('messages.victory'));
            showFinalResults();
            resetGame();
            return true;
        } else if (state.currentRound > config.rules.maxRounds) {
            alert(getString('messages.defeat'));
            showFinalResults();
            resetGame();
            return true;
        }
        return false;
    }

    function showFinalResults() {
        let results = getString('messages.gameOver') + '\n\n';
        state.roundHistory.forEach(entry => {
            results += `Runde ${entry.round}: ${entry.playerScore} Punkte, Ziel: ${entry.targetStrategy}, Spieler: ${entry.playerSkill}\n`;
        });
        alert(results);
    }

    // 公共API
    return {
        init(customConfig = {}) {
            config = { ...defaultConfig, ...customConfig };
            // 合并字符串配置
            if (customConfig.strings) {
                for (const lang in customConfig.strings) {
                    if (config.strings[lang]) {
                        config.strings[lang] = { ...config.strings[lang], ...customConfig.strings[lang] };
                    } else {
                        config.strings[lang] = customConfig.strings[lang];
                    }
                }
            }
            this.reset();
        },

        reset() {
            state = {
                currentRound: 1,
                playerScore: 0,
                skillUses: {},
                lastSkillUsed: null,
                roundHistory: [],
                playerDefense: false,
                gameActive: true
            };
            updateDisplay();
        },

        attack(skillType) {
            if (!state.gameActive || state.currentRound > config.rules.maxRounds) {
                alert(getString('messages.gameOver'));
                return;
            }

            // 检查技能限制
            const skillLimits = config.rules.skillLimits[skillType];
            if (skillLimits) {
                const uses = state.skillUses[skillType] || 0;
                if (uses >= skillLimits.maxUses) {
                    alert(getString('messages.cannotUseTwice'));
                    return;
                }
                if (skillLimits.noConsecutive && state.lastSkillUsed === skillType) {
                    alert(getString('messages.cannotConsecutive'));
                    return;
                }
            }

            const targetStrategy = getRandomTargetStrategy();
            let score = calculateScore(skillType, targetStrategy);

            // 处理防守效果
            if (skillType === 'defend') {
                state.playerDefense = true;
            } else {
                if (state.playerDefense) {
                    score *= 2;
                    state.playerDefense = false;
                }
                state.playerScore += score;
            }

            // 记录历史
            state.roundHistory.push({
                round: state.currentRound,
                playerScore: state.playerScore,
                targetStrategy: getString(`targetStrategies.${targetStrategy}`),
                playerSkill: getString(`skills.${skillType}`)
            });

            // 更新使用计数
            if (skillType === 'stab') {
                state.skillUses[skillType] = (state.skillUses[skillType] || 0) + 1;
                state.lastSkillUsed = skillType;
            } else if (skillType === 'slash' || skillType === 'defend') {
                state.lastSkillUsed = skillType;
            }

            // 显示回合结果
            const message = getString('messages.roundEnd')
                .replace('${round}', state.currentRound)
                .replace('${score}', score);
            alert(message);

            state.currentRound++;
            updateDisplay();
            
            if (!checkVictory()) {
                // 游戏继续
            }
        },

        getState() {
            return { ...state };
        },

        getConfig() {
            return { ...config };
        },

        setLanguage(lang) {
            if (config.strings[lang]) {
                config.language = lang;
                updateDisplay();
            } else {
                console.warn(`Language not supported: ${lang}`);
            }
        }
    };
})();

// 导出到全局
if (typeof window !== 'undefined') {
    window.FiveRoundGame = FiveRoundGame;
}