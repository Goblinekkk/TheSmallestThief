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
let highScore = localStorage.getItem('mravenecHighScore') || 0;

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
    size: 95,
    speed: 1.8 // Základní rychlost
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

    // Pohyb hráče
    player.x += (player.targetX - player.x) * player.speed;
    player.y += (player.targetY - player.y) * player.speed;

    // Pohyb nepřítele
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
        
        if (ldist < player.size + 5) {
            lootItems.splice(index, 1);
            score += 10;
            energy = Math.min(100, energy + 8);
            scoreEl.innerText = score;
            
            // Zvyšování obtížnosti
            enemy.speed += 0.05; 
            
            spawnLoot();
        }
    });

    // Kolize s nepřítelem
    if (dist < (player.size + enemy.size / 2.5)) {
        endGame("Byl jsi zašlápnut!");
    }

    // Spotřeba energie
    energy -= 0.08;
    energyEl.innerText = Math.max(0, Math.floor(energy));
    if (energy <= 0) endGame("Umřel jsi hlady!");
}

function draw() {
    // Podlaha
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Kreslení kořisti
    ctx.fillStyle = '#f1c40f';
    lootItems.forEach(item => {
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Kreslení nepřítele (Stín)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();

    // Kreslení hráče
    ctx.fillStyle = '#e74c3c';
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillRect(-player.size/2, -player.size/2, player.size, player.size);
    // Tykadla
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -6); ctx.lineTo(-7, -13);
    ctx.moveTo(4, -6); ctx.lineTo(7, -13);
    ctx.stroke();
    ctx.restore();

    if (gameActive) {
        update();
        requestAnimationFrame(draw);
    }
}

function endGame(text) {
    gameActive = false;
    
    // Kontrola High Score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('mravenecHighScore', highScore);
        text = "NOVÝ REKORD: " + score;
    }

    statusDesc.innerHTML = text + "<br><br>Tvůj nejlepší výkon: " + highScore;
    msgBox.style.display = 'block';
}

// --- OVLÁDÁNÍ (S opravou scrollování) ---
const handleInput = (clientX, clientY) => {
    player.targetX = clientX;
    player.targetY = clientY;
};

window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleInput(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handleInput(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

window.addEventListener('mousemove', (e) => {
    handleInput(e.clientX, e.clientY);
});

draw();
