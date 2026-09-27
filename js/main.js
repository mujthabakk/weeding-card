const WEDDING = new Date("2026-12-27T15:00:00+05:30");

const TRACKS = [
  {
    id: "romantic",
    title: "Romantic",
    artist: "Francisco Alvear",
    note: "Soft piano film score. Best under a church invitation.",
    src: "assets/music/romantic.mp3",
    recommended: true,
  },
  {
    id: "harp",
    title: "Wedding Harp",
    artist: "Francisco Alvear",
    note: "Quiet harp. Light and ceremonial.",
    src: "assets/music/harp.mp3",
  },
  {
    id: "wedding",
    title: "Wedding",
    artist: "Francisco Alvear",
    note: "Classic wedding theme, a little fuller.",
    src: "assets/music/wedding.mp3",
  },
];

const audio = document.getElementById("bgm");
const openBtn = document.getElementById("openBtn");
const musicBtn = document.getElementById("musicBtn");
const musicPanel = document.getElementById("musicPanel");
const trackList = document.getElementById("trackList");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCap = document.getElementById("lightboxCap");

let trackIndex = 0;
let playing = false;
let opened = false;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function pad(n) {
  return String(n).padStart(2, "0");
}

function tick() {
  const diff = WEDDING.getTime() - Date.now();
  const units = { cdD: 0, cdH: 0, cdM: 0, cdS: 0 };
  if (diff > 0) {
    units.cdD = Math.floor(diff / 86400000);
    units.cdH = Math.floor((diff % 86400000) / 3600000);
    units.cdM = Math.floor((diff % 3600000) / 60000);
    units.cdS = Math.floor((diff % 60000) / 1000);
  }
  Object.entries(units).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = pad(value);
  });
  const label = document.getElementById("countdownLabel");
  if (label && diff <= 0) label.textContent = "The day is here";
}

function renderTracks() {
  trackList.innerHTML = TRACKS.map((track, i) => {
    const current = i === trackIndex ? " is-current" : "";
    const badge = track.recommended ? '<span class="track-badge">Best fit</span>' : "";
    return `<button class="track${current}" type="button" data-index="${i}" aria-pressed="${i === trackIndex}">
      <span class="track-title">${track.title} ${badge}</span>
      <span class="track-note">${track.note}</span>
      <span class="track-by">${track.artist} · Mixkit</span>
    </button>`;
  }).join("");
}

function setTrack(index, autoplay) {
  trackIndex = index;
  const track = TRACKS[index];
  const nextSrc = new URL(track.src, window.location.href).href;
  if (audio.src !== nextSrc) {
    audio.src = track.src;
    audio.load();
  }
  renderTracks();
  document.getElementById("nowPlaying").textContent = track.title;
  if (autoplay) playMusic();
}

function fadeTo(target) {
  const start = audio.volume;
  const steps = 18;
  let i = 0;
  clearInterval(audio._fade);
  audio._fade = setInterval(() => {
    i += 1;
    audio.volume = start + ((target - start) * i) / steps;
    if (i >= steps) {
      audio.volume = target;
      clearInterval(audio._fade);
    }
  }, 40);
}

function playMusic() {
  audio.volume = 0;
  const attempt = audio.play();
  playing = true;
  musicBtn.classList.add("is-on");
  musicBtn.setAttribute("aria-pressed", "true");
  musicBtn.querySelector(".music-label").textContent = "Music on";
  if (attempt) {
    attempt
      .then(() => fadeTo(0.38))
      .catch(() => {
        playing = false;
        musicBtn.classList.remove("is-on");
        musicBtn.setAttribute("aria-pressed", "false");
        musicBtn.querySelector(".music-label").textContent = "Play music";
      });
  }
}

function pauseMusic() {
  fadeTo(0);
  setTimeout(() => audio.pause(), 500);
  playing = false;
  musicBtn.classList.remove("is-on");
  musicBtn.setAttribute("aria-pressed", "false");
  musicBtn.querySelector(".music-label").textContent = "Music off";
}

function openInvitation(autoplay = true) {
  if (opened) return;
  opened = true;
  document.body.classList.remove("is-locked");
  document.body.classList.add("is-open");
  openBtn.setAttribute("aria-expanded", "true");
  document.getElementById("site").hidden = false;
  document.getElementById("topnav").hidden = false;
  musicBtn.hidden = false;
  setTrack(0, autoplay);
  const landing = document.getElementById("landing");
  if (reduceMotion) {
    landing.hidden = true;
  } else {
    window.setTimeout(() => {
      landing.hidden = true;
    }, 900);
  }
  if (location.hash) {
    document.querySelector(location.hash)?.scrollIntoView();
  }
}

function galleryItems() {
  return [...document.querySelectorAll("[data-full]")];
}

function openLightbox(index) {
  const items = galleryItems();
  const item = items[index];
  if (!item) return;
  lightbox.dataset.index = String(index);
  lightboxImg.src = item.dataset.full;
  lightboxImg.alt = item.dataset.alt || "";
  lightboxCap.textContent = item.dataset.alt || "";
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
}

function stepLightbox(dir) {
  const items = galleryItems();
  const next = (Number(lightbox.dataset.index) + dir + items.length) % items.length;
  openLightbox(next);
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = "";
  document.body.classList.remove("lightbox-open");
}

function initParticles() {
  const canvas = document.getElementById("dust");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  const dots = Array.from({ length: 42 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.4 + 0.4,
    s: Math.random() * 0.00035 + 0.00012,
    a: Math.random() * 0.35 + 0.08,
  }));

  function resize() {
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
  }
  resize();
  window.addEventListener("resize", resize);

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach((dot) => {
      dot.y -= dot.s;
      if (dot.y < 0) dot.y = 1;
      ctx.beginPath();
      ctx.fillStyle = `rgba(212, 180, 131, ${dot.a})`;
      ctx.arc(dot.x * canvas.width, dot.y * canvas.height, dot.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
}

function initReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("is-in"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  nodes.forEach((node) => observer.observe(node));
}

function initNav() {
  const links = [...document.querySelectorAll(".topnav a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );
  sections.forEach((section) => observer.observe(section));
}

openBtn.addEventListener("click", openInvitation);

musicBtn.addEventListener("click", () => {
  musicPanel.hidden = !musicPanel.hidden;
  if (!opened) return;
  if (!playing) playMusic();
});

document.getElementById("musicToggle").addEventListener("click", () => {
  if (playing) pauseMusic();
  else playMusic();
});

trackList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-index]");
  if (!button) return;
  setTrack(Number(button.dataset.index), true);
});

document.getElementById("gallery").addEventListener("click", (event) => {
  const item = event.target.closest("[data-full]");
  if (!item) return;
  openLightbox(galleryItems().indexOf(item));
});

document.getElementById("lightboxPrev").addEventListener("click", () => stepLightbox(-1));
document.getElementById("lightboxNext").addEventListener("click", () => stepLightbox(1));
document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
    musicPanel.hidden = true;
  }
  if (lightbox.hidden) return;
  if (event.key === "ArrowRight") stepLightbox(1);
  if (event.key === "ArrowLeft") stepLightbox(-1);
});

audio.loop = true;
tick();
setInterval(tick, 1000);
renderTracks();
initParticles();
initReveal();
initNav();

window.addEventListener("scroll", () => {
  document.getElementById("topnav").classList.toggle("is-solid", window.scrollY > window.innerHeight * 0.72);
}, { passive: true });

if (new URLSearchParams(window.location.search).has("open")) {
  openInvitation(false);
}
