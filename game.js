// game.js – Korrigierte Version für Solo/Bot mit sauberer Wertungslogik

function randDice() {
  return Math.floor(Math.random() * 6) + 1;
}

let mode = null; // "solo"|"bot"|"online"

const modeSelect = document.getElementById('mode-select');
const gameArea   = document.getElementById('game-area');
const btnSolo    = document.getElementById('btn-solo');
const btnBot     = document.getElementById('btn-bot');
const btnOnline  = document.getElementById('btn-online');
const btnBack    = document.getElementById('btn-back');
const diceRow    = document.getElementById("dice-row");
const rollBtn    = document.getElementById("rollBtn");
const scoreTable = document.getElementById("score-table");
const message    = document.getElementById("message");

const categories = [
  "Einser", "Zweier", "Dreier", "Vierer", "Fünfer", "Sechser",
  "Summe oben", "Bonus",
  "Dreierpasch", "Viererpasch", "Full House", "Kleine Straße", "Große Straße", "Kniffel", "Chance", "Gesamt"
];
const diceUnicode = ["","⚀","⚁","⚂","⚃","⚄","⚅"];

// State
let dice = [1,1,1,1,1];
let held = [false, false, false, false, false];
let rollsLeft = 3;

// Solo
let scoreSolo = Array(16).fill(null);
// Bot
let scorePlayer = Array(16).fill(null);
let scoreBot    = Array(16).fill(null);
let isPlayerTurn = true;

// ----- Init / Reset -----
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
  scoreBot    = Array(16).fill(null);
  isPlayerTurn = true;
}

// ----- Render -----
function renderDice() {
  diceRow.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const div = document.createElement("div");
    div.className = "dice" + (held[i] ? " selected" : "");
    div.innerHTML = diceUnicode[dice[i]];
    div.onclick = () => {
      if (mode === "solo" && rollsLeft < 3 && rollsLeft > 0) {
        held[i] = !held[i]; renderDice();
      }
      if (mode === "bot" && rollsLeft < 3 && rollsLeft > 0 && isPlayerTurn) {
        held[i] = !held[i]; renderDice();
      }
    };
    diceRow.appendChild(div);
  }
}

function renderTable() {
  let html;
  if (mode === "solo") {
    html = "<tr><th>Kategorie</th><th>Punkte</th></tr>";
    categories.forEach((cat, idx) => {
      const value  = scoreSolo[idx];
      const locked = value !== null;
      const dis = (locked || idx === 6 || idx === 7 || idx === 15) ? "disabled" : "";
      html += `<tr>
        <td>${cat}</td>
        <td>
          <input type="text" value="${value !== null ? value : ""}"
            readonly ${dis}
            onclick="window.enterScoreSolo(${idx})"
            style="cursor:${(!locked && rollsLeft===0 && idx < 15) ? 'pointer' : 'not-allowed'};">
        </td></tr>`;
    });
  } else if (mode === "bot") {
    html = "<tr><th>Kategorie</th><th>Du</th><th>Bot</th></tr>";
    categories.forEach((cat, idx) => {
      const valP = scorePlayer[idx] !== null ? scorePlayer[idx] : "";
      const valB = scoreBot[idx]    !== null ? scoreBot[idx]    : "";
      const locked = scorePlayer[idx] !== null || idx === 6 || idx === 7 || idx === 15;
      html += `<tr>
        <td>${cat}</td>
        <td>
          <input type="text" value="${valP}" readonly ${locked || !isPlayerTurn || rollsLeft>0 ? 'disabled' : ''}
            onclick="window.enterScoreBot(${idx})"
            style="cursor:${(!locked && isPlayerTurn && rollsLeft===0 && idx < 15) ? 'pointer':'not-allowed'};">
        </td>
        <td><input type="text" value="${valB}" readonly disabled></td>
      </tr>`;
    });
  }
  if (mode === "online") {
    html = `<tr><td colspan="3">Der Online-Modus ist in Vorbereitung! Bald kannst du gegen Freunde spielen.</td></tr>`;
  }
  scoreTable.innerHTML = html;
}

// ----- Helpers -----
function countDice(n) { return dice.filter(d => d === n).length; }
function sumDice()    { return dice.reduce((a, b) => a + b, 0); }
function hasAmount(n) { return [1,2,3,4,5,6].some(v => countDice(v) >= n); }
function isFullHouse() {
  const vals = [1,2,3,4,5,6].map(c => countDice(c));
  return vals.includes(3) && vals.includes(2);
}
function isSmallStraight() {
  const uniq = [...new Set(dice)].sort(); const str = uniq.join("");
  return str.includes("1234") || str.includes("2345") || str.includes("3456");
}
function isLargeStraight() {
  const uniq = [...new Set(dice)].sort(); const str = uniq.join("");
  return str === "12345" || str === "23456";
}
function isKniffel() { return [1,2,3,4,5,6].some(v => countDice(v) === 5); }

// zentrales Recompute (korrekte Indizes!)
function recomputeTotals(arr) {
  // Summe oben (Index 6)
  let upper = 0;
  for (let j = 0; j <= 5; j++) upper += arr[j] || 0;
  arr[6] = upper;
  // Bonus (Index 7)
  arr[7] = upper >= 63 ? 35 : 0;
  // Gesamt (Index 15)
  let total = 0;
  for (let k = 0; k < 15; k++) if (arr[k] !== null && k !== 15) total += arr[k];
  arr[15] = total;
}

// ----- Wertung Solo -----
window.enterScoreSolo = function(idx) {
  if (rollsLeft > 0 || scoreSolo[idx] !== null || idx === 6 || idx === 7 || idx === 15) return;

  let val = 0;
  if (idx <= 5)      val = countDice(idx + 1) * (idx + 1);
  else if (idx === 8)  val = hasAmount(3) ? sumDice() : 0;
  else if (idx === 9)  val = hasAmount(4) ? sumDice() : 0;
  else if (idx === 10) val = isFullHouse() ? 25 : 0;
  else if (idx === 11) val = isSmallStraight() ? 30 : 0;
  else if (idx === 12) val = isLargeStraight() ? 40 : 0;
  else if (idx === 13) val = isKniffel() ? 50 : 0;
  else if (idx === 14) val = sumDice();

  scoreSolo[idx] = val;
  recomputeTotals(scoreSolo);

  dice = [1,1,1,1,1];
  held = [false,false,false,false,false];
  rollsLeft = 3;
  renderDice();
  renderTable();
  message.innerText = "Neue Runde – Würfeln!";
};

// ----- Wertung Spieler im Bot-Modus -----
window.enterScoreBot = function(idx) {
  if (rollsLeft > 0 || scorePlayer[idx] !== null || idx === 6 || idx === 7 || idx === 15 || !isPlayerTurn) return;

  let val = 0;
  if (idx <= 5)      val = countDice(idx + 1) * (idx + 1);
  else if (idx === 8)  val = hasAmount(3) ? sumDice() : 0;
  else if (idx === 9)  val = hasAmount(4) ? sumDice() : 0;
  else if (idx === 10) val = isFullHouse() ? 25 : 0;
  else if (idx === 11) val = isSmallStraight() ? 30 : 0;
  else if (idx === 12) val = isLargeStraight() ? 40 : 0;
  else if (idx === 13) val = isKniffel() ? 50 : 0;
  else if (idx === 14) val = sumDice();

  scorePlayer[idx] = val;
  recomputeTotals(scorePlayer);

  isPlayerTurn = false;
  botTurn();
};

// ----- Würfeln -----
rollBtn.onclick = () => {
  if (mode === "solo") {
    if (rollsLeft === 0) { message.innerText = "Bitte trage eine Wertung ein!"; return; }
    for (let i = 0; i < 5; i++) if (!held[i]) dice[i] = randDice();
    renderDice();
    rollsLeft -= 1;
    message.innerText = (rollsLeft === 0)
      ? "Wertung eintragen!"
      : `Noch ${rollsLeft} Wurf(e). Zum Halten Würfel anklicken.`;
  }
  if (mode === "bot") {
    if (!isPlayerTurn) return;
    if (rollsLeft === 0) { message.innerText = "Bitte Wertung wählen!"; return; }
    for (let i = 0; i < 5; i++) if (!held[i]) dice[i] = randDice();
    renderDice();
    rollsLeft -= 1;
    message.innerText = (rollsLeft === 0)
      ? "Deine Wertung eintragen!"
      : `Noch ${rollsLeft} Wurf(e). Würfel zum Halten klickbar.`;
  }
};

// ----- Botzug -----
function botTurn() {
  setTimeout(function() {
    dice = [1,1,1,1,1];
    held = [false,false,false,false,false];
    rollsLeft = 3;
    renderDice();
    message.innerText = "Bot würfelt ...";

    // sehr einfache Bot-Logik: 3x voll würfeln, dann erste freie Kategorie belegen
    for (let t = 0; t < 3; t++) {
      for (let i = 0; i < 5; i++) if (!held[i]) dice[i] = randDice();
    }

    const idx = scoreBot.findIndex((v, i) => v === null && i !== 6 && i !== 7 && i !== 15);
    let val = 0;
    if (idx <= 5)       val = countDice(idx + 1) * (idx + 1);
    else if (idx === 8)  val = hasAmount(3) ? sumDice() : 0;
    else if (idx === 9)  val = hasAmount(4) ? sumDice() : 0;
    else if (idx === 10) val = isFullHouse() ? 25 : 0;
    else if (idx === 11) val = isSmallStraight() ? 30 : 0;
    else if (idx === 12) val = isLargeStraight() ? 40 : 0;
    else if (idx === 13) val = isKniffel() ? 50 : 0;
    else if (idx === 14) val = sumDice();

    scoreBot[idx] = val;
    recomputeTotals(scoreBot);

    isPlayerTurn = true;
    renderTable();

    dice = [1,1,1,1,1];
    held = [false,false,false,false,false];
    rollsLeft = 3;
    renderDice();
    message.innerText = "Dein Zug! 'Würfeln' klicken.";
  }, 900);
}

// ----- Modus-Auswahl -----
btnSolo.onclick = function() {
  mode = "solo";
  modeSelect.style.display = "none";
  gameArea.style.display = "block";
  resetVarsSolo();
  renderDice(); renderTable();
  message.innerText = "Solo-Spiel – Dein Zug!";
};
btnBot.onclick = function() {
  mode = "bot";
  modeSelect.style.display = "none";
  gameArea.style.display = "block";
  resetVarsBot();
  renderDice(); renderTable();
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
