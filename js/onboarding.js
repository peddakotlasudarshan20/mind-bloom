/* ============================================
   MindBloom — Onboarding & Assessment
   ============================================ */

const Onboarding = {
  step: 0,
  data: { name:'', concerns:[], stress:5, sleep:5, phq:[], gad:[] },

  phqQuestions: [
    'Little interest or pleasure in doing things',
    'Feeling down, depressed, or hopeless',
    'Trouble falling or staying asleep, or sleeping too much',
    'Feeling tired or having little energy',
    'Poor appetite or overeating',
    'Feeling bad about yourself — or that you are a failure',
    'Trouble concentrating on things',
    'Moving or speaking slowly / being fidgety or restless',
    'Thoughts that you would be better off dead or hurting yourself'
  ],
  gadQuestions: [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'Worrying too much about different things',
    'Trouble relaxing',
    'Being so restless that it is hard to sit still',
    'Becoming easily annoyed or irritable',
    'Feeling afraid, as if something awful might happen'
  ],

  init() {
    this.step = 0;
    this.data = { name:'', concerns:[], stress:5, sleep:5, phq:[], gad:[] };
    this.render();
  },

  render() {
    const container = document.getElementById('onboarding-container');
    container.innerHTML = `
      <div class="onboard-screen" id="ob-wrapper">
        <div class="step-indicator" id="ob-steps" style="justify-content:center;margin-bottom:32px;"></div>
        <div id="ob-content"></div>
      </div>
    `;
    this.renderStep();
  },

  renderStep() {
    this.updateStepDots();
    const steps = [
      this.stepWelcome.bind(this),
      this.stepConcerns.bind(this),
      this.stepLevels.bind(this),
      this.stepPHQ.bind(this),
      this.stepGAD.bind(this),
      this.stepProfile.bind(this),
    ];
    const content = document.getElementById('ob-content');
    content.style.opacity = '0';
    setTimeout(() => {
      steps[this.step]();
      content.style.opacity = '1';
      content.style.transition = 'opacity 0.3s ease';
    }, 100);
  },

  updateStepDots() {
    const el = document.getElementById('ob-steps');
    if (!el) return;
    el.innerHTML = Array.from({length:6}, (_,i) =>
      `<div class="step-dot ${i < this.step ? 'done' : i === this.step ? 'active' : ''}"></div>`
    ).join('');
  },

  stepWelcome() {
    document.getElementById('ob-content').innerHTML = `
      <div class="text-center" style="animation:fadeSlideUp 0.4s ease both">
        <div style="font-size:5rem; margin-bottom:24px; display:block">🌱</div>
        <div class="font-heading" style="font-size:2.2rem;font-weight:800;margin-bottom:8px">Welcome to<br><span class="gradient-text">MindBloom</span></div>
        <p style="margin:16px 0 32px;max-width:320px;margin-left:auto;margin-right:auto">Your safe space for daily mental wellness. Let's set up your personalized profile — takes under 3 minutes.</p>
        <div class="form-group">
          <label class="form-label" for="ob-name">What should we call you?</label>
          <input type="text" id="ob-name" class="form-input" placeholder="Your first name" autocomplete="given-name" maxlength="30">
        </div>
        <button class="btn btn-primary btn-full btn-lg mt-4" onclick="Onboarding.nextStep()">Let's Begin →</button>
        <button class="btn btn-ghost btn-full mt-3" onclick="Onboarding.skip()">Skip Setup</button>
      </div>
    `;
    document.getElementById('ob-name').addEventListener('keydown', e => { if (e.key==='Enter') this.nextStep(); });
  },

  stepConcerns() {
    const concerns = ['😰 Anxiety','😔 Depression','😴 Sleep Issues','🔥 Burnout','💔 Relationships','👫 Loneliness','📚 Productivity','💪 Confidence'];
    document.getElementById('ob-content').innerHTML = `
      <h2 class="mb-2">What brings you here?</h2>
      <p class="mb-6">Select all that apply. This helps personalize your experience.</p>
      <div class="chip-group" id="concerns-group">
        ${concerns.map((c,i) => `<div class="chip" data-idx="${i}" onclick="Onboarding.toggleConcern(this,'${c.replace(/'/g,"\\'")}')">${c}</div>`).join('')}
      </div>
      <div class="flex gap-3 mt-8">
        <button class="btn btn-ghost" onclick="Onboarding.prevStep()">← Back</button>
        <button class="btn btn-primary" style="flex:1" onclick="Onboarding.nextStep()">Continue →</button>
        <button class="btn btn-ghost" onclick="Onboarding.nextStep()">Skip</button>
      </div>
    `;
    // restore selections
    this.data.concerns.forEach(c => {
      document.querySelectorAll('#concerns-group .chip').forEach(el => {
        if (el.textContent.trim() === c) el.classList.add('selected');
      });
    });
  },

  toggleConcern(el, val) {
    el.classList.toggle('selected');
    const concerns = this.data.concerns;
    const idx = concerns.indexOf(val);
    idx === -1 ? concerns.push(val) : concerns.splice(idx, 1);
  },

  stepLevels() {
    document.getElementById('ob-content').innerHTML = `
      <h2 class="mb-2">Your current state</h2>
      <p class="mb-6">These help us tailor content to your actual needs.</p>
      <div class="form-group">
        <div class="flex justify-between mb-2">
          <label class="form-label" style="margin:0">Stress Level</label>
          <span class="badge badge-coral" id="stress-val">${this.data.stress}/10</span>
        </div>
        <input type="range" class="range-slider" min="1" max="10" value="${this.data.stress}" id="stress-slider"
          oninput="this.nextElementSibling.style.display='none'; document.getElementById('stress-val').textContent=this.value+'/10'; Onboarding.data.stress=parseInt(this.value)">
        <div style="display:flex;justify-content:space-between;margin-top:4px">
          <span class="text-xs text-muted">Very calm</span>
          <span class="text-xs text-muted">Extremely stressed</span>
        </div>
      </div>
      <div class="form-group mt-6">
        <div class="flex justify-between mb-2">
          <label class="form-label" style="margin:0">Sleep Quality</label>
          <span class="badge badge-primary" id="sleep-val">${this.data.sleep}/10</span>
        </div>
        <input type="range" class="range-slider" min="1" max="10" value="${this.data.sleep}" id="sleep-slider"
          oninput="document.getElementById('sleep-val').textContent=this.value+'/10'; Onboarding.data.sleep=parseInt(this.value)">
        <div style="display:flex;justify-content:space-between;margin-top:4px">
          <span class="text-xs text-muted">Very poor</span>
          <span class="text-xs text-muted">Excellent</span>
        </div>
      </div>
      <div class="flex gap-3 mt-8">
        <button class="btn btn-ghost" onclick="Onboarding.prevStep()">← Back</button>
        <button class="btn btn-primary" style="flex:1" onclick="Onboarding.nextStep()">Continue →</button>
      </div>
    `;
  },

  stepPHQ() {
    document.getElementById('ob-content').innerHTML = `
      <div class="badge badge-gold mb-4">PHQ-9 Screener</div>
      <h2 class="mb-2">Over the last 2 weeks…</h2>
      <p class="mb-5 text-sm">How often have you been bothered by the following? <em>(Not a diagnosis — for personalization only)</em></p>
      <div id="phq-rows">
        ${this.phqQuestions.map((q,i) => this.likertRow(q, i, 'phq', this.data.phq[i])).join('')}
      </div>
      <div class="flex gap-3 mt-6">
        <button class="btn btn-ghost" onclick="Onboarding.prevStep()">← Back</button>
        <button class="btn btn-primary" style="flex:1" onclick="Onboarding.nextStep()">Continue →</button>
        <button class="btn btn-ghost" onclick="Onboarding.skipScreener('phq')">Skip</button>
      </div>
    `;
  },

  stepGAD() {
    document.getElementById('ob-content').innerHTML = `
      <div class="badge badge-accent mb-4">GAD-7 Screener</div>
      <h2 class="mb-2">Anxiety check-in</h2>
      <p class="mb-5 text-sm">Over the last 2 weeks, how often have you been bothered by:</p>
      <div id="gad-rows">
        ${this.gadQuestions.map((q,i) => this.likertRow(q, i, 'gad', this.data.gad[i])).join('')}
      </div>
      <div class="flex gap-3 mt-6">
        <button class="btn btn-ghost" onclick="Onboarding.prevStep()">← Back</button>
        <button class="btn btn-primary" style="flex:1" onclick="Onboarding.calcAndNext()">See My Profile →</button>
        <button class="btn btn-ghost" onclick="Onboarding.skipScreener('gad')">Skip</button>
      </div>
    `;
  },

  likertRow(q, i, type, selected) {
    const opts = ['Not at all','Several days','More than half','Nearly every day'];
    return `
      <div class="likert-row">
        <div class="likert-q text-sm">${i+1}. ${q}</div>
        <div class="likert-opts">
          ${opts.map((o,v) => `
            <button class="likert-opt ${selected===v ? 'selected':''}" title="${o}"
              onclick="Onboarding.setLikert('${type}',${i},${v},this)" data-type="${type}" data-q="${i}" data-val="${v}">${v}</button>
          `).join('')}
        </div>
      </div>`;
  },

  setLikert(type, q, val, el) {
    this.data[type][q] = val;
    document.querySelectorAll(`[data-type="${type}"][data-q="${q}"]`).forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
  },

  skipScreener(type) { this.data[type] = []; this.step === 3 ? this.nextStep() : this.calcAndNext(); },

  calcAndNext() {
    // Calculate PHQ-9 score
    const phqScore = this.data.phq.reduce((s,v) => s + (v || 0), 0);
    const gadScore = this.data.gad.reduce((s,v) => s + (v || 0), 0);
    this.data.phqScore = phqScore;
    this.data.gadScore = gadScore;
    this.data.phqLevel = phqScore >= 20 ? 'Severe' : phqScore >= 15 ? 'Mod-Severe' : phqScore >= 10 ? 'Moderate' : phqScore >= 5 ? 'Mild' : 'Minimal';
    this.data.gadLevel = gadScore >= 15 ? 'Severe' : gadScore >= 10 ? 'Moderate' : gadScore >= 5 ? 'Mild' : 'Minimal';
    this.step = 5;
    this.renderStep();
  },

  stepProfile() {
    const { name, concerns, stress, sleep, phqScore, gadScore, phqLevel, gadLevel } = this.data;
    const wellnessScore = Math.round(100 - (phqScore || 0) * 1.5 - (gadScore || 0) * 1.5 - stress * 3 + sleep * 3);
    const clamped = Math.max(10, Math.min(99, wellnessScore));
    const ring = this.progressRing(clamped);
    document.getElementById('ob-content').innerHTML = `
      <div class="text-center" style="animation:scaleIn 0.5s ease both">
        <div style="font-size:1.5rem;margin-bottom:8px">🌸</div>
        <h2 class="mb-1">Your Wellness Profile</h2>
        <p class="text-sm mb-6">Here's what we found — all private to you.</p>
        <div class="profile-card mb-6">
          <div class="profile-avatar">🌱</div>
          <div class="font-heading font-bold" style="font-size:1.3rem">${name || 'MindBloom User'}</div>
          <div class="text-sm text-muted mb-4">Wellness Seeker</div>
          ${ring}
          <div class="font-heading font-bold gradient-text" style="font-size:3rem;margin:-60px 0 20px">${clamped}</div>
          <div class="text-xs text-muted mb-6">Wellness Score</div>
          ${phqLevel ? `<div class="flex gap-3 justify-center flex-wrap">
            <span class="badge badge-primary">Depression: ${phqLevel}</span>
            <span class="badge badge-coral">Anxiety: ${gadLevel || 'Not assessed'}</span>
          </div>` : ''}
        </div>
        ${concerns.length ? `
        <div class="chip-group" style="justify-content:center">
          ${concerns.map(c => `<span class="chip selected text-xs">${c}</span>`).join('')}
        </div>` : ''}
        <div class="card-highlight mt-6 text-left">
          <div class="text-sm">
            ${phqLevel === 'Severe' || gadLevel === 'Severe' ?
              `<strong style="color:var(--c-coral)">Important:</strong> Your scores suggest significant distress. MindBloom is a self-help tool — please also speak with a professional. Use the <strong>"I Need Help Now"</strong> button anytime.` :
              `Based on your profile, MindBloom will prioritize <strong>${this.getRecommendation()}</strong> content for you.`
            }
          </div>
        </div>
        <button class="btn btn-primary btn-full btn-lg mt-6" onclick="Onboarding.complete()">Start My Journey 🌱</button>
      </div>
    `;
  },

  progressRing(score) {
    const r = 54, circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return `<svg width="130" height="130" style="margin:0 auto 0;display:block">
      <circle cx="65" cy="65" r="${r}" fill="none" stroke="var(--c-border)" stroke-width="8"/>
      <circle cx="65" cy="65" r="${r}" fill="none" stroke="url(#ringGrad)" stroke-width="8"
        stroke-linecap="round" stroke-dasharray="${dash} ${circ}" transform="rotate(-90 65 65)"
        style="transition:stroke-dasharray 1s ease"/>
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="var(--c-primary)"/>
          <stop offset="100%" stop-color="var(--c-accent)"/>
        </linearGradient>
      </defs>
    </svg>`;
  },

  getRecommendation() {
    const { concerns, phqLevel, gadLevel } = this.data;
    if (phqLevel === 'Moderate' || phqLevel === 'Mod-Severe') return 'mood tracking & CBT tools';
    if (gadLevel === 'Moderate' || gadLevel === 'Severe') return 'breathing exercises & anxiety relief';
    if (concerns.includes('😴 Sleep Issues')) return 'sleep meditation & relaxation';
    return 'mindfulness & daily check-ins';
  },

  nextStep() {
    if (this.step === 0) {
      const nameEl = document.getElementById('ob-name');
      if (nameEl) this.data.name = nameEl.value.trim();
    }
    if (this.step < 5) { this.step++; this.renderStep(); }
  },
  prevStep() { if (this.step > 0) { this.step--; this.renderStep(); } },

  skip() {
    this.data.name = 'Friend';
    this.complete();
  },

  complete() {
    const profile = {
      name: this.data.name || 'Friend',
      concerns: this.data.concerns,
      stress: this.data.stress,
      sleep: this.data.sleep,
      phqScore: this.data.phqScore || 0,
      gadScore: this.data.gadScore || 0,
      phqLevel: this.data.phqLevel || 'Not assessed',
      gadLevel: this.data.gadLevel || 'Not assessed',
      createdAt: new Date().toISOString()
    };
    MB.store.set('profile', profile);
    MB.store.set('onboarded', true);
    // Persist to Firestore if signed in
    if (window.FBService && window.auth?.currentUser) {
      FBService.saveProfile(profile).catch(console.warn);
      FBService.markOnboarded().catch(console.warn);
    }
    App.showApp();
    App.navigate('home');
    setTimeout(() => MB.toast(`Welcome to MindBloom, ${profile.name}! 🌱`, 'success'), 400);
  }
};

window.Onboarding = Onboarding;
