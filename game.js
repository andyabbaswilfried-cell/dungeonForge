// ===== Étape 1 : les données =====
const CELL_TYPES = { WALL: 0, FLOOR: 1, DOOR: 2, STAIRS_DOWN: 3, CHEST: 4 };
const CSS_CLASSES = ["wall", "floor", "door", "stairs", "chest"];
let player = {
  name: "Héros",
  x: 0,
  y: 0,
  stats: {
    hp: 100,
    maxHp: 100,
    attack: 15,
    defense: 5,
    level: 1,
    xp: 0,
    xpToNext: 100,
  },
  inventory: [],
  gold: 0,
};

const ENEMY_TEMPLATES = {
  slime: { name: "Slime", hp: 20, attack: 8, defense: 1, xp: 30 },
  gobelin: { name: "Gobelin", hp: 35, attack: 12, defense: 3, xp: 60 },
};

const LOOT = [
  { name: "Potion", type: "potion", value: 30 },
  { name: "Epée", type: "weapon", value: 5 },
  { name: "Bouclier", type: "armor", value: 3 },
];
const hero = { name: "Héros", stats: { hp: 100 } };
console.log(hero.name);
// "Héros"
console.log(hero.stats.hp); // 100  (on enchaîne les points)
hero.stats.hp = 80;

console.log(player.stats.attack, ENEMY_TEMPLATES.gobelin.hp, LOOT.length);
// ===== Étape 2 : la carte =====
const MAP_TEXT = [
  "####################",
  "#@.....#...........#",
  "#......#....S......#",
  "#..C...+...........#",
  "#......#.......G...#",
  "###+####...........#",
  "#......#####+#######",
  "#..S...........C...#",
  "#..............G..>#",
  "####################",
];

const grille = [
  [0, 0, 0],
  [0, 0, 0],
];
console.log(grille[1][1]);

for (let y = 0; y < grille.length; y++) {
  for (let x = 0; x < grille[y].length; x++) {
    console.log(x, y, grille[y][x]);
  }
}

// Pour parcourir toute la grille : une boucle dans une boucle

let map = [];
let enemies = [];

// Fabrique un monstre à partir d'un modèle (on copie les valeurs une à une)
function createEnemy(type, x, y) {
  const t = ENEMY_TEMPLATES[type];
  return {
    name: t.name,
    hp: t.hp,
    attack: t.attack,
    defense: t.defense,
    xp: t.xp,
    x: x,
    y: y,
  };
}
function loadMap() {
  map = [];
  enemies = [];
  for (let y = 0; y < MAP_TEXT.length; y++) {
    const row = [];
    for (let x = 0; x < MAP_TEXT[y].length; x++) {
      const char = MAP_TEXT[y][x];
      if (char === "#") row.push(CELL_TYPES.WALL);
      else if (char === "+") row.push(CELL_TYPES.DOOR);
      // TODO : ">" donne STAIRS_DOWN, "C" donne CHEST
      else if (char === "C") row.push(CELL_TYPES.CHEST);
      else if (char === ">") row.push(CELL_TYPES.STAIRS_DOWN);
      else row.push(CELL_TYPES.FLOOR);
      if (char === "@") {
        player.x = x;
        player.y = y;
      }
      if (char === "S") enemies.push(createEnemy("slime", x, y));
      // TODO : même chose pour "G" avec "gobelin"
      if (char === "G") enemies.push(createEnemy("gobelin", x, y));
    }
    map.push(row);
  }
}

loadMap();
console.log(
  map[0][0],
  map[1][1],
  map[3][3],
  enemies.length,
  player.x,
  player.y,
);

// ===== Étape 3 : afficher =====
const board = document.getElementById("board");
function render() {
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${map[0].length}, 32px)`;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell", CSS_CLASSES[map[y][x]]);
      const enemy = enemies.find((e) => e.x === x && e.y === y);
      if (enemy) cell.classList.add("enemy");
      // TODO : ajoute "player" si la case est celle du héros
      if (player.x === x && player.y === y) {
        cell.classList.add("player");
      }
      board.append(cell);
    }
  }
}

render();

// ===== Étape 4 : se déplacer =====
let gameOver = false;
const DIRECTIONS = {
  ArrowUp: [0, -1],
  z: [0, -1],
  ArrowDown: [0, +1],
  s: [0, +1],
  ArrowLeft: [-1, 0],
  q: [-1, 0],
  ArrowRight: [+1, 0],
  d: [+1, 0],
  // TODO : ArrowLeft / q et ArrowRight / d
};
document.addEventListener("keydown", function (event) {
  const dir = DIRECTIONS[event.key];
  if (!dir || gameOver) return; // touche inconnue ou partie finie
  event.preventDefault();
  tryMove(dir[0], dir[1]);
});
let logLines = [];
function tryMove(dx, dy) {
  // remplace l'ancienne version
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (map[ny][nx] === CELL_TYPES.WALL) return;
  const enemy = enemies.find((e) => e.x === nx && e.y === ny);
  if (enemy) {
    fight(enemy);
  } else {
    player.x = nx;
    player.y = ny;
  }
  render();
}

function damage(attack, defense) {
  return Math.max(1, attack - defense);
}
function fight(enemy) {
  const dmg = damage(player.stats.attack, enemy.defense);
  enemy.hp -= dmg;
  addLog(`Tu frappes ${enemy.name} : -${dmg} PV`);
  if (enemy.hp <= 0) {
    enemies = enemies.filter(e=>e.hp>0); // retire le monstre vaincu
    addLog(`${enemy.name} est vaincu ! +${enemy.xp} XP`);
    gainXp(enemy.xp);
    return;
  }
  const counter = damage(___, ___); // le monstre riposte
  player.stats.hp -= counter;
  addLog(`${enemy.name} riposte : -${counter} PV`);
  // TODO : si les PV du héros tombent à 0 ou moins,
  // mets-les à 0 et appelle endGame(false)
}

function gainXp(amount) {
  const s = player.stats;
  s.xp += amount;
  while (s.xp >= s.xpToNext) {
    s.xp -= s.xpToNext;
    s.level++;
    s.xpToNext = Math.round(s.xpToNext * 1.5);
    s.maxHp += 10;
    s.hp = s.maxHp;
    s.attack += 2;
    addLog(`Niveau ${s.level} ! PV restaurés, +2 ATK`);
  }
}
function addLog(text) {
  logLines.unshift(text);
  logLines = logLines.slice(0, 10);
}
function renderLog() {
  const list = document.getElementById("log");
  list.innerHTML = "";
  for (const line of logLines) {
    const li = document.createElement("li");
    li.textContent = line;
    list.appendChild(li);
  }
}
function endGame(victory) {
  gameOver = true;
  document.getElementById("message").textContent = victory
    ? "Victoire ! Tu as trouvé l'escalier."
    : "Game over...";
}
