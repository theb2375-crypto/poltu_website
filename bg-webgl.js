(function () {
  if (typeof THREE === 'undefined') return;

  /* ── Renderer ──────────────────────────────────────────────────── */
  const bgCanvas = document.createElement('canvas');
  bgCanvas.id = 'bg-gl';
  Object.assign(bgCanvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    zIndex: '-10', pointerEvents: 'none'
  });
  document.body.prepend(bgCanvas);

  const renderer = new THREE.WebGLRenderer({ canvas: bgCanvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x040302, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 0, 5);

  /* ══════════════════════════════════════════════════════════════════
     ROOM BACKGROUND TEXTURE
  ══════════════════════════════════════════════════════════════════ */
  function makeRoomTex() {
    const W = 2048, H = 1152;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const x = cv.getContext('2d');

    /* Base wall – rich dark walnut */
    const wallGrad = x.createLinearGradient(0, 0, W, H);
    wallGrad.addColorStop(0,   '#050402');
    wallGrad.addColorStop(0.4, '#060504');
    wallGrad.addColorStop(1,   '#040302');
    x.fillStyle = wallGrad;
    x.fillRect(0, 0, W, H);

    /* Wall grain streaks */
    for (let i = 0; i < 90; i++) {
      x.strokeStyle = `rgba(200,160,80,${Math.random() * 0.011})`;
      x.lineWidth   = Math.random() * 1.4 + 0.2;
      x.beginPath();
      x.moveTo(Math.random() * W, 0);
      x.lineTo(Math.random() * W + 60, H);
      x.stroke();
    }

    /* Wainscoting panel (lower wall trim) */
    x.fillStyle = '#0a0806';
    x.fillRect(0, H * 0.68, W, H * 0.08);
    x.fillStyle = 'rgba(180,140,60,0.12)';
    x.fillRect(0, H * 0.68, W, 2);
    x.fillStyle = 'rgba(0,0,0,0.3)';
    x.fillRect(0, H * 0.74, W, 2);

    /* Window – upper right */
    const wX = W * 0.66, wY = H * 0.02, wW = W * 0.30, wH = H * 0.65;

    /* Window wall-glow */
    const halo = x.createRadialGradient(wX + wW * 0.5, wY + wH * 0.35, 10, wX + wW * 0.5, wY + wH * 0.35, wW * 2.2);
    halo.addColorStop(0,   'rgba(220,190,110,0.24)');
    halo.addColorStop(0.3, 'rgba(200,165,80,0.10)');
    halo.addColorStop(1,   'rgba(0,0,0,0)');
    x.fillStyle = halo;
    x.fillRect(0, 0, W, H);

    /* Sky */
    const sky = x.createLinearGradient(wX, wY, wX, wY + wH);
    sky.addColorStop(0,    '#b89030');
    sky.addColorStop(0.25, '#debb58');
    sky.addColorStop(0.6,  '#c8a038');
    sky.addColorStop(1,    '#806015');
    x.fillStyle = sky;
    x.fillRect(wX + 8, wY + 8, wW - 16, wH - 16);

    /* Subtle clouds */
    for (let c = 0; c < 5; c++) {
      const cg = x.createRadialGradient(
        wX + wW * (0.2 + c * 0.15), wY + wH * (0.2 + c * 0.05), 0,
        wX + wW * (0.2 + c * 0.15), wY + wH * (0.2 + c * 0.05), wW * 0.18
      );
      cg.addColorStop(0, 'rgba(255,240,200,0.25)');
      cg.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = cg;
      x.fillRect(wX, wY, wW, wH * 0.5);
    }

    /* Window frame */
    x.fillStyle = '#1a1208';
    x.fillRect(wX, wY, wW, 9);
    x.fillRect(wX, wY + wH - 9, wW, 9);
    x.fillRect(wX, wY, 9, wH);
    x.fillRect(wX + wW - 9, wY, 9, wH);
    x.fillRect(wX + wW * 0.5 - 5, wY, 10, wH);
    x.fillRect(wX, wY + wH * 0.5 - 4, wW, 8);

    /* Frame moulding highlight */
    x.fillStyle = 'rgba(140,100,40,0.25)';
    x.fillRect(wX + 1, wY + 1, wW - 2, 3);
    x.fillRect(wX + 1, wY + 1, 3, wH - 2);

    /* Light shafts */
    x.save();
    x.globalCompositeOperation = 'screen';
    for (let i = 0; i < 6; i++) {
      const sx = wX + wW * (0.12 + i * 0.16);
      const sg = x.createLinearGradient(sx, wY + wH, sx - W * 0.09, H);
      sg.addColorStop(0, 'rgba(220,185,90,0.07)');
      sg.addColorStop(1, 'rgba(220,185,90,0)');
      x.fillStyle = sg;
      x.beginPath();
      x.moveTo(sx - 9, wY + wH);
      x.lineTo(sx + 9, wY + wH);
      x.lineTo(sx + 9 - W * 0.11, H);
      x.lineTo(sx - 9 - W * 0.11, H);
      x.fill();
    }
    x.restore();

    /* Curtains (both sides of window) */
    function drawCurtain(cx, side) {
      const cDir = side === 'left' ? 1 : -1;
      const cW2  = wW * 0.22;
      /* Curtain body */
      const cGrad = x.createLinearGradient(cx, 0, cx + cDir * cW2, 0);
      if (side === 'left') {
        cGrad.addColorStop(0, '#1a1008'); cGrad.addColorStop(0.5, '#261808'); cGrad.addColorStop(1, '#120e06');
      } else {
        cGrad.addColorStop(0, '#120e06'); cGrad.addColorStop(0.5, '#261808'); cGrad.addColorStop(1, '#1a1008');
      }
      x.fillStyle = cGrad;
      /* Curtain drape shape – wavy edge */
      x.beginPath();
      x.moveTo(cx, wY - 10);
      for (let row = 0; row < 18; row++) {
        const py = wY + (row / 18) * (wH + 30);
        const wave = Math.sin(row * 1.1) * cW2 * 0.18;
        x.lineTo(cx + cDir * (cW2 + wave), py);
      }
      x.lineTo(cx + cDir * cW2, wY + wH + 40);
      x.lineTo(cx, wY + wH + 40);
      x.fill();
      /* Curtain fold shading */
      for (let f = 0; f < 5; f++) {
        const fGrad = x.createLinearGradient(
          cx + cDir * (cW2 * f / 5), 0,
          cx + cDir * (cW2 * (f + 0.5) / 5), 0
        );
        fGrad.addColorStop(0, 'rgba(0,0,0,0.18)');
        fGrad.addColorStop(0.5,'rgba(255,200,100,0.04)');
        fGrad.addColorStop(1,  'rgba(0,0,0,0.12)');
        x.fillStyle = fGrad;
        x.fillRect(
          Math.min(cx, cx + cDir * cW2 * f / 5),
          wY - 10,
          cW2 / 5,
          wH + 50
        );
      }
    }
    drawCurtain(wX + 5, 'left');
    drawCurtain(wX + wW - 5, 'right');

    /* Curtain top rod */
    x.fillStyle = '#2a1e0e';
    x.fillRect(wX - 10, wY - 14, wW + 20, 10);
    x.fillStyle = 'rgba(160,120,50,0.4)';
    x.fillRect(wX - 10, wY - 14, wW + 20, 2);

    /* Bookshelf – left wall */
    x.fillStyle = '#0e0c07';
    x.fillRect(0, H * 0.08, W * 0.13, H * 0.70);
    /* Shelf back panel shading */
    const shelfBG = x.createLinearGradient(0, 0, W * 0.13, 0);
    shelfBG.addColorStop(0, 'rgba(255,200,80,0.05)');
    shelfBG.addColorStop(1, 'rgba(0,0,0,0.3)');
    x.fillStyle = shelfBG;
    x.fillRect(0, H * 0.08, W * 0.13, H * 0.70);
    /* Shelves + books */
    const bookPalette = ['#1e1409','#180f06','#221608','#120e05','#1c1509','#160c05'];
    for (let shelf = 0; shelf < 7; shelf++) {
      const sy = H * 0.08 + shelf * H * 0.10;
      x.fillStyle = '#0b0905';
      x.fillRect(0, sy, W * 0.13, 5);
      /* Cast shadow under shelf */
      const shShadow = x.createLinearGradient(0, sy + 5, 0, sy + 18);
      shShadow.addColorStop(0, 'rgba(0,0,0,0.4)');
      shShadow.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = shShadow;
      x.fillRect(0, sy + 5, W * 0.13, 13);
      /* Books */
      let bx = W * 0.006;
      for (let b = 0; b < 9; b++) {
        const bw = W * 0.008 + Math.random() * W * 0.004;
        const bh = H * 0.062 + Math.random() * H * 0.02;
        x.fillStyle = bookPalette[(shelf + b) % bookPalette.length];
        x.fillRect(bx, sy + 6, bw, bh);
        /* Book spine highlight */
        x.fillStyle = 'rgba(255,200,80,0.06)';
        x.fillRect(bx, sy + 6, 1.5, bh);
        bx += bw + W * 0.002;
        if (bx > W * 0.122) break;
      }
    }
    /* Shelf side panels */
    x.fillStyle = '#0a0806';
    x.fillRect(0, H * 0.08, W * 0.012, H * 0.70);
    x.fillRect(W * 0.118, H * 0.08, W * 0.012, H * 0.70);

    /* Hardwood floor */
    const floorGrad = x.createLinearGradient(0, H * 0.76, 0, H);
    floorGrad.addColorStop(0, '#1a1208');
    floorGrad.addColorStop(0.3,'#130e06');
    floorGrad.addColorStop(1,  '#080604');
    x.fillStyle = floorGrad;
    x.fillRect(0, H * 0.76, W, H * 0.24);
    /* Wood planks */
    x.strokeStyle = 'rgba(0,0,0,0.35)';
    x.lineWidth = 1.5;
    const plankH = H * 0.028;
    for (let row = 0; row < 9; row++) {
      const py = H * 0.76 + row * plankH;
      x.beginPath(); x.moveTo(0, py); x.lineTo(W, py); x.stroke();
      /* Staggered vertical joints */
      const joints = row % 2 === 0 ? [W*0.25, W*0.5, W*0.75] : [W*0.12, W*0.37, W*0.62, W*0.87];
      joints.forEach(jx => {
        x.beginPath(); x.moveTo(jx, py); x.lineTo(jx, py + plankH); x.stroke();
      });
      /* Plank grain */
      const plankSheen = x.createLinearGradient(0, py, 0, py + plankH);
      plankSheen.addColorStop(0,   'rgba(255,200,80,0.04)');
      plankSheen.addColorStop(0.5, 'rgba(255,180,60,0.01)');
      plankSheen.addColorStop(1,   'rgba(0,0,0,0.05)');
      x.fillStyle = plankSheen;
      x.fillRect(0, py, W, plankH);
    }
    /* Floor sheen (reflection of lamp) */
    const floorSheen = x.createRadialGradient(W*0.62, H*0.76, 0, W*0.62, H*0.92, W*0.35);
    floorSheen.addColorStop(0, 'rgba(255,190,60,0.12)');
    floorSheen.addColorStop(0.4,'rgba(255,170,40,0.04)');
    floorSheen.addColorStop(1,  'rgba(0,0,0,0)');
    x.fillStyle = floorSheen;
    x.fillRect(0, H * 0.76, W, H * 0.24);

    /* Area rug under the chair */
    x.save();
    x.globalAlpha = 0.6;
    const rugGrad = x.createRadialGradient(W*0.6, H*0.84, 0, W*0.6, H*0.84, W*0.28);
    rugGrad.addColorStop(0,   '#2a1a0e');
    rugGrad.addColorStop(0.7, '#1e1208');
    rugGrad.addColorStop(1,   'rgba(0,0,0,0)');
    x.fillStyle = rugGrad;
    x.beginPath();
    x.ellipse(W*0.6, H*0.86, W*0.28, H*0.09, 0, 0, Math.PI*2);
    x.fill();
    /* Rug border pattern */
    x.strokeStyle = 'rgba(180,130,50,0.15)';
    x.lineWidth = 3;
    x.beginPath();
    x.ellipse(W*0.6, H*0.86, W*0.25, H*0.08, 0, 0, Math.PI*2);
    x.stroke();
    x.restore();

    /* Desk surface */
    const deskGrad = x.createLinearGradient(0, H*0.73, 0, H*0.82);
    deskGrad.addColorStop(0, '#2e2010');
    deskGrad.addColorStop(0.2,'#221808');
    deskGrad.addColorStop(1,  '#0d0a05');
    x.fillStyle = deskGrad;
    x.fillRect(W*0.08, H*0.74, W*0.84, H*0.26);
    /* Desk edge highlight */
    x.fillStyle = 'rgba(200,150,55,0.22)';
    x.fillRect(W*0.08, H*0.74, W*0.84, 3);
    /* Desk wood grain */
    x.strokeStyle = 'rgba(0,0,0,0.15)';
    x.lineWidth = 1;
    for (let g = 0; g < 8; g++) {
      x.beginPath();
      x.moveTo(W*0.08, H*0.74 + g * H*0.012);
      x.lineTo(W*0.92, H*0.74 + g * H*0.012 + H*0.003);
      x.stroke();
    }

    /* Coffee mug on desk */
    const mX = W*0.30, mY = H*0.72;
    x.fillStyle = '#1a1208';
    x.fillRect(mX - 14, mY, 28, 32);
    x.beginPath();
    x.ellipse(mX, mY, 14, 5, 0, 0, Math.PI*2);
    x.fillStyle = '#221808';
    x.fill();
    x.fillStyle = '#2a1c0c';
    x.beginPath();
    x.ellipse(mX, mY + 2, 11, 4, 0, 0, Math.PI*2);
    x.fill();
    /* Mug handle */
    x.strokeStyle = '#1a1208';
    x.lineWidth = 4;
    x.beginPath();
    x.arc(mX + 14, mY + 16, 10, -Math.PI*0.5, Math.PI*0.5);
    x.stroke();
    /* Steam */
    x.strokeStyle = 'rgba(255,255,255,0.06)';
    x.lineWidth = 1.5;
    for (let s = 0; s < 3; s++) {
      x.beginPath();
      x.moveTo(mX - 5 + s*5, mY - 2);
      x.quadraticCurveTo(mX - 10 + s*5, mY - 14, mX - 5 + s*5, mY - 22);
      x.stroke();
    }

    /* Table lamp */
    const lX = W*0.62, lY = H*0.50;
    /* Lamp post */
    x.fillStyle = '#221808';
    x.fillRect(lX - 6, lY + 4, 12, H*0.26);
    /* Lamp base */
    x.fillStyle = '#2a1c0c';
    x.beginPath();
    x.ellipse(lX, lY + H*0.26 + 4, 22, 7, 0, 0, Math.PI*2);
    x.fill();
    /* Base sheen */
    x.fillStyle = 'rgba(200,160,60,0.2)';
    x.beginPath();
    x.ellipse(lX, lY + H*0.26 + 4, 22, 7, 0, -Math.PI*0.5, Math.PI*0.5);
    x.fill();
    /* Shade */
    x.fillStyle = '#2e2010';
    x.beginPath();
    x.moveTo(lX - 52, lY + 4);
    x.lineTo(lX - 24, lY - H*0.115);
    x.lineTo(lX + 24, lY - H*0.115);
    x.lineTo(lX + 52, lY + 4);
    x.fill();
    /* Shade inner highlight (warm) */
    const shadeInner = x.createLinearGradient(lX - 52, lY, lX + 52, lY);
    shadeInner.addColorStop(0,   'rgba(255,200,80,0.08)');
    shadeInner.addColorStop(0.5, 'rgba(255,210,100,0.35)');
    shadeInner.addColorStop(1,   'rgba(255,200,80,0.08)');
    x.fillStyle = shadeInner;
    x.beginPath();
    x.moveTo(lX - 50, lY + 2);
    x.lineTo(lX - 23, lY - H*0.108);
    x.lineTo(lX + 23, lY - H*0.108);
    x.lineTo(lX + 50, lY + 2);
    x.fill();
    /* Shade bottom emission line */
    const shadeLine = x.createLinearGradient(lX - 52, lY, lX + 52, lY);
    shadeLine.addColorStop(0,   'rgba(255,200,80,0)');
    shadeLine.addColorStop(0.5, 'rgba(255,220,100,0.9)');
    shadeLine.addColorStop(1,   'rgba(255,200,80,0)');
    x.fillStyle = shadeLine;
    x.fillRect(lX - 52, lY - 2, 104, 4);
    /* Big warm lamp glow */
    const lg = x.createRadialGradient(lX, lY + 20, 0, lX, lY + 20, W*0.42);
    lg.addColorStop(0,    'rgba(255,200,70,0.40)');
    lg.addColorStop(0.18, 'rgba(255,180,50,0.16)');
    lg.addColorStop(0.45, 'rgba(255,155,30,0.06)');
    lg.addColorStop(1,    'rgba(0,0,0,0)');
    x.fillStyle = lg;
    x.fillRect(0, H * 0.2, W, H * 0.8);

    /* Overall ambient warm tint on lower half */
    const ambient = x.createLinearGradient(0, H*0.4, 0, H);
    ambient.addColorStop(0, 'rgba(255,180,60,0.02)');
    ambient.addColorStop(1, 'rgba(255,140,30,0.06)');
    x.fillStyle = ambient;
    x.fillRect(0, H*0.4, W, H*0.6);

    return new THREE.CanvasTexture(cv);
  }

  function makeManTex_UNUSED_DELETE_ME() { // will be stripped below
    const S = 1024;
    const cv = document.createElement('canvas');
    cv.width = S; cv.height = S;
    const x = cv.getContext('2d');
    x.clearRect(0, 0, S, S);
    const p = v => v * S;

    /* colour palette */
    const SK_BASE = '#B87A4A', SK_LIT  = '#D49A6A', SK_DRK = '#8A5230', SK_DEEP = '#6A3C20';
    const SH_BASE = '#E8E0C8', SH_LIT  = '#F4EDD8', SH_SHD = '#C0B898';
    const TR_BASE = '#262A36', TR_LIT  = '#343848', TR_DRK = '#181C26';
    const CH_BASE = '#180E06', CH_LIT  = '#241408', CH_DRK = '#0C0804';
    const SHOE_B  = '#1E1208', SHOE_L  = '#2C1C0C', SHOE_D = '#0E0A04';

    /* ── 1. LEATHER ARMCHAIR ─────────────────────────────────────── */
    /* Back cushion */
    const chairG = x.createLinearGradient(p(0.13), p(0.28), p(0.87), p(0.76));
    chairG.addColorStop(0,    CH_LIT);
    chairG.addColorStop(0.45, CH_BASE);
    chairG.addColorStop(1,    CH_DRK);
    x.fillStyle = chairG;
    x.beginPath();
    x.moveTo(p(0.13), p(0.33));
    x.lineTo(p(0.13), p(0.74));
    x.quadraticCurveTo(p(0.13), p(0.77), p(0.17), p(0.77));
    x.lineTo(p(0.83), p(0.77));
    x.quadraticCurveTo(p(0.87), p(0.77), p(0.87), p(0.74));
    x.lineTo(p(0.87), p(0.33));
    x.quadraticCurveTo(p(0.87), p(0.29), p(0.83), p(0.29));
    x.lineTo(p(0.17), p(0.29));
    x.quadraticCurveTo(p(0.13), p(0.29), p(0.13), p(0.33));
    x.fill();
    /* Tufting grid */
    x.strokeStyle = 'rgba(0,0,0,0.20)';
    x.lineWidth = 1.5;
    for (let r = 0; r < 4; r++) {
      x.beginPath(); x.moveTo(p(0.14), p(0.33+r*0.118)); x.lineTo(p(0.86), p(0.33+r*0.118)); x.stroke();
    }
    for (let c = 0; c < 5; c++) {
      x.beginPath(); x.moveTo(p(0.21+c*0.158), p(0.29)); x.lineTo(p(0.21+c*0.158), p(0.77)); x.stroke();
    }
    /* Button dimples */
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      x.fillStyle = 'rgba(0,0,0,0.17)';
      x.beginPath();
      x.ellipse(p(0.29+c*0.158), p(0.389+r*0.118), p(0.012), p(0.009), 0, 0, Math.PI*2);
      x.fill();
    }
    /* Armrests */
    [0, 1].forEach(side => {
      const ax = side === 0 ? p(0.06) : p(0.78);
      const aw = p(0.16);
      const aG = x.createLinearGradient(ax, p(0.49), ax+aw, p(0.65));
      aG.addColorStop(0, CH_LIT); aG.addColorStop(1, CH_DRK);
      x.fillStyle = aG;
      x.fillRect(ax, p(0.49), aw, p(0.15));
    });
    /* Chair side panels */
    x.fillStyle = CH_DRK;
    x.fillRect(p(0.11), p(0.29), p(0.05), p(0.64));
    x.fillRect(p(0.84), p(0.29), p(0.05), p(0.64));
    /* Seat cushion */
    const seatG = x.createLinearGradient(p(0.14), p(0.77), p(0.86), p(0.92));
    seatG.addColorStop(0, CH_LIT); seatG.addColorStop(1, CH_DRK);
    x.fillStyle = seatG;
    x.beginPath();
    x.moveTo(p(0.14), p(0.77)); x.lineTo(p(0.14), p(0.90));
    x.quadraticCurveTo(p(0.14), p(0.93), p(0.18), p(0.93));
    x.lineTo(p(0.82), p(0.93));
    x.quadraticCurveTo(p(0.86), p(0.93), p(0.86), p(0.90));
    x.lineTo(p(0.86), p(0.77)); x.fill();
    /* Wooden chair legs */
    x.fillStyle = '#140E04';
    x.fillRect(p(0.16), p(0.90), p(0.055), p(0.10));
    x.fillRect(p(0.785), p(0.90), p(0.055), p(0.10));
    x.fillStyle = 'rgba(200,160,60,0.09)';
    x.fillRect(p(0.165), p(0.90), p(0.014), p(0.10));
    x.fillRect(p(0.790), p(0.90), p(0.014), p(0.10));

    /* ── 2. LEFT SHIRT SLEEVE (forearm going right → newspaper edge) ─ */
    /* The left forearm is roughly horizontal, elbow behind paper,
       hand gripping left edge of newspaper at ≈x=0.25 */
    const slLG = x.createLinearGradient(p(0.04), p(0.30), p(0.27), p(0.52));
    slLG.addColorStop(0, SH_SHD); slLG.addColorStop(0.5, SH_BASE); slLG.addColorStop(1, SH_LIT);
    x.fillStyle = slLG;
    x.beginPath();
    x.moveTo(p(0.27), p(0.28));  /* inner top (disappears behind paper) */
    x.lineTo(p(0.055), p(0.335));
    x.lineTo(p(0.040), p(0.535));
    x.lineTo(p(0.25), p(0.525));
    x.fill();
    /* Sleeve fold lines */
    x.strokeStyle = 'rgba(0,0,0,0.09)'; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(p(0.11), p(0.31)); x.lineTo(p(0.105), p(0.53)); x.stroke();
    x.beginPath(); x.moveTo(p(0.185), p(0.295)); x.lineTo(p(0.180), p(0.525)); x.stroke();
    /* Cuff */
    x.fillStyle = SH_SHD;
    x.fillRect(p(0.030), p(0.335), p(0.030), p(0.200));
    x.strokeStyle = 'rgba(0,0,0,0.11)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(p(0.030), p(0.400)); x.lineTo(p(0.062), p(0.400)); x.stroke();
    x.beginPath(); x.moveTo(p(0.030), p(0.460)); x.lineTo(p(0.062), p(0.460)); x.stroke();

    /* ── 3. RIGHT SHIRT SLEEVE ──────────────────────────────────────── */
    const slRG = x.createLinearGradient(p(0.73), p(0.30), p(0.96), p(0.52));
    slRG.addColorStop(0, SH_LIT); slRG.addColorStop(0.5, SH_BASE); slRG.addColorStop(1, SH_SHD);
    x.fillStyle = slRG;
    x.beginPath();
    x.moveTo(p(0.73), p(0.28));
    x.lineTo(p(0.945), p(0.335));
    x.lineTo(p(0.960), p(0.535));
    x.lineTo(p(0.75), p(0.525));
    x.fill();
    x.strokeStyle = 'rgba(0,0,0,0.09)'; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(p(0.815), p(0.295)); x.lineTo(p(0.820), p(0.525)); x.stroke();
    x.beginPath(); x.moveTo(p(0.890), p(0.31)); x.lineTo(p(0.895), p(0.53)); x.stroke();
    x.fillStyle = SH_SHD;
    x.fillRect(p(0.938), p(0.335), p(0.030), p(0.200));
    x.strokeStyle = 'rgba(0,0,0,0.11)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(p(0.938), p(0.400)); x.lineTo(p(0.970), p(0.400)); x.stroke();
    x.beginPath(); x.moveTo(p(0.938), p(0.460)); x.lineTo(p(0.970), p(0.460)); x.stroke();

    /* ── 4. REALISTIC HANDS ─────────────────────────────────────────── */
    /* We see the BACKS of both hands gripping the newspaper edges.
       Knuckles face the viewer, fingers curl over the paper edge. */
    function drawBackOfHand(cx, cy, sc, flipX) {
      x.save();
      x.translate(cx, cy);
      if (flipX) x.scale(-1, 1);

      /* Palm / back of hand – ovoid shape wider at knuckles */
      const palmG = x.createLinearGradient(-sc*18, -sc*10, sc*16, sc*22);
      palmG.addColorStop(0, SK_DRK);
      palmG.addColorStop(0.38, SK_BASE);
      palmG.addColorStop(0.65, SK_LIT);
      palmG.addColorStop(1, SK_DRK);
      x.fillStyle = palmG;
      x.beginPath();
      x.moveTo(-sc*16, -sc*8);
      x.quadraticCurveTo(-sc*19, sc*2, -sc*15, sc*20);
      x.quadraticCurveTo(-sc*8, sc*26, sc*0, sc*24);
      x.quadraticCurveTo(sc*8, sc*26, sc*15, sc*20);
      x.quadraticCurveTo(sc*19, sc*2, sc*16, -sc*8);
      x.quadraticCurveTo(sc*8, -sc*14, sc*0, -sc*14);
      x.quadraticCurveTo(-sc*8, -sc*14, -sc*16, -sc*8);
      x.fill();

      /* Knuckle ridge highlights */
      const knkX = [-sc*10.5, -sc*3.2, sc*4.0, sc*10.8];
      knkX.forEach(kx => {
        const kg = x.createRadialGradient(kx, -sc*11, 0, kx, -sc*11, sc*5.5);
        kg.addColorStop(0, SK_LIT); kg.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = kg;
        x.beginPath();
        x.ellipse(kx, -sc*11, sc*4.5, sc*3.2, 0, 0, Math.PI*2); x.fill();
      });

      /* Knuckle crease lines */
      x.strokeStyle = SK_DEEP; x.lineWidth = sc*0.18;
      knkX.forEach(kx => {
        x.beginPath();
        x.moveTo(kx-sc*3.2, -sc*7.5);
        x.quadraticCurveTo(kx, -sc*10.5, kx+sc*3.2, -sc*7.5);
        x.stroke();
      });

      /* Tendon lines (back of hand toward wrist) */
      x.strokeStyle = `rgba(107,59,28,0.22)`; x.lineWidth = sc*0.13;
      [[-sc*10,-sc*7,-sc*12,sc*9],[-sc*3,-sc*8,-sc*4,sc*9],
       [sc*4,-sc*8,sc*5,sc*9],[sc*11,-sc*7,sc*13,sc*9]].forEach(([x1,y1,x2,y2])=>{
        x.beginPath(); x.moveTo(x1,y1); x.lineTo(x2,y2); x.stroke();
      });

      /* Subtle vein (dorsal) */
      x.strokeStyle = 'rgba(70,100,55,0.14)'; x.lineWidth = sc*0.11;
      x.beginPath(); x.moveTo(-sc*3,sc*6); x.quadraticCurveTo(-sc*5,-sc*4,-sc*4,-sc*12); x.stroke();
      x.beginPath(); x.moveTo(sc*5,sc*6); x.quadraticCurveTo(sc*7,-sc*2,sc*8,-sc*10); x.stroke();

      /* 4 fingers – back view, slightly tapered, fingernail on top */
      const fCfg = [
        {tx:-sc*11,ty:-sc*19,w:sc*6.2,h:sc*17,a:0.09},
        {tx:-sc*3.5,ty:-sc*22,w:sc*6.6,h:sc*19,a:0.02},
        {tx:sc*4,  ty:-sc*21,w:sc*6.2,h:sc*18,a:-0.04},
        {tx:sc*11, ty:-sc*17,w:sc*5.0,h:sc*14,a:-0.13},
      ];
      fCfg.forEach(fc => {
        x.save();
        x.translate(fc.tx, fc.ty); x.rotate(fc.a);
        const hw = fc.w/2, hh = fc.h/2;
        /* Finger body */
        const fg = x.createLinearGradient(-hw, 0, hw, 0);
        fg.addColorStop(0, SK_DRK); fg.addColorStop(0.4, SK_BASE);
        fg.addColorStop(0.7, SK_LIT); fg.addColorStop(1, SK_DRK);
        x.fillStyle = fg;
        x.beginPath();
        x.moveTo(-hw, hh);
        x.lineTo(-hw, -hh*0.45);
        x.quadraticCurveTo(-hw*0.8, -hh, 0, -hh);
        x.quadraticCurveTo(hw*0.8, -hh, hw, -hh*0.45);
        x.lineTo(hw, hh); x.fill();
        /* Mid-knuckle crease */
        x.strokeStyle = SK_DRK; x.lineWidth = sc*0.14;
        x.beginPath(); x.moveTo(-hw+sc*0.5,-hh*0.1); x.lineTo(hw-sc*0.5,-hh*0.1); x.stroke();
        /* Fingernail */
        x.fillStyle = 'rgba(215,185,148,0.62)';
        x.beginPath(); x.ellipse(0,-hh*0.70,fc.w*0.28,fc.h*0.22,0,0,Math.PI*2); x.fill();
        x.fillStyle = 'rgba(255,245,225,0.28)';
        x.beginPath(); x.ellipse(-fc.w*0.08,-hh*0.77,fc.w*0.12,fc.h*0.08,0,0,Math.PI*2); x.fill();
        x.restore();
      });

      /* Thumb – on inner side, angled upward */
      x.save();
      x.translate(-sc*20, sc*6); x.rotate(-0.38);
      const tg = x.createLinearGradient(-sc*5.5,0,sc*5.5,0);
      tg.addColorStop(0,SK_DRK); tg.addColorStop(0.5,SK_LIT); tg.addColorStop(1,SK_DRK);
      x.fillStyle = tg;
      x.beginPath(); x.ellipse(0,0,sc*5.5,sc*15,0,0,Math.PI*2); x.fill();
      x.strokeStyle = SK_DRK; x.lineWidth = sc*0.14;
      x.beginPath(); x.moveTo(-sc*4.5,-sc*1.5); x.lineTo(sc*4.5,-sc*1.5); x.stroke();
      x.fillStyle = 'rgba(215,185,148,0.58)';
      x.beginPath(); x.ellipse(0,-sc*10,sc*3.2,sc*4.5,0,0,Math.PI*2); x.fill();
      x.restore();

      /* Warm lamp highlight on knuckles */
      const lh = x.createRadialGradient(0,-sc*11,0,0,-sc*4,sc*22);
      lh.addColorStop(0,'rgba(255,200,100,0.22)');
      lh.addColorStop(0.55,'rgba(255,175,55,0.06)');
      lh.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle = lh; x.fillRect(-sc*28,-sc*28,sc*56,sc*60);

      x.restore();
    }

    /* Left hand – natural orientation (back faces viewer) */
    drawBackOfHand(p(0.103), p(0.430), 13.5, false);
    /* Right hand – mirrored */
    drawBackOfHand(p(0.897), p(0.430), 13.5, true);

    /* ── 5. TROUSER LEGS ─────────────────────────────────────────── */
    /* Left leg */
    const trlG = x.createLinearGradient(p(0.22), p(0.61), p(0.46), p(0.92));
    trlG.addColorStop(0, TR_LIT); trlG.addColorStop(0.5, TR_BASE); trlG.addColorStop(1, TR_DRK);
    x.fillStyle = trlG;
    x.beginPath();
    x.moveTo(p(0.23), p(0.62)); x.lineTo(p(0.22), p(0.91));
    x.lineTo(p(0.46), p(0.91)); x.lineTo(p(0.46), p(0.62)); x.fill();
    /* Centre crease */
    x.strokeStyle = 'rgba(255,255,255,0.055)'; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(p(0.345),p(0.62)); x.lineTo(p(0.342),p(0.91)); x.stroke();
    /* Fabric folds */
    x.fillStyle = 'rgba(0,0,0,0.13)';
    x.fillRect(p(0.22), p(0.72), p(0.24), p(0.028));
    x.fillRect(p(0.22), p(0.82), p(0.24), p(0.022));
    /* Trouser cuff */
    x.fillStyle = TR_DRK; x.fillRect(p(0.22), p(0.895), p(0.24), p(0.020));
    x.fillStyle = 'rgba(255,255,255,0.048)'; x.fillRect(p(0.22), p(0.895), p(0.24), p(0.007));

    /* Right leg */
    const trrG = x.createLinearGradient(p(0.54), p(0.61), p(0.78), p(0.92));
    trrG.addColorStop(0, TR_LIT); trrG.addColorStop(0.5, TR_BASE); trrG.addColorStop(1, TR_DRK);
    x.fillStyle = trrG;
    x.beginPath();
    x.moveTo(p(0.54), p(0.62)); x.lineTo(p(0.54), p(0.91));
    x.lineTo(p(0.78), p(0.91)); x.lineTo(p(0.77), p(0.62)); x.fill();
    x.strokeStyle = 'rgba(255,255,255,0.055)'; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(p(0.658),p(0.62)); x.lineTo(p(0.660),p(0.91)); x.stroke();
    x.fillStyle = 'rgba(0,0,0,0.13)';
    x.fillRect(p(0.54), p(0.72), p(0.24), p(0.028));
    x.fillRect(p(0.54), p(0.82), p(0.24), p(0.022));
    x.fillStyle = TR_DRK; x.fillRect(p(0.54), p(0.895), p(0.24), p(0.020));
    x.fillStyle = 'rgba(255,255,255,0.048)'; x.fillRect(p(0.54), p(0.895), p(0.24), p(0.007));

    /* Gap between legs (seat shadow) */
    x.fillStyle = 'rgba(10,8,16,0.60)';
    x.fillRect(p(0.46), p(0.64), p(0.08), p(0.27));

    /* ── 6. OXFORD LEATHER SHOES ─────────────────────────────────── */
    /* Left shoe */
    const shLG = x.createLinearGradient(p(0.10), p(0.905), p(0.48), p(0.998));
    shLG.addColorStop(0, SHOE_L); shLG.addColorStop(0.55, SHOE_B); shLG.addColorStop(1, SHOE_D);
    x.fillStyle = shLG;
    x.beginPath();
    x.moveTo(p(0.22), p(0.910));
    x.lineTo(p(0.165), p(0.910));
    x.quadraticCurveTo(p(0.095), p(0.912), p(0.088), p(0.940));
    x.quadraticCurveTo(p(0.082), p(0.970), p(0.135), p(0.980));
    x.lineTo(p(0.470), p(0.980));
    x.quadraticCurveTo(p(0.505), p(0.978), p(0.504), p(0.952));
    x.lineTo(p(0.470), p(0.910)); x.fill();
    /* Leather shine */
    const shineL = x.createRadialGradient(p(0.215),p(0.920),0,p(0.215),p(0.920),p(0.10));
    shineL.addColorStop(0,'rgba(255,215,110,0.20)');
    shineL.addColorStop(0.5,'rgba(200,160,60,0.06)');
    shineL.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle = shineL;
    x.beginPath(); x.ellipse(p(0.245),p(0.924),p(0.088),p(0.018),0,0,Math.PI*2); x.fill();
    /* Lace detail */
    x.strokeStyle = 'rgba(160,120,50,0.16)'; x.lineWidth = 1;
    for (let i=0;i<4;i++){
      x.beginPath(); x.moveTo(p(0.245+i*0.040),p(0.913)); x.lineTo(p(0.265+i*0.040),p(0.928)); x.stroke();
    }
    /* Sole */
    x.fillStyle = SHOE_D;
    x.beginPath();
    x.moveTo(p(0.082),p(0.972)); x.lineTo(p(0.075),p(0.980));
    x.quadraticCurveTo(p(0.075),p(1.000),p(0.130),p(1.000));
    x.lineTo(p(0.480),p(1.000));
    x.quadraticCurveTo(p(0.512),p(1.000),p(0.512),p(0.978));
    x.lineTo(p(0.504),p(0.972)); x.fill();

    /* Right shoe */
    const shRG = x.createLinearGradient(p(0.52), p(0.905), p(0.90), p(0.998));
    shRG.addColorStop(0, SHOE_L); shRG.addColorStop(0.55, SHOE_B); shRG.addColorStop(1, SHOE_D);
    x.fillStyle = shRG;
    x.beginPath();
    x.moveTo(p(0.530),p(0.910));
    x.lineTo(p(0.496),p(0.952));
    x.quadraticCurveTo(p(0.495),p(0.978),p(0.530),p(0.980));
    x.lineTo(p(0.865),p(0.980));
    x.quadraticCurveTo(p(0.918),p(0.970),p(0.912),p(0.940));
    x.quadraticCurveTo(p(0.905),p(0.912),p(0.835),p(0.910)); x.fill();
    const shineR = x.createRadialGradient(p(0.695),p(0.920),0,p(0.695),p(0.920),p(0.10));
    shineR.addColorStop(0,'rgba(255,215,110,0.20)');
    shineR.addColorStop(0.5,'rgba(200,160,60,0.06)');
    shineR.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle = shineR;
    x.beginPath(); x.ellipse(p(0.710),p(0.924),p(0.088),p(0.018),0,0,Math.PI*2); x.fill();
    x.strokeStyle = 'rgba(160,120,50,0.16)'; x.lineWidth = 1;
    for (let i=0;i<4;i++){
      x.beginPath(); x.moveTo(p(0.610+i*0.040),p(0.913)); x.lineTo(p(0.630+i*0.040),p(0.928)); x.stroke();
    }
    x.fillStyle = SHOE_D;
    x.beginPath();
    x.moveTo(p(0.488),p(0.972)); x.lineTo(p(0.488),p(0.978));
    x.quadraticCurveTo(p(0.488),p(1.000),p(0.520),p(1.000));
    x.lineTo(p(0.870),p(1.000));
    x.quadraticCurveTo(p(0.925),p(1.000),p(0.925),p(0.978));
    x.lineTo(p(0.912),p(0.972)); x.fill();

    /* ── 7. LIGHTING PASS ────────────────────────────────────────── */
    /* Warm lamp glow from table lamp (right side of scene) */
    const lampG = x.createRadialGradient(p(0.90), p(0.64), 0, p(0.90), p(0.64), p(0.70));
    lampG.addColorStop(0,   'rgba(255,200,80,0.20)');
    lampG.addColorStop(0.38,'rgba(255,175,55,0.07)');
    lampG.addColorStop(0.7, 'rgba(255,155,30,0.02)');
    lampG.addColorStop(1,   'rgba(0,0,0,0)');
    x.fillStyle = lampG; x.fillRect(0, 0, S, S);

    /* Window rim light (upper-right edge) */
    const rimG = x.createLinearGradient(p(0.62), 0, p(1.00), p(0.55));
    rimG.addColorStop(0, 'rgba(0,0,0,0)');
    rimG.addColorStop(1, 'rgba(220,170,70,0.11)');
    x.fillStyle = rimG; x.fillRect(0, 0, S, S);

    /* Seat ambient-occlusion band */
    const aoG = x.createLinearGradient(0, p(0.60), 0, p(0.74));
    aoG.addColorStop(0,   'rgba(0,0,0,0)');
    aoG.addColorStop(0.5, 'rgba(0,0,0,0.20)');
    aoG.addColorStop(1,   'rgba(0,0,0,0)');
    x.fillStyle = aoG; x.fillRect(0, p(0.60), S, p(0.15));

    /* Ground shadow under shoes */
    const gShadow = x.createRadialGradient(p(0.50),p(0.998),0,p(0.50),p(0.998),p(0.38));
    gShadow.addColorStop(0,   'rgba(0,0,0,0.55)');
    gShadow.addColorStop(0.5, 'rgba(0,0,0,0.18)');
    gShadow.addColorStop(1,   'rgba(0,0,0,0)');
    x.fillStyle = gShadow;
    x.beginPath(); x.ellipse(p(0.50),p(0.999),p(0.36),p(0.016),0,0,Math.PI*2); x.fill();

    return new THREE.CanvasTexture(cv);
  }

  /* ══════════════════════════════════════════════════════════════════
     NEWSPAPER TEXTURE
  ══════════════════════════════════════════════════════════════════ */
  function makeNewspaper(hi) {
    const W = hi ? 2048 : 768, H = hi ? 1400 : 528;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const x = cv.getContext('2d');

    /* Aged paper */
    const paper = x.createLinearGradient(0, 0, W, H);
    paper.addColorStop(0,   '#f4eed8');
    paper.addColorStop(0.5, '#ede5cc');
    paper.addColorStop(1,   '#e5dbbe');
    x.fillStyle = paper;
    x.fillRect(0, 0, W, H);

    /* Paper noise */
    for (let i = 0; i < 500; i++) {
      const dark = Math.random() > 0.5;
      x.fillStyle = `rgba(${dark?0:255},${dark?0:255},${dark?0:255},${Math.random()*0.02})`;
      x.fillRect(Math.random()*W, Math.random()*H, 2, 2);
    }
    /* Edge yellowing */
    const edgeY = x.createLinearGradient(0, 0, 0, H);
    edgeY.addColorStop(0,   'rgba(160,120,40,0.12)');
    edgeY.addColorStop(0.1, 'rgba(0,0,0,0)');
    edgeY.addColorStop(0.9, 'rgba(0,0,0,0)');
    edgeY.addColorStop(1,   'rgba(140,100,30,0.18)');
    x.fillStyle = edgeY;
    x.fillRect(0, 0, W, H);
    const edgeX = x.createLinearGradient(0, 0, W, 0);
    edgeX.addColorStop(0,   'rgba(130,90,25,0.14)');
    edgeX.addColorStop(0.06, 'rgba(0,0,0,0)');
    edgeX.addColorStop(0.94, 'rgba(0,0,0,0)');
    edgeX.addColorStop(1,   'rgba(130,90,25,0.14)');
    x.fillStyle = edgeX;
    x.fillRect(0, 0, W, H);

    /* Center fold */
    const fold = x.createLinearGradient(W/2-7, 0, W/2+7, 0);
    fold.addColorStop(0,   'rgba(0,0,0,0.03)');
    fold.addColorStop(0.5, 'rgba(0,0,0,0.16)');
    fold.addColorStop(1,   'rgba(0,0,0,0.03)');
    x.fillStyle = fold;
    x.fillRect(W/2-7, 0, 14, H);
    /* Fold crease highlight */
    x.fillStyle = 'rgba(255,255,255,0.08)';
    x.fillRect(W/2-1, 0, 2, H);

    /* Left curl shadow */
    const curl = x.createLinearGradient(0, 0, W*0.05, 0);
    curl.addColorStop(0, 'rgba(0,0,0,0.18)'); curl.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = curl; x.fillRect(0, 0, W*0.05, H);

    /* ── Masthead ── */
    const mhS = hi ? 54 : 20;
    x.fillStyle = '#060606';
    x.font = `900 ${mhS}px "Times New Roman", Georgia, serif`;
    x.textAlign = 'center';
    x.fillText('THE POLTU REFORM TIMES', W/2, H*0.052);
    /* Masthead ornament lines */
    x.fillStyle = '#060606';
    x.fillRect(W*0.04, H*0.068, W*0.92, hi?3:1.5);
    x.fillRect(W*0.04, H*0.076, W*0.92, hi?1:0.6);
    if (hi) {
      x.fillStyle = '#444';
      x.font = '18px Georgia, serif';
      x.fillText('FOUNDED 2025  ·  NEW DELHI  ·  SATURDAY, JUNE 28, 2025  ·  PRICE ₹5.00', W/2, H*0.098);
      x.fillStyle = '#060606';
      x.fillRect(W*0.04, H*0.108, W*0.92, 1.5);
    }

    /* ── Main headline ── */
    const hlS = hi ? 70 : 26;
    x.fillStyle = '#040404';
    x.font = `900 ${hlS}px "Times New Roman", Georgia, serif`;
    x.textAlign = 'left';
    const hlY = H*(hi?0.160:0.155);
    x.fillText('DEMOCRACY', W*0.04, hlY);
    x.fillText('REIMAGINED', W*0.04, hlY+(hi?82:31));
    x.fillStyle = '#1a1a1a';
    x.font = `italic ${hi?23:9}px Georgia, serif`;
    x.fillText(
      hi ? 'New civic platform offers free, transparent elections for every Indian citizen'
         : 'New platform promises free elections for every Indian',
      W*0.04, hlY+(hi?132:48)
    );
    if (hi) {
      x.fillStyle = '#666';
      x.font = '17px Georgia, serif';
      x.fillText('By Our Political Correspondent  ·  Published 06:00 IST', W*0.04, hlY+162);
    }

    /* Rule below headline */
    x.fillStyle = '#aaa';
    x.fillRect(W*0.04, H*(hi?0.308:0.300), W*0.92, hi?1.5:1);

    /* ── Photo block (hi only) ── */
    if (hi) {
      const pX=W*0.52, pY=H*0.140, pW=W*0.44, pH=H*0.160;
      const phG = x.createLinearGradient(pX,pY,pX+pW,pY+pH);
      phG.addColorStop(0,'#b8b0a0'); phG.addColorStop(0.5,'#a8a090'); phG.addColorStop(1,'#989080');
      x.fillStyle = phG; x.fillRect(pX,pY,pW,pH);
      x.fillStyle = 'rgba(0,0,0,0.28)';
      for (let p=0;p<24;p++) {
        x.beginPath();
        x.ellipse(pX+(p/24)*pW+12, pY+pH*0.60+Math.sin(p*1.2)*13, 10,26,0,0,Math.PI*2);
        x.fill();
      }
      x.strokeStyle='#888'; x.lineWidth=2; x.strokeRect(pX,pY,pW,pH);
      x.fillStyle='#444'; x.font='italic 16px Georgia, serif'; x.textAlign='left';
      x.fillText('Citizens at a PoltuReform registration event, Mumbai. | Photograph: Staff', pX, pY+pH+20);
    }

    /* ── 3-column body ── */
    const c3W = (W*0.92)/3, cS=H*(hi?0.318:0.310), cE=H*0.635, lh=hi?27:10, fs=hi?17:6.5;
    x.fillStyle='#ccc';
    for(let i=1;i<3;i++) x.fillRect(W*0.04+i*c3W, cS, 1, cE-cS);
    const body=[
      'PoltuReform, a new civic technology platform, has announced plans to democratise Indian elections by enabling any eligible citizen to contest for public office with a refundable deposit of ₹5,000 — far below the crore-level costs that have historically excluded ordinary people from politics.',
      'The platform, with over 22 app screens fully mapped, offers transparent fund tracking with a donor-voting mechanism requiring 50% donor approval before any campaign funds are released. Every approved expenditure must be documented with a bill or receipt.',
      'Unlike traditional campaign structures where funds flow through opaque channels, PoltuReform places every rupee under public scrutiny. Donors receive voting rights on expenditure proposals, and candidates must submit bills as proof of spend.',
      'The beta launch is planned across five major cities: Mumbai, Delhi, Bangalore, Chennai, and Hyderabad. The platform has already established partnerships with IIT software development clubs to accelerate engineering and community adoption.',
      'Three distinct user roles are supported: Citizens who browse, fund, and vote; Candidates who register and raise funds transparently; and Influencers who direct their audiences toward ideologically aligned candidates.',
      'Print media forms another pillar of the vision, with 10–20% of all donations earmarked for free Poltu Print newspapers distributed city-wide, guaranteeing equal column space to every candidate regardless of wealth or party backing.',
    ].join(' ').split(' ');
    let wi=0;
    for(let col=0;col<3;col++){
      const cx=W*0.04+col*c3W+(hi?15:5), cmW=c3W-(hi?30:10);
      x.fillStyle='#111'; x.font=`${fs}px Georgia, serif`; x.textAlign='left';
      let y=cS+lh;
      while(y<cE-lh&&wi<body.length){
        let line='';
        while(wi<body.length){const t=line+(line?' ':'')+body[wi];if(x.measureText(t).width>cmW)break;line=t;wi++;}
        if(line){x.fillText(line,cx,y);y+=lh;}else{wi++;y+=lh;}
      }
    }

    /* ── Second story ── */
    const s2Y=H*0.660;
    x.fillStyle='#666'; x.fillRect(W*0.04, s2Y-(hi?4:2), W*0.92, hi?2:1);
    x.fillStyle='#040404'; x.font=`bold ${hi?35:13}px "Times New Roman", Georgia, serif`; x.textAlign='left';
    x.fillText('5-CITY BETA LAUNCH CONFIRMED FOR 2025', W*0.04, s2Y+(hi?35:13));
    x.fillStyle='#333'; x.font=`italic ${hi?20:8}px Georgia, serif`;
    x.fillText(hi?'Mumbai, Delhi, Bangalore, Chennai & Hyderabad selected for pilot phase':'Five cities selected for pilot', W*0.04, s2Y+(hi?66:24));
    x.fillStyle='#ccc'; x.fillRect(W*0.04, s2Y+(hi?76:28), W*0.92, 1);
    const c4W=(W*0.92)/4, c4S=s2Y+(hi?88:32), c4E=H*0.965, lh2=hi?24:9, fs2=hi?16:6;
    x.fillStyle='#ccc';
    for(let i=1;i<4;i++) x.fillRect(W*0.04+i*c4W, c4S, 1, c4E-c4S);
    const s2=['Platform confirms beta across five major Indian cities. Each pilot tests candidate registration, escrow donations, and the live constituency feed for early registered users. IIT software clubs nationwide have pledged engineering support. The campus partnership initiative sets PoltuReform apart from past civic tech efforts in India. The influencer model is another first. Creators with verified audiences can endorse aligned candidates. Every endorsement and donation generated is publicly logged, creating a transparent trail from creator to campaign fund to approved expense. Democracy, the founders say, should cost nothing but your idea.'].join(' ').split(' ');
    let s2wi=0;
    for(let col=0;col<4;col++){
      const cx=W*0.04+col*c4W+(hi?13:5), cmW=c4W-(hi?26:10);
      x.fillStyle='#111'; x.font=`${fs2}px Georgia, serif`; x.textAlign='left';
      let y=c4S+lh2;
      while(y<c4E-lh2&&s2wi<s2.length){
        let line='';
        while(s2wi<s2.length){const t=line+(line?' ':'')+s2[s2wi];if(x.measureText(t).width>cmW)break;line=t;s2wi++;}
        if(line){x.fillText(line,cx,y);y+=lh2;}else{s2wi++;y+=lh2;}
      }
    }

    return new THREE.CanvasTexture(cv);
  }

  /* ── Build Textures ────────────────────────────────────────────── */
  const roomTex = makeRoomTex();
  const paperLo = makeNewspaper(false);
  const paperHi = makeNewspaper(true);

  /* ── Scene Meshes ──────────────────────────────────────────────── */
  // Room – full backdrop
  const bgMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 12.5),
    new THREE.MeshBasicMaterial({ map: roomTex })
  );
  bgMesh.position.z = -7;
  scene.add(bgMesh);

  /* ── Folded Floating Newspaper ─────────────────────────────────── */
  /* Two PlaneGeometry panels share a fold edge at x=0 in group-space.
     Each panel shows half the newspaper texture via UV remapping.
     A fold-shadow strip sits at the spine for the crease illusion. */
  function makePanelGeo(isRight) {
    const geo = new THREE.PlaneGeometry(1.45, 2.2);
    // Shift so the fold edge (inner edge) is at local x=0
    geo.translate(isRight ? 0.725 : -0.725, 0, 0);
    // Remap UV x so each panel shows only its half of the texture
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      const u = uv.getX(i);
      uv.setX(i, isRight ? 0.5 + u * 0.5 : u * 0.5);
    }
    uv.needsUpdate = true;
    return geo;
  }

  // Lo-res panels (always rendered)
  const leftLoMesh  = new THREE.Mesh(makePanelGeo(false), new THREE.MeshBasicMaterial({ map: paperLo }));
  const rightLoMesh = new THREE.Mesh(makePanelGeo(true),  new THREE.MeshBasicMaterial({ map: paperLo }));

  // Hi-res panels (fade in as camera zooms close)
  const leftHiMat  = new THREE.MeshBasicMaterial({ map: paperHi, transparent: true, opacity: 0 });
  const rightHiMat = new THREE.MeshBasicMaterial({ map: paperHi, transparent: true, opacity: 0 });
  const leftHiMesh  = new THREE.Mesh(makePanelGeo(false), leftHiMat);
  const rightHiMesh = new THREE.Mesh(makePanelGeo(true),  rightHiMat);

  // (spine shadow and curl shadows removed — newspaper is flat)

  // Opening fold angle (radians). 0 = flat, ~0.4 = nicely open newspaper V
  const FOLD_ANGLE = 0.0;

  function applyFold(angle) {
    leftLoMesh.rotation.y  = -angle;
    rightLoMesh.rotation.y = +angle;
    leftHiMesh.rotation.y  = -angle;
    rightHiMesh.rotation.y = +angle;
  }
  applyFold(FOLD_ANGLE);

  const paperGroup = new THREE.Group();
  paperGroup.add(leftLoMesh, rightLoMesh, leftHiMesh, rightHiMesh);
  paperGroup.position.set(-1.4, 0.05, -2.1);
  scene.add(paperGroup);

  /* ── Lamp flicker glow ─────────────────────────────────────────── */
  // Warm radial gradient drawn once; opacity animated each frame
  (function () {
    const s = 256;
    const fc = document.createElement('canvas');
    fc.width = fc.height = s;
    const fg = fc.getContext('2d');
    const rg = fg.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
    rg.addColorStop(0,    'rgba(255,230,110,1.0)');
    rg.addColorStop(0.12, 'rgba(255,210,80,0.80)');
    rg.addColorStop(0.38, 'rgba(255,175,45,0.30)');
    rg.addColorStop(0.70, 'rgba(255,145,20,0.08)');
    rg.addColorStop(1,    'rgba(255,130,10,0)');
    fg.fillStyle = rg;
    fg.fillRect(0, 0, s, s);
    window._lampGlowMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(fc),
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  })();
  const lampGlowMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 4.0),
    window._lampGlowMat
  );
  // Lamp sits at UV (0.62, 0.50) on the 22×12.5 bg plane → world (2.64, 0.5, -6.5)
  lampGlowMesh.position.set(2.64, 0.5, -6.5);
  scene.add(lampGlowMesh);

  /* ── Shadow hand (silhouette waving from outside the window) ───── */
  (function () {
    const CW = 220, CH = 500;
    const hcv = document.createElement('canvas');
    hcv.width = CW; hcv.height = CH;
    const g = hcv.getContext('2d');

    // Soft blur makes it read as shadow through glass
    g.filter = 'blur(2.5px)';
    g.fillStyle = 'rgba(0,0,0,0.92)';

    // Rounded finger pill — flat base merges into palm
    function finger(cx, tipY, baseY, hw) {
      g.beginPath();
      g.moveTo(cx - hw, baseY);
      g.lineTo(cx - hw, tipY + hw);
      g.arcTo(cx - hw, tipY, cx,      tipY, hw);
      g.arcTo(cx + hw, tipY, cx + hw, tipY + hw, hw);
      g.lineTo(cx + hw, baseY);
      g.closePath();
      g.fill();
    }

    // Palm — trapezoid, wide at knuckles, narrower at wrist
    g.beginPath();
    g.moveTo(38,  462);
    g.lineTo(180, 462);
    g.lineTo(190, 288);
    g.lineTo(30,  288);
    g.closePath();
    g.fill();

    // Index, Middle (tallest), Ring, Pinky
    finger(50,  102, 292, 18);
    finger(88,   60, 292, 18);
    finger(126,  95, 292, 18);
    finger(163, 150, 292, 15);

    // Thumb — rotated leftward from palm edge
    g.save();
    g.translate(36, 375);
    g.rotate(-0.58);
    finger(0, -92, 68, 17);
    g.restore();

    // Wrist stub at very bottom
    g.beginPath();
    g.rect(50, 455, 120, 42);
    g.fill();

    const handTex = new THREE.CanvasTexture(hcv);

    // Shift geometry up so the wrist (bottom edge) is the rotation pivot
    const handGeo = new THREE.PlaneGeometry(1.9, 3.7);
    handGeo.translate(0, 1.85, 0);

    window._shadowHand = new THREE.Mesh(
      handGeo,
      new THREE.MeshBasicMaterial({
        map: handTex,
        transparent: true,
        alphaTest: 0.04,
        opacity: 0.90,
        depthWrite: false,
      })
    );
    // Wrist at bottom of window, center-right — window world x:3.5→10.1, y:-2.1→6.0
    window._shadowHand.position.set(7.0, -1.5, -6.65);
    scene.add(window._shadowHand);
  })();

  /* ── CSS Overlays ──────────────────────────────────────────────── */
  const vig = document.createElement('div');
  Object.assign(vig.style, {
    position: 'fixed', inset: '0',
    background: 'radial-gradient(ellipse 90% 80% at 62% 45%, transparent 40%, rgba(0,0,0,0.55) 100%)',
    zIndex: '-9', pointerEvents: 'none'
  });
  document.body.append(vig);

  /* Left-side overlay keeps hero text readable over the lit room */
  const leftDark = document.createElement('div');
  Object.assign(leftDark.style, {
    position: 'fixed', inset: '0',
    background: 'linear-gradient(to right, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.30) 40%, rgba(0,0,0,0) 68%)',
    zIndex: '-9', pointerEvents: 'none'
  });
  document.body.append(leftDark);

  const grainCV = document.createElement('canvas');
  grainCV.width = 256; grainCV.height = 256;
  Object.assign(grainCV.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    zIndex: '-9', pointerEvents: 'none', opacity: '0.036', mixBlendMode: 'overlay'
  });
  document.body.append(grainCV);

  let grainTimer = 0;
  function updateGrain() {
    const g = grainCV.getContext('2d');
    const d = g.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      d.data[i] = d.data[i+1] = d.data[i+2] = v; d.data[i+3] = 255;
    }
    g.putImageData(d, 0, 0);
  }

  /* ── Scroll-driven Camera ──────────────────────────────────────── */
  const WIDE  = { x: -0.2, y: 0.05, z: 5,    fov: 52 };
  const CLOSE = { x: -1.4, y: 0.10, z: 0.18, fov: 22 };

  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  // Frame-rate independent exponential decay factor
  // alpha same convergence speed at any fps: 60, 120, 144…
  function expDecay(k, dt) { return 1 - Math.exp(-k * dt); }

  const cam = { ...WIDE };
  const tgt = { ...WIDE };

  // Raw scroll target (updated on scroll events)
  let rawScrollT   = 0;
  // Smoothed scroll used for everything (updated every frame)
  let smoothScrollT = 0;

  // Pre-allocate — never create objects inside the render loop
  const lookAtVec = new THREE.Vector3(-1.4, 0.05, -2.1); // centred on floating newspaper

  let heroEl  = null;
  let heroH   = window.innerHeight;

  function cacheHero() {
    heroEl = document.querySelector('.hero');
    heroH  = heroEl ? heroEl.offsetHeight : window.innerHeight;
  }
  cacheHero();

  function onScroll() {
    rawScrollT = Math.min(Math.max(window.scrollY / heroH, 0), 1);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Render Loop ───────────────────────────────────────────────── */
  let lastTs = 0;
  function loop(ts) {
    requestAnimationFrame(loop);

    // dt capped so a tab-switch doesn't cause a huge jump
    const dt = Math.min((ts - lastTs) * 0.001, 0.05);
    lastTs = ts;

    // 1. Smooth the raw scroll value — feels like inertial scroll
    //    k=9 → settles in ~0.5 s, works identically at 60/120/144 Hz
    smoothScrollT = lerp(smoothScrollT, rawScrollT, expDecay(9, dt));

    // 2. Map smoothed scroll → camera target
    const t  = ease(smoothScrollT);
    tgt.x   = lerp(WIDE.x,   CLOSE.x,   t);
    tgt.y   = lerp(WIDE.y,   CLOSE.y,   t);
    tgt.z   = lerp(WIDE.z,   CLOSE.z,   t);
    tgt.fov = lerp(WIDE.fov, CLOSE.fov, t);

    // 3. Damp camera toward target — k=11, very snappy but not instant
    const ca = expDecay(11, dt);
    cam.x   = lerp(cam.x,   tgt.x,   ca);
    cam.y   = lerp(cam.y,   tgt.y,   ca);
    cam.z   = lerp(cam.z,   tgt.z,   ca);
    cam.fov = lerp(cam.fov, tgt.fov, ca);

    // 4. Gentle breathing — fades to zero as you zoom in
    const breath = Math.max(0, 1 - smoothScrollT * 3);
    camera.position.x = cam.x + Math.sin(ts * 0.00022) * 0.06 * breath;
    camera.position.y = cam.y + Math.cos(ts * 0.00016) * 0.04 * breath;
    camera.position.z = cam.z + Math.sin(ts * 0.00011) * 0.11 * breath;
    camera.fov        = cam.fov;

    // 5. Floating newspaper animation
    const ft = ts * 0.001;                           // time in seconds
    const floatY    = Math.sin(ft * 0.48) * 0.09;   // slow vertical bob
    const floatRotY = Math.sin(ft * 0.31) * 0.055;  // gentle yaw sway
    const floatRotZ = Math.cos(ft * 0.20) * 0.020;  // subtle roll
    const dynFold   = FOLD_ANGLE + Math.sin(ft * 0.39) * 0.012; // very subtle page flutter
    paperGroup.position.y = 0.05 + floatY;
    paperGroup.rotation.y = floatRotY;
    paperGroup.rotation.z = floatRotZ;
    applyFold(dynFold);

    // Hi-res crossfade (both panels together)
    const hiOp = Math.max(0, Math.min(1, (smoothScrollT - 0.48) / 0.28));
    leftHiMat.opacity  = hiOp;
    rightHiMat.opacity = hiOp;

    camera.updateProjectionMatrix();
    camera.lookAt(lookAtVec);   // reuse pre-allocated vector — no GC

    // 6. Shadow hand wave — pivot at wrist (geometry bottom = position origin)
    window._shadowHand.rotation.z = Math.sin(ft * 1.85) * 0.38;

    // 7. Lamp flicker — three-frequency noise gives organic, non-repeating feel
    const flk = ft * 3.1;
    const flicker = (
      Math.sin(flk * 17.3) * 0.40 +
      Math.sin(flk *  7.7 + 1.2) * 0.30 +
      Math.sin(flk * 31.1 + 0.6) * 0.30
    );
    window._lampGlowMat.opacity = 0.52 + 0.22 * flicker;

    // 8. Grain — update ~24× per second (no need to tie to fps)
    grainTimer += dt;
    if (grainTimer > 0.042) { updateGrain(); grainTimer = 0; }

    renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);

  /* ── Resize ────────────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    cacheHero();
    onScroll();
  });

})();

/* ═══════════════════════════════════════════════════════════════════
   NEWSPAPER RAIN  — 2D canvas overlay, visible from 2nd page onward
═══════════════════════════════════════════════════════════════════ */
(function () {
  const cv = document.createElement('canvas');
  Object.assign(cv.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    zIndex: '5', pointerEvents: 'none',
    opacity: '0', transition: 'opacity 0.8s ease'
  });
  document.body.appendChild(cv);

  let W = cv.width  = window.innerWidth;
  let H = cv.height = window.innerHeight;
  const ctx = cv.getContext('2d');

  /* ── Tiny newspaper sprite (drawn once to an offscreen canvas) ── */
  function makeSprite() {
    const sw = 54, sh = 72;
    const s = document.createElement('canvas');
    s.width = sw; s.height = sh;
    const g = s.getContext('2d');

    // Aged paper
    const pg = g.createLinearGradient(0, 0, sw, sh);
    pg.addColorStop(0, '#f3ebd0'); pg.addColorStop(1, '#e5d8b5');
    g.fillStyle = pg; g.fillRect(0, 0, sw, sh);

    // Dark masthead band
    g.fillStyle = 'rgba(16,10,4,0.90)';
    g.fillRect(1, 1, sw-2, Math.round(sh*0.16));

    // Masthead white text scratches
    g.fillStyle = 'rgba(255,255,255,0.78)';
    g.fillRect(Math.round(sw*0.11), Math.round(sh*0.038), Math.round(sw*0.78), Math.round(sh*0.044));
    g.fillStyle = 'rgba(255,255,255,0.38)';
    g.fillRect(Math.round(sw*0.23), Math.round(sh*0.098), Math.round(sw*0.54), Math.round(sh*0.026));

    // Rule
    g.fillStyle = 'rgba(0,0,0,0.42)';
    g.fillRect(Math.round(sw*0.05), Math.round(sh*0.20), Math.round(sw*0.90), 1);

    // Bold headline block
    g.fillStyle = 'rgba(10,6,2,0.82)';
    g.fillRect(Math.round(sw*0.05), Math.round(sh*0.23), Math.round(sw*0.90), Math.round(sh*0.062));
    g.fillRect(Math.round(sw*0.05), Math.round(sh*0.31), Math.round(sw*0.66), Math.round(sh*0.046));

    // Rule below headline
    g.fillStyle = 'rgba(0,0,0,0.32)';
    g.fillRect(Math.round(sw*0.05), Math.round(sh*0.37), Math.round(sw*0.90), 1);

    // Body text lines
    g.fillStyle = 'rgba(14,9,3,0.48)';
    for (let i = 0; i < 5; i++) {
      const lw = i === 4 ? sw*0.52 : sw*0.90;
      g.fillRect(Math.round(sw*0.05), Math.round(sh*(0.41 + i*0.099)), Math.round(lw), Math.round(sh*0.036));
    }

    // Centre fold crease
    g.fillStyle = 'rgba(0,0,0,0.18)';
    g.fillRect(Math.round(sw/2) - 1, 0, 2, sh);

    // Left-edge curl shadow
    const ls = g.createLinearGradient(0, 0, sw*0.08, 0);
    ls.addColorStop(0, 'rgba(0,0,0,0.30)'); ls.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = ls; g.fillRect(0, 0, sw*0.08, sh);

    // Right-edge shadow
    const rs = g.createLinearGradient(sw, 0, sw*0.92, 0);
    rs.addColorStop(0, 'rgba(0,0,0,0.18)'); rs.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rs; g.fillRect(sw*0.92, 0, sw*0.08, sh);

    // Border
    g.strokeStyle = 'rgba(0,0,0,0.22)';
    g.lineWidth = 0.8; g.strokeRect(0.5, 0.5, sw-1, sh-1);

    return s;
  }

  const SPRITE = makeSprite();
  const SW = SPRITE.width, SH = SPRITE.height;

  /* ── Side corridor widths (% of screen) — middle is always clear ── */
  const SIDE_W = 0.20;  // left: 0→20%,  right: 80→100%

  function randX(side) {
    return side === 'left'
      ? Math.random() * W * SIDE_W
      : W * (1 - SIDE_W) + Math.random() * W * SIDE_W;
  }

  /* ── Particles — fewer on mobile for performance ── */
  const COUNT = window.innerWidth < 768 ? 20 : 56;
  const parts = Array.from({ length: COUNT }, (_, i) => {
    const side = i < COUNT / 2 ? 'left' : 'right';
    const sc   = Math.random() * 0.18 + 0.10;    // 0.10 – 0.28 — tiny
    return {
      x:    randX(side),
      y:    Math.random() * (window.innerHeight + SH) - SH,
      vx:   (Math.random() - 0.5) * 0.20,        // minimal horizontal drift
      vy:   sc * (Math.random() * 0.8 + 0.50),
      rot:  Math.random() * Math.PI * 2,
      vr:   (Math.random() - 0.5) * 0.022,
      sc,
      op:   sc * 0.22 + 0.04,                    // max ~0.10 — very faint
      side,
    };
  });

  /* ── Visibility: appear only from 3rd page onward ── */
  // Trigger after scrolling ≈ 2 full viewport heights (past hero + 2nd section)
  let showing = false;

  function triggerY() { return window.innerHeight * 0.85; }

  function syncVis() {
    const should = window.scrollY > triggerY();
    if (should !== showing) {
      showing = should;
      cv.style.opacity = should ? '1' : '0';
    }
  }
  window.addEventListener('scroll', syncVis, { passive: true });

  /* ── Render loop ── */
  let lastTs = 0;
  function tick(ts) {
    requestAnimationFrame(tick);
    const dt  = Math.min((ts - lastTs) * 0.001, 0.05);
    lastTs = ts;

    if (!showing) return;

    W = cv.width; H = cv.height;
    ctx.clearRect(0, 0, W, H);

    const dts = dt * 60;
    const leftMax  = W * SIDE_W;
    const rightMin = W * (1 - SIDE_W);

    parts.forEach(p => {
      p.x   += p.vx * dts;
      p.y   += p.vy * dts;
      p.rot += p.vr * dts;

      // Keep each particle inside its side corridor
      if (p.side === 'left'  && p.x > leftMax)  { p.x = leftMax;  p.vx = -Math.abs(p.vx); }
      if (p.side === 'right' && p.x < rightMin) { p.x = rightMin; p.vx =  Math.abs(p.vx); }

      // Reset below screen — respawn in same side zone above top
      if (p.y > H + SH * p.sc) {
        p.y = -SH * p.sc - 8;
        p.x = randX(p.side);
      }

      const w = SW * p.sc, h = SH * p.sc;
      ctx.save();
      ctx.globalAlpha = p.op;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(SPRITE, -w / 2, -h / 2, w, h);
      ctx.restore();
    });
  }

  window.addEventListener('resize', () => {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    syncVis();
  });

  syncVis();
  requestAnimationFrame(tick);
})();
