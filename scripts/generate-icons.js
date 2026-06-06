const Jimp = require('jimp');
const path = require('path');

const OUT = path.join(__dirname, '..', 'apps', 'mobile', 'assets');

// Brand colors
const BLUE_BG    = 0x0EA5E9FF; // #0EA5E9
const BLUE_DARK  = 0x0284C7FF; // #0284C7
const BLUE_LIGHT = 0x38BDF8FF; // #38BDF8
const WHITE      = 0xFFFFFFFF;
const TRANSP     = 0x00000000;

// ── helpers ──────────────────────────────────────────────────────────────────

function lerpColor(c1, c2, t) {
  const r = Math.round(((c1 >> 24) & 0xFF) * (1 - t) + ((c2 >> 24) & 0xFF) * t);
  const g = Math.round(((c1 >> 16) & 0xFF) * (1 - t) + ((c2 >> 16) & 0xFF) * t);
  const b = Math.round(((c1 >> 8)  & 0xFF) * (1 - t) + ((c2 >> 8)  & 0xFF) * t);
  const a = 255;
  return Jimp.rgbaToInt(r, g, b, a);
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Check if point (px, py) is inside the water drop
function insideDrop(px, py, cx, tipY, botY) {
  if (py < tipY || py > botY) return false;

  const halfH = botY - tipY;
  const halfW = halfH * 0.41;
  const midY  = tipY + halfH * 0.58;

  let maxX;
  if (py <= midY) {
    // Upper teardrop: exponent 1.4 → soft point, widens quickly
    const t = (py - tipY) / (midY - tipY);
    maxX = halfW * Math.pow(t, 1.4);
  } else {
    // Lower dome: semicircle
    const t = (py - midY) / (botY - midY);
    maxX = halfW * Math.sqrt(1 - t * t);
  }

  return Math.abs(px - cx) <= maxX;
}

// ── draw functions ────────────────────────────────────────────────────────────

function drawBg(img, size, rounded) {
  const r = rounded ? Math.round(size * 0.215) : 0; // corner radius
  img.scan(0, 0, size, size, function (x, y, idx) {
    const inCornerTL = x < r && y < r && dist(x, y, r, r) > r;
    const inCornerTR = x > size - r && y < r && dist(x, y, size - r, r) > r;
    const inCornerBL = x < r && y > size - r && dist(x, y, r, size - r) > r;
    const inCornerBR = x > size - r && y > size - r && dist(x, y, size - r, size - r) > r;

    if (inCornerTL || inCornerTR || inCornerBL || inCornerBR) {
      this.bitmap.data.writeUInt32BE(TRANSP, idx);
      return;
    }

    // Gradient: top-left light blue → bottom-right dark blue
    const t = (x + y) / (2 * size);
    const col = lerpColor(BLUE_LIGHT, BLUE_DARK, t);
    this.bitmap.data.writeUInt32BE(col, idx);
  });
}

function drawDrop(img, size) {
  const cx   = size / 2;
  const tipY = size * 0.175;
  const botY = size * 0.820;

  img.scan(0, 0, size, size, function (x, y, idx) {
    if (!insideDrop(x, y, cx, tipY, botY)) return;

    // Highlight: upper-left area of drop gets a bluish tint
    const dropH = botY - tipY;
    const dropW = dropH * 0.40;

    // Normalised position inside drop (0..1)
    const nx = (x - (cx - dropW)) / (2 * dropW);
    const ny = (y - tipY) / dropH;

    // White with subtle blue tint: left/top part is slightly blue-tinted
    const tint = Math.max(0, 1 - nx * 1.4 - ny * 0.6);
    const r = Math.round(255);
    const g = Math.round(255 - tint * 25);
    const b = Math.round(255 - tint * 10);
    this.bitmap.data.writeUInt32BE(Jimp.rgbaToInt(r, g, b, 255), idx);
  });
}

function drawShine(img, size) {
  // Glossy highlight inside the drop body (safely below the narrow tip)
  const cx   = size * 0.436;
  const cy   = size * 0.500;
  const rx   = size * 0.055;
  const ry   = size * 0.085;
  const angle = -16 * Math.PI / 180;

  img.scan(0, 0, size, size, function (x, y, idx) {
    // Rotate point around ellipse center
    const dx = x - cx;
    const dy = y - cy;
    const rx2 =  dx * Math.cos(angle) + dy * Math.sin(angle);
    const ry2 = -dx * Math.sin(angle) + dy * Math.cos(angle);

    if ((rx2 / rx) ** 2 + (ry2 / ry) ** 2 > 1) return;

    // Soft gradient inside shine: brightest at center
    const d = Math.sqrt((rx2 / rx) ** 2 + (ry2 / ry) ** 2);
    const alpha = Math.round((1 - d) * 100); // 0-100 opacity
    this.bitmap.data[idx + 3] = Math.min(255, this.bitmap.data[idx + 3] + alpha);
    // Make slightly more white (push towards white)
    for (let c = 0; c < 3; c++) {
      this.bitmap.data[idx + c] = Math.min(255, this.bitmap.data[idx + c] + alpha);
    }
  });
}

// ── icon generators ───────────────────────────────────────────────────────────

async function generateIcon(size, outPath, transparent = false) {
  const img = new Jimp(size, size, TRANSP);
  if (!transparent) drawBg(img, size, true);
  drawDrop(img, size);
  drawShine(img, size);
  await img.writeAsync(outPath);
  console.log(`✓ ${outPath.replace(OUT, 'assets')}`);
}

async function generateAdaptiveIcon(size, outPath) {
  // Adaptive icon: transparent bg, drop with padding (Android adds its own bg)
  const img = new Jimp(size, size, TRANSP);
  drawDrop(img, size);
  drawShine(img, size);
  await img.writeAsync(outPath);
  console.log(`✓ ${outPath.replace(OUT, 'assets')}`);
}

async function generateSplash(outPath) {
  const W = 1242, H = 2688;
  const img = new Jimp(W, H, TRANSP);

  // Solid blue background
  img.scan(0, 0, W, H, function (x, y, idx) {
    const t = (x + y) / (W + H);
    const col = lerpColor(BLUE_LIGHT, BLUE_DARK, t * 0.8);
    this.bitmap.data.writeUInt32BE(col, idx);
  });

  // Centered drop, smaller (fits nicely on splash)
  const dropSize = Math.round(W * 0.55);
  const offX = Math.round((W - dropSize) / 2);
  const offY = Math.round(H * 0.32);

  const cx   = offX + dropSize / 2;
  const tipY = offY + dropSize * 0.175;
  const botY = offY + dropSize * 0.820;

  img.scan(offX, offY, dropSize, Math.round(dropSize * 0.9), function (x, y, idx) {
    if (!insideDrop(x, y, cx, tipY, botY)) return;
    this.bitmap.data.writeUInt32BE(WHITE, idx);
  });

  await img.writeAsync(outPath);
  console.log(`✓ ${outPath.replace(OUT, 'assets')} (splash)`);
}

// ── main ──────────────────────────────────────────────────────────────────────

(async () => {
  console.log('Gerando ícones Lavô...\n');
  await generateIcon(1024, path.join(OUT, 'icon.png'));
  await generateAdaptiveIcon(1024, path.join(OUT, 'adaptive-icon.png'));
  await generateSplash(path.join(OUT, 'splash.png'));
  console.log('\nPronto! Backup dos originais não foi feito — use git restore se precisar.');
})();
