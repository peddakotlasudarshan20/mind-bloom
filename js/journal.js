/* ============================================
   MindBloom — Guided Journaling
   ============================================ */

const Journal = {
  activeTab: 'write',
  currentPrompt: null,

  prompts: {
    gratitude: [
      { icon:'🌸', text:'Write about three specific things you\'re grateful for today. What made them meaningful?' },
      { icon:'💛', text:'Who is someone you\'re grateful for right now? What would you want them to know?' },
      { icon:'✨', text:'Describe a small moment from today that brought you joy or peace.' },
      { icon:'🌿', text:'What is something your body did for you today that you can appreciate?' },
      { icon:'🏠', text:'What is something in your environment — home, nature, or routine — that you take for granted but are actually thankful for?' },
    ],
    reframe: [
      { icon:'🔄', text:'Think about a problem you\'re facing. What\'s one thing this challenge might be teaching you?' },
      { icon:'💭', text:'Write down a negative thought you\'ve had today. Now, what\'s the evidence against it?' },
      { icon:'🌤️', text:'If your best friend were in your situation, what would you tell them? Write that letter to yourself.' },
      { icon:'🧩', text:'What assumptions are you making about a current situation? How might you see it differently?' },
      { icon:'⚡', text:'Describe a past difficulty you overcame. What strengths did you use then that apply now?' },
    ],
    future: [
      { icon:'🚀', text:'It\'s one year from today. You\'ve been thriving. What does your daily life look like?' },
      { icon:'🌟', text:'What\'s one dream you\'ve been afraid to name? Write it down as if it\'s already happening.' },
      { icon:'🎯', text:'What is the one thing, if you did it consistently for 30 days, that would most improve your life?' },
      { icon:'💌', text:'Write a letter from your 80-year-old self to your current self. What wisdom would they share?' },
    ],
    anxiety: [
      { icon:'🌬️', text:'Describe what you\'re anxious about right now. On a scale of 1–10, how likely is the worst case? What would you do if it happened?' },
      { icon:'🪴', text:'What is within your control right now? What is outside your control? Focus your energy where?' },
      { icon:'⏰', text:'Use the "Worry Time" technique: write all your worries here. Now, schedule a time to address them later. For now, let them go.' },
      { icon:'🌊', text:'Imagine your anxiety as a wave. Describe it. Watch it rise, peak, and fall. You are the beach, not the wave.' },
    ],
    compassion: [
      { icon:'💞', text:'In what way have you been too hard on yourself lately? How would you speak to a friend in the same situation?' },
      { icon:'🌻', text:'Write three things you did well today — no matter how small. Celebrate them genuinely.' },
      { icon:'🫂', text:'What do you need most right now — emotionally, physically, or mentally? How can you give yourself even a small portion of that?' },
      { icon:'🧸', text:'Think of a time you failed. Write about it with the same kindness you\'d offer someone you love.' },
    ]
  },

  reflectionTemplates: {
    gratitude: ['Your gratitude practice is building a powerful mental habit. Research shows that consistent gratitude journaling rewires your brain toward positivity over time.','It sounds like you\'re noticing the small, meaningful moments. This awareness itself is a form of mindfulness.'],
    reframe: ['You\'re doing the hard work of challenging automatic thoughts — that\'s the heart of CBT. Each time you reframe, you\'re literally building new neural pathways.','The shift in perspective you\'re exploring takes real courage. Remember: thoughts aren\'t facts.'],
    future: ['Visualizing your ideal future activates the same neural pathways as actually experiencing it. Your brain is beginning to believe this future is possible.','There\'s real power in naming your dreams. The act of writing them down is the first step toward making them real.'],
    anxiety: ['You\'ve taken a brave step by confronting your worry instead of avoiding it. Avoidance feeds anxiety — engagement shrinks it.','Separating what\'s in your control from what isn\'t is one of the most effective anxiety management strategies. You\'re practicing it right now.'],
    compassion: ['Self-compassion, as Dr. Kristin Neff\'s research shows, is strongly linked to resilience and emotional wellbeing. You\'re not being soft — you\'re being strategic.','Treating yourself with kindness isn\'t weakness. It\'s the foundation of sustainable mental health.'],
  },

  keywords: {
    stress: ['stressed','overwhelmed','pressure','too much','drowning','exhausted','burnt out'],
    sadness: ['sad','cry','crying','empty','lonely','alone','miss','loss','grief'],
    anxiety: ['anxious','worried','panic','fear','scared','nervous','dread','catastrophe'],
    anger: ['angry','frustrated','annoyed','rage','furious','unfair','injustice'],
    hope: ['hope','better','progress','grateful','proud','excited','looking forward','love'],
  },

  render() {
    const el = document.getElementById('screen-journal');
    el.innerHTML = `
      <div class="section-header">
        <div class="greeting">GUIDED JOURNALING</div>
        <h2>Your <span class="gradient-text">private space</span></h2>
        <p class="mt-2">End-to-end encrypted. Only you can read this.</p>
      </div>
      <div class="tab-bar mb-6">
        <button class="tab-btn active" id="jtab-write" onclick="Journal.switchTab('write')">Write</button>
        <button class="tab-btn" id="jtab-history" onclick="Journal.switchTab('history')">History</button>
      </div>
      <div id="journal-content"></div>
    `;
    this.switchTab('write');
  },

  switchTab(tab) {
    this.activeTab = tab;
    ['write','history'].forEach(t => document.getElementById('jtab-'+t)?.classList.toggle('active', t===tab));
    const content = document.getElementById('journal-content');
    if (tab === 'write') this.renderWrite(content);
    else this.renderHistory(content);
  },

  renderWrite(el) {
    const category = this.getRecommendedCategory();
    const prompt = MB.pick(this.prompts[category]);
    this.currentPrompt = { category, ...prompt };

    el.innerHTML = `
      <div class="prompt-card mb-4" id="prompt-display">
        <div class="flex justify-between items-start mb-3">
          <span class="badge badge-${this.categoryColor(category)}">${this.categoryLabel(category)}</span>
          <button class="btn btn-ghost btn-sm" onclick="Journal.shufflePrompt()">🔀 New Prompt</button>
        </div>
        <div class="prompt-icon">${prompt.icon}</div>
        <p class="prompt-text">${prompt.text}</p>
      </div>

      <div class="card mb-4">
        <div class="flex justify-between items-center mb-3">
          <h4>Your thoughts</h4>
          <span class="text-xs text-muted" id="word-count">0 words</span>
        </div>
        <textarea class="form-textarea" id="journal-entry" placeholder="Start writing freely… this space is yours." rows="8"
          oninput="Journal.updateWordCount(this)"></textarea>
      </div>

      <div id="ai-reflection" class="hidden"></div>

      <div class="flex gap-3">
        <button class="btn btn-ghost" onclick="Journal.clearEntry()">Clear</button>
        <button class="btn btn-primary" style="flex:1" onclick="Journal.saveEntry()">Save Entry ✓</button>
        <button class="btn btn-ghost" onclick="Journal.getReflection()">✨ Reflect</button>
      </div>

      <div class="mt-6">
        <h4 class="mb-3">Prompt Categories</h4>
        <div class="chip-group">
          ${Object.keys(this.prompts).map(cat =>
            `<div class="chip ${cat===category?'selected':''}" onclick="Journal.pickCategory('${cat}')">${this.categoryLabel(cat)}</div>`
          ).join('')}
        </div>
      </div>
    `;
  },

  getRecommendedCategory() {
    const moods = MB.store.get('moods', []);
    const recent = moods.slice(-3);
    if (!recent.length) return 'gratitude';
    const avg = recent.reduce((s,m)=>s+m.score,0)/recent.length;
    if (avg <= 4) return 'anxiety';
    if (avg <= 6) return 'reframe';
    if (avg >= 8) return 'future';
    return 'compassion';
  },

  categoryLabel(cat) {
    return { gratitude:'🌸 Gratitude', reframe:'🔄 Reframe', future:'🚀 Future Self', anxiety:'😌 Anxiety', compassion:'💞 Self-Compassion' }[cat] || cat;
  },

  categoryColor(cat) {
    return { gratitude:'accent', reframe:'primary', future:'gold', anxiety:'coral', compassion:'primary' }[cat] || 'primary';
  },

  shufflePrompt() {
    const prompt = MB.pick(this.prompts[this.currentPrompt.category]);
    this.currentPrompt = { ...this.currentPrompt, ...prompt };
    const el = document.getElementById('prompt-display');
    el.style.opacity = '0';
    setTimeout(() => {
      document.querySelector('#prompt-display .prompt-icon').textContent = prompt.icon;
      document.querySelector('#prompt-display .prompt-text').textContent = prompt.text;
      el.style.opacity = '1';
    }, 200);
  },

  pickCategory(cat) {
    this.currentPrompt = { category: cat, ...MB.pick(this.prompts[cat]) };
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    event.target.classList.add('selected');
    const el = document.getElementById('prompt-display');
    el.style.opacity = '0';
    setTimeout(() => {
      document.querySelector('#prompt-display .badge').className = `badge badge-${this.categoryColor(cat)}`;
      document.querySelector('#prompt-display .badge').textContent = this.categoryLabel(cat);
      document.querySelector('#prompt-display .prompt-icon').textContent = this.currentPrompt.icon;
      document.querySelector('#prompt-display .prompt-text').textContent = this.currentPrompt.text;
      el.style.opacity = '1';
    }, 200);
  },

  updateWordCount(textarea) {
    const words = textarea.value.trim().split(/\s+/).filter(w=>w).length;
    document.getElementById('word-count').textContent = `${words} word${words!==1?'s':''}`;
    if (MB.isCrisis(textarea.value)) Crisis.show();
  },

  getReflection() {
    const entry = document.getElementById('journal-entry')?.value.trim();
    if (!entry || entry.length < 20) { MB.toast('Write a bit more first!', 'error'); return; }
    const reflection = this.generateReflection(entry);
    const el = document.getElementById('ai-reflection');
    el.className = '';
    el.innerHTML = `
      <div class="card-highlight mb-4" style="animation:fadeSlideUp 0.4s ease both">
        <div class="flex items-center gap-2 mb-3">
          <span style="font-size:1.2rem">✨</span>
          <h4>AI Reflection</h4>
          <span class="badge badge-primary text-xs">MindBloom AI</span>
        </div>
        <p class="text-sm" style="line-height:1.7">${reflection.insight}</p>
        ${reflection.themes.length ? `
        <div class="mt-3">
          <div class="text-xs text-muted mb-2">Themes detected:</div>
          <div class="chip-group">${reflection.themes.map(t=>`<span class="chip text-xs">${t}</span>`).join('')}</div>
        </div>` : ''}
        <p class="text-sm mt-3" style="color:var(--c-accent)">${reflection.reframe}</p>
      </div>
    `;
  },

  generateReflection(text) {
    const lower = text.toLowerCase();
    const detectedThemes = [];
    const themePhrases = { 'Stress & Overwhelm':'stress', 'Sadness':'sadness', 'Anxiety':'anxiety', 'Anger':'anger', 'Hope & Growth':'hope' };
    Object.entries(this.keywords).forEach(([theme, kws]) => {
      if (kws.some(k => lower.includes(k))) detectedThemes.push(Object.keys(themePhrases).find(k => themePhrases[k]===theme) || theme);
    });

    const cat = this.currentPrompt?.category || 'gratitude';
    const insight = MB.pick(this.reflectionTemplates[cat] || this.reflectionTemplates.gratitude);

    const reframes = [
      'Remember: every time you write, you\'re investing in your mental health. That takes real courage.',
      'The fact that you showed up today — even just to write — is meaningful. Keep going.',
      'Your awareness of your own inner life is itself a superpower. Not everyone pauses to reflect like this.',
      'Small steps, taken consistently, lead to lasting change. You\'re on that path right now.'
    ];

    return { insight, themes: detectedThemes, reframe: MB.pick(reframes) };
  },

  saveEntry() {
    const entry = document.getElementById('journal-entry')?.value.trim();
    if (!entry) { MB.toast('Nothing to save — write something first!', 'error'); return; }
    if (MB.isCrisis(entry)) { Crisis.show(); return; }

    const journals = MB.store.get('journals', []);
    const newEntry = {
      id: MB.uid(),
      date: MB.today(),
      timestamp: new Date().toISOString(),
      prompt: this.currentPrompt?.text || '',
      category: this.currentPrompt?.category || 'free',
      content: MB.encode(entry),
      wordCount: entry.split(/\s+/).filter(w=>w).length
    };
    journals.push(newEntry);
    MB.store.set('journals', journals);
    // Persist to Firestore
    if (window.FBService && window.auth?.currentUser) {
      FBService.saveJournal(newEntry).catch(console.warn);
    }

    document.getElementById('journal-entry').value = '';
    document.getElementById('word-count').textContent = '0 words';
    document.getElementById('ai-reflection').className = 'hidden';
    MB.confetti(document.getElementById('screen-journal'));
    MB.toast('Entry saved! 🔒', 'success');
  },

  clearEntry() {
    if (document.getElementById('journal-entry')?.value) {
      if (confirm('Clear your entry?')) {
        document.getElementById('journal-entry').value = '';
        document.getElementById('word-count').textContent = '0 words';
        document.getElementById('ai-reflection').className = 'hidden';
      }
    }
  },

  renderHistory(el) {
    const journals = MB.store.get('journals', []).slice().reverse();
    el.innerHTML = `
      <div class="flex gap-3 mb-4">
        <input type="text" class="form-input" id="journal-search" placeholder="🔍 Search entries…" style="flex:1" oninput="Journal.filterHistory(this.value)">
        <button class="btn btn-ghost btn-sm" onclick="Journal.exportPDF()">📄 Export</button>
      </div>
      <div id="journal-history-list" class="stagger-children">
        ${journals.length ? journals.map(j => this.historyCard(j)).join('') : `
          <div class="text-center mt-8">
            <div style="font-size:3rem;margin-bottom:12px">📓</div>
            <p class="text-muted">No journal entries yet.<br>Start writing to see your history here.</p>
          </div>`}
      </div>
    `;
  },

  historyCard(j) {
    const decoded = MB.decode(j.content);
    return `
      <div class="card mb-3 journal-entry-card" data-content="${decoded.toLowerCase()}">
        <div class="flex justify-between items-start mb-2">
          <span class="badge badge-${this.categoryColor(j.category)}">${this.categoryLabel(j.category)}</span>
          <span class="text-xs text-muted">${MB.formatDate(j.date)}</span>
        </div>
        ${j.prompt ? `<p class="text-xs text-muted mb-2" style="font-style:italic">"${MB.truncate(j.prompt, 60)}"</p>` : ''}
        <p class="text-sm" style="color:var(--c-text);line-height:1.6">${MB.truncate(decoded, 150)}</p>
        <div class="flex justify-between items-center mt-3">
          <span class="text-xs text-muted">${j.wordCount} words</span>
          <button class="btn btn-ghost btn-sm" onclick="Journal.expandEntry(this, '${j.id}')">Read more</button>
        </div>
      </div>`;
  },

  filterHistory(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.journal-entry-card').forEach(el => {
      const content = el.dataset.content || '';
      el.style.display = !q || content.includes(q) ? '' : 'none';
    });
  },

  expandEntry(btn, id) {
    const journals = MB.store.get('journals', []);
    const entry = journals.find(j => j.id === id);
    if (!entry) return;
    const decoded = MB.decode(entry.content);
    const card = btn.closest('.card');
    const p = card.querySelector('p:last-of-type');
    if (btn.textContent === 'Read more') {
      p.textContent = decoded;
      btn.textContent = 'Show less';
    } else {
      p.textContent = MB.truncate(decoded, 150);
      btn.textContent = 'Read more';
    }
  },

  exportPDF() {
    const journals = MB.store.get('journals', []);
    if (!journals.length) { MB.toast('No entries to export!', 'error'); return; }
    const w = window.open('', '_blank');
    const content = journals.map(j => `
      <div style="margin-bottom:32px;page-break-inside:avoid">
        <div style="font-weight:bold;font-size:14px;color:#666;margin-bottom:4px">${MB.formatDate(j.date)} · ${this.categoryLabel(j.category)}</div>
        ${j.prompt ? `<div style="font-style:italic;color:#888;font-size:13px;margin-bottom:8px">${j.prompt}</div>` : ''}
        <div style="font-size:15px;line-height:1.7;white-space:pre-wrap">${MB.decode(j.content)}</div>
      </div>
    `).join('<hr style="margin:24px 0;border:none;border-top:1px solid #eee">');
    w.document.write(`<!DOCTYPE html><html><head><title>My MindBloom Journal</title>
      <style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 20px;color:#222}
      h1{font-size:28px;margin-bottom:4px}h2{font-size:14px;color:#888;font-weight:normal;margin-bottom:32px}
      @media print{body{margin:0;padding:20px}}</style></head>
      <body><h1>My MindBloom Journal</h1><h2>Exported on ${new Date().toLocaleDateString()}</h2>${content}</body></html>`);
    w.document.close();
    w.print();
  }
};

window.Journal = Journal;
