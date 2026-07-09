let currentIndex = 0;
let isAnimating = false;

function render(fact) {
  document.getElementById("chalk-category").textContent = fact.field;
  document.getElementById("chalk-name").textContent     = fact.name;
  document.getElementById("chalk-lifespan").textContent = fact.lifespan;
  document.getElementById("chalk-fact").textContent     = fact.fact;
  const quoteEl = document.getElementById("chalk-quote");
  quoteEl.textContent   = fact.quote ? `"${fact.quote}"` : "";
  quoteEl.style.display = fact.quote ? "block" : "none";
}

function navigate(direction) {
  if (isAnimating) return;
  isAnimating = true;
  const content = document.getElementById("chalk-content");
  content.classList.add("fading");
  setTimeout(() => {
    currentIndex = (currentIndex + direction + STEM_FACTS.length) % STEM_FACTS.length;
    render(STEM_FACTS[currentIndex]);
    content.classList.remove("fading");
    isAnimating = false;
  }, 250);
}

function showPreviousFact() {
  navigate(-1);
}

function showNextFact() {
  navigate(1);
}

// Attach listeners and render first fact
render(STEM_FACTS[0]);
document.getElementById("btn-prev").addEventListener("click", showPreviousFact);
document.getElementById("btn-next").addEventListener("click", showNextFact);
