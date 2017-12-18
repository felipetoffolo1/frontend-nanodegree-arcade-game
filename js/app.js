var currentGame;
// https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * @description Format number to 2 digits
 * @param {number} myNumber
 * @returns {number} with 2 digits
 */
const formatNumber = function (myNumber) {
    return ('0' + myNumber).slice(-2);
};

/**
 * @description get a random element from a array
 * @returns random element from array
 */
Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}
/**
 * @description Create a game
 * @constructor
 * @param {array} createEnemies - Array of enemies to be created
 * @param {array} createGem - Array of gems to be created
 * 
 * @property {object} player - Player of the game
 * @property {string} currentGem - Gem that is showed on the screen
 * @property {number} collectedGems - NUmber of gems collected
 * @property {date} startDate - Date when the game was started
 * @property {array} allEnemies - Array where are all the enemies objects
 * @property {boolean} running - Define if the element are moving on the game
 * @property {number} wins - Number off times the player reach the end
 * @property {string} player - Number off times the player reach the end
 * @property {string} player - Create new player
 */
class Game {
    constructor(createEnemies = [{
            x: -10,
            y: 65,
            speed: 4
        }, {
            x: -200,
            y: 145,
            speed: 5
        }, {
            x: -100,
            y: 225,
            speed: 10
        }],
        createGems = [{
            sprite: 'images/gem-blue.png'
        }, {
            sprite: 'images/gem-green.png'
        }, {
            sprite: 'images/gem-orange.png'
        }]
    ) {
        this.player = new Player({});
        this.currentGem;
        this.collectedGems = 0;
        this.startDate = new Date().getTime();
        this.allEnemies = [];
        this.running = true;
        this.wins = 0;

        document.getElementById('reset-button').classList.add('hide')
        this.startTimer();
        // Generante the enemies
        createEnemies.forEach((element) => {
            var newEnemy = new Enemy(element);
            this.allEnemies.push(newEnemy);

        });
        // Generate gems on random instervals
        this.generateGem = setInterval(
            () => {
                this.currentGem = new Gem(createGems.randomElement());
            }, getRandomInt(4, 10) * 1000);

    }
    /** Function check tha check the position of the element to know if they collided*/
    checkCollisions() {
        // Check enemies 
        this.allEnemies.forEach((element) => {
            if (element.checkLineUp('x', this.player.x) && element.checkLineUp('y', this.player.y)) {
                // if the player and enemie collided stop the game
                this.stop();
            }

            if (this.currentGem) {
                if (element.checkLineUp('x', this.currentGem.x) && element.checkLineUp('y', this.currentGem.y)) {
                    // if enemie and gem collided hide the gem
                    this.currentGem.hide();
                }
            }
        })
        if (this.currentGem) {
            if (this.player.checkLineUp('y', this.currentGem.y) && this.player.checkLineUp('x', this.currentGem.x)) {
                // If gem and player collided collect the gem
                this.currentGem.collected(this);

            }
        }

    }
    /** Start the timer and set time on template */
    startTimer() {
        this.countDown = setInterval(() => {
            let now = new Date().getTime();
            let timeDiference = now - this.startDate;
            let minutes = formatNumber(Math.floor((timeDiference % (1000 * 60 * 60)) / (1000 * 60)));
            let seconds = formatNumber(Math.floor((timeDiference % (1000 * 60)) / 1000));
            document.getElementById('timer').innerHTML = minutes + ':' + seconds;
        }, 1000);
    }
    /** Stop the game */
    stop() {
        clearInterval(this.countDown);
        this.running = false;
        document.getElementById('reset-button').classList.remove('hide')
    }
    /** Add a win to the player */
    addWin() {
        if (!this.player.winner) {
            this.player.winner = true;
            this.wins++
                document.getElementById('win-counter').innerHTML = `${this.wins}`;
            setTimeout(() => this.player = new Player({}), 100);
        }

    }

}
/**
 * @description class for a ganeric element of the game to be displayed
 * @constructor
 * @param {number} x - position on the x axis
 * @param {number} y - position on the y axis
 * @param {string} sprite - image of the element
 * 
 * @property {number} x - position on the x axis
 * @property {number} y - position on the y axis
 * @property {string} sprite - image of the element
 * @property {number} xDist -  The movement size for the elements to be used on each step on the x axis
 * @property {number} yDist -  The movement size for the elements to be used on each step the y axis
 */
class GameElement {
    constructor({
        x = 0,
        y = 65,
        sprite
    }) {
        // Position X and Y of the element
        this.x = x;
        this.y = y;
        // The movement size for the elements to be used on each step
        this.yDist = 80;
        this.xDist = 100;
        // The image/sprite for our caracther, this uses
        this.sprite = sprite;
    }

    /** Render the element */
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
    /**
     *@description check is a element is lined up with another one
     * @param {string} axis - The axis to by analized (x or y) 
     * @param {number} position - The element position on the axis to be analized 
     */
    checkLineUp(axis, position) {
        if (axis === 'x') {
            return Math.abs(position - this[axis]) < (this.xDist - 20);
        }
        if (axis === 'y') {
            return Math.abs(position - this[axis]) < (this.yDist - 20);
        }
    }


}
/**
 * @description Enemy class
 * @constructor
 * @param {number} x - position on the x axis
 * @param {number} y - position on the y axis
 * @param {string} sprite - image of the enemy
 * @param {number} speed - speed of the enemy
 * 
 * @property {string} speed - speed of the enemy
 */
class Enemy extends GameElement {
    constructor({
        x,
        y,
        sprite = 'images/enemy-bug.png',
        speed = 3
    }) {
        super({
            x,
            y,
            sprite
        });
        // moviment speed
        this.speed = speed;
    }
    /** Move the enemy according to it speed */
    update(dt) {
        this.x += 10 * dt * this.speed;
        this.x >= 500 ? this.x = -10 : this.x;

    }
}
/**
 * @description Player Class
 * @constructor
 * @param {number} x - position on the x axis
 * @param {number} y - position on the y axis
 * @param {string} sprite - image of the player
 * 
 * @property {string} winner - True if the player win the game
 */
class Player extends GameElement {
    constructor({
        x = 200,
        y = 385,
        sprite = 'images/char-boy.png'
    }) {
        super({
            x,
            y,
            sprite
        });
        // When this player win the game is set to true
        this.winner = false;

    }
    /** Handle the player control
     * @param {string} input - keyboad input
     */
    handleInput(input) {
        switch (input) {
            case 'up':
                var newY = this.y - this.yDist
                newY >= -30 ? this.y = newY : '';
                break;
                case 'down':
                var newY = this.y + this.yDist
                newY <= 385 ? this.y = newY : '';
                break;
                case 'right':
                var newX = this.x + this.xDist
                newX <= 400 ? this.x = newX : '';
                break;
                case 'left':
                var newX = this.x - this.xDist
                newX >= 0 ? this.x = newX : '';
                break;

            default:
                break;
        }
    }
    update() {
        if (this.y === -15) {
            currentGame.addWin();
        }

    }
}

/**
 * @description Player Class
 * @constructor
 * @param {number} x - position on the x axis
 * @param {number} y - position on the y axis
 * @param {string} sprite - image of the player
 */
class Gem extends GameElement {
    constructor({
        x,
        y = 65,
        sprite = 'images/gem-blue.png'
    }) {
        super({
            x,
            y,
            sprite
        })
        // Set a randowm position for the gem
        this.x += getRandomInt(0, 4) * this.xDist;
        this.y += getRandomInt(0, 2) * this.yDist;
    }
    /** Functionthat hides the gem out of the board */
    hide() {
        this.x = -100;
        this.y = -100;
    }
    /** Function to be called when a player collect the gem */
    collected(game) {
        this.hide();
        game.collectedGems++;
        document.getElementById('gem-counter').innerHTML = `${game.collectedGems}`;
    }
}


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    currentGame.player.handleInput(allowedKeys[e.keyCode]);
});

/** Send movement for mobile users */
var mobileMovement = function (e) {
    e.preventDefault();
    currentGame.player.handleInput(this.id);
}
document.getElementById('up').addEventListener("touchstart", mobileMovement);
document.getElementById('down').addEventListener("touchstart", mobileMovement);
document.getElementById('left').addEventListener("touchstart", mobileMovement);
document.getElementById('right').addEventListener("touchstart", mobileMovement)
document.getElementById('control-container').addEventListener("touchstart", function(e){
    e.preventDefault();
})