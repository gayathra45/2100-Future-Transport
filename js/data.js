/**
 * ORBIT 2100 — Transportation Network Mock Database
 * Year 2100 multi-modal transit nodes, fleet specs, and telemetry
 */

window.ORBIT_DATA = {
  // Major 2100 Hubs & Destinations
  destinations: [
    {
      id: "colombo-central",
      name: "Colombo Central Grand Hub",
      zone: "Central Core • Level 0",
      type: "Multi-Modal Interchange",
      lat: 6.9271,
      lng: 79.8612,
      modes: ["train", "bus", "air", "road", "walking"]
    },
    {
      id: "oceanic-district",
      name: "Oceanic District Floating Plaza",
      zone: "Marine Sector 04",
      type: "Sub-Sea & Surface Terminal",
      lat: 6.9380,
      lng: 79.8350,
      modes: ["air", "train", "bike"]
    },
    {
      id: "sky-gardens",
      name: "Sky Gardens Bio-Tower",
      zone: "Upper Stratum 12",
      type: "Vertical Aerodrome",
      lat: 6.9150,
      lng: 79.8700,
      modes: ["air", "walking", "bike"]
    },
    {
      id: "lunar-gateway",
      name: "Lunar Gateway Orbital Terminal",
      zone: "North Equatorial Corridor",
      type: "Suborbital & Maglev Hub",
      lat: 7.1800,
      lng: 79.8841,
      modes: ["train", "air", "road"]
    },
    {
      id: "vertical-city",
      name: "Vertical City Center (Eco-Arcology)",
      zone: "Sector 07 • Tier 4",
      type: "Autonomous Pod Spine",
      lat: 6.9020,
      lng: 79.8600,
      modes: ["bus", "road", "walking"]
    },
    {
      id: "kandy-skyhub",
      name: "Kandy SkyHub Mountain Station",
      zone: "Central Highlands Corridor",
      type: "Maglev & Atmospheric Hub",
      lat: 7.2906,
      lng: 80.6337,
      modes: ["train", "air"]
    },
    {
      id: "galle-marineport",
      name: "Galle MarinePort Autonomous Port",
      zone: "Southern Coastal Spine",
      type: "Hydrail & Smart Road Nexus",
      lat: 6.0535,
      lng: 80.2210,
      modes: ["train", "road", "bus"]
    },
    {
      id: "jaffna-solar",
      name: "Jaffna Solar Terminal",
      zone: "Northern Energy Corridor",
      type: "Hyperloop Node",
      lat: 9.6615,
      lng: 80.0255,
      modes: ["train", "air"]
    }
  ],

  // 4 Core Transport Modes for Fleet Showcase
  transportModes: [
    {
      id: "autonomous-bus",
      title: "Autonomous Bus",
      tagline: "Quiet. Adaptive. Always connected.",
      description: "Zero-emission fleet with dynamic lane prioritization, predictive passenger dispatch, and soft acoustic shielding.",
      specs: {
        capacity: "48 Passengers",
        energy: "100% Solid-State Quantum Battery",
        safety: "Level 5 AI Perception Grid",
        accessibility: "Level-Boarding Pneumatic Ramps"
      },
      icon: "bus",
      image: "assets/images/autonomous_bus.jpg"
    },
    {
      id: "autonomous-rail",
      title: "Autonomous Rail & SkyRail",
      tagline: "Move through the city without traffic.",
      description: "Magnetic levitation spine connecting vertical towers and regional hubs with sub-second braking synchrony.",
      specs: {
        speed: "320 km/h Urban • 650 km/h Regional",
        headway: "Every 45 seconds",
        energy: "Kinetic Regeneration Grid",
        accessibility: "Step-free automated bridge plates"
      },
      icon: "train",
      image: "assets/images/autonomous_rail.jpg"
    },
    {
      id: "air-mobility",
      title: "Air Mobility & AirPods",
      tagline: "Above the city. Below the clouds.",
      description: "Quiet eVTOL passenger drones operating on precision virtual 3D corridors with zero ground friction.",
      specs: {
        altitude: "150m – 400m Sky Corridors",
        noise: "< 35 dB Ambient Whispering",
        guidance: "Multi-Agent Swarm AI",
        accessibility: "Full universal wheelchair docking"
      },
      icon: "air",
      image: "assets/images/air_mobility.jpg"
    },
    {
      id: "smart-road",
      title: "Smart Road Infrastructure",
      tagline: "Roads that think ahead.",
      description: "Inductive charging surfaces, dynamic embedded lighting paths, and synchronized vehicle platooning.",
      specs: {
        surface: "Photovoltaic Self-Healing Composite",
        charging: "Dynamic In-Motion Wireless Transfer",
        flow: "Zero-Interruption Swarm Intersections",
        guidance: "Real-time Cyan Path projections"
      },
      icon: "road",
      image: "assets/images/smart_road.jpg"
    }
  ],

  // Explore 2100 Destinations
  exploreDestinations: [
    {
      id: "dest-1",
      title: "Oceanic District",
      subtitle: "Floating Ecological Arcology",
      distance: "4.2 km",
      time: "12 min",
      modes: ["air", "train"],
      badge: "Eco Sanctuary",
      image: "assets/images/oceanic_district.jpg"
    },
    {
      id: "dest-2",
      title: "Sky Gardens Bio-Tower",
      subtitle: "Stratum 12 Vertical Parks",
      distance: "6.8 km",
      time: "16 min",
      modes: ["air", "walking"],
      badge: "High Altitude",
      image: "assets/images/sky_gardens.jpg"
    },
    {
      id: "dest-3",
      title: "Vertical City Center",
      subtitle: "Zero-Carbon Urban Spine",
      distance: "3.1 km",
      time: "9 min",
      modes: ["bus", "train"],
      badge: "City Core",
      image: "assets/images/vertical_city.jpg"
    },
    {
      id: "dest-4",
      title: "Lunar Gateway Terminal",
      subtitle: "Suborbital & Maglev Launch Hub",
      distance: "28.5 km",
      time: "24 min",
      modes: ["train", "air"],
      badge: "Aerospace",
      image: "assets/images/lunar_gateway.jpg"
    },
    {
      id: "dest-5",
      title: "Autonomous Mobility Hub 01",
      subtitle: "Central Swarm Dispatch Nexus",
      distance: "1.8 km",
      time: "5 min",
      modes: ["bus", "road", "bike"],
      badge: "Transit Nexus",
      image: "assets/images/mobility_hub.jpg"
    },
    {
      id: "dest-6",
      title: "Bio-Dome Coral Research Zone",
      subtitle: "Protected Coastal Marine Laboratory",
      distance: "14.2 km",
      time: "21 min",
      modes: ["train", "road"],
      badge: "Marine Lab",
      image: "assets/images/coral_dome.jpg"
    }
  ],

  // Safety Center Telemetry
  safetyTelemetry: {
    systemHealth: "100% Operational",
    activeVehicles: "14,892",
    collisionFreeHours: "876,420 hrs",
    gridSyncLatency: "0.4 ms",
    airCorridorClearance: "Optimal (Zero Turbulence)",
    emergencyResponseTarget: "90 seconds citywide"
  },

  // AI Prompt Library & Responses
  aiDialogues: {
    greetings: "Hello! I am ORBIT AI, your 2100 unified journey companion. How would you like to move today?",
    prompts: [
      {
        label: "I need to reach the university before 8:30.",
        query: "I need to reach the university before 8:30.",
        reply: "I found 3 synchronized journeys. The quietest option arrives at 8:12 AM at Gate 04 with zero transfers.",
        targetRoute: { from: "Colombo Central Grand Hub", to: "Vertical City Center (Eco-Arcology)" }
      },
      {
        label: "Take me to the Oceanic District with step-free access.",
        query: "Step-free route to Oceanic District",
        reply: "Selected 100% step-free journey via SkyRail 04 & AirPod with level-boarding platform elevators.",
        targetRoute: { from: "Colombo Central Grand Hub", to: "Oceanic District Floating Plaza" },
        enableStepFree: true
      },
      {
        label: "Fastest way to Lunar Gateway Terminal?",
        query: "Fastest route to Lunar Gateway",
        reply: "Connecting via High-Speed Maglev Line Alpha. Total travel time is 22 minutes departing immediately from Track 2.",
        targetRoute: { from: "Colombo Central Grand Hub", to: "Lunar Gateway Orbital Terminal" }
      },
      {
        label: "Show low sensory routes avoiding crowds.",
        query: "Quiet low sensory route",
        reply: "Adaptive acoustic shielding enabled. Routing via autonomous pod Pod-302 with gentle lighting and 85% lower ambient sound.",
        targetRoute: { from: "Colombo Central Grand Hub", to: "Sky Gardens Bio-Tower" }
      }
    ]
  },

  // Generator function for 3 distinct smart routes
  generateRoutes: function(fromName, toName, isStepFree = false) {
    const start = fromName || "Colombo Central Grand Hub";
    const end = toName || "Oceanic District Floating Plaza";

    return [
      {
        id: "route-fastest",
        type: "fastest",
        title: "Fastest Synchronization",
        badgeText: "FASTEST",
        badgeClass: "badge-fastest",
        durationMinutes: 32,
        transfers: 2,
        arrivalOffsetMin: 32,
        co2Impact: "0g net (100% Kinetic/Solar)",
        energyEfficiency: "98.4%",
        reliability: "99.9% On-time",
        accessibility: isStepFree ? "100% Step-Free Certified (Level Boarding)" : "Full Accessibility",
        credits: "4.2 ORBIT Credits",
        segments: [
          {
            mode: "train",
            modeName: "Autonomous Metro Rail",
            instruction: "Board Metro Line 1 at Colombo Central Track 4",
            duration: "14 min",
            color: "#38D9FF",
            detail: "Autonomous Maglev • Car 03 Reserved"
          },
          {
            mode: "transfer",
            modeName: "Smart Transfer Hub 02",
            instruction: "Follow the cyan path to SkyRail Gate 04",
            duration: "3 min transfer",
            color: "#7EF2C5",
            detail: "Platform automatically synchronized"
          },
          {
            mode: "air",
            modeName: "AirPod SkyCorridor Alpha",
            instruction: "Board AirPod #804 to Oceanic SkyPort",
            duration: "11 min",
            color: "#38D9FF",
            detail: "Virtual Flight Path 220m Altitude"
          },
          {
            mode: "road",
            modeName: "Smart Shuttle Pod",
            instruction: "Autonomous road shuttle to final pavilion",
            duration: "4 min",
            color: "#7EF2C5",
            detail: "Direct door-to-hub dispatch"
          }
        ]
      },
      {
        id: "route-balanced",
        type: "balanced",
        title: "Balanced & Comfortable",
        badgeText: "BALANCED",
        badgeClass: "badge-balanced",
        durationMinutes: 41,
        transfers: 1,
        arrivalOffsetMin: 41,
        co2Impact: "0g net (Hydro-Regenerative)",
        energyEfficiency: "99.1%",
        reliability: "100% On-time",
        accessibility: "Level Boarding & Audio-Visual Escort",
        credits: "3.5 ORBIT Credits",
        segments: [
          {
            mode: "train",
            modeName: "SkyRail High-Spine",
            instruction: "Board SkyRail Carriage 07 at Grand Concourse",
            duration: "25 min",
            color: "#7EF2C5",
            detail: "Panoramic Viewing Deck • Smooth Levitation"
          },
          {
            mode: "transfer",
            modeName: "Central Transfer Spine",
            instruction: "Seamless 2-minute elevator glide",
            duration: "2 min transfer",
            color: "#38D9FF",
            detail: "Direct connection • Zero stairs"
          },
          {
            mode: "bus",
            modeName: "Autonomous Electric Shuttle",
            instruction: "Board Shuttle Line 9 directly to destination",
            duration: "14 min",
            color: "#7EF2C5",
            detail: "Adaptive seat spacing • Quiet cabin"
          }
        ]
      },
      {
        id: "route-eco",
        type: "eco",
        title: "Lowest Energy Impact",
        badgeText: "LOW IMPACT",
        badgeClass: "badge-eco",
        durationMinutes: 48,
        transfers: 1,
        arrivalOffsetMin: 48,
        co2Impact: "-12g net (Solar Capture Credit)",
        energyEfficiency: "99.9%",
        reliability: "99.8% On-time",
        accessibility: "Full Universal Design Certified",
        credits: "2.8 ORBIT Credits",
        segments: [
          {
            mode: "train",
            modeName: "Solar-Powered Maglev Spine",
            instruction: "Board Green Corridor Line at Colombo Level 0",
            duration: "32 min",
            color: "#10B981",
            detail: "100% Photovoltaic Grid Powered"
          },
          {
            mode: "transfer",
            modeName: "Bio-Hub Transfer Walk",
            instruction: "Guided travelator connection",
            duration: "3 min transfer",
            color: "#10B981",
            detail: "Purified air corridor"
          },
          {
            mode: "walking",
            modeName: "Smart Canopy Walkway",
            instruction: "Covered climate-controlled gentle stroll",
            duration: "13 min",
            color: "#10B981",
            detail: "Regenerative kinetic energy tiles"
          }
        ]
      }
    ];
  }
};
