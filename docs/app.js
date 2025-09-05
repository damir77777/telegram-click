const balanceEl = document.getElementById('balance');
const clickPowerEl = document.getElementById('clickPower');
const passiveIncomeEl = document.getElementById('passiveIncome');
const clickLevelEl = document.getElementById('clickLevel');
const clickImage = document.getElementById('clickImage');
const clickProgressEl = document.getElementById('clickProgress');
const leaderboardEl = document.getElementById('leaderboard');

let balance = 0, clickPower = 1, passiveIncome = 1, clickLevel = 1, clickXP = 0;

function updateStats(){
    balanceEl.textContent = balance;
    clickPowerEl.textContent = clickPower;
    passiveIncomeEl.textContent = passiveIncome;
    clickLevelEl.textContent = clickLevel;
    clickProgressEl.style.width = Math.min((clickXP/50)*100,100) + "%";
}

function updateLeaderboard(users){
    leaderboardEl.innerHTML = "";
    users.forEach(u=>{
        const li = document.createElement('li');
        li.textContent = `${u.name} — ${u.balance} 💰`;
        leaderboardEl.appendChild(li);
    });
}

// Отправка данных на бота
function sendData(action, extra={}){
    const payload = {action, ...extra};
    if(window.Telegram && window.Telegram.WebApp){
        window.Telegram.WebApp.sendData(JSON.stringify(payload));
    }
}

// Обработка ответов от бота
function handleBotMessage(text){
    try{
        const obj = JSON.parse(text);
        if(obj.balance !== undefined){
            balance = obj.balance;
            clickPower = obj.clickPower;
            passiveIncome = obj.passiveIncome;
            clickLevel = obj.clickLevel;
            clickXP = obj.clickXP;
            updateStats();
        }
        if(obj.leaderboard){
            updateLeaderboard(obj.leaderboard);
        }
    }catch(e){
        console.error("Ошибка обработки ответа бота:", e);
    }
}

// Ловим все новые сообщения от бота
window.Telegram.WebApp.onEvent('message', msg => {
    if(msg.text){
        handleBotMessage(msg.text);
    }
});

// --- Клик по картинке ---
clickImage.addEventListener('click', ()=>{
    balance += clickPower;
    clickXP += clickPower;
    updateStats();
    sendData("click",{balance, clickPower, clickLevel, passiveIncome});
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

// --- Инициализация при открытии ---
window.addEventListener('load', ()=>{
    sendData("get_stats");
});
