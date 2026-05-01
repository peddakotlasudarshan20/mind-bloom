/* ============================================
   MindBloom — AI Chat (Powered by Gemini)
   ============================================ */

const AIChat = {
  messages: [],
  isProcessing: false,
  // Retrieve Groq API key from environment variable for security.
  // Ensure the key is set in a secure manner (e.g., via a .env file or server config).
  GROQ_API_KEY: typeof process !== 'undefined' && process.env && process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY : '',

  systemPrompt: `You are MindMate, a warm, empathetic, and deeply caring AI mental wellness companion built into the MindBloom app. You are like a best friend who genuinely cares — supportive, non-judgmental, and healing. 

Your role:
- Listen deeply and make the user feel truly heard and understood
- Respond with warmth, empathy, and emotional intelligence
- Gently suggest actionable coping strategies when appropriate
- Provide short affirmations and encouragement
- If the user seems to be in crisis (mentions self-harm, suicide), always provide crisis hotline info: call 988 or text HOME to 741741

Tone rules:
- Never clinical or robotic — always human, warm, conversational
- Keep responses concise (2–4 sentences usually) unless they need more
- Use soft language — "it sounds like", "I hear you", "that makes sense"
- Never give lists unless the user specifically asks for tips
- React to emotions first, before any advice`,

  quickPrompts: [
    { emoji: '😔', text: "I am feeling sad" },
    { emoji: '😰', text: "I am really anxious" },
    { emoji: '😤', text: "I am overwhelmed" },
    { emoji: '💬', text: "I just need to talk" },
  ],

  init() {
    this.loadMessages();
  },

  loadMessages() {
    const saved = MB.store.get('chatMessages_v2', []);
    this.messages = saved.length ? saved : [
      {
        role: 'assistant',
        content: "Hey, I'm MindMate 💜 I'm here to listen, support you, and be with you through whatever you're feeling. What's on your mind today?",
        timestamp: Date.now()
      }
    ];
  },

  saveMessages() {
    MB.store.set('chatMessages_v2', this.messages.slice(-60));
  },

  async callGroq(userText) {
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    // Build conversation history for context (last 10 messages)
    const priorMessages = this.messages.slice(0, -1).slice(-10);
    const history = priorMessages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const payload = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: this.systemPrompt },
        ...history,
        { role: 'user', content: userText }
      ],
      temperature: 0.85,
      max_tokens: 350
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.error) {
      console.error('Groq error:', JSON.stringify(data.error));
      return null;
    }
    return data?.choices?.[0]?.message?.content?.trim() || null;
  },

  async sendMessage(text) {
    if (!text.trim() || this.isProcessing) return;
    this.isProcessing = true;

    this.messages.push({ role: 'user', content: text.trim(), timestamp: Date.now() });
    this.renderMessages();
    this.showTypingIndicator();

    try {
      const reply = await this.callGroq(text.trim());
      this.hideTypingIndicator();
      this.messages.push({
        role: 'assistant',
        content: reply || "I'm here with you. Tell me more — what are you feeling right now?",
        timestamp: Date.now()
      });
    } catch (e) {
      this.hideTypingIndicator();
      console.error('Chat error:', e);
      this.messages.push({
        role: 'assistant',
        content: `⚠️ Could not reach Gemini right now (${e.message}). Check your internet connection or API key.`,
        timestamp: Date.now()
      });
    }

    this.saveMessages();
    this.renderMessages();
    this.isProcessing = false;
  },

  sendQuick(index) {
    const prompt = this.quickPrompts[parseInt(index)];
    if (prompt) this.sendMessage(prompt.text);
  },

  handleSend() {
    const input = document.getElementById('chat-input');
    const text = input?.value.trim();
    if (text) {
      input.value = '';
      input.style.height = 'auto';
      this.adjustSendBtn(false);
      this.sendMessage(text);
    }
  },

  showTypingIndicator() {
    const list = document.getElementById('chat-message-list');
    if (!list) return;
    const el = document.createElement('div');
    el.id = 'typing-indicator';
    el.innerHTML = `
      <div style="display:flex;align-items:flex-end;gap:10px;padding:4px 0;margin-bottom:4px">
        <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7C6EF5,#52E5A3);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">🤖</div>
        <div style="background:#141827;border:1px solid rgba(124,110,245,0.25);border-radius:18px 18px 18px 4px;padding:12px 16px;display:inline-flex;align-items:center;gap:5px">
          <span style="width:7px;height:7px;border-radius:50%;background:#7C6EF5;display:inline-block;animation:typingDot 1.2s ease-in-out infinite"></span>
          <span style="width:7px;height:7px;border-radius:50%;background:#7C6EF5;display:inline-block;animation:typingDot 1.2s ease-in-out 0.2s infinite"></span>
          <span style="width:7px;height:7px;border-radius:50%;background:#7C6EF5;display:inline-block;animation:typingDot 1.2s ease-in-out 0.4s infinite"></span>
        </div>
      </div>`;
    list.appendChild(el);
    list.scrollTop = list.scrollHeight;
  },

  hideTypingIndicator() {
    document.getElementById('typing-indicator')?.remove();
  },

  adjustSendBtn(hasText) {
    const btn = document.getElementById('chat-send-btn');
    if (btn) {
      btn.style.background = hasText
        ? 'linear-gradient(135deg,#7C6EF5,#52E5A3)'
        : 'var(--c-surface)';
      btn.style.color = hasText ? 'white' : 'var(--c-text-faint)';
    }
  },

  renderMessages() {
    const list = document.getElementById('chat-message-list');
    if (!list) return;
    list.innerHTML = this.messages.map(m => this.renderBubble(m)).join('');
    list.scrollTop = list.scrollHeight;
  },

  renderBubble(msg) {
    const isUser = msg.role === 'user';
    const time = new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (isUser) {
      return `
        <div style="display:flex;justify-content:flex-end;padding:3px 0;margin-bottom:6px">
          <div style="max-width:78%">
            <div style="
              background:linear-gradient(135deg,#7C6EF5,#5B51D8);
              color:white; border-radius:18px 18px 4px 18px;
              padding:11px 16px; font-size:0.92rem; line-height:1.5;
              box-shadow:0 2px 12px rgba(124,110,245,0.3);
            ">${this.escapeHtml(msg.content)}</div>
            <div style="text-align:right;font-size:0.68rem;color:var(--c-text-faint);margin-top:4px;padding-right:4px">${time}</div>
          </div>
        </div>`;
    } else {
      return `
        <div style="display:flex;align-items:flex-end;gap:10px;padding:3px 0;margin-bottom:6px">
          <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7C6EF5,#52E5A3);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;box-shadow:0 0 10px rgba(124,110,245,0.3)">🤖</div>
          <div style="max-width:78%">
            <div style="
              background:#141827;
              border:1px solid rgba(124,110,245,0.2);
              color:var(--c-text);border-radius:18px 18px 18px 4px;
              padding:11px 16px; font-size:0.92rem; line-height:1.6;
            ">${this.escapeHtml(msg.content)}</div>
            <div style="font-size:0.68rem;color:var(--c-text-faint);margin-top:4px;padding-left:4px">${time}</div>
          </div>
        </div>`;
    }
  },

  render() {
    const el = document.getElementById('screen-chat');
    if (!el) return;

    el.style.padding = '0';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.height = 'calc(100vh - 72px)';
    el.style.overflow = 'hidden';

    el.innerHTML = `
      <style>
        @keyframes typingDot{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-6px);opacity:1}}
        @keyframes bubbleIn{from{opacity:0;transform:scale(0.92) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        #chat-message-list > div { animation: bubbleIn 0.2s ease; }
        #chat-input:focus { outline:none; }
      </style>

      <!-- Header -->
      <div style="
        padding:14px 20px 12px;
        background:linear-gradient(180deg,var(--c-surface) 0%,transparent 100%);
        border-bottom:1px solid rgba(255,255,255,0.05);
        display:flex; align-items:center; gap:12px; flex-shrink:0;
      ">
        <div style="position:relative">
          <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#7C6EF5,#52E5A3);display:flex;align-items:center;justify-content:center;font-size:1.4rem;box-shadow:0 0 18px rgba(124,110,245,0.45)">🤖</div>
          <div style="position:absolute;bottom:1px;right:1px;width:11px;height:11px;border-radius:50%;background:#52E5A3;border:2px solid var(--c-surface);animation:ai-breathe 2s ease-in-out infinite"></div>
        </div>
        <div style="flex:1">
          <div style="font-family:var(--font-heading);font-weight:700;font-size:1.05rem;color:var(--c-text)">MindMate</div>
          <div style="font-size:0.72rem;color:#52E5A3;font-weight:600;display:flex;align-items:center;gap:4px">
            <span style="width:6px;height:6px;border-radius:50%;background:#52E5A3;display:inline-block"></span>
            Online
          </div>
        </div>
        <button onclick="AIChat.clearChat()" style="background:var(--c-card);border:1px solid var(--c-border);border-radius:10px;padding:6px 12px;font-size:0.72rem;color:var(--c-text-muted);cursor:pointer;font-family:var(--font-heading)">Clear</button>
      </div>

      <!-- Messages -->
      <div id="chat-message-list" style="
        flex:1; overflow-y:auto; padding:16px 16px 8px;
        display:flex; flex-direction:column; gap:2px;
        scroll-behavior:smooth;
      ">
        ${this.messages.map(m => this.renderBubble(m)).join('')}
      </div>

      <!-- Quick Prompts (only show if just 1 message) -->
      ${this.messages.length <= 1 ? `
      <div style="padding:8px 14px;display:flex;gap:8px;flex-wrap:nowrap;overflow-x:auto;flex-shrink:0;scrollbar-width:none">
        ${this.quickPrompts.map((p, i) => `
          <button data-qi="${i}" onclick="AIChat.sendQuick(this.dataset.qi)" style="
            flex-shrink:0; background:rgba(124,110,245,0.1);
            border:1px solid rgba(124,110,245,0.25); border-radius:999px;
            padding:7px 14px; font-size:0.8rem; color:var(--c-text-muted);
            cursor:pointer; font-family:var(--font-heading); white-space:nowrap;
            transition:all 0.2s ease;
          " onmouseover="this.style.background='rgba(124,110,245,0.2)'" onmouseout="this.style.background='rgba(124,110,245,0.1)'">${p.emoji} ${p.text}</button>
        `).join('')}
      </div>` : ''}

      <!-- Input Area -->
      <div style="
        padding:12px 16px 16px;
        background:var(--c-surface);
        border-top:1px solid rgba(255,255,255,0.05);
        flex-shrink:0;
      ">
        <div style="
          display:flex; align-items:center; gap:10px;
          background:var(--c-card);
          border:1.5px solid rgba(124,110,245,0.25);
          border-radius:999px; padding:8px 8px 8px 18px;
          transition:border-color 0.2s;
        " onfocusin="this.style.borderColor='rgba(124,110,245,0.6)'" onfocusout="this.style.borderColor='rgba(124,110,245,0.25)'">
          <input
            id="chat-input"
            type="text"
            placeholder="Share how you're feeling…"
            style="flex:1;background:none;border:none;color:var(--c-text);font-size:0.92rem;font-family:var(--font-body)"
            onkeypress="if(event.key==='Enter')AIChat.handleSend()"
            oninput="AIChat.adjustSendBtn(this.value.trim().length>0)"
            autocomplete="off"
          >
          <button
            id="chat-send-btn"
            onclick="AIChat.handleSend()"
            style="
              width:40px;height:40px;border-radius:50%;
              background:var(--c-surface);color:var(--c-text-faint);
              border:none;cursor:pointer;
              display:flex;align-items:center;justify-content:center;
              transition:all 0.2s ease; flex-shrink:0;
            "
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div style="text-align:center;font-size:0.68rem;color:var(--c-text-faint);margin-top:8px">MindMate listens, but is not a substitute for professional help.</div>
      </div>
    `;

    const list = document.getElementById('chat-message-list');
    if (list) list.scrollTop = list.scrollHeight;

    document.getElementById('chat-input')?.focus();
  },

  clearChat() {
    this.messages = [{
      role: 'assistant',
      content: "Hey, I'm MindMate 💜 I'm here to listen, support you, and be with you through whatever you're feeling. What's on your mind today?",
      timestamp: Date.now()
    }];
    this.saveMessages();
    this.render();
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

window.AIChat = AIChat;