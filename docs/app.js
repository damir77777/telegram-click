let balance = 0;
let clickPower = 1;
let passiveIncome = 1;
let clickLevel = 1;
let clickXP = 0;
const xpPerLevel = 50;

const balanceEl = document.getElementById("balance");
const clickPowerEl = document.getElementById("clickPower");
const passiveIncomeEl = document.getElementById("passiveIncome");
const clickLevelEl = document.getElementById("clickLevel");
const clickImage = document.getElementById("clickImage");
const clickProgressEl = document.getElementById("clickProgress");
const leaderboardEl = document.getElementById("leaderboard");

// frames для анимации
const frames = ["frames/frame.png"];
let frameIndex = 0;

// === Telegram WebApp API ===
window.Telegram.WebApp.ready();

function sendDataToBot(data) {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(data));
    }
}

// === получение статов при старте ===
sendDataToBot({ action: "get_stats" });

// слушаем ответы от Python-бота
window.Telegram.WebApp.onEvent("message", (event) => {
    try {
        const data = JSON.parse(event.data);

        // если пришли статы игрока
        if (data.balance !== undefined) {
            balance = data.balance;
            clickPower = data.clickPower;
            passiveIncome = data.passiveIncome;
            clickLevel = data.clickLevel;
            clickXP = data.clickXP;
            updateStats();
            updateClickProgress();
        }

        // если пришла таблица лидеров
        if (data.leaderboard !== undefined) {
            leaderboardEl.innerHTML = "";
            data.leaderboard.forEach((user, index) => {
                const li = document.createElement("li");
                const medals = ["🥇", "🥈", "🥉"];
                const medal = medals[index] || (index + 1) + "️⃣";
                li.textContent = `${medal} ${user.name} — ${user.balance} 💰`;
                leaderboardEl.appendChild(li);
            });
        }

    } catch (e) {
        console.error("Ошибка парсинга данных от бота:", e);
    }
});

// === обновление статистики ===
function updateStats() {
    balanceEl.textContent = balance;
    clickPowerEl.textContent = clickPower;
    passiveIncomeEl.textContent = passiveIncome;
    clickLevelEl.textContent = clickLevel;
}

// прогресс уровня
function updateClickProgress() {
    const progress = Math.min((clickXP / xpPerLevel) * 100, 100);
    clickProgressEl.style.width = progress + "%";

    if (clickXP >= xpPerLevel) {
        clickLevel++;
        clickXP = 0;
        clickPower += 1;
        updateStats();
        animateLevelUp();
    }
}

// анимация апгрейда
function animateLevelUp() {
    clickImage.style.transform = "scale(1.2)";
    clickImage.style.animation = "jump 0.3s";
    setTimeout(() => {
        clickImage.style.transform = "scale(1)";
        clickImage.style.animation = "";
    }, 300);
}

// === клики по картинке ===
clickImage.addEventListener("click", () => {
    balance += clickPower;
    clickXP += clickPower;
    updateStats();
    updateClickProgress();

    // анимация
    frameIndex = (frameIndex + 1) % frames.length;
    clickImage.src = frames[frameIndex];
    clickImage.style.animation = "jump 0.3s";
    setTimeout(() => (clickImage.style.animation = ""), 300);

    // сохраняем на сервере
    sendDataToBot({
        action: "click",
        balance,
        clickPower,
        clickLevel,
        passiveIncome,
        clickXP,
    });
});

// === апгрейд клика ===
document.getElementById("upgradeClick").addEventListener("click", () => {
    if (balance >= 10) {
        balance -= 10;
        clickPower += 1;
        updateStats();
        sendDataToBot({ action: "upgradeClick", balance, clickPower });
    }
});

// === апгрейд пассива ===
document.getElementById("upgradePassive").addEventListener("click", () => {
    if (balance >= 20) {
        balance -= 20;
        passiveIncome += 1;
        updateStats();
        sendDataToBot({ action: "upgradePassive", balance, passiveIncome });
    }
});

// === пассивный доход каждую минуту ===
setInterval(() => {
    balance += passiveIncome;
    updateStats();
    sendDataToBot({ action: "passiveIncome", balance, passiveIncome });
}, 60000);

// === запрос таблицы лидеров ===
function loadLeaderboard() {
    sendDataToBot({ action: "get_leaderboard" });
}

// подгрузка топа при старте
loadLeaderboard();
