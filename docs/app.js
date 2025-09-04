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

const frames = ["frames/frame1.png","frames/frame2.png","frames/frame3.png"];
let frameIndex = 0;

// Моргаем каждые 3 секунды
setInterval(() => {
    clickImage.style.animation = "blink 0.2s";
    setTimeout(() => clickImage.style.animation = "", 200);
}, 3000);

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
        clickXP = 0;
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

function sendDataToBot(data){
    if(window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(data));
    }
}

clickImage.addEventListener('click', () => {
    balance += clickPower;
    clickXP += clickPower;
    updateStats();
    updateClickProgress();

    frameIndex = (frameIndex + 1) % frames.length;
    clickImage.src = frames[frameIndex];

    // прыжок при клике
    clickImage.style.animation = "jump 0.3s";
    setTimeout(() => clickImage.style.animation = "", 300);

    sendDataToBot({action: "click", balance, clickPower, clickLevel, passiveIncome});
});

document.getElementById('upgradeClick').addEventListener('click', () => {
    if(balance >= 10){
        balance -= 10;
        clickPower += 1;
        updateStats();
        sendDataToBot({action: "upgradeClick", balance, clickPower});
    }
});

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
