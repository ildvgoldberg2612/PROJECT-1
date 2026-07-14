// Builds the July & August daily reading checklists for Yagel and Amiad,
// with checked state saved in the browser (localStorage) so it persists.
// Checking a day off triggers a little confetti + clap + encouragement pop-up.

const DAYS_IN_MONTH = { july: 31, august: 31 };

const MESSAGES = [
  "כל הכבוד, {name}! 🎉",
  "יאללה קדימה, {name}! 📚",
  "אתה על הגל, {name}! 🔥",
  "קריאה מעולה, {name}! 👏",
  "המשך כך, {name}! 🌟",
  "עבודה נהדרת, {name}! 💪",
  "אתה כוכב קריאה, {name}! ⭐",
  "בום! עוד יום הושלם, {name}! 🚀",
];

const NAMES_HE = {
  yagel: "יגל",
  amiad: "עמיעד",
};

const CONFETTI_COLORS = ["#2563eb", "#f97316", "#16a34a", "#facc15", "#0ea5b7", "#1e3a8a"];

function storageKey(person, month, day) {
  return `reading-${person}-${month}-${day}`;
}

function displayName(person) {
  return NAMES_HE[person] || person;
}

document.querySelectorAll(".days").forEach((container) => {
  const { person, month } = container.dataset;
  const total = DAYS_IN_MONTH[month];

  for (let day = 1; day <= total; day++) {
    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = day;

    const key = storageKey(person, month, day);
    if (localStorage.getItem(key) === "1") {
      cell.classList.add("checked");
    }

    cell.addEventListener("click", () => {
      const isChecked = cell.classList.toggle("checked");
      localStorage.setItem(key, isChecked ? "1" : "0");

      if (isChecked) {
        celebrate(cell, person);
      }
    });

    container.appendChild(cell);
  }
});

function celebrate(cell, person) {
  const rect = cell.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  burstConfetti(originX, originY);
  showToast(person);
  playClap();
}

function burstConfetti(x, y) {
  const pieceCount = 22;

  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];

    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 90;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 40;
    const rotation = Math.random() * 720 - 360;

    piece.style.setProperty("--dx", `${dx}px`);
    piece.style.setProperty("--dy", `${dy}px`);
    piece.style.setProperty("--rot", `${rotation}deg`);

    document.body.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

function showToast(person) {
  const template = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const text = template.replace("{name}", displayName(person));

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;

  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 1800);
}

let audioCtx;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Synthesizes a short "clap" burst using filtered noise, repeated a few
// times to sound like a quick round of applause (no audio file needed).
function playClap() {
  const ctx = getAudioContext();
  const clapTimes = [0, 0.09, 0.17, 0.26];

  clapTimes.forEach((offset) => {
    const duration = 0.12;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const decay = 1 - i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 1500 + Math.random() * 500;
    bandpass.Q.value = 0.9;

    const gain = ctx.createGain();
    gain.gain.value = 0.9;
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + offset + duration);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime + offset);
    noise.stop(ctx.currentTime + offset + duration);
  });
}
