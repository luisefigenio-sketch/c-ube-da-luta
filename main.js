const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variáveis de estado do jogo
let score = 0;
let gameOver = false;
let frames = 0;

// Controle de Teclado
const keys = { ArrowLeft: false, ArrowRight: false, Space: false };

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft") keys.ArrowLeft = true;
    if (e.code === "ArrowRight") keys.ArrowRight = true;
    if (e.code === "Space") keys.Space = true;
});

document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft") keys.ArrowLeft = false;
    if (e.code === "ArrowRight") keys.ArrowRight = false;
    if (e.code === "Space") keys.Space = false;
});

// Objeto Jogador (Nave)
const player = {
    x: 175, y: 430, width: 40, height: 40, speed: 6, cooldown: 0,
    draw() {
        ctx.fillStyle = "#00d2d3"; // Cor da nave
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update() {
        // Movimentação limitando às bordas da tela
        if (keys.ArrowLeft && this.x > 0) this.x -= this.speed;
        if (keys.ArrowRight && this.x + this.width < canvas.width) this.x += this.speed;

        // Sistema de tiro com tempo de recarga (cooldown)
        if (this.cooldown > 0) this.cooldown--;
        if (keys.Space && this.cooldown === 0) {
            bullets.push(new Bullet(this.x + this.width / 2 - 2.5, this.y));
            this.cooldown = 12; // Espera 12 frames até o próximo tiro
        }
    }
};

// Classe dos Tiros
const bullets = [];
class Bullet {
    constructor(x, y) {
        this.x = x; this.y = y; this.width = 5; this.height = 15; this.speed = 8;
    }
    draw() {
        ctx.fillStyle = "#feca57";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    update() {
        this.y -= this.speed;
    }
}

// Classe dos Inimigos
const enemies = [];
class Enemy {
    constructor() {
        this.width = 30; this.height = 30;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -30;
        this.speed = 2 + Math.random() * 2; // Velocidade aleatória
    }
    draw() {
        ctx.fillStyle = "#ff6b6b";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    update() {
        this.y += this.speed;
    }
}

// Função de Detecção de Colisão
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Loop Principal do Jogo
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Courier New";
        ctx.fillText("FIM DE JOGO!", 100, 230);
        ctx.fillText(`Pontos: ${score}`, 115, 270);
        ctx.font = "15px Courier New";
        ctx.fillText("Recarregue a página para jogar de novo", 25, 320);
        return;
    }

    // Limpa a tela a cada frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frames++;

    player.update();
    player.draw();

    // Atualiza Tiros
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        bullets[i].draw();
        if (bullets[i].y < 0) bullets.splice(i, 1); // Remove tiro que saiu da tela
    }

    // Cria novos Inimigos a cada 45 frames
    if (frames % 45 === 0) enemies.push(new Enemy());

    // Atualiza Inimigos e verifica colisões
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        enemies[i].draw();

        // Condições de Game Over (Bateu no player ou passou da tela)
        if (checkCollision(enemies[i], player) || enemies[i].y > canvas.height) {
            gameOver = true;
        }

        // Verifica se algum tiro acertou este inimigo
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (enemies[i] && checkCollision(bullets[j], enemies[i])) {
                enemies.splice(i, 1); // Destrói inimigo
                bullets.splice(j, 1); // Destrói tiro
                score++;
                break; // Sai do loop de tiros para este inimigo
            }
        }
    }

    // Desenha o Placar
    ctx.fillStyle = "white";
    ctx.font = "20px Courier New";
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Chama o próximo frame
    requestAnimationFrame(gameLoop);
}

// Inicia o jogo
gameLoop();