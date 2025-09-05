const balanceEl = document.getElementById('balance');
const clickPowerEl = document.getElementById('clickPower');
const passiveIncomeEl = document.getElementById('passiveIncome');
const clickLevelEl = document.getElementById('clickLevel');
const clickImage = document.getElementById('clickImage');
const clickProgressEl = document.getElementById('clickProgress');
const leaderboardEl = document.getElementById('leaderboard');

let balance = 0, clickPower = 1, passiveIncome = 1, clickLevel = 1, clickXP = 0;

// --- Получаем текущие данные из БД при открытии ---
window.Telegram.WebApp.onEvent('web_app_opened', () => {
    sendDataToBot({action: "get_stats"});
});

function updateStats() {
    balanceEl.textContent = balance;
    clickPowerEl.textContent = clickPower;
    passiveIncomeEl.textContent = passiveIncome;
    clickLevelEl.textContent = clickLevel;

    const progress = Math.min((clickXP / 50) * 100, 100);
    clickProgressEl.style.width = progress + '%';
}

function sendDataToBot(data) {
    if (window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(data));
    }
}

// Обработка клика
clickImage.addEventListener('click', () => {
    balance += clickPower;
    clickXP += clickPower;

    if (clickXP >= 50) {
        clickLevel++;
        clickXP = 0;
        clickPower++;
    }

    updateStats();
    sendDataToBot({action:"click", balance, clickPower, clickLevel, passiveIncome});
});

// Улучшения
document.getElementById('upgradeClick').addEventListener('click', () => {
    if(balance >= 10){
        balance -= 10;
        clickPower++;
        updateStats();
        sendDataToBot({action:"upgradeClick", balance, clickPower});
    }
});

document.getElementById('upgradePassive').addEventListener('click', () => {
    if(balance >= 20){
        balance -= 20;
        passiveIncome++;
        updateStats();
        sendDataToBot({action:"upgradePassive", balance, passiveIncome});
    }
});

// Пассивный доход каждые 60 секунд
setInterval(() => {
    balance += passiveIncome;
    updateStats();
    sendDataToBot({action:"passiveIncome", balance, passiveIncome});
}, 60000);

// --- Обновление статистики от бота ---
function updateFromBot(data) {
    balance = data.balance;
    clickPower = data.clickPower;
    passiveIncome = data.passiveIncome;
    clickLevel = data.clickLevel;
    clickXP = data.clickXP;
    updateStats();
}

// --- Лидеры (будет приходить из бота через JSON) ---
function updateLeaderboard(users) {
    leaderboardEl.innerHTML = '';
    const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    users.forEach((u,i)=>{
        const li = document.createElement('li');
        li.textContent = `${medals[i] || ""} ${u.name} — ${u.balance} 💰`;
        leaderboardEl.appendChild(li);
    });
}
