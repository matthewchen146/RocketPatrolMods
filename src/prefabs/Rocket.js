

class Rocket extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
    
        this.isFiring = false;
        this.moveSpeed = 2;

        this.sfxRocket = scene.sound.add('sfx_rocket'); // add rocket sfx

        this.maxX = game.config.width - borderUISize - this.width;
        this.minX = borderUISize + this.width;
    }

    update() {
        const pointer = game.input.activePointer;

        // mouse control for rocket
        if (!this.isFiring) {
            this.x = Math.min(this.maxX, Math.max(this.minX, pointer.worldX));
        }

        // left click to fire
        if (pointer.isDown && pointer.button === 0) {
            this.fire();
        }


        if (this.isFiring && this.y >= borderUISize * 3 + borderPadding) {
            this.y -= this.moveSpeed;
        }

        if (this.y <= borderUISize * 3 + borderPadding) {
            this.reset();
        }
    }

    fire() {
        if (!this.isFiring) {
            this.isFiring = true;
            this.sfxRocket.play();
        }
    }

    reset() {
        this.isFiring = false;
        this.y = game.config.height - borderUISize - borderPadding;
    }
}