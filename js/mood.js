/* ============================================
   MindBloom — Mood Tracking
   ============================================ */

const Mood = {
  activeTab: 'checkin',

  emotions: ['😰 Anxious','😢 Sad','😔 Down','😤 Angry','😴 Tired','😐 Neutral',
             '🙂 Okay','😊 Happy','😄 Excited','🤩 Grateful','😌 Calm','💪 Motivated'],
  contexts: ['💼 Work','😴 Sleep','💕 Relationships','🏃 Health','☀️ Weather','🍽️ Food','🎮 Leisure','📱 Social Media'],

  state: { score: null, emotions: [], contexts: [], note: '' },

  render() {
    const el = document.getElementById('screen-mood');
    const today = MB.today();
    const moods = MB.store.get('moods', []);
    const todayMood = moods.find(m => m.date === today);
    el.innerHTML = `
      <div class="section-header">
        <div class="greeting">MOOD TRACKER</div>
        <h2>How are you <span class="gradient-text">feeling?</span></h2>
      </div>
      <div class="tab-bar mb-6">
        <button class="tab-btn active" id="tab-checkin" onclick="Mood.switchTab('checkin')">Check-in</button>
        <button class="tab-btn" id="tab-trends" onclick="Mood.switchTab('trends')">Trends</button>
        <button class="tab-btn" id="tab-history" onclick="Mood.switchTab('history')">History</button>
      </div>
      <div id="mood-tab-content"></div>
    `;
    this.switchTab('checkin');
  },

  switchTab(tab) {
    this.activeTab = tab;
    ['checkin','trends','history'].forEach(t => {
      document.getElementById('tab-'+t)?.classList.toggle('active', t===tab);
    });
    const content = document.getElementById('mood-tab-content');
    if (tab === 'checkin') this.renderCheckin(content);
    else if (tab === 'trends') this.renderTrends(content);
    else this.renderHistory(content);
  },

  renderCheckin(el) {
    const today = MB.today();
    const moods = MB.store.get('moods', []);
    const todayMood = moods.find(m => m.date === today);
    const streak = this.calcStreak(moods);

    el.innerHTML = `
      <div class="streak-widget mb-6">
        <div class="flame-icon" style="font-size:2rem">🔥</div>
        <div>
          <div class="streak-count">${streak}</div>
          <div class="text-sm text-muted">Day${streak!==1?'s':''} in a row</div>
        </div>
        <div style="margin-left:auto;text-align:right">
          <div class="font-heading font-bold">${moods.length}</div>
          <div class="text-xs text-muted">Total check-ins</div>
        </div>
      </div>

      ${todayMood ? this.renderAlreadyCheckedIn(todayMood) : this.renderCheckinForm()}
    `;
    if (!todayMood) {
      this.bindCheckinForm();
    } else if (!todayMood.aiResponse) {
      this.generateAIResponse(todayMood.id);
    }
  },

  renderAlreadyCheckedIn(mood) {
    const mc = MB.moodColor(mood.score);
    return `
      <!-- Mood summary pill -->
      <div style="display:flex;align-items:center;gap:16px;background:${mc}12;border:1px solid ${mc}33;border-radius:20px;padding:16px 20px;margin-bottom:20px">
        <div style="font-size:3rem;line-height:1">${MB.moodFace(mood.score)}</div>
        <div style="flex:1">
          <div style="font-family:var(--font-heading);font-weight:700;font-size:1.1rem;color:${mc}">${MB.moodLabels[mood.score-1]}</div>
          <div style="font-size:0.78rem;color:var(--c-text-muted);margin-top:2px">Today's check-in logged ✓</div>
          ${mood.note ? `<div style="font-size:0.78rem;font-style:italic;color:var(--c-text-faint);margin-top:6px">"${mood.note}"</div>` : ''}
        </div>
        <div style="background:${mc}22;color:${mc};font-family:var(--font-heading);font-weight:800;font-size:1.3rem;padding:8px 14px;border-radius:12px">${mood.score}<span style="font-size:0.65rem;font-weight:500">/10</span></div>
      </div>

      <!-- AI Coach Card -->
      <div id="ai-coach-card" style="position:relative;overflow:hidden;border-radius:20px;background:linear-gradient(145deg,#141827 0%,#0E1220 100%);border:1px solid rgba(124,110,245,0.35);box-shadow:0 0 40px rgba(124,110,245,0.12),0 4px 24px rgba(0,0,0,0.4)">
        <!-- Animated top gradient bar -->
        <div style="height:3px;width:100%;background:linear-gradient(90deg,#7C6EF5,#52E5A3,#FF8C69,#7C6EF5);background-size:300% 100%;animation:ai-gradient-shift 4s ease infinite"></div>

        <!-- Header -->
        <div style="display:flex;align-items:center;gap:12px;padding:16px 20px 14px;border-bottom:1px solid rgba(255,255,255,0.05)">
          <!-- Pulsing AI avatar -->
          <div style="position:relative;flex-shrink:0">
            <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#7C6EF5,#52E5A3);display:flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:0 0 16px rgba(124,110,245,0.45)">🤖</div>
            <div style="position:absolute;bottom:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#52E5A3;border:2px solid #0E1220;animation:ai-breathe 2s ease-in-out infinite"></div>
          </div>
          <div style="flex:1">
            <div style="font-family:var(--font-heading);font-weight:700;font-size:1rem;color:var(--c-text)">AI Wellness Coach</div>
            <div style="font-size:0.72rem;color:#7C6EF5;font-weight:600;display:flex;align-items:center;gap:4px;margin-top:2px">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              Powered by Google Gemini
            </div>
          </div>
        </div>

        <!-- AI Response Content -->
        <div id="ai-response-content" style="padding:18px 20px 22px;line-height:1.75;font-size:0.92rem;color:var(--c-text-muted)">
          ${mood.aiResponse ? mood.aiResponse : `
            <div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:28px 0">
              <div style="position:relative;width:48px;height:48px">
                <div style="position:absolute;inset:0;border-radius:50%;border:2px solid transparent;border-top-color:#7C6EF5;animation:ai-spin 1s linear infinite"></div>
                <div style="position:absolute;inset:6px;border-radius:50%;border:2px solid transparent;border-top-color:#52E5A3;animation:ai-spin 1.5s linear infinite reverse"></div>
                <div style="position:absolute;inset:14px;border-radius:50%;background:linear-gradient(135deg,#7C6EF5,#52E5A3);animation:ai-breathe 2s ease-in-out infinite"></div>
              </div>
              <div>
                <div style="font-family:var(--font-heading);font-weight:600;color:var(--c-text);text-align:center;font-size:0.95rem">Analyzing your mood…</div>
                <div style="font-size:0.78rem;color:var(--c-text-faint);text-align:center;margin-top:4px">Gemini is reading how you feel ✨</div>
              </div>
            </div>
          `}
        </div>
      </div>

      <style>
        @keyframes ai-gradient-shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes ai-breathe{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.55;transform:scale(0.82)}}
        @keyframes ai-spin{to{transform:rotate(360deg)}}
        #ai-response-content p{margin-bottom:12px;color:var(--c-text-muted);line-height:1.75}
        #ai-response-content strong{color:var(--c-text);font-weight:600}
        #ai-response-content em{color:#A394FF;font-style:italic}
        #ai-response-content blockquote{border-left:3px solid #7C6EF5;padding:10px 14px;margin:14px 0;font-style:italic;color:#A394FF;background:rgba(124,110,245,0.08);border-radius:0 10px 10px 0}
      </style>
    `;
  },

  async fetchGeminiInsight(entry) {
    const apiKey = 'AIzaSyAwGXauWzQ5Ppj4G7MjepE-YXJ_HA3BF8M';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const moodLabel = MB.moodLabels[entry.score - 1];
    const isLowMood = entry.score <= 4;
    const isMidMood = entry.score >= 5 && entry.score <= 7;

    const prompt = `You are a warm, compassionate mental wellness companion — like a caring friend who also happens to be a therapist. Your tone is gentle, human, and healing. Never clinical or robotic. Always speak directly to the user as "you".

The user just checked in with how they're feeling:
- Mood: "${moodLabel}" (${entry.score} out of 10)
- Emotions they tagged: ${(entry.emotions || []).length > 0 ? (entry.emotions || []).join(', ') : 'not specified'}
- What influenced their mood: ${(entry.contexts || []).length > 0 ? (entry.contexts || []).join(', ') : 'not specified'}
- Their personal note: "${entry.note || 'nothing added'}"

Write a warm, healing response that:
1. Opens with a heartfelt, genuine acknowledgment of exactly how they're feeling — make them feel truly seen and heard. Be specific to their mood and emotions.
2. Offer one gentle, comforting thought or perspective that might help them right now.
3. Suggest ONE small, kind action they can take for themselves in the next few minutes (not a checklist — just a loving nudge).
4. Close with a short, sincere affirmation — something that feels personal, not generic.

${isLowMood ? 'Since they are feeling quite low, be extra gentle and validating. Let them know it is okay to not be okay.' : ''}
${isMidMood ? 'They are in a middle ground — acknowledge the effort it takes to just show up and check in.' : ''}

Format your response in clean, readable HTML. Use <p> for paragraphs, <em> for gentle emphasis, <strong> sparingly. 
Add a styled blockquote for the affirmation like: <blockquote style="border-left:3px solid #7C6EF5; padding-left:12px; margin:12px 0; font-style:italic; color:#A394FF;">affirmation here</blockquote>
Do NOT use markdown code blocks. Return only the raw HTML. Keep it warm, concise, and human — no more than 5-6 sentences total.`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 }
        })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```html/g, '').replace(/```/g, '').trim();
        return text;
      }
      return null;
    } catch (e) {
      console.error('Gemini API Error:', e);
      return null;
    }
  },

  async generateAIResponse(id) {
    const moods = MB.store.get('moods', []);
    const idx = moods.findIndex(m => m.id === id);
    if (idx === -1) return;
    const mood = moods[idx];

    const responseHTML = await this.fetchGeminiInsight(mood);
    const container = document.getElementById('ai-response-content');
    
    if (responseHTML) {
      moods[idx].aiResponse = responseHTML;
      MB.store.set('moods', moods);
      // Persist to Firestore if available
      if (window.FBService && window.auth?.currentUser) {
        FBService.saveMood(moods[idx]).catch(console.warn);
      }
      if (container) {
        container.innerHTML = responseHTML;
        container.style.animation = 'none';
        container.offsetHeight; // trigger reflow
        container.style.animation = 'fadeIn 0.5s ease';
      }
    } else {
      if (container) {
        container.innerHTML = '<p class="text-crisis text-sm">Could not generate AI response right now. Please try again later.</p>';
      }
    }
  },

  renderCheckinForm() {
    return `
      <div class="card mb-4">
        <h4 class="mb-4">How are you feeling? <span class="text-muted">(1–10)</span></h4>
        <div class="mood-grid" id="mood-grid">
          ${Array(10).fill(0).map((_,i) => `
            <div class="mood-cell" data-score="${i+1}" onclick="Mood.selectScore(${i+1},this)">
              <span class="emoji" style="color:${MB.moodColor(i+1)}">${MB.moodFace(i+1)}</span>
              <span class="label">${MB.moodLabels[i]}</span>
            </div>`).join('')}
        </div>
        <div id="score-display" class="text-center mt-4 hidden">
          <span class="badge badge-primary" id="score-badge">–</span>
        </div>
      </div>

      <div class="card mb-4" id="emotions-card" style="display:none">
        <h4 class="mb-3">What emotions tag this moment?</h4>
        <div class="chip-group" id="emotion-chips">
          ${this.emotions.map(e => `<div class="chip" onclick="Mood.toggleEmotion(this,'${e}')">${e}</div>`).join('')}
        </div>
      </div>

      <div class="card mb-4" id="context-card" style="display:none">
        <h4 class="mb-3">What influenced your mood?</h4>
        <div class="chip-group" id="context-chips">
          ${this.contexts.map(c => `<div class="chip" onclick="Mood.toggleContext(this,'${c}')">${c}</div>`).join('')}
        </div>
      </div>

      <div class="card mb-6" id="note-card" style="display:none">
        <h4 class="mb-3">Optional note</h4>
        <textarea class="form-textarea" id="mood-note" placeholder="Anything on your mind?" rows="3" style="min-height:80px"></textarea>
      </div>

      <button class="btn btn-primary btn-full btn-lg" id="save-mood-btn" style="display:none" onclick="Mood.save()">
        Save Check-in ✓
      </button>
    `;
  },

  bindCheckinForm() {
    const noteEl = document.getElementById('mood-note');
    if (noteEl) noteEl.addEventListener('input', e => this.state.note = e.target.value);
  },

  selectScore(score, el) {
    this.state.score = score;
    document.querySelectorAll('.mood-cell').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    el.classList.add('emoji-bounce');
    setTimeout(() => el.classList.remove('emoji-bounce'), 500);

    document.getElementById('score-display').classList.remove('hidden');
    document.getElementById('score-badge').textContent = `${score}/10 — ${MB.moodLabels[score-1]}`;
    document.getElementById('score-badge').style.background = MB.moodColor(score) + '33';
    document.getElementById('score-badge').style.color = MB.moodColor(score);

    ['emotions-card','context-card','note-card','save-mood-btn'].forEach(id => {
      const el2 = document.getElementById(id);
      if (el2) el2.style.display = '';
    });
  },

  toggleEmotion(el, val) {
    el.classList.toggle('selected');
    const arr = this.state.emotions;
    const idx = arr.indexOf(val);
    idx === -1 ? arr.push(val) : arr.splice(idx,1);
  },

  toggleContext(el, val) {
    el.classList.toggle('selected-accent');
    const arr = this.state.contexts;
    const idx = arr.indexOf(val);
    idx === -1 ? arr.push(val) : arr.splice(idx,1);
  },

  save() {
    if (!this.state.score) { MB.toast('Please select your mood first', 'error'); return; }
    const entry = {
      id: MB.uid(),
      date: MB.today(),
      timestamp: new Date().toISOString(),
      score: this.state.score,
      emotions: [...this.state.emotions],
      contexts: [...this.state.contexts],
      note: this.state.note,
      aiResponse: null  // always clear so fresh healing response is generated
    };
    const moods = MB.store.get('moods', []);
    const existing = moods.findIndex(m => m.date === entry.date);
    if (existing > -1) moods[existing] = entry; else moods.push(entry);
    MB.store.set('moods', moods);
    // Persist to Firestore
    if (window.FBService && window.auth?.currentUser) {
      FBService.saveMood(entry).catch(console.warn);
    }

    // Reset state
    this.state = { score: null, emotions: [], contexts: [], note: '' };
    MB.confetti(document.getElementById('screen-mood'));
    MB.toast('Check-in saved! 🎉', 'success');
    this.renderCheckin(document.getElementById('mood-tab-content'));
  },

  renderTrends(el) {
    const moods = MB.store.get('moods', []);
    el.innerHTML = `
      <div class="chart-wrap mb-6">
        <div class="flex justify-between items-center mb-4">
          <h4>7-Day Mood Trend</h4>
          <span class="badge badge-primary">This Week</span>
        </div>
        <canvas id="mood-line-chart" height="180"></canvas>
      </div>
      <div class="chart-wrap mb-6">
        <h4 class="mb-4">Monthly Heatmap</h4>
        <div id="mood-heatmap"></div>
      </div>
      <div id="mood-insight" class="card-highlight mb-6" style="display:none">
        <div style="font-size:1.4rem;margin-bottom:8px">💡</div>
        <h4 class="mb-2">Weekly Insight</h4>
        <p class="text-sm" id="insight-text"></p>
      </div>
      <div class="grid-2">
        <div class="stat-card"><div class="stat-value gradient-text" id="avg-score">—</div><div class="stat-label">Avg Mood (7d)</div></div>
        <div class="stat-card"><div class="stat-value" style="color:var(--c-accent)" id="best-day">—</div><div class="stat-label">Best Day</div></div>
      </div>
    `;
    setTimeout(() => {
      this.renderLineChart(moods);
      this.renderHeatmap(moods);
      this.renderInsight(moods);
    }, 100);
  },

  renderLineChart(moods) {
    const ctx = document.getElementById('mood-line-chart');
    if (!ctx || !window.Chart) return;
    const days = MB.getLast7Days();
    const byDate = {};
    moods.forEach(m => byDate[m.date] = m.score);
    const labels = days.map(d => { const dt = new Date(d); return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()]; });
    const data = days.map(d => byDate[d] || null);

    if (window._moodLineChart) window._moodLineChart.destroy();
    window._moodLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Mood', data,
          borderColor: '#7C6EF5', backgroundColor: 'rgba(124,110,245,0.1)',
          borderWidth: 2.5, tension: 0.4, fill: true,
          pointBackgroundColor: data.map(v => v ? MB.moodColor(v) : 'transparent'),
          pointBorderColor: '#7C6EF5', pointRadius: 5, pointHoverRadius: 7,
          spanGaps: true
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { min:1, max:10, grid: { color:'rgba(255,255,255,0.04)' }, ticks: { color:'#8891A8', font:{size:11} } },
          x: { grid: { display:false }, ticks: { color:'#8891A8', font:{size:11} } }
        },
        plugins: { legend: { display:false }, tooltip: {
          callbacks: { label: ctx => `Mood: ${ctx.raw}/10 — ${MB.moodLabels[(ctx.raw||1)-1]}` }
        }}
      }
    });

    // Stats
    const valid = data.filter(v => v);
    if (valid.length) {
      document.getElementById('avg-score').textContent = (valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(1);
      const best = Math.max(...valid);
      const bestIdx = data.indexOf(best);
      document.getElementById('best-day').textContent = labels[bestIdx] || '—';
    }
  },

  renderHeatmap(moods) {
    const el = document.getElementById('mood-heatmap');
    if (!el) return;
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth();
    const days = MB.daysInMonth(year, month);
    const byDate = {};
    moods.forEach(m => byDate[m.date] = m.score);

    const monthLabel = `<div class="flex justify-between text-xs text-muted mb-3"><span>${MB.monthName(month)} ${year}</span><div style="display:flex;gap:4px;align-items:center"><span>Low</span><div style="display:flex;gap:2px">${[2,4,6,8,10].map(v=>`<div style="width:12px;height:12px;border-radius:2px;background:${MB.moodColor(v)}"></div>`).join('')}</div><span>High</span></div></div>`;

    const firstDay = new Date(year, month, 1).getDay();
    let cells = Array(firstDay).fill('<div></div>');
    for (let d = 1; d <= days; d++) {
      const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const score = byDate[iso];
      const bg = score ? MB.moodColor(score) : 'var(--c-border)';
      const tip = score ? `${d}: ${MB.moodLabels[score-1]} (${score}/10)` : `${d}: No data`;
      cells.push(`<div class="heat-cell" style="background:${bg}" data-tip="${tip}"></div>`);
    }
    el.innerHTML = monthLabel + `<div class="heatmap-grid">${['S','M','T','W','T','F','S'].map(d=>`<div class="text-center text-xs text-muted" style="padding:2px 0">${d}</div>`).join('')}${cells.join('')}</div>`;
  },

  renderInsight(moods) {
    const el = document.getElementById('mood-insight');
    const textEl = document.getElementById('insight-text');
    if (!el || moods.length < 3) return;
    el.style.display = '';

    const recent = moods.slice(-7);
    const avg = recent.reduce((s,m)=>s+m.score,0)/recent.length;
    const trend = recent.length >= 2 ? recent[recent.length-1].score - recent[0].score : 0;
    const commonEmotion = this.mostCommon(recent.flatMap(m => m.emotions||[]));

    let insight = '';
    if (avg >= 7) insight = `You've been doing really well! Your average mood this week is ${avg.toFixed(1)}/10. Keep building on what's working.`;
    else if (avg >= 5) insight = `Your mood has been moderate this week (avg ${avg.toFixed(1)}/10). Small consistent actions — like today's check-in — make a real difference.`;
    else insight = `It looks like this week has been tough (avg ${avg.toFixed(1)}/10). Remember: you don't have to feel better all at once. One small step matters.`;

    if (trend > 2) insight += ' 📈 Your mood is trending upward — great progress!';
    if (trend < -2) insight += ' 📉 Your mood has dipped recently. Consider trying a breathing exercise or journaling to explore what\'s behind it.';
    if (commonEmotion) insight += ` You've frequently felt <strong>${commonEmotion}</strong> this week.`;

    textEl.innerHTML = insight;
  },

  mostCommon(arr) {
    if (!arr.length) return null;
    const freq = {};
    arr.forEach(v => freq[v] = (freq[v]||0)+1);
    return Object.entries(freq).sort((a,b)=>b[1]-a[1])[0]?.[0];
  },

  renderHistory(el) {
    const moods = MB.store.get('moods', []).slice().reverse();
    el.innerHTML = `
      <div class="mb-4">
        <input type="text" class="form-input" id="mood-search" placeholder="🔍 Search by emotion or note…" oninput="Mood.filterHistory(this.value)">
      </div>
      <div id="mood-history-list" class="stagger-children">
        ${moods.length ? moods.map(m => this.historyCard(m)).join('') : '<p class="text-center text-muted mt-8">No mood logs yet. Start your first check-in!</p>'}
      </div>
    `;
  },

  historyCard(m) {
    return `
      <div class="card mb-3 history-entry" data-tags="${(m.emotions||[]).join(' ')} ${m.note||''}">
        <div class="flex items-center gap-3">
          <div style="font-size:2rem;color:${MB.moodColor(m.score)}">${MB.moodFace(m.score)}</div>
          <div style="flex:1">
            <div class="flex justify-between items-center">
              <span class="font-heading font-semibold">${MB.moodLabels[m.score-1]}</span>
              <span class="badge" style="background:${MB.moodColor(m.score)}22;color:${MB.moodColor(m.score)}">${m.score}/10</span>
            </div>
            <div class="text-xs text-muted">${MB.formatDate(m.date)}</div>
            ${m.emotions?.length ? `<div class="chip-group mt-2">${m.emotions.slice(0,3).map(e=>`<span class="chip text-xs" style="padding:3px 8px">${e}</span>`).join('')}</div>` : ''}
            ${m.note ? `<p class="text-xs mt-2" style="color:var(--c-text-muted)">${MB.truncate(m.note, 80)}</p>` : ''}
          </div>
        </div>
      </div>`;
  },

  filterHistory(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.history-entry').forEach(el => {
      const tags = (el.dataset.tags || '').toLowerCase();
      el.style.display = !q || tags.includes(q) ? '' : 'none';
    });
  },

  calcStreak(moods) {
    if (!moods.length) return 0;
    const dates = new Set(moods.map(m => m.date));
    let streak = 0;
    const today = new Date();
    while (streak < 366) {
      const d = new Date(today); d.setDate(d.getDate() - streak);
      if (dates.has(d.toISOString().slice(0,10))) streak++;
      else break;
    }
    return streak;
  }
};

window.Mood = Mood;
