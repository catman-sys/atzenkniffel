// game.js – Kniffel Grundlogik

// Kniffel: Es gibt 5 Würfel
let dice = [1,1,1,1,1];

function randDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// Würfelanzeige mit Unicode-Zeichen (Vereinfachung für den Start, hübsche SVGs kommen später!)
const diceUnicode = ["", "⚀","⚁","⚂","⚃","⚄","⚅"];

// Aktuelles Roll-Limit für eine Runde
let rollsLeft = 3;

// Kategorien für Kniffel-Tabelle (Oberer und unterer Bereich, einfach gehalten)
const categories = [
  "Einser", "Zweier", "Dreier", "Vierer", "Fünfer", "Sechser",
  "Summe oben", "Bonus",
  "Dreierpasch", "Viererpasch", "Full House", "Kleine Straße", "Große Straße", "Kniffel", "Chance", "Gesamt"
];

// === DOM-Elemente ===
const diceRow = document.getElementById("dice-row");
const rollBtn = document.getElementById("rollBtn");
const scoreTable = document.getElementById("score-table");
const message = document.getElementById("message");

// Würfelsymbole anzeigen
function renderDice() {
  diceRow.innerHTML = "";
  for(let i=0; i<5; i++) {
    const div = document.createElement("div");
    div.className = "dice";
    div.innerHTML = diceUnicode[dice[i]];
    diceRow.appendChild(div);
  }
}

// Tabelle anzeigen (einfach, alle Kategorien)
function renderTable() {
  let html = "<tr><th>Kategorie</th><th>Punkte</th></tr>";
  categories.forEach(cat => {
    html += `<tr>
      <td>${cat}</td>
      <td><input type="number" name="${cat}" disabled></td>
    </tr>`;
  });
  scoreTable.innerHTML = html;
}

// Würfeln-Button-Logik
rollBtn.onclick = () => {
  if (rollsLeft === 0) {
    message.innerText = "Du hast in dieser Runde schon 3-mal geworfen!";
    return;
  }

