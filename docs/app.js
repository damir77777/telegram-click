const balanceEl = document.getElementById('balance');
const clickPowerEl = document.getElementById('clickPower');
const passiveIncomeEl = document.getElementById('passiveIncome');
const clickLevelEl = document.getElementById('clickLevel');
const clickImage = document.getElementById('clickImage');
const clickProgressEl = document.getElementById('clickProgress');
const leaderboardEl = document.getElementById('leaderboard');

let balance = 0, clickPower = 1, passiveIncome = 1, clickLevel = 1, clickXP = 0;

// --- Получаем данные из бота при загрузке ---
if(window.Telegram.WebApp){
    window.Telegram.WebApp.sendData(JSON.stringify({action:"get_stats"}));
}

// --- Обновляем статистику ---
function updateStats() {
    balanceEl.textContent = balance;
    clickPowerEl.textContent = clickPower;
    passiveIncomeEl.textContent = passiveIncome;
    clickLevelEl.textContent = clickLevel;
    clickProgressEl.style.width = Math.min((clickXP/50)*100, 100) + "%";
}

// --- Отправка данных в бот ---
function sendDataToBot(data){
    if(window.Telegram.WebApp){
        window.Telegram.WebApp.sendData(JSON.stringify(data));
    }
}

// --- Клик по картинке ---
clickImage.addEventListener('click', () => {
    balance += clickPower;
    clickXP += clickPower;
    updateStats();
    sendDataToBot({action:"click", balance, clickPower, clickLevel, passiveIncome});
});

// --- Кнопки апгрейдов ---
document.getElementById('upgradeClick').addEventListener('click', () => {
    if(balance >= 10){
        balance -= 10;
        clickPower += 1;
        updateStats();
        sendDataToBot({action:"upgradeClick", balance, clickPower});
    }
});

document.getElementById('upgradePassive').addEventListener('click', () => {
    if(balance >= 20){
        balance -= 20;
        passiveIncome += 1;
        updateStats();
        sendDataToBot({action:"upgradePassive", balance, passiveIncome});
    }
});

// --- Пассивный доход ---
setInterval(() => {
    balance += passiveIncome;
    updateStats();
    sendDataToBot({action:"passiveIncome", balance, passiveIncome});
}, 60000);

// --- Получение ответа от бота ---
window.addEventListener('message', (event) => {
    try{
        const data = JSON.parse(event.data);
        if(data.balance !== undefined){
            balance = data.balance;
            clickPower = data.clickPower;
            passiveIncome = data.passiveIncome;
            clickLevel = data.clickLevel;
            clickXP = data.clickXP;
            updateStats();
        }
        if(data.leaderboard){
            leaderboardEl.innerHTML = '';
            data.leaderboard.forEach((u, i) => {
                const li = document.createElement('li');
                li.textContent = `${u.name} — ${u.balance} 💰`;
                leaderboardEl.appendChild(li);
            });
        }
    }catch(e){}
});
