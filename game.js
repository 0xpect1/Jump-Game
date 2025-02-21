class Player {
    constructor(game) {
        this.game = game;
        this.width = 30;
        this.height = 50;
        this.x = 100;
        this.y = game.canvas.height - this.height;
        this.jumping = false;
        this.jumpVelocity = 0;
        this.gravity = 0.8;
        this.jumpStrength = -15;
    }

    jump() {
        if (!this.jumping) {
            this.jumping = true;
            this.jumpVelocity = this.jumpStrength;
        }
    }

    update() {
        if (this.jumping) {
            this.y += this.jumpVelocity;
            this.jumpVelocity += this.gravity;

            if (this.y > this.game.canvas.height - this.height) {
                this.y = this.game.canvas.height - this.height;
                this.jumping = false;
                this.jumpVelocity = 0;
            }
        }
    }

    draw(ctx) {
        // Simple stick figure
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        
        // Head
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + 10, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Body
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + 18);
        ctx.lineTo(this.x + this.width/2, this.y + 35);
        ctx.stroke();
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2 - 10, this.y + 25);
        ctx.lineTo(this.x + this.width/2 + 10, this.y + 25);
        ctx.stroke();
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + 35);
        ctx.lineTo(this.x + this.width/2 - 10, this.y + 50);
        ctx.moveTo(this.x + this.width/2, this.y + 35);
        ctx.lineTo(this.x + this.width/2 + 10, this.y + 50);
        ctx.stroke();
    }
}

class Orb {
    constructor(game) {
        this.game = game;
        this.radius = 15;
        this.x = game.canvas.width;
        this.y = game.canvas.height - this.radius;
        this.speed = game.orbSpeed;
    }

    update() {
        this.x -= this.speed;
        return this.x + this.radius < 0;
    }

    draw(ctx) {
        ctx.fillStyle = 'lightgreen';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    collidesWith(player) {
        const dx = (this.x) - (player.x + player.width/2);
        const dy = (this.y) - (player.y + player.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + 25;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player(this);
        this.orbs = [];
        this.orbSpeed = 5;
        this.spawnInterval = 2000;
        this.lastSpawnTime = 0;
        this.gameOver = false;
        this.score = 0;
        this.startTime = Date.now();

        // Event listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.player.jump();
                if (this.gameOver) {
                    this.restart();
                }
            }
        });

        this.gameLoop();
    }

    restart() {
        this.gameOver = false;
        this.orbs = [];
        this.orbSpeed = 5;
        this.spawnInterval = 2000;
        this.score = 0;
        this.startTime = Date.now();
        this.player = new Player(this);
    }

    update() {
        if (this.gameOver) return;

        this.player.update();

        // Update orbs and remove ones that are off screen
        this.orbs = this.orbs.filter(orb => !orb.update());

        // Spawn new orbs
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.orbs.push(new Orb(this));
            this.lastSpawnTime = currentTime;
        }

        // Increase difficulty over time
        const elapsedSeconds = (currentTime - this.startTime) / 1000;
        this.orbSpeed = 5 + Math.min(10, elapsedSeconds / 10);
        this.spawnInterval = Math.max(500, 2000 - elapsedSeconds * 50);

        // Check collisions
        for (const orb of this.orbs) {
            if (orb.collidesWith(this.player)) {
                this.gameOver = true;
                break;
            }
        }

        // Update score
        this.score = Math.floor((currentTime - this.startTime) / 100);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ground line
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.stroke();

        this.player.draw(this.ctx);
        this.orbs.forEach(orb => orb.draw(this.ctx));

        // Draw score
        this.ctx.fillStyle = 'black';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);

        if (this.gameOver) {
            this.ctx.fillStyle = 'red';
            this.ctx.font = '40px Arial';
            this.ctx.fillText('Game Over!', this.canvas.width/2 - 100, this.canvas.height/2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Press Space to restart', this.canvas.width/2 - 100, this.canvas.height/2 + 40);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 