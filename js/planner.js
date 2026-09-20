/**
 * ORBIT 2100 — Full-Screen Multi-Modal Journey Planning Studio & Dispatch Engine
 * Cre8x 3.0: The Oracle Challenge
 */

class OrbitJourneyPlanner {
  constructor() {
    this.currentStep = 1;
    this.modal = document.getElementById('journey-wizard-modal');
    
    // Main Hero Inputs
    this.fromInput = document.getElementById('planner-from-input');
    this.toInput = document.getElementById('planner-to-input');
    this.swapBtn = document.getElementById('planner-swap-btn');
    this.fromDropdown = document.getElementById('from-autocomplete');
    this.toDropdown = document.getElementById('to-autocomplete');
    
    // Full-Screen Studio Inputs
    this.wizardFromInput = document.getElementById('wizard-from-input');
    this.wizardToInput = document.getElementById('wizard-to-input');
    this.wizardFromDropdown = document.getElementById('wizard-from-autocomplete');
    this.wizardToDropdown = document.getElementById('wizard-to-autocomplete');
    this.wizardSwapBtn = document.getElementById('wizard-swap-locations-btn');
    this.addStopBtn = document.getElementById('wizard-add-stop-btn');
    this.stopsContainer = document.getElementById('wizard-dynamic-stops-container');
    
    // Intermediate Stops Array: [{ id: 1, name: '...' }]
    this.intermediateStops = [];
    this.stopCounter = 0;

    // Selected Vehicle Specs
    this.selectedVehicle = {
      id: 'airpod',
      name: 'ORBIT AirPod Priority eVTOL',
      type: 'eVTOL Air Taxi',
      speed: '450 km/h',
      duration: '11 min',
      fare: '4.2 ORB',
      gate: 'SkyPort Gate 03 (Level 0 • Step-Free)',
      unitId: '#AP-804',
      altitude: '140m AGL',
      color: '#38D9FF'
    };

    // Active Route Type Filter
    this.activeRouteType = 'fastest';
    // Selected Payment Method
    this.selectedPaymentMethod = 'pass';

    this.init();
  }

  init() {
    // 1. Setup Autocomplete on Hero Inputs
    this.setupAutocomplete(this.fromInput, this.fromDropdown);
    this.setupAutocomplete(this.toInput, this.toDropdown);

    if (this.swapBtn) {
      this.swapBtn.addEventListener('click', () => this.swapLocations());
    }

    // 2. Setup Autocomplete on Studio Inputs
    this.setupAutocomplete(this.wizardFromInput, this.wizardFromDropdown, () => this.renderLiveRouteMap());
    this.setupAutocomplete(this.wizardToInput, this.wizardToDropdown, () => this.renderLiveRouteMap());

    if (this.wizardFromInput) {
      this.wizardFromInput.addEventListener('input', () => this.renderLiveRouteMap());
    }
    if (this.wizardToInput) {
      this.wizardToInput.addEventListener('input', () => this.renderLiveRouteMap());
    }

    // Studio Swap Button
    if (this.wizardSwapBtn) {
      this.wizardSwapBtn.addEventListener('click', () => this.swapLocations());
    }

    // 3. Dynamic Intermediate Stops (+ Add Stop)
    if (this.addStopBtn) {
      this.addStopBtn.addEventListener('click', () => this.addIntermediateStop());
    }

    // 4. Quick Destination Pills
    document.querySelectorAll('[data-quick-dest]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-quick-dest]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const dest = pill.getAttribute('data-quick-dest');
        if (this.toInput) this.toInput.value = dest;
        if (this.wizardToInput) this.wizardToInput.value = dest;
        this.renderLiveRouteMap();
        window.showToast?.('Destination Selected', dest);
      });
    });

    document.querySelectorAll('.wizard-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.wizard-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const dest = btn.getAttribute('data-preset-to');
        if (this.wizardToInput) this.wizardToInput.value = dest;
        if (this.toInput) this.toInput.value = dest;
        this.renderLiveRouteMap();
        window.showToast?.('Preset Destination', dest);
      });
    });

    // 5. Console Mode Switcher on Hero
    document.querySelectorAll('[data-mode-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-mode-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode-filter');
        this.applyVehicleMode(mode);
      });
    });

    // 6. Open Studio Triggers
    const heroStartBtn = document.getElementById('hero-start-journey-btn');
    if (heroStartBtn) {
      heroStartBtn.addEventListener('click', () => {
        this.syncHomeToWizard();
        this.openWizard(1);
      });
    }

    const homeBookBtn = document.getElementById('open-booking-modal-btn');
    if (homeBookBtn) {
      homeBookBtn.addEventListener('click', () => {
        this.syncHomeToWizard();
        this.openWizard(1);
      });
    }

    document.querySelectorAll('[data-open-planner-btn]').forEach(btn => {
      btn.addEventListener('click', () => this.openWizard(1));
    });

    document.querySelectorAll('[data-fleet-book]').forEach(card => {
      card.addEventListener('click', () => {
        const vclass = card.getAttribute('data-fleet-book');
        if (vclass) this.selectVehicleByClass(vclass);
        this.openWizard(1);
      });
    });

    // 7. Studio Step Navigation Buttons
    const step1Next = document.getElementById('wizard-goto-step-2');
    if (step1Next) {
      step1Next.addEventListener('click', () => {
        const toVal = this.wizardToInput?.value.trim();
        if (!toVal) {
          window.showToast?.('Destination Required', 'Please enter a 2100 destination hub.');
          return;
        }
        this.updateStep2Summary();
        this.goToStep(2);
      });
    }

    const step2Back = document.getElementById('wizard-backto-step-1');
    if (step2Back) {
      step2Back.addEventListener('click', () => this.goToStep(1));
    }

    const step2Next = document.getElementById('wizard-goto-step-3');
    if (step2Next) {
      step2Next.addEventListener('click', () => {
        this.updateStep3Payment();
        this.goToStep(3);
      });
    }

    const step3Back = document.getElementById('wizard-backto-step-2');
    if (step3Back) {
      step3Back.addEventListener('click', () => this.goToStep(2));
    }

    // Stepper header item clicks
    document.querySelectorAll('.studio-step-item').forEach(item => {
      item.addEventListener('click', () => {
        const target = parseInt(item.getAttribute('data-step-target'), 10);
        if (target === 2) this.updateStep2Summary();
        if (target === 3) this.updateStep3Payment();
        this.goToStep(target);
      });
    });

    // 8. Vehicle Selection Cards in Studio
    document.querySelectorAll('.studio-vehicle-card.wizard-vehicle-option').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.studio-vehicle-card.wizard-vehicle-option').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        const vclass = card.getAttribute('data-vclass');
        const vfare = card.getAttribute('data-vfare');
        const vname = card.getAttribute('data-vname');
        const vspeed = card.getAttribute('data-vspeed');
        const vtime = card.getAttribute('data-vtime');
        const vgate = card.getAttribute('data-vgate');
        const valti = card.getAttribute('data-valti') || '140m AGL';
        const vcolor = card.getAttribute('data-vcolor') || '#38D9FF';

        this.selectedVehicle = {
          id: vclass,
          name: vname,
          type: vclass === 'airpod' ? 'eVTOL Air Taxi' : (vclass === 'skyrail' ? 'Maglev High-Spine' : (vclass === 'hyperloop' ? 'Sub-Hyperloop Tube' : 'Autonomous Smart Shuttle')),
          speed: vspeed,
          duration: vtime,
          fare: vfare,
          gate: vgate,
          altitude: valti,
          color: vcolor,
          unitId: vclass === 'airpod' ? '#AP-804' : (vclass === 'skyrail' ? '#SR-102' : (vclass === 'hyperloop' ? '#HYP-01' : '#APOD-55'))
        };

        this.renderLiveRouteMap();
        window.showToast?.(`${vname} Selected`, `Speed: ${vspeed} • Fare: ${vfare}`);
      });
    });

    // 9. Route Types Filter Chips
    document.querySelectorAll('.route-type-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.route-type-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const rtype = chip.getAttribute('data-route-type');
        this.activeRouteType = rtype;

        // Auto select recommended vehicle based on filter
        if (rtype === 'fastest') {
          this.selectVehicleByClass('airpod');
        } else if (rtype === 'eco' || rtype === 'budget') {
          this.selectVehicleByClass('autopod');
        } else if (rtype === 'stepfree') {
          this.selectVehicleByClass('skyrail');
        } else if (rtype === 'scenic') {
          this.selectVehicleByClass('airpod');
        }

        window.showToast?.(`Route Filter: ${chip.textContent.trim()}`, 'Corridor trajectory updated.');
      });
    });

    // 10. Payment Method Cards in Step 3
    document.querySelectorAll('.payment-method-card.wizard-pay-option').forEach(pcard => {
      pcard.addEventListener('click', () => {
        document.querySelectorAll('.payment-method-card.wizard-pay-option').forEach(p => p.classList.remove('selected'));
        pcard.classList.add('selected');
        this.selectedPaymentMethod = pcard.getAttribute('data-pay-method');
        this.updateStep3Payment();
      });
    });

    // 11. Close Studio Buttons
    document.querySelectorAll('[data-close-wizard]').forEach(btn => {
      btn.addEventListener('click', () => this.closeWizard());
    });

    // 11B. Studio Top Bar Quick Nav Tabs
    document.querySelectorAll('[data-studio-nav]').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.getAttribute('data-studio-nav');
        this.closeWizard();
        if (window.orbitApp && window.orbitApp.switchView) {
          window.orbitApp.switchView(targetView);
        } else {
          location.hash = `#${targetView}`;
        }
      });
    });

    // 12. Confirm & Launch Live Tracking in Step 3
    const launchBtn = document.getElementById('wizard-confirm-launch-btn');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => this.confirmAndDispatch());
    }

    // Initial Live Route Map render
    this.renderLiveRouteMap();
  }

  selectVehicleByClass(vclass) {
    const card = document.querySelector(`.studio-vehicle-card.wizard-vehicle-option[data-vclass="${vclass}"]`);
    if (card) {
      card.click();
    }
  }

  applyVehicleMode(mode) {
    if (mode === 'air') {
      this.selectVehicleByClass('airpod');
      window.showToast?.('Mode: Sky Corridor', 'Prioritizing on-demand AirPod eVTOLs.');
    } else if (mode === 'rail') {
      this.selectVehicleByClass('skyrail');
      window.showToast?.('Mode: Maglev High-Spine', 'Prioritizing frictionless rail corridor.');
    } else if (mode === 'stepfree') {
      const stepFreeToggle = document.getElementById('wizard-opt-stepfree');
      if (stepFreeToggle) stepFreeToggle.checked = true;
      window.showToast?.('100% Step-Free Mode', 'Level boarding synchronized across network.');
    }
  }

  addIntermediateStop() {
    this.stopCounter++;
    const stopId = this.stopCounter;
    const defaultName = this.stopCounter === 1 ? 'Central SkyPort Concourse 02' : `Sub-Station Waypoint 0${this.stopCounter}`;
    
    this.intermediateStops.push({ id: stopId, name: defaultName });

    const stopCard = document.createElement('div');
    stopCard.className = 'studio-stop-card';
    stopCard.id = `wizard-stop-row-${stopId}`;
    stopCard.innerHTML = `
      <div class="route-node-icon">
        <span style="width: 10px; height: 10px; border-radius: 50%; background: #FFB84D; box-shadow: 0 0 6px #FFB84D;"></span>
      </div>
      <div class="route-field-content">
        <div class="route-field-label">Intermediate Stop ${this.intermediateStops.length}</div>
        <input type="text" id="wizard-stop-input-${stopId}" class="route-field-input" value="${defaultName}" placeholder="Enter intermediate stop">
        <div id="wizard-stop-dropdown-${stopId}" class="autocomplete-dropdown"></div>
      </div>
      <button type="button" class="btn-remove-stop" data-remove-stop-id="${stopId}" title="Remove Stop" aria-label="Remove stop">✕</button>
    `;

    if (this.stopsContainer) {
      this.stopsContainer.appendChild(stopCard);
    }

    // Bind remove button
    const removeBtn = stopCard.querySelector(`[data-remove-stop-id="${stopId}"]`);
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.intermediateStops = this.intermediateStops.filter(s => s.id !== stopId);
        stopCard.remove();
        this.reindexStops();
        this.renderLiveRouteMap();
        window.showToast?.('Intermediate Stop Removed', 'Corridor recalculated.');
      });
    }

    // Bind input and autocomplete
    const stopInput = stopCard.querySelector(`#wizard-stop-input-${stopId}`);
    const stopDropdown = stopCard.querySelector(`#wizard-stop-dropdown-${stopId}`);
    if (stopInput) {
      stopInput.addEventListener('input', (e) => {
        const found = this.intermediateStops.find(s => s.id === stopId);
        if (found) found.name = e.target.value;
        this.renderLiveRouteMap();
      });
      this.setupAutocomplete(stopInput, stopDropdown, () => {
        const found = this.intermediateStops.find(s => s.id === stopId);
        if (found) found.name = stopInput.value;
        this.renderLiveRouteMap();
      });
    }

    this.renderLiveRouteMap();
    window.showToast?.('Intermediate Stop Added', defaultName);
  }

  reindexStops() {
    if (!this.stopsContainer) return;
    const cards = this.stopsContainer.querySelectorAll('.studio-stop-card');
    cards.forEach((card, index) => {
      const label = card.querySelector('.route-field-label');
      if (label) {
        label.textContent = `Intermediate Stop ${index + 1}`;
      }
    });
  }

  renderLiveRouteMap() {
    const svgEl = document.getElementById('studio-live-route-svg');
    if (!svgEl) return;

    const fromVal = this.wizardFromInput?.value.trim() || 'Colombo Central Grand Hub';
    const toVal = this.wizardToInput?.value.trim() || 'Oceanic District Floating Plaza';
    const v = this.selectedVehicle || {
      id: 'airpod',
      name: 'ORBIT AirPod Priority eVTOL',
      type: 'Sky Corridor',
      speed: '450 km/h',
      altitude: '140m AGL',
      color: '#38D9FF',
      fare: '4.2 ORB'
    };

    // Update HUD Status Text
    const statusTextEl = document.getElementById('studio-map-status-text');
    if (statusTextEl) {
      statusTextEl.innerHTML = `<span style="color: #10B981;">●</span> LIVE CORRIDOR ROUTING • SPEED: <strong>${v.speed}</strong> • ALT: <strong>${v.altitude}</strong>`;
    }

    const corridorBadgeEl = document.getElementById('studio-map-corridor-badge');
    if (corridorBadgeEl) {
      corridorBadgeEl.textContent = `${v.name.split(' ')[1] || 'AirPod'} • ${v.altitude}`;
    }

    const stops = this.intermediateStops;
    let pathD = '';
    let stopsSvg = '';

    if (stops.length === 0) {
      // 2-point aerodynamic arc (Origin -> Dest)
      pathD = 'M 90,215 C 220,55 380,55 510,165';
    } else if (stops.length === 1) {
      // 3-point curved arc (Origin -> Stop 1 -> Dest)
      pathD = 'M 85,215 Q 295,50 515,165';
      const stopName = stops[0].name || 'Kandy SkyHub';
      stopsSvg = `
        <g class="map-waypoint-group">
          <!-- Datum Laser Line -->
          <line x1="295" y1="102" x2="295" y2="245" stroke="rgba(245, 158, 11, 0.3)" stroke-width="1.5" stroke-dasharray="3,3"/>
          <circle cx="295" cy="245" r="3" fill="#F59E0B" opacity="0.6"/>

          <!-- Floating Waypoint Glass Card -->
          <rect x="215" y="42" width="160" height="48" rx="8" fill="rgba(7, 21, 28, 0.88)" stroke="#F59E0B" stroke-width="1.2"/>
          <circle cx="230" cy="56" r="4" fill="#F59E0B"/>
          <text x="240" y="60" fill="#F59E0B" font-size="9" font-weight="800" letter-spacing="0.5">TRANSFER NODE 01</text>
          <text x="240" y="78" fill="#FFFFFF" font-size="11" font-weight="700">${stopName.length > 18 ? stopName.substring(0, 16) + '...' : stopName}</text>
          
          <!-- Node Ping on Route -->
          <circle cx="295" cy="102" r="14" fill="none" stroke="#F59E0B" stroke-width="1.5" opacity="0.8">
            <animate attributeName="r" values="8;18" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="295" cy="102" r="7" fill="#07151C" stroke="#F59E0B" stroke-width="2.5"/>
          <circle cx="295" cy="102" r="3" fill="#F59E0B"/>
        </g>
      `;
    } else {
      // Multi-stop arc
      pathD = 'M 80,215 C 190,55 390,65 520,165';
      stopsSvg = stops.map((s, idx) => {
        const cx = 190 + idx * 130;
        const cy = 95 + (idx % 2 === 0 ? -15 : 20);
        const stopName = s.name || `Station ${idx+1}`;
        return `
          <g class="map-waypoint-group">
            <line x1="${cx}" y1="${cy}" x2="${cx}" y2="245" stroke="rgba(245, 158, 11, 0.3)" stroke-width="1.5" stroke-dasharray="3,3"/>
            <rect x="${cx - 65}" y="${cy - 46}" width="130" height="38" rx="6" fill="rgba(7, 21, 28, 0.88)" stroke="#F59E0B" stroke-width="1.2"/>
            <text x="${cx}" y="${cy - 30}" fill="#F59E0B" font-size="8.5" font-weight="800" text-anchor="middle">STOP 0${idx+1}</text>
            <text x="${cx}" y="${cy - 16}" fill="#FFFFFF" font-size="10" font-weight="700" text-anchor="middle">${stopName.substring(0, 14)}</text>
            <circle cx="${cx}" cy="${cy}" r="6" fill="#07151C" stroke="#F59E0B" stroke-width="2.5"/>
            <circle cx="${cx}" cy="${cy}" r="2.5" fill="#F59E0B"/>
          </g>
        `;
      }).join('');
    }

    const strokeColor = v.color || '#38D9FF';
    const animDur = v.id === 'hyperloop' ? '3.2s' : (v.id === 'airpod' ? '5s' : (v.id === 'skyrail' ? '6.5s' : '8s'));

    svgEl.innerHTML = `
      <defs>
        <!-- Gradients -->
        <linearGradient id="studioRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#10B981" stop-opacity="1"/>
          <stop offset="45%" stop-color="${strokeColor}" stop-opacity="1"/>
          <stop offset="100%" stop-color="#38D9FF" stop-opacity="1"/>
        </linearGradient>

        <linearGradient id="podBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0"/>
        </linearGradient>

        <linearGradient id="terrainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0E222B" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#07151C" stop-opacity="0.95"/>
        </linearGradient>

        <!-- Glow Filters -->
        <filter id="studioBlipGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
        </filter>
      </defs>

      <!-- Background Base & Terrain Layer -->
      <rect width="600" height="280" fill="#061218"/>
      
      <!-- Topographic Contour Curves -->
      <path d="M 0,160 Q 150,140 300,175 T 600,150 L 600,280 L 0,280 Z" fill="url(#terrainGrad)"/>
      <path d="M 0,210 Q 200,190 400,220 T 600,200 L 600,280 L 0,280 Z" fill="#051016" opacity="0.8"/>

      <!-- Matrix Coordinates & Sector Grid -->
      <line x1="0" y1="70" x2="600" y2="70" stroke="rgba(56, 217, 255, 0.08)" stroke-dasharray="3,6"/>
      <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(56, 217, 255, 0.08)" stroke-dasharray="3,6"/>
      <line x1="0" y1="210" x2="600" y2="210" stroke="rgba(56, 217, 255, 0.08)" stroke-dasharray="3,6"/>
      <line x1="150" y1="0" x2="150" y2="280" stroke="rgba(56, 217, 255, 0.06)" stroke-dasharray="3,6"/>
      <line x1="300" y1="0" x2="300" y2="280" stroke="rgba(56, 217, 255, 0.06)" stroke-dasharray="3,6"/>
      <line x1="450" y1="0" x2="450" y2="280" stroke="rgba(56, 217, 255, 0.06)" stroke-dasharray="3,6"/>

      <!-- Crosshair Navigation Points -->
      <g stroke="rgba(56, 217, 255, 0.25)" stroke-width="1">
        <path d="M 145,70 L 155,70 M 150,65 L 150,75"/>
        <path d="M 295,140 L 305,140 M 300,135 L 300,145"/>
        <path d="M 445,210 L 455,210 M 450,205 L 450,215"/>
      </g>

      <!-- Altitude Corridor Header Badge -->
      <g>
        <rect x="20" y="16" width="220" height="22" rx="4" fill="rgba(14, 34, 43, 0.85)" stroke="rgba(56, 217, 255, 0.25)"/>
        <circle cx="32" cy="27" r="3" fill="#10B981"/>
        <text x="42" y="31" fill="var(--color-accent-cyan)" font-size="9.5" font-weight="800" letter-spacing="1">
          CORRIDOR LAYER: ${v.altitude.toUpperCase()}
        </text>
      </g>

      <text x="580" y="30" fill="rgba(160, 180, 189, 0.45)" font-size="9" font-weight="700" text-anchor="end" font-family="monospace">
        GRID 79.86°E : 06.92°N
      </text>

      <!-- Ground Level Datum Baseline -->
      <line x1="40" y1="245" x2="560" y2="245" stroke="rgba(16, 185, 129, 0.2)" stroke-width="1.5" stroke-dasharray="4,4"/>
      <text x="40" y="260" fill="rgba(160, 180, 189, 0.4)" font-size="8.5" font-family="monospace">DATUM 0M (GROUND)</text>
      <text x="560" y="260" fill="rgba(160, 180, 189, 0.4)" font-size="8.5" font-family="monospace" text-anchor="end">MAX ALT +140M</text>

      <!-- Trajectory Base Magnetic Track -->
      <path d="${pathD}" fill="none" stroke="#0D2B38" stroke-width="12" stroke-linecap="round"/>
      <path d="${pathD}" fill="none" stroke="#164356" stroke-width="6" stroke-linecap="round"/>
      <path d="${pathD}" fill="none" stroke="url(#studioRouteGrad)" stroke-width="3" stroke-linecap="round"/>
      <path d="${pathD}" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="8,12" opacity="0.75"/>

      <!-- Directional Energy Flow Pulse Line -->
      <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="6,24" opacity="0.9">
        <animate attributeName="stroke-dashoffset" values="60;0" dur="2s" repeatCount="indefinite"/>
      </path>

      <!-- Intermediate Stops SVG -->
      ${stopsSvg}

      <!-- Origin Hub Waypoint Card & Laser Marker -->
      <g class="map-origin-group" filter="url(#cardShadow)">
        <line x1="90" y1="215" x2="90" y2="245" stroke="rgba(16, 185, 129, 0.4)" stroke-width="1.5" stroke-dasharray="3,3"/>
        <circle cx="90" cy="245" r="3.5" fill="#10B981"/>

        <!-- Glass Card -->
        <rect x="20" y="145" width="140" height="52" rx="8" fill="rgba(7, 21, 28, 0.92)" stroke="#10B981" stroke-width="1.5"/>
        <circle cx="32" cy="160" r="3.5" fill="#10B981"/>
        <text x="42" y="163" fill="#10B981" font-size="9" font-weight="800" letter-spacing="0.5">PICKUP NODE</text>
        <text x="32" y="180" fill="#FFFFFF" font-size="11" font-weight="800">${fromVal.split(' ')[0]} Hub</text>
        <text x="32" y="191" fill="rgba(160, 180, 189, 0.8)" font-size="8.5">Level 0 • Step-Free Ramp</text>

        <!-- Origin Node Pin -->
        <circle cx="90" cy="215" r="14" fill="#07151C" stroke="#10B981" stroke-width="3"/>
        <circle cx="90" cy="215" r="5" fill="#10B981"/>
      </g>

      <!-- Destination Hub Waypoint Card & Laser Marker -->
      <g class="map-dest-group" filter="url(#cardShadow)">
        <line x1="510" y1="165" x2="510" y2="245" stroke="rgba(56, 217, 255, 0.4)" stroke-width="1.5" stroke-dasharray="3,3"/>
        <circle cx="510" cy="245" r="3.5" fill="#38D9FF"/>

        <!-- Glass Card -->
        <rect x="440" y="95" width="145" height="52" rx="8" fill="rgba(7, 21, 28, 0.92)" stroke="#38D9FF" stroke-width="1.5"/>
        <circle cx="452" cy="110" r="3.5" fill="#38D9FF"/>
        <text x="462" y="113" fill="#38D9FF" font-size="9" font-weight="800" letter-spacing="0.5">DESTINATION HUB</text>
        <text x="452" y="130" fill="#FFFFFF" font-size="11" font-weight="800">${toVal.split(' ')[0]} Plaza</text>
        <text x="452" y="141" fill="rgba(160, 180, 189, 0.8)" font-size="8.5">Platform 01 • Instant Sync</text>

        <!-- Destination Node Pin -->
        <circle cx="510" cy="165" r="14" fill="#07151C" stroke="#38D9FF" stroke-width="3"/>
        <circle cx="510" cy="165" r="5" fill="#38D9FF"/>
      </g>

      <!-- Live Moving Autonomous Vehicle Pod -->
      <g>
        <!-- Expanding Collision-Avoidance Sonar Rings -->
        <circle r="14" fill="none" stroke="${strokeColor}" stroke-width="1.5" opacity="0.85">
          <animate attributeName="r" values="8;24" dur="1.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.9;0" dur="1.8s" repeatCount="indefinite"/>
          <animateMotion dur="${animDur}" repeatCount="indefinite" path="${pathD}" rotate="auto"/>
        </circle>

        <!-- Aerodynamic Vehicle Pod Body -->
        <g filter="url(#studioBlipGlow)">
          <path d="M 12,0 L -8,6 L -12,0 L -8,-6 Z" fill="#FFFFFF" stroke="${strokeColor}" stroke-width="1.5">
            <animateMotion dur="${animDur}" repeatCount="indefinite" path="${pathD}" rotate="auto"/>
          </path>
          <!-- Cockpit Neon Core -->
          <circle r="3.5" fill="${strokeColor}">
            <animateMotion dur="${animDur}" repeatCount="indefinite" path="${pathD}"/>
          </circle>
        </g>
      </g>
    `;
  }

  syncHomeToWizard() {
    if (this.fromInput && this.wizardFromInput) {
      this.wizardFromInput.value = this.fromInput.value;
    }
    if (this.toInput && this.wizardToInput) {
      this.wizardToInput.value = this.toInput.value;
    }
    this.renderLiveRouteMap();
  }

  syncWizardToHome() {
    if (this.wizardFromInput && this.fromInput) {
      this.fromInput.value = this.wizardFromInput.value;
    }
    if (this.wizardToInput && this.toInput) {
      this.toInput.value = this.wizardToInput.value;
    }
  }

  openWizard(step = 1) {
    this.syncHomeToWizard();
    if (step === 2) this.updateStep2Summary();
    if (step === 3) this.updateStep3Payment();
    this.goToStep(step);
    if (this.modal) {
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    this.renderLiveRouteMap();
  }

  closeWizard() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    this.syncWizardToHome();
  }

  goToStep(stepNumber) {
    this.currentStep = stepNumber;

    // Update Top Bar Stepper Item States
    document.querySelectorAll('.studio-step-item').forEach(item => {
      const stepVal = parseInt(item.getAttribute('data-step-target'), 10);
      if (stepVal === stepNumber) {
        item.classList.add('active');
        item.classList.remove('completed');
      } else if (stepVal < stepNumber) {
        item.classList.remove('active');
        item.classList.add('completed');
      } else {
        item.classList.remove('active', 'completed');
      }
    });

    // Update Step View Panels
    for (let i = 1; i <= 3; i++) {
      const panel = document.getElementById(`wizard-step-${i}`);
      if (panel) {
        if (i === stepNumber) panel.classList.add('active');
        else panel.classList.remove('active');
      }
    }

    if (stepNumber === 1) {
      setTimeout(() => this.renderLiveRouteMap(), 50);
    }
  }

  updateStep2Summary() {
    const fromVal = this.wizardFromInput?.value.trim() || 'Colombo Central Grand Hub';
    const toVal = this.wizardToInput?.value.trim() || 'Oceanic District Floating Plaza';

    const gateEl = document.getElementById('summary-gate-display');
    const vehicleEl = document.getElementById('summary-vehicle-display');
    const fareEl = document.getElementById('summary-fare-display');
    const routeBreakdownEl = document.getElementById('summary-route-breakdown');

    if (gateEl) gateEl.textContent = this.selectedVehicle.gate;
    if (vehicleEl) vehicleEl.textContent = `${this.selectedVehicle.name} (${this.selectedVehicle.speed} • ETA ${this.selectedVehicle.duration})`;
    if (fareEl) fareEl.textContent = this.selectedVehicle.fare;

    if (routeBreakdownEl) {
      const allNodes = [
        { label: 'Origin Hub', name: fromVal, color: '#10B981' },
        ...this.intermediateStops.map((s, idx) => ({ label: `Stop ${idx+1}`, name: s.name, color: '#FFB84D' })),
        { label: 'Destination', name: toVal, color: '#38D9FF' }
      ];

      routeBreakdownEl.innerHTML = allNodes.map((node, idx) => `
        <div style="display: flex; align-items: center; gap: var(--space-3); padding: 8px 0; ${idx < allNodes.length - 1 ? 'border-bottom: 1px dashed var(--border-subtle);' : ''}">
          <span style="width: 10px; height: 10px; border-radius: 50%; background: ${node.color}; box-shadow: 0 0 6px ${node.color};"></span>
          <div style="flex: 1;">
            <div style="font-size: 10px; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase;">${node.label}</div>
            <div style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-text-primary);">${node.name}</div>
          </div>
          <span class="badge badge-balanced" style="font-size: 10px;">Platform Level 0</span>
        </div>
      `).join('');
    }
  }

  updateStep3Payment() {
    const fareNumber = parseFloat(this.selectedVehicle.fare) || 4.2;
    const baseFare = (fareNumber - 0.4).toFixed(2);
    
    let rebate = 0.0;
    if (this.selectedPaymentMethod === 'carbon') {
      rebate = fareNumber;
    }

    const totalFare = Math.max(0, (fareNumber - rebate)).toFixed(2);

    const baseEl = document.getElementById('pay-base-fare');
    const totalEl = document.getElementById('pay-total-fare');

    if (baseEl) baseEl.textContent = `${baseFare} ORB`;
    if (totalEl) totalEl.textContent = `${totalFare} ORB`;
  }

  swapLocations() {
    if (this.fromInput && this.toInput) {
      const temp = this.fromInput.value;
      this.fromInput.value = this.toInput.value;
      this.toInput.value = temp;
    }
    if (this.wizardFromInput && this.wizardToInput) {
      const temp = this.wizardFromInput.value;
      this.wizardFromInput.value = this.wizardToInput.value;
      this.wizardToInput.value = temp;
    }
    this.renderLiveRouteMap();
    window.showToast?.('Route Inverted', `${this.wizardFromInput?.value} ➔ ${this.wizardToInput?.value}`);
  }

  setupAutocomplete(inputElement, dropdownElement, onSelectCallback) {
    if (!inputElement || !dropdownElement) return;

    const renderOptions = (filterText = '') => {
      const filtered = window.ORBIT_DATA?.destinations?.filter(d => 
        d.name.toLowerCase().includes(filterText.toLowerCase()) ||
        d.zone.toLowerCase().includes(filterText.toLowerCase())
      ) || [];

      if (filtered.length === 0) {
        dropdownElement.innerHTML = `<div class="autocomplete-item"><span class="autocomplete-item-text" style="color: var(--color-text-muted);">No 2100 transit nodes found</span></div>`;
        dropdownElement.classList.add('show');
        return;
      }

      dropdownElement.innerHTML = filtered.map(d => `
        <div class="autocomplete-item" data-dest-name="${d.name}">
          <div class="autocomplete-item-main">
            <span style="color: var(--color-accent-cyan);">${window.renderIcon('location', 'icon-sm')}</span>
            <div>
              <div class="autocomplete-item-text">${d.name}</div>
              <div class="autocomplete-item-zone">${d.zone}</div>
            </div>
          </div>
          <span class="badge badge-balanced" style="font-size: 11px;">Active Hub</span>
        </div>
      `).join('');

      dropdownElement.classList.add('show');

      dropdownElement.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          const name = item.getAttribute('data-dest-name');
          if (name) {
            inputElement.value = name;
            dropdownElement.classList.remove('show');
            if (onSelectCallback) onSelectCallback(name);
          }
        });
      });
    };

    inputElement.addEventListener('focus', () => renderOptions(inputElement.value));
    inputElement.addEventListener('input', () => renderOptions(inputElement.value));

    document.addEventListener('click', (e) => {
      if (!inputElement.contains(e.target) && !dropdownElement.contains(e.target)) {
        dropdownElement.classList.remove('show');
      }
    });
  }

  confirmAndDispatch() {
    this.closeWizard();
    const fromVal = this.wizardFromInput?.value.trim() || 'Colombo Central Grand Hub';
    const toVal = this.wizardToInput?.value.trim() || 'Oceanic District Floating Plaza';

    window.showToast?.('Quantum Swarm Dispatched!', `Deducted ${this.selectedVehicle.fare} • Assigned ${this.selectedVehicle.gate.split('(')[0]}`);

    // Transition to Uber-Style Live Real-Time Tracking View
    setTimeout(() => {
      if (window.orbitLiveJourney) {
        window.orbitLiveJourney.startLiveTracking({
          from: fromVal,
          to: toVal,
          stops: this.intermediateStops.map(s => s.name),
          vehicle: this.selectedVehicle,
          totalMinutes: parseInt(this.selectedVehicle.duration, 10) || 11
        });
      }
      window.orbitRouter?.navigate('live');
    }, 400);
  }
}

window.orbitPlanner = new OrbitJourneyPlanner();
