// ── CHUNK 1: Show today's date in the top bar ──────────────────────────────

const DAYS   = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const now       = new Date();
const dayName   = DAYS[now.getDay()];
const monthName = MONTHS[now.getMonth()];
const dayNum    = now.getDate();

document.getElementById('today-date').textContent = `${dayName} · ${monthName} ${dayNum}`;

// ── CHUNK 2: The thought repository ───────────────────────────────────────

const DEFAULT_THOUGHTS = [
  "Fear is the devil's favourite food!",
  "Expect setbacks. Don't fear them.",
  "Progress, not perfection.",
  "It does get worse before it gets better. — Ye",
  "Your goals are not a wish list. They're a to-do list.",
  "You're a magnet for miracles, baby!",
  "I can't wait to see what I do, cuz I always come through for me.",
  "You'll feel worse before you feel better! — Dr. Anna Lembke",
  "Shit's not going down. It's going where it needs to.",
  "Real niggas do what they wanna do, bitch niggas do what they can. — 2Pac",
  "Believing that the dots will connect down the road will give you the confidence to follow your heart, even when it leads you off the well-worn path, and that… will make all the difference. — Steve Jobs ('05 Stanford Commencement Speech)",
  "Enemies give me reason to be the last motherfucker breathin' — 2Pac",
  "Be the person Uncle Iroh knows you can be!",
  "Things will happen when they need to. Be patient.",
  "Anxiety is trying to protect you!",
  "The universe is also an artist. And you never rush an artist. Ever. Be patient.",
  "TRUST THE UNIVERSE. AND ITS TIMING.",
  "Remember how far you've come.",
  "Greatness is not in winning, but in continuing.",
  "We need to start, even when it's messy. Or we'll start mistaking that delay for who we are.",
  "Crib, it's okay, but do the thing after. For sure.",
  "Grind through the discomfort.",
  "The only way to know how strong you are is to test your limits. — Jor-El to Kal-El",
  "Tomorrow will be better if you start today.",
  "Anxiety doesn't get to decide who you are!",
  "You only lose what you're attached to. But if you let go, you're always full.",
  "Procrastination leads to a silent erosion of your potential.",
  "You can't see your reflection in boiling water. Similarly, you can't see the truth when angry.",
  "Most of what we worry about doesn't actually happen.",
  "BE READY TO LOSE AGAIN. AND AGAIN.",
  "THE LOTUS BLOOMS WHEN IT'S READY. Be patient!",
  "Whatever you're feeling… remember, it's — okay — temporary. It'll pass.",
];

// Load thoughts from localStorage, or use defaults if nothing saved yet
const SAVED_THOUGHTS = localStorage.getItem('ra_thoughts');
let THOUGHTS = SAVED_THOUGHTS ? JSON.parse(SAVED_THOUGHTS) : DEFAULT_THOUGHTS.slice();

// Save helper — call this any time THOUGHTS changes
function saveThoughts() {
  localStorage.setItem('ra_thoughts', JSON.stringify(THOUGHTS));
}

// If this is the first ever load, save the defaults into storage
if (!SAVED_THOUGHTS) saveThoughts();

// ── CHUNK 3: Pick today's thought (no repeats for 10 days) ─────────────────

const TODAY_KEY   = new Date().toISOString().slice(0, 10);
const HISTORY_KEY = 'ra_history';

let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

let todayEntry = history.find(entry => entry.date === TODAY_KEY);

if (!todayEntry) {
  const recentIndices = history.slice(-10).map(entry => entry.index);

  let pool = THOUGHTS
    .map((_, i) => i)
    .filter(i => !recentIndices.includes(i));

  if (pool.length === 0) pool = THOUGHTS.map((_, i) => i);

  const picked = pool[Math.floor(Math.random() * pool.length)];

  todayEntry = { date: TODAY_KEY, index: picked };
  history.push(todayEntry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

document.getElementById('today-thought').textContent = THOUGHTS[todayEntry.index];

// ── NAVIGATION ─────────────────────────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Show Today screen on load
showScreen('today-screen');

// All Thoughts button
document.querySelector('.btn-primary').addEventListener('click', function() {
  renderThoughtsList();
  showScreen('all-screen');
});

// Back button
document.getElementById('btn-back-from-all').addEventListener('click', function() {
  showScreen('today-screen');
});

// ── ADD THOUGHT SCREEN ─────────────────────────────────────────────────────

// Open Add screen from "Add a new one" link
document.getElementById('btn-all-thoughts').addEventListener('click', function() {  e.preventDefault();
  document.getElementById('new-thought-input').value = '';
  document.getElementById('char-count').textContent = '0 / 300';
  document.getElementById('add-screen').dataset.editIndex = '';
  document.getElementById('btn-save-thought').textContent = 'Save thought';
  showScreen('add-screen');
});

// Character counter
document.getElementById('new-thought-input').addEventListener('input', function() {
  const len = this.value.length;
  document.getElementById('char-count').textContent = `${len} / 300`;
});

// Cancel button
document.getElementById('btn-cancel-add').addEventListener('click', function(e) {
  e.preventDefault();
  showScreen('today-screen');
});

// Save button
document.getElementById('btn-save-thought').addEventListener('click', function() {
  const input = document.getElementById('new-thought-input');
  const text = input.value.trim();

  if (text === '') return;

  const addScreen = document.getElementById('add-screen');
  const editIndex = addScreen.dataset.editIndex;

  if (editIndex !== undefined && editIndex !== '') {
    THOUGHTS[parseInt(editIndex)] = text;
    addScreen.dataset.editIndex = '';
    document.getElementById('btn-save-thought').textContent = 'Save thought';
  } else {
    THOUGHTS.push(text);
  }

  saveThoughts();
  input.value = '';
  document.getElementById('char-count').textContent = '0 / 300';
  renderThoughtsList();
  showScreen('all-screen');
});

// ── RENDER THOUGHTS LIST ───────────────────────────────────────────────────

function renderThoughtsList() {
  const list = document.getElementById('thoughts-list');
  list.innerHTML = '';
  THOUGHTS.forEach(function(thought, index) {
    const item = document.createElement('div');
    item.className = 'thought-item';

    const text = document.createElement('p');
    text.className = 'thought-item-text';
    text.textContent = thought;

    const actions = document.createElement('div');
    actions.className = 'thought-item-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'thought-action-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function() {
      openEditScreen(index);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'thought-action-btn delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function() {
      if (confirm('Delete this thought?')) {
        THOUGHTS.splice(index, 1);
        saveThoughts();
        renderThoughtsList();
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    item.appendChild(text);
    item.appendChild(actions);
    list.appendChild(item);
  });
}

function openEditScreen(index) {
  const input = document.getElementById('new-thought-input');
  input.value = THOUGHTS[index];
  document.getElementById('char-count').textContent = `${input.value.length} / 300`;
  document.getElementById('add-screen').dataset.editIndex = index;
  document.getElementById('btn-save-thought').textContent = 'Save changes';
  showScreen('add-screen');
}
// ── NOTIFICATIONS ──────────────────────────────────────────────────────────

function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(function(permission) {
      if (permission === 'granted') {
        scheduleNotification();
      }
    });
  }
}

function scheduleNotification() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(reg) {
      const now = new Date();
      const next10am = new Date();
      next10am.setHours(10, 0, 0, 0);

      // If 10am already passed today, schedule for tomorrow
      if (now >= next10am) {
        next10am.setDate(next10am.getDate() + 1);
      }

      const delay = next10am.getTime() - now.getTime();

      setTimeout(function() {
        reg.showNotification('Remember, Anant', {
          body: 'Your thought for today is waiting. →',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'daily-thought',
          renotify: true,
        });
        // Schedule again for next day
        scheduleNotification();
      }, delay);
    });
  }
}

// Request permission on load
requestNotificationPermission();

// ── HISTORY SCREEN ─────────────────────────────────────────────────────────

function renderHistory() {
  const list = document.getElementById('history-list');
  list.innerHTML = '';

  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

  if (history.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'thought-item-text';
    empty.style.opacity = '0.4';
    empty.textContent = 'No history yet. Come back tomorrow.';
    list.appendChild(empty);
    return;
  }

  // Show most recent first
  const reversed = history.slice().reverse();

  reversed.forEach(function(entry) {
    const item = document.createElement('div');
    item.className = 'thought-item';

    const date = document.createElement('p');
    date.className = 'history-date';
    date.textContent = entry.date;

    const thought = document.createElement('p');
    thought.className = 'thought-item-text';
    thought.textContent = THOUGHTS[entry.index] || '(thought no longer exists)';

    item.appendChild(date);
    item.appendChild(thought);
    list.appendChild(item);
  });
}

// History button — wire up the Today screen button
document.getElementById('btn-history').addEventListener('click', function() {
  renderHistory();
  showScreen('history-screen');
});

// Back button
document.getElementById('btn-back-from-history').addEventListener('click', function() {
  showScreen('today-screen');
});

// ── ADD A NEW THOUGHT button ───────────────────────────────────────────────
document.getElementById('btn-add-thought').addEventListener('click', function(e) {
  e.preventDefault();
  // Reset the add screen to "new thought" mode (not edit mode)
  const input = document.getElementById('new-thought-input');
  input.value = '';
  document.getElementById('char-count').textContent = '0 / 300';
  delete document.getElementById('add-screen').dataset.editIndex;
  document.getElementById('btn-save-thought').textContent = 'Save thought';
  showScreen('add-screen');
});