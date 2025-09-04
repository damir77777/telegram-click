// Подключение к Telegram Web App
const tg = window.Telegram.WebApp;

// Статистика пользователя
let balance = 0;
let clickPower = 1;
let passiveIncome = 1;
let clickLevel = 1;
let clickXP = 0;
const xpPerLevel = 50;

const balanceEl = document.getElementById('balance');
const clickPowerEl = document.getElementById('clickPower');
const passiveIncomeEl = document.getElementById('passiveIncome');
const clickLevelEl = document.getElementById('clickLevel');
const clickImage = document.getElementById('clickImage');
const clickProgressEl = document.getElementById('clickProgress');
const leaderboardEl = document.getElementById('leaderboard');

const frames = [,"frames/frame2.png","frames/frame3.png"];
let frameIndex = 0;

// Обновление UI
function updateStats(){
    balanceEl.textContent = balance;
    clickPowerEl.textContent = clickPower;
    passiveIncomeEl.textContent = passiveIncome;
    clickLevelEl.textContent = clickLevel;
}

function updateClickProgress() {
    const progress = Math.min((clickXP / xpPerLevel) * 100, 100);
    clickProgressEl.style.width = progress + '%';
    if(clickXP >= xpPerLevel){
        clickLevel++;
        clickXP -= xpPerLevel;
        clickPower += 1;
        updateStats();
        animateLevelUp();
    }
}

function animateLevelUp() {
    clickImage.style.transform = "scale(1.2)";
    clickImage.style.animation = "jump 0.3s";
    setTimeout(() => {
        clickImage.style.transform = "scale(1)";
        clickImage.style.animation = "";
    }, 300);
}

// Отправка данных в бота
function sendDataToBot(data){
    if(tg) {
        tg.sendData(JSON.stringify(data));
    }
}

// Загрузка прогресса при открытии
function loadProgress() {
    sendDataToBot({action: "get_stats"});
}

// Клик по картинке
clickImage.addEventListener('click', () => {
    balance += clickPower;
    clickXP += clickPower;

    updateStats();
    updateClickProgress();

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

// Обновление таблицы лидеров в Web App
function updateLeaderboard(users){
    leaderboardEl.innerHTML = "<h3>🏆 Топ игроков</h3>";
    users.forEach((user, i) => {
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}️⃣`;
        const el = document.createElement('p');
        el.textContent = `${medal} ${user.name} — ${user.balance} 💰`;
        leaderboardEl.appendChild(el);
    });
}

// Получение прогресса и топа от бота
tg.onEvent('data', (msg) => {
    try {
        const data = JSON.parse(msg);
        if(data.type === "stats"){
            balance = data.balance;
            clickPower = data.clickPower;
            passiveIncome = data.passiveIncome;
            clickLevel = data.clickLevel;
            clickXP = data.clickXP;
            updateStats();
            updateClickProgress();
        } else if(data.type === "top"){
            updateLeaderboard(data.top);
        }
    } catch(e) {
        console.error(e);
    }
});

// Загрузка прогресса при открытии
loadProgress();

