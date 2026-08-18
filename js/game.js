/* =========================================
   CATCH THE HEARTS
========================================= */


const gameField =
    document.getElementById("gameField");

const player =
    document.getElementById("player");

const scoreDisplay =
    document.getElementById("score");

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

let playerX = 0;

let hearts = [];

let lastTime = 0;

let spawnTimer = 0;

let animationFrame = null;

let movementLeft = false;

let movementRight = false;


/*
   Starting falling speed.

   This is deliberately not too fast.
*/

let fallSpeed = 150;


/*
   Every caught heart increases
   this multiplier.

   The game therefore gets
   progressively harder.
*/

let speedMultiplier = 1;


/*
   Starts with a heart roughly
   every 850ms.
*/

let spawnInterval = 850;


/*
   Minimum interval.

   Eventually the hearts get
   REALLY fast.
*/

const MIN_SPAWN_INTERVAL = 230;


/*
   Maximum falling speed.

   This prevents the game from
   becoming literally impossible.
*/

const MAX_SPEED_MULTIPLIER = 4.5;


/*
   Player movement speed.
*/

const PLAYER_SPEED = 390;


/* =========================================
   INITIAL PLAYER POSITION
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

    /*
       Stop any previous animation.
    */

    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

    }


    /*
       Remove any old hearts.
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

    fallSpeed = 150;

    speedMultiplier = 1;

    spawnInterval = 850;

    spawnTimer = 0;

    lastTime = performance.now();

    gameRunning = true;


    /*
       Reset UI.
    */

    scoreDisplay.textContent = "0";

    speedDisplay.textContent = "1x";


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
       Start the game loop.
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


    /*
       Calculate elapsed time.
    */

    const deltaTime =
        Math.min(
            (timestamp - lastTime) / 1000,
            0.05
        );


    lastTime = timestamp;


    /*
       Update player.
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
       Update falling hearts.
    */

    updateHearts(
        deltaTime
    );


    /*
       Continue.
    */

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


    /*
       Keep player inside game.
    */

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
       Mostly good hearts.

       Broken hearts are less common,
       but become increasingly dangerous.
    */

    const brokenChance =
        Math.min(
            0.28,
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


    /*
       Random horizontal position.
    */

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
           Move heart downward.
        */

        heart.y +=
            fallSpeed *
            speedMultiplier *
            deltaTime;


        heart.element.style.top =
            `${heart.y}px`;


        /*
           Check collision.
        */

        if (
            checkCollision(
                heart
            )
        ) {

            if (heart.broken) {

                /*
                   Broken heart = LOSS.
                */

                createHitEffect(
                    heart
                );

                endGame();

                return;

            } else {

                /*
                   Good heart = SCORE.
                */

                catchHeart(
                    heart
                );

                removeHeart(i);

                continue;

            }

        }


        /*
           Remove hearts that fall
           below the screen.
        */

        if (
            heart.y >
            fieldHeight + 70
        ) {

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


    /*
       Small collision padding makes
       the game feel fairer.
    */

    const padding = 9;


    return !(
        heartRect.right - padding <
        playerRect.left +

        padding

        ||

        heartRect.left + padding >
        playerRect.right -

        padding

        ||

        heartRect.bottom - padding <
        playerRect.top +

        padding

        ||

        heartRect.top + padding >
        playerRect.bottom -

        padding
    );

}


/* =========================================
   CATCH HEART
========================================= */

function catchHeart(heart) {

    score++;


    /*
       Increase difficulty.

       Every heart caught makes the
       game a little faster.
    */

    speedMultiplier =
        Math.min(
            MAX_SPEED_MULTIPLIER,
            1 +
            score * 0.055
        );


    /*
       Spawn hearts more quickly too.
    */

    spawnInterval =
        Math.max(
            MIN_SPAWN_INTERVAL,
            850 -
            score * 12
        );


    /*
       Update UI.
    */

    scoreDisplay.textContent =
        score;


    speedDisplay.textContent =
        `${speedMultiplier.toFixed(1)}x`;


    /*
       Cute "+1" animation.
    */

    createCatchEffect(
        heart
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

function endGame() {

    gameRunning = false;


    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;

    }


    /*
       Remove remaining hearts.
    */

    hearts.forEach(function(heart) {

        if (heart.element) {

            heart.element.remove();

        }

    });


    hearts = [];


    /*
       Show final score.
    */

    finalScore.textContent =
        score;


    /*
       Personalized score message.
    */

    if (score < 5) {

        gameMessage.textContent =
            "Awww, you got a little unlucky ♡";

    }

    else if (score < 10) {

        gameMessage.textContent =
            "Not bad at all hehe ♡";

    }

    else if (score < 20) {

        gameMessage.textContent =
            "Okayyy you're actually good at this 😭";

    }

    else if (score < 35) {

        gameMessage.textContent =
            "OKAY SHOW OFF 🙄💗";

    }

    else {

        gameMessage.textContent =
            "HOW ARE YOU THIS GOOD 😭💗";

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
   MOBILE CONTROLS
========================================= */

function holdLeft() {

    movementLeft = true;

}


function releaseLeft() {

    movementLeft = false;

}


function holdRight() {

    movementRight = true;

}


function releaseRight() {

    movementRight = false;

}


/*
   LEFT BUTTON
*/

leftButton.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();

        holdLeft();

    }
);


leftButton.addEventListener(
    "pointerup",
    function(event) {

        event.preventDefault();

        releaseLeft();

    }
);


leftButton.addEventListener(
    "pointercancel",
    releaseLeft
);


leftButton.addEventListener(
    "pointerleave",
    releaseLeft
);


/*
   RIGHT BUTTON
*/

rightButton.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();

        holdRight();

    }
);


rightButton.addEventListener(
    "pointerup",
    function(event) {

        event.preventDefault();

        releaseRight();

    }
);


rightButton.addEventListener(
    "pointercancel",
    releaseRight
);


rightButton.addEventListener(
    "pointerleave",
    releaseRight
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

        if (!gameRunning) {

            resetPlayer();

            return;

        }


        /*
           Keep player inside the
           resized game field.
        */

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
