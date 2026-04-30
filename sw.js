const CACHE_VERSION = 'ht-v2';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const PRECACHE_ASSETS = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-512-maskable.png',
  './assets/apple-touch-icon.png',
];

const CACHEABLE_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

const NOTIF_SCHEDULE = [
  {
    id: 'sleep',
    title: '💤 Bedtime — 22h',
    body:  'Wind down and protect your streak. Lights off — a good night starts now.',
    hour: 22, minute: 0,
    days: [1, 2, 3, 4, 5],
  },
  {
    id: 'projets',
    title: '🚀 Project time — 20h',
    body:  'Your daily creative session is waiting. Even 30 focused minutes moves the needle.',
    hour: 20, minute: 0,
    days: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'gym',
    title: '🏋️ Rise & grind — 5h50',
    body:  'Morning session time. Get up and crush it before the rest of the world wakes up.',
    hour: 5, minute: 50,
    days: [1, 2, 3, 4, 5],
  },
  {
    id: 'running',
    title: '🏃 Time to run — 17h30',
    body:  'Lace up! Your evening run is on the schedule. No excuses, just miles.',
    hour: 17, minute: 30,
    days: [1, 2, 3, 4, 5],
  },
  {
    id: 'work',
    title: '💼 Work mode — 8h30',
    body:  'Deep focus session starting. Phone down, notifications off, flow state on.',
    hour: 8, minute: 30,
    days: [1, 2, 3, 4, 5],
  },
  {
    id: 'cleaning',
    title: '🧹 Sunday clean — 18h',
    body:  'Weekly reset time. A clean space = a clear head for the week ahead.',
    hour: 18, minute: 0,
    days: [0],
  },
  {
    id: 'nofilms',
    title: '🎬 No films tonight — 21h',
    body:  'Evening reminder: skip the screen. Read, stretch, or wind down instead.',
    hour: 21, minute: 0,
    days: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'phoneoob',
    title: '📵 Phone out of bed — 21h',
    body:  'Last call — plug in your phone across the room. Sleep without the screen.',
    hour: 21, minute: 1,
    days: [0, 1, 2, 3, 4, 5, 6],
  },
];

function getParisComponents(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    year:    'numeric',
    month:   'numeric',
    day:     'numeric',
    hour:    '2-digit',
    minute:  '2-digit',
    hour12:  false,
  }).formatToParts(date);

  const get = (type) => (parts.find(p => p.type === type) || {}).value || '0';
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let h = parseInt(get('hour'), 10);
  if (h === 24) h = 0;

  return {
    weekday: DAYS.indexOf(get('weekday')),
    year:    parseInt(get('year'),   10),
    month:   parseInt(get('month'),  10),
    day:     parseInt(get('day'),    10),
    hour:    h,
    minute:  parseInt(get('minute'), 10),
  };
}

function buildParisTarget(baseDate, offsetDays, targetHour, targetMinute) {
  const pc = getParisComponents(baseDate);

  const y  = pc.year;
  const m  = String(pc.month).padStart(2, '0');
  const d  = String(pc.day).padStart(2, '0');
  const hh = String(targetHour).padStart(2, '0');
  const mm = String(targetMinute).padStart(2, '0');

  const naive = new Date(`${y}-${m}-${d}T${hh}:${mm}:00Z`);
  const shifted = new Date(naive.getTime() + offsetDays * 86_400_000);

  const check = getParisComponents(shifted);
  const deltaMin =
    (targetHour * 60 + targetMinute) -
    (check.hour  * 60 + check.minute);

  return new Date(shifted.getTime() + deltaMin * 60_000);
}

function msUntilNext(targetHour, targetMinute, allowedDays) {
  const now = new Date();
  const pc  = getParisComponents(now);

  for (let offset = 0; offset <= 7; offset++) {
    const checkDay = ((pc.weekday + offset) % 7 + 7) % 7;
    if (!allowedDays.includes(checkDay)) continue;

    if (offset === 0) {
      const nowMin    = pc.hour * 60 + pc.minute;
      const targetMin = targetHour * 60 + targetMinute;
      if (nowMin >= targetMin) continue;
    }

    const target = buildParisTarget(now, offset, targetHour, targetMinute);
    const ms = target.getTime() - now.getTime();
    if (ms > 1_000) return ms;
  }

  return null;
}


let _timers = {};

function scheduleAllNotifications() {
  Object.values(_timers).forEach(id => clearTimeout(id));
  _timers = {};
  NOTIF_SCHEDULE.forEach(n => scheduleOne(n));
}

function scheduleOne(notif) {
  const ms = msUntilNext(notif.hour, notif.minute, notif.days);
  if (ms === null) return;

  console.log(`[SW] "${notif.title}" fires in ${Math.round(ms / 60_000)} min`);

  _timers[notif.id] = setTimeout(async () => {
    try {
      await self.registration.showNotification(notif.title, {
        body:     notif.body,
        icon:     './assets/icon-192.png',
        badge:    './assets/icon-192.png',
        tag:      `habit-${notif.id}`,
        renotify: false,
        vibrate:  [200, 100, 200],
        data:     { habitId: notif.id, url: './' },
      });
    } catch (e) {
      console.warn('[SW] showNotification failed:', e);
    }
    scheduleOne(notif);
  }, ms);
}

self.addEventListener('message', (event) => {
  const type = (event.data || {}).type;

  if (type === 'NOTIFS_ENABLE') {
    scheduleAllNotifications();
    console.log('[SW] Notifications enabled.');
  }
  if (type === 'NOTIFS_DISABLE') {
    Object.values(_timers).forEach(id => clearTimeout(id));
    _timers = {};
    console.log('[SW] Notifications disabled.');
  }
  if (type === 'NOTIFS_RESCHEDULE') {
    scheduleAllNotifications();
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data || {}).url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(c => c.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const current = [STATIC_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => !current.includes(n)).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstHTML(request)); return;
  }
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, STATIC_CACHE)); return;
  }
  if (CACHEABLE_ORIGINS.some(o => url.origin === o)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE)); return;
  }
});

async function networkFirstHTML(req) {
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(STATIC_CACHE)).put(req, res.clone());
    return res;
  } catch {
    return (await caches.match(req)) || caches.match('./index.html');
  }
}
async function cacheFirst(req, name) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(name)).put(req, res.clone());
    return res;
  } catch { return new Response('Offline', { status: 503 }); }
}
async function staleWhileRevalidate(req, name) {
  const cache  = await caches.open(name);
  const cached = await cache.match(req);
  const fresh  = fetch(req)
    .then(r => { if (r.ok) cache.put(req, r.clone()); return r; })
    .catch(() => null);
  return cached || fresh;
}