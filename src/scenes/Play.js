

class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // load images/tile sprites
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('background', './assets/background.png');
        this.load.image('starfield', './assets/starfield.png');
        this.load.image('starfield2', './assets/starfield2.png');
        this.load.image('explosion-particle', './assets/explosion-particle.png');
        this.load.image('beam', './assets/beam.png');

        // load spritesheet
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 64, startFrame: 0, endFrame: 6});
    }

    create() {

        // place space background
        this.space = this.add.rectangle(0, 0, game.config.width, game.config.height, 0x000000);
        this.background = this.add.image(game.config.width / 2, game.config.height / 2, 'background');

        // place tile sprite
        this.starfield1 = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'starfield').setOrigin(0, 0);
        this.starfield2 = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'starfield2').setOrigin(0, 0);

        // define keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);


        // add freeze beam
        this.beam = this.add.tileSprite(0, 0, 64, 480, 'beam').setOrigin(.5, 0);
        this.beam.visible = false;
        this.beamDuration = 2000;
        this.beamTimeout;
        this.beamCooldown = 1000;
        this.beamReady = true;


        // add rocket (p1)
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(.5, .5);


        // add spaceships (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'spaceship', 0, 30).setOrigin(0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0);

        // add explosion particle emitter
        const particles = this.add.particles('explosion-particle');

        this.emitter = particles.createEmitter({
            speed: {min: 80, max: 100},
            lifespan: {min: 200, max: 1000},
            scale: {start: 1, end: 0},
            frequency: -1
        });


        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        // white borders
        this.defaultBorderColor = 0xFFFFFF;
        this.borders = [
            this.add.rectangle(0, 0, game.config.width, borderUISize, this.defaultBorderColor).setOrigin(0, 0),
            this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, this.defaultBorderColor).setOrigin(0, 0),
            this.add.rectangle(0, 0, borderUISize, game.config.height, this.defaultBorderColor).setOrigin(0, 0),
            this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, this.defaultBorderColor).setOrigin(0, 0)
        ];
    
        // animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 6, first: 0}),
            frameRate: 15
        });

        // initialize score
        this.p1Score = 0;

        // set time remaining for custom timer
        this.timeRemaining = game.settings.gameTimer;

        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig);
        this.scoreRight = this.add.text(game.config.width - borderUISize - borderPadding, borderUISize + borderPadding*2, this.timeRemaining, scoreConfig).setOrigin(1,0);

        // add freeze beam indicator
        scoreConfig.fixedWidth = 200;
        scoreConfig.align = 'left';
        this.scoreBeam = this.add.text(game.config.width / 2, borderUISize + borderPadding*2, 'Beam: Ready', scoreConfig).setOrigin(.5,0);

        this.gameOver = false;

        // 60-second play clock
        scoreConfig.fixedWidth = 0;
        
        this.gameOverFunction = () => {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or <- for Menu', scoreConfig).setOrigin(0.5);
            this.gameOver = true;
            this.defaultBorderColor = 0xFF0000;
            this.setBorderColor(this.defaultBorderColor);
        }

        // border flashing effect variables
        this.flashing = false;
        this.flashTimeout;
        this.flashColors = [
            0x00FF00,
            0xFFFF00,
            0x0000FF
        ]
        this.flashIndex = 0;
    }

    update(time, delta) {

        if (this.timeRemaining <= 0) {
            this.gameOverFunction();
            this.timeRemaining = 0
            this.scoreRight.text = "0.00";
        }

        // check key input for restart
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }

        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }

        this.starfield1.tilePositionX -= 2;
        this.starfield2.tilePositionX -= 5;

        if (this.gameOver) {
            return;
        }

        this.p1Rocket.update();
        this.ship01.update();
        this.ship02.update();
        this.ship03.update();

        // update and show time remaining
        this.timeRemaining -= delta;
        this.scoreRight.text = (this.timeRemaining * .001).toFixed(2);

        const pointer = game.input.activePointer;

        // control freeze beam
        if (pointer.isDown && pointer.button === 2) {
            if (!this.beam.visible && this.beamReady) {
                this.sound.play('sfx_beam');
                this.beamReady = false;
                this.scoreBeam.text = 'Beam:Cooling';
                this.beam.x = this.p1Rocket.x;
                this.beamActive = true;
                clearTimeout(this.beamTimeout);
                this.beamTimeout = setTimeout(() => {
                    this.beamActive = false;
                    setTimeout(() => {
                        this.beamReady = true;
                        this.scoreBeam.text = 'Beam: Ready';
                    }, this.beamCooldown);
                }, this.beamDuration);
            }
        }

        // control visuals of freeze beam
        if (this.beam.visible) {
            this.beam.tilePositionY += 10;
        }

        if (this.beamActive) {
            this.beam.visible = true;
            if (this.beam.scaleX < 1) {
                this.beam.scaleX = Math.min(this.beam.scaleX + delta * .02, 1);
            } else {
                this.beam.scaleX = 1 + (Math.sin(time * .05) + 1) * .05;
            }
        } else {
            if (this.beam.scaleX > 0) {
                this.beam.scaleX = Math.max(this.beam.scaleX - delta * .02, 0);
            } else {
                this.beam.scaleX = 0;
                this.beam.visible = false;
            }
        }

        
        for (const ship of [this.ship01, this.ship02, this.ship03]) {

            // check collision with freeze beam
            if (this.beamActive) {
                if (ship.x < this.beam.x + this.beam.scaleX * this.beam.width / 2 &&
                ship.x + ship.width > this.beam.x - this.beam.scaleX * this.beam.width / 2) {
                    ship.moveSpeedScale = game.settings.beamEffectScale;
                } else {
                    ship.moveSpeedScale = 1;
                }
            } else {
                ship.moveSpeedScale = 1;
            }

            // check collisions
            if (this.checkCollision(this.p1Rocket, ship)) {
                this.p1Rocket.reset();
                this.shipExplode(ship);
            }
        }
        
    }

    setBorderColor(color) {
        for (const rect of this.borders) {
            rect.fillColor = color;
        }
    }

    addTime(ms) {
        this.timeRemaining += ms;
    }

    checkCollision(rocket, ship) {
        // simple AABB checking
        if (rocket.x < ship.x + ship.width && 
            rocket.x + rocket.width > ship.x && 
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship. y) {
                return true;
        } else {
            return false;
        }
    }

    shipExplode(ship) {
        ship.alpha = 0;

        const shipCenterX = ship.x + ship.width / 2; 
        const shipCenterY = ship.y + ship.height / 2;

        const boom = this.add.sprite(shipCenterX, shipCenterY, 'explosion').setOrigin(.5);
        boom.anims.play('explode');
        boom.on('animationcomplete', () => {
            ship.reset();
            ship.alpha = 1;
            boom.destroy();
        });

        // score add and repaint
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;

        // add to time based on points
        this.addTime(ship.points * 500 * game.settings.addTimerScale);

        this.sound.play('sfx_explosion');

        // set explosion particle emitter position and create explosion effect
        this.emitter.setPosition(shipCenterX, shipCenterY);
        this.emitter.explode(100);


        // border flashing effect
        if (!this.flashing) {
            this.flashIndex = 0;
            this.flashInterval = setInterval(() => {
                if (this.flashIndex >= this.flashColors.length) {
                    this.flashIndex = 0;
                }
                this.setBorderColor(this.flashColors[this.flashIndex]);
                this.flashIndex += 1;
            }, 50);
        }
        this.flashing = true;
        clearTimeout(this.flashTimeout);
        this.flashTimeout = setTimeout(() => {
            this.flashing = false;
            this.setBorderColor(this.defaultBorderColor);
            clearInterval(this.flashInterval);
        }, 500);
    }
}