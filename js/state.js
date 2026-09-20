/**
 * ORBIT 2100 — Global Reactive State Manager
 * Handles persistent state via localStorage and reactive pub/sub
 */

class OrbitStateManager {
  constructor() {
    this.storageKey = 'orbit_2100_state';
    this.listeners = new Map();
    
    // Default initial state
    this.state = {
      theme: 'light', // 'light' | 'dark'
      accessibility: {
        highContrast: false,
        largeText: false,
        lowSensory: false,
        stepFree: false,
        voiceGuidance: false,
        reducedMotion: false,
        extraTransferTime: false
      },
      simpleMode: false,
      activeView: 'home', // 'home' | 'explore' | 'live' | 'map' | 'safety' | 'profile' | 'simple-view'
      isOnline: true,
      
      // Active planner query
      plannerQuery: {
        from: 'Colombo Central Grand Hub',
        to: 'Oceanic District Floating Plaza',
        date: 'Today',
        time: 'Now',
        passengers: 1
      },
      
      // Generated route options
      routes: [],
      selectedRouteId: null,
      
      // Active Live Journey
      activeJourney: null,
      
      // Search History & User Stats
      recentSearches: [
        'Oceanic District Floating Plaza',
        'Lunar Gateway Orbital Terminal',
        'Sky Gardens Bio-Tower'
      ],
      userStats: {
        name: 'Orion Vance',
        tier: 'ORBIT Citizen Elite',
        quantumPassId: 'ORB-2100-9842X',
        credits: 142.8,
        tripsCompleted: 87,
        carbonSavedKg: 248.5
      }
    };

    this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = {
          ...this.state,
          ...parsed,
          accessibility: { ...this.state.accessibility, ...(parsed.accessibility || {}) },
          userStats: { ...this.state.userStats, ...(parsed.userStats || {}) }
        };
      }
    } catch (e) {
      console.warn('Unable to read localStorage:', e);
    }
  }

  saveState() {
    try {
      const toSave = {
        theme: this.state.theme,
        accessibility: this.state.accessibility,
        simpleMode: this.state.simpleMode,
        recentSearches: this.state.recentSearches,
        userStats: this.state.userStats
      };
      localStorage.setItem(this.storageKey, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Unable to write to localStorage:', e);
    }
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
    this.saveState();
    this.notify(key, value);
  }

  updateAccessibility(key, value) {
    this.state.accessibility[key] = value;
    this.saveState();
    this.notify('accessibility', this.state.accessibility);
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);
    return () => {
      const arr = this.listeners.get(key) || [];
      this.listeners.set(key, arr.filter(cb => cb !== callback));
    };
  }

  notify(key, value) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => callback(value, this.state));
    }
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(callback => callback(key, value, this.state));
    }
  }

  // Start live journey from a selected route
  startLiveJourney(route) {
    this.state.activeJourney = {
      route: route,
      startTime: Date.now(),
      totalSeconds: (route.durationMinutes || 32) * 60,
      secondsRemaining: (route.durationMinutes || 32) * 60,
      currentStepIndex: 0,
      platformReserved: true,
      nextGate: 'Gate 04',
      status: 'in-progress'
    };
    this.set('activeJourney', this.state.activeJourney);
  }

  stopLiveJourney() {
    this.state.activeJourney = null;
    this.set('activeJourney', null);
  }
}

window.orbitState = new OrbitStateManager();
