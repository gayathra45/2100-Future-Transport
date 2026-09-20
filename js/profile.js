/**
 * ORBIT 2100 — User Profile & Holographic Digital Travel Pass
 * Displays user identity, carbon savings, credits, and interactive pass
 */

class OrbitProfile {
  constructor() {
    this.modal = document.getElementById('profile-modal');
    this.init();
  }

  init() {
    document.querySelectorAll('[data-open-profile]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    document.querySelectorAll('[data-close-profile]').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });
  }

  open() {
    if (this.modal) {
      this.modal.classList.add('active');
      this.modal.setAttribute('aria-hidden', 'false');
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.remove('active');
      this.modal.setAttribute('aria-hidden', 'true');
    }
  }
}

window.orbitProfile = new OrbitProfile();
