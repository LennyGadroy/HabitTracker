const HABITS = [
  { id:'sleep',    name:'Sleep',             emoji:'💤', type:'good',    color:'#818cf8', jokerLimit:3, weekdayOnly:true },
  { id:'projets',  name:'Personal Projects', emoji:'🚀', type:'good',    color:'#e879f9', jokerLimit:3, weekdayOnly:false },
  { id:'gym',      name:'Gym',               emoji:'🏋️', type:'good',    color:'#34d399', jokerLimit:3, weekdayOnly:true  },
  { id:'drink',    name:'Drink',             emoji:'💧', type:'drink',   color:'#38bdf8', jokerLimit:3, weekdayOnly:false },
  { id:'clean',    name:'Clean',             emoji:'🫧', type:'counter', color:'#a3e635', jokerLimit:0, weekdayOnly:false, step:1, goal:2, max:3 },
  { id:'work',     name:'Work',              emoji:'💼', type:'good',    color:'#fbbf24', jokerLimit:3, weekdayOnly:true  },
  { id:'running',  name:'Running',           emoji:'🏃', type:'good',    color:'#f97316', jokerLimit:2, weekdayOnly:false, optional:true },
  { id:'fruits',   name:'Fruits & Veggies',  emoji:'🥦', type:'portion', color:'#86efac', jokerLimit:0, weekdayOnly:false },
  { id:'shower',   name:'Shower',            emoji:'🚿', type:'shower',  color:'#67e8f9', jokerLimit:0, weekdayOnly:false },
  { id:'read',     name:'Read',              emoji:'📚', type:'good',    color:'#a78bfa', jokerLimit:3, weekdayOnly:false, optional:true },
  { id:'cleaning', name:'Cleaning',          emoji:'🧹', type:'weekly',  color:'#4ade80', jokerLimit:0, weekdayOnly:false, optional:true },
  { id:'phoneoob', name:'Phone out of bed',  emoji:'📵', type:'good',    color:'#c084fc', jokerLimit:2, weekdayOnly:false },
  { id:'nosugar',  name:'No extra Sugar',    emoji:'🍬', type:'bad',     color:'#f9a8d4', jokerLimit:0, weekdayOnly:false },
  { id:'nogaming', name:'No Gaming',         emoji:'🎮', type:'bad',     color:'#fb923c', jokerLimit:0, weekdayOnly:false, amounts:['No','15','30','1h','2h','+3h'] },
  { id:'noscroll', name:'No Scroll',         emoji:'📱', type:'bad',     color:'#f87171', jokerLimit:0, weekdayOnly:false, amounts:['No','15','30','1h','+2h'] },
  { id:'nofilms',  name:'No Films',          emoji:'🎬', type:'bad',     color:'#f43f5e', jokerLimit:0, weekdayOnly:false, amounts:['No','1','2','+3'] },
];

const DRINK_GOAL = 2000;
const DRINK_STEP = 250;
const DRINK_MAX  = 5000;

const PORTION_GOAL = 5;
const PORTION_MAX  = 10;

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2400, 3200, 4200];
const LEVEL_NAMES = ['Novice','Apprentice','Practitioner','Devotee','Disciplined','Focused','Master','Grandmaster','Legend','Transcendent'];

const JOKER_REASONS = [
  { id: 'sick',    label: '🤒 Sick' },
  { id: 'work',    label: '💼 Too much work' },
  { id: 'social',  label: '🎉 Nightout' },
  { id: 'tired',   label: '😴 Tired' },
  { id: 'travel',  label: '✈️ Travel' },
  { id: 'other',   label: '❓ Other' },
];

const MOOD_EMOJIS  = ['', '😫', '😕', '😐', '😊', '🤩'];
const MOOD_COLORS  = ['', '#f87171', '#fb923c', '#fbbf24', '#86efac', '#34d399'];

const isWeekend = d => { const dow = d.getDay(); return dow === 0 || dow === 6; };
const isDayActive = (habit, dateObj) => {
  if (habit.activeDays) return habit.activeDays.includes(dateObj.getDay());
  if (habit.weekdayOnly) return !isWeekend(dateObj);
  return true;
};
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_SHORT   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAY_FULL    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const fmtDate = d => {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};

const parseDate = s => {
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m-1, d);
};

const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const today = () => fmtDate(new Date());

function getDrinkMl(dateKey) {
  const val = DB.habits['drink'].logs[dateKey];
  if (typeof val === 'number') return val;
  if (val === 'done') return DRINK_GOAL;
  return 0;
}
function isDrinkDone(dateKey) { return getDrinkMl(dateKey) >= DRINK_GOAL; }

function getPortions(dateKey) {
  const v = DB.habits['fruits'].logs[dateKey];
  return typeof v === 'number' ? v : 0;
}
function isPortionDone(dateKey) { return getPortions(dateKey) >= PORTION_GOAL; }

function getShowerState(dateKey) {
  return DB.habits['shower'].logs[dateKey] || null;
}

function isShowerDone(dateKey) {
  const s = getShowerState(dateKey);
  return s === 'cold' || s === 'lukewarm';
}

function isBadFail(id, dateKey) {
  const log = DB.habits[id].logs[dateKey];
  return log === 'fail' || (!!log && log !== 'no');
}

function getCounterVal(id, dateKey) {
  const v = DB.habits[id].logs[dateKey];
  return typeof v === 'number' ? v : 0;
}
function isCounterDone(habit, dateKey) {
  return getCounterVal(habit.id, dateKey) >= habit.goal;
}

function getWeekMonday(dateObj) {
  const d = new Date(dateObj);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
  d.setDate(d.getDate() - dow);
  return fmtDate(d);
}

function isWeeklyDoneForWeek(habitId, weekMondayKey) {
  const logs = DB.habits[habitId].logs;
  const start = parseDate(weekMondayKey);
  for (let i = 0; i < 7; i++) {
    const k = fmtDate(addDays(start, i));
    if (logs[k] === 'done') return true;
  }
  return false;
}

function calcWeeklyStreak(habit) {
  const currentWeekMonday = getWeekMonday(new Date());
  const currentDone = isWeeklyDoneForWeek(habit.id, currentWeekMonday);
  const startOffset = currentDone ? 0 : 1;
  let streak = 0;
  for (let offset = startOffset; offset < 104; offset++) {
    const weekMonday = fmtDate(addDays(parseDate(currentWeekMonday), -offset * 7));
    if (weekMonday < DB.createdAt) break;
    if (!isWeeklyDoneForWeek(habit.id, weekMonday)) break;
    streak++;
  }
  return streak;
}

function getHabitDayValue(habit, dateKey, dateObj) {
  if (habit.type === 'drink')   return isDrinkDone(dateKey) ? 1 : 0;
  if (habit.type === 'portion') return isPortionDone(dateKey) ? 1 : getPortions(dateKey) / PORTION_GOAL;
  if (habit.type === 'counter') return isCounterDone(habit, dateKey) ? 1 : getCounterVal(habit.id, dateKey) / habit.goal;
  if (habit.type === 'shower') {
    const s = getShowerState(dateKey);
    return s === 'cold' ? 1 : s === 'lukewarm' ? 0.5 : s === 'hot' ? 0 : 0;
  }
  if (habit.type === 'weekly') {
    const weekMonday = getWeekMonday(dateObj || parseDate(dateKey));
    return isWeeklyDoneForWeek(habit.id, weekMonday) ? 1 : 0;
  }
  const log = DB.habits[habit.id].logs[dateKey];
  if (habit.type === 'bad') return isBadFail(habit.id, dateKey) ? 0 : 1;
  return (log === 'done' || log === 'joker') ? 1 : 0;
}

function loadData() {
  try {
    const raw = localStorage.getItem('ht_v2');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  const d = { createdAt: today(), habits: {}, profile: { name: '' } };
  HABITS.forEach(h => d.habits[h.id] = { logs: {} });
  return d;
}

function saveData() {
  localStorage.setItem('ht_v2', JSON.stringify(DB));
}

let DB = loadData();
HABITS.forEach(h => { if (!DB.habits[h.id]) DB.habits[h.id] = { logs: {} }; });
if (!DB.createdAt) DB.createdAt = today();
if (!DB.profile) DB.profile = { name: '' };
if (DB.profile.soundEnabled === undefined) DB.profile.soundEnabled = true;
if (!DB.xp) DB.xp = 0;
if (!DB.unlockedAchievements) DB.unlockedAchievements = [];
if (!DB.jokerReasons) DB.jokerReasons = {};
if (!DB.moods) DB.moods = {};
if (!DB.perfectDaysClaimed) DB.perfectDaysClaimed = [];
if (!DB.penaltiesApplied) DB.penaltiesApplied = [];
if (DB.profile.hardcoreMode   === undefined) DB.profile.hardcoreMode   = false;
if (DB.profile.notifsEnabled  === undefined) DB.profile.notifsEnabled  = false;

const audioCtx = (() => {
  try { return new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; }
})();

function playSound(type) {
  if (!DB.profile.soundEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (type === 'done') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.22, audioCtx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.28);
    } else if (type === 'undo') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.22);
    } else if (type === 'fail') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.35);
    } else if (type === 'drink') {
      [523, 659].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = audioCtx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } else if (type === 'fanfare') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = audioCtx.currentTime + i * 0.13;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    } else if (type === 'levelup') {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = audioCtx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.start(t);
        osc.stop(t + 0.55);
      });
    }
  } catch(e) {}
}

function showToast(msg, duration) {
  duration = duration || 3200;
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
  }, duration);
}

function calcLevel(xp) {
  xp = xp || 0;
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, LEVEL_THRESHOLDS.length);
}

function xpProgress(xp) {
  xp = xp || 0;
  const level = calcLevel(xp);
  if (level >= LEVEL_THRESHOLDS.length) {
    return { pct: 100, needed: 0 };
  }
  const cur = LEVEL_THRESHOLDS[level - 1] || 0;
  const next = LEVEL_THRESHOLDS[level];
  const pct = Math.round(((xp - cur) / (next - cur)) * 100);
  return { pct, needed: next - xp };
}

function giveXP(amount) {
  const prevLevel = calcLevel(DB.xp);
  DB.xp = (DB.xp || 0) + amount;
  const newLevel = calcLevel(DB.xp);
  saveData();
  if (newLevel > prevLevel) {
    const name = LEVEL_NAMES[newLevel - 1] || `Level ${newLevel}`;
    setTimeout(() => {
      playSound('levelup');
      showToast(`🎉 Level Up! You're now ${name} — Lv.${newLevel}`, 4000);
    }, 300);
  }
}

function loseXP(amount) {
  DB.xp = Math.max(0, (DB.xp || 0) - amount);
  saveData();
}

function checkDailyPenalties() {
  if (!DB.profile.hardcoreMode) return;
  const yest = fmtDate(addDays(new Date(), -1));
  if (yest < DB.createdAt) return;
  if (DB.penaltiesApplied.includes(yest)) return;
  DB.penaltiesApplied.push(yest);
  const yestDate = parseDate(yest);
  let missed = 0;
  HABITS.forEach(h => {
    if (h.type !== 'good') return;
    if (!isDayActive(h, yestDate)) return;
    const log = DB.habits[h.id].logs[yest];
    if (log !== 'done' && log !== 'joker') missed++;
  });
  if (missed > 0) {
    const penalty = missed * 5;
    loseXP(penalty);
    saveData();
    setTimeout(() => {
      playSound('fail');
      showToast(`⚡ Hardcore: -${penalty} XP — ${missed} habit${missed > 1 ? 's' : ''} missed yesterday`, 4000);
    }, 800);
  }
}

const POMO_DURATION = 25 * 60;
let pomodoroTimers = {};

function startPomodoro(id) {
  if (pomodoroTimers[id]) return;
  const habit = HABITS.find(h => h.id === id);
  if (!habit || habit.type !== 'good') return;
  pomodoroTimers[id] = { remaining: POMO_DURATION };
  updatePomoDisplay(id);
  pomodoroTimers[id].intervalId = setInterval(() => {
    pomodoroTimers[id].remaining--;
    updatePomoDisplay(id);
    if (pomodoroTimers[id].remaining <= 0) {
      clearInterval(pomodoroTimers[id].intervalId);
      delete pomodoroTimers[id];
      updatePomoDisplay(id);
      playSound('fanfare');
      showToast(`⏱️ Pomodoro terminé — ${habit.emoji} ${habit.name} validé !`, 4000);
      const t = today();
      if (DB.habits[id].logs[t] !== 'done') {
        DB.habits[id].logs[t] = 'done';
        giveXP(10);
        saveData();
        checkAchievements();
        if (countDoneToday() === HABITS.filter(h => !h.optional).length) { launchConfetti(); playSound('fanfare'); checkPerfectDayBonus(); }
        renderAll();
      }
    }
  }, 1000);
  updatePomoDisplay(id);
}

function stopPomodoro(id) {
  if (!pomodoroTimers[id]) return;
  clearInterval(pomodoroTimers[id].intervalId);
  delete pomodoroTimers[id];
  updatePomoDisplay(id);
}

function updatePomoDisplay(id) {
  const card = document.querySelector(`[data-habit="${id}"]`);
  if (!card) return;
  const state = pomodoroTimers[id];
  const wrap = card.querySelector('.pomo-wrap');
  if (!wrap) return;
  if (!state) {
    wrap.innerHTML = `<button class="pomo-btn" onclick="event.stopPropagation(); startPomodoro('${id}')" title="Démarrer un Pomodoro (25 min)">⏱️</button>`;
    return;
  }
  const m = Math.floor(state.remaining / 60);
  const s = String(state.remaining % 60).padStart(2, '0');
  const pct = Math.round((1 - state.remaining / POMO_DURATION) * 100);
  wrap.innerHTML = `
    <div class="pomo-running">
      <svg class="pomo-ring" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--s4)" stroke-width="3"/>
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--hc,#818cf8)" stroke-width="3"
          stroke-dasharray="${pct} 100" stroke-linecap="round"
          transform="rotate(-90 18 18)" pathLength="100"/>
      </svg>
      <span class="pomo-time">${m}:${s}</span>
      <button class="pomo-stop-btn" onclick="event.stopPropagation(); stopPomodoro('${id}')" title="Arrêter">✕</button>
    </div>`;
}

function checkPerfectWeek() {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  for (let weekOffset = 1; weekOffset <= 12; weekOffset++) {
    const weekStart = addDays(parseDate(getWeekMonday(todayDate)), -(weekOffset * 7));
    const weekStartKey = fmtDate(weekStart);
    if (weekStartKey < DB.createdAt) break;
    let perfect = true;
    for (let d = 0; d < 7; d++) {
      const date = addDays(weekStart, d);
      if (date > todayDate) continue;
      const k = fmtDate(date);
      if (k < DB.createdAt) { perfect = false; break; }
      for (const h of HABITS) {
        if (h.optional) continue;
        if (!isDayActive(h, date)) continue;
        if (getHabitDayValue(h, k, date) !== 1) { perfect = false; break; }
      }
      if (!perfect) break;
    }
    if (perfect) return true;
  }
  return false;
}

function checkGymMonth() {
  const gymHabit = HABITS.find(h => h.id === 'gym');
  if (!gymHabit) return false;
  const monthKey = today().slice(0, 7);
  const count = Object.entries(DB.habits['gym'].logs)
    .filter(([k, v]) => k.startsWith(monthKey) && v === 'done').length;
  return count >= 20;
}

const ACHIEVEMENTS = [
  {
    id: 'first_habit',
    emoji: '🌱',
    name: 'First Step',
    desc: 'Complete your first habit',
    check: () => Object.values(DB.habits).some(h => Object.keys(h.logs).length > 0)
  },
  {
    id: 'camel',
    emoji: '🐫',
    name: 'Camel',
    desc: '7 days hitting the drink goal in a row',
    check: () => { const h = HABITS.find(x => x.id === 'drink'); return h && calcStreak(h).current >= 7; }
  },
  {
    id: 'perfect_week',
    emoji: '⭐',
    name: 'Perfect Week',
    desc: '100% success on a complete week',
    check: () => checkPerfectWeek()
  },
  {
    id: 'king',
    emoji: '👑',
    name: 'King',
    desc: 'No bad habit triggered for 14 days',
    check: () => {
      const bads = HABITS.filter(h => h.type === 'bad');
      return bads.length > 0 && bads.every(h => calcStreak(h).current >= 14);
    }
  },
  {
    id: 'centurion',
    emoji: '⚔️',
    name: 'Centurion',
    desc: 'Accumulate 100 XP',
    check: () => (DB.xp || 0) >= 100
  },
  {
    id: 'on_fire',
    emoji: '🔥',
    name: 'On Fire',
    desc: 'Reach Level 5',
    check: () => calcLevel(DB.xp) >= 5
  },
  {
    id: 'bookworm',
    emoji: '📖',
    name: 'Bookworm',
    desc: '14-day reading streak',
    check: () => { const h = HABITS.find(x => x.id === 'read'); return h && calcStreak(h).current >= 14; }
  },
  {
    id: 'digital_detox',
    emoji: '📵',
    name: 'Digital Detox',
    desc: '30 days without scrolling',
    check: () => { const h = HABITS.find(x => x.id === 'noscroll'); return h && calcStreak(h).current >= 30; }
  },
  {
    id: 'iron_will',
    emoji: '💪',
    name: 'Iron Will',
    desc: '20 gym sessions this month',
    check: () => checkGymMonth()
  },
  {
    id: 'consistent',
    emoji: '🌅',
    name: 'Consistent',
    desc: 'Any single habit streak of 30+ days',
    check: () => HABITS.some(h => calcStreak(h).current >= 30)
  },
];

function checkAchievements() {
  let newUnlocks = 0;
  ACHIEVEMENTS.forEach(a => {
    if (!DB.unlockedAchievements.includes(a.id) && a.check()) {
      DB.unlockedAchievements.push(a.id);
      newUnlocks++;
      const delay = newUnlocks * 700;
      setTimeout(() => {
        showToast(`🏆 Achievement unlocked: ${a.name} ${a.emoji}`, 3500);
        playSound('done');
      }, delay);
    }
  });
  if (newUnlocks > 0) saveData();
}

function checkPerfectDayBonus() {
  const t = today();
  if (DB.perfectDaysClaimed.includes(t)) return;
  const required = HABITS.filter(h => !h.optional).length;
  if (countDoneToday() === required) {
    DB.perfectDaysClaimed.push(t);
    giveXP(50);
    setTimeout(() => showToast('🌟 Perfect Day! +50 XP bonus', 3500), 600);
    saveData();
  }
}

let pendingJokerId = null;
let selectedJokerReason = null;

function openJokerModal(id) {
  pendingJokerId = id;
  selectedJokerReason = null;
  const list = document.getElementById('jokerReasonsList');
  list.innerHTML = JOKER_REASONS.map(r =>
    `<button class="joker-reason-btn" data-reason="${r.id}" onclick="selectJokerReason('${r.id}')">${r.label}</button>`
  ).join('');
  document.getElementById('jokerConfirmBtn').disabled = true;
  document.getElementById('jokerModal').classList.add('open');
}

function selectJokerReason(reasonId) {
  selectedJokerReason = reasonId;
  document.querySelectorAll('.joker-reason-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.reason === reasonId);
  });
  document.getElementById('jokerConfirmBtn').disabled = false;
}

function closeJokerModal() {
  pendingJokerId = null;
  selectedJokerReason = null;
  document.getElementById('jokerModal').classList.remove('open');
}

function confirmJoker() {
  if (!pendingJokerId || !selectedJokerReason) return;
  const id = pendingJokerId;
  const reason = selectedJokerReason;
  closeJokerModal();

  const habit = HABITS.find(h => h.id === id);
  if (!habit || habit.type !== 'good') return;
  if (jokersAvailable(habit) <= 0) return;

  const yest = fmtDate(addDays(new Date(), -1));
  if (yest < DB.createdAt) return;
  const yestLog = DB.habits[id].logs[yest];
  if (yestLog !== 'done' && yestLog !== 'joker') {
    DB.habits[id].logs[yest] = 'joker';
    DB.jokerReasons[`${yest}_${id}`] = reason;
    saveData();
    renderAll();
  }
}

let currentMoodDate = null;

function checkDailyMood() {
  if (sessionStorage.getItem('moodChecked')) return;
  sessionStorage.setItem('moodChecked', '1');
  const t = today();
  if (t < DB.createdAt) return;
  if (DB.moods[t] !== undefined) return;
  setTimeout(() => openMoodModal(t), 2000);
}

function openMoodModal(dateKey) {
  currentMoodDate = dateKey;
  const date = parseDate(dateKey);
  document.getElementById('moodDateLabel').textContent =
    `${DAY_FULL[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
  document.querySelectorAll('.mood-emoji-btn').forEach(b => {
    const already = DB.moods[dateKey];
    b.classList.toggle('selected', already !== undefined && parseInt(b.dataset.value) === already);
  });
  document.getElementById('moodModal').classList.add('open');
}

function openMoodManual() {
  openMoodModal(today());
}

function closeMoodModal() {
  currentMoodDate = null;
  document.getElementById('moodModal').classList.remove('open');
}

function selectMood(value) {
  document.querySelectorAll('.mood-emoji-btn').forEach(b => {
    b.classList.toggle('selected', parseInt(b.dataset.value) === value);
  });
  if (!currentMoodDate) return;
  DB.moods[currentMoodDate] = value;
  saveData();
  setTimeout(() => {
    closeMoodModal();
    renderMoodSection();
  }, 450);
}

function calcMoodCorrelations() {
  const moodEntries = Object.entries(DB.moods);
  if (moodEntries.length < 5) return [];
  return HABITS.map(habit => {
    let sumDone = 0, cntDone = 0, sumNotDone = 0, cntNotDone = 0;
    moodEntries.forEach(([k, mood]) => {
      const dateObj = parseDate(k);
      const val = getHabitDayValue(habit, k, dateObj);
      if (val === 1) { sumDone += mood; cntDone++; }
      else { sumNotDone += mood; cntNotDone++; }
    });
    const avgDone = cntDone >= 2 ? sumDone / cntDone : null;
    const avgNotDone = cntNotDone >= 2 ? sumNotDone / cntNotDone : null;
    const diff = avgDone !== null && avgNotDone !== null ? avgDone - avgNotDone : 0;
    return { habit, avgDone, avgNotDone, diff, cntDone };
  })
  .filter(c => c.avgDone !== null && c.avgNotDone !== null && Math.abs(c.diff) > 0.05)
  .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
  .slice(0, 3);
}

function renderMoodSection() {
  const container = document.getElementById('moodContent');
  if (!container) return;
  const moodEntries = Object.entries(DB.moods).sort(([a], [b]) => a.localeCompare(b));
  if (moodEntries.length === 0) {
    container.innerHTML = '<div class="mood-empty">No mood data yet — you\'ll be asked each morning!</div>';
    return;
  }

  const last30 = moodEntries.slice(-30);
  const avgMood = last30.reduce((s, [, v]) => s + v, 0) / last30.length;
  const avgIdx = Math.round(avgMood);
  const avgEmoji = MOOD_EMOJIS[avgIdx] || '😐';

  const dotsHtml = last30.map(([k, m]) => {
    const date = parseDate(k);
    const tip = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()} — ${MOOD_EMOJIS[m]}`;
    return `<div class="mood-dot" style="background:${MOOD_COLORS[m]}"
      onmouseenter="tipShow(event,'${tip}')" onmouseleave="tipHide()"></div>`;
  }).join('');

  const correlations = calcMoodCorrelations();
  let corrHtml = '';
  if (correlations.length >= 2) {
    corrHtml = `<div class="mood-insights-grid">
      ${correlations.map(c => {
        const doneColor = c.diff > 0 ? '#34d399' : '#f87171';
        const notDoneColor = c.diff > 0 ? '#f87171' : '#34d399';
        const donePct = Math.round(((c.avgDone || 0) / 5) * 100);
        const notDonePct = Math.round(((c.avgNotDone || 0) / 5) * 100);
        const dir = c.diff > 0 ? '▲' : '▼';
        const dirColor = c.diff > 0 ? '#34d399' : '#f87171';
        return `<div class="mood-insight-card">
          <div class="mood-insight-habit">
            <span style="font-size:1.1rem">${c.habit.emoji}</span>
            <span class="mood-insight-name">${c.habit.name}</span>
          </div>
          <div class="mood-insight-bars">
            <div class="mood-insight-bar-row">
              <span class="mood-insight-bar-label">Done</span>
              <div class="mood-insight-bar-track">
                <div class="mood-insight-bar-fill" style="width:${donePct}%;background:${doneColor}"></div>
              </div>
              <span class="mood-insight-score">${(c.avgDone||0).toFixed(1)}</span>
            </div>
            <div class="mood-insight-bar-row">
              <span class="mood-insight-bar-label">Skip</span>
              <div class="mood-insight-bar-track">
                <div class="mood-insight-bar-fill" style="width:${notDonePct}%;background:${notDoneColor}"></div>
              </div>
              <span class="mood-insight-score">${(c.avgNotDone||0).toFixed(1)}</span>
            </div>
          </div>
          <div class="mood-delta" style="color:${dirColor}">${dir} ${Math.abs(c.diff).toFixed(1)} pts impact on mood</div>
        </div>`;
      }).join('')}
    </div>`;
  }

  container.innerHTML = `
    <div class="mood-timeline-wrap">
      <div class="mood-timeline-title">Last 30 days</div>
      <div class="mood-dots-row">${dotsHtml}</div>
      <div class="mood-avg-row">
        <span class="mood-avg-emoji">${avgEmoji}</span>
        <div>
          <div class="mood-avg-score" style="color:${MOOD_COLORS[avgIdx]}">${avgMood.toFixed(1)} / 5</div>
          <div class="mood-avg-text">average mood</div>
        </div>
      </div>
    </div>
    ${corrHtml}
  `;
}

function renderAchievements() {
  const container = document.getElementById('achievementsGrid');
  if (!container) return;
  container.innerHTML = ACHIEVEMENTS.map((a, i) => {
    const unlocked = DB.unlockedAchievements.includes(a.id);
    return `<div class="achievement-badge ${unlocked ? 'unlocked' : 'locked'}" style="animation-delay:${i * .05}s">
      ${unlocked ? '<div class="ach-unlocked-badge">✓</div>' : ''}
      <div class="ach-emoji">${a.emoji}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
    </div>`;
  }).join('');
}

function applyZenMode() {
  if (!DB.profile.zenMode) return;
  const t = today();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  HABITS.forEach(h => {
    let isDone = false;
    if (h.type === 'drink') isDone = isDrinkDone(t);
    else if (h.type === 'counter') isDone = isCounterDone(h, t);
    else if (h.type === 'weekly') isDone = isWeeklyDoneForWeek(h.id, getWeekMonday(todayDate));
    else if (h.type === 'bad') isDone = !isBadFail(h.id, t);
    else isDone = DB.habits[h.id].logs[t] === 'done' || DB.habits[h.id].logs[t] === 'joker';
    if (isDone) {
      const el = document.querySelector(`[data-habit="${h.id}"]`);
      if (el) requestAnimationFrame(() => el.classList.add('zen-collapse'));
    }
  });
}

function openProfile() {
  document.getElementById('pseudoInput').value = DB.profile.name || '';
  const soundOn = DB.profile.soundEnabled !== false;
  const zenOn = !!DB.profile.zenMode;
  const hardcoreOn = !!DB.profile.hardcoreMode;
  const sToggle = document.getElementById('soundToggle');
  const zToggle = document.getElementById('zenToggle');
  const hToggle = document.getElementById('hardcoreToggle');
  sToggle.textContent = soundOn ? 'ON' : 'OFF';
  sToggle.className = `pref-toggle ${soundOn ? 'on' : 'off'}`;
  zToggle.textContent = zenOn ? 'ON' : 'OFF';
  zToggle.className = `pref-toggle ${zenOn ? 'on' : 'off'}`;
  if (hToggle) {
    hToggle.textContent = hardcoreOn ? 'ON' : 'OFF';
    hToggle.className = `pref-toggle ${hardcoreOn ? 'on' : 'off'}`;
  }
  document.getElementById('profileModal').classList.add('open');
  setTimeout(() => document.getElementById('pseudoInput').focus(), 80);
}

function closeProfile() {
  document.getElementById('profileModal').classList.remove('open');
}

function saveProfileName() {
  DB.profile.name = document.getElementById('pseudoInput').value.trim();
  saveData();
  renderHeader();
  closeProfile();
}

function togglePref(pref) {
  if (pref === 'sound') {
    DB.profile.soundEnabled = DB.profile.soundEnabled === false ? true : false;
    const on = DB.profile.soundEnabled;
    const btn = document.getElementById('soundToggle');
    btn.textContent = on ? 'ON' : 'OFF';
    btn.className = `pref-toggle ${on ? 'on' : 'off'}`;
  } else if (pref === 'zen') {
    DB.profile.zenMode = !DB.profile.zenMode;
    const on = DB.profile.zenMode;
    const btn = document.getElementById('zenToggle');
    btn.textContent = on ? 'ON' : 'OFF';
    btn.className = `pref-toggle ${on ? 'on' : 'off'}`;
    if (on) {
      applyZenMode();
    } else {
      document.querySelectorAll('.habit-card.zen-collapse').forEach(el => {
        el.classList.remove('zen-collapse');
      });
    }
  } else if (pref === 'hardcore') {
    DB.profile.hardcoreMode = !DB.profile.hardcoreMode;
    const on = DB.profile.hardcoreMode;
    const btn = document.getElementById('hardcoreToggle');
    btn.textContent = on ? 'ON' : 'OFF';
    btn.className = `pref-toggle ${on ? 'on' : 'off'}`;
  }
  saveData();
}

function swMessage(type) {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
  navigator.serviceWorker.controller.postMessage({ type });
}

function initNotifications() {
  const on = !!DB.profile.notifsEnabled;
  const btn = document.getElementById('notifsToggle');
  if (btn) {
    btn.textContent = on ? 'ON' : 'OFF';
    btn.className   = `pref-toggle ${on ? 'on' : 'off'}`;
  }
  if (on && Notification.permission === 'granted') {
    swMessage('NOTIFS_RESCHEDULE');
  }
}

async function toggleNotifications() {
  const btn = document.getElementById('notifsToggle');

  if (!('Notification' in window)) {
    alert('Your browser does not support notifications.');
    return;
  }

  if (DB.profile.notifsEnabled) {
    DB.profile.notifsEnabled = false;
    btn.textContent = 'OFF';
    btn.className   = 'pref-toggle off';
    swMessage('NOTIFS_DISABLE');
    saveData();
    return;
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission === 'granted') {
    DB.profile.notifsEnabled = true;
    btn.textContent = 'ON';
    btn.className   = 'pref-toggle on';
    swMessage('NOTIFS_ENABLE');
    saveData();

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'NOTIFS_ENABLE' });
    }
    new Notification('🔔 HabitsTracker', {
      body: 'Notifications activated! Your habit reminders are now scheduled.',
      icon: './assets/icon-192.png',
    });
  } else {
    btn.textContent = 'OFF';
    btn.className   = 'pref-toggle off';
    alert('Notifications were blocked.\n\nTo enable them, go to your browser / Android settings and allow notifications for this site.');
  }
}
  if (confirm('⚠️ This will permanently delete ALL your habit data and cannot be undone.\n\nAre you sure?')) {
    localStorage.removeItem('ht_v2');
    location.reload();
  }

function jokersUsedThisMonth(habitId) {
  const monthKey = today().slice(0,7);
  const logs = DB.habits[habitId].logs;
  return Object.entries(logs)
    .filter(([date, s]) => date.startsWith(monthKey) && s === 'joker')
    .length;
}

function jokersAvailable(habit) {
  if (habit.type !== 'good') return 0;
  return Math.max(0, habit.jokerLimit - jokersUsedThisMonth(habit.id));
}

function isDayRequired(habit, dateObj) {
  return isDayActive(habit, dateObj);
}

function calcStreak(habit) {
  if (habit.type === 'weekly') {
    const streak = calcWeeklyStreak(habit);
    return { current: streak, longest: streak, jokersAvail: 0, jokersUsed: 0 };
  }

  const logs = DB.habits[habit.id].logs;
  const todayKey = today();
  const createdAt = DB.createdAt;

  if (habit.type === 'bad') {
    let streak = 0;
    let d = new Date();
    for (let i = 0; i < 730; i++) {
      const k = fmtDate(d);
      if (k < createdAt) break;
      if (!isDayActive(habit, d)) { d = addDays(d, -1); continue; }
      if (isBadFail(habit.id, k)) break;
      if (k <= todayKey) streak++;
      d = addDays(d, -1);
    }
    return { current: streak, longest: streak, jokersAvail: 0, jokersUsed: 0 };
  }

  const logDone = k => {
    if (habit.type === 'drink')   return isDrinkDone(k);
    if (habit.type === 'portion') return isPortionDone(k);
    if (habit.type === 'counter') return isCounterDone(habit, k);
    if (habit.type === 'shower')  return isShowerDone(k);
    const s = logs[k];
    return s === 'done' || s === 'joker';
  };

  const todayDone = logDone(todayKey);
  const todayObj = new Date();
  const todayInactive = !isDayActive(habit, todayObj);
  const todayEffectiveDone = todayDone || todayInactive;

  let d = new Date();
  if (!todayEffectiveDone) d = addDays(d, -1);

  let streak = 0;
  for (let i = 0; i < 730; i++) {
    const k = fmtDate(d);
    if (k < createdAt) break;
    if (!isDayActive(habit, d)) { d = addDays(d, -1); continue; }
    if (logDone(k)) { streak++; }
    else { break; }
    d = addDays(d, -1);
  }

  let best = 0, run = 0;
  let dd = new Date(parseDate(createdAt));
  while (fmtDate(dd) <= todayKey) {
    const k = fmtDate(dd);
    if (!isDayActive(habit, dd)) { dd = addDays(dd, 1); continue; }
    if (logDone(k)) { run++; best = Math.max(best, run); }
    else run = 0;
    dd = addDays(dd, 1);
  }

  return {
    current: streak,
    longest: Math.max(streak, best),
    jokersAvail: jokersAvailable(habit),
    jokersUsed: jokersUsedThisMonth(habit.id),
  };
}

function toggleHabit(id) {
  const habit = HABITS.find(h => h.id === id);
  const t = today();

  if (habit.type === 'drink')   { addDrink();           return; }
  if (habit.type === 'portion') { addPortion();         return; }
  if (habit.type === 'counter') { addCounter(id);       return; }
  if (habit.type === 'shower')  { cycleShower();        return; }

  if (habit.type === 'weekly') {
    const cur = DB.habits[id].logs[t];
    const completing = cur !== 'done';
    if (cur === 'done') delete DB.habits[id].logs[t];
    else DB.habits[id].logs[t] = 'done';
    if (completing) {
      giveXP(20);
      playSound('done');
    } else {
      playSound('undo');
    }
    saveData();
    checkAchievements();
    if (countDoneToday() === HABITS.filter(h => !h.optional).length) { launchConfetti(); playSound('fanfare'); checkPerfectDayBonus(); }
    renderAll();
    flashCard(id);
    return;
  }

  if (habit.type === 'bad') {
    if (habit.amounts) return;
    const cur = DB.habits[id].logs[t];
    if (cur === 'fail') {
      delete DB.habits[id].logs[t];
      playSound('undo');
    } else {
      DB.habits[id].logs[t] = 'fail';
      playSound('fail');
    }
  } else {
    const cur = DB.habits[id].logs[t];
    const completing = cur !== 'done';
    if (cur === 'done') {
      delete DB.habits[id].logs[t];
      playSound('undo');
    } else {
      DB.habits[id].logs[t] = 'done';
      giveXP(10);
      playSound('done');
    }
  }
  saveData();
  checkAchievements();
  if (countDoneToday() === HABITS.filter(h => !h.optional).length) { launchConfetti(); playSound('fanfare'); checkPerfectDayBonus(); }
  renderAll();
  flashCard(id);
}

function addDrink() {
  const t = today();
  const cur = getDrinkMl(t);
  const next = cur >= DRINK_MAX ? 0 : cur + DRINK_STEP;
  if (next === 0) {
    delete DB.habits['drink'].logs[t];
    playSound('undo');
  } else {
    DB.habits['drink'].logs[t] = next;
    if (next >= DRINK_GOAL && cur < DRINK_GOAL) {
      playSound('drink');
      giveXP(15);
    } else if (next < DRINK_GOAL) {
      playSound('done');
    }
  }
  saveData();
  checkAchievements();
  if (next >= DRINK_GOAL && cur < DRINK_GOAL) {
    if (countDoneToday() === HABITS.filter(h => !h.optional).length) { launchConfetti(); playSound('fanfare'); checkPerfectDayBonus(); }
    flashCard('drink');
  }
  renderAll();
}

function addPortion() {
  const t = today();
  const cur = getPortions(t);
  if (cur >= PORTION_MAX) {
    delete DB.habits['fruits'].logs[t];
    playSound('undo');
  } else {
    const next = cur + 1;
    DB.habits['fruits'].logs[t] = next;
    if (next >= PORTION_GOAL && cur < PORTION_GOAL) {
      playSound('drink');
      giveXP(12);
    } else {
      playSound('done');
    }
  }
  saveData();
  checkAchievements();
  const cur2 = getPortions(t);
  if (cur2 >= PORTION_GOAL) {
    if (countDoneToday() === HABITS.filter(h => !h.optional).length) { launchConfetti(); playSound('fanfare'); checkPerfectDayBonus(); }
    flashCard('fruits');
  }
  renderAll();
}

function addCounter(id) {
  const habit = HABITS.find(h => h.id === id);
  const t = today();
  const cur = getCounterVal(id, t);
  const next = cur >= habit.max ? 0 : cur + habit.step;
  if (next === 0) {
    delete DB.habits[id].logs[t];
    playSound('undo');
  } else {
    DB.habits[id].logs[t] = next;
    if (next >= habit.goal && cur < habit.goal) {
      giveXP(10);
      playSound('done');
    } else if (next < habit.goal) {
      playSound('done');
    }
  }
  saveData();
  checkAchievements();
  if (next >= habit.goal && cur < habit.goal) {
    if (countDoneToday() === HABITS.filter(h => !h.optional).length) { launchConfetti(); playSound('fanfare'); checkPerfectDayBonus(); }
    flashCard(id);
  }
  renderAll();
}

function selectBadAmount(id, amount) {
  const t = today();
  const cur = DB.habits[id].logs[t];
  if (cur === amount) {
    delete DB.habits[id].logs[t];
    playSound('undo');
  } else {
    DB.habits[id].logs[t] = amount;
    if (amount === 'no') {
      playSound('done');
    } else {
      playSound('fail');
    }
  }
  saveData();
  checkAchievements();
  if (countDoneToday() === HABITS.filter(h => !h.optional).length) { launchConfetti(); playSound('fanfare'); checkPerfectDayBonus(); }
  renderAll();
  flashCard(id);
}

function setShower(state) {
  const t = today();
  const cur = getShowerState(t);
  if (cur === state) {
    delete DB.habits['shower'].logs[t];
    playSound('undo');
  } else {
    DB.habits['shower'].logs[t] = state;
    if (state === 'cold') {
      giveXP(15); playSound('done');
    } else if (state === 'lukewarm') {
      giveXP(5); playSound('done');
    } else {
      playSound('fail');
    }
  }
  saveData();
  checkAchievements();
  if (isShowerDone(t)) {
    if (countDoneToday() === HABITS.filter(h => !h.optional).length) { launchConfetti(); playSound('fanfare'); checkPerfectDayBonus(); }
    flashCard('shower');
  }
  renderAll();
}

function cycleShower() {
  const t = today();
  const cur = getShowerState(t);
  const next = cur === null ? 'cold' : cur === 'cold' ? 'lukewarm' : cur === 'lukewarm' ? 'hot' : null;
  if (next === null) {
    delete DB.habits['shower'].logs[t];
    playSound('undo');
  } else {
    setShower(next); return;
  }
  saveData(); renderAll();
}

function useJoker(id) {
  const habit = HABITS.find(h => h.id === id);
  if (habit.type !== 'good') return;
  if (jokersAvailable(habit) <= 0) return;

  const yest = fmtDate(addDays(new Date(), -1));
  if (yest < DB.createdAt) return;
  const yestLog = DB.habits[id].logs[yest];
  if (yestLog !== 'done' && yestLog !== 'joker') {
    openJokerModal(id);
  }
}

function countDoneToday() {
  const t = today();
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  return HABITS.reduce((n, h) => {
    if (h.optional) return n;
    if (h.type === 'drink')   return n + (isDrinkDone(t) ? 1 : 0);
    if (h.type === 'portion') return n + (isPortionDone(t) ? 1 : 0);
    if (h.type === 'counter') return n + (isCounterDone(h, t) ? 1 : 0);
    if (h.type === 'shower')  return n + (isShowerDone(t) ? 1 : 0);
    if (h.type === 'weekly') {
      return n + (isWeeklyDoneForWeek(h.id, getWeekMonday(todayDate)) ? 1 : 0);
    }
    const s = DB.habits[h.id].logs[t];
    if (h.type === 'bad') return n + (!isBadFail(h.id, t) ? 1 : 0);
    return n + (s === 'done' || s === 'joker' ? 1 : 0);
  }, 0);
}

function flashCard(id) {
  const el = document.querySelector(`[data-habit="${id}"]`);
  if (el) { el.classList.remove('just-done'); void el.offsetWidth; el.classList.add('just-done'); }
}

function renderHeader() {
  const now = new Date();
  const h = now.getHours();
  const greetBase = h < 6 ? '🌙 Late night' : h < 12 ? '☀️ Good morning' : h < 18 ? '🌤 Good afternoon' : '🌙 Good evening';
  const name = DB.profile && DB.profile.name ? `, ${DB.profile.name}` : '';
  document.getElementById('greeting').textContent = greetBase + name;
  document.getElementById('subdate').textContent =
    `${DAY_FULL[now.getDay()]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;

  const done = countDoneToday();
  const total = HABITS.filter(h => !h.optional).length;
  const scoreEl = document.getElementById('scoreNum');
  scoreEl.textContent = `${done}/${total}`;
  scoreEl.style.color = done === total ? '#34d399' : done >= Math.ceil(total/2) ? '#fbbf24' : 'var(--text)';

  const xp = DB.xp || 0;
  const level = calcLevel(xp);
  const prog = xpProgress(xp);
  const levelName = LEVEL_NAMES[level - 1] || '';
  document.getElementById('xpLevel').textContent = `Lv.${level}`;
  document.getElementById('xpTotal').textContent = `${xp} XP`;
  document.getElementById('xpBarFill').style.width = `${prog.pct}%`;
  document.getElementById('xpNext').textContent = prog.needed > 0
    ? `${prog.needed} XP to ${LEVEL_NAMES[level] || 'max'}`
    : `${levelName} — Max Level`;
}

function renderHabits() {
  const t = today();
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);

  document.getElementById('habitsGrid').innerHTML = HABITS.map((h, i) => {
    const delay = `animation-delay:${i * .07}s`;

    if (h.type === 'drink') {
      const ml = getDrinkMl(t);
      const done = ml >= DRINK_GOAL;
      const pct = Math.min(100, Math.round((ml / DRINK_GOAL) * 100));
      const cardCls = done ? 'habit-card done' : 'habit-card';
      const btnText = done
        ? `✓ Goal! +250ml (${ml}ml)`
        : `+ 250ml`;
      return `<div class="${cardCls}" style="--hc:${h.color};${delay}"
                data-habit="${h.id}" onclick="addDrink()">
        <span class="h-emoji">${h.emoji}</span>
        <div class="h-name">${h.name}
          <span class="drink-amount">${ml} / ${DRINK_GOAL} ml</span>
        </div>
        <div class="drink-track">
          <div class="drink-fill" style="width:${pct}%;background:${h.color}"></div>
        </div>
        <button class="h-btn" onclick="event.stopPropagation(); addDrink()">${btnText}</button>
      </div>`;
    }

    if (h.type === 'weekly') {
      const weekMonday = getWeekMonday(todayDate);
      const weekDone = isWeeklyDoneForWeek(h.id, weekMonday);
      const cardCls = weekDone ? 'habit-card done' : 'habit-card';
      const btnText = weekDone ? '✓ Done this week!' : 'Mark done this week';
      return `<div class="${cardCls}" style="--hc:${h.color};${delay}"
                data-habit="${h.id}" onclick="toggleHabit('${h.id}')">
        <span class="h-emoji">${h.emoji}</span>
        <div class="h-name">${h.name}<span class="weekday-badge">Weekly</span></div>
        <button class="h-btn" onclick="event.stopPropagation(); toggleHabit('${h.id}')">${btnText}</button>
      </div>`;
    }

    if (h.type === 'bad') {
      const log = DB.habits[h.id].logs[t];
      const fail = isBadFail(h.id, t);
      let cardCls, btnText;
      if (fail) {
        cardCls = 'habit-card bad-fail';
        const labels = {
          noscroll: '❌ Scrolled today',
          nofilms:  '❌ Watched a film',
          nogaming: '❌ Gamed today',
          nosugar:  '❌ Had sugar today',
        };
        btnText = labels[h.id] || '❌ Failed today';
      } else {
        cardCls = 'habit-card bad-done';
        btnText = '✓ Clean today';
      }

      if (h.amounts) {
        const amountsHtml = h.amounts.map(a => {
          const val = a === 'No' ? 'no' : a;
          const sel = log === val;
          const isBad = a !== 'No';
          return `<button class="bad-amount-btn${sel ? ' selected' : ''}${isBad ? ' bad-amount-fail' : ' bad-amount-ok'}"
            onclick="event.stopPropagation();selectBadAmount('${h.id}','${val}')">${a}</button>`;
        }).join('');
        const unitLabel = h.id === 'nofilms' ? '': '';
        return `<div class="${cardCls}" style="--hc:${h.color};${delay}" data-habit="${h.id}">
          <span class="h-emoji">${h.emoji}</span>
          <div class="h-name">${h.name}${unitLabel ? `<span class="drink-amount">${unitLabel}</span>` : ''}</div>
          <div class="bad-amounts-row">${amountsHtml}</div>
        </div>`;
      }

      return `<div class="${cardCls}" style="--hc:${h.color};${delay}"
                data-habit="${h.id}" onclick="toggleHabit('${h.id}')">
        <span class="h-emoji">${h.emoji}</span>
        <div class="h-name">${h.name}</div>
        <button class="h-btn" onclick="event.stopPropagation(); toggleHabit('${h.id}')">${btnText}</button>
      </div>`;
    }

    if (h.type === 'shower') {
      const state = getShowerState(t);
      const SHOWER_MAP = {
        hot:      { label:'🥵 Hot',      color:'#f97316', cardCls:'shower-hot' },
        lukewarm: { label:'😐 Warm',     color:'#fbbf24', cardCls:'shower-warm' },
        cold:     { label:'🥶 Cold',     color:'#67e8f9', cardCls:'shower-cold' },
      };
      const cardExtra = state ? SHOWER_MAP[state].cardCls : '';
      return `<div class="habit-card ${cardExtra}" style="--hc:${state ? SHOWER_MAP[state].color : h.color};${delay}"
                data-habit="${h.id}">
        <span class="h-emoji">${h.emoji}</span>
        <div class="h-name">${h.name}${state ? `<span class="shower-state-badge" style="background:${SHOWER_MAP[state].color}20;color:${SHOWER_MAP[state].color};border-color:${SHOWER_MAP[state].color}40">${SHOWER_MAP[state].label}</span>` : ''}</div>
        <div class="shower-btns">
          <button class="shower-btn shower-hot-btn${state==='hot'?' active':''}"
            onclick="event.stopPropagation();setShower('hot')">🥵 Hot</button>
          <button class="shower-btn shower-warm-btn${state==='lukewarm'?' active':''}"
            onclick="event.stopPropagation();setShower('lukewarm')">😐 Warm</button>
          <button class="shower-btn shower-cold-btn${state==='cold'?' active':''}"
            onclick="event.stopPropagation();setShower('cold')">🥶 Cold</button>
        </div>
      </div>`;
    }

    if (h.type === 'counter') {
      const qty  = getCounterVal(h.id, t);
      const done = qty >= h.goal;
      const pct  = Math.min(100, Math.round((qty / h.goal) * 100));
      const cardCls = done ? 'habit-card done' : 'habit-card';
      const btnText = qty >= h.max ? `✓ Max! Reset` : done ? `✓ Goal! +1 more (${qty}/${h.max})` : `+ 1`;
      return `<div class="${cardCls}" style="--hc:${h.color};${delay}"
                data-habit="${h.id}" onclick="addCounter('${h.id}')">
        <span class="h-emoji">${h.emoji}</span>
        <div class="h-name">${h.name}
          <span class="drink-amount">${qty} / ${h.goal}</span>
        </div>
        <div class="drink-track">
          <div class="drink-fill" style="width:${pct}%;background:${h.color}"></div>
        </div>
        <button class="h-btn" onclick="event.stopPropagation(); addCounter('${h.id}')">${btnText}</button>
      </div>`;
    }

    if (h.type === 'portion') {
      const qty  = getPortions(t);
      const done = qty >= PORTION_GOAL;
      const pct  = Math.min(100, Math.round((qty / PORTION_GOAL) * 100));
      const cardCls = done ? 'habit-card done' : 'habit-card';
      const btnText = qty >= PORTION_MAX ? `✓ Max! Reset` : done ? `✓ Goal! +1 more (${qty})` : `+ 1 portion`;
      return `<div class="${cardCls}" style="--hc:${h.color};${delay}"
                data-habit="${h.id}" onclick="addPortion()">
        <span class="h-emoji">${h.emoji}</span>
        <div class="h-name">${h.name}
          <span class="drink-amount">${qty} / ${PORTION_GOAL} portions</span>
        </div>
        <div class="drink-track">
          <div class="drink-fill" style="width:${pct}%;background:${h.color}"></div>
        </div>
        <button class="h-btn" onclick="event.stopPropagation(); addPortion()">${btnText}</button>
      </div>`;
    }

    const log = DB.habits[h.id].logs[t];
    const done = log === 'done' || log === 'joker';
    const cardCls = done ? 'habit-card done' : 'habit-card';
    const btnText = done ? '✓ Completed!' : 'Mark as done';
    const pomoRunning = !!pomodoroTimers[h.id];
    const pomoHtml = pomoRunning
      ? `<div class="pomo-wrap"><div class="pomo-running">
          <svg class="pomo-ring" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--s4)" stroke-width="3"/>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="${h.color}" stroke-width="3"
              stroke-dasharray="${Math.round((1-(pomodoroTimers[h.id].remaining/POMO_DURATION))*100)} 100"
              stroke-linecap="round" transform="rotate(-90 18 18)" pathLength="100"/>
          </svg>
          <span class="pomo-time">${Math.floor(pomodoroTimers[h.id].remaining/60)}:${String(pomodoroTimers[h.id].remaining%60).padStart(2,'0')}</span>
          <button class="pomo-stop-btn" onclick="event.stopPropagation(); stopPomodoro('${h.id}')" title="Arrêter">✕</button>
        </div></div>`
      : `<div class="pomo-wrap"><button class="pomo-btn" onclick="event.stopPropagation(); startPomodoro('${h.id}')" title="Démarrer un Pomodoro (25 min)">⏱️</button></div>`;
      const schedBadge = h.activeDays ? '<span class="weekday-badge">Sun–Thu</span>'
        : h.weekdayOnly ? '<span class="weekday-badge">Mon–Fri</span>' : '';
      const optBadge = h.optional ? '<span class="weekday-badge" style="background:color-mix(in srgb,var(--hc) 15%,transparent);border-color:color-mix(in srgb,var(--hc) 35%,transparent);color:var(--hc)">Optional</span>' : '';
      return `<div class="${cardCls}" style="--hc:${h.color};${delay}"
              data-habit="${h.id}" onclick="toggleHabit('${h.id}')">
      <span class="h-emoji">${h.emoji}</span>
      <div class="h-name">${h.name}${schedBadge}${optBadge}</div>
      <div class="h-card-footer">
        <button class="h-btn" onclick="event.stopPropagation(); toggleHabit('${h.id}')">${btnText}</button>
        ${pomoHtml}
      </div>
    </div>`;
  }).join('');
}

function renderStreaks() {
  const yest = fmtDate(addDays(new Date(), -1));

  document.getElementById('streaksGrid').innerHTML = HABITS.map((h, i) => {
    const s = calcStreak(h);
    const delay = `animation-delay:${i * .07}s`;

    if (h.type === 'weekly') {
      return `<div class="streak-card" style="--hc:${h.color};${delay}">
        <div class="streak-top">
          <span class="streak-emoji">${h.emoji}</span>
          <span class="bad-badge" style="color:${h.color};background:color-mix(in srgb,${h.color} 14%,transparent);border-color:color-mix(in srgb,${h.color} 35%,transparent)">weekly</span>
        </div>
        <div class="streak-num">${s.current}</div>
        <div class="streak-sublabel">weeks in a row</div>
        <div class="streak-best">Best: ${s.longest} weeks</div>
      </div>`;
    }

    const yestLog = DB.habits[h.id].logs[yest];
    const canJoker = h.type === 'good'
      && s.jokersAvail > 0
      && yest >= DB.createdAt
      && yestLog !== 'done'
      && yestLog !== 'joker';

    const jokersHtml = h.type === 'good' ? `
      <div class="jokers-row">
        ${Array(h.jokerLimit).fill(0).map((_,k) =>
          `<div class="joker-pip ${k < s.jokersAvail ? 'available' : 'used'}">🃏</div>`
        ).join('')}
        <span style="font-size:.65rem;color:var(--muted);margin-left:2px">${s.jokersAvail}/${h.jokerLimit} this month</span>
      </div>
      <button class="joker-btn" onclick="useJoker('${h.id}')" ${canJoker ? '' : 'disabled'}>
        ${canJoker ? '🃏 Joker for yesterday' : yest < DB.createdAt ? '—' : yestLog === 'done' || yestLog === 'joker' ? '✓ Yesterday OK' : '0 joker left'}
      </button>` : '';

    const sublabelMap = {
      noscroll: 'days without scrolling',
      nofilms:  'days without films',
      nogaming: 'days without gaming',
      nosugar:  'days without sugar',
    };
    const sublabel = h.type === 'bad'
      ? (sublabelMap[h.id] || 'days clean')
      : h.type === 'drink'
        ? 'days hitting goal'
      : h.type === 'portion'
        ? 'days at 5+ portions'
      : h.type === 'shower'
        ? 'cold/warm showers'
        : (h.weekdayOnly || h.activeDays) ? 'scheduled days in a row' : 'day streak';

    return `<div class="streak-card" style="--hc:${h.color};${delay}">
      <div class="streak-top">
        <span class="streak-emoji">${h.emoji}</span>
        ${h.type === 'bad' ? '<span class="bad-badge">avoid</span>' : ''}
      </div>
      <div class="streak-num">${s.current}</div>
      <div class="streak-sublabel">${sublabel}</div>
      <div class="streak-best">Best: ${s.longest} days</div>
      ${jokersHtml}
    </div>`;
  }).join('');
}

function renderHeatmap() {
  const WEEKS = 16;
  const todayKey = today();
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);

  const alignedStart = (() => {
    const d = addDays(todayDate, -(WEEKS * 7 - 1));
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    return addDays(d, -dow);
  })();

  const container = document.getElementById('heatmapContainer');

  container.innerHTML = HABITS.map(habit => {
    const logs = DB.habits[habit.id].logs;
    const monthCells = [];
    for (let w = 0; w < WEEKS; w++) {
      const firstDay = addDays(alignedStart, w * 7);
      const m = firstDay.getMonth();
      const prev = w > 0 ? addDays(alignedStart, (w-1)*7).getMonth() : -1;
      monthCells.push(m !== prev ? MONTH_NAMES[m] : '');
    }

    const monthHtml = monthCells.map(label =>
      `<div class="hm-month-label" style="width:${14+3}px;flex-shrink:0">${label}</div>`
    ).join('');

    const dayLbls = ['M','','W','','F','','S'].map(l =>
      `<div class="hm-day-lbl">${l}</div>`
    ).join('');

    const streak = calcStreak(habit);
    let weeksHtml = '';

    for (let w = 0; w < WEEKS; w++) {
      weeksHtml += '<div class="hm-week">';
      for (let d = 0; d < 7; d++) {
        const date = addDays(alignedStart, w*7 + d);
        const k = fmtDate(date);
        const isFuture = date > todayDate;
        const isPre = k < DB.createdAt;

        if (isFuture || isPre) {
          const border = isFuture ? '1px solid #1e2740' : 'none';
          const tooltipTxt = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}${isFuture ? ' (upcoming)' : ''}`;
          weeksHtml += `<div class="hm-cell" style="background:transparent;border:${border}" data-tip="${tooltipTxt}"></div>`;
          continue;
        }

        if (habit.type === 'weekly') {
          const weekMonday = getWeekMonday(date);
          const isCurrentWeek = weekMonday === getWeekMonday(todayDate);
          const weekDone = isWeeklyDoneForWeek(habit.id, weekMonday);
          const specificDayDone = logs[k] === 'done';
          let bg, opacity = 1;
          if (weekDone) {
            bg = specificDayDone ? habit.color : habit.color + '55';
          } else if (isCurrentWeek) {
            bg = '#1e2740'; opacity = 0.6;
          } else {
            bg = '#f87171'; opacity = 0.5;
          }
          const statusLabel = weekDone ? (specificDayDone ? '✓ logged' : '✓ week done') : isCurrentWeek ? '— ongoing' : '✗ missed';
          const tip = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()} — ${statusLabel}`;
          weeksHtml += `<div class="hm-cell" style="background:${bg};opacity:${opacity}"
            onmouseenter="tipShow(event,'${tip}')"
            onmouseleave="tipHide()"></div>`;
          continue;
        }

        const log = logs[k];

        if (habit.type === 'drink') {
          const ml = typeof log === 'number' ? log : (log === 'done' ? DRINK_GOAL : 0);
          let bg, opacity = 1;
          let statusLabel;
          if (ml >= DRINK_GOAL) {
            bg = habit.color;
            statusLabel = `✓ ${ml}ml`;
          } else if (ml > 0) {
            bg = habit.color + '66';
            statusLabel = `⚠ ${ml}ml`;
          } else {
            bg = '#1e2740'; opacity = 0.6;
            statusLabel = '—';
          }
          const tip = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()} — ${statusLabel}`;
          weeksHtml += `<div class="hm-cell" style="background:${bg};opacity:${opacity}"
            onmouseenter="tipShow(event,'${tip}')"
            onmouseleave="tipHide()"></div>`;
          continue;
        }

        if (habit.type === 'portion') {
          const qty = typeof log === 'number' ? log : 0;
          let bg, opacity = 1, statusLabel;
          if (qty >= PORTION_GOAL) {
            bg = habit.color; statusLabel = `✓ ${qty} portions`;
          } else if (qty > 0) {
            bg = habit.color + '55'; statusLabel = `⚠ ${qty} portions`;
          } else {
            bg = '#1e2740'; opacity = 0.6; statusLabel = '—';
          }
          const tip = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()} — ${statusLabel}`;
          weeksHtml += `<div class="hm-cell" style="background:${bg};opacity:${opacity}"
            onmouseenter="tipShow(event,'${tip}')"
            onmouseleave="tipHide()"></div>`;
          continue;
        }

        if (habit.type === 'shower') {
          const SHOWER_COLORS = { cold:'#67e8f9', lukewarm:'#fbbf24', hot:'#f97316' };
          const SHOWER_LABELS = { cold:'🥶 Cold', lukewarm:'😐 Warm', hot:'🥵 Hot' };
          const bg = log ? SHOWER_COLORS[log] : '#1e2740';
          const opacity = log ? 1 : 0.6;
          const statusLabel = log ? SHOWER_LABELS[log] : '—';
          const tip = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()} — ${statusLabel}`;
          weeksHtml += `<div class="hm-cell" style="background:${bg};opacity:${opacity}"
            onmouseenter="tipShow(event,'${tip}')"
            onmouseleave="tipHide()"></div>`;
          continue;
        }

        if (habit.type === 'counter') {
          const qty = getCounterVal(habit.id, k);
          let bg, opacity = 1, statusLabel;
          if (qty >= habit.goal) {
            bg = habit.color; statusLabel = `✓ ${qty}/${habit.goal}`;
          } else if (qty > 0) {
            bg = habit.color + '55'; statusLabel = `⚠ ${qty}/${habit.goal}`;
          } else {
            bg = '#1e2740'; opacity = 0.6; statusLabel = '—';
          }
          const tip = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()} — ${statusLabel}`;
          weeksHtml += `<div class="hm-cell" style="background:${bg};opacity:${opacity}"
            onmouseenter="tipShow(event,'${tip}')"
            onmouseleave="tipHide()"></div>`;
          continue;
        }

        if (!isDayActive(habit, date)) {
          const tip = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()} — rest day ✦`;
          weeksHtml += `<div class="hm-cell hm-cell-off"
            style="background:#111520;border:1px dashed #1e2740;opacity:0.5"
            onmouseenter="tipShow(event,'${tip}')"
            onmouseleave="tipHide()"></div>`;
          continue;
        }

        let status;
        if (habit.type === 'bad') {
          status = isBadFail(habit.id, k) ? 'fail' : 'done';
        } else if (habit.type === 'counter') {
          status = isCounterDone(habit, k) ? 'done' : (getCounterVal(habit.id, k) > 0 ? 'joker' : 'miss');
        } else {
          status = log === 'done' ? 'done' : log === 'joker' ? 'joker' : 'miss';
        }

        const bg = status === 'done'  ? habit.color
                 : status === 'joker' ? '#fb923c'
                 : status === 'fail'  ? '#f87171'
                 : '#1e2740';
        const opacity = status === 'miss' ? 0.6 : 1;
        const statusLabel = status === 'done'  ? '✓ clean'
                          : status === 'joker' ? '🃏'
                          : status === 'fail'  ? (habit.amounts ? `✗ ${DB.habits[habit.id].logs[k]}` : '✗')
                          : '—';
        const tip = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()} — ${statusLabel}`;

        weeksHtml += `<div class="hm-cell" style="background:${bg};opacity:${opacity}"
          data-tip="${tip}"
          onmouseenter="tipShow(event,'${tip}')"
          onmouseleave="tipHide()"></div>`;
      }
      weeksHtml += '</div>';
    }

    const badgeStyle = `color:${habit.color};border-color:color-mix(in srgb,${habit.color} 35%,transparent);background:color-mix(in srgb,${habit.color} 10%,transparent)`;
    const streakLabel = habit.type === 'weekly' ? 'wk. streak'
      : habit.type === 'bad' ? 'd. clean'
      : (habit.weekdayOnly || habit.activeDays) ? 'sched. streak' : 'd. streak';

    return `
      <div class="heatmap-item">
        <div class="heatmap-meta">
          <span>${habit.emoji}</span>
          <span class="hm-name">${habit.name}</span>
          <span class="hm-streak-badge" style="${badgeStyle}">${streak.current} ${streakLabel}</span>
        </div>
        <div class="hm-months" style="display:flex;gap:3px;margin-bottom:3px;padding-left:22px">${monthHtml}</div>
        <div class="hm-wrapper">
          <div class="hm-day-labels">${dayLbls}</div>
          <div class="hm-grid">${weeksHtml}</div>
        </div>
      </div>`;
  }).join('');
}

const tip = document.getElementById('tooltip');

function tipShow(e, text) {
  tip.textContent = text;
  tip.classList.add('show');
  tipMove(e);
}
function tipHide() { tip.classList.remove('show'); }
function tipMove(e) {
  tip.style.left = (e.clientX + 14) + 'px';
  tip.style.top  = (e.clientY - 36) + 'px';
}
document.addEventListener('mousemove', e => {
  if (tip.classList.contains('show')) tipMove(e);
});

function drawLineChart() {
  const canvas = document.getElementById('lineChart');
  const W = canvas.parentElement.clientWidth - 36;
  const H = 200;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const DAYS = 30;
  const todayKey = today();
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);

  const habitSeries = HABITS.map(h => {
    const pts = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = addDays(todayDate, -i);
      const k = fmtDate(d);
      if (k > todayKey || k < DB.createdAt) { pts.push(null); continue; }
      if (!isDayActive(h, d)) { pts.push(1); continue; }
      pts.push(getHabitDayValue(h, k, d));
    }
    return { habit: h, pts };
  });

  const smooth = pts => pts.map((v, i) => {
    if (v === null) return null;
    const win = [pts[i-1], v, pts[i+1]].filter(x => x !== null && x !== undefined);
    return win.reduce((a,b)=>a+b,0) / win.length;
  });

  const pad = { t:10, r:10, b:30, l:38 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = '#1e2740'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + cH * (1 - i/4);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    ctx.fillStyle = '#2c3b5a';
    ctx.font = '9px DM Mono, monospace'; ctx.textAlign = 'right';
    ctx.fillText(`${i*25}%`, pad.l - 5, y + 3);
  }

  for (let i = 0; i < DAYS; i += 5) {
    const d = addDays(todayDate, -(DAYS-1-i));
    const x = pad.l + (i / (DAYS-1)) * cW;
    ctx.fillStyle = '#2c3b5a';
    ctx.font = '9px DM Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${d.getDate()}/${d.getMonth()+1}`, x, H - 5);
  }

  habitSeries.forEach(({ habit, pts }) => {
    const sp = smooth(pts);
    const validPts = sp.map((v, i) => v === null ? null : {
      x: pad.l + (i / (DAYS-1)) * cW,
      y: pad.t + cH * (1 - v),
    });

    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
    grad.addColorStop(0, habit.color + '25');
    grad.addColorStop(1, habit.color + '00');

    ctx.beginPath();
    let started = false;
    const bottom = pad.t + cH;
    let lastX = pad.l;
    validPts.forEach(p => {
      if (!p) return;
      if (!started) { ctx.moveTo(p.x, bottom); ctx.lineTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
      lastX = p.x;
    });
    if (started) { ctx.lineTo(lastX, bottom); ctx.closePath(); }
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    started = false;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    validPts.forEach(p => {
      if (!p) { started = false; return; }
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  });

  document.getElementById('lineChartLegend').innerHTML = HABITS.map(h =>
    `<div class="chart-legend-item">
      <div class="chart-legend-dot" style="background:${h.color}"></div>
      <span>${h.emoji} ${h.name}</span>
    </div>`
  ).join('');
}

function drawDayChart() {
  const canvas = document.getElementById('dayChart');
  const W = canvas.parentElement.clientWidth - 36;
  const H = 200;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);

  const stats = Array(7).fill(0).map(() => ({ done: 0, total: 0 }));

  for (let i = 0; i < 84; i++) {
    const d = addDays(todayDate, -i);
    const k = fmtDate(d);
    if (k < DB.createdAt) continue;
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;

    HABITS.forEach(h => {
      if (!isDayActive(h, d)) return;
      const val = getHabitDayValue(h, k, d);
      stats[dow].done  += val;
      stats[dow].total += 1;
    });
  }

  const pad = { t:10, r:10, b:30, l:38 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = '#1e2740'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + cH * (1 - i/4);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    ctx.fillStyle = '#2c3b5a';
    ctx.font = '9px DM Mono, monospace'; ctx.textAlign = 'right';
    ctx.fillText(`${i*25}%`, pad.l - 5, y + 3);
  }

  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const barW = (cW / 7) * 0.6;
  const barSpacing = cW / 7;

  stats.forEach((stat, i) => {
    const rate = stat.total > 0 ? stat.done / stat.total : 0;
    const bH = cH * rate;
    const x = pad.l + i * barSpacing + (barSpacing - barW) / 2;
    const y = pad.t + cH - bH;
    const color = rate >= 0.75 ? '#34d399' : rate >= 0.45 ? '#fbbf24' : stat.total === 0 ? '#1e2740' : '#f87171';

    if (bH > 0) {
      const r = Math.min(4, bH / 2);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y + bH);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.lineTo(x + barW - r, y);
      ctx.arcTo(x + barW, y, x + barW, y + r, r);
      ctx.lineTo(x + barW, y + bH);
      ctx.closePath();
      ctx.fill();

      if (bH > 14 && stat.total > 0) {
        ctx.fillStyle = '#07090f';
        ctx.font = 'bold 8px DM Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(rate*100)+'%', x + barW/2, y + 10);
      }
    } else {
      ctx.fillStyle = '#1e2740';
      ctx.fillRect(x, pad.t + cH - 2, barW, 2);
    }

    ctx.fillStyle = '#2c3b5a';
    ctx.font = '9px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW/2, H - 7);
  });
}

function drawHabitCharts() {
  const container = document.getElementById('habitChartsGrid');
  if (!container) return;

  const DAYS = 30;
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  const todayKey = today();

  container.innerHTML = HABITS.map((h, idx) => `
    <div class="chart-card habit-mini-chart" style="animation-delay:${idx * .06}s">
      <div class="chart-title" style="color:${h.color}">${h.emoji} ${h.name}</div>
      <div class="habit-chart-meta" id="hcMeta_${h.id}"></div>
      <canvas id="hc_${h.id}"></canvas>
    </div>
  `).join('');

  HABITS.forEach(habit => {
    const canvas = document.getElementById(`hc_${habit.id}`);
    if (!canvas) return;
    const W = canvas.parentElement.clientWidth - 36;
    const H = 100;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const pts = [];
    let successCount = 0;
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = addDays(todayDate, -i);
      const k = fmtDate(d);
      if (k > todayKey || k < DB.createdAt) { pts.push(null); continue; }
      if (!isDayActive(habit, d)) { pts.push(null); continue; }
      const val = getHabitDayValue(habit, k, d);
      pts.push(val);
      if (val === 1) successCount++;
    }

    const validCount = pts.filter(p => p !== null).length;
    const rate = validCount > 0 ? Math.round((successCount / validCount) * 100) : 0;

    const metaEl = document.getElementById(`hcMeta_${habit.id}`);
    if (metaEl) {
      const col = rate >= 75 ? '#34d399' : rate >= 45 ? '#fbbf24' : '#f87171';
      metaEl.innerHTML = `<span style="font-family:'DM Mono',monospace;font-size:.9rem;font-weight:600;color:${col}">${rate}%</span>
        <span style="font-size:.7rem;color:var(--muted);margin-left:6px">last 30 days</span>`;
    }

    const pad = { t:6, r:4, b:4, l:4 };
    const cW = W - pad.l - pad.r;
    const cH = H - pad.t - pad.b;
    const barW = Math.max(2, cW / DAYS - 2);
    const gap = (cW - barW * DAYS) / (DAYS - 1);

    ctx.clearRect(0, 0, W, H);

    pts.forEach((v, i) => {
      const x = pad.l + i * (barW + gap);
      if (v === null) {
        ctx.fillStyle = '#1e2740';
        ctx.fillRect(x, pad.t + cH - 2, barW, 2);
        return;
      }
      if (v === 1) {
        const bH = cH * 0.85;
        const y = pad.t + cH - bH;
        const r = Math.min(2, bH / 2);
        ctx.fillStyle = habit.color + 'cc';
        ctx.beginPath();
        ctx.moveTo(x, y + bH);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.lineTo(x + barW - r, y);
        ctx.arcTo(x + barW, y, x + barW, y + r, r);
        ctx.lineTo(x + barW, y + bH);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#f87171' + '55';
        ctx.fillRect(x, pad.t + cH - Math.max(2, cH * 0.2), barW, Math.max(2, cH * 0.2));
      }
    });

    const smoothed = pts.map((v, i) => {
      if (v === null) return null;
      const win = [pts[i-1], v, pts[i+1]].filter(x => x !== null && x !== undefined);
      return win.reduce((a,b)=>a+b,0) / win.length;
    });

    ctx.beginPath();
    let started = false;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.setLineDash([3, 2]);
    smoothed.forEach((v, i) => {
      if (v === null) { started = false; return; }
      const x = pad.l + i * (barW + gap) + barW / 2;
      const y = pad.t + cH * (1 - v * 0.85);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

function drawRadarChart() {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;

  const size = Math.min(canvas.parentElement.clientWidth - 20, 380);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const N = HABITS.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  const DAYS = 30;
  const todayKey = today();

  const rates = HABITS.map(habit => {
    let success = 0, total = 0;
    for (let i = 0; i < DAYS; i++) {
      const d = addDays(todayDate, -i);
      const k = fmtDate(d);
      if (k < DB.createdAt) continue;
      if (!isDayActive(habit, d)) continue;
      success += getHabitDayValue(habit, k, d);
      total++;
    }
    return total > 0 ? success / total : 0;
  });

  ctx.clearRect(0, 0, size, size);

  const levels = [0.25, 0.5, 0.75, 1.0];
  levels.forEach((lvl, li) => {
    ctx.beginPath();
    HABITS.forEach((_, i) => {
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
      const r = maxR * lvl;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = li === 3 ? '#28375a' : '#1e2740';
    ctx.lineWidth = li === 3 ? 1.5 : 1;
    ctx.stroke();
    ctx.fillStyle = li % 2 === 0 ? 'rgba(22,28,44,0.3)' : 'transparent';
    ctx.fill();

    const labelAngle = -Math.PI / 2;
    const lx = cx + Math.cos(labelAngle) * (maxR * lvl);
    const ly = cy + Math.sin(labelAngle) * (maxR * lvl);
    ctx.fillStyle = '#2c3b5a';
    ctx.font = '8px DM Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(lvl * 100)}%`, lx, ly - 3);
  });

  HABITS.forEach((_, i) => {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
    ctx.strokeStyle = '#1e2740';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  grad.addColorStop(0, 'rgba(129,140,248,0.35)');
  grad.addColorStop(1, 'rgba(52,211,153,0.08)');

  ctx.beginPath();
  HABITS.forEach((habit, i) => {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
    const r = maxR * Math.max(0.02, rates[i]);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  HABITS.forEach((habit, i) => {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
    const r = maxR * Math.max(0.02, rates[i]);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = habit.color;
    ctx.fill();
    ctx.strokeStyle = '#07090f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  HABITS.forEach((habit, i) => {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
    const labelR = maxR + 26;
    const x = cx + Math.cos(angle) * labelR;
    const y = cy + Math.sin(angle) * labelR;

    ctx.font = '11px DM Sans, sans-serif';
    ctx.fillStyle = habit.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(habit.emoji, x, y - 7);

    ctx.font = '9px DM Sans, sans-serif';
    ctx.fillStyle = '#56698f';
    ctx.fillText(habit.name, x, y + 7);

    const pct = Math.round(rates[i] * 100);
    ctx.font = 'bold 9px DM Mono, monospace';
    ctx.fillStyle = pct >= 75 ? '#34d399' : pct >= 45 ? '#fbbf24' : '#f87171';
    ctx.fillText(`${pct}%`, x, y + 18);
  });
}

let confettiRunning = false;
function launchConfetti() {
  if (confettiRunning) return;
  confettiRunning = true;
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#34d399','#818cf8','#fbbf24','#e879f9','#fb923c','#60a5fa','#38bdf8','#a78bfa'];
  const pieces = Array.from({length:80}, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    r: 3 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - .5) * 4,
    vy: 2 + Math.random() * 4,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - .5) * .2,
    alpha: 1,
  }));

  let frame = 0;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (frame > 60) p.alpha -= .015;
      if (p.alpha <= 0 || p.y > canvas.height) return;
      alive++;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r, p.r*2, p.r*2);
      ctx.restore();
    });
    frame++;
    if (alive > 0) requestAnimationFrame(tick);
    else { ctx.clearRect(0,0,canvas.width,canvas.height); confettiRunning = false; }
  };
  requestAnimationFrame(tick);
}

function renderAll() {
  renderHeader();
  renderHabits();
  applyZenMode();
  renderStreaks();
  renderAchievements();
  renderMoodSection();
  renderHeatmap();
  drawLineChart();
  drawDayChart();
  drawHabitCharts();
  drawRadarChart();
}

renderAll();
checkAchievements();
checkDailyMood();
checkDailyPenalties();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => initNotifications());
} else {
  initNotifications();
}

setInterval(() => {
  const n = new Date();
  if (n.getHours() === 0 && n.getMinutes() === 0) renderAll();
}, 60000);

window.addEventListener('resize', () => {
  drawLineChart();
  drawDayChart();
  drawHabitCharts();
  drawRadarChart();
});