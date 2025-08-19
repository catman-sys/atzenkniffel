// game.js – Auswahl zwischen Solo, Bot, Online (Vorlage)
function randDice() {
  return Math.floor(Math.random() * 6) + 1;
}

let mode = null; // "solo"|"bot"|"online"

const modeSelect = document.getElementById('mode-select');
const gameArea = document.getElementById('game-area');
const btnSolo = document.getElementById('btn-solo');
const btnBot = document.getElementById('btn-bot');
const btnOnline = document.getElementById('btn-online');
const btnBack = document.getElementById('btn-back');
const diceRow = document.getElementById("dice-row");
const rollBtn = document.getElementById("rollBtn");
const scoreTable = document.getElementById("score-table");
const message = document.getElementById("message");

const categories = [
  "Einser", "Zweier", "Dreier", "Vierer", "Fünfer", "Sechser",
  "Summe oben", "Bonus",
  "Dreierpasch", "Viererpasch", "Full House", "Kleine Straße", "Große Straße", "Kniffel", "Chance", "Gesamt"
];
const diceUnicode = ["","⚀","⚁","⚂","⚃","⚄","⚅"];

// Gemeinsame Variablen (werden beim Neustart überschrieben)
let dice = [1,1,1,1,1];
let held = [false, false, false, false, false];
let rollsLeft = 3;

// Für Solo
let scoreSolo = Array(16).fill(null);
// Für Bot-Spiel
let scorePlayer = Array(16).fill(null);
let scoreBot = Array(16).fill(null);
let isPlayerTurn = true;

function resetVarsSolo() {
  dice = [1,1,1,1,1];
  held = [false, false, false, false, false];
  rollsLeft = 3;
  scoreSolo = Array(16).fill(null);
}
function resetVarsBot() {
  dice = [1,1,1,1,1];
  held = [false, false, false, false, false];
  rollsLeft = 3;
  scorePlayer = Array(16).fill(null);
  scoreBot = Array(16).fill(null);
  isPlayerTurn = true;
}

function renderDice() {
  diceRow.innerHTML = "";
  for(let i=0; i<5; i++) {
    const div = document.createElement("div");
    div.className = "dice" + (held[i] ? " selected" : "");
    div.innerHTML = diceUnicode[dice[i]];
    div.onclick = () => {
      if (mode==="solo" && rollsLeft < 3 && rollsLeft > 0) {
        held[i] = !held[i];
        renderDice();
      }
      if (mode==="bot" && rollsLeft < 3 && rollsLeft > 0 && isPlayerTurn) {
        held[i] = !held[i];
        renderDice();
      }
    };
    diceRow.appendChild(div);
  }
}

function renderTable() {
  let html;
  if (mode==="solo") {
    html = "<tr><th>Kategorie</th><th>Punkte</th></tr>";
    categories.forEach((cat, idx) => {
      let value = scoreSolo[idx];
      let locked = value !== null;
      let dis = (locked || idx === 6 || idx === 7 || idx === 15) ? "disabled" : "";
      html += `<tr>
        <td>${cat}</td>
        <td>
          <input type="text" value="${value !== null ? value : ""}"
            readonly ${dis}
            onclick="window.enterScoreSolo(${idx})"
            style="cursor:${(!locked && rollsLeft===0 && idx < 15) ? 'pointer' : 'not-allowed'};">
        </td></tr>`;
    });
  } else if (mode==="bot") {
    html = "<tr><th>Kategorie</th><th>Du</th><th>Bot</th></tr>";
    categories.forEach((cat, idx) => {
      let valP = scorePlayer[idx] !== null ? scorePlayer[idx] : "";
      let valB = scoreBot[idx] !== null ? scoreBot[idx] : "";
      let locked = scorePlayer[idx] !== null || idx === 6 || idx === 7 || idx === 15;
      html += `<tr>
        <td>${cat}</td>
        <td>
          <input type="text" value="${valP}" readonly ${locked || !isPlayerTurn || rollsLeft>0 ? 'disabled' : ''}
            onclick="window.enterScoreBot(${idx})"
            style="cursor:${(!locked && isPlayerTurn && rollsLeft===0 && idx < 15) ? 'pointer':'not-allowed'};">
        </td>
        <td>
          <input type="text" value="${valB}" readonly disabled>
        </td>
      </tr>`;
    });
  }
  // Online (Platzhalter)
  if (mode==="online") {
    html = `<tr><td colspan="3">Der Online-Modus ist in Vorbereitung! Bald kannst du gegen Freunde spielen.</td></tr>`;
  }
  scoreTable.innerHTML = html;
}

// Hilfsfunktionen
function countDice(n) { return dice.filter(d => d === n).length; }
function sumDice() { return dice.reduce((a, b) => a + b, 0); }
function hasAmount(n) { return [1,2,3,4,5,6].some(val => countDice(val) >= n); }
function isFullHouse() {
  let vals = [1,2,3,4,5,6].map(c => countDice(c));
  return vals.includes(3) && vals.includes(2);
}
function isSmallStraight() {
  let uniq = [...new Set(dice)].sort();
  let str = uniq.join("");
  return str.includes("1234") || str.includes("2345") || str.includes("3456");
}
function isLargeStraight() {
  let uniq = [...new Set(dice)].sort();
  let str = uniq.join("");
  return str === "12345" || str === "23456";
}
function isKniffel() { return [1,2,3,4,5,6].some(val => countDice(val) === 5); }

// Wertungslogik: Für Solo-Modus
window.enterScoreSolo = function(idx) {
  if(rollsLeft > 0 || scoreSolo[idx] !== null || idx===6||idx===7||idx===15) return;
  let val = 0;
  if(idx<=5) val = countDice(idx+1)*(idx+1);
  else if(idx===8) val = hasAmount(3) ? sumDice() : 0;
  else if(idx===9) val = hasAmount(4) ? sumDice() : 0;
  else if(idx===10) val = isFullHouse() ? 25 : 0;
  else if(idx===11) val = isSmallStraight() ? 30 : 0;
  else if(idx===12) val = isLargeStraight() ? 40 : 0;
  else if(idx===13) val = isKniffel() ? 50 : 0;
  else if(idx===14) val = sumDice();
  scoreSolo[idx] = val;

  // Bonus/Summen
  let sum = 0;
  for(let j=0;j<=5;j++) sum += scoreSolo[j]||0;
  scoreSolo[6] = sum;
  scoreSolo[1] = sum >= 63 ? 35 : 0;
  let total = 0;
  for(let k=0; k<15; k++) if(scoreSolo[k]!==null && k!==15) total += scoreSolo[k];
  scoreSolo[2] = total;

  dice = [1,1,1,1,1];
  held = [false, false, false, false, false];
  rollsLeft = 3;
  renderDice();
  renderTable();
  message.innerText = "Neue Runde – Würfeln!";
};
// Bot-Modus (Wertung für Mensch, dann Bot-Aktion)
window.enterScoreBot = function(idx) {
  if(rollsLeft > 0 || scorePlayer[idx] !== null || idx===6||idx===7||idx===15||!isPlayerTurn) return;
  let val = 0;
  if(idx<=5) val = countDice(idx+1)*(idx+1);
  else if(idx===8) val = hasAmount(3) ? sumDice() : 0;
  else if(idx===9) val = hasAmount(4) ? sumDice() : 0;
  else if(idx===10) val = isFullHouse() ? 25 : 0;
  else if(idx===11) val = isSmallStraight() ? 30 : 0;
  else if(idx===12) val = isLargeStraight() ? 40 : 0;
  else if(idx===13) val = isKniffel() ? 50 : 0;
  else if(idx===14) val = sumDice();
  scorePlayer[idx] = val;

  // Bonus + Summe
  let sum = 0;
  for(let j=0;j<=5;j++) sum += scorePlayer[j]||0;
  scorePlayer[6] = sum;
  scorePlayer[1] = sum >= 63 ? 35 : 0;
  let total = 0;
  for(let k=0; k<15; k++) if(scorePlayer[k]!==null && k!==15) total += scorePlayer[k];
  scorePlayer[2] = total;

  isPlayerTurn = false;
  botTurn();
};

rollBtn.onclick = () => {
  if (mode==="solo") {
    if (rollsLeft === 0) {
      message.innerText = "Bitte trage eine Wertung ein!";
      return;
    }
    for(let i=0;i<5;i++) if (!held[i]) dice[i]=randDice();
    renderDice();
    rollsLeft -= 1;
    if (rollsLeft === 0) message.innerText = "Wertung eintragen!";
    else message.innerText = `Noch ${rollsLeft} Wurf(e). Zum Halten Würfel anklicken.`;
  }
  if (mode==="bot") {
    if (!isPlayerTurn) return;
    if (rollsLeft === 0) {
      message.innerText = "Bitte Wertung wählen!";
      return;
    }
    for(let i=0;i<5;i++) if (!held[i]) dice[i]=randDice();
    renderDice();
    rollsLeft -= 1;
    if (rollsLeft === 0) message.innerText = "Deine Wertung eintragen!";
    else message.innerText = `Noch ${rollsLeft} Wurf(e). Würfel zum Halten klickbar.`;
  }
};

// Botzug
function botTurn() {
  setTimeout(function() {
    dice = [1,1,1,1,1];
    held = [false, false, false, false, false];
    rollsLeft = 3;
    renderDice();
    message.innerText = "Bot würfelt ...";
    // Drei Würfe stumpf
    for (let t=0;t<3;t++) {
      for(let i=0;i<5;i++) if (!held[i]) dice[i]=randDice();
    }
    let idx = scoreBot.findIndex((v, i) => v === null && i !== 6 && i !== 7 && i !== 15);
    let val = 0;
    if(idx<=5) val = countDice(idx+1)*(idx+1);
    else if(idx===8) val = hasAmount(3) ? sumDice() : 0;
    else if(idx===9) val = hasAmount(4) ? sumDice() : 0;
    else if(idx===10) val = isFullHouse() ? 25 : 0;
    else if(idx===11) val = isSmallStraight() ? 30 : 0;
    else if(idx===12) val = isLargeStraight() ? 40 : 0;
    else if(idx===13) val = isKniffel() ? 50 : 0;
    else if(idx===14) val = sumDice();
    scoreBot[idx] = val;
    let sum = 0;
    for(let j=0;j<=5;j++) sum += scoreBot[j]||0;
    scoreBot[6] = sum;
    scoreBot[1] = sum >= 63 ? 35 : 0;
    let total = 0;
    for(let k=0; k<15; k++) if(scoreBot[k]!==null && k!==15) total += scoreBot[k];
    scoreBot[2] = total;

    isPlayerTurn = true;
    renderTable();
    dice = [1,1,1,1,1];
    held = [false, false, false, false, false];
    rollsLeft = 3;
    renderDice();
    message.innerText = "Dein Zug! 'Würfeln' klicken.";
  }, 900);
}

// Spielmodus-Auswahllogik
btnSolo.onclick = function() {
  mode = "solo";
  modeSelect.style.display = "none";
  gameArea.style.display = "block";
  resetVarsSolo();
  renderDice();
  renderTable();
  message.innerText = "Solo-Spiel – Dein Zug!";
};
btnBot.onclick = function() {
  mode = "bot";
  modeSelect.style.display = "none";
  gameArea.style.display = "block";
  resetVarsBot();
  renderDice();
  renderTable();
  message.innerText = "Du beginnst gegen den Bot!";
};
btnOnline.onclick = function() {
  mode = "online";
  modeSelect.style.display = "none";
  gameArea.style.display = "block";
  renderTable();
  message.innerText = "Online-Modus ist in Arbeit!";
};
btnBack.onclick = function() {
  mode = null;
  gameArea.style.display = "none";
  modeSelect.style.display = "flex";
  message.innerText = "";
};

renderDice();
renderTable();
