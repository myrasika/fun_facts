document.addEventListener("DOMContentLoaded", () => {

  let currentIndex = 0;
  let isAnimating = false;

  const content      = document.getElementById("chalk-content");
  const categoryEl   = document.getElementById("chalk-category");
  const nameEl       = document.getElementById("chalk-name");
  const lifespanEl   = document.getElementById("chalk-lifespan");
  const factEl       = document.getElementById("chalk-fact");
  const quoteEl      = document.getElementById("chalk-quote");
  const nextBtn      = document.getElementById("next-fact-btn");

  function render(fact) {
    categoryEl.textContent = fact.field;
    nameEl.textContent     = fact.name;
    lifespanEl.textContent = fact.lifespan;
    factEl.textContent     = fact.fact;
    quoteEl.textContent    = fact.quote ? `"${fact.quote}"` : "";
    quoteEl.style.display  = fact.quote ? "block" : "none";
  }

  function showNext() {
    if (isAnimating) return;
    isAnimating = true;
    content.classList.add("fading");
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % STEM_FACTS.length;
      render(STEM_FACTS[currentIndex]);
      content.classList.remove("fading");
      isAnimating = false;
    }, 250);
  }

  render(STEM_FACTS[0]);
  nextBtn.addEventListener("click", showNext);
  document.getElementById("chalkboard").addEventListener("click", (e) => {
    if (!e.target.closest("#next-fact-btn")) showNext();
  });

});
