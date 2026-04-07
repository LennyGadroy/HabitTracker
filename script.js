const HABITS = [
  { id:'projets',  name:'Projets perso',          emoji:'🚀', type:'good', color:'#e879f9', jokerLimit:3 },
  { id:'gym',     name:'Salle',                 emoji:'🏋️', type:'good', color:'#34d399', jokerLimit:3 },
  { id:'work',     name:'Work',                   emoji:'💼', type:'good', color:'#fbbf24', jokerLimit:3 },
  { id:'nofilms',  name:'Pas de films',            emoji:'🎬', type:'bad',  color:'#f87171', jokerLimit:0 },
];

const MONTH_NAMES = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];
const DAY_FR   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const DAY_FULL = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

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

function loadData() {
  try {
    const raw = localStorage.getItem('ht_v2');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  const d = { createdAt: today(), habits: {} };
  HABITS.forEach(h => d.habits[h.id] = { logs: {} });
  return d;
}

function saveData() {
  localStorage.setItem('ht_v2', JSON.stringify(DB));
}

let DB = loadData();
HABITS.forEach(h => { if (!DB.habits[h.id]) DB.habits[h.id] = { logs: {} }; });
if (!DB.createdAt) DB.createdAt = today();

function jokersUsedThisMonth(habitId) {
  const monthKey = today().slice(0,7);
  const logs = DB.habits[habitId].logs;
  return Object.entries(logs)
    .filter(([date, s]) => date.startsWith(monthKey) && s === 'joker')
    .length;
}

function jokersAvailable(habit) {
  if (habit.type === 'bad') return 0;
  return Math.max(0, habit.jokerLimit - jokersUsedThisMonth(habit.id));
}

function calcStreak(habit) {
  const logs = DB.habits[habit.id].logs;
  const todayKey = today();
  const createdAt = DB.createdAt;

  if (habit.type === 'bad') {
    let streak = 0;
    let d = new Date();
    for (let i = 0; i < 730; i++) {
      const k = fmtDate(d);
      if (k < createdAt) break;
      if (logs[k] === 'fail') break;
      if (k <= todayKey) streak++;
      d = addDays(d, -1);
    }
    return { current: streak, longest: streak, jokersAvail: 0, jokersUsed: 0 };
  }

  const todayStatus = logs[todayKey];
  const todayDone = todayStatus === 'done' || todayStatus === 'joker';

  let d = new Date();
  if (!todayDone) d = addDays(d, -1);

  let streak = 0;
  for (let i = 0; i < 730; i++) {
    const k = fmtDate(d);
    if (k < createdAt) break;
    const s = logs[k];
    if (s === 'done' || s === 'joker') {
      streak++;
    } else {
      break;
    }
    d = addDays(d, -1);
  }

  let best = 0, run = 0;
  const allDates = Object.keys(logs).sort();
  if (allDates.length > 0) {
    const first = parseDate(allDates[0]);
    const last  = new Date();
    let dd = new Date(first);
    while (fmtDate(dd) <= fmtDate(last)) {
      const k = fmtDate(dd);
      const s = logs[k];
      if (s === 'done' || s === 'joker') { run++; best = Math.max(best, run); }
      else run = 0;
      dd = addDays(dd, 1);
    }
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
  const cur = DB.habits[id].logs[t];

  if (habit.type === 'bad') {
    if (cur === 'fail') delete DB.habits[id].logs[t];
    else DB.habits[id].logs[t] = 'fail';
  } else {
    if (cur === 'done') delete DB.habits[id].logs[t];
    else DB.habits[id].logs[t] = 'done';
  }
  saveData();

  const doneCount = countDoneToday();
  if (doneCount === HABITS.length) launchConfetti();

  renderAll();
  flashCard(id);
}

function useJoker(id) {
  const habit = HABITS.find(h => h.id === id);
  if (habit.type === 'bad') return;
  if (jokersAvailable(habit) <= 0) return;

  const yest = fmtDate(addDays(new Date(), -1));
  if (yest < DB.createdAt) return;
  if (DB.habits[id].logs[yest] !== 'done' && DB.habits[id].logs[yest] !== 'joker') {
    DB.habits[id].logs[yest] = 'joker';
    saveData();
    renderAll();
  }
}

function countDoneToday() {
  const t = today();
  return HABITS.reduce((n, h) => {
    const s = DB.habits[h.id].logs[t];
    if (h.type === 'bad') return n + (s !== 'fail' ? 1 : 0);
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
  const greet = h < 6 ? '🌙 Nuit calme' : h < 12 ? '☀️ Bonjour' : h < 18 ? '🌤 Bonne après-midi' : '🌙 Bonsoir';
  document.getElementById('greeting').textContent = greet;
  document.getElementById('subdate').textContent =
    `${DAY_FULL[now.getDay()]} ${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  const done = countDoneToday();
  const total = HABITS.length;
  const scoreEl = document.getElementById('scoreNum');
  scoreEl.textContent = `${done}/${total}`;
  scoreEl.style.color = done === total ? '#34d399' : done >= 3 ? '#fbbf24' : 'var(--text)';
}

function renderHabits() {
  const t = today();
  document.getElementById('habitsGrid').innerHTML = HABITS.map((h, i) => {
    const log = DB.habits[h.id].logs[t];
    let cardCls, btnText;

    if (h.type === 'bad') {
      if (log === 'fail') {
        cardCls = 'habit-card bad-fail'; btnText = '❌ Film regardé';
      } else {
        cardCls = 'habit-card bad-done'; btnText = '✓ Clean aujourd\'hui';
      }
    } else {
      const done = log === 'done' || log === 'joker';
      cardCls = done ? 'habit-card done' : 'habit-card';
      btnText = done ? '✓ Complété !' : 'Marquer comme fait';
    }

    return `<div class="${cardCls}" style="--hc:${h.color}; animation-delay:${i * .07}s"
              data-habit="${h.id}" onclick="toggleHabit('${h.id}')">
      <span class="h-emoji">${h.emoji}</span>
      <div class="h-name">${h.name}</div>
      <button class="h-btn" onclick="event.stopPropagation(); toggleHabit('${h.id}')">${btnText}</button>
    </div>`;
  }).join('');
}

function renderStreaks() {
  const yest = fmtDate(addDays(new Date(), -1));

  document.getElementById('streaksGrid').innerHTML = HABITS.map((h, i) => {
    const s = calcStreak(h);
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
        <span style="font-size:.65rem;color:var(--muted);margin-left:2px">${s.jokersAvail}/${h.jokerLimit} ce mois</span>
      </div>
      <button class="joker-btn" onclick="useJoker('${h.id}')" ${canJoker ? '' : 'disabled'}>
        ${canJoker ? '🃏 Joker pour hier' : yest < DB.createdAt ? '—' : yestLog === 'done' || yestLog === 'joker' ? '✓ Hier OK' : '0 joker restant'}
      </button>` : '';

    return `<div class="streak-card" style="--hc:${h.color}; animation-delay:${i * .07}s">
      <div class="streak-top">
        <span class="streak-emoji">${h.emoji}</span>
        ${h.type === 'bad' ? '<span class="bad-badge">à éviter</span>' : ''}
      </div>
      <div class="streak-num">${s.current}</div>
      <div class="streak-sublabel">${h.type === 'bad' ? 'jours sans film' : 'jours consécutifs'}</div>
      <div class="streak-best">Record : ${s.longest} j.</div>
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

    const dayLbls = ['L','','M','','J','','D'].map(l =>
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

        let bg, title;
        if (isFuture || isPre) {
          bg = 'transparent';
          const border = isFuture ? '1px solid #1e2740' : 'none';
          const tooltipTxt = `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}${isFuture ? ' (à venir)' : ''}`;
          weeksHtml += `<div class="hm-cell" style="background:${bg};border:${border}" data-tip="${tooltipTxt}"></div>`;
          continue;
        }

        const log = logs[k];
        let status;
        if (habit.type === 'bad') {
          status = log === 'fail' ? 'fail' : 'done';
        } else {
          status = log === 'done' ? 'done' : log === 'joker' ? 'joker' : 'miss';
        }

        bg = status === 'done'   ? habit.color
           : status === 'joker' ? '#fb923c'
           : status === 'fail'  ? '#f87171'
           : '#1e2740';

        const opacity = status === 'done' ? 1 : status === 'miss' ? 0.6 : 1;
        const statusLabel = status === 'done' ? '✓' : status === 'joker' ? '🃏' : status === 'fail' ? '✗' : '—';
        const tip = `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} — ${statusLabel}`;

        weeksHtml += `<div class="hm-cell" style="background:${bg};opacity:${opacity}"
          data-tip="${tip}"
          onmouseenter="tipShow(event,'${tip}')"
          onmouseleave="tipHide()"></div>`;
      }
      weeksHtml += '</div>';
    }

    const badgeStyle = `color:${habit.color};border-color:color-mix(in srgb,${habit.color} 35%,transparent);background:color-mix(in srgb,${habit.color} 10%,transparent)`;
    return `
      <div class="heatmap-item">
        <div class="heatmap-meta">
          <span>${habit.emoji}</span>
          <span class="hm-name">${habit.name}</span>
          <span class="hm-streak-badge" style="${badgeStyle}">${streak.current} ${habit.type === 'bad' ? 'j. clean' : 'j. streak'}</span>
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
      const log = DB.habits[h.id].logs[k];
      let val;
      if (h.type === 'bad') val = log === 'fail' ? 0 : 1;
      else val = (log === 'done' || log === 'joker') ? 1 : 0;
      pts.push(val);
    }
    return { habit: h, pts };
  });

  const smooth = pts => pts.map((v, i) => {
    if (v === null) return null;
    const window = [pts[i-1], v, pts[i+1]].filter(x => x !== null && x !== undefined);
    return window.reduce((a,b)=>a+b,0) / window.length;
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
    ctx.strokeStyle = habit.color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
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
      const log = DB.habits[h.id].logs[k];
      let done;
      if (h.type === 'bad') done = log !== 'fail';
      else done = log === 'done' || log === 'joker';
      stats[dow].done  += done ? 1 : 0;
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

  const labels = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
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

let confettiRunning = false;
function launchConfetti() {
  if (confettiRunning) return;
  confettiRunning = true;
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#34d399','#818cf8','#fbbf24','#e879f9','#fb923c','#60a5fa'];
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
  renderStreaks();
  renderHeatmap();
  drawLineChart();
  drawDayChart();
}

renderAll();

setInterval(() => {
  const n = new Date();
  if (n.getHours() === 0 && n.getMinutes() === 0) renderAll();
}, 60000);

window.addEventListener('resize', () => { drawLineChart(); drawDayChart(); });