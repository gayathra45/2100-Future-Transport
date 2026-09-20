/**
 * ORBIT 2100 — Master Application Initialization & Interactions
 * Toast system, theme switcher, FAQ accordion, and interactive animations
 */

// Global Toast System
window.showToast = function(title, desc, duration = 3500) {
  const container = document.getElementById('global-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon">
      <svg class="icon icon-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${desc}</div>
    </div>
    <button class="btn-subtle" style="padding: 2px; color: #FFFFFF; opacity: 0.7;" aria-label="Close">
      ✕
    </button>
  `;

  const closeBtn = toast.querySelector('button');
  const dismiss = () => {
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 250);
  };

  closeBtn.addEventListener('click', dismiss);
  container.appendChild(toast);

  setTimeout(dismiss, duration);
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Management (Light / Dark)
  const themeToggles = document.querySelectorAll('[data-toggle-theme]');
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    window.orbitState?.set('theme', theme);
    themeToggles.forEach(btn => {
      btn.innerHTML = theme === 'dark' ? 
        `<svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>` : 
        `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`);
    });
  };

  const initialTheme = window.orbitState?.get('theme') || 'light';
  applyTheme(initialTheme);

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = window.orbitState?.get('theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      window.showToast?.(`${next === 'dark' ? 'Dark' : 'Light'} Mode Active`, 'Quantum display palette synchronized.');
    });
  });

  // 2. FAQ Accordion Interaction
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    }
  });

  // 3. Fleet Showcase Book Buttons
  document.querySelectorAll('[data-fleet-book]').forEach(card => {
    card.addEventListener('click', () => {
      const vehicleId = card.getAttribute('data-fleet-book');
      const vCards = document.querySelectorAll('.vehicle-card-modern');
      vCards.forEach(vc => {
        if (vc.getAttribute('data-vehicle-id') === vehicleId) {
          vc.click();
        }
      });
      window.scrollTo({ top: 120, behavior: 'smooth' });
    });
  });

  // 4. Footer Comm Link Form
  const commForm = document.getElementById('footer-comm-form');
  if (commForm) {
    commForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('comm-id-input');
      const val = input ? input.value.trim() : '';
      if (val) {
        window.showToast?.('Quantum Frequency Linked', `Subscribed ${val} to island-wide transit telemetry broadcasts.`);
        if (input) input.value = '';
      } else {
        window.showToast?.('Comm Linked', 'Subscribed to 2100 transit updates.');
      }
    });
  }

  // 5. 2100 Travel Time & Carbon Offset Calculator
  const originSelect = document.getElementById('calc-origin-select');
  const destSelect = document.getElementById('calc-dest-select');
  const modeBtns = document.querySelectorAll('[data-calc-mode]');
  const stepFreeCheck = document.getElementById('calc-stepfree-check');
  const dispatchBtn = document.getElementById('calc-dispatch-btn');

  let activeCalcMode = 'multimodal';

  // Hub coordinates (Sri Lanka 2100 network)
  const hubCoords = {
    'Colombo Central Grand Hub': { lat: 6.9271, lng: 79.8612 },
    'Oceanic District Floating Plaza': { lat: 6.9400, lng: 79.8400 },
    'Kandy SkyHub': { lat: 7.2906, lng: 80.6337 },
    'Galle Fort Marine Gateway': { lat: 6.0535, lng: 80.2210 },
    'Jaffna Solar Hub': { lat: 9.6615, lng: 80.0255 },
    'Trincomalee Deep-Sea Aeroway': { lat: 8.5874, lng: 81.2152 },
    'Anuradhapura Heritage Nexus': { lat: 8.3114, lng: 80.4037 },
    'Batticaloa Lagoon Aerodome': { lat: 7.7102, lng: 81.6924 }
  };

  function calculateDistance(c1, c2) {
    if (!c1 || !c2) return 116;
    const R = 6371; // km
    const dLat = (c2.lat - c1.lat) * Math.PI / 180;
    const dLon = (c2.lng - c1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = Math.round(R * c);
    return Math.max(d, 8);
  }

  function updateCalculator() {
    const origin = originSelect ? originSelect.value : 'Colombo Central Grand Hub';
    const dest = destSelect ? destSelect.value : 'Kandy SkyHub';

    const c1 = hubCoords[origin] || { lat: 6.9271, lng: 79.8612 };
    const c2 = hubCoords[dest] || { lat: 7.2906, lng: 80.6337 };
    let distance = calculateDistance(c1, c2);

    // Speeds in km/h
    let speed = 490;
    let modeLabel = 'Swarm Sync';
    let baseFare = 15;
    let ratePerKm = 0.24;

    if (activeCalcMode === 'airpod') {
      speed = 450;
      modeLabel = 'AirPod Direct';
      baseFare = 22;
      ratePerKm = 0.32;
    } else if (activeCalcMode === 'maglev') {
      speed = 650;
      modeLabel = 'Maglev Spine';
      baseFare = 18;
      ratePerKm = 0.20;
    } else if (activeCalcMode === 'shuttle') {
      speed = 180;
      modeLabel = 'Autonomous Shuttle';
      baseFare = 8;
      ratePerKm = 0.12;
    }

    // Travel time in 2100 (minutes)
    const time2100Min = Math.max(Math.round((distance / speed) * 60) + 2, 4);

    // 2026 Historical road travel time (avg 42 km/h road traffic + delays)
    const time2026Min = Math.round((distance / 42) * 60) + 25;
    const diffMin = Math.max(time2026Min - time2100Min, 15);
    const diffHours = Math.floor(diffMin / 60);
    const diffRemMin = diffMin % 60;
    const timeSavedPct = Math.round((diffMin / time2026Min) * 100);

    // CO2 offset saved (0.16 kg per km vs 2026 combustion/hybrid)
    const co2Saved = (distance * 0.158).toFixed(1);

    // Q-Credits fare
    let fare = (baseFare + distance * ratePerKm).toFixed(2);
    if (stepFreeCheck && stepFreeCheck.checked) {
      // Step-free is subsidy discounted
      fare = (fare * 0.9).toFixed(2);
    }

    // Eco Karma
    const karma = Math.round(distance * 1.1 + 10);

    // Transfers
    const transfers = (activeCalcMode === 'multimodal' && distance > 150) ? '1 Synced' : '0 Transfers';

    // Update DOM
    const distEl = document.getElementById('calc-distance-text');
    if (distEl) distEl.textContent = `${distance} km Inter-City Route`;

    const timeEl = document.getElementById('calc-time-2100');
    if (timeEl) timeEl.textContent = `${time2100Min} mins`;

    const speedEl = document.getElementById('calc-speed-text');
    if (speedEl) speedEl.textContent = `(${modeLabel} • Avg ${speed} km/h)`;

    const compEl = document.getElementById('calc-comparison-text');
    if (compEl) {
      const timeStr = diffHours > 0 ? `${diffHours} hr${diffHours > 1 ? 's' : ''} ${diffRemMin} mins` : `${diffRemMin} mins`;
      compEl.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 4px;"><svg class="icon icon-xs" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> ${timeStr} faster than 2026 road transit (${timeSavedPct}% time saved)</span>`;
    }

    const co2El = document.getElementById('calc-co2-saved');
    if (co2El) co2El.textContent = `${co2Saved} kg`;

    const fareEl = document.getElementById('calc-fare-val');
    if (fareEl) fareEl.textContent = `${fare} Q`;

    const transferEl = document.getElementById('calc-transfers-val');
    if (transferEl) transferEl.textContent = transfers;

    const karmaEl = document.getElementById('calc-credits-val');
    if (karmaEl) karmaEl.textContent = `+${karma} Pts`;
  }

  if (originSelect && destSelect) {
    originSelect.addEventListener('change', () => {
      if (originSelect.value === destSelect.value) {
        const options = Array.from(destSelect.options);
        const diff = options.find(o => o.value !== originSelect.value);
        if (diff) destSelect.value = diff.value;
      }
      updateCalculator();
    });

    destSelect.addEventListener('change', () => {
      if (destSelect.value === originSelect.value) {
        const options = Array.from(originSelect.options);
        const diff = options.find(o => o.value !== destSelect.value);
        if (diff) originSelect.value = diff.value;
      }
      updateCalculator();
    });

    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCalcMode = btn.getAttribute('data-calc-mode') || 'multimodal';
        updateCalculator();
      });
    });

    if (stepFreeCheck) {
      stepFreeCheck.addEventListener('change', updateCalculator);
    }

    // Initial calculation
    updateCalculator();
  }

  // Instant Dispatch CTA
  if (dispatchBtn) {
    dispatchBtn.addEventListener('click', () => {
      const origin = originSelect ? originSelect.value : 'Colombo Central Grand Hub';
      const dest = destSelect ? destSelect.value : 'Kandy SkyHub';

      // Fill in wizard inputs
      const wizFrom = document.getElementById('wizard-from-input');
      const wizTo = document.getElementById('wizard-to-input');
      if (wizFrom) wizFrom.value = origin;
      if (wizTo) wizTo.value = dest;

      const planFrom = document.getElementById('planner-from-input');
      const planTo = document.getElementById('planner-to-input');
      if (planFrom) planFrom.value = origin;
      if (planTo) planTo.value = dest;

      if (window.orbitPlanner) {
        window.orbitPlanner.openWizard(1);
        window.showToast?.('✦ Route Transferred to Studio', `Configuring autonomous corridor for ${origin} ➔ ${dest}.`);
      }
    });
  }

  // 6. Rapid Response Escort Simulation
  const escortBtn = document.getElementById('test-escort-dispatch-btn');
  if (escortBtn) {
    escortBtn.addEventListener('click', () => {
      escortBtn.disabled = true;
      escortBtn.innerHTML = '<span>Dispatching Pod #ESC-01...</span>';
      window.showToast?.('Rapid Response Pod Dispatched', 'Simulated emergency beacon active. Intercept trajectory rendezvous in 48s.');
      setTimeout(() => {
        escortBtn.disabled = false;
        escortBtn.innerHTML = '<span>Simulate Emergency Pod Ping</span>';
      }, 3000);
    });
  }

  // 7. Commuter Plans & Subscription Payment Modal Flow
  const billingBtns = document.querySelectorAll('[data-billing-cycle]');
  let currentBillingCycle = 'monthly';

  billingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      billingBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentBillingCycle = btn.getAttribute('data-billing-cycle') || 'monthly';

      // Update all plan price displays
      document.querySelectorAll('.plan-price-val').forEach(priceEl => {
        const val = priceEl.getAttribute(`data-${currentBillingCycle}`);
        if (val !== null) {
          priceEl.textContent = val;
        }
      });

      window.showToast?.(
        `${currentBillingCycle === 'annual' ? 'Annual Pass Pricing Active' : 'Monthly Pricing Active'}`,
        currentBillingCycle === 'annual' ? '20% discount applied + 500 Bonus Karma credits.' : 'Standard flexible monthly billing.'
      );
    });
  });

  // Active Plan State in Modal
  let selectedPlanData = {
    id: 'eco-pioneer',
    name: 'Eco-Pioneer Infinite',
    icon: window.renderIcon ? window.renderIcon('leaf', 'icon-md') : '<svg class="icon icon-md" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg>',
    monthlyPrice: 119,
    annualPrice: 95,
    perks: 'Unlimited Multi-Modal Access • 2x Karma Multiplier • Spatial Tint & Neural Audio • 45s Rapid Escort',
    termMonths: 12,
    payMethod: 'neural'
  };

  const subModal = document.getElementById('subscription-payment-modal');
  const closeSubModalBtn = document.getElementById('close-sub-modal-btn');
  const confirmSubPayBtn = document.getElementById('confirm-sub-pay-btn');
  const subFormStep = document.getElementById('sub-form-step');
  const subScanHud = document.getElementById('sub-scan-hud');
  const subSuccessStep = document.getElementById('sub-success-step');
  const closeSubSuccessBtn = document.getElementById('close-sub-success-btn');
  const successDispatchRideBtn = document.getElementById('success-dispatch-ride-btn');

  function calculateModalReceipt() {
    const monthlyRate = selectedPlanData.monthlyPrice;
    const months = selectedPlanData.termMonths;

    let discountPct = 0;
    let bonusKarma = 0;

    if (months === 6) {
      discountPct = 0.10;
      bonusKarma = 200;
    } else if (months === 12) {
      discountPct = 0.20;
      bonusKarma = 500;
    }

    const grossTotal = monthlyRate * months;
    const discountAmount = grossTotal * discountPct;
    const netTotal = grossTotal - discountAmount;

    // Update Modal DOM
    const subtotalEl = document.getElementById('modal-subtotal');
    if (subtotalEl) subtotalEl.textContent = `${monthlyRate.toFixed(2)} Q / mo`;

    const termLabelEl = document.getElementById('modal-term-label');
    if (termLabelEl) {
      termLabelEl.textContent = months === 1 ? '1 Month' : (months === 6 ? '6 Months (Bi-Annual)' : '12 Months (Annual)');
    }

    const discountEl = document.getElementById('modal-discount');
    if (discountEl) {
      discountEl.textContent = discountAmount > 0 ? `-${discountAmount.toFixed(2)} Q (${Math.round(discountPct * 100)}% Off)` : '0.00 Q';
    }

    const karmaEl = document.getElementById('modal-karma');
    if (karmaEl) {
      karmaEl.textContent = bonusKarma > 0 ? `+${bonusKarma} Green Karma Pts` : '+50 Base Karma';
    }

    const totalDueEl = document.getElementById('modal-total-due');
    if (totalDueEl) {
      totalDueEl.textContent = `${netTotal.toFixed(2)} Q`;
    }
  }

  function openSubscriptionModal(btn) {
    const planId = btn.getAttribute('data-plan-id') || 'eco-pioneer';
    const planName = btn.getAttribute('data-plan-name') || 'Eco-Pioneer Infinite';
    const monthlyPrice = parseFloat(btn.getAttribute('data-monthly')) || 0;
    const annualPrice = parseFloat(btn.getAttribute('data-annual')) || 0;
    const perks = btn.getAttribute('data-perks') || '';

    // Map plan id to SVG vector icon
    const iconName = planId === 'commuter' ? 'bus' : (planId === 'explorer' ? 'train' : (planId === 'universal' ? 'wheelchair' : 'leaf'));
    const planIconSvg = window.renderIcon ? window.renderIcon(iconName, 'icon-md') : '';

    selectedPlanData.id = planId;
    selectedPlanData.name = planName;
    selectedPlanData.icon = planIconSvg;
    selectedPlanData.monthlyPrice = monthlyPrice;
    selectedPlanData.annualPrice = annualPrice;
    selectedPlanData.perks = perks;
    selectedPlanData.termMonths = currentBillingCycle === 'annual' ? 12 : 1;

    // Update Header in modal
    const iconEl = document.getElementById('modal-plan-icon');
    if (iconEl) iconEl.innerHTML = planIconSvg;

    const nameEl = document.getElementById('modal-plan-name');
    if (nameEl) nameEl.textContent = planName;

    const perksEl = document.getElementById('modal-perks-text');
    if (perksEl) perksEl.textContent = perks;

    // Highlight active term button
    document.querySelectorAll('.sub-term-btn').forEach(tb => {
      const m = parseInt(tb.getAttribute('data-term-months'), 10);
      if (m === selectedPlanData.termMonths) {
        tb.classList.add('active');
      } else {
        tb.classList.remove('active');
      }
    });

    // Reset steps
    if (subFormStep) subFormStep.style.display = 'flex';
    if (subScanHud) {
      subScanHud.style.display = 'none';
      subScanHud.classList.remove('active');
    }
    if (subSuccessStep) subSuccessStep.style.display = 'none';

    calculateModalReceipt();

    if (subModal) {
      subModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSubscriptionModal() {
    if (subModal) {
      subModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Hook Plan Select buttons
  document.querySelectorAll('.plan-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openSubscriptionModal(btn);
    });
  });

  if (closeSubModalBtn) {
    closeSubModalBtn.addEventListener('click', closeSubscriptionModal);
  }

  // Term selector buttons in modal
  document.querySelectorAll('.sub-term-btn').forEach(tBtn => {
    tBtn.addEventListener('click', () => {
      document.querySelectorAll('.sub-term-btn').forEach(b => b.classList.remove('active'));
      tBtn.classList.add('active');
      selectedPlanData.termMonths = parseInt(tBtn.getAttribute('data-term-months'), 10) || 12;
      calculateModalReceipt();
    });
  });

  // Payment method selection in modal
  document.querySelectorAll('.sub-pay-card').forEach(pCard => {
    pCard.addEventListener('click', () => {
      document.querySelectorAll('.sub-pay-card').forEach(c => c.classList.remove('active'));
      pCard.classList.add('active');
      selectedPlanData.payMethod = pCard.getAttribute('data-sub-pay') || 'neural';
    });
  });

  // Confirm and Authorize Pass Button
  if (confirmSubPayBtn) {
    confirmSubPayBtn.addEventListener('click', () => {
      if (subFormStep) subFormStep.style.display = 'none';
      if (subScanHud) {
        subScanHud.style.display = 'flex';
        subScanHud.classList.add('active');
      }

      // Simulate 2.2s biometric attestation
      setTimeout(() => {
        if (subScanHud) {
          subScanHud.style.display = 'none';
          subScanHud.classList.remove('active');
        }

        const citizenNumber = Math.floor(1000 + Math.random() * 9000);
        const passTitleEl = document.getElementById('success-pass-title');
        if (passTitleEl) passTitleEl.textContent = selectedPlanData.name;

        const passIconEl = document.getElementById('success-pass-icon');
        if (passIconEl) passIconEl.innerHTML = selectedPlanData.icon;

        const citizenIdEl = document.getElementById('success-citizen-id');
        if (citizenIdEl) citizenIdEl.textContent = `#ORBIT-2100-CITIZEN-${citizenNumber}`;

        if (subSuccessStep) subSuccessStep.style.display = 'flex';

        window.showToast?.(
          `✦ Pass Issued: ${selectedPlanData.name}`,
          `Provisioned to #ORBIT-2100-CITIZEN-${citizenNumber}. Tap-to-board active.`
        );
      }, 2200);
    });
  }

  if (closeSubSuccessBtn) {
    closeSubSuccessBtn.addEventListener('click', closeSubscriptionModal);
  }

  if (successDispatchRideBtn) {
    successDispatchRideBtn.addEventListener('click', () => {
      closeSubscriptionModal();
      if (window.orbitPlanner) {
        window.orbitPlanner.openWizard(1);
      }
    });
  }
});
