// ==================== SCROLL-BASED NAVIGATION ====================
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');
  const visited = new Set();

  // ==================== SCROLL SPY ====================
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-section="${id}"]`);
        if (activeLink) activeLink.classList.add('active');

        visited.add(id);
        visited.forEach(visitedId => {
          const visitedLink = document.querySelector(`.nav-link[data-section="${visitedId}"]`);
          if (visitedLink && !visitedLink.classList.contains('active')) {
            visitedLink.classList.add('visited');
          }
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' });

  sections.forEach(section => sectionObserver.observe(section));

  // ==================== SMOOTH SCROLL NAV ====================
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.section);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        history.replaceState(null, '', `#${link.dataset.section}`);
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.classList.contains('nav-link')) return;
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        history.replaceState(null, '', `#${targetId}`);
      }
    });
  });

  // ==================== SCROLL ANIMATIONS ====================
  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        animateObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-in').forEach(el => animateObserver.observe(el));

  // ==================== COPY ADDRESS ON CLICK ====================
  document.querySelectorAll('.address-table code, .card code').forEach(codeEl => {
    const text = codeEl.textContent.trim();
    if (text.startsWith('0x') || text.startsWith('packs/') || text.startsWith('CASH')) {
      codeEl.style.cursor = 'pointer';
      codeEl.title = 'Click to copy';
      codeEl.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          const original = codeEl.textContent;
          codeEl.textContent = 'Copied!';
          codeEl.style.color = '#10b981';
          setTimeout(() => { codeEl.textContent = original; codeEl.style.color = ''; }, 1000);
        } catch {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
      });
    }
  });

  // ==================== HANDLE INITIAL HASH ====================
  const hash = window.location.hash.slice(1);
  if (hash) {
    const target = document.getElementById(hash);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  // ==================== CEREMONY SIMULATOR ====================
  const MINT_STEPS = [
    {
      title: 'Prepare Collateral',
      desc: 'USD from LeadBank FBO account is converted to USDC (via Coinbase), then USDC is atomically swapped to USTB (Superstate yield-bearing token) on Ethereum. USTB is the onchain collateral backing M.',
      tags: ['onchain'],
      transfer: 'ReservesRebalanceOp: Bank USD \u2192 USDC (Coinbase) \u2192 USTB (Superstate atomic swap)',
      entities: ['sim-collateral'],
      edges: [],
      balances: { collateral: '-$750K', m: '', 'musd-eth': '', 'musd-dest': '' },
      onchain: { mints: 0, burns: 0 },
      ledger: { mints: 0, burns: 0 },
    },
    {
      title: 'Update Collateral on M0',
      desc: 'Report the updated collateral amounts to M0 protocol onchain.',
      tags: ['onchain'],
      transfer: 'Bridge Minter (0xCD13...) calls updateCollateral() on Minter Gateway',
      entities: ['sim-collateral', 'sim-minter-gw'],
      edges: [1],
      balances: { collateral: '-$750K', m: '', 'musd-eth': '', 'musd-dest': '' },
      onchain: { mints: 0, burns: 0 },
      ledger: { mints: 0, burns: 0 },
    },
    {
      title: 'Propose & Mint M Tokens',
      desc: 'Propose mint to Minter Gateway, then execute. $742.5K of M tokens created (0.99 mint ratio).',
      tags: ['onchain'],
      transfer: '0x0000...0000 \u2192 Bridge Minter (0xCD13...) \u2014 742,500 M minted',
      entities: ['sim-minter-gw', 'sim-m-token'],
      edges: [2],
      balances: { collateral: '-$750K', m: '+$742.5K', 'musd-eth': '', 'musd-dest': '' },
      onchain: { mints: 1, burns: 0 },
      ledger: { mints: 0, burns: 0 },
    },
    {
      title: 'Swap M \u2192 mUSD via Swap Facility',
      desc: 'Approve M spending, call wrap(). M deposited, mUSD minted 1:1.',
      tags: ['onchain'],
      transfer: '0x0000...0000 \u2192 Bridge Inventory (0x6582...) \u2014 742,500 mUSD minted on Ethereum',
      entities: ['sim-m-token', 'sim-swap', 'sim-musd-eth'],
      edges: [3, 4],
      balances: { collateral: '-$750K', m: '$0', 'musd-eth': '+$742.5K', 'musd-dest': '' },
      onchain: { mints: 2, burns: 0 },
      ledger: { mints: 0, burns: 0 },
    },
    {
      title: 'Bridge mUSD to Linea via relay.link',
      desc: 'Approve and bridge mUSD from Ethereum to Linea. Burns on ETH, mints on Linea.',
      tags: ['onchain'],
      transfer: 'ETH: Bridge Inventory (0x6582...) \u2192 0x0000 (burn)\nLinea: 0x0000 \u2192 relay.link (0xf70d...) \u2192 Bridge Inventory',
      entities: ['sim-musd-eth', 'sim-bridge-relay', 'sim-musd-dest'],
      edges: [5, 6],
      balances: { collateral: '-$750K', m: '$0', 'musd-eth': '$0', 'musd-dest': '+$742.5K' },
      onchain: { mints: 3, burns: 1 },
      ledger: { mints: 0, burns: 0 },
    },
    {
      title: 'Complete \u2014 Ledger records one mint',
      desc: 'mUSD is now in Bridge inventory on Linea. The ledger records a single "Issuance Mint" of $742,500.',
      tags: ['ledger'],
      transfer: 'Ledger: +$742,500 mUSD (Issuance Mint)',
      entities: ['sim-musd-dest'],
      edges: [],
      balances: { collateral: '-$750K', m: '$0', 'musd-eth': '$0', 'musd-dest': '+$742.5K' },
      onchain: { mints: 3, burns: 1 },
      ledger: { mints: 1, burns: 0 },
    },
  ];

  const BURN_STEPS = [
    {
      title: 'Bridge mUSD from BSC to Ethereum',
      desc: 'mUSD is on BSC. Bridge it back to Ethereum via relay.link first.',
      tags: ['onchain'],
      transfer: 'BSC: Bridge Inventory \u2192 0x0000 (burn)\nETH: 0x0000 \u2192 relay.link (0xf70d...) \u2192 Bridge Inventory',
      entities: ['sim-musd-dest', 'sim-bridge-relay', 'sim-musd-eth'],
      edges: [-6, -5],
      balances: { collateral: '', m: '', 'musd-eth': '+$300K', 'musd-dest': '-$300K' },
      onchain: { mints: 1, burns: 1 },
      ledger: { mints: 0, burns: 0 },
    },
    {
      title: 'Swap mUSD \u2192 M via Swap Facility',
      desc: 'Call unwrap() on the Swap Facility. mUSD burned, M returned 1:1.',
      tags: ['onchain'],
      transfer: 'Bridge Inventory (0x6582...) \u2192 0x0000...0000 \u2014 300,000 mUSD burned on Ethereum',
      entities: ['sim-musd-eth', 'sim-swap', 'sim-m-token'],
      edges: [-4, -3],
      balances: { collateral: '', m: '+$300K', 'musd-eth': '$0', 'musd-dest': '-$300K' },
      onchain: { mints: 1, burns: 2 },
      ledger: { mints: 0, burns: 0 },
    },
    {
      title: 'Burn M via Minter Gateway',
      desc: 'Burn M tokens. Collateral becomes retrievable.',
      tags: ['onchain'],
      transfer: 'Bridge Minter (0xCD13...) \u2192 0x0000...0000 \u2014 300,000 M burned',
      entities: ['sim-m-token', 'sim-minter-gw'],
      edges: [-2],
      balances: { collateral: '', m: '$0', 'musd-eth': '$0', 'musd-dest': '-$300K' },
      onchain: { mints: 1, burns: 3 },
      ledger: { mints: 0, burns: 0 },
    },
    {
      title: 'Retrieve Collateral',
      desc: 'Propose collateral retrieval from M0 protocol and convert USTB back to USDC reserves.',
      tags: ['onchain'],
      transfer: 'RetrievalOp: proposeRetrieval() on Minter Gateway, then USTB \u2192 USDC',
      entities: ['sim-minter-gw', 'sim-collateral'],
      edges: [-1],
      balances: { collateral: '+$300K', m: '$0', 'musd-eth': '$0', 'musd-dest': '-$300K' },
      onchain: { mints: 1, burns: 3 },
      ledger: { mints: 0, burns: 0 },
    },
    {
      title: 'Complete \u2014 Ledger records one burn',
      desc: 'The ledger records a single "Issuance Burn" of $300,000.',
      tags: ['ledger'],
      transfer: 'Ledger: -$300,000 mUSD (Issuance Burn)',
      entities: ['sim-collateral'],
      edges: [],
      balances: { collateral: '+$300K', m: '$0', 'musd-eth': '$0', 'musd-dest': '' },
      onchain: { mints: 1, burns: 3 },
      ledger: { mints: 0, burns: 1 },
    },
  ];

  let currentMode = 'mint';
  let currentStep = -1; // -1 = not started

  const stepsContainer = document.getElementById('sim-steps');
  const prevBtn = document.getElementById('sim-prev');
  const nextBtn = document.getElementById('sim-next');
  const resetBtn = document.getElementById('sim-reset');
  const progressLabel = document.getElementById('sim-progress');
  const punchline = document.getElementById('sim-punchline');

  function getSteps() {
    return currentMode === 'mint' ? MINT_STEPS : BURN_STEPS;
  }

  function renderSteps() {
    const steps = getSteps();
    if (currentStep < 0) {
      stepsContainer.innerHTML = `<div class="sim-step-ready">Click <strong>Start</strong> to begin the ${currentMode} ceremony</div>`;
      return;
    }
    // Done steps as clickable pills
    const donePills = steps.slice(0, currentStep).map((s, i) =>
      `<span class="sim-done-pill" data-step="${i}" title="${s.desc}">${i + 1}. ${s.title} \u2713</span>`
    ).join('');
    // Current step expanded
    const step = steps[currentStep];
    const tagHtml = step.tags.map(t => {
      const cls = t === 'onchain' ? 'sim-tag-onchain' : t === 'ledger' ? 'sim-tag-ledger' : 'sim-tag-offchain';
      const label = t === 'onchain' ? 'Onchain' : t === 'ledger' ? 'Ledger' : 'Off-chain';
      return `<span class="sim-step-tag ${cls}">${label}</span>`;
    }).join('');
    const transferHtml = step.transfer
      ? `<div class="sim-step-transfer">${step.transfer.replace(/\n/g, '<br>')}</div>` : '';
    // Upcoming steps as dim pills
    const upcomingPills = steps.slice(currentStep + 1).map((s, i) =>
      `<span class="sim-upcoming-pill">${currentStep + 2 + i}. ${s.title}</span>`
    ).join('');
    stepsContainer.innerHTML = `
      ${donePills ? `<div class="sim-done-pills">${donePills}</div>` : ''}
      <div class="sim-step-card current">
        <div class="sim-step-num">${currentStep + 1}</div>
        <div class="sim-step-body">
          <h4>${step.title}</h4>
          <p>${step.desc}</p>
          ${tagHtml}
          ${transferHtml}
        </div>
      </div>
      ${upcomingPills ? `<div class="sim-upcoming-pills">${upcomingPills}</div>` : ''}
    `;
    // Click handler for done pills — jump to that step
    stepsContainer.querySelectorAll('.sim-done-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        currentStep = parseInt(pill.dataset.step, 10);
        renderSteps();
        updateScoreboard();
        updateEntities();
        updateButtons();
        showPunchline();
      });
    });
  }

  function updateScoreboard() {
    const steps = getSteps();
    let oc = { mints: 0, burns: 0 };
    let lg = { mints: 0, burns: 0 };
    const amount = currentMode === 'mint' ? 742500 : 300000;

    if (currentStep >= 0 && currentStep < steps.length) {
      oc = steps[currentStep].onchain;
      lg = steps[currentStep].ledger;
    }

    const fmtMoney = (n) => '$' + n.toLocaleString();
    document.getElementById('score-onchain-mints').textContent = oc.mints > 0 ? `${oc.mints} (${fmtMoney(oc.mints * amount)})` : '0';
    document.getElementById('score-onchain-burns').textContent = oc.burns > 0 ? `${oc.burns} (${fmtMoney(oc.burns * amount)})` : '0';
    const onchainNet = (oc.mints - oc.burns) * amount;
    document.getElementById('score-onchain-net').textContent = onchainNet === 0 ? '$0' : (onchainNet > 0 ? '+' : '') + fmtMoney(onchainNet);

    document.getElementById('score-ledger-mints').textContent = lg.mints > 0 ? `${lg.mints} (${fmtMoney(lg.mints * amount)})` : '0';
    document.getElementById('score-ledger-burns').textContent = lg.burns > 0 ? `${lg.burns} (${fmtMoney(lg.burns * amount)})` : '0';
    const ledgerNet = (lg.mints - lg.burns) * amount;
    document.getElementById('score-ledger-net').textContent = ledgerNet === 0 ? '$0' : (ledgerNet > 0 ? '+' : '-') + fmtMoney(Math.abs(ledgerNet));
  }

  function updateEntities() {
    // Reset nodes
    document.querySelectorAll('.sim-node').forEach(e => {
      e.classList.remove('active', 'pulse');
    });
    document.getElementById('bal-collateral').textContent = '';
    document.getElementById('bal-m').textContent = '';
    document.getElementById('bal-musd-eth').textContent = '';
    document.getElementById('bal-musd-dest').textContent = '';

    // Reset edges
    document.querySelectorAll('.sim-edge').forEach(e => {
      e.classList.remove('active', 'reverse');
    });

    if (currentStep < 0) return;

    const steps = getSteps();
    const step = steps[currentStep];

    // Highlight active nodes
    step.entities.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('active', 'pulse');
      }
    });

    // Highlight active edges (positive = forward, negative = reverse)
    (step.edges || []).forEach(e => {
      const edgeId = 'edge-' + Math.abs(e);
      const edgeEl = document.getElementById(edgeId);
      if (edgeEl) {
        edgeEl.classList.add('active');
        if (e < 0) edgeEl.classList.add('reverse');
      }
    });

    // Update balances
    const b = step.balances;
    if (b.collateral) document.getElementById('bal-collateral').textContent = b.collateral;
    if (b.m) document.getElementById('bal-m').textContent = b.m;
    if (b['musd-eth']) document.getElementById('bal-musd-eth').textContent = b['musd-eth'];
    if (b['musd-dest']) document.getElementById('bal-musd-dest').textContent = b['musd-dest'];
  }

  function updateButtons() {
    const steps = getSteps();
    prevBtn.disabled = currentStep <= -1;
    nextBtn.disabled = currentStep >= steps.length - 1;
    nextBtn.textContent = currentStep === -1 ? 'Start' : currentStep >= steps.length - 1 ? 'Done' : 'Next Step';
    progressLabel.textContent = currentStep === -1
      ? `Ready \u2014 ${steps.length} steps`
      : `Step ${currentStep + 1} / ${steps.length}`;
  }

  function showPunchline() {
    const steps = getSteps();
    if (currentStep < steps.length - 1) {
      punchline.style.display = 'none';
      return;
    }
    punchline.style.display = '';
    const titleEl = document.getElementById('punchline-title');
    const textEl = document.getElementById('punchline-text');

    if (currentMode === 'mint') {
      titleEl.textContent = '3 onchain mints + 1 burn, but ledger shows 1 mint';
      textEl.textContent = 'A single $742.5K mUSD mint to Linea generated 3 separate onchain mint events '
        + '(M mint, mUSD swap, Linea bridge) and 1 burn (ETH bridge), totaling $2.97M gross mints and $742.5K gross burns. '
        + 'The ledger just says: "+$742,500 mUSD". Multiply this by dozens of daily mints across 3 chains and you get '
        + 'the $19M+ gross figures in the reconciliation data.';
    } else {
      titleEl.textContent = '1 onchain mint + 3 burns, but ledger shows 1 burn';
      textEl.textContent = 'A single $300K mUSD burn from BSC generated 3 separate onchain burn events '
        + '(BSC bridge, mUSD unwrap, M burn) and 1 mint (ETH bridge), totaling $900K gross burns and $300K gross mints. '
        + 'The ledger just says: "-$300,000 mUSD".';
    }
  }

  function updateDestLabel() {
    const label = document.getElementById('dest-chain-label');
    const graphLabel = document.getElementById('graph-dest-label');
    if (currentMode === 'mint') {
      label.textContent = 'mUSD (Linea)';
      if (graphLabel) graphLabel.textContent = 'Linea';
    } else {
      label.textContent = 'mUSD (BSC)';
      if (graphLabel) graphLabel.textContent = 'BSC';
    }
  }

  function reset() {
    currentStep = -1;
    punchline.style.display = 'none';
    updateDestLabel();
    renderSteps();
    updateScoreboard();
    updateEntities();
    updateButtons();
  }

  // Mode toggle
  document.querySelectorAll('.sim-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sim-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      reset();
    });
  });

  nextBtn.addEventListener('click', () => {
    const steps = getSteps();
    if (currentStep < steps.length - 1) {
      currentStep++;
      renderSteps();
      updateScoreboard();
      updateEntities();
      updateButtons();
      showPunchline();

      // Scroll current step into view
      const currentCard = stepsContainer.querySelector('.sim-step-card.current');
      if (currentCard) currentCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > -1) {
      currentStep--;
      renderSteps();
      updateScoreboard();
      updateEntities();
      updateButtons();
      showPunchline();
    }
  });

  resetBtn.addEventListener('click', reset);

  // Initialize
  reset();
});
