/**
 * STEMinism Aura - Core Application Controller
 * Handles particle canvas simulation, search/prompt matching, loading sequences, and GSAP card animations.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- PARTICLE BACKGROUND SIMULATION ---
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
      
      // Theme colors for particles: cyan, magenta/pink, purple, soft white
      const colors = [
        "rgba(0, 240, 255, 0.35)", // Cyan
        "rgba(255, 0, 127, 0.25)", // Pink
        "rgba(157, 78, 221, 0.3)",  // Purple
        "rgba(255, 255, 255, 0.2)"  // Soft white
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap-around edges
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      // Mouse interactive push
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
    // Adjust particle density based on screen size
    const particleDensity = 12000; 
    const count = Math.min(Math.floor((canvas.width * canvas.height) / particleDensity), 90);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // Connect nearby particles with glowing filaments
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

  // Set up listeners for canvas
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  // Initialize canvas
  resizeCanvas();
  animateParticles();


  // --- APP STATE & FACT MATCHING ENGINE ---
  let factHistory = []; // Keep track of the last 6 shown IDs to avoid immediate repetition
  const maxHistoryLength = 6;
  let currentFact = null;

  // Dynamically select a scan message matching the incoming scientific field
  function getScanMessage(field) {
    const defaultMessages = [
      "Accessing historical archive registers...",
      "Resolving temporal quantum wave functions...",
      "Decoding encrypted timeline records...",
      "Synchronizing chronal vectors..."
    ];
    
    if (!field) return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
    
    const lowerField = field.toLowerCase();
    if (lowerField.includes("computer") || lowerField.includes("software") || lowerField.includes("programming")) {
      return "Compiling historical source modules... Resolving pointer registers...";
    } else if (lowerField.includes("space") || lowerField.includes("astro")) {
      return "Calculating orbital trajectories... Establishing satellite uplink...";
    } else if (lowerField.includes("physics")) {
      return "Measuring attosecond waves... Disproving parity conservation...";
    } else if (lowerField.includes("chemistry") || lowerField.includes("pharm")) {
      return "Isolating active molecular chains... Extracting compounds...";
    } else if (lowerField.includes("genetics") || lowerField.includes("biology")) {
      return "Sequencing double helix structures... Mapping chromosome markers...";
    } else if (lowerField.includes("math")) {
      return "Integrating symmetric matrix coordinates... Solving magic numbers...";
    }
    
    return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
  }

  // Get dynamic field graphic SVGs
  const FIELD_SVGS = {
    "code": `
      <svg viewBox="0 0 100 100">
        <path d="M25 35 L10 50 L25 65 M75 35 L90 50 L75 65 M60 20 L40 80" stroke="#00f0ff" stroke-width="2" />
        <text x="32" y="32" font-family="monospace" font-size="5" fill="rgba(0, 240, 255, 0.4)">10101</text>
        <text x="45" y="47" font-family="monospace" font-size="5" fill="rgba(255, 0, 127, 0.4)">011</text>
        <text x="35" y="62" font-family="monospace" font-size="5" fill="rgba(0, 240, 255, 0.4)">11001</text>
      </svg>
    `,
    "atom": `
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="6" fill="#ff007f" />
        <ellipse cx="50" cy="50" rx="38" ry="12" transform="rotate(30, 50, 50)" stroke="#ff007f" stroke-width="1.5" />
        <ellipse cx="50" cy="50" rx="38" ry="12" transform="rotate(90, 50, 50)" stroke="#00f0ff" stroke-width="1.5" />
        <ellipse cx="50" cy="50" rx="38" ry="12" transform="rotate(150, 50, 50)" stroke="#9d4edd" stroke-width="1.5" />
        <circle cx="78" cy="34" r="3" fill="#00f0ff" />
        <circle cx="20" cy="33" r="3" fill="#ff007f" />
        <circle cx="50" cy="88" r="3" fill="#9d4edd" />
      </svg>
    `,
    "dna": `
      <svg viewBox="0 0 100 100">
        <!-- Helix structures -->
        <path d="M35 10 Q45 25, 50 50 T65 90" stroke="#39ff14" stroke-width="2" />
        <path d="M65 10 Q55 25, 50 50 T35 90" stroke="#00f0ff" stroke-width="2" />
        <!-- Horizontal base pairs -->
        <line x1="41" y1="20" x2="59" y2="20" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
        <line x1="47" y1="35" x2="53" y2="35" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
        <line x1="50" y1="50" x2="50" y2="50" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
        <line x1="47" y1="65" x2="53" y2="65" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
        <line x1="41" y1="80" x2="59" y2="80" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
        <!-- Nodes -->
        <circle cx="35" cy="10" r="3.5" fill="#39ff14" />
        <circle cx="65" cy="10" r="3.5" fill="#00f0ff" />
        <circle cx="65" cy="90" r="3.5" fill="#39ff14" />
        <circle cx="35" cy="90" r="3.5" fill="#00f0ff" />
      </svg>
    `,
    "math": `
      <svg viewBox="0 0 100 100">
        <path d="M15 50 L85 50 M50 15 L50 85" stroke="rgba(255,255,255,0.2)" stroke-dasharray="3 3" />
        <path d="M15 65 Q35 15, 50 50 T85 35" stroke="#9d4edd" stroke-width="2.5" fill="none" />
        <circle cx="50" cy="50" r="3" fill="#00f0ff" />
        <text x="65" y="28" font-family="Georgia, serif" font-size="12" fill="rgba(157, 78, 221, 0.7)">y=f(x)</text>
        <path d="M22 22 L32 22 M27 17 L27 27 M68 73 L78 73" stroke="#ff007f" stroke-width="2" />
      </svg>
    `,
    "rocket": `
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="16" fill="rgba(255, 170, 0, 0.15)" stroke="none" />
        <ellipse cx="50" cy="50" rx="42" ry="10" transform="rotate(-20, 50, 50)" stroke="#ffaa00" stroke-width="1.8" />
        <circle cx="80" cy="22" r="3.5" fill="#ffffff" />
        <circle cx="22" cy="74" r="2" fill="rgba(255,255,255,0.5)" />
        <path d="M50 20 L58 45 L50 40 L42 45 Z" fill="#ffaa00" transform="rotate(40, 50, 32)" />
        <circle cx="75" cy="55" r="1" fill="#ffffff" />
        <circle cx="10" cy="30" r="1" fill="#ffffff" />
      </svg>
    `
  };

  // Find fact by matching score or fall back to random
  function getFactByQuery(query) {
    const cleanQuery = query.trim().toLowerCase();
    
    // Check if query wants something random
    if (!cleanQuery || cleanQuery === "random" || cleanQuery === "surprise me!") {
      return getRandomFact();
    }
    
    const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 1);
    
    // Evaluate scores for each item
    const candidates = STEM_FACTS.map(item => {
      let score = 0;
      
      // 1. Exact Name match
      if (item.name.toLowerCase() === cleanQuery) {
        score += 150;
      } else if (item.name.toLowerCase().includes(cleanQuery)) {
        score += 80;
      }
      
      // 2. Exact Field match
      if (item.field.toLowerCase() === cleanQuery) {
        score += 90;
      } else if (item.field.toLowerCase().includes(cleanQuery)) {
        score += 50;
      }
      
      // 3. Word matches in details
      queryWords.forEach(word => {
        // Match tags (high priority word matches)
        if (item.tags.includes(word)) score += 35;
        
        // Match name segments
        if (item.name.toLowerCase().includes(word)) score += 20;
        
        // Match field segments
        if (item.field.toLowerCase().includes(word)) score += 15;
        
        // Match fact content
        if (item.fact.toLowerCase().includes(word)) score += 8;
        
        // Match quote content
        if (item.quote.toLowerCase().includes(word)) score += 8;
      });
      
      return { item, score };
    });
    
    // Sort candidates by score descending
    candidates.sort((a, b) => b.score - a.score);
    
    // Filter down to the high scoring ones
    const highestScore = candidates[0].score;
    
    if (highestScore > 0) {
      // Find all matches with the highest score (or within 85% of the highest score to make it random among close ties)
      const topMatches = candidates
        .filter(c => c.score >= highestScore * 0.85)
        .map(c => c.item);
        
      // Filter out facts currently in the recent history if possible
      const freshMatches = topMatches.filter(item => !factHistory.includes(item.id));
      const chosenMatch = freshMatches.length > 0 
        ? freshMatches[Math.floor(Math.random() * freshMatches.length)] 
        : topMatches[Math.floor(Math.random() * topMatches.length)];
        
      return { fact: chosenMatch, found: true };
    }
    
    // Fallback if no matching records found
    return { fact: getRandomFact(), found: false };
  }

  // Retrieve a random fact that avoids recent history
  function getRandomFact() {
    const availableFacts = STEM_FACTS.filter(item => !factHistory.includes(item.id));
    
    // If all facts have been shown, clear history to start fresh
    if (availableFacts.length === 0) {
      factHistory = [];
      return STEM_FACTS[Math.floor(Math.random() * STEM_FACTS.length)];
    }
    
    return availableFacts[Math.floor(Math.random() * availableFacts.length)];
  }

  // Update history buffer
  function pushToHistory(id) {
    factHistory.push(id);
    if (factHistory.length > maxHistoryLength) {
      factHistory.shift();
    }
  }


  // --- UI CONTROLLER & GSAP ANIMATIONS ---
  const searchForm = document.getElementById("search-form");
  const promptInput = document.getElementById("prompt-input");
  const scanScreen = document.getElementById("scan-screen");
  const scanDetails = document.getElementById("scan-details");
  
  const cardCategory = document.getElementById("card-category");
  const cardCategoryIcon = document.getElementById("card-category-icon");
  const cardCategoryText = document.getElementById("card-category-text");
  const cardLifespan = document.getElementById("card-lifespan");
  const cardName = document.getElementById("card-name");
  const cardBio = document.getElementById("card-bio");
  const cardFact = document.getElementById("card-fact");
  const cardQuote = document.getElementById("card-quote");
  const cardQuoteContainer = document.getElementById("card-quote-container");
  const cardWikiLink = document.getElementById("card-wiki-link");
  const illustrationContainer = document.getElementById("field-ill-container");
  const suggestedTags = document.getElementById("suggested-tags");

  // Render initial fact card
  currentFact = STEM_FACTS[0]; // Ada Lovelace
  pushToHistory(currentFact.id);
  updateCardDOM(currentFact);

  // Form submit handler
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = promptInput.value;
    triggerFactReveal(query);
  });

  // Suggestion pill click handler
  suggestedTags.addEventListener("click", (e) => {
    const pill = e.target.closest(".tag-pill");
    if (!pill) return;
    
    // Add visual active state
    document.querySelectorAll(".tag-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    
    const tag = pill.getAttribute("data-tag");
    
    // Put tag text in input field (unless it's 'random')
    if (tag === "random") {
      promptInput.value = "";
    } else if (tag === "quote") {
      promptInput.value = "Inspiring Quote";
    } else {
      promptInput.value = pill.textContent.replace(/[^\w\s&]/g, "").trim(); // Strips emojis
    }
    
    triggerFactReveal(tag);
  });

  // Handle core transition lifecycle
  function triggerFactReveal(query) {
    // 1. Fetch matching fact
    const matchResult = getFactByQuery(query);
    const matchedFact = matchResult.fact;
    
    // Save to history
    pushToHistory(matchedFact.id);
    currentFact = matchedFact;
    
    // Update loading screen details text
    scanDetails.textContent = getScanMessage(matchedFact.field);
    
    // If not found, append warning notice details
    if (!matchResult.found && query !== "random") {
      scanDetails.textContent = `Search mismatch for "${query}". Finding alternative vector...`;
    }

    // 2. Play GSAP out-transition / show loader
    const tl = gsap.timeline();
    
    // Bring up the loading screen
    tl.to(scanScreen, {
      opacity: 1,
      duration: 0.25,
      onStart: () => {
        scanScreen.classList.add("active");
      }
    });

    // Wait a brief moment to simulate scanning calculations, then swap content and reveal card
    tl.to({}, { duration: 0.95 }); // Hold state for effect
    
    tl.to(scanScreen, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        scanScreen.classList.remove("active");
        
        // Remove active state on pills once the fact loads
        document.querySelectorAll(".tag-pill").forEach(p => p.classList.remove("active"));
      }
    });
    
    // Simultaneously update DOM and trigger the 3D entry flip animation
    tl.add(() => {
      updateCardDOM(matchedFact, !matchResult.found && query !== "random" ? query : null);
      
      // Perform 3D Y-axis reveal spin on card
      gsap.fromTo("#fact-card", 
        { rotationY: 90, scale: 0.9, opacity: 0 },
        { rotationY: 0, scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
      
      // Stagger elements entering card
      gsap.fromTo("#card-category", 
        { opacity: 0, x: -15 }, 
        { opacity: 1, x: 0, duration: 0.4, ease: "power1.out" }
      );
      
      gsap.fromTo("#card-lifespan", 
        { opacity: 0, x: 15 }, 
        { opacity: 1, x: 0, duration: 0.4, ease: "power1.out" }
      );
      
      gsap.fromTo("#card-name", 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: "power2.out" }
      );
      
      gsap.fromTo("#card-bio", 
        { opacity: 0 }, 
        { opacity: 0.9, duration: 0.5, delay: 0.2 }
      );
      
      // Animate fact paragraph fading and rising
      gsap.fromTo("#card-fact", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.25, ease: "power2.out" }
      );
      
      // Animate quote typing out letter-by-letter with GSAP TextPlugin
      if (matchedFact.quote) {
        cardQuoteContainer.style.display = "block";
        gsap.fromTo("#card-quote",
          { text: "" },
          { text: `"${matchedFact.quote}"`, duration: 1.3, ease: "power1.out", delay: 0.4 }
        );
      } else {
        cardQuoteContainer.style.display = "none";
      }

      // Stagger the footer wiki button link
      gsap.fromTo("#card-wiki-link", 
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.6, ease: "power1.out" }
      );
      
      // Animate dynamic background vector illustration fading in
      gsap.fromTo(".field-illustration", 
        { opacity: 0, scale: 0.7 },
        { opacity: 0.08, scale: 1, duration: 0.7, delay: 0.3, ease: "back.out(1.5)" }
      );
    }, "-=0.35"); // Overlap with loader fading out
  }

  // Update card elements inside DOM
  function updateCardDOM(factObj, missingQuery = null) {
    // 1. Update Category Badge Theme Class and Icon
    cardCategory.className = "category-badge"; // Reset classes
    const cleanField = factObj.fieldIcon;
    cardCategory.classList.add(cleanField === "beaker" ? "chemistry" : cleanField);
    
    // Set category text
    cardCategoryText.textContent = factObj.field;
    
    // Change category SVG icon reference
    cardCategoryIcon.querySelector("use").setAttribute("href", `#icon-${factObj.fieldIcon}`);
    
    // 2. Lifespan
    cardLifespan.textContent = factObj.lifespan;
    
    // 3. Name & Bio
    cardName.textContent = factObj.name;
    cardBio.textContent = `Pioneer in the field of ${factObj.field}`;
    
    // 4. Fact text body
    const fieldPrefix = `Pioneering in the field of ${factObj.field}, `;
    const cleanFact = factObj.fact.charAt(0).toLowerCase() + factObj.fact.slice(1);
    const fullFactText = `${fieldPrefix}${cleanFact}`;

    if (missingQuery) {
      cardFact.innerHTML = `<strong style="color: var(--pink)">Not Found:</strong> I couldn't find a direct record matching "${missingQuery}". Displaying default database record:<br><br>${fullFactText}`;
    } else {
      cardFact.textContent = fullFactText;
    }
    
    // 5. Blockquote
    cardQuote.textContent = factObj.quote ? `"${factObj.quote}"` : "";
    cardQuoteContainer.style.display = factObj.quote ? "block" : "none";
    
    // 6. Wikipedia Link
    cardWikiLink.setAttribute("href", factObj.wikipedia);
    
    // 7. Background graphic illustration
    illustrationContainer.innerHTML = FIELD_SVGS[factObj.fieldIcon] || FIELD_SVGS["code"];
  }

  // Add keyframe animations or special interactive effects on title hover
  const titleGlow = document.getElementById("title-glow");
  titleGlow.addEventListener("mouseenter", () => {
    gsap.to(titleGlow, { textShadow: "0 0 30px rgba(0, 240, 255, 0.8)", duration: 0.3 });
  });
  titleGlow.addEventListener("mouseleave", () => {
    gsap.to(titleGlow, { textShadow: "none", duration: 0.3 });
  });
});
