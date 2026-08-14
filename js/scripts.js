/* =========================================
   OPEN GIFT
========================================= */

function openGift() {

    const gift = document.getElementById("gift");

    gift.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================
   LITTLE HEART EFFECT
========================================= */

document.addEventListener("click", function(event) {

    // Don't trigger on cards/buttons
    if (
        event.target.closest("button") ||
        event.target.closest("a")
    ) {
        return;
    }

    createHeart(event.clientX, event.clientY);

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

    heart.style.transition = "all 1s ease";

    document.body.appendChild(heart);


    setTimeout(() => {

        heart.style.transform =
            "translateY(-80px) scale(1.5)";

        heart.style.opacity = "0";

    }, 50);


    setTimeout(() => {

        heart.remove();

    }, 1100);

}
