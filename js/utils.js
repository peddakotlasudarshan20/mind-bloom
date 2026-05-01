/* ============================================
   MindBloom — Utility Helpers & localStorage
   ============================================ */

const MB = {

  /* ---------- Storage ---------- */
  store: {
    get: (key, fallback = null) => {
      try { const v = localStorage.getItem('mb_' + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set: (key, value) => {
      try { localStorage.setItem('mb_' + key, JSON.stringify(value)); } catch(e) { console.warn('Storage full', e); }
    },
    remove: (key) => localStorage.removeItem('mb_' + key),
    clear: () => { Object.keys(localStorage).filter(k => k.startsWith('mb_')).forEach(k => localStorage.removeItem(k)); }
  },

  /* ---------- Encode (stub encryption) ---------- */
  encode: (str) => btoa(unescape(encodeURIComponent(str))),
  decode: (str) => { try { return decodeURIComponent(escape(atob(str))); } catch { return str; } },

  /* ---------- Date Helpers ---------- */
  today: () => new Date().toISOString().slice(0, 10),
  formatDate: (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },
  formatTime: (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  daysBetween: (a, b) => Math.abs(Math.round((new Date(a) - new Date(b)) / 86400000)),
  getLast7Days: () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
  },
  getLastNDays: (n) => {
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (n - 1 - i));
      return d.toISOString().slice(0, 10);
    });
  },
  daysInMonth: (year, month) => new Date(year, month + 1, 0).getDate(),
  monthName: (m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m],

  /* ---------- Mood constants */
  moodLabels: ['Awful','Sad','Down','Uneasy','Meh','Neutral','Okay','Good','Great','Fantastic'],
  moodColor: (score) => {
    const colors = ['#FF4757','#FF6B81','#FF8C69','#FFA07A','#FFD166','#FFEF96','#B8F5D4','#52E5A3','#48D8A0','#00C980'];
    return colors[Math.max(0, Math.min(9, (score || 1) - 1))];
  },
  
  // Custom SVG faces for 10 moods (interpolated smiles)
  moodFace: (score) => {
    const s = Math.max(1, Math.min(10, score));
    // Calculate smile curve: s=1 -> deep frown (M8 16 Q12 12 16 16), s=10 -> deep smile (M8 14 Q12 20 16 14)
    // Actually, simple paths are easier. We'll predefine 10 paths for the mouth.
    const mouths = [
      'M8 16s1.5-3 4-3 4 3 4 3', // 1
      'M8 15.5s1.5-2 4-2 4 2 4 2', // 2
      'M8 15s1.5-1 4-1 4 1 4 1', // 3
      'M9 15 l6 0', // 4
      'M8 15 l8 0', // 5
      'M8 15s1.5 1 4 1 4-1 4-1', // 6
      'M8 14.5s1.5 1.5 4 1.5 4-1.5 4-1.5', // 7
      'M8 14s1.5 2 4 2 4-2 4-2', // 8
      'M8 14s1.5 3 4 3 4-3 4-3', // 9
      'M8 13s1.5 4 4 4 4-4 4-4'  // 10
    ];
    
    // Eyes: 1-2 look down, 9-10 are happy slits, else dots
    let eyes = '<line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>';
    if (s >= 9) eyes = '<path d="M8 9 Q9 7 10 9"></path><path d="M14 9 Q15 7 16 9"></path>';
    if (s <= 2) eyes = '<path d="M8 8 Q9 10 10 8"></path><path d="M14 8 Q15 10 16 8"></path>';

    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;display:inline-block;vertical-align:middle;"><circle cx="12" cy="12" r="10"></circle>${eyes}<path d="${mouths[s-1]}"></path></svg>`;
  },
  
  icon(name, attrs = {}) {
    if (!window.feather) return '';
    const icon = feather.icons[name];
    if (!icon) return '';
    return icon.toSvg(attrs);
  },

  /* ---------- User State ---------- */
  getProfile: () => MB.store.get('profile', null),
  getName: () => (MB.store.get('profile', {}).name || 'Friend'),
  isOnboarded: () => !!MB.store.get('onboarded', false),

  /* ---------- Greeting ---------- */
  greeting: () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  },

  /* ---------- Toast Notifications ---------- */
  toast: (msg, type = 'default', duration = 3000) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    const icons = { success: '✅', error: '❌', default: '💡' };
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || '💡'}</span> ${msg}`;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; setTimeout(() => el.remove(), 300); }, duration);
  },

  /* ---------- Confetti ---------- */
  confetti: (target) => {
    const colors = ['#7C6EF5','#52E5A3','#FFD166','#FF8C69','#FF6B81'];
    const container = target || document.body;
    for (let i = 0; i < 20; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = `
        left: ${Math.random() * 100}%; top: 0;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-delay: ${Math.random() * 0.5}s;
        animation-duration: ${0.8 + Math.random() * 0.8}s;
      `;
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 2000);
    }
  },

  /* ---------- Random pick ---------- */
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  shuffle: (arr) => [...arr].sort(() => Math.random() - 0.5),

  /* ---------- Truncate ---------- */
  truncate: (str, max = 100) => str.length > max ? str.slice(0, max) + '…' : str,

  /* ---------- Crisis Keywords ---------- */
  crisisKeywords: [
    'end my life','kill myself','want to die','suicide','can\'t go on',
    'no reason to live','better off dead','hurt myself','self harm',
    'give up on life','not worth living','end it all','take my own life',
    'overdose','no point living','goodbye forever'
  ],
  isCrisis: (text) => {
    const lower = (text || '').toLowerCase();
    return MB.crisisKeywords.some(kw => lower.includes(kw));
  },

  /* ---------- Scroll to top ---------- */
  scrollTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),

  /* ---------- Ripple Effect ---------- */
  ripple: (el, e) => {
    const r = document.createElement('span');
    const rect = el.getBoundingClientRect();
    r.style.cssText = `position:absolute;width:40px;height:40px;border-radius:50%;
      background:rgba(255,255,255,0.15);transform:scale(0);
      top:${e.clientY - rect.top - 20}px;left:${e.clientX - rect.left - 20}px;
      animation:ripple 0.5s ease;pointer-events:none;`;
    el.appendChild(r);
    setTimeout(() => r.remove(), 600);
  },

  /* ---------- Unique ID ---------- */
  uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
};

window.MB = MB;
