const balanceEl = document.getElementById('balance');
const clickPowerEl = document.getElementById('clickPower');
const passiveIncomeEl = document.getElementById('passiveIncome');
const clickLevelEl = document.getElementById('clickLevel');
const clickXPEl = document.getElementById('clickProgress');
const leaderboardEl = document.getElementById('leaderboard');

let balance = 0, clickPower = 1, passiveIncome = 1, clickLevel = 1, clickXP = 0;
const tg = window.Telegram.WebApp;
const tg_id = tg.initDataUnsafe.user.id;
const name = tg.initDataUnsafe.user.first_name + " " + (tg.initDataUnsafe.user.last_name||"");

// --- Обновление UI ---
function updateStats() {
    balanceEl.textContent = balance;
    clickPowerEl.textContent = clickPower;
    passiveIncomeEl.textContent = passiveIncome;
    clickLevelEl.textContent = clickLevel;
    clickXPEl.style.width = Math.min((clickXP/50)*100,100)+"%";
}

// --- Отправка запроса серверу ---
async function sendData(data){
    data.tg_id = tg_id;
    data.name = name;
    const res = await fetch("https://your-server.com/update", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data)
    });
    const json = await res.json();
    balance = json.balance;
    clickPower = json.clickPower;
    passiveIncome = json.passiveIncome;
    clickLevel = json.clickLevel;
    clickXP = json.clickXP;
    updateStats();

    leaderboardEl.innerHTML="";
    json.leaderboard.forEach(u=>{
        const li = document.createElement("li");
        li.textContent = `${u.name} — ${u.balance} 💰`;
        leaderboardEl.appendChild(li);
    });
}

// --- Клик по картинке ---
document.getElementById("clickImage").addEventListener("click", ()=>{
    balance += clickPower;
    clickXP += clickPower;
    updateStats();
    sendData({action:"click", balance, clickPower, clickLevel, passiveIncome});
});

// --- Апгрейды ---
document.getElementById("upgradeClick").addEventListener("click", ()=>{
    if(balance >= 10){
        balance -= 10;
        clickPower += 1;
        updateStats();
        sendData({action:"upgradeClick", balance, clickPower});
    }
});
document.getElementById("upgradePassive").addEventListener("click", ()=>{
    if(balance >= 20){
        balance -= 20;
        passiveIncome += 1;
        updateStats();
        sendData({action:"upgradePassive", balance, passiveIncome});
    }
});

// --- Пассивный доход каждые 60 сек ---
setInterval(()=>{
    balance += passiveIncome;
    updateStats();
    sendData({action:"passiveIncome", balance, passiveIncome});
},60000);

// --- Начальные данные ---
sendData({action:"get_stats"});
sendData({action:"get_leaderboard"});
