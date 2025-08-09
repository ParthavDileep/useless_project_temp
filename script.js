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
const display = document.getElementById('display');
const snoozeBtn = document.getElementById('snoozeBtn');
const resetBtn = document.getElementById('resetBtn');
const logEl = document.getElementById('log');
const endScreen = document.getElementById('endScreen');
const startAgainBtn = document.getElementById('startAgainBtn');

let totalSeconds = 0;
let timerInterval = null;
let abortProcrastination = false;

function log(msg) {
  const time = new Date().toLocaleTimeString();
  logEl.insertAdjacentHTML('afterbegin', `<div>▶ [${time}] ${msg}</div>`);
}

function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function randomBetween(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function updateDisplay() {
  display.textContent = totalSeconds > 0 ? fmt(totalSeconds) : '--:--';
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
    updateDisplay();
    status.textContent = `Time left: ${fmt(totalSeconds)}`;
  }, 1000);
}

async function procrastinate(skip = false) {
  abortProcrastination = false;
  startBtn.disabled = true;
  begBtn.disabled = true;
  minutesInput.disabled = true;
  resetBtn.disabled = true;
  snoozeBtn.disabled = true;

  let delays = skip ? 0 : randomBetween(2, 5);
  log(`Procrastination session started — ${delays} delay(s).`);

  for (let i = 0; i < delays; i++) {
    if (abortProcrastination) break;
    const excuse = EXCUSES[Math.floor(Math.random() * EXCUSES.length)];
    status.innerHTML = `<span class="excuse">${excuse}</span>`;
    log(`Excuse: ${excuse}`);
    await new Promise(res => setTimeout(res, randomBetween(minDelay, maxDelay)));
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
  updateDisplay();
  procrastinate(false);
});

begBtn.addEventListener('click', () => {
  status.textContent = "Okay okay okay — starting now. (You begged.)";
  const mins = Math.max(1, Math.floor(Number(minutesInput.value) || 1));
  totalSeconds = mins * 60;
  updateDisplay();
  procrastinate(true);
});

snoozeBtn.addEventListener('click', () => {
  if (!timerInterval) return;
  const addSeconds = randomBetween(30, 120);
  totalSeconds += addSeconds;
  status.textContent = `Snoozed +${addSeconds}s. Back to procrastinating (kinda).`;
  updateDisplay();
  log(`Snoozed +${addSeconds}s`);
});

resetBtn.addEventListener('click', () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  abortProcrastination = true;
  totalSeconds = 0;
  updateDisplay();
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
  totalSeconds = 15; // restart with 15 seconds
  updateDisplay();
  startCountdown();
});

updateDisplay();
log('Ready.');
