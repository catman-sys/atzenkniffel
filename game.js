// game.js – Wertung eintragen nach Kniffelregeln

let dice = [1, 1, 1, 1, 1];
let held = [false, false, false, false, false];
let rollsLeft = 3;

// Speichert die Wertungen, null = noch nicht eingetragen
let score = [
  null, null, null, null, null, null,   // Einser–Sechser
  null, null,                           // Summe/Bonus (werden automatisch berechnet)
  null, null, null, null, null, null,   // Dreierpasch–Chance
  null                                  // Gesamt (wird automatisch berechnet)
];

const categories = [
  "Einser", "Zweier", "Dreier", "Vierer", "Fünfer", "Sechser",
  "Summe oben", "Bonus",
  "Dreierpasch", "Viererpasch", "Full House", "Kleine Straße", "Große Straße", "Kniffel", "Chance", "Gesamt"
];

const diceRow = document.getElementById("dice-row");
const rollBtn = document.getElementById("rollBtn");
const scoreTable = document.getElementById("score-table");
const message = document.getElementById("message");

// Hilfsfunktionen zur Wertberechnung
function countDice(n) {
  return dice.filter(d => d === n).length;
}
function sumDice() {
  return dice.reduce((a, b) => a + b, 0);
}

// Wieviele Würfel zeigen die gleiche Augenzahl?
function hasAmount(n) {
  return [1,2,3,4,5,6].some(val => countDice(val) >= n);
}

// Für Full House
function isFullHouse() {
  let vals = [1,2,3,4,5,6].map(c => countDice(c));
  return vals.includes(3) && vals.includes(2);
}

// Für Kleine Straße (sequence mit 4 aufeinanderfolgenden Zahlen)
function isSmallStraight() {
  let uniq = [...new Set(dice)].sort();
  let str = uniq.join("");
  return str.includes("1234") || str.includes("2345") || str.includes("3456");
}

// Für Große Straße (5 aufeinanderfolgend)
function isLargeStraight() {
  let uniq = [...new Set(dice)].sort();
  let str = uniq.join("");
  return str === "12345" || str === "23456";
}

// Für Kniffel
function isKniffel() {
  return [1,2,3,4,5,6].some(val => countDice(val) === 5);
}

function renderDice() {
  diceRow.innerHTML = "";
  for(let i=0; i<5; i++) {
    const div = document.createElement("div");
    div.className = "dice" + (held[i] ? " selected" : "");
    div.innerHTML = diceUnicode[dice[i]];
    div.onclick = () => {
      if (rollsLeft < 3 && rollsLeft > 0) {
        held[i] = !held[i];
        renderDice();
      }
    };
    diceRow.appendChild(div);
  }
}

function renderTable() {
  let html = "<tr><th>Kategorie</th><th>Punkte</th></tr>";
  categories.forEach((cat, idx) => {
    let value = score[idx];
    let locked = value !== null;
    let dis = (locked || idx === 6 || idx === 7 || idx === 15) ? "disabled" : "";
    html += `<tr>
      <td>${cat}</td>
      <td>
        <input type="text" value="${value !== null ? value : ""}"
          readonly ${dis}
          onclick="window.enterScore(${idx})"
          style="cursor:${(!locked && rollsLeft===0 && idx < 15) ? 'pointer' : 'not-allowed'};">
      </td>
    </tr>`;
  });
  scoreTable.innerHTML = html;
}

// Globale Funktion im Fenster für onClick in Table
window.enterScore = function(idx) {
  // Nur wenn würfeln fertig und Kategorie offen
  if(rollsLeft > 0 || score[idx] !== null || idx === 6 || idx === 7 || idx === 15) return;

  // Wert berechnen (vereinfachte Kniffelregeln)
  let val = 0;
  if(idx<=5) val = countDice(idx+1)*(idx+1); // Einser–Sechser
  else if(idx===8) val = hasAmount(3) ? sumDice() : 0;
  else if(idx===9) val = hasAmount(4) ? sumDice() : 0;
  else if(idx===10) val = isFullHouse() ? 25 : 0;
  else if(idx===11) val = isSmallStraight() ? 30 : 0;
  else if(idx===12) val = isLargeStraight() ? 40 : 0;
  else if(idx===13) val = isKniffel() ? 50 : 0;
  else if(idx===14) val = sumDice();
  else val = 0;

  score[idx] = val;

  // Oberer Block: Summe & Bonus
  if(idx<=5) {
    let sum = 0;
    for(let j=0;j<=5;j++) sum += score[j]||0;
    score[6] = sum;
    score[1] = sum >= 63 ? 35 : 0;
  }
  // Gesamt am Schluss
  let total = 0;
  for(let k=0; k<15; k++)
    if (score[k]!==null && k!==15) total += score[k];
  score[2] = total;

  // Neue Runde!
  dice = [1,1,1,1,1];
  held = [false, false, false, false, false];
  rollsLeft = 3;
  message.innerText = "Punkte eingetragen! Starte eine neue Runde.";
  renderDice();
  renderTable();
};

rollBtn.onclick = () => {
  if (rollsLeft === 0) {
    message.innerText = "Bitte trage eine Wertung ein.";
    return;
  }
  for(let i=0;i<5;i++) {
    if (!held[i]) dice[i]=randDice();
  }
  renderDice();
  rollsLeft -= 1;
  if (rollsLeft === 0) {
    message.innerText = "Bitte auf eine Wertung klicken, um Punkte einzutragen!";
  } else {
    message.innerText = `Noch ${rollsLeft} Wurf(e). Klicke auf Würfel zum Halten!`;
  }
};

// Unicode für Würfe (wie zuvor)
const diceUnicode = ["","⚀","⚁","⚂","⚃","⚄","⚅"];

renderDice();
renderTable();
message.innerText = "Klicke 'Würfeln', um zu starten!";
