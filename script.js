async function saveToGoogleSheet(name, question, answer) {
  const url = "https://script.google.com/macros/s/AKfycbxlFnYXjPIsbIzFEhrF8ahS0BADKecpvck8bSz1ISamfA2NxKxvGc0j_DIzzDgwcHSTpw/exec";

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        name: name,
        question: question,
        answer: answer
      })
    });

    console.log("Saved to Google Sheet");
  } catch (err) {
    console.error("Error:", err);
  }
}/* =========================================================
   BIRTHDAY EXPERIENCE — SCRIPT.JS
   Organized as small independent modules. Search the
   "SECTION:" comments to jump around.
========================================================= */

/* ---------------------------------------------------------
   CONFIG — edit these to customize the experience
--------------------------------------------------------- */
const CONFIG = {
  birthdayPersonName: "JOSHWA",          // shown in the landing title
  photoCount: 3,                       // how many gallery photos to generate
  // Replace with your own image at assets/image/photo1.jpeg ... etc.
  // Falls back to elegant placeholder photography if those files are missing.
  useLocalImages: true,
  photoFiles: [
    "assets/images/photo1.jpeg",
    "assets/images/photo2.jpeg",
    "assets/images/photo3.jpeg"
  ],
  questions: [
    "What was your happiest memory with me? ❤️",
    "Which photo made you smile the most?",
    "If today could last forever, would you keep this moment?",
    "What is one word that describes our friendship?",
    "Which memory should we create next?",
    "What makes this birthday special?",
    "What would you like to tell me today?",
    "What is your favorite picture on this page?",
    "What made you laugh the hardest?",
    "Will you always remember today?"
  ],
  finalMessage: "No matter where life takes us, this memory will always remain in my heart. Happy Birthday! ❤️"
};

/* ---------------------------------------------------------
   SECTION: Utility helpers
--------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const rand = (min, max) => Math.random() * (max - min) + min;

function photoUrl(index) {
  if (CONFIG.useLocalImages) return `assets/images/photo${index + 1}.jpeg`;
  
  // Deterministic elegant placeholder photography (loads from the visitor's browser).
  return `https://picsum.photos/seed/birthday-memory-${index}/700/560`;
}

/* ---------------------------------------------------------
   SECTION: Loading screen
--------------------------------------------------------- */
window.addEventListener("load", () => {
  setTimeout(() => {
    $("#loadingScreen").classList.add("hidden");
    initTypewriters();
  }, 1400);
});

/* ---------------------------------------------------------
   SECTION: Custom cursor + mouse sparkle trail
--------------------------------------------------------- */
(function initCursor() {
  const cursor = $("#customCursor");
  if (!cursor || matchMedia("(hover: none)").matches) return;

  window.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
    maybeSparkle(e.clientX, e.clientY);
  });
  window.addEventListener("mousedown", () => cursor.classList.add("click"));
  window.addEventListener("mouseup", () => cursor.classList.remove("click"));

  let lastSparkle = 0;
  function maybeSparkle(x, y) {
    const now = performance.now();
    if (now - lastSparkle < 60) return; // throttle
    lastSparkle = now;
    const sparkle = document.createElement("div");
    sparkle.textContent = "✦";
    sparkle.style.cssText = `
      position:fixed; left:${x}px; top:${y}px; pointer-events:none; z-index:9998;
      color:#f4d58d; font-size:${rand(8,14)}px; transform:translate(-50%,-50%);
      animation: sparkleFade .7s ease-out forwards;
    `;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 700);
  }
  // inject sparkle keyframes once
  const style = document.createElement("style");
  style.textContent = `@keyframes sparkleFade{0%{opacity:1; transform:translate(-50%,-50%) scale(1) translateY(0);}100%{opacity:0; transform:translate(-50%,-50%) scale(.3) translateY(-18px);}}`;
  document.head.appendChild(style);
})();

/* ---------------------------------------------------------
   SECTION: Golden glowing particles (canvas)
--------------------------------------------------------- */
(function initParticles() {
  const canvas = $("#particleCanvas");
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function makeParticle() {
    return {
      x: rand(0, canvas.width),
      y: rand(0, canvas.height),
      r: rand(0.6, 2.4),
      speedY: rand(0.05, 0.25),
      speedX: rand(-0.15, 0.15),
      glow: rand(0.3, 1)
    };
  }
  const count = Math.min(110, Math.floor((innerWidth * innerHeight) / 12000));
  for (let i = 0; i < count; i++) particles.push(makeParticle());

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      ctx.beginPath();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      grad.addColorStop(0, `rgba(244,213,141,${p.glow})`);
      grad.addColorStop(1, "rgba(244,213,141,0)");
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();

      p.y -= p.speedY;
      p.x += p.speedX;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = rand(0, canvas.width); }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---------------------------------------------------------
   SECTION: Floating hearts / balloons / roses (ambient)
--------------------------------------------------------- */
function spawnAmbient(container, glyphs, count, durationRange, sizeRange) {
  const el = document.createElement("div");
  el.textContent = glyphs[Math.floor(rand(0, glyphs.length))];
  el.className = container.dataset.itemClass;
  el.style.left = rand(0, 100) + "vw";
  el.style.fontSize = rand(...sizeRange) + "px";
  el.style.setProperty("--drift", rand(-60, 60) + "px");
  el.style.animationDuration = rand(...durationRange) + "s";
  el.style.animationDelay = rand(0, 4) + "s";
  container.appendChild(el);
  setTimeout(() => el.remove(), (durationRange[1] + 4) * 1000);
}

(function initAmbientLoops() {
  const heartsWrap = $("#floatingHearts");
  heartsWrap.dataset.itemClass = "fh";
  const balloonsWrap = $("#floatingBalloons");
  balloonsWrap.dataset.itemClass = "fb";
  const rosesWrap = $("#floatingRoses");
  rosesWrap.dataset.itemClass = "fr";

  setInterval(() => spawnAmbient(heartsWrap, ["❤","💛","💫"], 1, [8, 14], [12, 26]), 900);
  setInterval(() => spawnAmbient(balloonsWrap, ["🎈"], 1, [14, 20], [24, 34]), 3500);
  setInterval(() => spawnAmbient(rosesWrap, ["🌹"], 1, [10, 16], [14, 20]), 2600);
})();

/* ---------------------------------------------------------
   SECTION: Typewriter effect (landing + final titles)
--------------------------------------------------------- */
function typeWriter(el, text, speed = 55) {
  return new Promise((resolve) => {
    let i = 0;
    el.textContent = "";
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else {
        resolve();
      }
    })();
  });
}

function initTypewriters() {
  const landingEl = $("#landingTitleText");
  typeWriter(landingEl, `🎉 Happy Birthday ${CONFIG.birthdayPersonName} 🎂`, 55).then(() => {
    $("#scrollCue").classList.add("show");
  });
}

/* ---------------------------------------------------------
   SECTION: Nav visibility + progress bar
--------------------------------------------------------- */
(function initNav() {
  const nav = $("#siteNav");
  const fill = $("#progressFill");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("visible", window.scrollY > window.innerHeight * 0.6);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    fill.style.width = scrollable > 0 ? `${(window.scrollY / scrollable) * 100}%` : "0%";
  });

  $("#navBurger").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
  $$("[data-nav]").forEach(a => a.addEventListener("click", () => $("#navLinks").classList.remove("open")));
})();

/* ---------------------------------------------------------
   SECTION: Dark / light mode toggle
--------------------------------------------------------- */
(function initThemeToggle() {
  const btn = $("#themeToggle");
  const icon = $("#themeIcon");
  btn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    icon.textContent = document.body.classList.contains("light-mode") ? "☀️" : "🌙";
  });
})();

/* ---------------------------------------------------------
   SECTION: Background music player
--------------------------------------------------------- */
(function initMusic() {
  const audio = $("#bgMusic");
  const player = $("#musicPlayer");
  const playPauseBtn = $("#playPauseBtn");
  const volumeSlider = $("#volumeSlider");
  const musicToggle = $("#musicToggle");

  audio.volume = 0.5;
  player.classList.add("paused");

  function play() {
    audio.play().then(() => {
      player.classList.remove("paused");
      playPauseBtn.textContent = "❚❚";
    }).catch(() => {
      // Autoplay blocked or file missing — stays paused silently.
    });
  }
  function pause() {
    audio.pause();
    player.classList.add("paused");
    playPauseBtn.textContent = "▶";
  }

  playPauseBtn.addEventListener("click", () => audio.paused ? play() : pause());
  musicToggle.addEventListener("click", (e) => {
    // tapping the round icon itself also toggles playback on touch devices
    if (e.target === musicToggle || musicToggle.contains(e.target)) {
      if (window.matchMedia("(hover: none)").matches) audio.paused ? play() : pause();
    }
  });
  volumeSlider.addEventListener("input", () => { audio.volume = parseFloat(volumeSlider.value); });

  // Try a gentle autoplay once the visitor begins the journey (most browsers allow after a click).
  document.addEventListener("journey:begin", play, { once: true });
})();

/* ---------------------------------------------------------
   SECTION: Landing screen — name capture
--------------------------------------------------------- */
(function initLanding() {
  const form = $("#nameForm");
  const welcomeMsg = $("#welcomeMsg");
  const journey = $("#journeyContent");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#nameInput").value.trim() || "Friend";
    localStorage.setItem("bday_visitorName", name);

    welcomeMsg.textContent = `Welcome, ${name} ❤️`;
    welcomeMsg.classList.add("show");

    document.dispatchEvent(new CustomEvent("journey:begin"));

    setTimeout(() => {
      journey.classList.add("show");
      $("#gallery").scrollIntoView({ behavior: "smooth" });
      initRevealObserver();
    }, 900);
  });
})();

/* ---------------------------------------------------------
   SECTION: Scroll reveal animations
--------------------------------------------------------- */
function initRevealObserver() {
  const items = $$(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(item => io.observe(item));
}

/* ---------------------------------------------------------
   SECTION: Photo gallery slideshow
--------------------------------------------------------- */
const galleryPhotos = Array.from({ length: CONFIG.photoCount }, (_, i) => ({
  src: photoUrl(i),
  caption: [
    "A moment worth keeping", "Pure joy", "Just us", "That perfect day",
    "Laughing about nothing", "Golden hour magic", "Best day ever",
    "Never forget this one", "So much love here", "A memory frozen in time"
  ][i % 10]
}));

let currentSlide = 0;
let slideTimer = null;

function buildSlideshow() {
  const track = $("#slideshowTrack");
  const dots = $("#slideDots");
  track.innerHTML = "";
  dots.innerHTML = "";

  galleryPhotos.forEach((photo, i) => {
    const slide = document.createElement("div");
    slide.className = "slide" + (i === 0 ? " active" : "");
    slide.innerHTML = `
      <div class="slide-frame">
        <img src="${photo.src}" alt="Memory ${i + 1}" loading="lazy" data-index="${i}">
        <span class="slide-caption">${photo.caption}</span>
      </div>`;
    track.appendChild(slide);

    const dot = document.createElement("span");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goToSlide(i));
    dots.appendChild(dot);
  });

  track.addEventListener("click", (e) => {
    const img = e.target.closest("img");
    if (img) openLightbox(parseInt(img.dataset.index, 10));
  });

  spawnSlideHearts();
  startSlideTimer();
}

function goToSlide(index) {
  const slides = $$(".slide");
  const dots = $$(".slide-dots span");
  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

function startSlideTimer() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => goToSlide(currentSlide + 1), 4200);
}

function spawnSlideHearts() {
  const wrap = $("#slideshowHearts");
  setInterval(() => {
    const h = document.createElement("span");
    h.className = "sh";
    h.textContent = "❤";
    h.style.left = rand(5, 95) + "%";
    h.style.animationDuration = rand(3.5, 6) + "s";
    wrap.appendChild(h);
    setTimeout(() => h.remove(), 6000);
  }, 1400);
}

$("#prevSlide").addEventListener("click", () => { goToSlide(currentSlide - 1); startSlideTimer(); });
$("#nextSlide").addEventListener("click", () => { goToSlide(currentSlide + 1); startSlideTimer(); });

/* ---------------------------------------------------------
   SECTION: Timeline mini-grids (reuses gallery photos)
--------------------------------------------------------- */
function buildTimelineGrids() {
  $$(".mini-grid").forEach(grid => {
    const [start, end] = grid.dataset.mini.split("-").map(Number);
    grid.innerHTML = "";
    galleryPhotos.slice(start, end).forEach((photo, i) => {
      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.caption;
      img.loading = "lazy";
      img.addEventListener("click", () => openLightbox(start + i));
      grid.appendChild(img);
    });
  });
}

/* ---------------------------------------------------------
   SECTION: Lightbox viewer
--------------------------------------------------------- */
let lightboxIndex = 0;
function openLightbox(index) {
  lightboxIndex = index;
  updateLightbox();
  $("#lightbox").classList.add("open");
}
function updateLightbox() {
  $("#lightboxImg").src = galleryPhotos[lightboxIndex].src;
}
$("#lightboxClose").addEventListener("click", () => $("#lightbox").classList.remove("open"));
$("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox") $("#lightbox").classList.remove("open"); });
$("#lightboxPrev").addEventListener("click", () => { lightboxIndex = (lightboxIndex - 1 + galleryPhotos.length) % galleryPhotos.length; updateLightbox(); });
$("#lightboxNext").addEventListener("click", () => { lightboxIndex = (lightboxIndex + 1) % galleryPhotos.length; updateLightbox(); });
document.addEventListener("keydown", (e) => {
  if (!$("#lightbox").classList.contains("open")) return;
  if (e.key === "Escape") $("#lightbox").classList.remove("open");
  if (e.key === "ArrowLeft") $("#lightboxPrev").click();
  if (e.key === "ArrowRight") $("#lightboxNext").click();
});

/* ---------------------------------------------------------
   SECTION: Heart-touching questions
--------------------------------------------------------- */
let qIndex = 0;
const answers = JSON.parse(localStorage.getItem("bday_answers") || "{}");

function renderQuestion() {
  $("#qCurrent").textContent = qIndex + 1;
  $("#qTotal").textContent = CONFIG.questions.length;
  $("#questionText").textContent = CONFIG.questions[qIndex];
  $("#questionInput").value = answers[qIndex] || "";

  const body = $("#questionBody");
  body.style.animation = "none";
  void body.offsetWidth; // restart animation
  body.style.animation = "";
}

function submitAnswer() {
  const val = $("#questionInput").value.trim();
  if (!val) {
    $("#questionInput").focus();
    return;
  }
  answers[qIndex] = val;
  localStorage.setItem("bday_answers", JSON.stringify(answers));
  const visitorName = localStorage.getItem("bday_visitorName") || "Friend";
  saveToGoogleSheet(
  visitorName,
  CONFIG.questions[qIndex],
  val
);
burstHeartsInCard($("#heartBurst"));

  setTimeout(() => {
    if (qIndex < CONFIG.questions.length - 1) {
      qIndex++;
      renderQuestion();
    } else {
      showMemoryWall();
    }
  }, 650);
}

$("#submitAnswerBtn").addEventListener("click", submitAnswer);
$("#questionInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAnswer(); }
});

function burstHeartsInCard(container) {
  for (let i = 0; i < 12; i++) {
    const h = document.createElement("span");
    h.textContent = "❤";
    h.style.cssText = `
      position:absolute; left:${rand(20,80)}%; bottom:10%;
      color:#c9184a; font-size:${rand(12,22)}px; opacity:.9;
      animation: heartBurstUp ${rand(1,1.8)}s ease-out forwards;
      animation-delay:${rand(0,.2)}s;
    `;
    container.appendChild(h);
    setTimeout(() => h.remove(), 2200);
  }
}
const burstStyle = document.createElement("style");
burstStyle.textContent = `@keyframes heartBurstUp{0%{transform:translateY(0) scale(.6); opacity:1;}100%{transform:translateY(-140px) scale(1.2); opacity:0;}}`;
document.head.appendChild(burstStyle);

function showMemoryWall() {
  $("#questions").classList.add("hidden");
  const wall = $("#memoryWall");
  wall.classList.remove("hidden");

  const name = localStorage.getItem("bday_visitorName") || "Friend";
  $("#memoryWallThanks").textContent = `Thank you, ${name} ❤️`;

  const answersWrap = $("#memoryAnswers");
  answersWrap.innerHTML = "";
  CONFIG.questions.forEach((q, i) => {
    if (!answers[i]) return;
    const item = document.createElement("div");
    item.className = "memory-answer-item";
    item.innerHTML = `<b>${q}</b>${answers[i]}`;
    answersWrap.appendChild(item);
  });

  launchConfettiBurst();
  wall.scrollIntoView({ behavior: "smooth" });
  initRevealObserver();
}

/* ---------------------------------------------------------
   SECTION: Surprise button — fireworks / confetti / cake
--------------------------------------------------------- */
$("#surpriseBtn").addEventListener("click", () => {
  $("#surpriseStage").classList.add("show");
  launchFireworks();
  launchConfettiBurst();
  setTimeout(() => {
    $("#surpriseMessage").textContent = CONFIG.finalMessage;
    $("#surpriseMessage").classList.add("show");
  }, 900);
  $("#surpriseStage").scrollIntoView({ behavior: "smooth", block: "center" });
});

/* ---------------------------------------------------------
   SECTION: Final screen — stars + typewriter + replay
--------------------------------------------------------- */
function buildFinalStars() {
  const wrap = $("#finalStars");
  wrap.innerHTML = "";
  for (let i = 0; i < 60; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = rand(0, 100) + "%";
    star.style.top = rand(0, 100) + "%";
    star.style.animationDelay = rand(0, 3) + "s";
    wrap.appendChild(star);
  }
}

const finalObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      typeWriter($("#finalTitleText"), "Thank You for Being Part of My Life ❤️", 45);
      finalObserver.disconnect();
    }
  });
}, { threshold: 0.4 });
finalObserver.observe($("#final"));

$("#replayBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------------------------------------------------------
   SECTION: Full-screen FX canvas — confetti + fireworks
--------------------------------------------------------- */
const fxCanvas = $("#fxCanvas");
const fxCtx = fxCanvas.getContext("2d");
function resizeFx() { fxCanvas.width = innerWidth; fxCanvas.height = innerHeight; }
resizeFx();
window.addEventListener("resize", resizeFx);

let fxParticles = [];
function launchConfettiBurst() {
  const colors = ["#c9184a", "#d9a94e", "#f4d58d", "#f5ece0"];
  for (let i = 0; i < 140; i++) {
    fxParticles.push({
      type: "confetti",
      x: rand(0, fxCanvas.width),
      y: -20,
      w: rand(6, 10),
      h: rand(8, 14),
      color: colors[Math.floor(rand(0, colors.length))],
      vy: rand(2, 5),
      vx: rand(-1.5, 1.5),
      rot: rand(0, 360),
      vr: rand(-8, 8),
      life: 220
    });
  }
  runFxLoop();
}

function launchFireworks() {
  let bursts = 0;
  const interval = setInterval(() => {
    spawnFirework(rand(fxCanvas.width * 0.2, fxCanvas.width * 0.8), rand(fxCanvas.height * 0.2, fxCanvas.height * 0.5));
    bursts++;
    if (bursts >= 5) clearInterval(interval);
  }, 380);
  runFxLoop();
}

function spawnFirework(x, y) {
  const colors = ["#c9184a", "#d9a94e", "#f4d58d", "#ffffff", "#ff6b81"];
  const color = colors[Math.floor(rand(0, colors.length))];
  const count = 46;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = rand(1.5, 4.5);
    fxParticles.push({
      type: "spark",
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      life: rand(50, 80),
      shape: Math.random() > 0.7 ? "heart" : "dot"
    });
  }
}

let fxRunning = false;
function runFxLoop() {
  if (fxRunning) return;
  fxRunning = true;
  (function frame() {
    fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    fxParticles = fxParticles.filter(p => p.life > 0);

    for (const p of fxParticles) {
      p.life--;
      if (p.type === "confetti") {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        fxCtx.save();
        fxCtx.translate(p.x, p.y);
        fxCtx.rotate((p.rot * Math.PI) / 180);
        fxCtx.fillStyle = p.color;
        fxCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        fxCtx.restore();
        if (p.y > fxCanvas.height + 20) p.life = 0;
      } else if (p.type === "spark") {
        p.x += p.vx; p.y += p.vy; p.vy += 0.03;
        fxCtx.globalAlpha = Math.max(p.life / 70, 0);
        fxCtx.fillStyle = p.color;
        if (p.shape === "heart") {
          drawHeart(fxCtx, p.x, p.y, 5);
        } else {
          fxCtx.beginPath();
          fxCtx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          fxCtx.fill();
        }
        fxCtx.globalAlpha = 1;
      }
    }

    if (fxParticles.length > 0) {
      requestAnimationFrame(frame);
    } else {
      fxRunning = false;
    }
  })();
}

function drawHeart(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, size / 4);
  ctx.bezierCurveTo(0, 0, -size, 0, -size, size / 3);
  ctx.bezierCurveTo(-size, size, 0, size * 1.3, 0, size * 1.6);
  ctx.bezierCurveTo(0, size * 1.3, size, size, size, size / 3);
  ctx.bezierCurveTo(size, 0, 0, 0, 0, size / 4);
  ctx.fill();
  ctx.restore();
}

/* ---------------------------------------------------------
   SECTION: Boot sequence
--------------------------------------------------------- */
function boot() {
  buildSlideshow();
  buildTimelineGrids();
  renderQuestion();
  buildFinalStars();
}
document.addEventListener("DOMContentLoaded", boot);
