// Работаем внутри Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// ========== ПАРСИНГ QUERY-ПАРАМЕТРОВ ==========
function getIntParam(name, def) {
  const v = new URLSearchParams(location.search).get(name);
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function getTopFromParam() {
  const b64 = new URLSearchParams(location.search).get("top");
  if (!b64) return [];
  try {
    // добавим недостающие '=' для base64
    const pad = "=".repeat((4 - (b64.length % 4)) % 4);
    const json = atob(b64 + pad);
    const arr = JSON.parse(json);
    if (Array.isArray(arr)) return arr;
  } catch (e) {
    console.warn("TOP decode error", e);
  }
  return [];
}

// ========== СОСТОЯНИЕ И ИНИЦИАЛИЗАЦИЯ ==========
const userId = (tg.initDataUnsafe?.user?.id) || "local";
const LS_KEY = `tg_clicker_state_${userId}`;

let balance = getIntParam("b", 0);
let clickPower = getIntParam("cp", 1);
let passiveIncome = getIntParam("pi", 1);
let clickLevel = getIntParam("cl", 1);
let clickXP = getIntParam("xp", 0);
const xpPerLevel = 50;

// Если по какой-то причине урла без параметров — попробуем взять локальный кэш
if (new URLSearchParams(location.search).get("b") === null) {
  try {
    const cached = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    if (typeof cached.balance === "number") {
      balance = cached.balance;
      clickPower = cached.clickPower ?? clickPower;
      passiveIncome = cached.passiveIncome ?? passiveIncome;
      clickLevel = cached.clickLevel ?? clickLevel;
      clickXP = cached.clickXP ?? clickXP;
    }
  } catch (_) {}
}

function saveLocal() {
  localStorage.setItem(LS_KEY, JSON.stringify({
    balance, clickPower, passiveIncome, clickLevel, clickXP
  }));
}

// ========== ЭЛЕМЕНТЫ UI ==========
const balanceEl = document.getElementById('balance');
const clickPowerEl = document.getElementById('clickPower');
const passiveIncomeEl = document.getElementById('passiveIncome');
const clickLevelEl = document.getElementById('clickLevel');
const clickImage = document.getElementById('clickImage');
const clickProgressEl = document.getElementById('clickProgress');
const leaderboardEl = document.getElementById('leaderboard');

const frames = ["frames/frame1.png","frames/frame2.png","frames/frame3.png"];
let frameIndex = 0;

// ========== ОТРИСОВКА ==========
function updateStats(){
  balanceEl.textContent = balance;
  clickPowerEl.textContent = clickPower;
  passiveIncomeEl.textContent = passiveIncome;
  clickLevelEl.textContent = clickLevel;
  updateClickProgress();
}

function updateClickProgress() {
  const progress = Math.min((clickXP / xpPerLevel) * 100, 100);
  clickProgressEl.style.width = progress + '%';
}

function animateJump(el) {
  el.style.animation = "jump 0.25s";
  setTimeout(() => el.style.animation = "", 250);
}

function animateBlink(el) {
  el.style.animation = "blink 0.2s";
  setTimeout(() => el.style.animation = "", 200);
}

// ========== ЛИДЕРБОРД (из URL) ==========
function renderTopFromUrl() {
  const top = getTopFromParam();
  leaderboardEl.innerHTML = "";
  if (!top.length) {
    leaderboardEl.innerHTML = "<p>Топ пока пуст…</p>";
    return;
  }
  const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];
  const title = document.createElement("h3");
  title.textContent = "🏆 Топ игроков";
  leaderboardEl.appendChild(title);

  top.forEach((u, i) => {
    const p = document.createElement("p");
    const medal = medals[i] || `${i+1}️⃣`;
    p.textContent = `${medal} ${u.username} — ${u.balance} 💰`;
    leaderboardEl.appendChild(p);
  });
}

// ========== ОТПРАВКА ДАННЫХ БОТУ ==========
function send(action, extra = {}) {
  const payload = {
    action,
    balance,
    clickPower,
    passiveIncome,
    clickLevel,
    clickXP,
    ...extra
  };
  try { tg.sendData(JSON.stringify(payload)); } catch {}
}

// ========== ЛОГИКА ИГРЫ ==========
function levelUpIfNeed() {
  if (clickXP >= xpPerLevel) {
    clickXP -= xpPerLevel;
    clickLevel += 1;
    clickPower += 1;
    animateJump(clickImage);
  }
}

clickImage.addEventListener('click', () => {
  balance += clickPower;
  clickXP += clickPower;

  frameIndex = (frameIndex + 1) % frames.length;
  clickImage.src = frames[frameIndex];
  animateJump(clickImage);

  levelUpIfNeed();
  updateStats();
  saveLocal();

  send("click");
});

// улучшение клика
document.getElementById('upgradeClick').addEventListener('click', () => {
  const price = 10;
  if (balance >= price) {
    balance -= price;
    clickPower += 1;
    updateStats();
    saveLocal();
    send("upgradeClick");
  } else {
    animateBlink(clickPowerEl);
  }
});

// пассивный доход
document.getElementById('upgradePassive').addEventListener('click', () => {
  const price = 20;
  if (balance >= price) {
    balance -= price;
    passiveIncome += 1;
    updateStats();
    saveLocal();
    send("upgradePassive");
  } else {
    animateBlink(passiveIncomeEl);
  }
});

// пассивка раз в минуту
setInterval(() => {
  balance += passiveIncome;
  updateStats();
  saveLocal();
  send("passiveIncome");
}, 60000);

// моргание раз в 3 сек (косметика)
setInterval(() => animateBlink(clickImage), 3000);

// стартовый рендер
updateStats();
renderTopFromUrl();
