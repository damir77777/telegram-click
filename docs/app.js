// --- Элементы DOM ---
const balanceEl = document.getElementById('balance');
const clickPowerEl = document.getElementById('clickPower');
const passiveIncomeEl = document.getElementById('passiveIncome');
const clickLevelEl = document.getElementById('clickLevel');
const clickImage = document.getElementById('clickImage');
const clickProgressEl = document.getElementById('clickProgress');
const leaderboardEl = document.getElementById('leaderboard');

// --- Переменные ---
let balance = 0;
let clickPower = 1;
let passiveIncome = 1;
let clickLevel = 1;
let clickXP = 0;

// --- Обновляем статистику ---
function updateStats() {
    balanceEl.textContent = balance;
    clickPowerEl.textContent = clickPower;
    passiveIncomeEl.textContent = passiveIncome;
    clickLevelEl.textContent = clickLevel;
    clickProgressEl.style.width = Math.min((clickXP / 50) * 100, 100) + "%";
}

// --- Отправка данных в бота ---
function sendDataToBot(data){
    if(window.Telegram.WebApp){
        window.Telegram.WebApp.sendData(JSON.stringify(data));
    }
}

// --- Инициализация: получаем текущие данные игрока ---
if(window.Telegram.WebApp){
    sendDataToBot({action: "get_stats"});
    sendDataToBot({action: "get_leaderboard"});
}

// --- Клик по картинке ---
clickImage.addEventListener('click', () => {
    balance += clickPower;
    clickXP += clickPower;

    // Левел ап
    if(clickXP >= 50){
        clickLevel++;
        clickXP = 0;
        clickPower += 1;
    }

    updateStats();
    sendDataToBot({action:"click", balance, clickPower, clickLevel, clickXP, passiveIncome});
    sendDataToBot({action:"get_leaderboard"}); // обновляем топ после клика
});

// --- Кнопки апгрейдов ---
document.getElementById('upgradeClick').addEventListener('click', () => {
    if(balance >= 10){
        balance -= 10;
        clickPower += 1;
        updateStats();
        sendDataToBot({action:"upgradeClick", balance, clickPower});
        sendDataToBot({action:"get_leaderboard"});
    }
});

document.getElementById('upgradePassive').addEventListener('click', () => {
    if(balance >= 20){
        balance -= 20;
        passiveIncome += 1;
        updateStats();
        sendDataToBot({action:"upgradePassive", balance, passiveIncome});
        sendDataToBot({action:"get_leaderboard"});
    }
});

// --- Пассивный доход каждые 60 секунд ---
setInterval(() => {
    balance += passiveIncome;
    updateStats();
    sendDataToBot({action:"passiveIncome", balance, passiveIncome});
    sendDataToBot({action:"get_leaderboard"});
}, 60000);

// --- Получение ответов от бота ---
window.addEventListener('message', (event) => {
    try{
        const data = JSON.parse(event.data);

        // Обновляем данные игрока
        if(data.balance !== undefined){
            balance = data.balance;
            clickPower = data.clickPower;
            passiveIncome = data.passiveIncome;
            clickLevel = data.clickLevel;
            clickXP = data.clickXP;
            updateStats();
        }

        // Обновляем таблицу лидеров
        if(data.leaderboard){
            leaderboardEl.innerHTML = '';
            data.leaderboard.forEach((u, i) => {
                const li = document.createElement('li');
                const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
                li.textContent = `${medals[i] ? medals[i] : i+1} ${u.name} — ${u.balance} 💰`;
                leaderboardEl.appendChild(li);
            });
        }

    }catch(e){
        console.error(e);
    }
});
