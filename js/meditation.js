/* ============================================
   MindBloom — Meditation & Mindfulness
   ============================================ */

const Meditation = {
  activeTab: 'session',

  timerState: 'idle', // idle, playing, paused, completed
  timerInterval: null,
  timeRemaining: 300, // default 5 mins
  timeTotal: 300,
  
  sessionSteps: [
    'Settle into a comfortable position.',
    'Take a deep breath in, and slowly exhale.',
    'Notice the physical sensations in your body.',
    'If your mind wanders, gently bring it back.',
    'You are completely present in this moment.',
    'Slowly begin to return your awareness to the room.'
  ],

  breathePatterns: {
    box: { name:'Box Breathing', desc:'4-4-4-4: Used by Navy SEALs for stress control', phases:[{label:'Inhale',dur:4},{label:'Hold',dur:4},{label:'Exhale',dur:4},{label:'Hold',dur:4}] },
    478: { name:'4-7-8 Breathing', desc:'4-7-8: Dr. Weil\'s relaxation technique', phases:[{label:'Inhale',dur:4},{label:'Hold',dur:7},{label:'Exhale',dur:8},{label:'',dur:0}] },
    diaphragm: { name:'Diaphragmatic', desc:'5-5: Simple deep belly breathing', phases:[{label:'Inhale',dur:5},{label:'Exhale',dur:5},{label:'',dur:0},{label:'',dur:0}] },
  },

  render() {
    const el = document.getElementById('screen-meditate');
    const completions = MB.store.get('med_completions', []);
    el.innerHTML = `
      <div class="section-header">
        <div class="greeting">MINDFULNESS</div>
        <h2>Find your <span class="gradient-text">calm</span></h2>
        <p class="mt-2">${completions.length} session${completions.length!==1?'s':''} completed · ${Math.round(completions.reduce((s,c)=>s+c.duration,0)/60)} min total</p>
      </div>
      <div class="tab-bar mb-6">
        <button class="tab-btn active" id="mtab-session" onclick="Meditation.switchTab('session')">Timer</button>
        <button class="tab-btn" id="mtab-breathe" onclick="Meditation.switchTab('breathe')">Breathing</button>
      </div>
      <div id="med-content"></div>
    `;
    this.switchTab('session');
  },

  switchTab(tab) {
    this.activeTab = tab;
    ['session','breathe'].forEach(t => {
      const btn = document.getElementById('mtab-'+t);
      if(btn) btn.classList.toggle('active', t===tab);
    });
    const content = document.getElementById('med-content');
    
    // Stop animations if navigating away
    if (tab !== 'breathe') this.stopBreathe();
    if (tab !== 'session') this.stopTimer();
    
    if (tab === 'breathe') this.renderBreathe(content);
    else this.renderSession(content);
  },

  /* -------- SESSION TIMER -------- */

  renderSession(el) {
    const isPlaying = this.timerState === 'playing';
    const progress = 1 - (this.timeRemaining / this.timeTotal);
    
    // Determine which step to show based on progress
    const stepCount = this.sessionSteps.length;
    const stepIndex = Math.min(stepCount - 1, Math.floor(progress * stepCount));
    const currentStep = this.sessionSteps[stepIndex];

    el.innerHTML = `
      <div class="meditation-session" style="display:flex; flex-direction:column; align-items:center; text-align:center;">
        
        <div class="timer-display" style="position:relative; width:240px; height:240px; margin-bottom:32px; margin-top:24px;">
          <svg class="progress-ring" width="240" height="240" style="transform:rotate(-90deg);">
            <circle class="progress-ring__circle_bg" stroke="var(--c-border)" stroke-width="8" fill="transparent" r="110" cx="120" cy="120"/>
            <circle class="progress-ring__circle" id="timer-ring" stroke="var(--c-primary)" stroke-width="8" stroke-linecap="round" fill="transparent" r="110" cx="120" cy="120" style="stroke-dasharray: 691; stroke-dashoffset: ${691 * (1 - progress)}; transition: stroke-dashoffset 1s linear;"/>
          </svg>
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); display:flex; flex-direction:column; align-items:center;">
            <div class="font-heading font-bold" id="timer-text" style="font-size:3rem; color:var(--c-text);">
              ${this.formatTime(this.timeRemaining)}
            </div>
          </div>
        </div>

        <div class="flex gap-2 justify-center mb-6" id="timer-duration-btns" style="${this.timerState !== 'idle' ? 'opacity:0.5;pointer-events:none;' : ''}">
          <button class="chip ${this.timeTotal===300?'selected':''}" onclick="Meditation.setDuration(300)">5m</button>
          <button class="chip ${this.timeTotal===600?'selected':''}" onclick="Meditation.setDuration(600)">10m</button>
          <button class="chip ${this.timeTotal===900?'selected':''}" onclick="Meditation.setDuration(900)">15m</button>
        </div>

        <div class="card card-highlight mb-8" style="width:100%; min-height:80px; display:flex; align-items:center; justify-content:center; animation:fadeIn 1s ease;">
          <p class="text-md" id="meditation-step" style="margin:0; font-style:italic;">"${currentStep}"</p>
        </div>

        <div class="flex gap-4">
          <button class="btn btn-ghost" onclick="Meditation.stopTimer()" style="display:${this.timerState==='idle'?'none':''}" id="timer-stop-btn">⏹ Stop</button>
          <button class="btn btn-primary btn-lg" id="timer-toggle-btn" onclick="Meditation.toggleTimer()" style="width:140px;">
            ${isPlaying ? '⏸ Pause' : '▶ Start Timer'}
          </button>
        </div>
      </div>
    `;
  },

  setDuration(seconds) {
    if (this.timerState !== 'idle') return;
    this.timeTotal = seconds;
    this.timeRemaining = seconds;
    this.renderSession(document.getElementById('med-content'));
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  },

  toggleTimer() {
    if (this.timerState === 'playing') {
      this.timerState = 'paused';
      clearInterval(this.timerInterval);
    } else {
      if (this.timeRemaining <= 0) {
        this.timeRemaining = this.timeTotal;
      }
      this.timerState = 'playing';
      this.timerInterval = setInterval(() => {
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
          this.timeRemaining = 0;
          this.completeSession();
        }
        this.updateTimerUI();
      }, 1000);
    }
    this.updateTimerUI();
  },

  stopTimer() {
    clearInterval(this.timerInterval);
    this.timerState = 'idle';
    this.timeRemaining = this.timeTotal;
    this.renderSession(document.getElementById('med-content'));
  },

  updateTimerUI() {
    const textEl = document.getElementById('timer-text');
    const ringEl = document.getElementById('timer-ring');
    const btnEl = document.getElementById('timer-toggle-btn');
    const stopBtnEl = document.getElementById('timer-stop-btn');
    const stepEl = document.getElementById('meditation-step');
    const durationBtns = document.getElementById('timer-duration-btns');
    
    if (!textEl) return; // Not on the view

    const isPlaying = this.timerState === 'playing';
    const progress = 1 - (this.timeRemaining / this.timeTotal);
    
    textEl.textContent = this.formatTime(this.timeRemaining);
    if (ringEl) {
      ringEl.style.strokeDashoffset = 691 * (1 - progress);
    }
    
    if (btnEl) btnEl.innerHTML = isPlaying ? '⏸ Pause' : (this.timerState==='idle' ? '▶ Start Timer' : '▶ Resume');
    if (stopBtnEl) stopBtnEl.style.display = this.timerState==='idle' ? 'none' : '';
    if (durationBtns) {
      durationBtns.style.opacity = this.timerState==='idle' ? '1' : '0.5';
      durationBtns.style.pointerEvents = this.timerState==='idle' ? 'auto' : 'none';
    }

    if (stepEl) {
      const stepCount = this.sessionSteps.length;
      const stepIndex = Math.min(stepCount - 1, Math.floor(progress * stepCount));
      const currentStep = this.sessionSteps[stepIndex];
      if (stepEl.textContent !== `"${currentStep}"`) {
        stepEl.style.animation = 'none';
        stepEl.offsetHeight; /* trigger reflow */
        stepEl.style.animation = 'fadeIn 1s ease';
        stepEl.textContent = `"${currentStep}"`;
      }
    }
  },

  completeSession() {
    clearInterval(this.timerInterval);
    this.timerState = 'completed';
    this.updateTimerUI();
    
    const completions = MB.store.get('med_completions', []);
    const today = MB.today();
    const durationMins = this.timeTotal / 60;
    
    const completion = { id: 'timer_' + Date.now(), date: today, duration: durationMins };
    completions.push(completion);
    MB.store.set('med_completions', completions);
    if (window.FBService && window.auth?.currentUser) {
      FBService.saveMedCompletion(completion).catch(console.warn);
    }
    
    MB.confetti(document.getElementById('screen-meditate'));
    
    const content = document.getElementById('med-content');
    content.innerHTML = `
      <div class="card-highlight text-center mt-4" style="animation:scaleIn 0.5s ease both; padding:40px 20px;">
        <div style="font-size:4rem;margin-bottom:16px">🎉</div>
        <h3 class="gradient-text">Session Complete!</h3>
        <p class="text-sm mt-2 mb-6">${durationMins} minutes of mindfulness.<br>You are prioritizing your wellness.</p>
        <button class="btn btn-primary" onclick="Meditation.stopTimer()">New Session</button>
      </div>`;
    
    MB.toast('Meditation complete! 🧘', 'success');
  },

  /* -------- BREATHING TOOL -------- */
  
  renderBreathe(el) {
    const activePattern = MB.store.get('breathe_pattern', 'box');
    const pattern = this.breathePatterns[activePattern];
    el.innerHTML = `
      <h3 class="text-center mb-2">Guided Breathing</h3>
      <p class="text-center text-sm mb-6 text-muted">Choose a technique and follow the circle.</p>
      <div class="chip-group mb-6" style="justify-content:center">
        ${Object.entries(this.breathePatterns).map(([k,p]) =>
          `<div class="chip ${activePattern===k?'selected':''}" onclick="Meditation.selectPattern('${k}')">${p.name}</div>`
        ).join('')}
      </div>
      <div class="card text-center mb-4" style="padding:12px 16px">
        <div class="font-heading font-semibold" style="font-size:1rem">${pattern.name}</div>
        <div class="text-xs text-muted">${pattern.desc}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 0">
        <div style="position:relative;width:240px;height:240px;margin:0 auto">
          <div id="breathe-circle" class="breathing-circle" style="width:240px;height:240px;position:absolute;inset:0;transform:scale(0.65);opacity:0.6;border-radius:50%;background:var(--c-primary-light);transition:transform 1s ease, background 1s ease;"></div>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1">
            <div class="font-heading font-bold" style="font-size:3rem;line-height:1;color:white;" id="breathe-count">4</div>
            <div class="text-sm" style="color:rgba(255,255,255,0.9);text-transform:uppercase;letter-spacing:1px;margin-top:4px;" id="breathe-label">Ready</div>
          </div>
        </div>
        <div class="flex gap-3 mt-10">
          <button class="btn btn-ghost" id="breathe-stop-btn" onclick="Meditation.stopBreathe()" style="display:none">⏹ Stop</button>
          <button class="btn btn-primary btn-lg" id="breathe-start-btn" onclick="Meditation.startBreathe()" style="width:180px;">Start Breathing</button>
        </div>
        <div id="breathe-cycles" class="text-sm text-muted mt-6">Completed cycles: <strong id="cycle-count" style="color:var(--c-text);">0</strong></div>
      </div>
    `;
  },

  selectPattern(key) {
    MB.store.set('breathe_pattern', key);
    this.stopBreathe();
    this.renderBreathe(document.getElementById('med-content'));
  },

  startBreathe() {
    document.getElementById('breathe-start-btn').style.display = 'none';
    document.getElementById('breathe-stop-btn').style.display = '';
    let cycleCount = 0;
    const patKey = MB.store.get('breathe_pattern', 'box');
    const pattern = this.breathePatterns[patKey];
    const phases = pattern.phases.filter(p => p.dur > 0);
    let phaseIdx = 0;

    const runPhase = () => {
      if (this.breatheStopped) return;
      const phase = phases[phaseIdx];
      const circle = document.getElementById('breathe-circle');
      const label = document.getElementById('breathe-label');
      const countEl = document.getElementById('breathe-count');
      if (!circle) return;

      label.textContent = phase.label;
      circle.style.transition = `transform ${phase.dur}s linear, background 0.5s ease`;
      
      if (phase.label === 'Inhale') {
        circle.style.transform = 'scale(1)';
        circle.style.background = 'var(--c-primary)';
      } else if (phase.label === 'Exhale') {
        circle.style.transform = 'scale(0.5)';
        circle.style.background = 'var(--c-accent)';
      } else {
        circle.style.background = 'var(--c-gold)';
      }

      let remaining = phase.dur;
      countEl.textContent = remaining;
      
      clearInterval(this.breatheInterval);
      this.breatheInterval = setInterval(() => {
        if (this.breatheStopped) { clearInterval(this.breatheInterval); return; }
        remaining--;
        countEl.textContent = Math.max(0, remaining);
        if (remaining <= 0) {
          clearInterval(this.breatheInterval);
          phaseIdx++;
          if (phaseIdx >= phases.length) {
            phaseIdx = 0;
            cycleCount++;
            const cycleEl = document.getElementById('cycle-count');
            if (cycleEl) cycleEl.textContent = cycleCount;
          }
          setTimeout(runPhase, 50);
        }
      }, 1000);
    };

    this.breatheStopped = false;
    runPhase();
  },

  stopBreathe() {
    this.breatheStopped = true;
    clearInterval(this.breatheInterval);
    
    const startBtn = document.getElementById('breathe-start-btn');
    const stopBtn = document.getElementById('breathe-stop-btn');
    if (startBtn) startBtn.style.display = '';
    if (stopBtn) stopBtn.style.display = 'none';
    
    const circle = document.getElementById('breathe-circle');
    if (circle) { 
      circle.style.transition = 'transform 0.5s ease, background 0.5s ease';
      circle.style.transform = 'scale(0.65)'; 
      circle.style.background = 'var(--c-primary-light)'; 
    }
    
    const label = document.getElementById('breathe-label');
    if (label) label.textContent = 'Ready';
    
    const count = document.getElementById('breathe-count');
    if (count) count.textContent = '4';
  },
};

window.Meditation = Meditation;
