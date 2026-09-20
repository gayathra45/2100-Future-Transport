/**
 * ORBIT 2100 — Uber / PickMe Style Real-Time Ride Tracking, Cabin Controls & Previous Journeys
 * Cre8x 3.0: The Oracle Challenge
 */

class OrbitLiveJourney {
  constructor() {
    this.container = document.getElementById('live-journey-content');
    this.timer = null;
    this.secondsLeft = 11 * 60; // 11 mins
    this.stage = 'in-transit'; // 'dispatch' | 'boarding' | 'in-transit' | 'approaching' | 'completed'
    this.ambientColor = '#38D9FF';
    this.glassTint = '50%';
    this.audioMode = 'ambient';
    this.activeHistoryFilter = 'all';

    // Default active ride
    this.currentRide = {
      from: 'Colombo Central Grand Hub',
      to: 'Oceanic District Floating Plaza',
      stops: ['Central SkyPort Concourse 02'],
      vehicle: {
        id: 'airpod',
        name: 'ORBIT AirPod Priority eVTOL',
        type: 'eVTOL Air Taxi',
        speed: '450 km/h',
        altitude: '140 m AGL',
        duration: '11 min',
        fare: '4.2 ORB',
        gate: 'SkyPort Gate 03 (Level 0 • Step-Free)',
        unitId: '#AP-804',
        color: '#38D9FF'
      },
      totalMinutes: 11
    };

    // Past Journeys History Records
    this.pastJourneys = [
      {
        id: 'REC-2100-88492',
        date: 'Yesterday • 18:42',
        from: 'Colombo Central Grand Hub',
        to: 'Oceanic District Floating Plaza',
        vehicleName: 'ORBIT AirPod Priority eVTOL',
        unitId: '#AP-410',
        mode: 'airpod',
        speed: '450 km/h',
        duration: '11 min',
        fare: '4.2 ORB',
        co2Saved: '3.8 kg',
        credits: '+12 ORB',
        rating: 5,
        tags: ['Fast Skyway', '0g Net CO₂', 'Sky-View Pod']
      },
      {
        id: 'REC-2100-88319',
        date: '3 Days Ago • 09:15',
        from: 'Colombo Central Grand Hub',
        to: 'Sky Gardens Bio-Tower',
        vehicleName: 'ORBIT SkyRail Maglev High-Spine',
        unitId: '#SR-102',
        mode: 'skyrail',
        speed: '650 km/h',
        duration: '18 min',
        fare: '2.8 ORB',
        co2Saved: '6.2 kg',
        credits: '+20 ORB',
        rating: 5,
        tags: ['Frictionless Maglev', 'Social Lounge', 'Step-Free Ramp']
      },
      {
        id: 'REC-2100-87904',
        date: 'Last Week • 14:30',
        from: 'University Eco-Arcology',
        to: 'Colombo Central Grand Hub',
        vehicleName: 'ORBIT Autonomous Smart Shuttle',
        unitId: '#APOD-55',
        mode: 'autopod',
        speed: '180 km/h',
        duration: '24 min',
        fare: '1.9 ORB',
        co2Saved: '4.5 kg',
        credits: '+15 ORB',
        rating: 5,
        tags: ['Zero Carbon Platoon', 'Pneumatic Ramp', 'Acoustic Shielding']
      },
      {
        id: 'REC-2100-86411',
        date: '2 Weeks Ago • 11:00',
        from: 'Colombo Central Grand Hub',
        to: 'Lunar Gateway Orbital Terminal',
        vehicleName: 'ORBIT Sub-Hyperloop Vacuum Express',
        unitId: '#HYP-01',
        mode: 'hyperloop',
        speed: '900 km/h',
        duration: '7 min',
        fare: '6.5 ORB',
        co2Saved: '12.4 kg',
        credits: '+35 ORB',
        rating: 5,
        tags: ['Sub-Surface Tube', 'Instant Island Transit', 'Quantum Encrypted']
      }
    ];

    this.demoVehicles = [
      {
        id: 'airpod',
        name: 'ORBIT AirPod Priority eVTOL',
        type: 'eVTOL Air Taxi',
        speed: '450 km/h',
        altitude: '140 m AGL',
        duration: '11 min',
        fare: '4.2 ORB',
        gate: 'SkyPort Gate 03 (Level 0 • Step-Free)',
        unitId: '#AP-804',
        from: 'Colombo Central Grand Hub',
        to: 'Oceanic District Floating Plaza',
        stops: ['Central SkyPort Concourse 02']
      },
      {
        id: 'skyrail',
        name: 'ORBIT SkyRail Maglev High-Spine',
        type: 'Maglev High-Spine',
        speed: '650 km/h',
        altitude: '18 m Elevated',
        duration: '18 min',
        fare: '2.8 ORB',
        gate: 'Maglev Track Platform 2',
        unitId: '#SR-102',
        from: 'Colombo Central Grand Hub',
        to: 'Sky Gardens Bio-Tower',
        stops: []
      },
      {
        id: 'autopod',
        name: 'ORBIT Autonomous Smart Shuttle',
        type: 'Autonomous Road Shuttle',
        speed: '180 km/h',
        altitude: '0 m Ground Grid',
        duration: '24 min',
        fare: '1.9 ORB',
        gate: 'Concourse Bay 01 (Road Level)',
        unitId: '#APOD-55',
        from: 'University Eco-Arcology',
        to: 'Colombo Central Grand Hub',
        stops: []
      }
    ];

    this.init();
  }

  init() {
    this.render();
    this.startCountdown();

    // Top view buttons
    const switchDemoBtn = document.getElementById('live-switch-demo-btn');
    if (switchDemoBtn) {
      switchDemoBtn.addEventListener('click', () => this.cycleDemoVehicle());
    }

    const newPlanBtn = document.getElementById('live-new-plan-btn');
    if (newPlanBtn) {
      newPlanBtn.addEventListener('click', () => {
        window.orbitPlanner?.openWizard(1);
      });
    }
  }

  cycleDemoVehicle() {
    const currentIndex = this.demoVehicles.findIndex(v => v.id === this.currentRide.vehicle.id);
    const nextIndex = (currentIndex + 1) % this.demoVehicles.length;
    const v = this.demoVehicles[nextIndex];
    
    this.startLiveTracking({
      from: v.from,
      to: v.to,
      stops: v.stops || [],
      vehicle: v,
      totalMinutes: parseInt(v.duration, 10) || 12
    });

    window.showToast?.('Switched Vehicle Demo', `Now tracking: ${v.name} (${v.speed})`);
  }

  startLiveTracking(rideData) {
    this.currentRide = {
      from: rideData.from || 'Colombo Central Grand Hub',
      to: rideData.to || 'Oceanic District Floating Plaza',
      stops: rideData.stops || [],
      vehicle: rideData.vehicle || this.currentRide.vehicle,
      totalMinutes: rideData.totalMinutes || 11
    };
    this.secondsLeft = (this.currentRide.totalMinutes || 11) * 60;
    this.stage = 'in-transit';
    this.render();
    this.startCountdown();
  }

  startCountdown() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.secondsLeft > 0 && this.stage !== 'completed') {
        this.secondsLeft--;
        const timeEl = document.getElementById('tracking-countdown-val');
        if (timeEl) {
          const mins = Math.floor(this.secondsLeft / 60);
          const secs = this.secondsLeft % 60;
          timeEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
      }
    }, 1000);
  }

  render() {
    if (!this.container) return;

    if (this.stage === 'completed') {
      this.renderRatingScreen();
      return;
    }

    const mins = Math.floor(this.secondsLeft / 60);
    const secs = this.secondsLeft % 60;
    const v = this.currentRide.vehicle;
    const stops = this.currentRide.stops || [];

    let pathD = 'M 120,280 C 280,140 500,120 680,220';
    let stopsSvg = '';

    if (stops.length === 1) {
      pathD = 'M 120,280 Q 380,110 680,220';
      stopsSvg = `
        <g class="map-waypoint-group">
          <line x1="380" y1="165" x2="380" y2="330" stroke="rgba(245, 158, 11, 0.35)" stroke-width="1.5" stroke-dasharray="3,3"/>
          <circle cx="380" cy="330" r="4" fill="#F59E0B"/>
          <rect x="290" y="105" width="180" height="46" rx="8" fill="rgba(7, 21, 28, 0.9)" stroke="#F59E0B" stroke-width="1.2"/>
          <circle cx="305" cy="120" r="4" fill="#F59E0B"/>
          <text x="315" y="123" fill="#F59E0B" font-size="9" font-weight="800" letter-spacing="0.5">TRANSFER NODE 01</text>
          <text x="315" y="141" fill="#FFFFFF" font-size="11" font-weight="700">${stops[0].length > 20 ? stops[0].substring(0, 18) + '...' : stops[0]}</text>
          <circle cx="380" cy="165" r="14" fill="none" stroke="#F59E0B" stroke-width="1.5" opacity="0.8">
            <animate attributeName="r" values="8;18" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="380" cy="165" r="7" fill="#0D2630" stroke="#F59E0B" stroke-width="2.5"/>
          <circle cx="380" cy="165" r="3" fill="#F59E0B"/>
        </g>
      `;
    } else if (stops.length > 1) {
      pathD = 'M 120,280 C 260,130 520,130 680,220';
      stopsSvg = stops.map((s, idx) => {
        const cx = 260 + idx * 160;
        const cy = 160;
        return `
          <g class="map-waypoint-group">
            <line x1="${cx}" y1="${cy}" x2="${cx}" y2="330" stroke="rgba(245, 158, 11, 0.35)" stroke-width="1.5" stroke-dasharray="3,3"/>
            <rect x="${cx - 75}" y="${cy - 48}" width="150" height="40" rx="6" fill="rgba(7, 21, 28, 0.9)" stroke="#F59E0B" stroke-width="1.2"/>
            <text x="${cx}" y="${cy - 32}" fill="#F59E0B" font-size="9" font-weight="800" text-anchor="middle">STOP 0${idx+1}</text>
            <text x="${cx}" y="${cy - 16}" fill="#FFFFFF" font-size="10.5" font-weight="700" text-anchor="middle">${s.substring(0, 16)}</text>
            <circle cx="${cx}" cy="${cy}" r="6" fill="#0D2630" stroke="#F59E0B" stroke-width="2.5"/>
            <circle cx="${cx}" cy="${cy}" r="2.5" fill="#F59E0B"/>
          </g>
        `;
      }).join('');
    }

    const filteredJourneys = this.activeHistoryFilter === 'all' 
      ? this.pastJourneys 
      : this.pastJourneys.filter(j => j.mode === this.activeHistoryFilter);

    this.container.innerHTML = `
      <!-- Active Live Telemetry Screen -->
      <div class="uber-live-tracking-screen">
        <!-- Live Vector Map with Moving Autonomous Vehicle -->
        <div class="tracking-map-canvas-wrap">
          <!-- Top HUD Overlay -->
          <div class="tracking-hud-overlay">
            <div class="hud-pill">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;"></span>
              <span>LIVE TELEMETRY: ${v.speed} • ALT ${v.altitude || '140m AGL'}</span>
            </div>
            <div class="hud-pill">
              <span style="display: flex; align-items: center; gap: 4px; color: var(--color-accent-cyan);"><svg class="icon icon-xs" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> FUSION CELL: 98% • HEADWAY: 0.8s</span>
            </div>
          </div>

          <svg class="tracking-map-canvas" viewBox="0 0 800 380" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#10B981" stop-opacity="1"/>
                <stop offset="45%" stop-color="${v.color || '#38D9FF'}" stop-opacity="1"/>
                <stop offset="100%" stop-color="#38D9FF" stop-opacity="1"/>
              </linearGradient>
              <linearGradient id="terrainGradLive" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#0E2430" stop-opacity="0.6"/>
                <stop offset="100%" stop-color="#07151C" stop-opacity="0.95"/>
              </linearGradient>
              <filter id="blipGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
              <filter id="cardShadowLive" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
              </filter>
            </defs>

            <!-- Background & Sector Grid -->
            <rect width="800" height="380" fill="#061218"/>
            
            <!-- Topographic Contours -->
            <path d="M 0,220 Q 200,180 400,230 T 800,200 L 800,380 L 0,380 Z" fill="url(#terrainGradLive)"/>
            <path d="M 0,290 Q 300,260 600,290 L 800,280 L 800,380 L 0,380 Z" fill="#040D12" opacity="0.8"/>

            <!-- Sector Coordinates Matrix -->
            <line x1="0" y1="95" x2="800" y2="95" stroke="rgba(56, 217, 255, 0.08)" stroke-dasharray="3,6"/>
            <line x1="0" y1="190" x2="800" y2="190" stroke="rgba(56, 217, 255, 0.08)" stroke-dasharray="3,6"/>
            <line x1="0" y1="285" x2="800" y2="285" stroke="rgba(56, 217, 255, 0.08)" stroke-dasharray="3,6"/>
            <line x1="200" y1="0" x2="200" y2="380" stroke="rgba(56, 217, 255, 0.06)" stroke-dasharray="3,6"/>
            <line x1="400" y1="0" x2="400" y2="380" stroke="rgba(56, 217, 255, 0.06)" stroke-dasharray="3,6"/>
            <line x1="600" y1="0" x2="600" y2="380" stroke="rgba(56, 217, 255, 0.06)" stroke-dasharray="3,6"/>

            <!-- Sector Watermark -->
            <text x="30" y="45" fill="rgba(56, 217, 255, 0.2)" font-size="12" font-weight="800" letter-spacing="3">SECTOR 01 • WEST COAST ⇄ HIGHLANDS</text>
            <text x="770" y="45" fill="rgba(160, 180, 189, 0.4)" font-size="10" font-family="monospace" text-anchor="end">GRID 79.86°E : 06.92°N</text>

            <!-- Datum Ground Baseline -->
            <line x1="60" y1="330" x2="740" y2="330" stroke="rgba(16, 185, 129, 0.25)" stroke-width="1.5" stroke-dasharray="4,4"/>
            <text x="60" y="350" fill="rgba(160, 180, 189, 0.4)" font-size="9" font-family="monospace">DATUM 0M (GROUND)</text>
            <text x="740" y="350" fill="rgba(160, 180, 189, 0.4)" font-size="9" font-family="monospace" text-anchor="end">MAX ALT +140M</text>

            <!-- Vector Route Path (Glowing Arc) -->
            <path id="active-travel-arc-base" d="${pathD}" fill="none" stroke="#0D2B38" stroke-width="14" stroke-linecap="round"/>
            <path d="${pathD}" fill="none" stroke="#164356" stroke-width="7" stroke-linecap="round"/>
            <path id="active-travel-arc" d="${pathD}" fill="none" stroke="url(#routeGrad)" stroke-width="3.5" stroke-linecap="round"/>
            <path d="${pathD}" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="10,14" opacity="0.8"/>

            <!-- Directional Flow Pulse Line -->
            <path d="${pathD}" fill="none" stroke="${v.color || '#38D9FF'}" stroke-width="2.5" stroke-dasharray="8,28" opacity="0.9">
              <animate attributeName="stroke-dashoffset" values="72;0" dur="2s" repeatCount="indefinite"/>
            </path>

            <!-- Intermediate Waypoints -->
            ${stopsSvg}

            <!-- Origin Station Card & Laser Pin -->
            <g class="map-origin-live" filter="url(#cardShadowLive)">
              <line x1="120" y1="280" x2="120" y2="330" stroke="rgba(16, 185, 129, 0.45)" stroke-width="1.5" stroke-dasharray="3,3"/>
              <circle cx="120" cy="330" r="4" fill="#10B981"/>

              <rect x="30" y="195" width="180" height="58" rx="8" fill="rgba(7, 21, 28, 0.92)" stroke="#10B981" stroke-width="1.5"/>
              <circle cx="45" cy="212" r="4" fill="#10B981"/>
              <text x="56" y="215" fill="#10B981" font-size="9.5" font-weight="800" letter-spacing="0.5">ORIGIN INTERCHANGE</text>
              <text x="45" y="234" fill="#FFFFFF" font-size="12" font-weight="800">${this.currentRide.from.split(' ')[0]} Hub</text>
              <text x="45" y="246" fill="rgba(160, 180, 189, 0.8)" font-size="9.5">Gate: ${v.gate ? v.gate.split('(')[0] : 'SkyPort Gate 03'}</text>

              <circle cx="120" cy="280" r="16" fill="#0D2630" stroke="#10B981" stroke-width="3"/>
              <circle cx="120" cy="280" r="6" fill="#10B981"/>
            </g>

            <!-- Destination Station Card & Laser Pin -->
            <g class="map-dest-live" filter="url(#cardShadowLive)">
              <line x1="680" y1="220" x2="680" y2="330" stroke="rgba(56, 217, 255, 0.45)" stroke-width="1.5" stroke-dasharray="3,3"/>
              <circle cx="680" cy="330" r="4" fill="#38D9FF"/>

              <rect x="590" y="135" width="180" height="58" rx="8" fill="rgba(7, 21, 28, 0.92)" stroke="#38D9FF" stroke-width="1.5"/>
              <circle cx="605" cy="152" r="4" fill="#38D9FF"/>
              <text x="616" y="155" fill="#38D9FF" font-size="9.5" font-weight="800" letter-spacing="0.5">DESTINATION HUB</text>
              <text x="605" y="174" fill="#FFFFFF" font-size="12" font-weight="800">${this.currentRide.to.split(' ')[0]} Plaza</text>
              <text x="605" y="186" fill="rgba(160, 180, 189, 0.8)" font-size="9.5">Platform 01 • Level 0 Concourse</text>

              <circle cx="680" cy="220" r="16" fill="#0D2630" stroke="#38D9FF" stroke-width="3"/>
              <circle cx="680" cy="220" r="6" fill="#38D9FF"/>
            </g>

            <!-- Moving Autonomous Drone Blip with Aerodynamic Pod & Pulse Rings -->
            <g>
              <circle r="18" fill="none" stroke="${v.color || '#38D9FF'}" stroke-width="1.5" opacity="0.85">
                <animate attributeName="r" values="10;30" dur="1.8s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.85;0" dur="1.8s" repeatCount="indefinite"/>
                <animateMotion dur="8s" repeatCount="indefinite" path="${pathD}" rotate="auto"/>
              </circle>

              <g filter="url(#blipGlow)">
                <path d="M 16,0 L -10,8 L -16,0 L -10,-8 Z" fill="#FFFFFF" stroke="${v.color || '#38D9FF'}" stroke-width="2">
                  <animateMotion dur="8s" repeatCount="indefinite" path="${pathD}" rotate="auto"/>
                </path>
                <circle r="4.5" fill="${v.color || '#38D9FF'}">
                  <animateMotion dur="8s" repeatCount="indefinite" path="${pathD}"/>
                </circle>
              </g>
            </g>
          </svg>
        </div>

        <!-- Floating Live Tracking Sheet -->
        <div class="tracking-ride-sheet">
          <!-- Status Row -->
          <div class="tracking-status-badge-row">
            <span class="badge badge-live">● EN ROUTE • LEVEL 5 SWARM ACTIVE</span>
            <span style="font-size: var(--font-size-xs); font-family: var(--font-family-mono); color: var(--color-accent-cyan); font-weight: 700;">
              UNIT ${v.unitId || '#AP-804'}
            </span>
          </div>

          <!-- Countdown & ETA -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-2);">
            <div>
              <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
                Estimated Time of Arrival
              </div>
              <div class="tracking-time-left" id="tracking-countdown-val">
                ${mins}:${secs < 10 ? '0' : ''}${secs}
              </div>
            </div>
            <div style="text-align: right;">
              <span class="badge badge-balanced" style="font-size: 11px;">
                ✓ 100% Step-Free Concourse
              </span>
              <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 4px;">
                ${v.type} • Direct Corridor
              </div>
            </div>
          </div>

          <!-- Multi-Stage Stepper Simulation Bar -->
          <div class="tracking-stage-stepper">
            <div class="stage-step-item done" data-stage-btn="dispatch">
              <span class="stage-bullet"></span>
              <span>Dispatched</span>
            </div>
            <div class="stage-step-item done" data-stage-btn="boarding">
              <span class="stage-bullet"></span>
              <span>Boarded</span>
            </div>
            <div class="stage-step-item active" data-stage-btn="in-transit">
              <span class="stage-bullet"></span>
              <span>In Transit</span>
            </div>
            <div class="stage-step-item" data-stage-btn="approaching">
              <span class="stage-bullet"></span>
              <span>Approaching</span>
            </div>
          </div>

          <!-- Driver / Autonomous Pod Box -->
          <div class="tracking-driver-box">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--color-dark-primary); color: var(--color-accent-cyan); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); border: 1px solid var(--border-subtle);">
                <svg class="icon icon-md" viewBox="0 0 24 24"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
              </div>
              <div>
                <div style="font-weight: 800; font-size: var(--font-size-sm);">${v.name}</div>
                <div style="font-size: 11px; color: var(--color-text-secondary);">
                  AI Swarm Pilot #74 • Whisper Cabin Acoustics
                </div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; color: var(--color-text-muted); text-transform: uppercase;">Assigned Gate</div>
              <div style="font-weight: 800; font-size: var(--font-size-sm); color: var(--color-accent-cyan);">
                ${v.gate.split('(')[0]}
              </div>
            </div>
          </div>

          <!-- In-Flight Cabin Environment & Interactive Controls -->
          <div class="live-cabin-suite">
            <div class="cabin-suite-title">
              <span style="display: flex; align-items: center; gap: 6px;">
                <svg class="icon icon-xs" viewBox="0 0 24 24"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                <span>In-Flight Cabin Environment & Controls</span>
              </span>
              <span style="color: #10B981; font-weight: 700;">● Nominal (Optimal)</span>
            </div>

            <!-- Live Sensor Telemetry -->
            <div class="cabin-sensors-row">
              <div class="cabin-sensor-card">
                <div class="cabin-sensor-label">Cabin Temp</div>
                <div class="cabin-sensor-val">21.5°C</div>
              </div>
              <div class="cabin-sensor-card">
                <div class="cabin-sensor-label">O₂ Purity</div>
                <div class="cabin-sensor-val" style="color: #10B981;">99.8%</div>
              </div>
              <div class="cabin-sensor-card">
                <div class="cabin-sensor-label">G-Force</div>
                <div class="cabin-sensor-val" style="color: var(--color-accent-cyan);">0.02 g</div>
              </div>
              <div class="cabin-sensor-card">
                <div class="cabin-sensor-label">Acoustics</div>
                <div class="cabin-sensor-val">16 dB (Silent)</div>
              </div>
            </div>

            <!-- Interactive Cabin Controls -->
            <div class="cabin-controls-grid">
              <!-- Mood Light Color Picker -->
              <div class="cabin-control-card">
                <div class="cabin-control-label">Ambient Pod LED Lighting:</div>
                <div class="cabin-color-pickers">
                  <div class="cabin-color-dot ${this.ambientColor === '#38D9FF' ? 'active' : ''}" data-pod-color="#38D9FF" style="background: #38D9FF;" title="Cyan Pulse"></div>
                  <div class="cabin-color-dot ${this.ambientColor === '#7EF2C5' ? 'active' : ''}" data-pod-color="#7EF2C5" style="background: #7EF2C5;" title="Emerald Forest"></div>
                  <div class="cabin-color-dot ${this.ambientColor === '#FFB84D' ? 'active' : ''}" data-pod-color="#FFB84D" style="background: #FFB84D;" title="Solar Amber"></div>
                  <div class="cabin-color-dot ${this.ambientColor === '#D8B4FE' ? 'active' : ''}" data-pod-color="#D8B4FE" style="background: #D8B4FE;" title="Neural Violet"></div>
                </div>
              </div>

              <!-- Smart Glass Privacy -->
              <div class="cabin-control-card">
                <div class="cabin-control-label">Electrochromic Glass Dome:</div>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="route-type-chip ${this.glassTint === '0%' ? 'active' : ''}" data-tint-btn="0%" style="font-size: 10px; padding: 4px 8px;">Clear</button>
                  <button type="button" class="route-type-chip ${this.glassTint === '50%' ? 'active' : ''}" data-tint-btn="50%" style="font-size: 10px; padding: 4px 8px;">50% Tint</button>
                  <button type="button" class="route-type-chip ${this.glassTint === '100%' ? 'active' : ''}" data-tint-btn="100%" style="font-size: 10px; padding: 4px 8px;">Starlight Dome</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Cyan Path Directions -->
          <div class="cyan-path-escort">
            <svg class="icon icon-sm" viewBox="0 0 24 24"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>
            <span>Follow the illuminated cyan LED floor pathway from terminal entrance directly to Gate 03.</span>
          </div>

          <!-- Action Buttons Row -->
          <div style="display: flex; gap: var(--space-3); margin-top: var(--space-2); flex-wrap: wrap;">
            <button class="btn btn-primary" id="simulate-arrival-btn" style="flex: 2; min-width: 200px; padding: var(--space-4); font-weight: 800; border-radius: var(--radius-xl);">
              <span>Simulate Arrival & Complete Trip</span>
              <svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </button>

            <button class="btn btn-emergency" id="sos-beacon-btn" style="flex: 1; padding: var(--space-4); border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; gap: 6px;">
              <svg class="icon icon-xs" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>SOS Beacon</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ================================================================
           PREVIOUS JOURNEYS & QUANTUM TRIP HISTORY SECTION
           ================================================================ -->
      <section class="previous-journeys-container">
        <div class="previous-journeys-header">
          <div>
            <span class="badge badge-balanced">● QUANTUM LEDGER & TRIP ARCHIVE</span>
            <h2 style="font-size: var(--font-size-2xl); font-weight: 800; margin-top: 4px; color: var(--color-text-primary);">
              Previous Journeys & History
            </h2>
            <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: 2px;">
              Review past Sri Lanka 2100 transit telemetry, itemized digital receipts, and re-book frequent routes in one tap.
            </p>
          </div>

          <!-- History Mode Filters -->
          <div class="route-types-filter-bar" style="margin: 0;">
            <button type="button" class="route-type-chip ${this.activeHistoryFilter === 'all' ? 'active' : ''}" data-hist-filter="all">All Trips</button>
            <button type="button" class="route-type-chip ${this.activeHistoryFilter === 'airpod' ? 'active' : ''}" data-hist-filter="airpod">AirPod eVTOL</button>
            <button type="button" class="route-type-chip ${this.activeHistoryFilter === 'skyrail' ? 'active' : ''}" data-hist-filter="skyrail">SkyRail Maglev</button>
            <button type="button" class="route-type-chip ${this.activeHistoryFilter === 'autopod' ? 'active' : ''}" data-hist-filter="autopod">Smart Shuttles</button>
          </div>
        </div>

        <!-- Lifetime Analytics Metric Cards -->
        <div class="history-analytics-grid">
          <div class="history-stat-card">
            <span class="history-stat-label">Total Swarm Rides</span>
            <div class="history-stat-val">42</div>
            <span style="font-size: 11px; color: #10B981; font-weight: 700;">● 100% On-Time Stream</span>
          </div>

          <div class="history-stat-card">
            <span class="history-stat-label">Net CO₂ Offset</span>
            <div class="history-stat-val" style="color: #10B981;">168.4 kg</div>
            <span style="font-size: 11px; color: var(--color-text-secondary);">Clean Solar & Fusion</span>
          </div>

          <div class="history-stat-card">
            <span class="history-stat-label">Eco Credits Earned</span>
            <div class="history-stat-val" style="color: var(--color-accent-cyan);">520 ORB</div>
            <span style="font-size: 11px; color: var(--color-accent-cyan); font-weight: 700;">Citizen Tier: Diamond</span>
          </div>

          <div class="history-stat-card">
            <span class="history-stat-label">Average Speed</span>
            <div class="history-stat-val">520 km/h</div>
            <span style="font-size: 11px; color: var(--color-text-secondary);">Multi-Corridor Sync</span>
          </div>
        </div>

        <!-- Past Completed Trips List -->
        <div class="past-journeys-list">
          ${filteredJourneys.map(j => `
            <div class="past-journey-card">
              <div class="past-journey-top">
                <div class="past-journey-route">
                  <span>${j.from}</span>
                  <span style="color: var(--color-accent-cyan); font-weight: 800;">➔</span>
                  <span style="color: var(--color-accent-cyan);">${j.to}</span>
                </div>
                <div style="text-align: right;">
                  <span class="badge badge-fastest" style="font-size: 10px;">${j.date}</span>
                </div>
              </div>

              <!-- Meta Row -->
              <div class="past-journey-meta-row">
                <span style="font-weight: 700; color: var(--color-text-primary); display: flex; align-items: center; gap: 4px;">
                  <svg class="icon icon-xs" viewBox="0 0 24 24"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
                  <span>${j.vehicleName} (${j.unitId})</span>
                </span>
                <span style="display: flex; align-items: center; gap: 4px;"><svg class="icon icon-xs" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${j.duration} (${j.speed})</span>
                <span style="color: #10B981; font-weight: 700; display: flex; align-items: center; gap: 4px;"><svg class="icon icon-xs" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg> Saved ${j.co2Saved} CO₂</span>
                <span style="color: #FFB84D; font-weight: 800;">★ 5.0 Rating</span>
              </div>

              <!-- Tags -->
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${j.tags.map(t => `<span class="badge badge-balanced" style="font-size: 10px;">${t}</span>`).join('')}
              </div>

              <!-- Actions Row -->
              <div class="past-journey-actions">
                <div style="font-size: 12px; font-weight: 700; color: var(--color-text-secondary);">
                  Deducted Fare: <strong style="color: var(--color-accent-cyan); font-size: 14px;">${j.fare}</strong>
                  <span style="font-family: var(--font-family-mono); font-size: 11px; color: var(--color-text-muted); margin-left: 8px;">#${j.id}</span>
                </div>

                <div style="display: flex; gap: var(--space-2);">
                  <button type="button" class="btn btn-secondary rebook-journey-btn" data-rebook-from="${j.from}" data-rebook-to="${j.to}" data-rebook-mode="${j.mode}" style="padding: 6px 14px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                    <svg class="icon icon-xs" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5"/></svg>
                    <span>Re-Book Journey</span>
                  </button>
                  <button type="button" class="btn btn-glass view-receipt-btn" data-receipt-id="${j.id}" data-receipt-fare="${j.fare}" data-receipt-from="${j.from}" data-receipt-to="${j.to}" style="padding: 6px 14px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                    <svg class="icon icon-xs" viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-8M16 12h-8M14 16h-6"/></svg>
                    <span>Quantum Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;

    // Bind Listeners
    const arriveBtn = document.getElementById('simulate-arrival-btn');
    if (arriveBtn) {
      arriveBtn.addEventListener('click', () => this.completeTrip());
    }

    const sosBtn = document.getElementById('sos-beacon-btn');
    if (sosBtn) {
      sosBtn.addEventListener('click', () => {
        window.showToast?.('SOS Safety Escort Connected', 'Emergency Pod #ESC-01 dispatched to current coordinate in 75 seconds.');
      });
    }

    // Cabin Mood Lighting Pickers
    document.querySelectorAll('[data-pod-color]').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('[data-pod-color]').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.ambientColor = dot.getAttribute('data-pod-color');
        window.showToast?.('Ambient Cabin Lighting', `Mood light synchronized to ${this.ambientColor}`);
      });
    });

    // Glass Tint Buttons
    document.querySelectorAll('[data-tint-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-tint-btn]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.glassTint = btn.getAttribute('data-tint-btn');
        window.showToast?.('Electrochromic Smart Dome', `Opacity adjusted to ${this.glassTint}`);
      });
    });

    // History filter buttons
    document.querySelectorAll('[data-hist-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeHistoryFilter = btn.getAttribute('data-hist-filter');
        this.render();
      });
    });

    // Rebook Journey Buttons
    document.querySelectorAll('.rebook-journey-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const from = btn.getAttribute('data-rebook-from');
        const to = btn.getAttribute('data-rebook-to');
        const mode = btn.getAttribute('data-rebook-mode');

        if (window.orbitPlanner) {
          if (window.orbitPlanner.wizardFromInput) window.orbitPlanner.wizardFromInput.value = from;
          if (window.orbitPlanner.wizardToInput) window.orbitPlanner.wizardToInput.value = to;
          if (mode) window.orbitPlanner.selectVehicleByClass(mode);
          window.orbitPlanner.openWizard(1);
        }
      });
    });

    // View Receipt Buttons
    document.querySelectorAll('.view-receipt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const recId = btn.getAttribute('data-receipt-id');
        const fare = btn.getAttribute('data-receipt-fare');
        const from = btn.getAttribute('data-receipt-from');
        const to = btn.getAttribute('data-receipt-to');

        window.showToast?.(`Receipt ${recId}`, `${from} ➔ ${to} • Paid ${fare}`);
      });
    });
  }

  completeTrip() {
    if (this.timer) clearInterval(this.timer);
    this.stage = 'completed';
    this.renderRatingScreen();
    window.showToast?.('Trip Completed!', 'Welcome to your destination. Quantum pass receipts synchronized.');
  }

  renderRatingScreen() {
    if (!this.container) return;

    const v = this.currentRide.vehicle;

    this.container.innerHTML = `
      <div class="trip-rating-card" style="max-width: 640px; margin: var(--space-4) auto; background: var(--color-surface); border-radius: var(--radius-2xl); padding: var(--space-8); border: 1px solid var(--border-glass); box-shadow: var(--shadow-2xl); text-align: center;">
        <div style="color: #10B981; margin-bottom: var(--space-3);">
          <svg class="icon icon-xl" viewBox="0 0 24 24" style="width: 64px; height: 64px; margin: 0 auto;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>

        <h2 style="font-size: var(--font-size-2xl); font-weight: 800; margin-bottom: 6px;">You Have Arrived!</h2>
        <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-4);">
          ${this.currentRide.to} • ${v.name}
        </p>

        <!-- Eco Impact Reward Stat -->
        <div class="eco-impact-stat" style="margin-bottom: var(--space-5);">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg>
          <span>Saved 3.8 kg CO₂ • Earned +12 ORB Citizen Credits</span>
        </div>

        <!-- 5-Star Rating Row -->
        <div style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-text-primary); margin-top: var(--space-2);">
          Rate your 2100 Autonomous Swarm Experience:
        </div>

        <div class="star-rating-row" id="star-rating-row" style="margin: var(--space-3) 0;">
          <span class="star-btn active" data-star="1">★</span>
          <span class="star-btn active" data-star="2">★</span>
          <span class="star-btn active" data-star="3">★</span>
          <span class="star-btn active" data-star="4">★</span>
          <span class="star-btn active" data-star="5">★</span>
        </div>

        <!-- Feedback Tags Row -->
        <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin-bottom: var(--space-5);">
          <button type="button" class="route-type-chip active rating-tag-chip">Smooth Flight</button>
          <button type="button" class="route-type-chip active rating-tag-chip">Zero Delay</button>
          <button type="button" class="route-type-chip active rating-tag-chip">Clean Pod</button>
          <button type="button" class="route-type-chip active rating-tag-chip">Whisper Quiet</button>
          <button type="button" class="route-type-chip active rating-tag-chip">Precision Landing</button>
        </div>

        <!-- Quantum Receipt Box -->
        <div style="background: var(--color-bg-secondary); border-radius: var(--radius-xl); padding: var(--space-5); border: 1px solid var(--border-subtle); margin-bottom: var(--space-6); text-align: left;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--color-text-secondary); margin-bottom: 6px;">
            <span>QUANTUM DIGITAL RECEIPT</span>
            <span style="font-family: var(--font-family-mono); color: var(--color-accent-cyan); font-weight: 800;">#REC-2100-88492</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); font-weight: 700; margin-bottom: 4px;">
            <span>Origin Hub:</span>
            <span>${this.currentRide.from}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); font-weight: 700; margin-bottom: 4px;">
            <span>Destination Hub:</span>
            <span>${this.currentRide.to}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); font-weight: 700; border-top: 1px solid var(--border-subtle); padding-top: 6px; margin-top: 6px;">
            <span>Total Fare Deducted:</span>
            <span style="color: var(--color-accent-cyan); font-weight: 800;">${v.fare}</span>
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: var(--space-3); flex-direction: column;">
          <button class="btn btn-primary" id="book-next-ride-btn" style="width: 100%; padding: var(--space-4); font-weight: 800; border-radius: var(--radius-xl);">
            <span>✦ Plan Another 2100 Journey</span>
            <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          
          <button class="btn btn-secondary" id="restart-demo-ride-btn" style="width: 100%; padding: var(--space-3); border-radius: var(--radius-xl);">
            <span>Restart Live Tracking Simulation</span>
          </button>
        </div>
      </div>
    `;

    // Star Rating click listeners
    const stars = document.querySelectorAll('.star-btn');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.getAttribute('data-star'), 10);
        stars.forEach((s, idx) => {
          if (idx < rating) s.classList.add('active');
          else s.classList.remove('active');
        });
        window.showToast?.('Rating Submitted!', `Rated ${rating} Stars for Level 5 Swarm Pilot.`);
      });
    });

    // Rating tag click listeners
    document.querySelectorAll('.rating-tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
      });
    });

    const nextBtn = document.getElementById('book-next-ride-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.stage = 'in-transit';
        window.orbitPlanner?.openWizard(1);
      });
    }

    const restartBtn = document.getElementById('restart-demo-ride-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.stage = 'in-transit';
        this.secondsLeft = 11 * 60;
        this.render();
        this.startCountdown();
        window.showToast?.('Live Simulation Reset', 'Swarm telemetry tracking active.');
      });
    }
  }
}

window.orbitLiveJourney = new OrbitLiveJourney();
