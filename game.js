// Base Particle class definition (add this before EnhancedParticle)
class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alpha = 1;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        
        if (type === 'jump') {
            this.color = 'rgba(0, 255, 255, ';
            this.decay = 0.03;
        } else if (type === 'trail') {
            this.color = 'rgba(100, 200, 255, ';
            this.decay = 0.02;
        }
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Player {
    constructor(game) {
        this.game = game;
        this.width = 50;
        this.height = 50;
        this.x = 150;
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
        ctx.save();
        
        // Add outline to make player visible on all backgrounds
        const outline = '#000000';
        const outlineWidth = 2;
        
        // Main body (dark blue with outline)
        ctx.fillStyle = '#0000AA';
        ctx.strokeStyle = outline;
        ctx.lineWidth = outlineWidth;
        ctx.fillRect(this.x + 10, this.y + 10, 30, 30);
        ctx.strokeRect(this.x + 10, this.y + 10, 30, 30);
        
        // Head (light blue with outline)
        ctx.fillStyle = '#00AAFF';
        ctx.fillRect(this.x + 15, this.y, 20, 20);
        ctx.strokeRect(this.x + 15, this.y, 20, 20);
        
        // Eyes (white with outline)
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 22, this.y + 8, 6, 4);
        ctx.strokeRect(this.x + 22, this.y + 8, 6, 4);
        
        // Gun (gray with outline)
        ctx.fillStyle = '#666666';
        ctx.fillRect(this.x + 40, this.y + 15, 20, 8);
        ctx.strokeRect(this.x + 40, this.y + 15, 20, 8);
        
        // Gun barrel (dark gray with outline)
        ctx.fillStyle = '#444444';
        ctx.fillRect(this.x + 45, this.y + 17, 18, 4);
        ctx.strokeRect(this.x + 45, this.y + 17, 18, 4);
        
        // Energy core (cyan with enhanced glow)
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(this.x + 42, this.y + 16, 4, 6);
        
        ctx.restore();
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
        // Add outline to orb
        ctx.beginPath();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Energy orb effect with enhanced visibility
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#FFFFFF'); // Bright center
        gradient.addColorStop(0.5, '#7FFF00'); // Middle
        gradient.addColorStop(1, '#006400'); // Dark edge
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.shadowColor = '#7FFF00';
        ctx.shadowBlur = 10;
        ctx.fill();
    }

    collidesWith(player) {
        const dx = this.x - (player.x + player.width/2);
        const dy = this.y - (player.y + player.height/2);
        return Math.sqrt(dx * dx + dy * dy) < this.radius + 25;
    }
}

class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 3 + 1;
        this.tail = Math.random() > 0.9; // 10% chance to be a shooting star
        this.tailLength = this.tail ? 20 : 0;
    }

    update() {
        this.x -= this.speed;
        if (this.x < -this.tailLength) {
            this.reset();
            this.x = this.canvas.width;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#fff';
        if (this.tail) {
            // Draw shooting star with tail
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.tailLength, this.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = this.size;
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.particles = [];
        this.maxParticles = 200; // Increased for more effects
        this.emitters = new Map();
    }

    createEmitter(x, y, type) {
        const emitter = {
            x, y,
            type,
            rate: type === 'trail' ? 5 : 2,
            lastEmit: 0
        };
        this.emitters.set(`${x},${y}`, emitter);
    }

    updateEmitters() {
        this.emitters.forEach((emitter, key) => {
            const now = Date.now();
            if (now - emitter.lastEmit > 1000 / emitter.rate) {
                this.addParticle(emitter.x, emitter.y, emitter.type);
                emitter.lastEmit = now;
            }
        });
    }

    addParticle(x, y, type) {
        if (this.particles.length < this.maxParticles) {
            const particle = new EnhancedParticle(x, y, type);
            this.particles.push(particle);
        }
    }

    update() {
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.alpha > 0;
        });
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }
}

class EnhancedParticle extends Particle {
    constructor(x, y, type) {
        super(x, y, type);
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.scale = 1;
        this.scaleSpeed = -0.01;
        
        // Add more particle types
        switch(type) {
            case 'energy':
                this.color = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`; // Blue-cyan
                this.size = Math.random() * 4 + 2;
                break;
            case 'explosion':
                this.color = `hsl(${Math.random() * 60}, 100%, 50%)`; // Yellow-red
                this.size = Math.random() * 6 + 3;
                break;
            case 'sparkle':
                this.color = 'rgba(255, 255, 255,';
                this.size = Math.random() * 2 + 1;
                break;
        }
    }

    update() {
        super.update();
        this.rotation += this.rotationSpeed;
        this.scale += this.scaleSpeed;
        if (this.scale < 0) this.alpha = 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        ctx.beginPath();
        if (this.type === 'energy') {
            // Draw energy particle
            this.drawEnergyParticle(ctx);
        } else if (this.type === 'explosion') {
            // Draw explosion particle
            this.drawExplosionParticle(ctx);
        } else {
            // Draw regular particle
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        }
        
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        
        ctx.restore();
    }

    drawEnergyParticle(ctx) {
        // Draw a more complex energy particle
        for (let i = 0; i < 3; i++) {
            ctx.rotate(Math.PI * 2 / 3);
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size * 0.5, this.size);
            ctx.lineTo(-this.size * 0.5, this.size);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawExplosionParticle(ctx) {
        // Draw star-shaped explosion particle
        for (let i = 0; i < 5; i++) {
            ctx.rotate(Math.PI * 2 / 5);
            ctx.beginPath();
            ctx.moveTo(0, -this.size * 2);
            ctx.lineTo(this.size * 0.5, -this.size * 0.5);
            ctx.lineTo(this.size * 2, 0);
            ctx.lineTo(this.size * 0.5, this.size * 0.5);
            ctx.lineTo(0, this.size * 2);
            ctx.lineTo(-this.size * 0.5, this.size * 0.5);
            ctx.lineTo(-this.size * 2, 0);
            ctx.lineTo(-this.size * 0.5, -this.size * 0.5);
            ctx.closePath();
            ctx.fill();
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.player = new Player(this);
        this.player.x = 150;
        this.player.y = this.canvas.height - this.player.height;
        this.orbs = [];
        this.orbSpeed = 5;
        this.spawnInterval = 2000;
        this.lastSpawnTime = 0;
        this.gameOver = false;
        this.score = 0;
        this.startTime = Date.now();
        this.gamesPlayed = this.loadGamesPlayed();
        this.currentPlayer = this.loadCurrentPlayer() || 'Player';
        this.playerStats = this.loadPlayerStats();
        this.highScores = this.loadHighScores();
        this.stars = Array(100).fill(null).map(() => new Star(this.canvas));
        this.backgroundThemes = [
            { 
                name: 'Deep Space',
                bg: ['#0B0B2A', '#1A1A3A'],
                groundColor: '#4A4A8A',
                textColor: '#FFFFFF'
            },
            {
                name: 'Summer',
                bg: ['#87CEEB', '#4FB0E5'],
                groundColor: '#2E8B57', // Darker green
                textColor: '#000000'
            },
            {
                name: 'Winter',
                bg: ['#B0E0E6', '#87CEEB'],
                groundColor: '#4682B4', // Steel blue
                textColor: '#000000'
            },
            {
                name: 'Fall',
                bg: ['#DAA520', '#CD853F'],
                groundColor: '#8B4513',
                textColor: '#000000'
            },
            {
                name: 'Spring',
                bg: ['#98FB98', '#90EE90'],
                groundColor: '#228B22', // Forest green
                textColor: '#000000'
            },
            // Climates
            {
                name: 'Ocean',
                bg: ['#000080', '#0000CD'],
                groundColor: '#00008B',
                planetColors: ['#48D1CC', '#40E0D0', '#00CED1'],  // Bubbles
                starColor: '#E0FFFF'
            },
            {
                name: 'Desert',
                bg: ['#FFD700', '#FFA500'],
                groundColor: '#DAA520',
                planetColors: ['#F4A460', '#DEB887', '#D2691E'],  // Sand dunes
                starColor: '#FFFACD'
            },
            {
                name: 'Mountains',
                bg: ['#4682B4', '#5F9EA0'],
                groundColor: '#2F4F4F',
                planetColors: ['#808080', '#A9A9A9', '#D3D3D3'],  // Mountain peaks
                starColor: '#FFFFFF'
            }
        ];
        this.currentTheme = 0;
        this.lastThemeChange = 0;
        
        this.planets = [
            { 
                x: 600, y: 100, radius: 30, 
                color: '#FF6B6B', speed: 0.3, 
                amplitude: 30, angle: 0 
            },
            { 
                x: 200, y: 80, radius: 20, 
                color: '#4ECDC4', speed: 0.5, 
                amplitude: 20, angle: Math.PI / 2 
            },
            { 
                x: 400, y: 150, radius: 25, 
                color: '#45B7D1', speed: 0.2, 
                amplitude: 40, angle: Math.PI 
            },
            // Adding more planets with different properties
            { 
                x: 700, y: 200, radius: 15, 
                color: '#FFD93D', speed: 0.4, 
                amplitude: 25, angle: Math.PI / 4 
            },
            { 
                x: 300, y: 50, radius: 35, 
                color: '#FF8E72', speed: 0.25, 
                amplitude: 35, angle: Math.PI * 1.5 
            },
            { 
                x: 500, y: 180, radius: 22, 
                color: '#98D8AA', speed: 0.45, 
                amplitude: 28, angle: Math.PI / 3 
            },
            { 
                x: 100, y: 120, radius: 18, 
                color: '#BE9FE1', speed: 0.35, 
                amplitude: 22, angle: Math.PI / 6 
            }
        ];

        // Ask for username if not set
        if (this.currentPlayer === 'Player') {
            this.enhancedUsernamePrompt();
        }

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

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (this.gameOver) return;

        this.player.update();
        this.orbs = this.orbs.filter(orb => !orb.update());

        // Spawn new orbs
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.orbs.push(new Orb(this));
            this.lastSpawnTime = currentTime;
        }

        // Increase difficulty
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

        // Check for theme change every 100 points
        const currentScore = Math.floor((Date.now() - this.startTime) / 100);
        if (Math.floor(currentScore / 100) > Math.floor(this.lastThemeChange / 100)) {
            this.currentTheme = Math.floor(Math.random() * this.backgroundThemes.length);
            this.lastThemeChange = currentScore;
            
            // Randomly change planet colors too
            this.planets.forEach(planet => {
                planet.color = this.getRandomColor();
            });
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0B0B2A';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw game elements
        this.player.draw(this.ctx);
        this.orbs.forEach(orb => orb.draw(this.ctx));
        
        // Draw score with contrasting color and outline
        const theme = this.backgroundThemes[this.currentTheme];
        this.ctx.fillStyle = theme.textColor;
        this.ctx.strokeStyle = theme.textColor === '#000000' ? '#FFFFFF' : '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.font = '20px Arial';
        this.ctx.strokeText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);

        if (this.gameOver) {
            // Game over text with outline for visibility
            this.ctx.font = '40px Arial';
            this.ctx.strokeText('Game Over!', 
                this.canvas.width/2 - 100, 
                this.canvas.height/2
            );
            this.ctx.fillText('Game Over!', 
                this.canvas.width/2 - 100, 
                this.canvas.height/2
            );
        }
    }

    loadHighScores() {
        const scores = localStorage.getItem('hyperjumpScores');
        return scores ? JSON.parse(scores) : [];
    }

    saveHighScore(score) {
        // Increment games played
        this.gamesPlayed++;
        localStorage.setItem('gamesPlayed', this.gamesPlayed.toString());

        // Save score with username
        const scoreEntry = {
            username: this.currentPlayer,
            score: score,
            date: new Date().toISOString()
        };

        const scores = this.loadHighScores();
        scores.push(scoreEntry);
        scores.sort((a, b) => b.score - a.score);
        this.highScores = scores.slice(0, 5); // Keep top 5
        
        localStorage.setItem('hyperjumpScores', JSON.stringify(this.highScores));
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        const scoreList = document.getElementById('scoreList');
        scoreList.innerHTML = '';
        
        // Title
        const titleElement = document.createElement('h2');
        titleElement.textContent = '⭐ HIGH SCORES ⭐';
        titleElement.style.color = '#FFF';
        titleElement.style.fontSize = '32px';
        titleElement.style.fontWeight = 'bold';
        titleElement.style.letterSpacing = '2px';
        titleElement.style.textShadow = '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700';
        titleElement.style.marginBottom = '30px';
        scoreList.appendChild(titleElement);

        // Player Stats Section
        const statsElement = document.createElement('div');
        statsElement.style.marginBottom = '30px';
        statsElement.style.padding = '15px';
        statsElement.style.borderRadius = '10px';
        statsElement.style.background = 'rgba(74, 74, 138, 0.2)';
        statsElement.innerHTML = `
            <div style="color: #2ecc71; font-size: 20px; margin-bottom: 15px; text-shadow: 0 0 10px #2ecc71">
                Playing as: ${this.currentPlayer}
                <span style="font-size: 12px; cursor: pointer; margin-left: 10px; color: #FFF">
                    (click to change)
                </span>
            </div>
            <div style="color: #FFF; font-size: 16px; margin-bottom: 10px">
                Games Played: ${this.gamesPlayed}
            </div>
            <div style="color: #FFF; font-size: 16px; margin-bottom: 10px">
                Best Score: ${this.playerStats.bestScore}
            </div>
            <div style="color: #FFF; font-size: 16px; margin-bottom: 10px">
                Total Jumps: ${this.playerStats.totalJumps}
            </div>
            <div style="color: #FFF; font-size: 16px;">
                Play Time: ${Math.floor(this.playerStats.totalPlayTime / 60)}m ${this.playerStats.totalPlayTime % 60}s
            </div>
        `;
        statsElement.querySelector('span').onclick = () => this.enhancedUsernamePrompt();
        scoreList.appendChild(statsElement);

        // Leaderboard
        if (this.highScores && this.highScores.length > 0) {
            this.highScores.forEach((scoreEntry, index) => {
                const scoreElement = document.createElement('div');
                scoreElement.style.color = '#FFF';
                scoreElement.style.fontSize = '24px';
                scoreElement.style.marginBottom = '15px';
                scoreElement.style.textShadow = '0 0 10px #2ecc71, 0 0 20px #2ecc71';
                scoreElement.style.display = 'flex';
                scoreElement.style.justifyContent = 'space-between';
                scoreElement.style.width = '100%';
                scoreElement.style.padding = '5px 0';
                
                scoreElement.innerHTML = `
                    <span style="color: #2ecc71; text-shadow: 0 0 10px #2ecc71">
                        #${index + 1} ${index === 0 ? '👑' : ''} ${scoreEntry.username || 'Anonymous'}
                    </span>
                    <span style="color: #FFF; text-shadow: 0 0 10px #2ecc71">
                        ${scoreEntry.score || 0} pts
                    </span>
                `;
                
                scoreList.appendChild(scoreElement);
            });
        } else {
            const noScoresElement = document.createElement('div');
            noScoresElement.style.color = '#FFF';
            noScoresElement.style.fontSize = '20px';
            noScoresElement.style.textAlign = 'center';
            noScoresElement.textContent = 'No scores yet. Be the first!';
            scoreList.appendChild(noScoresElement);
        }
    }

    restart() {
        this.saveHighScore(this.score);
        this.gameOver = false;
        this.orbs = [];
        this.orbSpeed = 5;
        this.spawnInterval = 2000;
        this.score = 0;
        this.startTime = Date.now();
        this.player = new Player(this);
        
        // Reset theme-related properties
        this.currentTheme = Math.floor(Math.random() * this.backgroundThemes.length);
        this.lastThemeChange = 0;
        
        // Reset planets with new colors
        this.planets.forEach(planet => {
            planet.color = this.getRandomColor();
            planet.x = Math.random() * this.canvas.width; // Randomize positions
            planet.angle = Math.random() * Math.PI * 2; // Randomize angles
        });

        // Reset stars for themes that use them
        this.stars = Array(100).fill(null).map(() => new Star(this.canvas));
    }

    getRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD93D', 
            '#FF8E72', '#98D8AA', '#BE9FE1', '#FF9EAA',
            '#95BDFF', '#B4E4FF', '#BAFFB4', '#FFB4B4'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    drawBackground() {
        const theme = this.backgroundThemes[this.currentTheme];
        
        // Draw gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, theme.bg[0]);
        gradient.addColorStop(1, theme.bg[1]);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw theme-specific elements
        switch(theme.name) {
            case 'Summer':
                this.drawClouds();
                break;
            case 'Winter':
                this.drawSnow();
                break;
            case 'Fall':
                this.drawFallingLeaves();
                break;
            case 'Spring':
                this.drawCherryBlossoms();
                break;
            case 'Ocean':
                this.drawBubbles();
                break;
            case 'Desert':
                this.drawSandDunes();
                break;
            case 'Mountains':
                this.drawMountainPeaks();
                break;
            default:
                // Space theme - draw stars and planets as before
                this.stars.forEach(star => {
                    star.update();
                    star.draw(this.ctx);
                });
                this.drawPlanets();
        }

        // Draw ground with theme color
        this.ctx.strokeStyle = theme.groundColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.stroke();
    }

    // Add these new drawing methods
    drawClouds() {
        // Draw fluffy white clouds
        this.planets.forEach(planet => {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.beginPath();
            this.ctx.arc(planet.x, planet.y + Math.sin(planet.angle) * planet.amplitude, 
                        planet.radius, 0, Math.PI * 2);
            this.ctx.arc(planet.x + 20, planet.y + Math.sin(planet.angle) * planet.amplitude - 10, 
                        planet.radius * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawSnow() {
        // Draw falling snowflakes
        this.stars.forEach(star => {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Add sparkle effect
            this.ctx.shadowColor = '#FFFFFF';
            this.ctx.shadowBlur = 5;
            this.ctx.fill();
        });
    }

    // ... Add similar methods for other themes ...

    drawGameElements() {
        // Draw player with energy trail
        if (this.player.jumping) {
            for (let i = 0; i < 3; i++) {
                this.particles.addParticle(
                    this.player.x + this.player.width/2,
                    this.player.y + this.player.height,
                    'jump'
                );
            }
        }
        
        this.player.draw(this.ctx);

        // Draw orbs with enhanced effects
        this.orbs.forEach(orb => {
            // Add trailing particles
            this.particles.addParticle(orb.x, orb.y, 'trail');
            orb.draw(this.ctx);
        });

        // Draw score with glow effect
        this.drawGlowingText(`Score: ${this.score}`, 10, 30, '#fff');
    }

    drawGlowingText(text, x, y, color) {
        this.ctx.save();
        
        // Draw glow
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = color;
        this.ctx.font = '20px Arial';
        this.ctx.fillText(text, x, y);
        
        // Draw sharp text
        this.ctx.shadowBlur = 0;
        this.ctx.fillText(text, x, y);
        
        this.ctx.restore();
    }

    drawPlanets() {
        this.planets.forEach(planet => {
            // Update planet position
            planet.angle += planet.speed * 0.02;
            const yOffset = Math.sin(planet.angle) * planet.amplitude;
            
            // Move planets horizontally and wrap around
            planet.x -= planet.speed;
            if (planet.x + planet.radius < 0) {
                planet.x = this.canvas.width + planet.radius;
            }

            // Draw planet
            this.ctx.beginPath();
            this.ctx.fillStyle = planet.color;
            this.ctx.arc(planet.x, planet.y + yOffset, planet.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Add shading
            const gradient = this.ctx.createRadialGradient(
                planet.x - planet.radius/3, 
                planet.y + yOffset - planet.radius/3, 
                0,
                planet.x, 
                planet.y + yOffset, 
                planet.radius
            );
            gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
    }

    drawFallingLeaves() {
        this.planets.forEach(planet => {
            planet.angle += planet.speed * 0.02;
            const yOffset = Math.sin(planet.angle) * planet.amplitude;
            planet.x -= planet.speed;
            if (planet.x + planet.radius < 0) {
                planet.x = this.canvas.width + planet.radius;
            }

            // Draw leaf
            this.ctx.fillStyle = planet.color;
            this.ctx.beginPath();
            this.ctx.ellipse(
                planet.x, 
                planet.y + yOffset, 
                planet.radius, 
                planet.radius/2, 
                planet.angle, 
                0, 
                Math.PI * 2
            );
            this.ctx.fill();
        });
    }

    drawCherryBlossoms() {
        this.planets.forEach(planet => {
            planet.angle += planet.speed * 0.02;
            const yOffset = Math.sin(planet.angle) * planet.amplitude;
            planet.x -= planet.speed;
            if (planet.x + planet.radius < 0) {
                planet.x = this.canvas.width + planet.radius;
            }

            // Draw petal
            this.ctx.fillStyle = planet.color;
            for(let i = 0; i < 5; i++) {
                this.ctx.beginPath();
                this.ctx.ellipse(
                    planet.x, 
                    planet.y + yOffset, 
                    planet.radius/2, 
                    planet.radius/4, 
                    (planet.angle + i * Math.PI/2.5), 
                    0, 
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });
    }

    drawBubbles() {
        this.planets.forEach(planet => {
            planet.angle += planet.speed * 0.02;
            const yOffset = Math.sin(planet.angle) * planet.amplitude;
            planet.x -= planet.speed;
            if (planet.x + planet.radius < 0) {
                planet.x = this.canvas.width + planet.radius;
            }

            // Draw bubble
            this.ctx.strokeStyle = planet.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(planet.x, planet.y + yOffset, planet.radius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Add highlight
            this.ctx.beginPath();
            this.ctx.arc(
                planet.x - planet.radius/3, 
                planet.y + yOffset - planet.radius/3, 
                planet.radius/4, 
                0, 
                Math.PI * 2
            );
            this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
            this.ctx.fill();
        });
    }

    drawSandDunes() {
        // Draw sand dunes at the bottom
        for(let i = 0; i < this.canvas.width; i += 100) {
            this.ctx.fillStyle = this.backgroundThemes[this.currentTheme].planetColors[0];
            this.ctx.beginPath();
            this.ctx.moveTo(i, this.canvas.height);
            this.ctx.quadraticCurveTo(
                i + 50, 
                this.canvas.height - 30, 
                i + 100, 
                this.canvas.height
            );
            this.ctx.fill();
        }

        // Draw dust particles
        this.stars.forEach(star => {
            this.ctx.fillStyle = 'rgba(244, 164, 96, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawMountainPeaks() {
        // Draw mountain silhouettes
        for(let i = 0; i < this.canvas.width; i += 200) {
            this.ctx.fillStyle = this.backgroundThemes[this.currentTheme].planetColors[0];
            this.ctx.beginPath();
            this.ctx.moveTo(i, this.canvas.height);
            this.ctx.lineTo(i + 100, this.canvas.height - 150);
            this.ctx.lineTo(i + 200, this.canvas.height);
            this.ctx.fill();

            // Add snow caps
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.moveTo(i + 85, this.canvas.height - 130);
            this.ctx.lineTo(i + 100, this.canvas.height - 150);
            this.ctx.lineTo(i + 115, this.canvas.height - 130);
            this.ctx.fill();
        }

        // Draw birds
        this.stars.forEach(star => {
            this.ctx.strokeStyle = '#000';
            this.ctx.beginPath();
            this.ctx.moveTo(star.x - 10, star.y);
            this.ctx.quadraticCurveTo(star.x, star.y - 5, star.x + 10, star.y);
            this.ctx.stroke();
        });
    }

    loadPlayerStats() {
        const stats = localStorage.getItem('playerStats');
        return stats ? JSON.parse(stats) : {
            totalJumps: 0,
            totalDistance: 0,
            bestScore: 0,
            totalPlayTime: 0,
            startTime: Date.now()
        };
    }

    updatePlayerStats() {
        this.playerStats.totalJumps++;
        this.playerStats.totalDistance += this.orbSpeed;
        this.playerStats.bestScore = Math.max(this.playerStats.bestScore, this.score);
        this.playerStats.totalPlayTime = Math.floor((Date.now() - this.playerStats.startTime) / 1000);
        localStorage.setItem('playerStats', JSON.stringify(this.playerStats));
    }

    enhancedUsernamePrompt() {
        // Create modal for username input
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(11, 11, 42, 0.95);
            padding: 30px;
            border-radius: 15px;
            border: 2px solid #4A4A8A;
            box-shadow: 0 0 20px rgba(74, 74, 138, 0.5);
            z-index: 1000;
            text-align: center;
        `;

        modal.innerHTML = `
            <h2 style="color: #FFF; margin-bottom: 20px; text-shadow: 0 0 10px #4A4A8A;">
                Welcome to HyperJump!
            </h2>
            <p style="color: #FFF; margin-bottom: 20px;">
                Enter your username to join the leaderboard:
            </p>
            <input type="text" id="usernameInput" maxlength="15" placeholder="Username" style="
                padding: 10px;
                margin-bottom: 20px;
                border: none;
                border-radius: 5px;
                background: #1A1A3A;
                color: #FFF;
                width: 200px;
                font-size: 16px;
                text-align: center;
            ">
            <br>
            <button id="submitUsername" style="
                padding: 10px 20px;
                background: #2ecc71;
                border: none;
                border-radius: 5px;
                color: #FFF;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.3s ease;
            ">Start Playing!</button>
        `;

        document.body.appendChild(modal);

        const input = modal.querySelector('#usernameInput');
        const button = modal.querySelector('#submitUsername');

        input.focus();

        button.onmouseover = () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 0 15px rgba(46, 204, 113, 0.5)';
        };

        button.onmouseout = () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = 'none';
        };

        const handleSubmit = () => {
            const username = input.value.trim();
            if (username) {
                this.currentPlayer = username;
                localStorage.setItem('currentPlayer', username);
                document.body.removeChild(modal);
                this.updateScoreDisplay();
            }
        };

        button.onclick = handleSubmit;
        input.onkeypress = (e) => {
            if (e.key === 'Enter') handleSubmit();
        };
    }

    loadGamesPlayed() {
        return parseInt(localStorage.getItem('gamesPlayed') || '0');
    }

    loadCurrentPlayer() {
        return localStorage.getItem('currentPlayer');
    }
}

// Start the game when the page loads
window.onload = () => {
    const game = new Game();
    game.updateScoreDisplay();
}; 