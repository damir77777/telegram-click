// app.js
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

// --- Отправка данных на сервер ---
function sendData(action, extra={}) {
    const payload = { action, ...extra };
    if(window.Telegram && window.Telegram.WebApp){
        payload.tg_id = window.Telegram.WebApp.initDataUnsafe.user.id;
        payload.name = window.Telegram.WebApp.initDataUnsafe.user.first_name;
    }
    fetch("http://127.0.0.1:5000/webapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).then(r=>r.json()).then(data=>{
        if(data.balance!==undefined){
            balance = data.balance;
            clickPower = data.clickPower;
            passiveIncome = data.passiveIncome;
            clickLevel = data.clickLevel;
            clickXP = data.clickXP;
            updateStats();
        }
        if(data.leaderboard){
            leaderboardEl.innerHTML = "";
            data.leaderboard.forEach(u=>{
                const li = document.createElement('li');
                li.textContent = `${u.name} — ${u.balance} 💰`;
                leaderboardEl.appendChild(li);
            });
        }
    });
}

// --- Клик по картинке ---
clickImage.addEventListener('click', ()=>{
    balance += clickPower;
    clickXP += clickPower;
    updateStats();
    sendData("click", {balance, clickPower, clickLevel, passiveIncome});
});

// --- Апгрейды ---
document.getElementById('upgradeClick').addEventListener('click', ()=>{
    if(balance>=10){
        balance -= 10;
        clickPower += 1;
        updateStats();
        sendData("upgradeClick",{balance, clickPower});
    }
});
document.getElementById('upgradePassive').addEventListener('click', ()=>{
    if(balance>=20){
        balance -= 20;
        passiveIncome +=1;
        updateStats();
        sendData("upgradePassive",{balance, passiveIncome});
    }
});

// --- Пассивный доход ---
setInterval(()=>{
    balance += passiveIncome;
    updateStats();
    sendData("passiveIncome",{balance, passiveIncome});
}, 60000);

// --- Запрос статистики и топ-5 при открытии ---
sendData("get_stats");
sendData("get_leaderboard");
