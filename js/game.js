/* =========================================
   CATCH THE HEARTS
========================================= */

const gameField =
    document.getElementById("gameField");

const player =
    document.getElementById("player");

const scoreDisplay =
    document.getElementById("score");

const missedDisplay =
    document.getElementById("missed");

const speedDisplay =
    document.getElementById("speed");

const startScreen =
    document.getElementById("startScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const finalScore =
    document.getElementById("finalScore");

const finalMissed =
    document.getElementById("finalMissed");

const gameMessage =
    document.getElementById("gameMessage");

const leftButton =
    document.getElementById("leftButton");

const rightButton =
    document.getElementById("rightButton");


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

let playerX = 0;

let hearts = [];

let lastTime = 0;

let spawnTimer = 0;

let animationFrame = null;

let movementLeft = false;

let movementRight = false;


/*
    Hearts now start faster than before.
*/

let fallSpeed = 180;


/*
    Speed begins at 1x and increases
    every time you catch a heart.
*/

let speedMultiplier = 1;


/*
    Hearts also spawn faster.
*/

let spawnInterval = 760;


/*
    Minimum time between hearts.
*/

const MIN_SPAWN_INTERVAL = 190;


/*
    Maximum speed.
*/

const MAX_SPEED_MULTIPLIER = 5;


/*
    Player movement.
*/

const PLAYER_SPEED = 410;


/* =========================================
   INITIALIZE PLAYER
========================================= */

function resetPlayer() {

    playerX =
        gameField.clientWidth / 2;

    player.style.left =
        `${playerX}px`;

}


/* =========================================
   START GAME
========================================= */

function startGame() {

    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

    }


    /*
        Remove old hearts.
    */

    hearts.forEach(function(heart) {

        if (heart.element) {

            heart.element.remove();

        }

    });


    hearts = [];


    /*
        Reset game.
    */

    score = 0;

    missed = 0;

    fallSpeed = 180;

    speedMultiplier = 1;

    spawnInterval = 760;

    spawnTimer = 0;

    lastTime = performance.now();

    gameRunning = true;


    /*
        Reset display.
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


    resetPlayer();


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


    updatePlayer(
        deltaTime
    );


    spawnTimer +=
        deltaTime * 1000;


    if (
        spawnTimer >=
        spawnInterval
    ) {

        spawnTimer = 0;

        spawnHeart();

    }


    updateHearts(
        deltaTime
    );


    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================
   PLAYER
========================================= */

function updatePlayer(deltaTime) {

    const fieldWidth =
        gameField.clientWidth;

    const playerWidth =
        player.offsetWidth;


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


    const minX =
        playerWidth / 2;

    const maxX =
        fieldWidth -
        playerWidth / 2;


    playerX =
        Math.max(
            minX,
            Math.min(
                maxX,
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
        Broken hearts become slightly
        more common as the score rises.
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


    element.src =
        isBroken
            ? DEAD_HEART
            : ALIVE_HEART;


    element.className =
        "falling-heart";


    element.draggable = false;

    element.alt = "";


    const heartSize = 52;

    const maxX =
        gameField.clientWidth -
        heartSize;


    const x =
        Math.random() *
        Math.max(
            0,
            maxX
        );


    element.style.left =
        `${x}px`;

    element.style.top =
        "-65px";


    gameField.appendChild(
        element
    );


    hearts.push({

        element: element,

        x: x,

        y: -65,

        broken: isBroken,

        size: heartSize

    });

}


/* =========================================
   UPDATE HEARTS
========================================= */

function updateHearts(deltaTime) {

    const fieldHeight =
        gameField.clientHeight;


    for (
        let i = hearts.length - 1;
        i >= 0;
        i--
    ) {

        const heart =
            hearts[i];


        /*
            Move heart.
        */

        heart.y +=
            fallSpeed *
            speedMultiplier *
            deltaTime;


        heart.element.style.top =
            `${heart.y}px`;


        /*
            Collision.
        */

        if (
            checkCollision(
                heart
            )
        ) {

            if (heart.broken) {

                createHitEffect(
                    heart
                );

                endGame(
                    "broken"
                );

                return;

            }


            /*
                Good heart caught.
            */

            catchHeart(
                heart
            );

            removeHeart(i);

            continue;

        }


        /*
            Heart reached bottom.

            Only normal hearts count
            as a missed heart.

            Broken hearts can simply
            disappear if you don't hit them.
        */

        if (
            heart.y >
            fieldHeight + 70
        ) {

            if (!heart.broken) {

                missed++;

                updateMissed();

                /*
                    FIVE MISSED HEARTS = LOSS.
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


            removeHeart(i);

        }

    }

}


/* =========================================
   COLLISION
========================================= */

function checkCollision(heart) {

    const playerRect =
        player.getBoundingClientRect();

    const heartRect =
        heart.element.getBoundingClientRect();


    const padding = 9;


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
        Faster ramp-up.

        Before:
        0.055 per heart

        Now:
        0.07 per heart
    */

    speedMultiplier =
        Math.min(
            MAX_SPEED_MULTIPLIER,
            1 +
            score * 0.07
        );


    /*
        Spawn interval also decreases
        faster.
    */

    spawnInterval =
        Math.max(
            MIN_SPAWN_INTERVAL,
            760 -
            score * 14
        );


    scoreDisplay.textContent =
        score;


    speedDisplay.textContent =
        `${speedMultiplier.toFixed(1)}x`;


    createCatchEffect(
        heart
    );

}


/* =========================================
   MISSED DISPLAY
========================================= */

function updateMissed() {

    missedDisplay.textContent =
        `${missed}/${MAX_MISSED}`;

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
   HIT EFFECT
========================================= */

function createHitEffect(heart) {

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
   END GAME
========================================= */

function endGame(reason) {

    gameRunning = false;


    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;

    }


    hearts.forEach(function(heart) {

        if (heart.element) {

            heart.element.remove();

        }

    });


    hearts = [];


    finalScore.textContent =
        score;


    finalMissed.textContent =
        missed;


    /*
        Different message depending
        on how the player lost.
    */

    if (
        reason ===
        "broken"
    ) {

        gameMessage.textContent =
            "You touched a broken heart! 💔";

    }

    else {

        gameMessage.textContent =
            "You missed too many hearts! 😭";

    }


    /*
        Score-based message can
        override the basic message
        for very high scores.
    */

    if (score >= 35) {

        gameMessage.textContent =
            reason === "broken"
                ? "You got SO far and then hit a broken heart 😭💔"
                : "You caught SO many hearts!! 😭💗";

    }

    else if (score >= 20) {

        gameMessage.textContent =
            reason === "broken"
                ? "Okayyy you were doing SO good 😭💔"
                : "Okayyy you're actually really good at this 💗";

    }

    else if (score >= 10) {

        gameMessage.textContent =
            reason === "broken"
                ? "You were doing so well!! 😭💔"
                : "Not bad at all hehe ♡";

    }


    gameOverScreen.classList.remove(
        "hidden"
    );

}


/* =========================================
   KEYBOARD
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
   MOBILE CONTROLS
========================================= */

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


/* =========================================
   BUTTONS
========================================= */

startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    startGame
);


/* =========================================
   RESIZE
========================================= */

window.addEventListener(
    "resize",
    function() {

        const playerWidth =
            player.offsetWidth;


        const minX =
            playerWidth / 2;


        const maxX =
            gameField.clientWidth -
            playerWidth / 2;


        playerX =
            Math.max(
                minX,
                Math.min(
                    maxX,
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

player.src =
    PLAYER_IMAGE;


resetPlayer();
