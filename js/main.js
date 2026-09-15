import { ImageProcessor } from './core/imageProcessor.js';
import { Reconstructor } from './core/reconstructor.js';
import { MenuBuilder } from './ui/menuBuilder.js';
import { Logger } from './ui/logger.js';
import { DownloadManager } from './ui/downloadManager.js';
import { INFO_DATA } from './infoData.js';

let currentProcessor = null;
let currentConvertedText = '';
let currentRawBinary = null;
let currentConverterId = 'binary';
let downloadsUnlocked = false;

const logger = new Logger('logPanel');

// ---------- INFO MODAL ----------
const infoModal = document.getElementById('infoModal');
const infoModalTitle = document.getElementById('infoModalTitle');
const infoModalBody = document.getElementById('infoModalBody');

function openInfo(id) {
  const data = INFO_DATA[id];
  if (!data) {
    infoModalTitle.textContent = 'Info';
    infoModalBody.innerHTML = '<p>No detailed description available for this converter yet.</p>';
  } else {
    infoModalTitle.textContent = data.title;
    infoModalBody.innerHTML = data.body;
  }
  infoModal.classList.add('open');
  infoModal.setAttribute('aria-hidden', 'false');
}
function closeInfo() {
  infoModal.classList.remove('open');
  infoModal.setAttribute('aria-hidden', 'true');
}
infoModal.querySelector('.info-modal-backdrop').addEventListener('click', closeInfo);
infoModal.querySelector('.info-modal-close').addEventListener('click', closeInfo);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeInfo(); });

// ---------- MENU ----------
const menu = new MenuBuilder(
  'groupMenuContainer',
  (id, name) => {
    currentConverterId = id;
    logger.log(`Selected: ${name}`);
  },
  (id) => openInfo(id)
);

// ---------- IMAGE LOADING ----------
const MAX_SIZE_MB = 8;
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const previewImg = document.getElementById('previewImg');

function loadImage(file) {
  if (!file.type.startsWith('image/')) { logger.log('❌ Not an image', 'error'); return; }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_SIZE_MB) {
    logger.log(`⚠️ File too large (${sizeMB.toFixed(1)}MB). Max ${MAX_SIZE_MB}MB.`, 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      previewImg.src = img.src;
      currentProcessor = new ImageProcessor();
      currentProcessor.loadFromImage(img);
      logger.log(`✅ Loaded: ${img.width}×${img.height}, ${sizeMB.toFixed(2)} MB`);
      document.getElementById('metadataPanel').innerHTML =
        `<strong>Metadata</strong><br>📐 ${img.width}×${img.height}<br>📁 ${file.type}<br>💾 ${sizeMB.toFixed(2)} MB`;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault(); dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]);
});
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => { if (e.target.files[0]) loadImage(e.target.files[0]); });

// ---------- CONVERT ----------
document.getElementById('convertBtn').addEventListener('click', async () => {
  if (!currentProcessor) { logger.log('❌ No image loaded', 'error'); return; }
  const outputEl = document.getElementById('outputDisplay');
  const convertBtn = document.getElementById('convertBtn');
  convertBtn.disabled = true;
  convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
  outputEl.innerText = '⏳ Processing... please wait';
  await new Promise(r => setTimeout(r, 30));
  try {
    logger.log(`🔄 Converting to ${currentConverterId}...`);
    const start = performance.now();
    const output = await currentProcessor.convert(currentConverterId);
    const elapsed = (performance.now() - start).toFixed(0);
    currentConvertedText = output;
    outputEl.innerText = output;
    if (currentConverterId === 'binary') {
      const bits = output;
      const bytes = new Uint8Array(bits.match(/.{8}/g).map(b => parseInt(b, 2)));
      currentRawBinary = bytes;
    }
    logger.log(`✅ Done in ${elapsed}ms | Length: ${output.length} chars`);
  } catch (err) {
    logger.log(`❌ Conversion error: ${err.message}`, 'error');
    outputEl.innerText = 'Error during conversion. Check logs.';
  } finally {
    convertBtn.disabled = false;
    convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> CONVERT →';
  }
});

// ---------- REVERT ----------
document.getElementById('revertToImageBtn').addEventListener('click', () => {
  const inputData = document.getElementById('revertInputText').value.trim();
  const format = document.getElementById('revertFormatSelect').value;
  const width = parseInt(document.getElementById('revertWidth').value);
  const height = parseInt(document.getElementById('revertHeight').value);
  if (!inputData) { logger.log('Please paste data to revert', 'error'); return; }
  if (!width || !height || isNaN(width) || isNaN(height)) {
    logger.log('Please provide valid width and height', 'error'); return;
  }
  try {
    const bytes = Reconstructor.parseToBytes(inputData, format, width, height);
    const canvas = Reconstructor.reconstructImage(bytes, width, height);
    const revertCanvas = document.getElementById('revertCanvas');
    revertCanvas.width = width; revertCanvas.height = height;
    const ctx = revertCanvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(canvas, 0, 0);
    logger.log(`✅ Reverted ${format} → ${width}x${height} image`);
  } catch (err) {
    logger.log(`Revert error: ${err.message}`, 'error');
  }
});

document.getElementById('scrollToRevertBtn')?.addEventListener('click', () => {
  document.querySelector('.reconstructor-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('revertInputText')?.focus();
});

// ---------- COPY / DOWNLOAD ----------
document.getElementById('copyOutputBtn').addEventListener('click', () => {
  if (currentConvertedText) { navigator.clipboard.writeText(currentConvertedText); logger.log('📋 Copied!'); }
  else logger.log('Nothing to copy');
});
const downloadManager = new DownloadManager();
document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!downloadsUnlocked) { logger.log('🔒 Register email to unlock downloads', 'error'); return; }
  if (!currentConvertedText) { logger.log('No converted data', 'error'); return; }
  const format = document.getElementById('downloadFormatSelect').value;
  downloadManager.download(currentConvertedText, format, currentRawBinary);
});
document.getElementById('registerEmailBtn').addEventListener('click', () => {
  const email = document.getElementById('userEmail').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('emailStatus').innerHTML = '❌ Invalid email'; return;
  }
  downloadsUnlocked = true;
  document.getElementById('emailStatus').innerHTML = '✅ Downloads unlocked!';
  logger.log(`🔓 Email registered: ${email}`);
});

logger.log('🚀 Universal Image Forge Pro ready | Click (i) icons for details');