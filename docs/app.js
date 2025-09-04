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
const topListEl = document.getElementById('topList');

// Получение актуальных данных при загрузке
function fetchStats() {
    window.Telegram.WebApp.sendData(JSON.stringify({ action: "get_stats" }));
}
function fetchTop() {
    window.Telegram.WebApp.sendData(JSON.stringify({ action: "get_top" }));
}

// Обновление интерфейса
function updateStats() {
    balanceEl.textContent = balance;
    clickPowerEl.textContent = clickPower;
    passiveIncomeEl.textContent = passiveIncome;
    clickLevelEl.textContent = clickLevel;
    clickProgressEl.style.width = Math.min((clickXP/xpPerLevel)*100,100)+'%';
}

// Обработка данных от бота
window.Telegram.WebApp.onEvent("dataReceived", (data) => {
    let parsed;
    try { parsed = JSON.parse(data); } catch { return; }
    
    if(parsed.balance!==undefined) {
        balance = parsed.balance;
        clickPower = parsed.clickPower;
        passiveIncome = parsed.passiveIncome;
        clickLevel = parsed.clickLevel;
        clickXP = parsed.clickXP;
        updateStats();
    }
    if(Array.isArray(parsed)) { // топ
        topListEl.innerHTML = "";
        parsed.forEach(item => {
            const div = document.createElement("div");
            div.textContent = `${item.medal} Пользователь ${item.user} — ${item.balance} 💰`;
            topListEl.appendChild(div);
        });
    }
});

// Клик по картинке
clickImage.addEventListener('click', () => {
    balance += clickPower;
    clickXP += clickPower;
    updateStats();
    window.Telegram.WebApp.sendData(JSON.stringify({ action: "click", balance, clickPower, clickLevel, clickXP, passiveIncome }));
});

// Улучшения
document.getElementById('upgradeClick').addEventListener('click', ()=>{
    if(balance>=10){ balance-=10; clickPower+=1; updateStats();
        window.Telegram.WebApp.sendData(JSON.stringify({ action:"upgradeClick", balance, clickPower })); 
    }
});
document.getElementById('upgradePassive').addEventListener('click', ()=>{
    if(balance>=20){ balance-=20; passiveIncome+=1; updateStats();
        window.Telegram.WebApp.sendData(JSON.stringify({ action:"upgradePassive", balance, passiveIncome })); 
    }
});

// Пассивный доход
setInterval(()=>{
    balance+=passiveIncome;
    updateStats();
    window.Telegram.WebApp.sendData(JSON.stringify({ action:"passiveIncome", balance, passiveIncome })); 
},60000);

// Загрузка данных при старте
fetchStats();
fetchTop();
