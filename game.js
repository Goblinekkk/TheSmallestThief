const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const energyEl = document.getElementById('energy');
const msgBox = document.getElementById('msg');
const statusDesc = document.getElementById('statusDesc');

// Nastavení velikosti plátna
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- HERNÍ OBJEKTY ---
let score = 0;
let energy = 100;
let gameActive = true;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    targetX: canvas.width / 2,
    targetY: canvas.height / 2,
    size: 16,
    speed: 0.12
};

const enemy = {
    x: -100,
    y: -100,
    size: 90,
    speed: 1.8
};

let lootItems = [];
for (let i = 0; i < 6; i++) spawnLoot();

// --- LOGIKA ---

function spawnLoot() {
    lootItems.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        size: 10
    });
}

function update() {
    if (!gameActive) return;

    // Pohyb hráče (plynulé následování prstu)
    player.x += (player.targetX - player.x) * player.speed;
    player.y += (player.targetY - player.y) * player.speed;

    // Pohyb nepřítele za hráčem
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    enemy.x += (dx / dist) * enemy.speed;
    enemy.y += (dy / dist) * enemy.speed;

    // Kolize s kořistí
    lootItems.forEach((item, index) => {
        const ldx = player.x - item.x;
        const ldy = player.y - item.y;
        const ldist = Math.sqrt(ldx * ldx + ldy * ldy);
        
        if (ldist < player.size) {
            lootItems.splice(index, 1);
            score += 10;
            energy = Math.min(100, energy + 10);
            scoreEl.innerText = score;
            spawnLoot();
        }
    });

    // Kolize s nepřítelem (Konec hry)
    if (dist < (player.size + enemy.size / 2.5)) {
        endGame("Byl jsi zašlápnut!");
    }

    // Spotřeba energie
    energy -= 0.06;
    energyEl.innerText = Math.max(0, Math.floor(energy));
    if (energy <= 0) endGame("Umřel jsi vyčerpáním!");
}

function draw() {
    // Čištění plátna (Podlaha)
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Kreslení kořisti (Drobky)
    ctx.fillStyle = '#f1c40f';
    lootItems.forEach(item => {
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Kreslení nepřítele (Stín boty)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();

    // Kreslení hráče (Mravenec)
    ctx.fillStyle = '#c0392b';
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillRect(-player.size/2, -player.size/2, player.size, player.size);
    // Jednoduchá tykadla
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, -8); ctx.lineTo(-8, -15);
    ctx.moveTo(5, -8); ctx.lineTo(8, -15);
    ctx.stroke();
    ctx.restore();

    if (gameActive) {
        update();
        requestAnimationFrame(draw);
    }
}

function endGame(text) {
    gameActive = false;
    statusDesc.innerText = text;
    msgBox.style.display = 'block';
}

// OVLÁDÁNÍ
window.addEventListener('touchstart', (e) => {
    player.targetX = e.touches[0].clientX;
    player.targetY = e.touches[0].clientY;
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    player.targetX = e.touches[0].clientX;
    player.targetY = e.touches[0].clientY;
}, { passive: false });

window.addEventListener('mousemove', (e) => {
    player.targetX = e.clientX;
    player.targetY = e.clientY;
});

// Start hry
draw();
