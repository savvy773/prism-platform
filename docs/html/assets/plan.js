(() => {
  'use strict';
  const root = window.PRISM_PLAN;
  if (!root) return;
  const byId = new Map();
  const parents = new Map();
  const collect = (node, parent) => {
    byId.set(node.id, node);
    if (parent) parents.set(node.id, parent.id);
    node.children.forEach(child => collect(child, node));
  };
  collect(root);
  const $ = id => document.getElementById(id);
  const expanded = new Set([root.id]);
  let activeRoot = root.id;
  let selected = root.id;
  let zoom = 1;
  let layoutWidth = 0;
  let layoutHeight = 0;
  const W = 200, H = 104, GAP = 24, ROW = 154, PAD = 30;
  const viewport = $('tree-viewport');
  const stage = $('tree-stage');
  const nodesLayer = $('tree-nodes');
  const svg = $('tree-connectors');
  const stateNames = { structure: '구성·문서 폴더', ready: '사용 가능한 파일', planned: '구현 예정 · 현재 파일 없음' };

  function element(tag, className, content) {
    const result = document.createElement(tag);
    if (className) result.className = className;
    if (content !== undefined) result.textContent = content;
    return result;
  }
  function children(node) { return expanded.has(node.id) ? node.children : []; }
  function measure(node, widths) {
    const visible = children(node);
    const width = visible.length ? Math.max(W, visible.reduce((total, child) => total + measure(child, widths), 0) + GAP * (visible.length - 1)) : W;
    widths.set(node.id, width);
    return width;
  }
  function updateScale(center = false) {
    const width = Math.max(viewport.clientWidth, layoutWidth * zoom);
    const offset = Math.max(0, (width - layoutWidth * zoom) / 2);
    stage.style.width = `${width}px`;
    stage.style.height = `${layoutHeight * zoom}px`;
    const transform = `translateX(${offset}px) scale(${zoom})`;
    nodesLayer.style.transform = transform;
    svg.style.transform = transform;
    $('zoom-value').textContent = `${Math.round(zoom * 100)}%`;
    $('zoom-out').disabled = zoom <= .35;
    $('zoom-in').disabled = zoom >= 1.5;
    if (center) {
      viewport.scrollLeft = Math.max(0, (width - viewport.clientWidth) / 2);
      viewport.scrollTop = 0;
    }
  }
  function fit() {
    zoom = Math.max(.85, Math.min(1.0, (viewport.clientWidth - 20) / layoutWidth));
    updateScale(true);
  }
  function select(id) {
    selected = id;
    const node = byId.get(id);
    nodesLayer.querySelectorAll('.tree-card').forEach(card => {
      const isSelected = card.dataset.id === id;
      card.classList.toggle('is-selected', isSelected);
      card.querySelector('.node-select').setAttribute('aria-pressed', String(isSelected));
    });
    $('detail-path').textContent = node.path || 'REPOSITORY ROOT';
    $('detail-title').textContent = `${node.name} — ${node.label}`;
    $('detail-description').textContent = node.description;
    $('detail-status').textContent = `${node.optional ? '선택 사항 / ' : ''}${stateNames[node.state]}`;
    $('detail-status').className = `badge ${node.optional ? 'optional' : node.state === 'planned' ? 'planned' : ''}`;
    $('detail-notes').replaceChildren(...node.notes.map(note => element('li', '', note)));
    $('focus-node').hidden = !node.children.length || id === activeRoot;
  }
  function breadcrumbs() {
    const lineage = [];
    let id = activeRoot;
    while (id !== undefined) { lineage.unshift(byId.get(id)); id = parents.get(id); }
    $('breadcrumbs').replaceChildren();
    lineage.forEach((node, index) => {
      if (index) $('breadcrumbs').append(element('span', 'separator', '/'));
      const button = element('button', '', node.name.replace(/\/$/, ''));
      button.type = 'button';
      if (node.id === activeRoot) button.setAttribute('aria-current', 'location');
      button.addEventListener('click', () => focus(node.id));
      $('breadcrumbs').append(button);
    });
  }
  function render(autoFit = true) {
    const base = byId.get(activeRoot);
    const widths = new Map();
    layoutWidth = measure(base, widths) + PAD * 2;
    const positions = [];
    const edges = [];
    function place(node, left, depth, parentPosition) {
      const pos = { node, x: left + (widths.get(node.id) - W) / 2, y: PAD + depth * ROW };
      positions.push(pos);
      if (parentPosition) edges.push([parentPosition, pos]);
      let childLeft = left;
      children(node).forEach(child => { place(child, childLeft, depth + 1, pos); childLeft += widths.get(child.id) + GAP; });
    }
    place(base, PAD, 0);
    layoutHeight = Math.max(...positions.map(pos => pos.y + H)) + PAD;
    svg.setAttribute('width', layoutWidth);
    svg.setAttribute('height', layoutHeight);
    svg.replaceChildren();
    edges.forEach(([a, b]) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const ax = a.x + W / 2, ay = a.y + H, bx = b.x + W / 2, by = b.y;
      const middle = ay + (by - ay) / 2;
      line.setAttribute('d', `M ${ax} ${ay} V ${middle} H ${bx} V ${by}`);
      line.setAttribute('class', 'connector');
      svg.append(line);
    });
    nodesLayer.replaceChildren();
    nodesLayer.style.width = `${layoutWidth}px`;
    nodesLayer.style.height = `${layoutHeight}px`;
    positions.forEach(({ node, x, y }) => {
      const card = element('div', `tree-card ${node.id === activeRoot ? 'is-root' : ''} ${node.state === 'planned' ? 'is-planned' : ''} ${node.optional ? 'is-optional' : ''}`);
      card.dataset.id = node.id;
      card.style.left = `${x}px`; card.style.top = `${y}px`;
      const button = element('button', 'node-select');
      button.type = 'button';
      button.setAttribute('aria-label', `${node.path || node.name}: ${node.label}${node.state === 'planned' ? ' (구현 예정)' : ''}`);
      const type = node.id === 'root' ? 'REPOSITORY' : node.state === 'planned' ? 'PLANNED' : node.kind === 'file' ? 'FILE' : 'DIRECTORY';
      button.append(element('span', 'node-type', type), element('span', 'node-name', node.name), element('span', 'node-label', node.label));
      button.addEventListener('click', () => select(node.id));
      card.append(button);
      if (node.children.length) {
        const toggle = element('button', 'node-toggle', expanded.has(node.id) ? '−' : '+');
        toggle.type = 'button';
        toggle.setAttribute('aria-label', `${node.name} ${expanded.has(node.id) ? '접기' : '펼치기'}`);
        toggle.setAttribute('aria-expanded', String(expanded.has(node.id)));
        toggle.addEventListener('click', () => {
          if (expanded.has(node.id)) expanded.delete(node.id); else expanded.add(node.id);
          selected = node.id;
          render();
          const newToggle = Array.from(nodesLayer.querySelectorAll('.tree-card')).find(el => el.dataset.id === node.id)?.querySelector('.node-toggle');
          newToggle?.focus({ preventScroll: true });
        });
        card.append(toggle);
      }
      nodesLayer.append(card);
    });
    breadcrumbs();
    $('node-count').textContent = `${positions.length}개 항목 표시 / 펼치기로 상세 탐색`;
    select(selected);
    if (autoFit) fit(); else updateScale();
  }
  function focus(id) {
    activeRoot = id; selected = id; expanded.add(id); render();
  }
  $('focus-node').addEventListener('click', () => focus(selected));
  $('fit-tree').addEventListener('click', fit);
  $('zoom-in').addEventListener('click', () => { zoom = Math.min(1.5, zoom + .1); updateScale(); });
  $('zoom-out').addEventListener('click', () => { zoom = Math.max(.35, zoom - .1); updateScale(); });
  $('reset-tree').addEventListener('click', () => { expanded.clear(); activeRoot = root.id; selected = root.id; expanded.add(root.id); render(); });
  $('expand-all').addEventListener('click', () => {
    const expand = node => { expanded.add(node.id); node.children.forEach(expand); };
    expand(byId.get(activeRoot)); render();
  });

  let drag;
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button')) return;
    drag = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    viewport.setPointerCapture(event.pointerId); viewport.classList.add('dragging');
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag) return;
    viewport.scrollLeft = drag.left - event.clientX + drag.x;
    viewport.scrollTop = drag.top - event.clientY + drag.y;
  });
  const stopDrag = () => { drag = null; viewport.classList.remove('dragging'); };
  viewport.addEventListener('pointerup', stopDrag);
  viewport.addEventListener('pointercancel', stopDrag);
  viewport.addEventListener('lostpointercapture', stopDrag);

  const tabs = Array.from(document.querySelectorAll('[data-tab]'));
  function setTab(tab, moveFocus = false) {
    tabs.forEach(button => {
      const active = button === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      $(`panel-${button.dataset.tab}`).hidden = !active;
    });
    if (moveFocus) tab.focus();
    if (tab.dataset.tab === 'folders') requestAnimationFrame(fit);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault(); setTab(tabs[next], true);
    });
  });
  document.querySelectorAll('[data-environment]').forEach(button => {
    button.addEventListener('click', () => {
      const production = button.dataset.environment === 'production';
      const prefix = production ? 'prism-prod' : 'prism-dev';
      document.querySelectorAll('[data-environment]').forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active));
      });
      $('apps-project').textContent = `${prefix}-apps`;
      $('maria-project').textContent = `${prefix}-mariadb`;
      $('postgres-project').textContent = `${prefix}-postgres`;
      $('maria-network').textContent = `${prefix}-mariadb-data`;
      $('browser-target').textContent = production ? 'Ubuntu su · 서버 주소로 접속 · 예정' : '포털 prismjuns:3000 · ERP prismjuns:8080';
    });
  });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (!$('panel-folders').hidden) fit(); }, 100);
  });
  render();
})();
