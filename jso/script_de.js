let aktuelleRunde = 1;
let spielerPunkte = 0;
let bVerwendungAnzahl = 0;
let letzteBVerwendungRunde = 0;
let zielStrategie = '';
let rundenVerlauf = [];
let spielerVerteidigung = false; // 新增变量，表示玩家是否使用了防守

// 目标策略数组
const strategien = ['Verteidigung', 'Ausweichen', 'Angriff'];

function wähleZielStrategie() {
    // 随机选择目标策略
    const zufälligerIndex = Math.floor(Math.random() * strategien.length);
    return strategien[zufälligerIndex];
}

function aktualisiereAnzeige() {
    document.getElementById('aktuelleRunde').textContent = aktuelleRunde;
    document.getElementById('spielerPunkte').textContent = spielerPunkte;
    document.getElementById('zielStrategie').textContent = zielStrategie;
    aktualisiereRundenVerlauf();
}

function aktualisiereRundenVerlauf() {
    const rundenListe = document.getElementById('rundenListe');
    rundenListe.innerHTML = rundenVerlauf.map(eintrag => `
        <li>
            Runde ${eintrag.runde}：
            Spieler Gesamtpunktzahl: ${eintrag.spielerPunkte} Punkte
            Zielstrategie: ${eintrag.strategie}
            Spielerstrategie: ${eintrag.spielerFähigkeit}
        </li>
    `).join('');
}

function überprüfeSieg() {
    if (spielerPunkte >= 8) {
        alert('Sieg! Spiel beendet!');
        zeigeEndergebnisse();
        spielZurücksetzen();
    } else if (aktuelleRunde > 5) {
        alert('Niederlage! Spiel beendet.');
        zeigeEndergebnisse();
        spielZurücksetzen();
    }
}

function zeigeEndergebnisse() {
    let ergebnisse = 'Spiel beendet!\n\nRundenprotokoll:\n';
    rundenVerlauf.forEach(eintrag => {
        ergebnisse += `Runde ${eintrag.runde}：Spieler Gesamtpunktzahl: ${eintrag.spielerPunkte} Punkte，Zielstrategie: ${eintrag.strategie}，Spielerstrategie: ${eintrag.spielerFähigkeit}\n`;
    });
    alert(ergebnisse);
}

function spielZurücksetzen() {
    aktuelleRunde = 1;
    spielerPunkte = 0;
    bVerwendungAnzahl = 0;
    letzteBVerwendungRunde = 0;
    rundenVerlauf = [];
    zielStrategie = '';
    spielerVerteidigung = false; // 重置防守状态
    aktualisiereAnzeige();
}

function angriff(fähigkeit) {
    if (aktuelleRunde > 5) return;

    zielStrategie = wähleZielStrategie();
    let punkte = 0;

    if (zielStrategie === 'Verteidigung') {
        punkte = 0;
    } else if (zielStrategie === 'Ausweichen') {
        punkte = fähigkeit === 'Schlagen' ? (Math.random() < 0.5 ? 0.5 : 1) : (Math.random() < 0.5 ? 1.5 : 3);
    } else if (zielStrategie === 'Angriff') {
        if (fähigkeit === 'Stechen') {
            spielerPunkte -= 1; // 目标攻击时减少玩家分数1分
            if (Math.random() < 0.5) {
                spielerPunkte -= 1; // 有50%几率再减少1分
            }
        } else if (fähigkeit === 'Schlagen') {
            spielerPunkte -= 1; // 目标攻击时减少玩家分数1分
        }
        punkte = fähigkeit === 'Schlagen' ? 1 : 3;
    }

    if (fähigkeit === 'Stechen') {
        if (bVerwendungAnzahl >= 2) {
            alert('Stechen-Fähigkeit wurde zweimal verwendet, kann nicht mehr verwendet werden!');
            return;
        }
        if (aktuelleRunde > 1 && letzteBVerwendungRunde === aktuelleRunde - 1) {
            alert('Stechen-Fähigkeit kann nicht hintereinander verwendet werden!');
            return;
        }
        bVerwendungAnzahl++;
        letzteBVerwendungRunde = aktuelleRunde;
    }

    if (fähigkeit === 'Verteidigung') {
        spielerVerteidigung = true; // 玩家使用防守
    } else {
        if (spielerVerteidigung) {
            punkte *= 2; // 使用防守后的第一回合中攻击动作的得分加倍
            spielerVerteidigung = false; // 第二回合消除效果
        }
        spielerPunkte += punkte;
    }

    // 当玩家使用防守时，目标的攻击策略无效，玩家总分不增加
    if (spielerVerteidigung && zielStrategie === 'Angriff') {
        spielerPunkte += 0; // 恢复因目标攻击而减少的分数
    }

    rundenVerlauf.push({
        runde: aktuelleRunde,
        spielerPunkte: spielerPunkte,
        strategie: zielStrategie,
        spielerFähigkeit: fähigkeit // 记录玩家使用的策略
    });

    alert(`Runde ${aktuelleRunde} beendet, Punkte in dieser Runde: ${punkte}`);

    aktuelleRunde++;
    aktualisiereAnzeige();
    überprüfeSieg();
}

function spielStarten() {
    spielZurücksetzen();
}
