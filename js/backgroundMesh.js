/**
 * ORBIT 2100 — Quantum Transit Mesh Background Canvas Engine
 * Renders smooth animated transit vectors, glowing quantum nodes, and drifting photon blips.
 */

(function initQuantumMesh() {
  const canvas = document.createElement('canvas');
  canvas.id = 'quantum-mesh-bg-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  canvas.style.opacity = '0.55';
  canvas.style.transition = 'opacity 0.6s ease';

  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;

  // Quantum Nodes & Photons
  const NODE_COUNT = 36;
  const nodes = [];
  const photons = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  // Create ambient transit nodes
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.2 + 1.4,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.025
    });
  }

  // Create light packets / photons moving along vectors
  for (let p = 0; p < 18; p++) {
    photons.push({
      fromNode: Math.floor(Math.random() * NODE_COUNT),
      toNode: Math.floor(Math.random() * NODE_COUNT),
      progress: Math.random(),
      speed: 0.0035 + Math.random() * 0.005,
      color: Math.random() > 0.4 ? '#38D9FF' : (Math.random() > 0.5 ? '#10B981' : '#7EF2C5')
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const lineColor = isDark ? 'rgba(56, 217, 255, 0.12)' : 'rgba(3, 20, 30, 0.06)';
    const nodeBaseColor = isDark ? '#38D9FF' : '#0B3042';
    const nodeSecondaryColor = '#10B981';

    // 1. Update & Draw Nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      node.pulse += node.pulseSpeed;
      const currentRadius = node.radius + Math.sin(node.pulse) * 0.8;

      ctx.beginPath();
      ctx.arc(node.x, node.y, Math.max(currentRadius, 0.6), 0, Math.PI * 2);
      ctx.fillStyle = i % 3 === 0 ? nodeSecondaryColor : nodeBaseColor;
      ctx.globalAlpha = isDark ? 0.75 : 0.4;
      ctx.fill();

      // Soft glow aura
      if (isDark) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(56, 217, 255, 0.08)';
        ctx.fill();
      }
    }

    // 2. Draw Interconnected Network Lines
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 190) {
          ctx.strokeStyle = lineColor;
          ctx.globalAlpha = (1 - dist / 190) * (isDark ? 0.4 : 0.18);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // 3. Draw Moving Photons (Transit Packets)
    for (let p = 0; p < photons.length; p++) {
      const photon = photons[p];
      const n1 = nodes[photon.fromNode];
      const n2 = nodes[photon.toNode];

      if (!n1 || !n2 || photon.fromNode === photon.toNode) {
        photon.fromNode = Math.floor(Math.random() * NODE_COUNT);
        photon.toNode = Math.floor(Math.random() * NODE_COUNT);
        photon.progress = 0;
        continue;
      }

      photon.progress += photon.speed;
      if (photon.progress >= 1) {
        photon.progress = 0;
        photon.fromNode = photon.toNode;
        photon.toNode = Math.floor(Math.random() * NODE_COUNT);
      }

      const px = n1.x + (n2.x - n1.x) * photon.progress;
      const py = n1.y + (n2.y - n1.y) * photon.progress;

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = photon.color;
      ctx.globalAlpha = isDark ? 0.9 : 0.6;
      ctx.shadowColor = photon.color;
      ctx.shadowBlur = isDark ? 8 : 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(render);
  }

  render();
})();

