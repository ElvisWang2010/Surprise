/* =========================================
   OPEN GIFT
========================================= */

function openGift() {

    const gift = document.getElementById("gift");

    if (!gift) {
        console.error("Could not find the #gift section.");
        return;
    }

    gift.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   LITTLE HEART EFFECT
========================================= */

document.addEventListener("click", function(event) {

    // Don't create hearts when clicking buttons or links
    if (
        event.target.closest("button") ||
        event.target.closest("a")
    ) {
        return;
    }

    createHeart(
        event.clientX,
        event.clientY
    );

});


function createHeart(x, y) {

    const heart = document.createElement("div");

    heart.innerHTML = "♥";

    heart.style.position = "fixed";

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    heart.style.pointerEvents = "none";

    heart.style.zIndex = "9999";

    heart.style.color = "#ef6593";

    heart.style.fontSize = "18px";

    heart.style.transition =
        "transform 1s ease, opacity 1s ease";

    document.body.appendChild(heart);


    // Animate upward
    setTimeout(function() {

        heart.style.transform =
            "translateY(-80px) scale(1.5)";

        heart.style.opacity = "0";

    }, 50);


    // Remove after animation
    setTimeout(function() {

        heart.remove();

    }, 1100);

}


/* =========================================
   REASONS
========================================= */

function openReason(card) {

    if (!card) return;

    card.classList.toggle("flipped");

}


/* =========================================
   OPEN ALL REASONS
========================================= */

function openAllReasons() {

    const cards =
        document.querySelectorAll(".reason-card");

    cards.forEach(function(card) {

        card.classList.add("flipped");

    });

}


/* =========================================
   LETTERS
========================================= */

function openLetter(button) {

    if (!button) return;

    const wrapper =
        button.closest(".letter-wrapper");

    if (!wrapper) return;

    wrapper.classList.add("opened");

}


/* =========================================
   CLOSE LETTER
========================================= */

function closeLetter(button) {

    if (!button) return;

    const wrapper =
        button.closest(".letter-wrapper");

    if (!wrapper) return;

    wrapper.classList.remove("opened");

}
