/**
 * ORBIT 2100 — Adaptive Journey & Accessibility Engine
 * Handles full WCAG 2.2 AAA accessibility, adaptive preferences, and simulated voice guidance
 */

class OrbitAccessibility {
  constructor() {
    this.modal = document.getElementById('accessibility-modal');
    this.voiceBanner = document.getElementById('voice-guidance-banner');
    this.voiceText = document.getElementById('voice-guidance-text');
    this.init();
  }

  init() {
    this.applyStoredPreferences();
    this.bindEvents();

    // Listen to state changes
    window.orbitState.subscribe('accessibility', () => {
      this.applyStoredPreferences();
    });
  }

  applyStoredPreferences() {
    const prefs = window.orbitState.get('accessibility') || {};
    const root = document.documentElement;

    // Apply High Contrast
    if (prefs.highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    // Apply Large Text
    if (prefs.largeText) {
      root.setAttribute('data-large-text', 'true');
    } else {
      root.removeAttribute('data-large-text');
    }

    // Apply Low Sensory
    if (prefs.lowSensory) {
      root.setAttribute('data-low-sensory', 'true');
    } else {
      root.removeAttribute('data-low-sensory');
    }

    // Apply Step Free
    if (prefs.stepFree) {
      root.setAttribute('data-step-free', 'true');
    } else {
      root.removeAttribute('data-step-free');
    }

    // Synchronize Form Checkboxes if modal is rendered
    document.querySelectorAll('[data-a11y-toggle]').forEach(toggle => {
      const key = toggle.getAttribute('data-a11y-toggle');
      if (key && prefs[key] !== undefined) {
        toggle.checked = prefs[key];
      }
    });
  }

  bindEvents() {
    // Modal Open Buttons
    document.querySelectorAll('[data-open-a11y-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    });

    // Close Modal
    document.querySelectorAll('[data-close-a11y-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModal();
      });
    });

    // Toggles
    document.querySelectorAll('[data-a11y-toggle]').forEach(toggle => {
      toggle.addEventListener('change', () => {
        const key = toggle.getAttribute('data-a11y-toggle');
        const isChecked = toggle.checked;
        window.orbitState.updateAccessibility(key, isChecked);

        if (key === 'stepFree' && isChecked) {
          window.showToast?.('Step-Free Journey Active', 'Elevator and level-boarding connections highlighted.');
          // Re-generate routes if planner is active
          const query = window.orbitState.get('plannerQuery');
          if (query) {
            window.orbitPlanner?.generateRoutes(query.from, query.to, false);
          }
        }
      });
    });
  }

  openModal() {
    if (this.modal) {
      this.modal.classList.add('active');
      this.modal.setAttribute('aria-hidden', 'false');
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      this.modal.setAttribute('aria-hidden', 'true');
    }
  }

  simulateVoiceGuidance(text) {
    if (!this.voiceBanner || !this.voiceText) return;

    this.voiceText.textContent = text;
    this.voiceBanner.classList.add('show');

    // Web Speech API fallback/enhancement if supported
    if ('speechSynthesis' in window && !window.orbitState.get('accessibility')?.lowSensory) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Safe graceful degradation
      }
    }

    setTimeout(() => {
      this.voiceBanner.classList.remove('show');
    }, 6000);
  }
}

window.orbitAccessibility = new OrbitAccessibility();
