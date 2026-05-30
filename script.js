/* ============================================
   RelasiCheck — script.js
   Pemeriksa Sifat Refleksif pada Relasi
   ============================================ */

// ─── CONTOH DATA ────────────────────────────────────────────────────────────
const EXAMPLES = [
  {
    set: '1, 2, 3',
    rel: '(1,1), (2,2), (3,3), (1,2)',
    label: 'Refleksif — semua (a,a) ada'
  },
  {
    set: '1, 2, 3',
    rel: '(1,1), (2,2), (1,3)',
    label: 'Tidak Refleksif — (3,3) tidak ada'
  },
  {
    set: 'a, b, c',
    rel: '(a,a), (b,b), (c,c), (a,b)',
    label: 'Elemen huruf — refleksif'
  },
  {
    set: '1, 2, 3, 4, 5',
    rel: '(1,1), (2,2), (3,3), (4,4), (5,5), (1,2), (3,5)',
    label: 'Himpunan besar — refleksif'
  }
];

function loadExample(n) {
  const ex = EXAMPLES[n - 1];
  if (!ex) return;
  document.getElementById('setInput').value      = ex.set;
  document.getElementById('relationInput').value = ex.rel;
  clearErrors();
}

// ─── PARSING ────────────────────────────────────────────────────────────────

/**
 * Mem-parse string himpunan → array elemen (string)
 * Contoh: "1, 2, 3" → ["1","2","3"]
 */
function parseSet(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: 'Himpunan tidak boleh kosong.' };

  const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return { ok: false, error: 'Tidak ada elemen yang valid.' };

  // Duplikat cek
  const unique = [...new Set(parts)];
  if (unique.length !== parts.length) {
    return { ok: false, error: 'Terdapat elemen duplikat pada himpunan.' };
  }

  return { ok: true, data: unique };
}

/**
 * Mem-parse string relasi → array pasangan [[a,b], ...]
 * Contoh: "(1,1), (2,3)" → [["1","1"],["2","3"]]
 * Mendukung elemen huruf, angka, dll.
 */
function parseRelation(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: 'Relasi tidak boleh kosong.' };

  // Ambil semua pasangan dalam tanda kurung
  const pairRegex = /\(([^,()]+),\s*([^,()]+)\)/g;
  const pairs = [];
  let match;

  while ((match = pairRegex.exec(trimmed)) !== null) {
    const a = match[1].trim();
    const b = match[2].trim();
    if (!a || !b) return { ok: false, error: 'Format pasangan tidak valid. Gunakan (a,b).' };
    pairs.push([a, b]);
  }

  if (pairs.length === 0) {
    return { ok: false, error: 'Tidak ada pasangan valid. Format: (a,b), (c,d), ...' };
  }

  return { ok: true, data: pairs };
}

// ─── LOGIKA REFLEKSIF ────────────────────────────────────────────────────────

/**
 * Periksa apakah relasi R bersifat refleksif pada himpunan A.
 * Kembalikan objek hasil lengkap.
 */
function analyzeReflexive(setElements, pairs) {
  // Buat Set dari pasangan untuk lookup O(1)
  const pairSet = new Set(pairs.map(([a, b]) => `${a}__${b}`));

  const checks = setElements.map(elem => {
    const needed = `${elem}__${elem}`;
    const present = pairSet.has(needed);
    return { elem, pair: `(${elem},${elem})`, present };
  });

  const missing = checks.filter(c => !c.present);
  const isReflexive = missing.length === 0;

  return { checks, missing, isReflexive, pairSet };
}

// ─── RENDER HASIL ────────────────────────────────────────────────────────────

function renderResult(setElements, pairs, analysis) {
  const area = document.getElementById('resultArea');
  area.innerHTML = '';

  const { checks, missing, isReflexive } = analysis;

  // 1. VERDICT BANNER
  const banner = document.createElement('div');
  banner.className = `verdict-banner ${isReflexive ? 'is-reflexive' : 'not-reflexive'}`;
  banner.innerHTML = `
    <div class="verdict-glow"></div>
    <div class="verdict-icon">${isReflexive ? '✅' : '❌'}</div>
    <div class="verdict-text">
      <p class="verdict-label">Hasil Pemeriksaan</p>
      <h2 class="verdict-title">
        Relasi ${isReflexive ? 'REFLEKSIF' : 'TIDAK REFLEKSIF'}
      </h2>
      <p class="verdict-summary">
        A = {${setElements.join(', ')}} &nbsp;|&nbsp;
        |R| = ${pairs.length} pasangan &nbsp;|&nbsp;
        Diagonal: ${checks.filter(c => c.present).length}/${setElements.length}
      </p>
    </div>
  `;
  area.appendChild(banner);

  // 2. LANGKAH PENGERJAAN
  area.appendChild(buildStepsCard(setElements, pairs, analysis));

  // 3. MATRIKS RELASI
  area.appendChild(buildMatrixCard(setElements, pairs, analysis));

  // 4. GRAF RELASI
  area.appendChild(buildGraphCard(setElements, pairs, analysis));

  // 5. KESIMPULAN
  area.appendChild(buildConclusionCard(setElements, pairs, analysis));

  // Render graph setelah elemen ada di DOM
  setTimeout(() => renderGraph(setElements, pairs, analysis), 80);

  // Scroll ke hasil
  area.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- Kartu Langkah Pengerjaan ---------- */
function buildStepsCard(setElems, pairs, { checks, missing, isReflexive }) {
  const steps = [];

  // Langkah 1: Identifikasi A
  steps.push({
    n: 1,
    text: 'Identifikasi himpunan A dan semua elemennya.',
    math: `A = {${setElems.join(', ')}} &nbsp;→&nbsp; |A| = ${setElems.length} elemen`,
    miss: false
  });

  // Langkah 2: Identifikasi R
  steps.push({
    n: 2,
    text: 'Identifikasi relasi R yang diberikan.',
    math: `R = {${pairs.map(([a,b]) => `(${a},${b})`).join(', ')}}`,
    miss: false
  });

  // Langkah 3: Definisi refleksif
  steps.push({
    n: 3,
    text: 'Terapkan definisi refleksif: untuk setiap a ∈ A harus berlaku (a,a) ∈ R.',
    math: `∀a ∈ A,  (a, a) ∈ R`,
    miss: false
  });

  // Langkah 4: Daftar pasangan diagonal yang perlu dicek
  const needed = setElems.map(e => `(${e},${e})`).join(', ');
  steps.push({
    n: 4,
    text: 'Tentukan pasangan diagonal yang harus ada di R.',
    math: `Pasangan diagonal: ${needed}`,
    miss: false
  });

  // Langkah 5+: Cek setiap elemen
  checks.forEach((c, i) => {
    steps.push({
      n: 5 + i,
      text: `Periksa elemen <strong>${c.elem}</strong>: apakah ${c.pair} ∈ R?`,
      math: `${c.pair} ${c.present ? '∈' : '∉'} R &nbsp;→&nbsp; ${c.present ? '✓ Ada' : '✗ Tidak ada'}`,
      miss: !c.present
    });
  });

  const html = `
    <div class="steps-list">
      ${steps.map(s => `
        <div class="step-item">
          <div class="step-num">${s.n}</div>
          <div class="step-content">
            <p class="step-text">${s.text}</p>
            <div class="step-math ${s.miss ? 'miss' : ''}">${s.math}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return buildCard('02', 'Langkah Pengerjaan', html, true);
}

/* ---------- Kartu Matriks ---------- */
function buildMatrixCard(setElems, pairs, { pairSet }) {
  const n = setElems.length;

  let tableHtml = '<table class="matrix-table"><thead><tr><th></th>';
  setElems.forEach(e => { tableHtml += `<th>${e}</th>`; });
  tableHtml += '</tr></thead><tbody>';

  for (let i = 0; i < n; i++) {
    tableHtml += `<tr><th>${setElems[i]}</th>`;
    for (let j = 0; j < n; j++) {
      const a = setElems[i];
      const b = setElems[j];
      const exists = pairSet.has(`${a}__${b}`);
      const isDiag = (i === j);
      let cls = '';
      if (isDiag) cls = exists ? 'cell-diag-1' : 'cell-diag-0';
      else        cls = exists ? 'cell-1' : 'cell-0';
      tableHtml += `<td class="${cls}">${exists ? 1 : 0}</td>`;
    }
    tableHtml += '</tr>';
  }
  tableHtml += '</tbody></table>';

  const legend = `
    <div class="matrix-legend">
      <div class="legend-item"><div class="legend-dot teal"></div> Diagonal ada (✓)</div>
      <div class="legend-item"><div class="legend-dot red"></div> Diagonal hilang (✗)</div>
      <div class="legend-item"><div class="legend-dot faint"></div> Bukan diagonal</div>
    </div>
  `;

  const html = `<div class="matrix-wrap">${tableHtml}</div>${legend}`;
  return buildCard('03', 'Matriks Relasi', html);
}

/* ---------- Kartu Graf ---------- */
function buildGraphCard(setElems, pairs, analysis) {
  const html = `
    <p style="font-size:12px;color:var(--ink-muted);font-family:var(--mono);margin-bottom:14px;">
      Lingkaran biru = loop refleksif ada &nbsp;|&nbsp; Merah = loop hilang &nbsp;|&nbsp; Garis = pasangan lain
    </p>
    <div class="graph-canvas-wrap">
      <canvas id="graphCanvas"></canvas>
    </div>
  `;
  return buildCard('04', 'Visualisasi Graf Relasi', html);
}

/* ---------- Kartu Kesimpulan ---------- */
function buildConclusionCard(setElems, pairs, { checks, missing, isReflexive }) {
  let text = '';
  if (isReflexive) {
    text = `
      Relasi R pada himpunan A = {${setElems.join(', ')}} bersifat <strong>REFLEKSIF</strong>.<br><br>
      Hal ini karena semua pasangan diagonal:<br>
      <span style="display:inline-block;margin-top:6px;">${checks.map(c => c.pair).join(', ')}</span><br><br>
      seluruhnya terdapat dalam R, sehingga syarat ∀a ∈ A, (a,a) ∈ R terpenuhi.
    `;
  } else {
    const missList = missing.map(c => c.pair).join(', ');
    const present  = checks.filter(c => c.present).map(c => c.pair).join(', ');
    text = `
      Relasi R pada himpunan A = {${setElems.join(', ')}} <strong>TIDAK BERSIFAT REFLEKSIF</strong>.<br><br>
      Pasangan diagonal yang ada &nbsp;→&nbsp; ${present || '(tidak ada)'}<br>
      Pasangan diagonal yang <strong>hilang</strong> &nbsp;→&nbsp; ${missList}<br><br>
      Karena ${missing.map(c => c.pair).join(', ')} tidak terdapat dalam R,
      syarat ∀a ∈ A, (a,a) ∈ R tidak terpenuhi.
    `;
  }

  const html = `
    <div class="conclusion-box ${isReflexive ? 'ok' : 'bad'}">
      ${text}
    </div>
  `;
  return buildCard('05', 'Kesimpulan', html, true);
}

/* ---------- Helper buildCard ---------- */
function buildCard(num, title, bodyHtml, defaultOpen = false) {
  const card = document.createElement('div');
  card.className = 'result-card';

  const header = document.createElement('div');
  header.className = `card-header ${defaultOpen ? 'open' : ''}`;
  header.innerHTML = `
    <span class="card-num">${num}</span>
    <span class="card-title">${title}</span>
    <span class="card-chevron">▶</span>
  `;

  const body = document.createElement('div');
  body.className = `card-body ${defaultOpen ? 'open' : ''}`;
  body.innerHTML = bodyHtml;

  header.addEventListener('click', () => {
    const isOpen = header.classList.toggle('open');
    if (isOpen) { body.classList.add('open'); }
    else         { body.classList.remove('open'); }
  });

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

// ─── CANVAS GRAPH ────────────────────────────────────────────────────────────

function renderGraph(setElems, pairs, { pairSet }) {
  const canvas = document.getElementById('graphCanvas');
  if (!canvas) return;

  const n = setElems.length;
  const SIZE = Math.min(Math.max(n * 90, 300), 520);
  canvas.width  = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const radius = SIZE * 0.33;
  const nodeR  = 22;

  // Posisi node melingkar
  const pos = setElems.map((_, i) => {
    const angle = (2 * Math.PI * i / n) - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  });

  const colors = {
    bg:        '#10121a',
    nodeFill:  '#181c28',
    nodeBorder:'rgba(255,255,255,0.15)',
    edgeLine:  'rgba(122,128,160,0.45)',
    loopOk:    '#00e8c8',
    loopMiss:  '#ff5370',
    text:      '#f0f2ff',
  };

  // Background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // ── Gambar edge (non-self) ──
  ctx.strokeStyle = colors.edgeLine;
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([4, 4]);

  pairs.forEach(([a, b]) => {
    if (a === b) return; // loop digambar terpisah
    const ai = setElems.indexOf(a);
    const bi = setElems.indexOf(b);
    if (ai < 0 || bi < 0) return;
    const pa = pos[ai], pb = pos[bi];

    ctx.beginPath();
    // Sedikit kurva agar lebih bagus
    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2;
    const dx = pb.y - pa.y;
    const dy = pa.x - pb.x;
    const curve = 0.15;
    ctx.moveTo(pa.x, pa.y);
    ctx.quadraticCurveTo(mx + dx * curve, my + dy * curve, pb.x, pb.y);
    ctx.stroke();

    // Panah
    drawArrow(ctx, mx + dx * curve, my + dy * curve, pb.x, pb.y, nodeR, colors.edgeLine);
  });

  ctx.setLineDash([]);

  // ── Gambar loop ──
  setElems.forEach((elem, i) => {
    const hasLoop = pairSet.has(`${elem}__${elem}`);
    const p = pos[i];
    const loopColor = hasLoop ? colors.loopOk : colors.loopMiss;

    const angle = Math.atan2(p.y - cy, p.x - cx);
    const lx = p.x + Math.cos(angle) * (nodeR + 22);
    const ly = p.y + Math.sin(angle) * (nodeR + 22);
    const loopR = 16;

    ctx.beginPath();
    ctx.arc(lx, ly, loopR, 0, 2 * Math.PI);
    ctx.strokeStyle = loopColor;
    ctx.lineWidth = hasLoop ? 2.5 : 2;
    if (!hasLoop) ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glow effect untuk loop yang ada
    if (hasLoop) {
      ctx.beginPath();
      ctx.arc(lx, ly, loopR + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = loopColor + '33';
      ctx.lineWidth = 6;
      ctx.stroke();
    }
  });

  // ── Gambar node ──
  setElems.forEach((elem, i) => {
    const p = pos[i];

    // Shadow
    ctx.shadowColor = 'rgba(0,232,200,0.15)';
    ctx.shadowBlur  = 12;

    ctx.beginPath();
    ctx.arc(p.x, p.y, nodeR, 0, 2 * Math.PI);
    ctx.fillStyle   = colors.nodeFill;
    ctx.fill();
    ctx.strokeStyle = colors.nodeBorder;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.shadowBlur  = 0;

    // Label
    ctx.font      = `bold 13px "Space Mono", monospace`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(elem, p.x, p.y);
  });
}

function drawArrow(ctx, fromX, fromY, toX, toY, nodeR, color) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const tipX  = toX - Math.cos(angle) * nodeR;
  const tipY  = toY - Math.sin(angle) * nodeR;
  const hs    = 8;

  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - hs * Math.cos(angle - 0.4), tipY - hs * Math.sin(angle - 0.4));
  ctx.lineTo(tipX - hs * Math.cos(angle + 0.4), tipY - hs * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

// ─── MAIN CHECK ──────────────────────────────────────────────────────────────

function checkReflexive() {
  clearErrors();
  let valid = true;

  const rawSet = document.getElementById('setInput').value;
  const rawRel = document.getElementById('relationInput').value;

  const setResult = parseSet(rawSet);
  const relResult = parseRelation(rawRel);

  if (!setResult.ok) {
    showError('setError', setResult.error);
    valid = false;
  }

  if (!relResult.ok) {
    showError('relationError', relResult.error);
    valid = false;
  }

  if (!valid) return;

  const setElements = setResult.data;
  const pairs       = relResult.data;

  // Validasi: elemen dalam R harus ada di A
  const outOfSet = pairs.filter(([a, b]) =>
    !setElements.includes(a) || !setElements.includes(b)
  );

  if (outOfSet.length > 0) {
    const bad = outOfSet.map(([a,b]) => `(${a},${b})`).join(', ');
    showError('relationError',
      `Pasangan ${bad} mengandung elemen yang tidak ada di himpunan A.`
    );
    return;
  }

  const analysis = analyzeReflexive(setElements, pairs);
  renderResult(setElements, pairs, analysis);
}

// ─── RESET ───────────────────────────────────────────────────────────────────

function resetAll() {
  document.getElementById('setInput').value      = '';
  document.getElementById('relationInput').value = '';
  clearErrors();
  const area = document.getElementById('resultArea');
  area.innerHTML = '';
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ['setError', 'relationError'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

// ─── KEYBOARD SHORTCUT ───────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter') && (e.ctrlKey || e.metaKey)) {
    checkReflexive();
  }
});

// ─── STATIC EXAMPLE GRAPHS (drawn on page load) ──────────────────────────────

function drawExampleGraph(canvasId, elements, pairs, loopStatus) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const W      = canvas.width, H = canvas.height;
  const n      = elements.length;
  const cx     = W / 2, cy = H / 2;
  const radius = Math.min(W, H) * 0.3;
  const nodeR  = 18;
  const loopR  = 13;

  const C = {
    bg:         '#10121a',
    nodeFill:   '#181c28',
    nodeBorder: 'rgba(255,255,255,0.12)',
    edge:       'rgba(122,128,160,0.55)',
    loopOk:     '#00e8c8',
    loopMiss:   '#ff5370',
    text:       '#f0f2ff'
  };

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  const pos = elements.map((_, i) => {
    const a = (2 * Math.PI * i / n) - Math.PI / 2;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  });

  // ── Helper: kepala panah — menerima SUDUT langsung, bukan koordinat from ──
  // angle = arah datangnya panah (radian), tip = ujung panah
  function arrowHead(tipX, tipY, angle, color, size) {
    ctx.save();
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - size * Math.cos(angle - 0.38), tipY - size * Math.sin(angle - 0.38));
    ctx.lineTo(tipX - size * Math.cos(angle + 0.38), tipY - size * Math.sin(angle + 0.38));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── Edge antar node: putus-putus + kepala panah ──
  pairs.forEach(([a, b]) => {
    if (a === b) return;
    const ai = elements.indexOf(a), bi = elements.indexOf(b);
    if (ai < 0 || bi < 0) return;
    const pa = pos[ai], pb = pos[bi];

    const mx  = (pa.x + pb.x) / 2, my  = (pa.y + pb.y) / 2;
    const dx  = pb.y - pa.y,        dy  = pa.x - pb.x;
    const cpx = mx + dx * 0.22,     cpy = my + dy * 0.22;

    // Sudut kurva di ujung (dari CP ke pb)
    const edgeAngle = Math.atan2(pb.y - cpy, pb.x - cpx);

    // Tip panah mundur dari pusat node agar tidak tertimbun di dalam node
    const tipX = pb.x - Math.cos(edgeAngle) * nodeR;
    const tipY = pb.y - Math.sin(edgeAngle) * nodeR;

    // Titik mulai dari tepi node asal
    const startAngle = Math.atan2(cpy - pa.y, cpx - pa.x);
    const sx = pa.x + Math.cos(startAngle) * (nodeR + 1);
    const sy = pa.y + Math.sin(startAngle) * (nodeR + 1);

    // Gambar kurva putus-putus
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cpx, cpy, tipX, tipY);
    ctx.strokeStyle = C.edge;
    ctx.lineWidth   = 1.6;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.restore();

    // Kepala panah di ujung kurva — pakai sudut edgeAngle
    arrowHead(tipX, tipY, edgeAngle, C.edge, 9);
  });

  // ── Loop self-relation ──
  elements.forEach((elem, i) => {
    const hasLoop  = loopStatus[elem] !== false;
    const p        = pos[i];
    const outAngle = Math.atan2(p.y - cy, p.x - cx);
    const dist     = nodeR + loopR + 3;
    const lx       = p.x + Math.cos(outAngle) * dist;
    const ly       = p.y + Math.sin(outAngle) * dist;
    const col      = hasLoop ? C.loopOk : C.loopMiss;

    // Lingkaran loop — semua pakai putus-putus agar kepala panah terlihat jelas
    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, ly, loopR, 0, 2 * Math.PI);
    ctx.strokeStyle = col;
    ctx.lineWidth   = hasLoop ? 2 : 1.8;
    ctx.setLineDash([4, 5]);
    ctx.stroke();
    ctx.restore();

    // Glow (tetap solid tipis di belakang)
    if (hasLoop) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(lx, ly, loopR + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = col + '22';
      ctx.lineWidth   = 4;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.restore();
    }

    // ── Kepala panah loop ──
    // Titip = titik di tepi lingkaran loop yang paling dekat ke node
    // = pusat loop + arah (outAngle + 180°) × loopR
    const toNodeAngle = outAngle + Math.PI;
    const tipX = lx + Math.cos(toNodeAngle) * loopR;
    const tipY = ly + Math.sin(toNodeAngle) * loopR;

    // Sudut panah = tangensial di titik itu = toNodeAngle + 90°
    // (tegak lurus radius → panah simetris sempurna terhadap lingkaran)
    if (hasLoop) {
  // Loop hijau (tetap)
  const arrowAngle = toNodeAngle - Math.PI / 2.7;
  arrowHead(tipX, tipY, arrowAngle, '#00e8c8', 16);
} else {
  // Loop merah (custom)
  const arrowAngle = toNodeAngle + Math.PI / 2;
  arrowHead(tipX, tipY, arrowAngle, '#ff5370', 16);
}
  });

  // ── Node (digambar paling atas) ──
  elements.forEach((elem, i) => {
    const p = pos[i];
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, nodeR, 0, 2 * Math.PI);
    ctx.fillStyle   = C.nodeFill;
    ctx.fill();
    ctx.strokeStyle = C.nodeBorder;
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.font         = `bold 12px "Space Mono", monospace`;
    ctx.fillStyle    = C.text;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(elem, p.x, p.y);
    ctx.restore();
  });
}

// Draw all three static example graphs when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  // Contoh 1 — semua loop ada
  drawExampleGraph('cv1', ['1','2','3'],
    [['1','1'],['2','2'],['3','3'],['1','2'],['2','3']],
    { '1': true, '2': true, '3': true });

  // Contoh 2 — (3,3) tidak ada
  drawExampleGraph('cv2', ['1','2','3'],
    [['1','1'],['2','2'],['1','3'],['2','3']],
    { '1': true, '2': true, '3': false });

  // Contoh 3 — elemen huruf, semua loop ada
  drawExampleGraph('cv3', ['a','b','c','d'],
    [['a','a'],['b','b'],['c','c'],['d','d'],['a','b'],['c','d']],
    { 'a': true, 'b': true, 'c': true, 'd': true });

  // Contoh 4 — 4 elemen, (4,4) tidak ada
  drawExampleGraph('cv4', ['1','2','3','4'],
    [['1','1'],['2','2'],['3','3'],['1','2'],['3','4']],
    { '1': true, '2': true, '3': true, '4': false });

  // Contoh 5 — refleksif minimal, hanya diagonal
  drawExampleGraph('cv5', ['x','y','z'],
    [['x','x'],['y','y'],['z','z']],
    { 'x': true, 'y': true, 'z': true });
});