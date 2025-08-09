// script.js
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
];

const minDelay = 2000;
const maxDelay = 7000;

// Elements
const minutesInput = document.getElementById('minutes');
const startBtn = document.getElementById('startBtn');
const begBtn = document.getElementById('begBtn');
const status = document.getElementById('status');
const display = document.getElementById('display');
const snoozeBtn = document.getElementById('snoozeBtn');
const resetBtn = document.getElementById('resetBtn');
const logEl = document.getElementById('log');
const tickSound = document.getElementById('tickSound');
const endScreen = document.getElementById('endScreen');
const restartBtn = document.getElementById('restartBtn');

let totalSeconds = 0;
let timerInterval = null;
let isProcrastinating = false;
let abortProcrastination = false;

function escapeHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function log(msg) {
  const time = new Date().toLocaleTimeString();
  // keep log safe from HTML injection
  logEl.insertAdjacentHTML('afterbegin', `<div class="log-item">▶ [${time}] ${escapeHtml(msg)}</div>`);
}

function randomBetween(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function updateDisplay() {
  const digits = display.querySelectorAll('.flip-digit');

  if (totalSeconds <= 0) {
    digits.forEach(d => d.textContent = "-");
    return;
  }

  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  const str = m + s;

  digits.forEach((digitEl, i) => {
    const newVal = str[i] || "-";
    if (digitEl.textContent !== newVal) {
      digitEl.textContent = newVal;
      digitEl.classList.remove('flip');
      // force reflow to restart the animation
      void digitEl.offsetWidth;
      digitEl.classList.add('flip');
      if (tickSound) {
        tickSound.currentTime = 0;
        tickSound.play().catch(()=>{});
      }
    }
  });
}

function showEndScreen() {
  endScreen.classList.remove('hidden');
  endScreen.setAttribute('aria-hidden', 'false');
}

function hideEndScreen() {
  endScreen.classList.add('hidden');
  endScreen.setAttribute('aria-hidden', 'true');
}

function startCountdown() {
  if (timerInterval) clearInterval(timerInterval);
  updateDisplay();

  // Update status immediately
  status.textContent = `Time left: ${Math.floor(totalSeconds/60).toString().padStart(2,'0')}:${Math.floor(totalSeconds%60).toString().padStart(2,'0')}`;

  timerInterval = setInterval(() => {
    totalSeconds -= 1;

    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      totalSeconds = 0;
      updateDisplay();
      status.textContent = 'Done — time is up!';
      log('Timer finished.');
      snoozeBtn.disabled = true;
      resetBtn.disabled = false;
      startBtn.disabled = true;
      begBtn.disabled = true;
      showEndScreen();
      return;
    }

    updateDisplay();
    status.textContent = `Time left: ${Math.floor(totalSeconds/60).toString().padStart(2,'0')}:${Math.floor(totalSeconds%60).toString().padStart(2,'0')}`;
  }, 1000);
}

async function procrastinate(shouldSkip = false) {
  isProcrastinating = true;
  abortProcrastination = false;

  startBtn.disabled = true;
  begBtn.disabled = true;
  minutesInput.disabled = true;
  resetBtn.disabled = true;
  snoozeBtn.disabled = true;

  const delays = shouldSkip ? 0 : randomBetween(2, 5);
  log(`Procrastination session started — ${delays} delay(s).`);

  for (let i = 0; i < delays; i++) {
    if (abortProcrastination) break;
    const excuse = EXCUSES[Math.floor(Math.random() * EXCUSES.length)];

    // set status safely using a DOM node (avoid HTML injection)
    status.innerHTML = '';
    const span = document.createElement('span');
    span.className = 'excuse';
    span.textContent = excuse;
    status.appendChild(span);

    log(`Excuse: ${excuse}`);
    const time = randomBetween(minDelay, maxDelay);
    await new Promise(resolve => setTimeout(resolve, time));
  }

  isProcrastinating = false;

  if (abortProcrastination) {
    status.textContent = 'Procrastination aborted. Fine. Starting now.';
    log('Procrastination aborted by user.');
  } else {
    status.textContent = '...Fine. Starting now.';
  }

  // tiny pause so user sees status change
  await new Promise(resolve => setTimeout(resolve, 700));

  snoozeBtn.disabled = false;
  resetBtn.disabled = false;
  startBtn.disabled = true;
  begBtn.disabled = true;
  minutesInput.disabled = true;

  startCountdown();
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
  status.textContent = `Snoozed +${Math.round(addSeconds)}s. Back to procrastinating (kinda).`;
  updateDisplay();
  log(`Snoozed +${addSeconds}s`);
});

resetBtn.addEventListener('click', () => {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  abortProcrastination = true;
  isProcrastinating = false;
  totalSeconds = 0;
  updateDisplay();
  status.textContent = 'Reset. You can try again when ready.';
  startBtn.disabled = false;
  begBtn.disabled = false;
  minutesInput.disabled = false;
  snoozeBtn.disabled = true;
  resetBtn.disabled = true;
  hideEndScreen();
  log('Reset by user.');
});

restartBtn.addEventListener('click', () => {
  hideEndScreen();
  totalSeconds = 0;
  updateDisplay();
  startBtn.disabled = false;
  begBtn.disabled = false;
  minutesInput.disabled = false;
  snoozeBtn.disabled = true;
  resetBtn.disabled = true;
  status.textContent = 'Ready to procrastinate.';
  log('Restarted.');
});

updateDisplay();
log('Ready.');

minutesInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startBtn.click();
});
