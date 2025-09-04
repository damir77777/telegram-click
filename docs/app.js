// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

let balance = 0;
let clickPower = 1;
let passiveIncome = 1;
let clickLevel = 1;
let clickXP = 0;
const xpPerLevel = 50;

// Элементы
const balanceEl = document.getElementById('balance');
const clickPowerEl = document.getElementById('clickPower');
const passiveIncomeEl = document.getElementById('passiveIncome');
const clickLevelEl = document.getElementById('clickLevel');
const clickImage = document.getElementById('clickImage');
const clickProgressEl = document.getElementById('clickProgress');
const topListEl = document.getElementById('topList');

const frames = ["frames/frame1.png","frames/frame2.png","frames/frame3.png"];
let frameIndex = 0;

// Моргание
setInterval(() => {
    clickImage.style.animation = "blink 0.2s";
    setTimeout(() => clickImage.style.animation = "", 200);
}, 3000);

// Обновление статистики
function updateStats() {
    balanceEl.textContent = balance;
    clickPowerEl.textContent = clickPower;
    passiveIncomeEl.textContent = passiveIncome;
    clickLevelEl.textContent = clickLevel;
    updateClickProgress();
}

// Прогресс клика
function updateClickProgress() {
    const progress = Math.min((clickXP / xpPerLevel) * 100, 100);
    clickProgressEl.style.width = progress + '%';
}

// Анимация уровня
function animateLevelUp() {
    clickImage.style.transform = "scale(1.2)";
    clickImage.style.animation = "jump 0.3s";
    setTimeout(() => {
        clickImage.style.transform = "scale(1)";
        clickImage.style.animation = "";
    }, 300);
}

// Отправка данных боту
function sendDataToBot(data) {
    tg.sendData(JSON.stringify(data));
}

// Клик по картинке
clickImage.addEventListener('click', () => {
    balance += clickPower;
    clickXP += clickPower;

    if (clickXP >= xpPerLevel) {
        clickLevel++;
        clickXP -= xpPerLevel;
        clickPower++;
        animateLevelUp();
    }

    updateStats();

    frameIndex = (frameIndex + 1) % frames.length;
    clickImage.src = frames[frameIndex];
    clickImage.style.animation = "jump 0.3s";
    setTimeout(() => clickImage.style.animation = "", 300);

    sendDataToBot({action: "click", balance, clickPower, clickLevel, passiveIncome});
});

// Улучшение клика
document.getElementById('upgradeClick').addEventListener('click', () => {
    if(balance >= 10){
        balance -= 10;
        clickPower += 1;
        updateStats();
        sendDataToBot({action: "upgradeClick", balance, clickPower});
    }
});

// Улучшение пассивного дохода
document.getElementById('upgradePassive').addEventListener('click', () => {
    if(balance >= 20){
        balance -= 20;
        passiveIncome += 1;
        updateStats();
        sendDataToBot({action: "upgradePassive", balance, passiveIncome});
    }
});

// Пассивный доход каждую минуту
setInterval(() => {
    balance += passiveIncome;
    updateStats();
    sendDataToBot({action: "passiveIncome", balance, passiveIncome});
}, 60000);

// --- Запрос текущих данных у бота при загрузке ---
tg.onEvent('mainButtonClicked', () => {
    sendDataToBot({action: "get_stats"});
});

// Обновление топ-5 (через callback из бота)
function updateTopList(topArray) {
    topListEl.innerHTML = "";
    const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    topArray.forEach((user, i) => {
        const li = document.createElement('li');
        li.textContent = `${medals[i]} ${user.username} — ${user.balance} 💰`;
        topListEl.appendChild(li);
    });
}
