const EXCUSES = [
  "Just five more minutes...",
  "I'll start after this one last scroll.",
  "Maybe tomorrow is better.",
  "Do I really need a timer?",
  "Let me reorganize my tabs first...",
  "Time is a flat circle—also a suggestion.",
  "Starting... soonish.",
  "Coffee first, productivity later.",
  "My plant needs an encouraging word.",
  "Oops, cat stepped on the keyboard!"
];

const minDelay = 2000;
const maxDelay = 5000;

const minutesInput = document.getElementById('minutes');
const startBtn = document.getElementById('startBtn');
const begBtn = document.getElementById('begBtn');
const status = document.getElementById('status');
const snoozeBtn = document.getElementById('snoozeBtn');
const resetBtn = document.getElementById('resetBtn');
const logEl = document.getElementById('log');
const endScreen = document.getElementById('endScreen');
const startAgainBtn = document.getElementById('startAgainBtn');

const minTens = document.getElementById('minTens').querySelector('span');
const minOnes = document.getElementById('minOnes').querySelector('span');
const secTens = document.getElementById('secTens').querySelector('span');
const secOnes = document.getElementById('secOnes').querySelector('span');

let totalSeconds = 0;
let timerInterval = null;
let abortProcrastination = false;

function log(msg) {
  const time = new Date().toLocaleTimeString();
  logEl.insertAdjacentHTML('afterbegin', `<div>▶ [${time}] ${msg}</div>`);
}

function fmtDigits(s) {
  let m = Math.floor(s / 60);
  let sec = s % 60;
  return {
    mT: Math.floor(m / 10),
    mO: m % 10,
    sT: Math.floor(sec / 10),
    sO: sec % 10
  };
}

function updateFlipClock() {
  const { mT, mO, sT, sO } = fmtDigits(totalSeconds);
  flipDigit(minTens, mT);
  flipDigit(minOnes, mO);
  flipDigit(secTens, sT);
  flipDigit(secOnes, sO);
}

function flipDigit(digitEl, newVal) {
  if (digitEl.textContent == newVal) return;
  digitEl.style.transform = 'rotateX(-90deg)';
  setTimeout(() => {
    digitEl.textContent = newVal;
    digitEl.style.transform = 'rotateX(0deg)';
  }, 250);
}

function typeExcuse(excuse) {
  status.innerHTML = `<span class="excuse"></span>`;
  let span = status.querySelector('.excuse');
  let i = 0;
  function type() {
    if (i < excuse.length) {
      span.textContent += excuse.charAt(i);
      i++;
      setTimeout(type, 40);
    }
  }
  type();
}

function startCountdown() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      showEndScreen();
      return;
    }
    totalSeconds -= 1;
    updateFlipClock();
    status.textContent = `Time left: ${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
  }, 1000);
}

async function procrastinate(skip = false) {
  abortProcrastination = false;
  startBtn.disabled = true;
  begBtn.disabled = true;
  minutesInput.disabled = true;
  resetBtn.disabled = true;
  snoozeBtn.disabled = true;

  let delays = skip ? 0 : Math.floor(Math.random() * 4) + 2;
  log(`Procrastination started — ${delays} delay(s).`);

  for (let i = 0; i < delays; i++) {
    if (abortProcrastination) break;
    const excuse = EXCUSES[Math.floor(Math.random() * EXCUSES.length)];
    typeExcuse(excuse);
    log(`Excuse: ${excuse}`);
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay));
  }

  status.textContent = '...Fine. Starting now.';
  await new Promise(res => setTimeout(res, 700));
  snoozeBtn.disabled = false;
  resetBtn.disabled = false;
  startCountdown();
}

function showEndScreen() {
  status.textContent = "Done! You actually did it?";
  log('Timer finished. Congrats.');
  confetti();
  endScreen.style.display = "flex";
}

startBtn.addEventListener('click', () => {
  const mins = Math.max(1, Math.floor(Number(minutesInput.value) || 1));
  totalSeconds = mins * 60;
  updateFlipClock();
  procrastinate(false);
});

begBtn.addEventListener('click', () => {
  status.textContent = "Okay okay okay — starting now. (You begged.)";
  const mins = Math.max(1, Math.floor(Number(minutesInput.value) || 1));
  totalSeconds = mins * 60;
  updateFlipClock();
  procrastinate(true);
});

snoozeBtn.addEventListener('click', () => {
  if (!timerInterval) return;
  const addSeconds = Math.floor(Math.random() * 91) + 30;
  totalSeconds += addSeconds;
  status.textContent = `Snoozed +${addSeconds}s. Back to procrastinating (kinda).`;
  updateFlipClock();
  log(`Snoozed +${addSeconds}s`);
});

resetBtn.addEventListener('click', () => {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  abortProcrastination = true;
  totalSeconds = 0;
  updateFlipClock();
  status.textContent = 'Reset. You can try again when ready.';
  startBtn.disabled = false;
  begBtn.disabled = false;
  minutesInput.disabled = false;
  snoozeBtn.disabled = true;
  resetBtn.disabled = true;
  log('Reset by user.');
});

startAgainBtn.addEventListener('click', () => {
  endScreen.style.display = "none";
  totalSeconds = 15;
  updateFlipClock();
  startCountdown();
});

updateFlipClock();
log('Ready.');
