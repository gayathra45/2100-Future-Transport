/**
 * ORBIT 2100 — Interactive Vector Mobility Grid Map & Live Departures Engine
 * Cre8x 3.0: The Oracle Challenge
 */

class OrbitMobilityMap {
  constructor() {
    this.container = document.getElementById('mobility-map-container');
    this.activeFilter = 'all'; // 'all' | 'transit' | 'air' | 'road' | 'hyperloop' | 'stepfree'
    this.zoomLevel = 1;
    this.viewBox = { x: 0, y: 0, width: 1000, height: 700 };

    // Expanded 2100 Sri Lanka Transit Hubs
    this.stations = [
      {
        id: 'colombo-central',
        name: 'Colombo Central Grand Hub',
        zone: 'Sector 01 • Level 0',
        type: 'Multi-Modal Interchange',
        cx: 480,
        cy: 360,
        color: '#7EF2C5',
        modes: ['Maglev', 'AirPod', 'Smart Shuttle', 'Hyperloop'],
        gate: 'Platform 01-08 • Step-Free',
        departures: [
          { mode: 'AirPod', unit: '#AP-804', dest: 'Oceanic District', time: '2 min', gate: 'Gate 03' },
          { mode: 'Maglev', unit: '#SR-102', dest: 'Kandy SkyHub', time: '5 min', gate: 'Platform 2' },
          { mode: 'Hyperloop', unit: '#HYP-01', dest: 'Lunar Gateway', time: '8 min', gate: 'HyperGate A' }
        ]
      },
      {
        id: 'oceanic-district',
        name: 'Oceanic District Floating Plaza',
        zone: 'Marine Sector 04',
        type: 'Sub-Sea & Surface Terminal',
        cx: 180,
        cy: 280,
        color: '#38D9FF',
        modes: ['AirPod', 'Sub-Sea Rail', 'Smart Shuttle'],
        gate: 'Marine Gate A • Pneumatic Ramp',
        departures: [
          { mode: 'AirPod', unit: '#AP-410', dest: 'Colombo Central', time: '1 min', gate: 'SkyPad 01' },
          { mode: 'Smart Shuttle', unit: '#APOD-12', dest: 'University Arcology', time: '6 min', gate: 'Concourse 01' }
        ]
      },
      {
        id: 'sky-gardens',
        name: 'Sky Gardens Bio-Tower',
        zone: 'Upper Stratum 12',
        type: 'Vertical Aerodrome',
        cx: 680,
        cy: 240,
        color: '#38D9FF',
        modes: ['AirPod', 'Maglev Elevator', 'Walking Canopy'],
        gate: 'SkyPort Level 12 • Step-Free',
        departures: [
          { mode: 'AirPod', unit: '#AP-902', dest: 'Colombo Central', time: '3 min', gate: 'RoofPad Alpha' },
          { mode: 'Maglev', unit: '#SR-108', dest: 'Kandy SkyHub', time: '7 min', gate: 'Platform 1' }
        ]
      },
      {
        id: 'lunar-gateway',
        name: 'Lunar Gateway Orbital Terminal',
        zone: 'North Equatorial Corridor',
        type: 'Suborbital Launch Nexus',
        cx: 860,
        cy: 120,
        color: '#FFB84D',
        modes: ['Hyperloop', 'AirPod', 'Suborbital Shuttle'],
        gate: 'Orbital Gate 01 • High-Sec',
        departures: [
          { mode: 'Hyperloop', unit: '#HYP-03', dest: 'Colombo Central', time: '4 min', gate: 'HyperGate B' },
          { mode: 'AirPod', unit: '#AP-705', dest: 'Jaffna Solar', time: '9 min', gate: 'Gate 04' }
        ]
      },
      {
        id: 'kandy-skyhub',
        name: 'Kandy SkyHub Mountain Station',
        zone: 'Central Highlands Corridor',
        type: 'Maglev & Atmospheric Hub',
        cx: 760,
        cy: 420,
        color: '#7EF2C5',
        modes: ['Maglev High-Spine', 'AirPod Priority'],
        gate: 'Highland Platform 1 • Step-Free',
        departures: [
          { mode: 'Maglev', unit: '#SR-104', dest: 'Colombo Central', time: '3 min', gate: 'Platform 1' },
          { mode: 'AirPod', unit: '#AP-312', dest: 'Galle MarinePort', time: '11 min', gate: 'Pad Beta' }
        ]
      },
      {
        id: 'galle-marineport',
        name: 'Galle MarinePort Autonomous Nexus',
        zone: 'Southern Coastal Spine',
        type: 'Hydrail & Smart Road Hub',
        cx: 440,
        cy: 620,
        color: '#10B981',
        modes: ['Maglev', 'Smart Shuttle', 'Hydrail'],
        gate: 'Bay 01 • Level Boarding',
        departures: [
          { mode: 'Maglev', unit: '#SR-110', dest: 'Colombo Central', time: '4 min', gate: 'Platform 1' },
          { mode: 'Smart Shuttle', unit: '#APOD-88', dest: 'University Arcology', time: '8 min', gate: 'Bay 02' }
        ]
      },
      {
        id: 'university-arcology',
        name: 'University Eco-Arcology',
        zone: 'Sector 07 • Tier 4',
        type: 'Autonomous Pod Spine',
        cx: 360,
        cy: 480,
        color: '#10B981',
        modes: ['Smart Shuttle', 'AirPod', 'Walking Canopy'],
        gate: 'Campus Concourse Alpha',
        departures: [
          { mode: 'Smart Shuttle', unit: '#APOD-55', dest: 'Colombo Central', time: '2 min', gate: 'Bay 01' },
          { mode: 'AirPod', unit: '#AP-201', dest: 'Oceanic District', time: '5 min', gate: 'SkyPad 02' }
        ]
      },
      {
        id: 'jaffna-solar',
        name: 'Jaffna Solar Terminal',
        zone: 'Northern Energy Corridor',
        type: 'Hyperloop & Air Nexus',
        cx: 820,
        cy: 280,
        color: '#A9E8FF',
        modes: ['Hyperloop', 'AirPod', 'Smart Shuttle'],
        gate: 'HyperGate North • 100% Solar',
        departures: [
          { mode: 'Hyperloop', unit: '#HYP-02', dest: 'Colombo Central', time: '6 min', gate: 'HyperGate 01' }
        ]
      }
    ];

    this.init();
  }

  init() {
    if (!this.container) return;
    this.renderMap();
    this.bindControls();
  }

  bindControls() {
    // Layer Filter Chips
    document.querySelectorAll('[data-map-layer]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-map-layer]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.getAttribute('data-map-layer');
        this.applyFilter();
      });
    });

    // Locate Me button
    const locateBtn = document.getElementById('map-locate-btn');
    if (locateBtn) {
      locateBtn.addEventListener('click', () => this.locateUser());
    }

    // Zoom Controls
    const zoomInBtn = document.getElementById('map-zoom-in');
    const zoomOutBtn = document.getElementById('map-zoom-out');
    const zoomResetBtn = document.getElementById('map-zoom-reset');

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoom(0.8));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoom(1.25));
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => this.resetZoom());
  }

  zoom(factor) {
    const svg = document.getElementById('orbit-map-svg');
    if (!svg) return;
    this.viewBox.width *= factor;
    this.viewBox.height *= factor;
    svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
  }

  resetZoom() {
    const svg = document.getElementById('orbit-map-svg');
    if (!svg) return;
    this.viewBox = { x: 0, y: 0, width: 1000, height: 700 };
    svg.setAttribute('viewBox', `0 0 1000 700`);
  }

  locateUser() {
    window.showToast?.('Quantum GPS Locked', 'Position pinpointed: Colombo Central Concourse (Level 0).');
    const userPulse = document.getElementById('user-location-marker');
    if (userPulse) {
      userPulse.style.animation = 'none';
      userPulse.offsetHeight;
      userPulse.style.animation = 'radar-ping 1.2s infinite ease-out';
    }
    this.showStationPopup('colombo-central');
  }

  applyFilter() {
    const layerTransit = document.getElementById('layer-transit-lines');
    const layerAir = document.getElementById('layer-air-corridors');
    const layerRoad = document.getElementById('layer-smart-roads');
    const layerHyper = document.getElementById('layer-hyperloop-lines');

    const setVisibility = (el, show) => {
      if (el) el.style.opacity = show ? '1' : '0.12';
    };

    if (this.activeFilter === 'all') {
      setVisibility(layerTransit, true);
      setVisibility(layerAir, true);
      setVisibility(layerRoad, true);
      setVisibility(layerHyper, true);
    } else {
      setVisibility(layerTransit, this.activeFilter === 'transit');
      setVisibility(layerAir, this.activeFilter === 'air');
      setVisibility(layerRoad, this.activeFilter === 'road');
      setVisibility(layerHyper, this.activeFilter === 'hyperloop');
    }
  }

  renderMap() {
    this.container.innerHTML = `
      <div class="map-view-card">
        <!-- Floating Layer Header -->
        <div class="map-controls-floating-bar">
          <div class="map-layer-toggles">
            <button class="route-type-chip active" data-map-layer="all">All Networks</button>
            <button class="route-type-chip" data-map-layer="air">
              <svg class="icon icon-xs" viewBox="0 0 24 24"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
              <span>Skyways (450 km/h)</span>
            </button>
            <button class="route-type-chip" data-map-layer="transit">
              <svg class="icon icon-xs" viewBox="0 0 24 24"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16M12 3v8M8 19l-3 3M16 19l3 3M9 15h.01M15 15h.01"/></svg>
              <span>Maglev Spine (650 km/h)</span>
            </button>
            <button class="route-type-chip" data-map-layer="hyperloop">
              <svg class="icon icon-xs" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6.05 11a22.35 22.35 0 0 1-3.95 2z"/></svg>
              <span>Hyperloop (900 km/h)</span>
            </button>
            <button class="route-type-chip" data-map-layer="road">
              <svg class="icon icon-xs" viewBox="0 0 24 24"><path d="M8 6v6M16 6v6M2 12h20M6 18h12M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm2 12v2m12-2v2"/></svg>
              <span>Smart Roads</span>
            </button>
          </div>

          <div class="map-action-toggles">
            <button class="btn btn-secondary btn-icon" id="map-locate-btn" title="Locate Me" aria-label="Locate User Position">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </button>
            <button class="btn btn-secondary btn-icon" id="map-zoom-in" title="Zoom In" aria-label="Zoom In">+</button>
            <button class="btn btn-secondary btn-icon" id="map-zoom-out" title="Zoom Out" aria-label="Zoom Out">−</button>
            <button class="btn btn-secondary btn-icon" id="map-zoom-reset" title="Reset View" aria-label="Reset View">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5"/></svg>
            </button>
          </div>
        </div>

        <!-- SVG Map Canvas -->
        <svg id="orbit-map-svg" class="map-svg-canvas" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cyanLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38D9FF" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#7EF2C5" stop-opacity="0.9"/>
            </linearGradient>
            <linearGradient id="airGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#38D9FF" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#7EF2C5" stop-opacity="0.3"/>
            </linearGradient>
            <linearGradient id="hyperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFB84D" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#A9E8FF" stop-opacity="0.9"/>
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Background Sector Grid -->
          <rect width="1000" height="700" fill="#07151C"/>
          
          <!-- Ocean / Coastal Water Basin -->
          <path d="M 0,0 L 280,0 C 240,220 320,440 260,700 L 0,700 Z" fill="#0A1D27" opacity="0.95"/>
          <text x="50" y="380" fill="#15394A" font-size="20" font-weight="800" letter-spacing="6">SRI LANKA 2100 • WEST COAST</text>

          <!-- Sector Boundaries -->
          <polygon points="340,120 540,80 580,240 380,260" fill="#0D2630" stroke="rgba(56, 217, 255, 0.15)" stroke-width="1.5"/>
          <text x="400" y="180" fill="#386A7D" font-size="11" font-weight="700">SECTOR 01 • METRO CORE</text>

          <polygon points="560,320 840,280 880,520 600,560" fill="#0D2630" stroke="rgba(126, 242, 197, 0.15)" stroke-width="1.5"/>
          <text x="650" y="420" fill="#386A7D" font-size="11" font-weight="700">SECTOR 04 • HIGHLAND CORRIDOR</text>

          <!-- LAYER 1: Smart Road Autonomous Grid -->
          <g id="layer-smart-roads" style="transition: opacity 0.3s ease;">
            <path d="M 300,600 C 420,540 480,420 500,320 C 520,220 640,180 820,160" fill="none" stroke="#1D4A5C" stroke-width="3.5" stroke-dasharray="6,6"/>
            <path d="M 360,480 L 440,620 L 760,420" fill="none" stroke="#1D4A5C" stroke-width="2.5" stroke-dasharray="4,4"/>
          </g>

          <!-- LAYER 2: Rail & Maglev High-Spine -->
          <g id="layer-transit-lines" style="transition: opacity 0.3s ease;">
            <!-- Main Spine Loop -->
            <path id="maglev-spine-path" d="M 180,280 C 300,160 500,140 680,240 C 820,300 850,480 760,420 C 660,560 480,640 440,620 C 380,560 360,480 480,360 Z" fill="none" stroke="url(#cyanLineGrad)" stroke-width="4.5" filter="url(#glowEffect)"/>
          </g>

          <!-- LAYER 3: Sub-Hyperloop Vacuum Tube Lines -->
          <g id="layer-hyperloop-lines" style="transition: opacity 0.3s ease;">
            <path id="hyperloop-tube-path" d="M 480,360 L 860,120 L 820,280" fill="none" stroke="url(#hyperGrad)" stroke-width="4" stroke-dasharray="10,4"/>
          </g>

          <!-- LAYER 4: Air Mobility Corridors (Curved Flight Arcs) -->
          <g id="layer-air-corridors" style="transition: opacity 0.3s ease;">
            <path id="airpod-flight-1" d="M 180,280 Q 320,80 480,360" fill="none" stroke="url(#airGrad)" stroke-width="3.5" stroke-dasharray="8,8"/>
            <path id="airpod-flight-2" d="M 480,360 Q 640,200 680,240" fill="none" stroke="url(#airGrad)" stroke-width="3" stroke-dasharray="8,8"/>
            <path id="airpod-flight-3" d="M 680,240 Q 780,320 760,420" fill="none" stroke="url(#airGrad)" stroke-width="3" stroke-dasharray="8,8"/>
          </g>

          <!-- Moving Vehicle Drone Blips -->
          <g id="layer-moving-vehicles">
            <!-- Maglev Train Blip -->
            <circle r="7" fill="#FFFFFF" stroke="#7EF2C5" stroke-width="3" filter="url(#glowEffect)">
              <animateMotion dur="16s" repeatCount="indefinite" path="M 180,280 C 300,160 500,140 680,240 C 820,300 850,480 760,420 C 660,560 480,640 440,620 C 380,560 360,480 480,360 Z"/>
            </circle>

            <!-- AirPod Drone Blip -->
            <circle r="6" fill="#38D9FF" stroke="#FFFFFF" stroke-width="2">
              <animateMotion dur="8s" repeatCount="indefinite" path="M 180,280 Q 320,80 480,360"/>
            </circle>

            <!-- Hyperloop Pod Blip -->
            <circle r="6" fill="#FFB84D" stroke="#FFFFFF" stroke-width="2">
              <animateMotion dur="5s" repeatCount="indefinite" path="M 480,360 L 860,120"/>
            </circle>
          </g>

          <!-- Clickable Station Hub Nodes -->
          <g id="layer-station-nodes">
            ${this.stations.map(s => `
              <g class="map-station-node" data-station-id="${s.id}" style="cursor: pointer;">
                <!-- Outer Pulse ring for Colombo Central -->
                ${s.id === 'colombo-central' ? `
                  <circle id="user-location-marker" cx="${s.cx}" cy="${s.cy}" r="28" fill="none" stroke="#38D9FF" stroke-width="2" opacity="0.7"/>
                ` : ''}
                <circle cx="${s.cx}" cy="${s.cy}" r="${s.id === 'colombo-central' ? 18 : 14}" fill="#0D2630" stroke="${s.color}" stroke-width="3.5"/>
                <circle cx="${s.cx}" cy="${s.cy}" r="${s.id === 'colombo-central' ? 7 : 5}" fill="${s.color}"/>
                <text x="${s.cx}" y="${s.cy + 30}" fill="#FFFFFF" font-size="12" font-weight="800" text-anchor="middle">${s.name.split(' ')[0]} Hub</text>
                <text x="${s.cx}" y="${s.cy + 44}" fill="${s.color}" font-size="9.5" font-weight="700" text-anchor="middle">${s.modes[0]}</text>
              </g>
            `).join('')}
          </g>
        </svg>

        <!-- Bottom Telemetry HUD Bar -->
        <div class="map-bottom-telemetry-bar">
          <span style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;"></span>
            <span>GRID SYNCHRONIZATION: 14,892 UNITS</span>
          </span>
          <span style="display: flex; align-items: center; gap: 4px;"><svg class="icon icon-xs" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> FUSION & SOLAR: 100%</span>
          <span>LATENCY: 0.32ms</span>
        </div>

        <!-- Station Info & Live Departures Floating Drawer -->
        <div id="map-station-popup" class="map-station-popup">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <span class="badge badge-fastest" style="font-size: 10px; margin-bottom: 4px;">ACTIVE TRANSIT INTERCHANGE</span>
              <h3 id="popup-station-title" style="font-size: var(--font-size-md); font-weight: 800;">Colombo Central Grand Hub</h3>
              <p id="popup-station-zone" style="font-size: 11px; color: var(--color-text-secondary); margin-top: 2px;">Sector 01 • Level 0 • Multi-Modal Interchange</p>
            </div>
            <button class="studio-close-btn" id="popup-close-btn" style="width: 32px; height: 32px; font-size: 12px;" aria-label="Close popup">✕</button>
          </div>

          <!-- Platform Gate & Step-Free Badge -->
          <div style="display: flex; gap: 6px; margin-bottom: var(--space-3); flex-wrap: wrap;">
            <span class="badge badge-balanced" id="popup-gate-badge">Platform 01-08 • Step-Free</span>
            <span class="badge badge-eco"><svg class="icon icon-xs" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg> Zero CO₂ Hub</span>
          </div>

          <!-- Live Departures Board Table -->
          <div style="background: var(--color-bg-secondary); border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4); border: 1px solid var(--border-subtle); margin-bottom: var(--space-4);">
            <div style="font-size: 10px; font-weight: 800; color: var(--color-accent-cyan); text-transform: uppercase; margin-bottom: 4px;">
              Live Upcoming Departures
            </div>
            <table class="map-departures-table" id="popup-departures-table">
              <tbody>
                <!-- Populated dynamically -->
              </tbody>
            </table>
          </div>

          <!-- Actions Row -->
          <div style="display: flex; gap: var(--space-2);">
            <button class="btn btn-primary" id="popup-plan-btn" style="flex: 2; padding: 10px; font-size: 12px; font-weight: 800;">
              <span>✦ Plan Route from Here</span>
            </button>
            <button class="btn btn-secondary" id="popup-set-dest-btn" style="flex: 1; padding: 10px; font-size: 12px; font-weight: 700;">
              <span>Set as Destination</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Bind station node clicks
    this.container.querySelectorAll('.map-station-node').forEach(node => {
      node.addEventListener('click', () => {
        const stationId = node.getAttribute('data-station-id');
        this.showStationPopup(stationId);
      });
    });

    const closeBtn = document.getElementById('popup-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const pop = document.getElementById('map-station-popup');
        if (pop) pop.classList.remove('show');
      });
    }
  }

  showStationPopup(stationId) {
    const s = this.stations.find(st => st.id === stationId);
    if (!s) return;

    const popup = document.getElementById('map-station-popup');
    const titleEl = document.getElementById('popup-station-title');
    const zoneEl = document.getElementById('popup-station-zone');
    const gateBadgeEl = document.getElementById('popup-gate-badge');
    const depTable = document.getElementById('popup-departures-table');
    const planBtn = document.getElementById('popup-plan-btn');
    const destBtn = document.getElementById('popup-set-dest-btn');

    if (titleEl) titleEl.textContent = s.name;
    if (zoneEl) zoneEl.textContent = `${s.zone} • ${s.type}`;
    if (gateBadgeEl) gateBadgeEl.textContent = s.gate;

    if (depTable && s.departures) {
      depTable.innerHTML = s.departures.map(d => `
        <tr>
          <td style="font-weight: 700; color: var(--color-text-primary);">${d.mode} ${d.unit}</td>
          <td style="color: var(--color-text-secondary);">➔ ${d.dest}</td>
          <td style="color: var(--color-text-muted);">${d.gate}</td>
          <td style="text-align: right; color: var(--color-accent-cyan); font-weight: 800;">in ${d.time}</td>
        </tr>
      `).join('');
    }

    if (planBtn) {
      planBtn.onclick = () => {
        if (window.orbitPlanner) {
          if (window.orbitPlanner.wizardFromInput) window.orbitPlanner.wizardFromInput.value = s.name;
          window.orbitPlanner.openWizard(1);
        }
        if (popup) popup.classList.remove('show');
      };
    }

    if (destBtn) {
      destBtn.onclick = () => {
        if (window.orbitPlanner) {
          if (window.orbitPlanner.wizardToInput) window.orbitPlanner.wizardToInput.value = s.name;
          window.orbitPlanner.openWizard(1);
        }
        if (popup) popup.classList.remove('show');
      };
    }

    if (popup) {
      popup.classList.add('show');
    }
  }
}

window.orbitMap = new OrbitMobilityMap();
