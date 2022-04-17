/*

Name:      Matthew Chen
Title:     Rocket Patrol Mods
Date:      4/18/2022
Work Time: 10 hours

Points Breakdown:

(10) Display the time remaining (in seconds) on the screen
(10) Implement parallax scrolling
(20) Implement a new timing/scoring mechanism that adds time to the clock for successful hits
(20) Implement mouse control for player movement and mouse click to fire
(20) Use Phaser's particle emitter to create a particle explosion when the rocket hits the spaceship
(20) Create and implement a new weapon (w/ new behavior and graphics)

Total: 100

*/

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    scene: [Menu, Play]
}

const game = new Phaser.Game(config);

// set UI sizes
let borderUISize = game.config.height / 15;
let borderPadding = borderUISize / 3;

// reserve keyboard vars
let keyF, keyR, keyLEFT, keyRIGHT;

let highScore = 0;