/**
 * STEMinism Aura - Core Application Controller
 * Handles particle canvas simulation, card transitions, and fact cycling.
 */

document.addEventListener("DOMContentLoaded", () => {

  // --- PARTICLE BACKGROUND ---
  const canvas = document.getElementById("particle-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let mouse = { x: null, y: null, active: false };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 2 + 1;
      const colors = [
        "rgba(0, 240, 255, 0.35)",
        "rgba(255, 0, 127, 0.25)",
        "rgba(157, 78, 221, 0.3)",
        "rgba(255, 255, 255, 0.2)"
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
      if (mouse.active && mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const force = (130 - dist) / 130;
          this.x -= (dx / dist) * force * 1.6;
          this.y -= (dy / dist) * force * 1.6;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 90);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 95) {
          const opacity = ((95 - dist) / 95) * 0.12;
          ctx.strokeStyle = `rgba(162, 145, 255, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  window.addEventListener("mouseleave", () => { mouse.active = false; });
  resizeCanvas();
  animateParticles();


  // --- APP STATE ---
  let currentFactIndex = 0;

  const FIELD_SVGS = {
    "code": `<svg viewBox="0 0 100 100"><path d="M25 35 L10 50 L25 65 M75 35 L90 50 L75 65 M60 20 L40 80" stroke="#00f0ff" stroke-width="2" /><text x="32" y="32" font-family="monospace" font-size="5" fill="rgba(0, 240, 255, 0.4)">10101</text><text x="45" y="47" font-family="monospace" font-size="5" fill="rgba(255, 0, 127, 0.4)">011</text><text x="35" y="62" font-family="monospace" font-size="5" fill="rgba(0, 240, 255, 0.4)">11001</text></svg>`,
    "atom": `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="6" fill="#ff007f" /><ellipse cx="50" cy="50" rx="38" ry="12" transform="rotate(30, 50, 50)" stroke="#ff007f" stroke-width="1.5" fill="none" /><ellipse cx="50" cy="50" rx="38" ry="12" transform="rotate(90, 50, 50)" stroke="#00f0ff" stroke-width="1.5" fill="none" /><ellipse cx="50" cy="50" rx="38" ry="12" transform="rotate(150, 50, 50)" stroke="#9d4edd" stroke-width="1.5" fill="none" /><circle cx="78" cy="34" r="3" fill="#00f0ff" /><circle cx="20" cy="33" r="3" fill="#ff007f" /><circle cx="50" cy="88" r="3" fill="#9d4edd" /></svg>`,
    "dna": `<svg viewBox="0 0 100 100"><path d="M35 10 Q45 25, 50 50 T65 90" stroke="#39ff14" stroke-width="2" fill="none" /><path d="M65 10 Q55 25, 50 50 T35 90" stroke="#00f0ff" stroke-width="2" fill="none" /><line x1="41" y1="20" x2="59" y2="20" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" /><line x1="47" y1="35" x2="53" y2="35" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" /><line x1="47" y1="65" x2="53" y2="65" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" /><line x1="41" y1="80" x2="59" y2="80" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" /><circle cx="35" cy="10" r="3.5" fill="#39ff14" /><circle cx="65" cy="10" r="3.5" fill="#00f0ff" /><circle cx="65" cy="90" r="3.5" fill="#39ff14" /><circle cx="35" cy="90" r="3.5" fill="#00f0ff" /></svg>`,
    "math": `<svg viewBox="0 0 100 100"><path d="M15 50 L85 50 M50 15 L50 85" stroke="rgba(255,255,255,0.2)" stroke-dasharray="3 3" /><path d="M15 65 Q35 15, 50 50 T85 35" stroke="#9d4edd" stroke-width="2.5" fill="none" /><circle cx="50" cy="50" r="3" fill="#00f0ff" /><text x="65" y="28" font-family="Georgia, serif" font-size="12" fill="rgba(157, 78, 221, 0.7)">y=f(x)</text><path d="M22 22 L32 22 M27 17 L27 27 M68 73 L78 73" stroke="#ff007f" stroke-width="2" /></svg>`,
    "rocket": `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="16" fill="rgba(255, 170, 0, 0.15)" /><ellipse cx="50" cy="50" rx="42" ry="10" transform="rotate(-20, 50, 50)" stroke="#ffaa00" stroke-width="1.8" fill="none" /><circle cx="80" cy="22" r="3.5" fill="#ffffff" /><circle cx="22" cy="74" r="2" fill="rgba(255,255,255,0.5)" /><path d="M50 20 L58 45 L50 40 L42 45 Z" fill="#ffaa00" transform="rotate(40, 50, 32)" /><circle cx="75" cy="55" r="1" fill="#ffffff" /><circle cx="10" cy="30" r="1" fill="#ffffff" /></svg>`
  };

  const iconToClass = { code: "computer-science", atom: "physics", dna: "biology", math: "mathematics", rocket: "space", beaker: "chemistry" };


  // --- DOM REFS ---
  const factCard             = document.getElementById("fact-card");
  const nextFactBtn          = document.getElementById("next-fact-btn");
  const cardCategory         = document.getElementById("card-category");
  const cardCategoryIcon     = document.getElementById("card-category-icon");
  const cardCategoryText     = document.getElementById("card-category-text");
  const cardLifespan         = document.getElementById("card-lifespan");
  const cardName             = document.getElementById("card-name");
  const cardBio              = document.getElementById("card-bio");
  const cardFact             = document.getElementById("card-fact");
  const cardQuote            = document.getElementById("card-quote");
  const cardQuoteContainer   = document.getElementById("card-quote-container");
  const cardWikiLink         = document.getElementById("card-wiki-link");
  const illustrationContainer = document.getElementById("field-ill-container");


  // --- CARD UPDATE ---
  function updateCardDOM(factObj) {
    cardCategory.className = "category-badge";
    cardCategory.classList.add(iconToClass[factObj.fieldIcon] || "computer-science");
    cardCategoryText.textContent = factObj.field;
    cardCategoryIcon.querySelector("use").setAttribute("href", `#icon-${factObj.fieldIcon}`);
    cardLifespan.textContent = factObj.lifespan;
    cardName.textContent = factObj.name;
    cardBio.textContent = `Pioneer in the field of ${factObj.field}`;
    cardFact.textContent = factObj.fact;
    cardQuote.textContent = factObj.quote ? `"${factObj.quote}"` : "";
    cardQuoteContainer.style.display = factObj.quote ? "block" : "none";
    cardWikiLink.setAttribute("href", factObj.wikipedia);
    illustrationContainer.innerHTML = FIELD_SVGS[factObj.fieldIcon] || FIELD_SVGS["code"];
  }


  // --- TRANSITION ---
  let isAnimating = false;

  function showNextFact() {
    if (isAnimating) return;
    isAnimating = true;

    factCard.style.opacity = "0";
    factCard.style.transform = "translateY(10px) scale(0.98)";

    setTimeout(() => {
      currentFactIndex = (currentFactIndex + 1) % STEM_FACTS.length;
      updateCardDOM(STEM_FACTS[currentFactIndex]);
      factCard.style.opacity = "1";
      factCard.style.transform = "translateY(0) scale(1)";
      isAnimating = false;
    }, 300);
  }


  // --- INIT ---
  updateCardDOM(STEM_FACTS[0]);
  nextFactBtn.addEventListener("click", showNextFact);

});
