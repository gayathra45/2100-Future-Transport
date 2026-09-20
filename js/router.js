/**
 * ORBIT 2100 — View Navigation & Routing Controller
 * Seamless view switching, mobile bottom-nav updates, and URL hash sync
 */

class OrbitRouter {
  constructor() {
    this.currentView = 'home';
    this.init();
  }

  init() {
    // Listen to hash changes
    window.addEventListener('hashchange', () => this.handleHashChange());
    
    // Bind click events on elements with data-nav-target
    document.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('[data-nav-target]');
      if (targetBtn) {
        e.preventDefault();
        const targetView = targetBtn.getAttribute('data-nav-target');
        this.navigate(targetView);
      }
    });

    // Handle initial hash
    if (window.location.hash) {
      this.handleHashChange();
    } else {
      this.navigate('home', false);
    }
  }

  handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      this.navigate(hash, false);
    }
  }

  navigate(viewId, updateHash = true) {
    if (!viewId) return;

    // Check for simple mode override
    if (viewId === 'simple-view') {
      window.orbitState.set('simpleMode', true);
    }

    const previousView = this.currentView;
    this.currentView = viewId;
    window.orbitState.set('activeView', viewId);

    if (updateHash) {
      history.pushState(null, '', `#${viewId}`);
    }

    // Update View DOM elements
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(section => {
      const sectionViewId = section.getAttribute('data-view-id');
      if (sectionViewId === viewId) {
        section.classList.add('active');
        // Scroll to top of content smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        section.classList.remove('active');
      }
    });

    // Update Navigation Active Links (Desktop + Mobile)
    document.querySelectorAll('[data-nav-target]').forEach(link => {
      const target = link.getAttribute('data-nav-target');
      if (target === viewId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // Special view triggers
    if (viewId === 'map' && window.orbitMap) {
      setTimeout(() => window.orbitMap.resize(), 100);
    }
    if (viewId === 'live' && window.orbitLiveJourney) {
      window.orbitLiveJourney.render();
    }
  }
}

window.orbitRouter = new OrbitRouter();
