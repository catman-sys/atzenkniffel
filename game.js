// game.js – Kniffel Grundlogik Teil 2 (Würfel festhalten)

let dice = [1,1,1,1,1];
// Merke: Welche Würfel sind gehalten?
let held = [false, false, false, false, false];

function randDice() {
  return Math.floor(Math.random() * 6) + 1;
}

const diceUnicode = ["", "⚀","⚁","⚂","⚃","⚄","⚅"];

let rollsLeft = 3;

const categories = [
  "Einser", "Zweier", "Dreier", "Vierer", "Fünfer", "Sechser",
  "Summe oben", "Bonus",
  "Dreierpasch", "Viererpasch", "Full House", "Kleine Straße", "Große Straße", "Kniffel", "Chance", "Gesamt"
];

const diceRow = document.getElementById("dice-row");
const rollBtn = document.getElementById("rollBtn");
const scoreTable = document.getElementById("score-table");
const message = document.getElementById("message");

function renderDice() {
  diceRow.innerHTML = "";
  for(let i=0; i<5; i++) {
    const div = document.createElement("div");
    div.className = "dice" + (held[i] ? " selected" : "");
    div.innerHTML = diceUnicode[dice[i]];
    // Klick auf Würfel: "halten" (umschalten)
    div.onclick = () => {
      if (rollsLeft < 3 && rollsLeft > 0) {
        held[i] = !held[i];
        renderDice();
      }
    };
    diceRow.appendChild(div);
  }
}

// Tabelle (gleich, wie oben)
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

rollBtn.onclick = () => {
  if (rollsLeft === 0) {
    message.innerText = "Runde vorbei! Bitte trage eine Wertung ein.";
    return;
  }
  for(let i=0;i<5;i++) {
    if (!held[i]) dice[i]=randDice();
  }
  renderDice();
  rollsLeft -= 1;
  if (rollsLeft === 0) {
    message.innerText = "Runde vorbei! Bitte wähle eine Wertung.";
  } else {
    message.innerText = `Noch ${rollsLeft} Wurf(e) übrig. Klicke auf Würfel zum Halten!`;
  }
};

// Spiel starten/zurücksetzen für neue Runde (Bonus, bald interaktiv!)
function resetRound() {
  dice = [1,1,1,1,1];
  held = [false, false, false, false, false];
  rollsLeft = 3;
  renderDice();
  message.innerText = "Neue Runde – Würfeln!";
}

renderDice();
renderTable();
message.innerText = "Klicke 'Würfeln', um zu starten!";
