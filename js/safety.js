/**
 * ORBIT 2100 — Safety Center & Emergency Assist Module
 * Real-time network telemetry, vehicle health stats, and safe emergency assist workflow
 */

class OrbitSafetyCenter {
  constructor() {
    this.emergencyModal = document.getElementById('emergency-assist-modal');
    this.init();
  }

  init() {
    // Open Emergency Modal
    document.querySelectorAll('[data-open-emergency]').forEach(btn => {
      btn.addEventListener('click', () => this.openEmergencyModal());
    });

    // Close Emergency Modal
    document.querySelectorAll('[data-close-emergency]').forEach(btn => {
      btn.addEventListener('click', () => this.closeEmergencyModal());
    });

    // Confirm Emergency Dispatch
    const confirmBtn = document.getElementById('emergency-confirm-dispatch-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.executeEmergencyDispatch());
    }
  }

  openEmergencyModal() {
    if (this.emergencyModal) {
      this.emergencyModal.classList.add('active');
      this.emergencyModal.setAttribute('aria-hidden', 'false');
    }
  }

  closeEmergencyModal() {
    if (this.emergencyModal) {
      this.emergencyModal.classList.remove('active');
      this.emergencyModal.setAttribute('aria-hidden', 'true');
    }
  }

  executeEmergencyDispatch() {
    this.closeEmergencyModal();
    window.showToast?.('Rapid Emergency Pod Dispatched', 'Autonomous Medical & Safety Escort synchronized. ETA: 75 seconds to your coordinates.');
    
    // Simulate audio alert & visual confirmation
    window.orbitAccessibility?.simulateVoiceGuidance("Emergency assist active. An autonomous response pod is en route to Colombo Central Concourse.");
  }
}

window.orbitSafety = new OrbitSafetyCenter();
