/* ============================================
   MindBloom — App Router & Boot
   ============================================ */

const App = {
  currentScreen: 'home',
  screens: ['home','mood','chat','journal','meditate','tools','community'],

  init() {
    if (!MB.isOnboarded()) {
      this.showOnboarding();
    } else {
      this.showApp();
      this.navigate(this.getHashScreen() || 'home');
    }
    this.initTheme();
    this.bindNav();
  },

  getHashScreen() {
    const h = window.location.hash.replace('#','');
    return this.screens.includes(h) ? h : null;
  },

  showOnboarding() {
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('onboarding-container').classList.remove('hidden');
    Onboarding.init();
  },

  showApp() {
    document.getElementById('onboarding-container').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
  },

  navigate(screen) {
    if (!this.screens.includes(screen)) screen = 'home';
    this.currentScreen = screen;

    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Show target
    const el = document.getElementById('screen-' + screen);
    if (el) {
      el.classList.add('active');
      el.style.animation = 'none';
      requestAnimationFrame(() => { el.style.animation = ''; });
    }

    // Highlight nav
    const navEl = document.querySelector(`.nav-item[data-screen="${screen}"]`);
    if (navEl) navEl.classList.add('active');

    // Update hash
    window.location.hash = screen;

    // Init screen
    this.initScreen(screen);
    MB.scrollTop();
  },

  initScreen(screen) {
    const handlers = {
      home:      () => Home.render(),
      mood:      () => Mood.render(),
      chat:      () => AIChat.render(),
      journal:   () => Journal.render(),
      meditate:  () => Meditation.render(),
      tools:     () => CBTTools.render(),
      community: () => Community.render(),
    };
    if (handlers[screen]) handlers[screen]();
  },

  bindNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const screen = item.dataset.screen;
        if (screen) this.navigate(screen);
      });
    });

    window.addEventListener('hashchange', () => {
      const s = this.getHashScreen();
      if (s && s !== this.currentScreen) this.navigate(s);
    });
  },

  initTheme() {
    const saved = MB.store.get('theme', 'dark');
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        MB.store.set('theme', next);
        btn.innerHTML = next === 'dark' ? SVG.moon : SVG.sun;
      });
      btn.innerHTML = saved === 'dark' ? SVG.moon : SVG.sun;
    }
  }
};

/* ============================================
   Home Screen
   ============================================ */
const Home = {
  render() {
    try {
      const el = document.getElementById('screen-home');
      if (!el) return;
      const profile = MB.getProfile() || {};
      const name = profile.name || 'Friend';
      const today = MB.today();
      const moods = MB.store.get('moods', []);
      const todayMood = moods.find(m => m.date === today);
      const streak = this.calcStreak(moods);
      const journals = MB.store.get('journals', []);
      const todayJournal = journals.find(j => j.date === today);
      const planItems = MB.store.get('plan_' + today, []);
      const donePlan = planItems.filter(p => p.done).length;

      el.innerHTML = `
        <div class="section-header">
          <div class="greeting">${MB.greeting()}, ${name} 👋</div>
          <h2>How are you <span class="gradient-text">today?</span></h2>
          <p class="mt-2">Your wellness journey continues.</p>
        </div>

        ${!todayMood ? `
        <div class="card-highlight mb-6 card-interactive" onclick="App.navigate('mood')" id="home-mood-prompt">
          <div class="flex items-center gap-4">
            <div style="font-size:2.5rem">${MB.icon('sun') || '🌤️'}</div>
            <div>
              <div class="font-heading font-bold" style="margin-bottom:4px;">Check in with yourself</div>
              <div class="text-sm text-muted">Log today's mood — takes 30 seconds</div>
            </div>
            <div style="margin-left:auto; color:var(--c-primary-light)">→</div>
          </div>
        </div>
        ` : `
        <div class="card mb-6" style="border-color:${MB.moodColor(todayMood.score)}33">
          <div class="flex items-center gap-4">
            <div style="font-size:2.5rem;color:${MB.moodColor(todayMood.score)}">${MB.moodFace ? MB.moodFace(todayMood.score) : '🙂'}</div>
            <div>
              <div class="font-heading font-bold">Feeling ${MB.moodLabels ? MB.moodLabels[todayMood.score - 1] || 'Okay' : 'Okay'}</div>
              <div class="text-sm text-muted">Today's check-in done ✓</div>
            </div>
            <div class="badge badge-accent" style="margin-left:auto">${todayMood.score}/10</div>
          </div>
        </div>
        `}

        <div class="grid-2 mb-6 stagger-children">
          <div class="stat-card card-interactive" onclick="App.navigate('mood')">
            <div class="stat-value gradient-text">${streak}</div>
            <div class="stat-label">🔥 Day Streak</div>
          </div>
          <div class="stat-card card-interactive" onclick="App.navigate('mood')">
            <div class="stat-value" style="color:var(--c-accent)">${moods.length}</div>
            <div class="stat-label">Check-ins Total</div>
          </div>
          <div class="stat-card card-interactive" onclick="App.navigate('journal')">
            <div class="stat-value" style="color:var(--c-gold)">${journals.length}</div>
            <div class="stat-label">Journal Entries</div>
          </div>
          <div class="stat-card card-interactive" onclick="App.navigate('chat')">
            <div class="stat-value" style="color:var(--c-coral)">AI</div>
            <div class="stat-label">AI Companion</div>
          </div>
        </div>

        <h3 class="mb-4">Quick Actions</h3>
        <div class="stagger-children">
          ${this.quickAction('🤖', 'AI Companion', 'Chat with Gemini', 'chat', 'btn-primary')}
          ${this.quickAction('📓', 'Journal', todayJournal ? 'Entry written ✓' : 'Write today\'s thoughts', 'journal', 'btn-ghost')}
        </div>

        <div class="card card-lift mb-6 mt-6 shimmer-hover" style="border-left:4px solid var(--c-accent)">
          <div class="font-heading font-semibold mb-2">${this.getDailyTip().title}</div>
          <p class="text-sm">${this.getDailyTip().body}</p>
        </div>
      `;
      if (window.feather) feather.replace();
    } catch (err) {
      const el = document.getElementById('screen-home');
      if (el) el.innerHTML = `<div style="padding:20px;color:red;">Error rendering home: ${err.message}</div>`;
      console.error(err);
    }
  },

  quickAction(icon, title, sub, screen, btnClass) {
    return `
      <div class="card card-interactive mb-3 shimmer-hover" onclick="App.navigate('${screen}')">
        <div class="flex items-center gap-4">
          <div style="font-size:1.8rem">${icon}</div>
          <div style="flex:1">
            <div class="font-heading font-semibold">${title}</div>
            <div class="text-sm text-muted">${sub}</div>
          </div>
          <button class="btn btn-sm ${btnClass}">Open</button>
        </div>
      </div>`;
  },

  calcStreak(moods) {
    if (!moods.length) return 0;
    const dates = new Set(moods.map(m => m.date));
    let streak = 0;
    const today = new Date();
    while (true) {
      const d = new Date(today); d.setDate(d.getDate() - streak);
      if (dates.has(d.toISOString().slice(0,10))) streak++;
      else break;
      if (streak > 365) break;
    }
    return streak;
  },

  getDailyTip() {
    const tips = [
      { title: 'The 5-4-3-2-1 Grounding Technique', body: 'Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Brings you into the present.' },
      { title: 'Rest Is Productive', body: 'Your brain processes emotions during sleep. Prioritizing 7–8 hours is one of the most impactful wellness choices you can make.' },
      { title: 'Name It to Tame It', body: 'Labeling your emotions — "I feel anxious" — reduces their intensity by engaging your rational brain. Try it right now.' },
      { title: 'Movement as Medicine', body: 'Even a 10-minute walk increases serotonin, dopamine, and norepinephrine. You don\'t need a gym — just your body and a little space.' },
      { title: 'You Are Not Your Thoughts', body: 'Thoughts are mental events, not facts. CBT teaches us to observe thoughts with curiosity rather than accepting them as truth.' },
      { title: 'Self-Compassion Over Self-Criticism', body: 'Treat yourself as you would treat a good friend. Research by Dr. Kristin Neff shows self-compassion boosts resilience significantly.' },
      { title: 'Breathe Out Longer', body: 'Extending your exhale to twice the length of your inhale (e.g., 4 in, 8 out) activates the parasympathetic nervous system and reduces anxiety.' },
    ];
    return tips[new Date().getDate() % tips.length];
  }
};

window.App = App;
window.Home = Home;
