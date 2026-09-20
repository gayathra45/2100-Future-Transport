/**
 * ORBIT 2100 — ORBIT AI Journey Assistant
 * Simulated natural language transit assistant with quick prompts and route launching
 */

class OrbitAIAssistant {
  constructor() {
    this.modal = document.getElementById('orbit-ai-modal');
    this.openBtn = document.getElementById('orbit-ai-floating-btn');
    this.messagesContainer = document.getElementById('ai-chat-messages');
    this.chipsContainer = document.getElementById('ai-quick-chips');
    this.chatInput = document.getElementById('ai-chat-input');
    this.sendBtn = document.getElementById('ai-send-btn');

    this.init();
  }

  init() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.open());
    }

    document.querySelectorAll('[data-close-ai-modal]').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    if (this.sendBtn && this.chatInput) {
      this.sendBtn.addEventListener('click', () => this.handleSendMessage());
      this.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSendMessage();
      });
    }

    this.renderPromptChips();
  }

  open() {
    if (this.modal) {
      this.modal.classList.add('active');
      this.modal.setAttribute('aria-hidden', 'false');
      if (this.chatInput) this.chatInput.focus();
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.remove('active');
      this.modal.setAttribute('aria-hidden', 'true');
    }
  }

  renderPromptChips() {
    if (!this.chipsContainer) return;

    const prompts = window.ORBIT_DATA.aiDialogues.prompts;
    this.chipsContainer.innerHTML = prompts.map((p, idx) => `
      <button class="chip" data-ai-chip-idx="${idx}" style="font-size: 11px;">
        ${p.label}
      </button>
    `).join('');

    this.chipsContainer.querySelectorAll('[data-ai-chip-idx]').forEach(chip => {
      chip.addEventListener('click', () => {
        const idx = parseInt(chip.getAttribute('data-ai-chip-idx'), 10);
        const prompt = prompts[idx];
        if (prompt) {
          this.addMessage(prompt.query, 'user');
          this.respondAI(prompt);
        }
      });
    });
  }

  handleSendMessage() {
    const text = this.chatInput.value.trim();
    if (!text) return;

    this.addMessage(text, 'user');
    this.chatInput.value = '';

    // Match simulated response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let match = window.ORBIT_DATA.aiDialogues.prompts.find(p => 
        lower.includes(p.query.toLowerCase()) || 
        p.query.toLowerCase().split(' ').some(w => w.length > 4 && lower.includes(w))
      );

      if (match) {
        this.respondAI(match);
      } else {
        this.addMessage("I calculated your custom multi-modal route across 2100 autonomous links. Would you like me to open the synchronized planner?", 'ai', {
          from: 'Colombo Central Grand Hub',
          to: 'Oceanic District Floating Plaza'
        });
      }
    }, 600);
  }

  respondAI(promptObj) {
    if (promptObj.enableStepFree) {
      window.orbitState.updateAccessibility('stepFree', true);
    }
    this.addMessage(promptObj.reply, 'ai', promptObj.targetRoute);
  }

  addMessage(text, sender = 'ai', targetRoute = null) {
    if (!this.messagesContainer) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble chat-bubble-${sender}`;
    
    let actionBtnHtml = '';
    if (targetRoute && sender === 'ai') {
      actionBtnHtml = `
        <div style="margin-top: 8px;">
          <button class="btn btn-primary" style="padding: 6px 14px; font-size: 12px;" data-ai-apply-route>
            <span>Plan This Route Now</span>
            ${window.renderIcon('arrowRight', 'icon-sm')}
          </button>
        </div>
      `;
    }

    bubble.innerHTML = `<div>${text}</div>${actionBtnHtml}`;
    this.messagesContainer.appendChild(bubble);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    const applyBtn = bubble.querySelector('[data-ai-apply-route]');
    if (applyBtn && targetRoute) {
      applyBtn.addEventListener('click', () => {
        const fromInput = document.getElementById('planner-from-input');
        const toInput = document.getElementById('planner-to-input');
        if (fromInput && toInput) {
          fromInput.value = targetRoute.from;
          toInput.value = targetRoute.to;
        }
        this.close();
        window.orbitRouter.navigate('home');
        window.orbitPlanner?.planJourney();
      });
    }
  }
}

window.orbitAI = new OrbitAIAssistant();
