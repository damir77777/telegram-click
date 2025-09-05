// Получаем элементы
const balanceEl = document.getElementById('balance');
const clickPowerEl = document.getElementById('clickPower');
const passiveIncomeEl = document.getElementById('passiveIncome');
const clickLevelEl = document.getElementById('clickLevel');
const clickImage = document.getElementById('clickImage');
const clickProgressEl = document.getElementById('clickProgress');
const leaderboardEl = document.getElementById('leaderboard');

let balance = 0, clickPower = 1, passiveIncome = 1, clickLevel = 1, clickXP = 0;

// --- Обновление UI ---
function updateStats() {
    balanceEl.textContent = balance;
    clickPowerEl.textContent = clickPower;
    passiveIncomeEl.textContent = passiveIncome;
    clickLevelEl.textContent = clickLevel;
    clickProgressEl.style.width = Math.min((clickXP/50)*100,100) + "%";
}

// --- Отправка данных в бота ---
function sendData(data){
    if(window.Telegram && window.Telegram.WebApp){
        window.Telegram.WebApp.sendData(JSON.stringify(data));
    }
}

// --- Клик по картинке ---
clickImage.addEventListener('click', () => {
    balance += clickPower;
    clickXP += clickPower;
    updateStats();
    sendData({action:"click", balance, clickPower, clickLevel, passiveIncome});
});

// --- Кнопки апгрейда ---
document.getElementById('upgradeClick').addEventListener('click', () => {
    if(balance >= 10){
        balance -= 10;
        clickPower += 1;
        updateStats();
        sendData({action:"upgradeClick", balance, clickPower});
    }
});
document.getElementById('upgradePassive').addEventListener('click', () => {
    if(balance >= 20){
        balance -= 20;
        passiveIncome += 1;
        updateStats();
        sendData({action:"upgradePassive", balance, passiveIncome});
    }
});

// --- Пассивный доход ---
setInterval(() => {
    balance += passiveIncome;
    updateStats();
    sendData({action:"passiveIncome", balance, passiveIncome});
}, 60000);

// --- Получение данных от бота ---
if(window.Telegram && window.Telegram.WebApp){
    window.Telegram.WebApp.onEvent("message", (data) => {
        try {
            const msg = JSON.parse(data);
            if(msg.balance !== undefined){
                balance = msg.balance;
                clickPower = msg.clickPower;
                passiveIncome = msg.passiveIncome;
                clickLevel = msg.clickLevel;
                clickXP = msg.clickXP;
                updateStats();
            }
            if(msg.leaderboard){
                leaderboardEl.innerHTML = "";
                msg.leaderboard.forEach(u => {
                    const li = document.createElement('li');
                    li.textContent = `${u.name} — ${u.balance} 💰`;
                    leaderboardEl.appendChild(li);
                });
            }
        } catch(e){console.log(e);}
    });

    // Запрашиваем данные при открытии Web App
    window.Telegram.WebApp.sendData(JSON.stringify({action:"get_stats"}));
    window.Telegram.WebApp.sendData(JSON.stringify({action:"get_leaderboard"}));
}
