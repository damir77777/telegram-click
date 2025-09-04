// Инициализация
let balance = 0;
let clickPower = 1;
let passiveIncome = 1;
let clickLevel = 1;
let clickXP = 0;
const xpPerLevel = 50;

// Элементы DOM
const balanceEl = document.getElementById('balance');
const clickPowerEl = document.getElementById('clickPower');
const passiveIncomeEl = document.getElementById('passiveIncome');
const clickLevelEl = document.getElementById('clickLevel');
const clickImage = document.getElementById('clickImage');
const clickProgressEl = document.getElementById('clickProgress');
const leaderboardEl = document.getElementById('leaderboard');

// Фреймы анимации клика
const frames = ["frames/frame1.png", "frames/frame2.png", "frames/frame3.png"];
let frameIndex = 0;

// Обновление статистики на странице
function updateStats() {
    balanceEl.textContent = balance;
    clickPowerEl.textContent = clickPower;
    passiveIncomeEl.textContent = passiveIncome;
    clickLevelEl.textContent = clickLevel;
}

// Прогресс бар клика
function updateClickProgress() {
    const progress = Math.min((clickXP / xpPerLevel) * 100, 100);
    clickProgressEl.style.width = progress + '%';
    if (clickXP >= xpPerLevel) {
        clickLevel++;
        clickXP = 0;
        clickPower += 1;
        updateStats();
        animateLevelUp();
    }
}

// Анимация прыжка при повышении уровня
function animateLevelUp() {
    clickImage.style.transform = "scale(1.2)";
    clickImage.style.animation = "jump 0.3s";
    setTimeout(() => {
        clickImage.style.transform = "scale(1)";
        clickImage.style.animation = "";
    }, 300);
}

// Отправка данных на сервер через Telegram Web App
function sendDataToBot(data) {
    if (window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(data));
    }
}

// Обработка клика по картинке
clickImage.addEventListener('click', () => {
    balance += clickPower;
    clickXP += clickPower;
    updateStats();
    updateClickProgress();

    frameIndex = (frameIndex + 1) % frames.length;
    clickImage.src = frames[frameIndex];

    // Анимация прыжка
    clickImage.style.animation = "jump 0.3s";
    setTimeout(() => clickImage.style.animation = "", 300);

    sendDataToBot({action: "click", balance, clickPower, clickLevel, passiveIncome});
});

// Улучшение клика
document.getElementById('upgradeClick').addEventListener('click', () => {
    if (balance >= 10) {
        balance -= 10;
        clickPower += 1;
        updateStats();
        sendDataToBot({action: "upgradeClick", balance, clickPower});
    }
});

// Улучшение пассивного дохода
document.getElementById('upgradePassive').addEventListener('click', () => {
    if (balance >= 20) {
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

// Запрос начальных данных при открытии Web App
window.Telegram.WebApp.onEvent('mainButtonClicked', () => {
    sendDataToBot({action: "get_stats"});
});

// Обновление таблицы лидеров
function updateLeaderboard(leaderboard) {
    leaderboardEl.innerHTML = "<h3>Топ игроков</h3>";
    leaderboard.forEach((player, index) => {
        let medal = "";
        if(index === 0) medal = "🥇";
        else if(index === 1) medal = "🥈";
        else if(index === 2) medal = "🥉";
        leaderboardEl.innerHTML += `<p>${medal} ${player.username}: ${player.balance} 💰</p>`;
    });
}

// Обработка сообщений от Telegram Bot
window.Telegram.WebApp.onDataReceived = (data) => {
    const parsed = JSON.parse(data);
    if(parsed.leaderboard) {
        updateLeaderboard(parsed.leaderboard);
    }
    if(parsed.balance !== undefined) {
        balance = parsed.balance;
        clickPower = parsed.clickPower;
        passiveIncome = parsed.passiveIncome;
        clickLevel = parsed.clickLevel;
        clickXP = parsed.clickXP;
        updateStats();
        updateClickProgress();
    }
};
