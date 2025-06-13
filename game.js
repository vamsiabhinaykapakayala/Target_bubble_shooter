const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: canvas.width / 2 - 25, y: canvas.height - 50, width: 50, height: 20 };
let bullets = [];
let targets = [];

let score = 0;
let level = 1;
let levelStartScore = 0;
let targetSpeed = 2;

const levelBullets = { 1: Infinity, 2: 35, 3: 40, 4: 45, 5: 50 };
const levelTargetCounts = { 1: 3, 2: 5, 3: 8, 4: 10, 5: 12 };

const levelBackgrounds = {
    1: 'image1.webp',
    2: 'image2.webp',
    3: 'image3.webp',
    4: 'image4.webp',
    5: 'image5.jpg'
};

let backgroundImage = new Image();
backgroundImage.src = levelBackgrounds[level];

let bulletsRemaining = levelBullets[level];
let gameOver = false;
let waitingForNextLevel = false;
let gameCompleted = false;

const retryButton = document.getElementById('retryButton');

const dinosaurTypes = [
    { color: 'red', move: (target) => target.x += Math.sin(Date.now() / 200) * 2 },
    { color: 'blue', move: (target) => target.y += Math.cos(Date.now() / 300) * 2 },
    { color: 'green', move: (target) => target.x += Math.cos(Date.now() / 250) * 2 },
    { color: 'orange', move: (target) => { target.x += Math.sin(Date.now() / 400) * 2; target.y += Math.sin(Date.now() / 300) * 1.5; } },
    { color: 'purple', move: (target) => { target.x += Math.cos(Date.now() / 350) * 2; target.y += Math.cos(Date.now() / 400) * 1.5; } }
];

// Desktop Mouse Movement
canvas.addEventListener('mousemove', (e) => {
    if (!gameOver && !waitingForNextLevel && !gameCompleted) {
        let rect = canvas.getBoundingClientRect();
        player.x = e.clientX - rect.left - player.width / 2;
    }
});

// Desktop Click Shooting
canvas.addEventListener('click', () => {
    shootBullet();
});

// Mobile Touch Movement
canvas.addEventListener('touchmove', (e) => {
    if (!gameOver && !waitingForNextLevel && !gameCompleted) {
        let rect = canvas.getBoundingClientRect();
        let touch = e.touches[0];
        player.x = touch.clientX - rect.left - player.width / 2;
    }
});

// Mobile Touch Shooting
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent duplicate click firing on some mobile browsers
    shootBullet();
}, { passive: false });

// Shooting Function (common for desktop & mobile)
function shootBullet() {
    if (gameOver || waitingForNextLevel || gameCompleted) return;

    if (bulletsRemaining > 0 || levelBullets[level] === Infinity) {
        bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y - 20 });
        if (levelBullets[level] !== Infinity) bulletsRemaining--;

        let gunshot = new Audio('gunshot.mp3');
        gunshot.volume = 1.0;
        gunshot.play();
    }
}

function showButton(text, onClick) {
    retryButton.innerText = text;
    retryButton.style.display = 'block';
    retryButton.style.top = (canvas.height / 2 + 60) + 'px';
    retryButton.style.left = (canvas.width / 2 - 70) + 'px';
    retryButton.onclick = onClick;
}

function showRetryButton() {
    showButton('Retry', () => {
        bullets = [];
        targets = [];
        score = levelStartScore;
        bulletsRemaining = levelBullets[level];
        spawnTargets(level);
        gameOver = false;
        waitingForNextLevel = false;
        gameCompleted = false;
        retryButton.style.display = 'none';
        gameLoop();
    });
}

function showNextLevelButton() {
    showButton('Next Level', () => {
        level++;
        if (levelTargetCounts[level]) {
            levelStartScore = score;
            targetSpeed += 0.5;

            levelBullets[level] += 10;

            bulletsRemaining = levelBullets[level];
            bullets = [];
            targets = [];
            backgroundImage.src = levelBackgrounds[level];
            spawnTargets(level);
            waitingForNextLevel = false;
            retryButton.style.display = 'none';
            gameLoop();
        } else {
            gameCompleted = true;

            ctx.font = 'bold 60px Arial';
            ctx.fillStyle = '#32CD32';
            ctx.fillText('You finished all levels!', canvas.width / 4, canvas.height / 2 - 50);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.strokeText('You finished all levels!', canvas.width / 4, canvas.height / 2 - 50);

            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#00FFFF';
            ctx.fillText('Click "Play Again" to restart.', canvas.width / 4, canvas.height / 2);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.strokeText('Click "Play Again" to restart.', canvas.width / 4, canvas.height / 2);

            showButton('Play Again', () => {
                level = 1;
                score = 0;
                levelStartScore = 0;
                targetSpeed = 2;
                bulletsRemaining = levelBullets[level];
                bullets = [];
                targets = [];
                backgroundImage.src = levelBackgrounds[level];
                gameOver = false;
                waitingForNextLevel = false;
                gameCompleted = false;
                retryButton.style.display = 'none';

                spawnTargets(level);
                gameLoop();
            });
        }
    });
}

function spawnTargets(level) {
    let targetCount = levelTargetCounts[level] || 0;
    for (let i = 0; i < targetCount; i++) {
        let typeIndex = i % dinosaurTypes.length;
        targets.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: Math.random() * 200 + 30,
            speed: (Math.random() > 0.5 ? 1 : -1) * targetSpeed,
            type: dinosaurTypes[typeIndex]
        });
    }
}

function drawGun(x, y, width, height) {
    ctx.fillStyle = 'gray';
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = 'black';
    ctx.fillRect(x + width / 2 - 5, y - 20, 10, 20);
}

function gameLoop() {
    if (gameCompleted) return;

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    if (gameOver || waitingForNextLevel) return;

    drawGun(player.x, player.y, player.width, player.height);

    ctx.fillStyle = 'white';
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 7;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            continue;
        }
        ctx.fillRect(bullets[i].x, bullets[i].y, 5, 10);
    }

    for (let i = 0; i < targets.length; i++) {
        let target = targets[i];
        target.x += target.speed;

        if (target.x > canvas.width - 20 || target.x < 20) {
            target.speed *= -1;
        }

        target.type.move(target);

        ctx.beginPath();
        ctx.fillStyle = target.type.color;
        ctx.arc(target.x, target.y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = targets.length - 1; j >= 0; j--) {
            let dx = bullets[i].x - targets[j].x;
            let dy = bullets[i].y - targets[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 20) {
                targets.splice(j, 1);
                bullets.splice(i, 1);
                score += 10;
                break;
            }
        }
    }

    if (targets.length === 0 && !gameOver) {
        waitingForNextLevel = true;

        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`Level ${level} Complete!`, canvas.width / 4, canvas.height / 2 - 50);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeText(`Level ${level} Complete!`, canvas.width / 4, canvas.height / 2 - 50);

        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#00FFFF';
        ctx.fillText('Click "Next Level" to continue.', canvas.width / 4, canvas.height / 2);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeText('Click "Next Level" to continue.', canvas.width / 4, canvas.height / 2);

        showNextLevelButton();
        return;
    }

    if (bulletsRemaining === 0 && targets.length > 0 && levelBullets[level] !== Infinity && !gameOver) {
        gameOver = true;

        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#FF4500';
        ctx.fillText('Out of Bullets! Game Over!', canvas.width / 4, canvas.height / 2);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeText('Out of Bullets! Game Over!', canvas.width / 4, canvas.height / 2);

        showRetryButton();
        return;
    }

    ctx.fillStyle = 'red';
    ctx.font = '30px Arial';
    ctx.fillText('Score: ' + score, 20, 40);
    ctx.fillText('Level: ' + level, 20, 80);
    ctx.fillText('Bullets: ' + (levelBullets[level] === Infinity ? '∞' : bulletsRemaining), 20, 120);

    requestAnimationFrame(gameLoop);
}

levelStartScore = score;
spawnTargets(level);
gameLoop();
