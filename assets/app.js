/* Metodologia della ricerca educativa: grafo e note collegate */
(function () {
  'use strict';

  var DATA = window.CORSO;
  var NOTES = DATA.notes;
  var TITLES = DATA.titles;
  var BY = {};
  NOTES.forEach(function (n) { BY[n.id] = n; n.back = []; });
  NOTES.forEach(function (n) { n.l.forEach(function (t) { if (BY[t]) BY[t].back.push(n.id); }); });
  NOTES.forEach(function (n) {
    var s = {}; n.l.forEach(function (x) { s[x] = 1; }); n.back.forEach(function (x) { s[x] = 1; });
    n.nb = Object.keys(s); n.deg = n.nb.length;
  });

  var UNIT_NAMES = {
    1: 'Fare ricerca in campo educativo', 2: 'Concetti, misura e disegno', 3: 'Strumenti di rilevazione',
    4: 'Raccolta dei dati', 5: 'Codifica e analisi', 6: 'Comunicazione dei risultati', 7: 'Misurare e valutare'
  };
  var UNIT_COLORS = { 0: '#9aa0aa', 1: '#7d86f2', 2: '#3fb99a', 3: '#ec9a52', 4: '#e0679d', 5: '#4fa6ea', 6: '#a985ec', 7: '#d9b630' };
  var TYPES = {
    indice: { label: 'Indici', one: 'Indice', color: '#9aa0aa' },
    unita: { label: 'Unità', one: 'Unità', color: '#d9b630' },
    lezione: { label: 'Lezioni', one: 'Lezione', color: '#7d86f2' },
    concetto: { label: 'Concetti', one: 'Concetto', color: '#3fb99a' },
    autore: { label: 'Autori', one: 'Autore', color: '#ec9a52' },
    risorsa: { label: 'Risorse', one: 'Risorsa', color: '#e0679d' },
    libro: { label: 'Libri', one: 'Libro', color: '#b8743a', deep: 1 },
    capitolo: { label: 'Capitoli', one: 'Capitolo', color: '#c99a5b', deep: 1 },
    sezione: { label: 'Paragrafi del manuale', one: 'Paragrafo del manuale', color: '#8c96a6', deep: 1 },
    slide: { label: 'Slide', one: 'Slide', color: '#36a7b8', deep: 1 }
  };
  var DEEP = { libro: 1, capitolo: 1, sezione: 1, slide: 1 };

  /* ---------- memoria locale (facoltativa) ---------- */
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var studied = load('mre-studied', {});

  /* ---------- utilità ---------- */
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function noteColor(n, mode) { return mode === 'tipo' ? TYPES[n.k].color : UNIT_COLORS[n.u[0]] || UNIT_COLORS[0]; }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function lessonKey(n) { var m = n.t.match(/(\d+)\.(\d+)/); return m ? (+m[1]) * 100 + (+m[2]) : 9999; }
  function unitKey(n) { var m = n.t.match(/Unità (\d+)/); return m ? +m[1] : 99; }
  function radius(n) {
    var r = 3.2 + Math.sqrt(n.deg) * 1.35;
    if (n.k === 'unita') r += 3;
    if (n.k === 'indice') r += 2;
    if (n.k === 'sezione' || n.k === 'capitolo') r = Math.max(2.6, r * 0.6);
    if (n.k === 'libro') r += 2;
    return Math.min(r, 17);
  }

  /* ---------- motore del grafo (canvas + d3-force) ---------- */
  function GraphView(canvas, opt) {
    this.c = canvas; this.ctx = canvas.getContext('2d'); this.opt = opt;
    this.t = d3.zoomIdentity; this.nodes = []; this.links = []; this.hover = null; this.pos = {};
    this.w = 0; this.h = 0;
    var self = this;
    this.zoom = d3.zoom().clickDistance(6).scaleExtent([0.15, 6]).on('zoom', function (ev) { self.t = ev.transform; self.draw(); });
    var moved = false, sx = 0, sy = 0;
    var drag = d3.drag().clickDistance(6)
      .subject(function (ev) {
        var p = self.t.invert([ev.x, ev.y]);
        var n = self.find(p[0], p[1]);
        return n ? n : null;
      })
      .on('start', function (ev) {
        moved = false; sx = ev.x; sy = ev.y; canvas.classList.add('dragging');
        if (!ev.active && self.sim) self.sim.alphaTarget(0.25).restart();
        ev.subject.fx = ev.subject.x; ev.subject.fy = ev.subject.y;
      })
      .on('drag', function (ev) {
        if (Math.abs(ev.x - sx) + Math.abs(ev.y - sy) > 4) moved = true;
        var p = self.t.invert([ev.x, ev.y]);
        ev.subject.fx = p[0]; ev.subject.fy = p[1];
      })
      .on('end', function (ev) {
        canvas.classList.remove('dragging');
        if (!ev.active && self.sim) self.sim.alphaTarget(0);
        if (!ev.subject.pinned) { ev.subject.fx = null; ev.subject.fy = null; }
      });
    d3.select(canvas).call(drag).call(this.zoom).on('dblclick.zoom', null);
    canvas.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      var p = self.t.invert([e.clientX - r.left, e.clientY - r.top]);
      var n = self.find(p[0], p[1]);
      if (n !== self.hover) { self.hover = n; canvas.style.cursor = n ? 'pointer' : ''; self.draw(); }
      if (self.opt.onHover) self.opt.onHover(n, e.clientX - r.left, e.clientY - r.top);
    });
    // apertura della nota: clic singolo o doppio clic su un punto
    var lastOpen = 0;
    function openAt(e) {
      if (!self.opt.onClick) return;
      var r = canvas.getBoundingClientRect();
      var p = self.t.invert([e.clientX - r.left, e.clientY - r.top]);
      var n = self.find(p[0], p[1], 8) || self.hover;
      if (!n) return;
      var now = Date.now();
      if (now - lastOpen < 600) return;
      lastOpen = now;
      self.opt.onClick(n.n);
    }
    canvas.addEventListener('click', openAt);
    canvas.addEventListener('dblclick', function (e) { e.preventDefault(); openAt(e); });
    canvas.addEventListener('pointerleave', function () {
      self.hover = null; self.draw(); if (self.opt.onHover) self.opt.onHover(null);
    });
  }
  GraphView.prototype.resize = function () {
    var r = this.c.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    var dpr = window.devicePixelRatio || 1;
    var first = !this.w;
    this.w = r.width; this.h = r.height;
    this.c.width = r.width * dpr; this.c.height = r.height * dpr;
    this.dpr = dpr;
    if (first) { this.center(1); }
    this.draw();
    return true;
  };
  GraphView.prototype.center = function (k) {
    d3.select(this.c).call(this.zoom.transform, d3.zoomIdentity.translate(this.w / 2, this.h / 2).scale(k || 1));
  };
  GraphView.prototype.fit = function (pad) {
    if (!this.nodes.length || !this.w) return;
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    this.nodes.forEach(function (n) { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); });
    pad = pad || 40;
    var pr = this.opt.padRight ? this.opt.padRight() : 0;
    var k = Math.min((this.w - pr - pad * 2) / Math.max(1, x1 - x0), (this.h - pad * 2) / Math.max(1, y1 - y0));
    k = Math.max(0.2, Math.min(k, this.opt.maxFit || 1.6));
    var t = d3.zoomIdentity.translate((this.w - pr) / 2, this.h / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    d3.select(this.c).transition().duration(500).call(this.zoom.transform, t);
  };
  GraphView.prototype.setData = function (notes, center) {
    var self = this, ids = {};
    notes.forEach(function (n) { ids[n.id] = 1; });
    this.nodes = notes.map(function (n) {
      var old = self.pos[n.id];
      var o = { id: n.id, n: n, r: radius(n), x: old ? old.x : (Math.random() - 0.5) * 400, y: old ? old.y : (Math.random() - 0.5) * 400 };
      if (center && n.id === center) { o.fx = 0; o.fy = 0; o.pinned = true; o.x = 0; o.y = 0; }
      return o;
    });
    var nodeBy = {};
    this.nodes.forEach(function (o) { nodeBy[o.id] = o; });
    this.nodeBy = nodeBy;
    var seen = {};
    this.links = [];
    notes.forEach(function (n) {
      n.l.forEach(function (t) {
        if (!ids[t]) return;
        var key = n.id < t ? n.id + '|' + t : t + '|' + n.id;
        if (seen[key]) return; seen[key] = 1;
        self.links.push({ source: n.id, target: t });
      });
    });
    if (this.sim) this.sim.stop();
    var o = this.opt;
    this.sim = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id(function (d) { return d.id; }).distance(o.dist || 46).strength(o.linkStrength || 0.35))
      .force('charge', d3.forceManyBody().strength(o.charge || -90).distanceMax(o.distMax || 420))
      .force('collide', d3.forceCollide(function (d) { return d.r + 3; }))
      .force('x', d3.forceX(0).strength(o.gravity || 0.045))
      .force('y', d3.forceY(0).strength(o.gravity || 0.045))
      .alphaDecay(0.03)
      .on('tick', function () {
        if (self.fitPending && self.sim.alpha() < 0.12) { self.fitPending = false; self.fit(self.opt.fitPad || 30); }
        self.draw();
      })
      .on('end', function () { self.nodes.forEach(function (n) { self.pos[n.id] = { x: n.x, y: n.y }; }); if (self.opt.onSettle) self.opt.onSettle(); });
    this.adj = {};
    this.links.forEach(function (l) {
      var a = typeof l.source === 'object' ? l.source.id : l.source, b = typeof l.target === 'object' ? l.target.id : l.target;
      (self.adj[a] = self.adj[a] || {})[b] = 1; (self.adj[b] = self.adj[b] || {})[a] = 1;
    });
  };
  GraphView.prototype.find = function (x, y, extra) {
    var best = null, bd = Infinity, k = this.t.k, ex = extra || 4;
    for (var i = 0; i < this.nodes.length; i++) {
      var n = this.nodes[i], dx = n.x - x, dy = n.y - y, d = dx * dx + dy * dy, rr = n.r + ex / k;
      if (d < rr * rr && d < bd) { bd = d; best = n; }
    }
    return best;
  };
  GraphView.prototype.draw = function () {
    if (!this.w) return;
    var ctx = this.ctx, t = this.t, o = this.opt, self = this;
    var edge = cssVar('--edge'), edgeHi = cssVar('--edge-hi'), label = cssVar('--label'), bg = cssVar('--bg'), ok = cssVar('--ok');
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.translate(t.x, t.y); ctx.scale(t.k, t.k);
    var focus = this.hover || (o.highlight && this.nodeBy && this.nodeBy[o.highlight]) || null;
    var nb = focus ? (this.adj[focus.id] || {}) : null;
    var match = o.match || null;
    // archi
    ctx.lineWidth = Math.max(0.6, 1 / t.k);
    ctx.strokeStyle = edge; ctx.beginPath();
    this.links.forEach(function (l) {
      if (focus && (l.source === focus || l.target === focus)) return;
      ctx.moveTo(l.source.x, l.source.y); ctx.lineTo(l.target.x, l.target.y);
    });
    ctx.globalAlpha = focus ? 0.35 : 1; ctx.stroke(); ctx.globalAlpha = 1;
    if (focus) {
      ctx.strokeStyle = edgeHi; ctx.lineWidth = Math.max(1.2, 1.6 / t.k); ctx.beginPath();
      this.links.forEach(function (l) {
        if (l.source === focus || l.target === focus) { ctx.moveTo(l.source.x, l.source.y); ctx.lineTo(l.target.x, l.target.y); }
      });
      ctx.stroke();
    }
    // nodi
    this.nodes.forEach(function (n) {
      var dim = (focus && n !== focus && !nb[n.id]) || (match && !match[n.id]);
      ctx.globalAlpha = dim ? 0.18 : 1;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 2 * Math.PI);
      ctx.fillStyle = noteColor(n.n, o.colorMode ? o.colorMode() : 'unita'); ctx.fill();
      if (n.pinned || n === focus) { ctx.lineWidth = 2.5 / t.k; ctx.strokeStyle = label; ctx.stroke(); }
      if (o.showStudied && o.showStudied() && studied[n.id]) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 3 / t.k + 1, 0, 2 * Math.PI);
        ctx.lineWidth = 2 / t.k; ctx.strokeStyle = ok; ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
    // etichette (dimensione costante sullo schermo)
    var fs = 12 / t.k;
    ctx.font = '500 ' + fs + 'px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    var all = o.allLabels && o.allLabels();
    var zoomFade = Math.max(0, Math.min(1, (t.k - (o.labelZoom || 1.15)) / 0.5));
    this.nodes.forEach(function (n) {
      var show, alpha = 1;
      if (focus) { show = n === focus || nb[n.id]; if (!show) return; }
      else if (match) { show = match[n.id]; if (!show) return; }
      else if (all || o.alwaysLabels || n.pinned) show = true;
      else if (n.r >= (o.bigR || 10)) show = true;
      else { show = zoomFade > 0; alpha = zoomFade; }
      if (!show) return;
      var full = n === focus || (focus && nb[n.id]) || t.k >= 1.6;
      var txt = n.n.t;
      if (!full && n.n.k === 'unita') txt = txt.split('.')[0];
      else if (!full && n.n.k === 'lezione') txt = txt.match(/^Lezione [\d.]+/)[0];
      var max = o.maxLabel || 42;
      if (txt.length > max) txt = txt.slice(0, max - 2) + '…';
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 3 / t.k; ctx.strokeStyle = bg; ctx.lineJoin = 'round';
      ctx.strokeText(txt, n.x, n.y + n.r + 3 / t.k);
      ctx.fillStyle = label; ctx.fillText(txt, n.x, n.y + n.r + 3 / t.k);
    });
    ctx.globalAlpha = 1;
  };
  GraphView.prototype.stop = function () { if (this.sim) this.sim.stop(); };

  /* ---------- grafo globale ---------- */
  var gState = load('mre-graph', { mode: 'unita', tipi: { indice: 1, unita: 1, lezione: 1, concetto: 1, autore: 1, risorsa: 1 }, unita: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 }, labels: 0, studied: 0 });
  Object.keys(DEEP).forEach(function (k) { if (gState.tipi[k] === undefined) gState.tipi[k] = 0; });
  var tip = $('#graph-tip');
  var global = new GraphView($('#graph-canvas'), {
    dist: 42, charge: -95, gravity: 0.05, maxFit: 1.1,
    padRight: function () { var p = $('#graph-panel'); return (window.innerWidth > 860 && !p.classList.contains('collapsed')) ? p.offsetWidth + 20 : 0; },
    colorMode: function () { return gState.mode; },
    allLabels: function () { return gState.labels; },
    showStudied: function () { return gState.studied; },
    onClick: function (n) { location.hash = '#/n/' + n.id; },
    onHover: function (n, x, y) {
      if (!n) { tip.hidden = true; return; }
      tip.innerHTML = '<span class="k">' + esc(TYPES[n.n.k].one) + (n.n.u[0] ? ' · Unità ' + n.n.u.join(', ') : '') + ' · ' + n.n.deg + ' collegamenti</span>' + esc(n.n.t);
      tip.hidden = false;
      var w = tip.offsetWidth, W = global.w;
      tip.style.left = Math.min(x + 14, W - w - 8) + 'px'; tip.style.top = (y + 14) + 'px';
    }
  });
  var globalBuilt = false;
  function visibleNotes() {
    return NOTES.filter(function (n) {
      if (!gState.tipi[n.k]) return false;
      return n.u.some(function (u) { return gState.unita[u]; });
    });
  }
  function rebuildGlobal(fit) {
    global.setData(visibleNotes());
    globalBuilt = true;
    if (fit) global.fitPending = true;
  }
  function buildPanel() {
    var deepOn = Object.keys(DEEP).some(function (k) { return gState.tipi[k]; });
    document.querySelectorAll('#depth-mode button').forEach(function (b) { b.classList.toggle('on', (b.dataset.deep === '1') === deepOn); });
    var ft = $('#filters-tipo'); ft.innerHTML = '';
    Object.keys(TYPES).forEach(function (k) {
      var b = document.createElement('span');
      b.className = 'chip' + (gState.tipi[k] ? '' : ' off');
      b.innerHTML = '<i class="dot" style="background:' + TYPES[k].color + '"></i>' + TYPES[k].label;
      b.onclick = function () { gState.tipi[k] = gState.tipi[k] ? 0 : 1; save('mre-graph', gState); buildPanel(); rebuildGlobal(true); };
      ft.appendChild(b);
    });
    var fu = $('#filters-unita'); fu.innerHTML = '';
    for (var u = 1; u <= 7; u++) (function (u) {
      var b = document.createElement('span');
      b.className = 'chip' + (gState.unita[u] ? '' : ' off');
      b.title = UNIT_NAMES[u];
      b.innerHTML = '<i class="dot" style="background:' + UNIT_COLORS[u] + '"></i>' + u;
      b.onclick = function () { gState.unita[u] = gState.unita[u] ? 0 : 1; save('mre-graph', gState); buildPanel(); rebuildGlobal(true); };
      fu.appendChild(b);
    })(u);
    var lg = $('#legend'); lg.innerHTML = '';
    if (gState.mode === 'tipo') {
      Object.keys(TYPES).forEach(function (k) { lg.innerHTML += '<span><i style="background:' + TYPES[k].color + '"></i>' + TYPES[k].label + '</span>'; });
    } else {
      for (var i = 1; i <= 7; i++) lg.innerHTML += '<span><i style="background:' + UNIT_COLORS[i] + '"></i>' + i + '. ' + UNIT_NAMES[i] + '</span>';
      lg.innerHTML += '<span><i style="background:' + UNIT_COLORS[0] + '"></i>Indici generali</span>';
    }
    lg.innerHTML += '<span style="margin-top:4px;color:var(--text-3)">Nodi più grandi = più collegati</span>';
    document.querySelectorAll('#depth-mode button').forEach(function (b) {
    b.onclick = function () {
      var on = b.dataset.deep === '1' ? 1 : 0;
      Object.keys(DEEP).forEach(function (k) { gState.tipi[k] = on; });
      save('mre-graph', gState); buildPanel(); rebuildGlobal(true);
    };
  });
  document.querySelectorAll('#color-mode button').forEach(function (b) { b.classList.toggle('on', b.dataset.mode === gState.mode); });
    $('#opt-labels').checked = !!gState.labels;
    $('#opt-studied').checked = !!gState.studied;
  }
  document.querySelectorAll('#depth-mode button').forEach(function (b) {
    b.onclick = function () {
      var on = b.dataset.deep === '1' ? 1 : 0;
      Object.keys(DEEP).forEach(function (k) { gState.tipi[k] = on; });
      save('mre-graph', gState); buildPanel(); rebuildGlobal(true);
    };
  });
  document.querySelectorAll('#color-mode button').forEach(function (b) {
    b.onclick = function () { gState.mode = b.dataset.mode; save('mre-graph', gState); buildPanel(); global.draw(); };
  });
  $('#opt-labels').onchange = function (e) { gState.labels = e.target.checked ? 1 : 0; save('mre-graph', gState); global.draw(); };
  $('#opt-studied').onchange = function (e) { gState.studied = e.target.checked ? 1 : 0; save('mre-graph', gState); global.draw(); };
  $('#gp-toggle').onclick = function () {
    var p = $('#graph-panel'); var c = p.classList.toggle('collapsed');
    this.textContent = c ? 'mostra' : 'nascondi'; this.setAttribute('aria-expanded', String(!c));
  };
  if (window.innerWidth < 860) { $('#graph-panel').classList.add('collapsed'); $('#gp-toggle').textContent = 'mostra'; }
  if (load('mre-hint', 0)) $('#graph-hint').hidden = true;
  $('#hint-close').onclick = function () { $('#graph-hint').hidden = true; save('mre-hint', 1); };

  /* ---------- grafo locale ---------- */
  var depth = 1;
  var local = new GraphView($('#local-canvas'), {
    dist: 62, charge: -260, gravity: 0.06, labelZoom: 1.5, bigR: 99, maxFit: 1.6, maxLabel: 26, fitPad: 22,
    colorMode: function () { return 'unita'; },
    allLabels: function () { return false; },
    showStudied: function () { return false; },
    onClick: function (n) { setLocalExpanded(false); location.hash = '#/n/' + n.id; },
    onHover: function (n, x, y) {
      var lt = $('#local-tip');
      if (!n) { lt.hidden = true; return; }
      lt.innerHTML = '<span class="k">' + esc(TYPES[n.n.k].one) + (n.n.u[0] ? ' · Unità ' + n.n.u.join(', ') : '') + '</span>' + esc(n.n.t);
      lt.hidden = false;
      var w = lt.offsetWidth, W = local.w;
      lt.style.left = Math.max(4, Math.min(x + 12, W - w - 4)) + 'px';
      lt.style.top = (y + 14 + lt.offsetHeight > local.h ? y - lt.offsetHeight - 8 : y + 14) + 'px';
    }
  });
  function setLocalExpanded(on) {
    var card = $('#local-card');
    if (card.classList.contains('expanded') === on) return;
    card.classList.toggle('expanded', on);
    $('#local-scrim').hidden = !on;
    document.body.classList.toggle('local-open', on);
    local.opt.maxLabel = on ? 60 : 26;
    local.opt.maxFit = on ? 3 : 1.6;
    local.opt.labelZoom = on ? 0.6 : 1.5;
    setTimeout(function () { local.resize(); local.fit(30); }, 30);
  }
  $('#local-expand').onclick = function () { setLocalExpanded(!$('#local-card').classList.contains('expanded')); };
  $('#local-scrim').onclick = function () { setLocalExpanded(false); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setLocalExpanded(false); });
  function buildLocal(id) {
    var keep = {}; keep[id] = 1;
    var frontier = [id];
    for (var d = 0; d < depth; d++) {
      var next = [];
      frontier.forEach(function (x) { BY[x].nb.forEach(function (y) { if (!keep[y]) { keep[y] = 1; next.push(y); } }); });
      frontier = next;
    }
    var list = Object.keys(keep).map(function (k) { return BY[k]; });
    local.opt.alwaysLabels = list.length <= 12;
    local.opt.highlight = null;
    local.pos = {};
    local.setData(list, id);
    local.fitPending = true;
    if (!local.resize()) setTimeout(function () { local.resize(); }, 50);
    local.center(1);
  }
  document.querySelectorAll('#depth button').forEach(function (b) {
    b.onclick = function () {
      depth = +b.dataset.d;
      document.querySelectorAll('#depth button').forEach(function (x) { x.classList.toggle('on', x === b); });
      if (current) buildLocal(current);
    };
  });

  /* ---------- markdown e quiz ---------- */
  var LINK = /\[\[([^\]|\\]+)(?:\\?\|([^\]]+))?\]\]/g;
  marked.use({ gfm: true, breaks: false });
  function parseQuiz(src) {
    var q = { d: '', o: [], s: '' };
    src.split('\n').forEach(function (line) {
      line = line.trim();
      if (/^D:/.test(line)) q.d = line.slice(2).trim();
      else if (/^S:/.test(line)) q.s = line.slice(2).trim();
      else if (/^[+-] /.test(line)) q.o.push({ t: line.slice(2).trim(), ok: line[0] === '+' });
    });
    return q;
  }
  function renderMd(src) {
    var quizzes = [];
    src = src.replace(/```quiz\n([\s\S]*?)```/g, function (m, body) {
      quizzes.push(parseQuiz(body));
      return '\n<div class="quiz-slot" data-i="' + (quizzes.length - 1) + '"></div>\n';
    });
    src = src.replace(LINK, function (m, target, lab) {
      var id = TITLES[target.trim().toLowerCase()];
      var txt = (lab || target).trim();
      return id ? '<a class="wl" href="#/n/' + id + '">' + esc(txt) + '</a>' : '<span class="wl-broken" title="Nota non trovata">' + esc(txt) + '</span>';
    });
    var div = document.createElement('div');
    div.className = 'note-body';
    div.innerHTML = marked.parse(src);
    div.querySelectorAll('a[href^="http"]').forEach(function (a) { a.target = '_blank'; a.rel = 'noopener'; });
    div.querySelectorAll('.pdfview').forEach(function (pv) {
      var src = pv.dataset.src;
      pv.innerHTML = '<iframe title="Slide" src="' + src + '#page=1&view=FitH" loading="lazy"></iframe>';
    });
    var pv = div.querySelector('.pdfview');
    div.querySelectorAll('a[href*=".pdf"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (pv && href.split('#')[0] === pv.dataset.src && href.indexOf('#page=') > 0) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          setPdfPage(pv, +href.split('#page=')[1]);
        });
      } else { a.target = '_blank'; a.rel = 'noopener'; }
    });
    div.querySelectorAll('.quiz-slot').forEach(function (slot) { slot.replaceWith(buildQuiz(quizzes[+slot.dataset.i])); });
    return div;
  }
  function setPdfPage(pv, p) {
    var f = pv.querySelector('iframe');
    var src = pv.dataset.src + '#page=' + p + '&view=FitH';
    var nf = document.createElement('iframe'); nf.title = 'Slide'; nf.src = src;
    f.replaceWith(nf);
    pv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function deepBox(n) {
    if (DEEP[n.k]) return null;
    var groups = { sezione: [], slide: [], capitolo: [], libro: [] };
    var esct = n.t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp('\\[\\[' + esct + '(\\]\\]|\\\\?\\|)');
    n.back.forEach(function (id) {
      var b = BY[id]; if (!DEEP[b.k]) return;
      var item = { n: b, extra: '', href: '#/n/' + b.id };
      if (b.k === 'slide') {
        var line = b.b.split('\n').filter(function (l) { return re.test(l); })[0] || '';
        var m = line.match(/slide ([\d, -]+) \(/), pg = line.match(/#page=(\d+)/);
        if (m) item.extra = 'slide ' + m[1].trim();
        if (pg) item.href = '#/n/' + b.id + '?p=' + pg[1];
      }
      (groups[b.k] || groups.libro).push(item);
    });
    var lab = { sezione: 'Nel manuale', slide: 'Nelle slide', capitolo: 'Nei capitoli dei libri', libro: 'Nei libri' };
    var html = '';
    ['sezione', 'slide', 'capitolo', 'libro'].forEach(function (k) {
      var g = groups[k]; if (!g.length) return;
      g.sort(function (a, b) { return a.n.t.localeCompare(b.n.t, 'it', { numeric: true }); });
      html += '<div class="deep-g"><div class="deep-h"><i class="dot" style="background:' + TYPES[k].color + '"></i>' + lab[k] + '</div><ul>' +
        g.map(function (it) { return '<li><a href="' + it.href + '">' + esc(it.n.t.replace(/^Manuale § /, '§ ')) + '</a>' + (it.extra ? ' <span class="k">' + esc(it.extra) + '</span>' : '') + '</li>'; }).join('') + '</ul></div>';
    });
    if (!html) return null;
    var box = document.createElement('section'); box.className = 'deep-box';
    box.innerHTML = '<h2>Per approfondire</h2><p class="deep-sub">Dove leggere di più su questo argomento: paragrafi del manuale, slide delle lezioni, classici.</p>' + html;
    return box;
  }
  function buildQuiz(q) {
    var nOk = q.o.filter(function (o) { return o.ok; }).length, multi = nOk > 1;
    var box = document.createElement('div');
    box.className = 'quiz' + (multi ? ' multi' : '');
    box.innerHTML = '<div class="quiz-tag">Autoverifica</div><div class="quiz-q">' + esc(q.d) + '</div>' +
      (multi ? '<div class="quiz-hint">Più risposte corrette: selezionale tutte.</div>' : '') +
      '<div class="quiz-opts"></div><div class="quiz-actions"><button class="btn quiz-check">Verifica</button><span class="quiz-fb"></span></div>';
    var opts = box.querySelector('.quiz-opts'), sel = {};
    var done = false;
    q.o.forEach(function (o, i) {
      var b = document.createElement('button');
      b.className = 'quiz-opt'; b.type = 'button';
      b.innerHTML = '<span class="box"></span><span>' + esc(o.t) + '</span>';
      b.onclick = function () {
        if (done) return;
        if (!multi) { sel = {}; opts.querySelectorAll('.quiz-opt').forEach(function (x) { x.classList.remove('sel'); }); }
        sel[i] = !sel[i]; b.classList.toggle('sel', !!sel[i]);
      };
      opts.appendChild(b);
    });
    var btn = box.querySelector('.quiz-check'), fb = box.querySelector('.quiz-fb');
    btn.onclick = function () {
      if (done) {
        done = false; sel = {}; fb.textContent = ''; fb.className = 'quiz-fb'; btn.textContent = 'Verifica';
        opts.querySelectorAll('.quiz-opt').forEach(function (x) { x.className = 'quiz-opt'; });
        var s = box.querySelector('.quiz-sol'); if (s) s.remove();
        return;
      }
      if (!Object.keys(sel).some(function (k) { return sel[k]; })) { fb.textContent = 'Scegli una risposta.'; fb.className = 'quiz-fb'; return; }
      var right = q.o.every(function (o, i) { return !!sel[i] === o.ok; });
      opts.querySelectorAll('.quiz-opt').forEach(function (x, i) {
        if (q.o[i].ok) x.classList.add('right');
        else if (sel[i]) x.classList.add('wrong');
      });
      fb.textContent = right ? 'Corretto.' : 'Non ancora: guarda la soluzione.';
      fb.className = 'quiz-fb ' + (right ? 'ok' : 'ko');
      if (q.s) { var s = document.createElement('div'); s.className = 'quiz-sol'; s.textContent = q.s; box.appendChild(s); }
      done = true; btn.textContent = 'Riprova';
    };
    return box;
  }

  /* ---------- vista nota ---------- */
  var current = null;
  function siblings(n) {
    var list;
    if (n.k === 'lezione') list = NOTES.filter(function (x) { return x.k === 'lezione'; }).sort(function (a, b) { return lessonKey(a) - lessonKey(b); });
    else if (n.k === 'unita') list = NOTES.filter(function (x) { return x.k === 'unita'; }).sort(function (a, b) { return unitKey(a) - unitKey(b); });
    else return null;
    var i = list.indexOf(n);
    return { prev: list[i - 1], next: list[i + 1] };
  }
  function unitNote(u) { return NOTES.filter(function (x) { return x.k === 'unita' && unitKey(x) === u; })[0]; }
  function showNote(id, startPage) {
    var n = BY[id];
    if (!n) { location.hash = '#/grafo'; return; }
    current = id;
    $('#view-graph').hidden = true; $('#view-note').hidden = false;
    global.stop();
    var art = $('#note'); art.innerHTML = '';
    var crumbs = document.createElement('div'); crumbs.className = 'crumbs';
    crumbs.innerHTML = '<span class="badge"><i class="dot" style="background:' + TYPES[n.k].color + '"></i>' + TYPES[n.k].one + '</span>' +
      n.u.filter(function (u) { return u > 0; }).map(function (u) {
        var un = unitNote(u);
        return '<a class="badge" href="#/n/' + (un ? un.id : '') + '"><i class="dot" style="background:' + UNIT_COLORS[u] + '"></i>Unità ' + u + '</a>';
      }).join('');
    art.appendChild(crumbs);
    var h = document.createElement('h1'); h.textContent = n.t; art.appendChild(h);
    art.appendChild(renderMd(n.b));
    var db = deepBox(n); if (db) art.appendChild(db);
    if (startPage) { var pv0 = art.querySelector('.pdfview'); if (pv0) setTimeout(function () { setPdfPage(pv0, startPage); }, 50); }
    var foot = document.createElement('div'); foot.className = 'note-foot';
    var sb = document.createElement('button'); sb.className = 'btn' + (studied[id] ? ' on' : '');
    sb.textContent = studied[id] ? '✓ Studiata' : 'Segna come studiata';
    sb.onclick = function () {
      if (studied[id]) delete studied[id]; else studied[id] = 1;
      save('mre-studied', studied);
      sb.className = 'btn' + (studied[id] ? ' on' : ''); sb.textContent = studied[id] ? '✓ Studiata' : 'Segna come studiata';
      renderTree(); renderProgress();
    };
    foot.appendChild(sb);
    var sib = siblings(n);
    if (sib) {
      var pg = document.createElement('div'); pg.className = 'pager';
      if (sib.prev) pg.innerHTML += '<a href="#/n/' + sib.prev.id + '">← ' + esc(sib.prev.t) + '</a>';
      if (sib.next) pg.innerHTML += '<a href="#/n/' + sib.next.id + '">' + esc(sib.next.t) + ' →</a>';
      foot.appendChild(pg);
    }
    art.appendChild(foot);
    var bl = $('#backlinks'); bl.innerHTML = '';
    var back = n.back.map(function (x) { return BY[x]; }).sort(function (a, b) {
      var o = ['unita', 'lezione', 'indice', 'concetto', 'autore', 'risorsa'];
      return o.indexOf(a.k) - o.indexOf(b.k) || a.t.localeCompare(b.t, 'it');
    });
    if (!back.length) bl.innerHTML = '<li class="k">Nessuna nota cita questa nota.</li>';
    back.forEach(function (b) { bl.innerHTML += '<li><a href="#/n/' + b.id + '">' + esc(b.t) + '</a><span class="k">' + TYPES[b.k].one + '</span></li>'; });
    $('#view-note').scrollTop = 0;
    document.title = n.t + ' · Metodologia della ricerca educativa';
    buildLocal(id);
    renderTree();
  }
  function showGraph() {
    current = null;
    $('#view-note').hidden = true; $('#view-graph').hidden = false;
    local.stop();
    document.title = 'Metodologia della ricerca educativa';
    if (!globalBuilt) { rebuildGlobal(true); }
    else if (global.sim) global.sim.alpha(0.05).restart();
    if (!global.resize()) setTimeout(function () { global.resize(); }, 50);
    renderTree();
  }

  /* ---------- indice laterale ---------- */
  var openGroups = load('mre-open', { start: 1 });
  function renderTree() {
    var tree = $('#tree'); tree.innerHTML = '';
    function group(key, label, color, items) {
      var g = document.createElement('div');
      var hasCur = items.some(function (x) { return x && x.id === current; }) || (key === 'biblio' && current && BY[current] && DEEP[BY[current].k]);
      g.className = 'tree-group' + (openGroups[key] || hasCur ? ' open' : '');
      var b = document.createElement('button');
      b.innerHTML = '<i class="dot" style="background:' + color + '"></i><span>' + esc(label) + '</span><span class="chev">▶</span>';
      b.onclick = function () { openGroups[key] = !g.classList.contains('open'); g.classList.toggle('open'); save('mre-open', openGroups); };
      g.appendChild(b);
      var box = document.createElement('div'); box.className = 'tree-items';
      items.forEach(function (x) {
        if (typeof x === 'string') { var s = document.createElement('div'); s.className = 'sub'; s.textContent = x; box.appendChild(s); return; }
        var a = document.createElement('a'); a.href = '#/n/' + x.id; a.textContent = x.t;
        if (x.id === current) a.className = 'cur';
        if (studied[x.id]) { var d = document.createElement('span'); d.className = 'done'; d.textContent = '✓'; a.appendChild(d); }
        box.appendChild(a);
      });
      g.appendChild(box); tree.appendChild(g);
    }
    var byT = function (a, b) { return a.t.localeCompare(b.t, 'it'); };
    group('start', 'Inizia qui', UNIT_COLORS[0], NOTES.filter(function (x) { return x.k === 'indice'; }).sort(function (a, b) { return a.id === 'mappa-del-corso' ? -1 : b.id === 'mappa-del-corso' ? 1 : byT(a, b); }));
    for (var u = 1; u <= 7; u++) {
      var un = unitNote(u);
      var les = NOTES.filter(function (x) { return x.k === 'lezione' && x.u[0] === u; }).sort(function (a, b) { return lessonKey(a) - lessonKey(b); });
      var con = NOTES.filter(function (x) { return x.k === 'concetto' && x.u.indexOf(u) >= 0; }).sort(byT);
      group('u' + u, u + '. ' + UNIT_NAMES[u], UNIT_COLORS[u], [un].concat(['Lezioni'], les, ['Concetti'], con));
    }
    var bib = NOTES.filter(function (x) { return x.id === 'biblioteca-del-corso'; });
    var man = NOTES.filter(function (x) { return x.k === 'libro' && /^Manuale/.test(x.t); });
    var mch = NOTES.filter(function (x) { return x.k === 'capitolo' && /^Manuale · Capitolo/.test(x.t); }).sort(function (a, b) { return a.t.localeCompare(b.t, 'it', { numeric: true }); });
    var sld = NOTES.filter(function (x) { return x.k === 'slide'; }).sort(function (a, b) { return a.t.localeCompare(b.t, 'it', { numeric: true }); });
    var cls = NOTES.filter(function (x) { return x.k === 'libro' && !/^Manuale/.test(x.t); }).sort(byT);
    group('biblio', 'Biblioteca', TYPES.libro.color, bib.concat(['Manuale'], man, mch, ['Slide delle lezioni'], sld, ['Classici'], cls));
    group('autori', 'Autori', TYPES.autore.color, NOTES.filter(function (x) { return x.k === 'autore'; }).sort(byT));
    group('risorse', 'Risorse', TYPES.risorsa.color, NOTES.filter(function (x) { return x.k === 'risorsa'; }).sort(byT));
    document.querySelectorAll('.top-actions .pill').forEach(function (p) { p.classList.remove('on'); });
    if (!current) $('#nav-graph').classList.add('on');
    else if (current === 'mappa-del-corso') $('#nav-map').classList.add('on');
    var cur = tree.querySelector('a.cur');
    if (cur && cur.scrollIntoViewIfNeeded) cur.scrollIntoViewIfNeeded(); else if (cur) cur.scrollIntoView({ block: 'nearest' });
  }
  function renderProgress() {
    var base = function (n) { return n.k !== 'indice' && !DEEP[n.k]; };
    var tot = NOTES.filter(base).length;
    var done = NOTES.filter(function (n) { return base(n) && studied[n.id]; }).length;
    $('#progress').innerHTML = 'Note studiate: <strong>' + done + '</strong> su ' + tot +
      '<div class="bar"><span style="width:' + (100 * done / tot).toFixed(1) + '%"></span></div>' +
      '<div style="margin-top:6px;font-size:12px;color:var(--text-3)">Il progresso resta salvato solo in questo browser.</div>';
  }

  /* ---------- ricerca ---------- */
  var sInput = $('#search'), sRes = $('#search-results'), sSel = 0, sItems = [];
  NOTES.forEach(function (n) { n._t = norm(n.t); n._a = norm(n.a.join(' ')); n._b = norm(n.b.replace(/\[\[([^\]|\\]+)(?:\\?\|([^\]]+))?\]\]/g, function (m, a, b) { return b || a; })); });
  function search(q) {
    q = norm(q.trim()); if (!q) return [];
    var res = [];
    NOTES.forEach(function (n) {
      var s = 0, snip = '';
      if (n._t === q) s = 200; else if (n._t.indexOf(q) === 0) s = 120; else if (n._t.indexOf(' ' + q) >= 0) s = 90; else if (n._t.indexOf(q) >= 0) s = 70;
      if (!s && n._a.indexOf(q) >= 0) s = 60;
      var bi = n._b.indexOf(q);
      if (bi >= 0) {
        s += 10 + Math.min(10, n._b.split(q).length);
        if (s < 40) { var raw = n.b.replace(/\[\[([^\]|\\]+)(?:\\?\|([^\]]+))?\]\]/g, function (m, a, b) { return b || a; }).replace(/[*#>`|]/g, ''); snip = raw.substr(Math.max(0, bi - 40), 110).replace(/\s+/g, ' '); }
      }
      if (s) res.push({ n: n, s: s + Math.min(8, n.deg / 4), snip: snip });
    });
    return res.sort(function (a, b) { return b.s - a.s; }).slice(0, 14);
  }
  function drawResults() {
    if (!sItems.length) { sRes.innerHTML = '<div class="empty">Nessuna nota trovata.</div>'; return; }
    sRes.innerHTML = sItems.map(function (r, i) {
      return '<a href="#/n/' + r.n.id + '" class="' + (i === sSel ? 'sel' : '') + '" role="option"><span class="r-t">' + esc(r.n.t) +
        (r.snip ? '<span class="r-x">…' + esc(r.snip) + '…</span>' : '') + '</span><span class="r-k">' + TYPES[r.n.k].one + '</span></a>';
    }).join('');
  }
  sInput.addEventListener('input', function () {
    sItems = search(sInput.value); sSel = 0;
    sRes.hidden = !sInput.value.trim(); drawResults();
    if (!current) {
      if (sInput.value.trim()) { var m = {}; sItems.forEach(function (r) { m[r.n.id] = 1; }); global.opt.match = m; } else global.opt.match = null;
      global.draw();
    }
  });
  sInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { sSel = Math.min(sSel + 1, sItems.length - 1); drawResults(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sSel = Math.max(sSel - 1, 0); drawResults(); e.preventDefault(); }
    else if (e.key === 'Enter' && sItems[sSel]) { location.hash = '#/n/' + sItems[sSel].n.id; closeSearch(); }
    else if (e.key === 'Escape') { closeSearch(); sInput.blur(); }
  });
  function closeSearch() { sRes.hidden = true; sInput.value = ''; global.opt.match = null; global.draw(); }
  sRes.addEventListener('click', function () { setTimeout(closeSearch, 0); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.search')) sRes.hidden = true; });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== sInput && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); sInput.focus(); }
  });

  /* ---------- tema e menu ---------- */
  $('#btn-theme').onclick = function () {
    var cur = document.documentElement.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('mre-theme', next); } catch (e) {}
    global.draw(); local.draw();
  };
  function setMenu(open) { $('#sidebar').classList.toggle('open', open); $('#scrim').hidden = !open; }
  $('#btn-menu').onclick = function () { setMenu(!$('#sidebar').classList.contains('open')); };
  $('#btn-close-menu').onclick = function () { setMenu(false); };
  $('#scrim').onclick = function () { setMenu(false); };

  /* ---------- routing ---------- */
  function route() {
    var m = location.hash.match(/^#\/n\/([\w-]+)(?:\?p=(\d+))?/);
    setMenu(false);
    if (m) showNote(m[1], m[2] ? +m[2] : 0); else showGraph();
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('resize', function () { if (current) local.resize(); else global.resize(); });

  buildPanel();
  renderProgress();
  route();
})();
