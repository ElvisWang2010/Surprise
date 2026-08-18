/* =========================================
   CATCH THE HEARTS
========================================= */

const gameField = document.getElementById("gameField");
const player = document.getElementById("player");

const scoreDisplay = document.getElementById("score");
const missedDisplay = document.getElementById("missed");
const speedDisplay = document.getElementById("speed");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const finalScore = document.getElementById("finalScore");
const finalMissed = document.getElementById("finalMissed");
const gameMessage = document.getElementById("gameMessage");

const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");


/* =========================================
   ASSETS
========================================= */

const ALIVE_HEART =
    "../assets/game/AliveHeart.png";

const DEAD_HEART =
    "../assets/game/DeadHeart.png";

const PLAYER_IMAGE =
    "../assets/game/NysaHelloKittyFusionPlayer.png";


/* =========================================
   GAME SETTINGS
========================================= */

let gameRunning = false;

let score = 0;

let missed = 0;

const MAX_MISSED = 5;

let hearts = [];

let animationFrame = null;

let lastTime = 0;

let spawnTimer = 0;

let playerX = 0;

let movementLeft = false;

let movementRight = false;


/*
    Starting speed.
    Hearts start faster than before.
*/

let fallSpeed = 220;


/*
    Speed multiplier increases
    every time a heart is caught.
*/

let speedMultiplier = 1;


/*
    Starting spawn time.
*/

let spawnInterval = 700;


/*
    Hearts cannot spawn faster
    than this.
*/

const MIN_SPAWN_INTERVAL = 180;


/*
    Maximum difficulty.
*/

const MAX_SPEED_MULTIPLIER = 5;


/*
    Player movement speed.
*/

const PLAYER_SPEED = 450;


/* =========================================
   RESET PLAYER
========================================= */

function resetPlayer() {

    const fieldWidth =
        gameField.clientWidth;

    playerX =
        fieldWidth / 2;

    player.style.left =
        `${playerX}px`;

}


/* =========================================
   START GAME
========================================= */

function startGame() {

    /*
        Stop any previous game.
    */

    if (animationFrame !== null) {

        cancelAnimationFrame(
            animationFrame
        );

    }


    /*
        Remove all old hearts.
    */

    hearts.forEach(function(heart) {

        if (heart.element) {

            heart.element.remove();

        }

    });

    hearts = [];


    /*
        Reset everything.
    */

    score = 0;

    missed = 0;

    fallSpeed = 220;

    speedMultiplier = 1;

    spawnInterval = 700;

    spawnTimer = 0;

    lastTime = performance.now();

    gameRunning = true;


    /*
        Reset displays.
    */

    scoreDisplay.textContent =
        "0";

    missedDisplay.textContent =
        "0/5";

    speedDisplay.textContent =
        "1x";


    /*
        Hide screens.
    */

    startScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );


    /*
        Reset player.
    */

    resetPlayer();


    /*
        Start game loop.
    */

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================
   GAME LOOP
========================================= */

function gameLoop(timestamp) {

    if (!gameRunning) {

        return;

    }


    const deltaTime =
        Math.min(
            (timestamp - lastTime) / 1000,
            0.05
        );


    lastTime = timestamp;


    /*
        Move player.
    */

    updatePlayer(
        deltaTime
    );


    /*
        Spawn hearts.
    */

    spawnTimer +=
        deltaTime * 1000;


    if (
        spawnTimer >=
        spawnInterval
    ) {

        spawnTimer = 0;

        spawnHeart();

    }


    /*
        Move hearts.
    */

    updateHearts(
        deltaTime
    );


    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================
   PLAYER MOVEMENT
========================================= */

function updatePlayer(deltaTime) {

    const playerWidth =
        player.offsetWidth;

    const fieldWidth =
        gameField.clientWidth;


    if (movementLeft) {

        playerX -=
            PLAYER_SPEED *
            deltaTime;

    }


    if (movementRight) {

        playerX +=
            PLAYER_SPEED *
            deltaTime;

    }


    /*
        Keep player inside game.
    */

    const minimumX =
        playerWidth / 2;

    const maximumX =
        fieldWidth -
        playerWidth / 2;


    playerX =
        Math.max(
            minimumX,
            Math.min(
                maximumX,
                playerX
            )
        );


    player.style.left =
        `${playerX}px`;

}


/* =========================================
   SPAWN HEART
========================================= */

function spawnHeart() {

    if (!gameRunning) {

        return;

    }


    const element =
        document.createElement("img");


    /*
        Chance of a broken heart.

        Starts around 12%.
        Slowly increases.
    */

    const brokenChance =
        Math.min(
            0.30,
            0.12 +
            score * 0.004
        );


    const isBroken =
        Math.random() <
        brokenChance;


    /*
        Choose image.
    */

    if (isBroken) {

        element.src =
            DEAD_HEART;

    } else {

        element.src =
            ALIVE_HEART;

    }


    element.className =
        "falling-heart";

    element.alt = "";

    element.draggable = false;


    /*
        Heart size.
    */

    const heartSize = 52;


    /*
        Random horizontal position.
    */

    const maximumX =
        gameField.clientWidth -
        heartSize;


    const x =
        Math.random() *
        Math.max(
            0,
            maximumX
        );


    /*
        Start just above
        the visible game area.
    */

    const y = -heartSize;


    element.style.left =
        `${x}px`;

    element.style.top =
        `${y}px`;


    gameField.appendChild(
        element
    );


    hearts.push({

        element: element,

        x: x,

        y: y,

        size: heartSize,

        broken: isBroken

    });

}


/* =========================================
   UPDATE HEARTS
========================================= */

function updateHearts(deltaTime) {

    const fieldHeight =
        gameField.clientHeight;


    /*
        Go backwards so hearts
        can safely be removed.
    */

    for (
        let i = hearts.length - 1;
        i >= 0;
        i--
    ) {

        const heart =
            hearts[i];


        /*
            Move heart down.
        */

        heart.y +=
            fallSpeed *
            speedMultiplier *
            deltaTime;


        heart.element.style.top =
            `${heart.y}px`;


        /*
            Check collision first.
        */

        if (
            checkCollision(
                heart
            )
        ) {

            /*
                Broken heart = instant loss.
            */

            if (heart.broken) {

                createBrokenEffect(
                    heart
                );

                removeHeart(i);

                endGame(
                    "broken"
                );

                return;

            }


            /*
                Normal heart = score.
            */

            catchHeart(
                heart
            );

            removeHeart(i);

            continue;

        }


        /* =================================
           MISSED HEART DETECTION
        ================================= */

        /*
            THIS IS THE IMPORTANT PART.

            The heart is considered missed
            when its BOTTOM reaches the
            bottom of the playable field.

            We do NOT wait for it to travel
            outside the field.
        */

        const heartBottom =
            heart.y +
            heart.size;


        if (
            heartBottom >=
            fieldHeight
        ) {

            /*
                Only normal hearts count
                toward the 5-heart limit.
            */

            if (!heart.broken) {

                missed++;

                updateMissedDisplay();


                /*
                    FIVE MISSED HEARTS
                    = GAME OVER
                */

                if (
                    missed >=
                    MAX_MISSED
                ) {

                    removeHeart(i);

                    endGame(
                        "missed"
                    );

                    return;

                }

            }


            /*
                Remove the heart after
                it reaches the bottom.
            */

            removeHeart(i);

        }

    }

}


/* =========================================
   COLLISION DETECTION
========================================= */

function checkCollision(heart) {

    const playerRect =
        player.getBoundingClientRect();

    const heartRect =
        heart.element.getBoundingClientRect();


    /*
        Slight padding makes
        collisions feel fairer.
    */

    const padding = 8;


    return !(
        heartRect.right - padding <
        playerRect.left + padding

        ||

        heartRect.left + padding >
        playerRect.right - padding

        ||

        heartRect.bottom - padding <
        playerRect.top + padding

        ||

        heartRect.top + padding >
        playerRect.bottom - padding
    );

}


/* =========================================
   CATCH HEART
========================================= */

function catchHeart(heart) {

    score++;


    /*
        Increase difficulty.

        Every caught heart makes
        everything slightly faster.
    */

    speedMultiplier =
        Math.min(
            MAX_SPEED_MULTIPLIER,
            1 +
            score * 0.07
        );


    /*
        Hearts also spawn faster.
    */

    spawnInterval =
        Math.max(
            MIN_SPAWN_INTERVAL,
            700 -
            score * 14
        );


    /*
        Update display.
    */

    scoreDisplay.textContent =
        score;


    speedDisplay.textContent =
        `${speedMultiplier.toFixed(1)}x`;


    /*
        Show +1 effect.
    */

    createCatchEffect(
        heart
    );

}


/* =========================================
   MISSED DISPLAY
========================================= */

function updateMissedDisplay() {

    missedDisplay.textContent =
        `${missed}/${MAX_MISSED}`;


    /*
        Add a little visual feedback.
    */

    missedDisplay.classList.remove(
        "missed-warning"
    );


    /*
        Force animation to restart.
    */

    void missedDisplay.offsetWidth;


    missedDisplay.classList.add(
        "missed-warning"
    );

}


/* =========================================
   REMOVE HEART
========================================= */

function removeHeart(index) {

    const heart =
        hearts[index];


    if (
        heart &&
        heart.element
    ) {

        heart.element.remove();

    }


    hearts.splice(
        index,
        1
    );

}


/* =========================================
   CATCH EFFECT
========================================= */

function createCatchEffect(heart) {

    const effect =
        document.createElement("div");


    effect.className =
        "catch-effect";


    effect.textContent =
        "+1 ♡";


    effect.style.left =
        `${heart.x}px`;


    effect.style.top =
        `${heart.y}px`;


    gameField.appendChild(
        effect
    );


    setTimeout(
        function() {

            effect.remove();

        },
        700
    );

}


/* =========================================
   BROKEN HEART EFFECT
========================================= */

function createBrokenEffect(heart) {

    const effect =
        document.createElement("div");


    effect.className =
        "hit-effect";


    effect.textContent =
        "💔";


    effect.style.left =
        `${heart.x}px`;


    effect.style.top =
        `${heart.y}px`;


    gameField.appendChild(
        effect
    );


    setTimeout(
        function() {

            effect.remove();

        },
        600
    );

}


/* =========================================
   GAME OVER
========================================= */

function endGame(reason) {

    gameRunning = false;


    /*
        Stop animation.
    */

    if (
        animationFrame !== null
    ) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;

    }


    /*
        Remove every remaining heart.
    */

    hearts.forEach(function(heart) {

        if (heart.element) {

            heart.element.remove();

        }

    });


    hearts = [];


    /*
        Show final statistics.
    */

    finalScore.textContent =
        score;

    finalMissed.textContent =
        missed;


    /*
        Different messages
        depending on how they lost.
    */

    if (
        reason === "missed"
    ) {

        gameMessage.textContent =
            "You missed too many hearts! 😭💗";

    }


    if (
        reason === "broken"
    ) {

        gameMessage.textContent =
            "You touched a broken heart! 💔";

    }


    /*
        Better messages for
        higher scores.
    */

    if (score >= 35) {

        if (
            reason === "missed"
        ) {

            gameMessage.textContent =
                "YOU CAUGHT SO MANY HEARTS!! 😭💗";

        } else {

            gameMessage.textContent =
                "You got SO far and hit a broken heart 😭💔";

        }

    }

    else if (score >= 20) {

        if (
            reason === "missed"
        ) {

            gameMessage.textContent =
                "Okayyy you were actually really good 💗";

        } else {

            gameMessage.textContent =
                "You were doing SO good 😭💔";

        }

    }

    else if (score >= 10) {

        if (
            reason === "missed"
        ) {

            gameMessage.textContent =
                "Not bad at all hehe ♡";

        } else {

            gameMessage.textContent =
                "You were doing pretty good! 💔";

        }

    }


    /*
        Show game-over screen.
    */

    gameOverScreen.classList.remove(
        "hidden"
    );

}


/* =========================================
   KEYBOARD CONTROLS
========================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            movementLeft = true;

            event.preventDefault();

        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            movementRight = true;

            event.preventDefault();

        }

    }
);


document.addEventListener(
    "keyup",
    function(event) {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            movementLeft = false;

        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            movementRight = false;

        }

    }
);


/* =========================================
   MOBILE LEFT BUTTON
========================================= */

if (leftButton) {

    leftButton.addEventListener(
        "pointerdown",
        function(event) {

            event.preventDefault();

            movementLeft = true;

        }
    );


    leftButton.addEventListener(
        "pointerup",
        function(event) {

            event.preventDefault();

            movementLeft = false;

        }
    );


    leftButton.addEventListener(
        "pointercancel",
        function() {

            movementLeft = false;

        }
    );


    leftButton.addEventListener(
        "pointerleave",
        function() {

            movementLeft = false;

        }
    );

}


/* =========================================
   MOBILE RIGHT BUTTON
========================================= */

if (rightButton) {

    rightButton.addEventListener(
        "pointerdown",
        function(event) {

            event.preventDefault();

            movementRight = true;

        }
    );


    rightButton.addEventListener(
        "pointerup",
        function(event) {

            event.preventDefault();

            movementRight = false;

        }
    );


    rightButton.addEventListener(
        "pointercancel",
        function() {

            movementRight = false;

        }
    );


    rightButton.addEventListener(
        "pointerleave",
        function() {

            movementRight = false;

        }
    );

}


/* =========================================
   START BUTTON
========================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        function() {

            startGame();

        }
    );

}


/* =========================================
   RESTART BUTTON
========================================= */

if (restartButton) {

    restartButton.addEventListener(
        "click",
        function() {

            startGame();

        }
    );

}


/* =========================================
   WINDOW RESIZE
========================================= */

window.addEventListener(
    "resize",
    function() {

        if (!gameField) {

            return;

        }


        const playerWidth =
            player.offsetWidth;


        const minimumX =
            playerWidth / 2;


        const maximumX =
            gameField.clientWidth -
            playerWidth / 2;


        playerX =
            Math.max(
                minimumX,
                Math.min(
                    maximumX,
                    playerX
                )
            );


        player.style.left =
            `${playerX}px`;

    }
);


/* =========================================
   INITIALIZE
========================================= */

if (player) {

    player.src =
        PLAYER_IMAGE;

}


if (gameField && player) {

    resetPlayer();

}
