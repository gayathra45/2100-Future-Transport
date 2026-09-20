/**
 * ORBIT 2100 — Simple Mode (Ultra-Inclusive Accessible View)
 * Clean, high-readability 1-step transit interface
 */

class OrbitSimpleMode {
  constructor() {
    this.container = document.getElementById('simple-mode-view-container');
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="simple-mode-view active">
        <!-- Header Banner -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
          <div>
            <span class="badge badge-balanced">INCLUSIVE SIMPLE VIEW</span>
            <h1 style="font-size: var(--font-size-xl); margin-top: 4px;">Where are you going?</h1>
          </div>
          <button class="btn btn-secondary" id="simple-exit-btn">
            ${window.renderIcon('close', 'icon-sm')}
            <span>Standard View</span>
          </button>
        </div>

        <!-- Hero Destination Card -->
        <div class="simple-hero-card">
          <label style="font-size: var(--font-size-md); font-weight: var(--font-weight-bold); display: block; margin-bottom: var(--space-3);">
            Select your destination:
          </label>
          
          <button class="simple-quick-dest-btn" data-simple-dest="Oceanic District Floating Plaza">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(56, 217, 255, 0.15); display: flex; align-items: center; justify-content: center; color: var(--color-accent-cyan);">
                ${window.renderIcon('ocean', 'icon-md')}
              </div>
              <div>
                <div style="font-size: var(--font-size-lg); font-weight: 700;">Oceanic District Floating Plaza</div>
                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); font-weight: normal;">12 minutes away • Step-free Ramp</div>
              </div>
            </div>
            ${window.renderIcon('arrowRight', 'icon-md')}
          </button>

          <button class="simple-quick-dest-btn" data-simple-dest="Sky Gardens Bio-Tower">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; color: #10B981;">
                ${window.renderIcon('tree', 'icon-md')}
              </div>
              <div>
                <div style="font-size: var(--font-size-lg); font-weight: 700;">Sky Gardens Bio-Tower</div>
                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); font-weight: normal;">16 minutes away • Direct AirPod</div>
              </div>
            </div>
            ${window.renderIcon('arrowRight', 'icon-md')}
          </button>

          <button class="simple-quick-dest-btn" data-simple-dest="Vertical City Center (Eco-Arcology)">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(168, 85, 247, 0.15); display: flex; align-items: center; justify-content: center; color: var(--color-accent-purple);">
                ${window.renderIcon('academic', 'icon-md')}
              </div>
              <div>
                <div style="font-size: var(--font-size-lg); font-weight: 700;">Vertical City Center</div>
                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); font-weight: normal;">9 minutes away • Autonomous Bus</div>
              </div>
            </div>
            ${window.renderIcon('arrowRight', 'icon-md')}
          </button>

          <button class="simple-quick-dest-btn" data-simple-dest="Lunar Gateway Orbital Terminal">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; color: #F59E0B;">
                ${window.renderIcon('rocket', 'icon-md')}
              </div>
              <div>
                <div style="font-size: var(--font-size-lg); font-weight: 700;">Lunar Gateway Terminal</div>
                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); font-weight: normal;">24 minutes away • High-Speed Maglev</div>
              </div>
            </div>
            ${window.renderIcon('arrowRight', 'icon-md')}
          </button>
        </div>

        <!-- Live Step Instruction Box (When destination clicked) -->
        <div id="simple-instructions-box" style="display: none;">
          <h2 style="font-size: var(--font-size-lg); margin-bottom: var(--space-4);">Your Easy Steps</h2>

          <div class="simple-step-card">
            <div class="simple-step-num">1</div>
            <div>
              <div style="font-size: var(--font-size-md); font-weight: var(--font-weight-bold); color: var(--color-text-primary);">
                Walk to Concourse Gate 3
              </div>
              <p style="font-size: var(--font-size-base); color: var(--color-text-secondary); margin-top: 4px;">
                Follow the bright cyan arrows on the floor. Elevator is on your right.
              </p>
            </div>
          </div>

          <div class="simple-step-card">
            <div class="simple-step-num">2</div>
            <div>
              <div style="font-size: var(--font-size-md); font-weight: var(--font-weight-bold); color: var(--color-text-primary);">
                Board your vehicle in 4 minutes
              </div>
              <p style="font-size: var(--font-size-base); color: var(--color-text-secondary); margin-top: 4px;">
                Your carriage is reserved automatically. Doors open automatically.
              </p>
            </div>
          </div>

          <div class="simple-step-card">
            <div class="simple-step-num">3</div>
            <div>
              <div style="font-size: var(--font-size-md); font-weight: var(--font-weight-bold); color: var(--color-text-primary);">
                Arrive smoothly at your destination
              </div>
              <p style="font-size: var(--font-size-base); color: var(--color-text-secondary); margin-top: 4px;">
                Total trip time is 12 minutes. You will receive an audio chime when to exit.
              </p>
            </div>
          </div>

          <button class="btn btn-accent-mint" id="simple-start-voice-btn" style="width: 100%; padding: var(--space-4); margin-top: var(--space-4);">
            ${window.renderIcon('volume', 'icon-md')}
            <span>Read Instructions Aloud</span>
          </button>
        </div>
      </div>
    `;

    // Event listeners
    this.container.querySelectorAll('[data-simple-dest]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dest = btn.getAttribute('data-simple-dest');
        const box = document.getElementById('simple-instructions-box');
        if (box) {
          box.style.display = 'block';
          box.scrollIntoView({ behavior: 'smooth' });
        }
        window.showToast?.('Simple Journey Selected', `Clear guidance active for ${dest}`);
      });
    });

    const exitBtn = document.getElementById('simple-exit-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        window.orbitState.set('simpleMode', false);
        window.orbitRouter.navigate('home');
      });
    }

    const voiceBtn = document.getElementById('simple-start-voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        window.orbitAccessibility?.simulateVoiceGuidance("Walk to Concourse Gate 3. Your vehicle arrives in 4 minutes.");
      });
    }
  }
}

window.orbitSimpleMode = new OrbitSimpleMode();
