// ============================================================
// Universal Image Data Explorer Forge — Main Controller
// File: js/main.js
// ============================================================

import { ImageProcessor } from './core/imageProcessor.js';
import { MenuBuilder } from './ui/menuBuilder.js';
import { Logger } from './ui/logger.js';
import { DownloadManager } from './ui/downloadManager.js';

// ============================================================
// ⚙️ MATRIX RAIN CONFIGURATION
// Change these values to customize the falling 0s/1s effect
// ============================================================
const MATRIX_CONFIG = {
  frameInterval: 60,     // Rain speed. Lower = faster (30 = fast, 100 = slow)
  trailAlpha: 0.08,      // Trail length. Lower = longer trails (0.05 = very long, 0.15 = short)
  fontSize: 19,          // Character size. Lower = denser columns, higher = sparser
  charSet: '02',         // Characters to fall. Try '01', '01ア', '01katakana', etc.
  color: '#00ff41',      // Bright rain color. Try '#00ddff' (cyan), '#ff0041' (red)
  headColor: '#ccffcc',  // Bright head of each drop
  shadowBlur: 2         // Glow on each character
};
// ============================================================

// ---------- STATE ----------
let currentProcessor = null;
let currentConvertedText = '';
let currentRawBinary = null;
let currentConverterId = 'binary';
let downloadsUnlocked = false;
let lastImageDimensions = { width: 0, height: 0 };

const logger = new Logger('logPanel');

// ---------- MENU ----------
const menu = new MenuBuilder('groupMenuContainer', function (id, name) {
  currentConverterId = id;
  logger.log('Selected: ' + name);
});

// ---------- IMAGE LOADING ----------
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const previewImg = document.getElementById('previewImg');

function loadImage(file) {
  if (!file.type.startsWith('image/')) {
    logger.log('❌ Not an image file', 'error');
    return;
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > 8) {
    logger.log('❌ File too large (' + sizeMB.toFixed(1) + 'MB). Max 8 MB.', 'error');
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const img = new Image();

    img.onload = function () {
      previewImg.src = img.src;
      currentProcessor = new ImageProcessor();

      const ok = currentProcessor.loadFromImage(img);
      if (!ok || !currentProcessor.imageData) {
        logger.log('❌ Failed to extract pixel data', 'error');
        return;
      }

      lastImageDimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };

      logger.log('✅ Loaded: ' + img.naturalWidth + '×' + img.naturalHeight + ', ' + sizeMB.toFixed(2) + ' MB');
      logger.log('💡 Tip: For revert, use Width = ' + img.naturalWidth + ', Height = ' + img.naturalHeight);

      const meta = document.getElementById('metadataPanel');
      if (meta) {
        meta.innerHTML =
          '<strong>Metadata</strong><br>' +
          '📐 ' + img.naturalWidth + '×' + img.naturalHeight + '<br>' +
          '📁 ' + file.type + '<br>' +
          '💾 ' + sizeMB.toFixed(2) + ' MB<br>' +
          '<small style="color:#6effc0">Revert: ' + img.naturalWidth + '×' + img.naturalHeight + '</small>';
      }
    };

    img.onerror = function () { logger.log('❌ Failed to decode image', 'error'); };
    img.src = e.target.result;
  };

  reader.onerror = function () { logger.log('❌ Failed to read file', 'error'); };
  reader.readAsDataURL(file);
}

dropZone.addEventListener('dragover', function (e) { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('drag-over'); });
dropZone.addEventListener('drop', function (e) {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]);
});
dropZone.addEventListener('click', function () { fileInput.click(); });
fileInput.addEventListener('change', function (e) {
  if (e.target.files[0]) loadImage(e.target.files[0]);
});

// ---------- CONVERT ----------
// ---------- CONVERT ----------
document.getElementById('convertBtn').addEventListener('click', async function () {
  if (!currentProcessor) { logger.log('❌ No image loaded', 'error'); return; }

  const outputEl = document.getElementById('outputDisplay');
  const convertBtn = document.getElementById('convertBtn');
  const downloadBar = document.getElementById('downloadBar');   // ⬅️ NEW

  convertBtn.disabled = true;
  convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
  outputEl.innerText = '⏳ Processing...';

  await new Promise(function (r) { setTimeout(r, 30); });

  try {
    logger.log('🔄 Converting to ' + currentConverterId + '...');
    const start = performance.now();
    const output = await currentProcessor.convert(currentConverterId);
    const elapsed = (performance.now() - start).toFixed(0);

    currentConvertedText = output;
    outputEl.innerText = output;

    if (currentConverterId === 'binary') {
      const bits = output.replace(/\s/g, '');
      const bytes = new Uint8Array(Math.floor(bits.length / 8));
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
      }
      currentRawBinary = bytes;
    }


    logger.log('✅ Done in ' + elapsed + 'ms | Length: ' + output.length + ' chars');
  } catch (err) {
    logger.log('❌ Conversion error: ' + err.message, 'error');
    outputEl.innerText = 'Error: ' + err.message;
  } finally {
    convertBtn.disabled = false;
    convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> CONVERT →';
  }
});

// ---------- REVERT ----------
document.getElementById('revertToImageBtn').addEventListener('click', function () {
  const inputData = document.getElementById('revertInputText').value.trim();
  const format = document.getElementById('revertFormatSelect').value;
  let width = parseInt(document.getElementById('revertWidth').value) || 0;
  let height = parseInt(document.getElementById('revertHeight').value) || 0;

  if (!inputData) {
    logger.log('❌ Paste data to revert first', 'error');
    showCanvasMessage('Paste data first');
    return;
  }

  try {
    let bytes;
    let pixelCount = 0;

    // BINARY
    if (format === 'binary') {
      const bits = inputData.replace(/\s/g, '');
      pixelCount = Math.floor(bits.length / 8);

      if (!width || !height || width * height !== pixelCount) {
        const detected = autoDetectDimensions(pixelCount);
        logger.log('🔍 Auto-detected: ' + detected.width + '×' + detected.height + ' (from ' + pixelCount + ' pixels)');
        document.getElementById('revertWidth').value = detected.width;
        document.getElementById('revertHeight').value = detected.height;
        width = detected.width;
        height = detected.height;
      }

      const expected = width * height * 8;
      if (bits.length !== expected) {
        throw new Error('Binary length mismatch. Expected ' + expected + ' bits, got ' + bits.length);
      }

      bytes = new Uint8Array(width * height);
      for (let i = 0; i < width * height; i++) {
        bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
      }
    }
    // HEX
    else if (format === 'hex') {
      const hexVals = inputData.trim().split(/\s+/).filter(function (x) { return x.length > 0; });
      pixelCount = hexVals.length;

      if (!width || !height || width * height !== pixelCount) {
        const detected = autoDetectDimensions(pixelCount);
        document.getElementById('revertWidth').value = detected.width;
        document.getElementById('revertHeight').value = detected.height;
        width = detected.width;
        height = detected.height;
      }

      if (hexVals.length !== width * height) {
        throw new Error('Hex count mismatch: expected ' + (width * height) + ', got ' + hexVals.length);
      }
      bytes = new Uint8Array(hexVals.map(function (h) { return parseInt(h, 16); }));
    }
    // BASE64
    else if (format === 'base64') {
      const bin = atob(inputData.replace(/\s/g, ''));
      pixelCount = bin.length;

      if (!width || !height || width * height !== pixelCount) {
        const detected = autoDetectDimensions(pixelCount);
        document.getElementById('revertWidth').value = detected.width;
        document.getElementById('revertHeight').value = detected.height;
        width = detected.width;
        height = detected.height;
      }

      bytes = new Uint8Array(width * height);
      for (let i = 0; i < bin.length && i < width * height; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
    }
    // ARRAY FORMATS
    else {
      const nums = inputData.match(/\d+/g);
      if (!nums) throw new Error('No numbers found in input');
      pixelCount = nums.length;

      if (!width || !height || width * height !== pixelCount) {
        const detected = autoDetectDimensions(pixelCount);
        document.getElementById('revertWidth').value = detected.width;
        document.getElementById('revertHeight').value = detected.height;
        width = detected.width;
        height = detected.height;
      }

      if (nums.length !== width * height) {
        throw new Error('Length mismatch: expected ' + (width * height) + ', got ' + nums.length);
      }
      bytes = new Uint8Array(nums.map(Number));
    }

    // DRAW
    const canvas = document.getElementById('revertCanvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.createImageData(width, height);
    for (let i = 0; i < width * height; i++) {
      const v = bytes[i];
      imgData.data[i * 4] = v;
      imgData.data[i * 4 + 1] = v;
      imgData.data[i * 4 + 2] = v;
      imgData.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    logger.log('✅ Reverted ' + format + ' → ' + width + '×' + height + ' image');
  } catch (err) {
    logger.log('❌ Revert error: ' + err.message, 'error');
    showCanvasMessage('Error: ' + err.message);
  }
});

// ---------- AUTO-DETECT DIMENSIONS ----------
function autoDetectDimensions(pixelCount) {
  if (lastImageDimensions.width * lastImageDimensions.height === pixelCount) {
    return lastImageDimensions;
  }
  let best = { width: pixelCount, height: 1, diff: Infinity };
  for (let w = 1; w <= Math.ceil(Math.sqrt(pixelCount)); w++) {
    if (pixelCount % w === 0) {
      const h = pixelCount / w;
      const diff = Math.abs(w - h);
      if (diff < best.diff || (diff === best.diff && w >= h)) {
        best = { width: w, height: h, diff: diff };
      }
    }
  }
  return { width: best.width, height: best.height };
}

// ---------- CANVAS ERROR MESSAGE ----------
function showCanvasMessage(msg) {
  const canvas = document.getElementById('revertCanvas');
  canvas.width = 400;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 400, 200);
  ctx.fillStyle = '#d32f2f';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚠️ Error', 200, 80);
  ctx.fillStyle = '#666666';
  ctx.font = '12px Inter, sans-serif';
  const maxWidth = 360;
  const words = msg.split(' ');
  let line = '';
  let y = 110;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth) {
      ctx.fillText(line, 200, y);
      line = words[i] + ' ';
      y += 18;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 200, y);
}

// ---------- DOWNLOAD REVERTED PNG ----------
document.getElementById('downloadRevertBtn')?.addEventListener('click', function () {
  const canvas = document.getElementById('revertCanvas');
  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    logger.log('❌ No reverted image to download', 'error');
    return;
  }
  try {
    const link = document.createElement('a');
    link.download = 'reverted-' + canvas.width + 'x' + canvas.height + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    logger.log('💾 Downloaded reverted PNG (' + canvas.width + '×' + canvas.height + ')');
  } catch (err) {
    logger.log('❌ Download failed: ' + err.message, 'error');
  }
});

// ---------- SCROLL TO REVERT ----------
document.getElementById('scrollToRevertBtn')?.addEventListener('click', function () {
  document.querySelector('.reconstructor-card')?.scrollIntoView({ behavior: 'smooth' });
});

// ---------- COPY ----------
document.getElementById('copyOutputBtn').addEventListener('click', function () {
  if (currentConvertedText) {
    navigator.clipboard.writeText(currentConvertedText);
    logger.log('📋 Copied to clipboard');
  } else {
    logger.log('Nothing to copy');
  }
});

// ---------- DOWNLOAD OUTPUT ----------
const downloadManager = new DownloadManager();
document.getElementById('downloadBtn').addEventListener('click', function () {
  if (!downloadsUnlocked) { logger.log('🔒 Register email to unlock downloads', 'error'); return; }
  if (!currentConvertedText) { logger.log('No data to download', 'error'); return; }
  const format = document.getElementById('downloadFormatSelect').value;
  downloadManager.download(currentConvertedText, format, currentRawBinary);
  logger.log('⬇️ Downloaded as .' + format);
});

// ---------- EMAIL UNLOCK ----------
document.getElementById('registerEmailBtn').addEventListener('click', function () {
  const email = document.getElementById('userEmail').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('emailStatus').innerHTML = '❌ Invalid email';
    return;
  }
  downloadsUnlocked = true;
  document.getElementById('emailStatus').innerHTML = '✅ Downloads unlocked';
  logger.log('🔓 Email registered: ' + email);
});

// ---------- INIT REVERT CANVAS ----------
(function initRevertCanvas() {
  const canvas = document.getElementById('revertCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#999999';
  ctx.font = '13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Reverted image will appear here', canvas.width / 2, canvas.height / 2);
})();

// ============================================================
// MATRIX RAIN — Falling 0s and 1s behind output text
// Uses MATRIX_CONFIG constants (see top of file)
// ============================================================
(function matrixRain() {
  const outputDisplay = document.getElementById('outputDisplay');
  if (!outputDisplay) return;

  // 1. Ensure wrapper exists
  let wrapper = document.getElementById('outputWrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'outputWrapper';
    wrapper.className = 'output-wrapper';
    outputDisplay.parentNode.insertBefore(wrapper, outputDisplay);
    wrapper.appendChild(outputDisplay);
  }

  // 2. Ensure canvas exists inside wrapper
  let canvas = document.getElementById('matrixCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'matrixCanvas';
    canvas.className = 'matrix-canvas';
    wrapper.insertBefore(canvas, outputDisplay);
  }

  const ctx = canvas.getContext('2d');
  let columns = 0;
  let drops = [];
  let running = true;

  function resize() {
    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    columns = Math.ceil(rect.width / MATRIX_CONFIG.fontSize);
    drops = new Array(columns).fill(0).map(function () {
      return Math.random() * (rect.height / MATRIX_CONFIG.fontSize);
    });

    ctx.fillStyle = 'rgba(0, 10, 5, 0.6)';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  function draw() {
    if (!running) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Trail fade
    ctx.fillStyle = 'rgba(0, 10, 5, ' + MATRIX_CONFIG.trailAlpha + ')';
    ctx.fillRect(0, 0, w, h);

    ctx.font = MATRIX_CONFIG.fontSize + 'px "Fira Code", "Monaco", monospace';
    ctx.textBaseline = 'top';

    for (let i = 0; i < drops.length; i++) {
      const ch = MATRIX_CONFIG.charSet.charAt(
        Math.floor(Math.random() * MATRIX_CONFIG.charSet.length)
      );
      const x = i * MATRIX_CONFIG.fontSize;
      const y = drops[i] * MATRIX_CONFIG.fontSize;

      // Head of drop is brighter
      if (Math.random() > 0.96) {
        ctx.fillStyle = MATRIX_CONFIG.headColor;
        ctx.shadowColor = MATRIX_CONFIG.color;
        ctx.shadowBlur = MATRIX_CONFIG.shadowBlur + 4;
      } else {
        ctx.fillStyle = MATRIX_CONFIG.color;
        ctx.shadowColor = MATRIX_CONFIG.color;
        ctx.shadowBlur = MATRIX_CONFIG.shadowBlur;
      }

      ctx.fillText(ch, x, y);

      if (y > h && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    ctx.shadowBlur = 0;
  }

  resize();
  window.addEventListener('resize', resize);

  setInterval(draw, MATRIX_CONFIG.frameInterval);

  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) resize();
  });
})();

// ---------- READY ----------
logger.log('🚀 Forge ready | Select converter, upload image, click CONVERT');