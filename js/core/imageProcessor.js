// ============================================================
// Universal Image Data Explorer Forge — Image Processor
// File: js/core/imageProcessor.js
// All 56 converters implemented
// ============================================================

export class ImageProcessor {
  constructor() {
    this.imageData = null;
    this.width = 0;
    this.height = 0;
    this.rawBytes = null;
    this.grayCache = null;
  }

  // ------------------------------------------------------------
  // Load image from an <img> element
  // ------------------------------------------------------------
  loadFromImage(imgElement) {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth || imgElement.width;
    canvas.height = imgElement.naturalHeight || imgElement.height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

    this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.width = canvas.width;
    this.height = canvas.height;
    this.rawBytes = new Uint8Array(this.imageData.data);
    this.grayCache = this._computeGrayscale();
    return true;
  }

  // ------------------------------------------------------------
  // Canonical grayscale (ITU-R BT.601)
  // ------------------------------------------------------------
  _computeGrayscale() {
    if (!this.imageData) return new Uint8Array(0);
    const p = this.imageData.data;
    const total = this.width * this.height;
    const gray = new Uint8Array(total);
    for (let i = 0; i < total; i++) {
      gray[i] = Math.floor(0.299 * p[i * 4] + 0.587 * p[i * 4 + 1] + 0.114 * p[i * 4 + 2]);
    }
    return gray;
  }

  getGrayscaleArray() {
    if (!this.grayCache) this.grayCache = this._computeGrayscale();
    return this.grayCache;
  }

  // ------------------------------------------------------------
  // MAIN DISPATCHER
  // ------------------------------------------------------------
  async convert(typeId) {
    const gray = this.getGrayscaleArray();
    const w = this.width, h = this.height;

    if (gray.length === 0) throw new Error('Image not loaded');

    switch (typeId) {
      // ===== A. BINARY / LOW LEVEL =====
      case 'binary': {
        let out = '';
        for (let i = 0; i < gray.length; i++) out += gray[i].toString(2).padStart(8, '0');
        return out;
      }
      case 'hex': {
        const arr = new Array(gray.length);
        for (let i = 0; i < gray.length; i++) arr[i] = gray[i].toString(16).padStart(2, '0');
        return arr.join(' ');
      }
      case 'octal': {
        const arr = new Array(gray.length);
        for (let i = 0; i < gray.length; i++) arr[i] = gray[i].toString(8);
        return arr.join(',');
      }
      case 'byteArray':
        return '[' + Array.from(gray).join(',') + ']';
      case 'uint8Array':
        return 'new Uint8Array([' + Array.from(gray).join(',') + '])';
      case 'int16Array':
        return 'new Int16Array([' + Array.from(gray).join(',') + '])';
      case 'int32Array':
        return 'new Int32Array([' + Array.from(gray).join(',') + '])';
      case 'float32Array': {
        const arr = Array.from(gray).map(v => (v / 255).toFixed(6));
        return 'new Float32Array([' + arr.join(',') + '])';
      }
      case 'bitStream': {
        const arr = new Array(gray.length);
        for (let i = 0; i < gray.length; i++) arr[i] = gray[i].toString(2);
        return arr.join(' ');
      }

      // ===== B. ENCODING =====
      case 'base64':
        return await this._toBase64();
      case 'base32':
        return this._toBase32(gray);
      case 'base85':
        return this._toBase85(gray);
      case 'dataURL':
        return await this._toDataURL();
      case 'urlEncoded': {
        const b64 = await this._toBase64();
        return encodeURIComponent(b64);
      }
      case 'asciiText': {
        let s = '';
        const limit = Math.min(gray.length, 2000);
        for (let i = 0; i < limit; i++) s += String.fromCharCode(gray[i]);
        return s;
      }
      case 'utf8Text': {
        const slice = gray.slice(0, 2000);
        try { return new TextDecoder('utf-8').decode(slice); }
        catch (e) { return String.fromCharCode.apply(null, slice); }
      }
      case 'jsonData':
        return JSON.stringify({ width: w, height: h, grayscale: Array.from(gray) });

      // ===== C. PIXEL DATA =====
      case 'rgbMatrix':
        return JSON.stringify(this._buildMatrix('rgb'));
      case 'rgbaMatrix':
        return JSON.stringify(this._buildMatrix('rgba'));
      case 'grayscaleMatrix':
        return JSON.stringify(this._buildMatrix('gray'));
      case 'hslMatrix':
        return JSON.stringify(this._buildMatrix('hsl'));
      case 'hsvMatrix':
        return JSON.stringify(this._buildMatrix('hsv'));
      case 'cmykMatrix':
        return JSON.stringify(this._buildMatrix('cmyk'));
      case 'yuvMatrix':
        return JSON.stringify(this._buildMatrix('yuv'));
      case 'labColor':
        return JSON.stringify(this._buildXYZ());
      case 'colorHistogram':
        return JSON.stringify(this._histogram());

      // ===== D. PROGRAMMING LANGUAGES =====
      case 'cArray':
        return 'unsigned char img[' + gray.length + '] = {\n  ' + this._wrap(Array.from(gray).join(', ')) + '\n};';
      case 'cppArray':
        return 'std::array<unsigned char, ' + gray.length + '> img = {\n  ' + this._wrap(Array.from(gray).join(', ')) + '\n};';
      case 'pythonBytes':
        return 'img_bytes = bytes([\n  ' + this._wrap(Array.from(gray).join(', ')) + '\n])';
      case 'javaByteArray': {
        const signed = Array.from(gray).map(v => v > 127 ? v - 256 : v);
        return 'byte[] imgData = {\n  ' + this._wrap(signed.join(', ')) + '\n};';
      }
      case 'goSlice':
        return 'img := []byte{\n  ' + this._wrap(Array.from(gray).join(', ')) + '\n}';
      case 'rustArray':
        return 'let img: [u8; ' + gray.length + '] = [\n  ' + this._wrap(Array.from(gray).join(', ')) + '\n];';
      case 'jsBuffer':
        return 'Buffer.from([\n  ' + this._wrap(Array.from(gray).join(', ')) + '\n])';
      case 'phpBinary': {
        let s = '';
        const limit = Math.min(gray.length, 500);
        for (let i = 0; i < limit; i++) s += '\\x' + gray[i].toString(16).padStart(2, '0');
        return '$img = "' + s + '";';
      }
      case 'swiftData':
        return 'let imgData = Data([\n  ' + this._wrap(Array.from(gray).join(', ')) + '\n])';
      case 'kotlinByteArray': {
        const signed = Array.from(gray).map(v => v > 127 ? v - 256 : v);
        return 'val imgData = byteArrayOf(\n  ' + this._wrap(signed.join(', ')) + '\n)';
      }

      // ===== E. VISUALIZATION =====
      case 'asciiArt': return this._asciiArt(gray, w, h);
      case 'brailleArt': return this._brailleArt(gray, w, h);
      case 'blockArt': return this._blockArt(gray, w, h);
      case 'emojiArt': return this._emojiArt(gray, w, h);
      case 'pixelGrid': return this._pixelGrid(gray, w, h);
      case 'heatmap': return this._heatmap(gray, w, h);

      // ===== F. COMPRESSION / SECURITY =====
      case 'rle': return this._rle(gray);
      case 'deltaEncoding': return this._delta(gray);
      case 'md5': return await this._hash('MD5', gray);
      case 'sha1': return await this._hash('SHA-1', gray);
      case 'sha256': return await this._hash('SHA-256', gray);
      case 'crc32': return this._crc32(gray).toString(16).padStart(8, '0');

      // ===== G. AI / DATA SCIENCE =====
      case 'numpyArray':
        return 'np.array([\n  ' + this._wrap(Array.from(gray).join(',')) + '\n]).reshape(' + h + ',' + w + ')';
      case 'tensor':
        return 'tf.tensor([\n  ' + this._wrap(Array.from(gray).join(',')) + '\n], [' + h + ',' + w + ',1])';
      case 'csvPixel': {
        const rows = ['x,y,value'];
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) rows.push(x + ',' + y + ',' + gray[y * w + x]);
        }
        return rows.join('\n');
      }
      case 'pandasDF':
        return 'pd.DataFrame({\n  "pixel": [' + Array.from(gray).join(',') + '],\n  "x": ' + JSON.stringify(Array.from({ length: w * h }, function (_, i) { return i % w; })) + ',\n  "y": ' + JSON.stringify(Array.from({ length: w * h }, function (_, i) { return Math.floor(i / w); })) + '\n})';
      case 'featureVector':
        return '[' + Array.from(gray).join(',') + ']';

      // ===== H. WEB / BROWSER =====
      case 'svgTrace': return this._svgTrace(gray, w, h);
      case 'cssDataUri': {
        const url = await this._toDataURL();
        return "background-image: url('" + url + "');";
      }
      case 'canvasData':
        return 'ctx.putImageData(new ImageData(new Uint8ClampedArray([' + Array.from(this.imageData.data).join(',') + ']), ' + w + ', ' + h + '), 0, 0);';

      default:
        return '[Unsupported converter: ' + typeId + ']';
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  _wrap(str) {
    const words = str.split(',');
    const lines = [];
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const w = words[i].trim();
      if ((line + w).length > 80) { lines.push(line.trim().replace(/,$/, '')); line = ''; }
      line += w + ', ';
    }
    if (line) lines.push(line.replace(/, $/, ''));
    return lines.join('\n  ');
  }

  _buildMatrix(mode) {
    const p = this.imageData.data;
    const w = this.width, h = this.height;
    const matrix = [];
    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = p[i], g = p[i + 1], b = p[i + 2], a = p[i + 3];
        if (mode === 'rgb') row.push([r, g, b]);
        else if (mode === 'rgba') row.push([r, g, b, a]);
        else if (mode === 'gray') row.push(Math.floor(0.299 * r + 0.587 * g + 0.114 * b));
        else if (mode === 'hsl') row.push(this._rgbToHsl(r, g, b));
        else if (mode === 'hsv') row.push(this._rgbToHsv(r, g, b));
        else if (mode === 'cmyk') row.push(this._rgbToCmyk(r, g, b));
        else if (mode === 'yuv') row.push(this._rgbToYuv(r, g, b));
      }
      matrix.push(row);
    }
    return matrix;
  }

  _rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  _rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
  }

  _rgbToCmyk(r, g, b) {
    let c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255;
    const k = Math.min(c, m, y);
    if (k === 1) return [0, 0, 0, 100];
    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);
    return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)];
  }

  _rgbToYuv(r, g, b) {
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const u = -0.14713 * r - 0.28886 * g + 0.436 * b + 128;
    const v = 0.615 * r - 0.51499 * g - 0.10001 * b + 128;
    return [Math.round(y), Math.round(u), Math.round(v)];
  }

  _buildXYZ() {
    const p = this.imageData.data;
    const out = [];
    for (let i = 0; i < this.width * this.height; i++) {
      const r = p[i * 4], g = p[i * 4 + 1], b = p[i * 4 + 2];
      const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 95.047;
      const Y = (0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / 100;
      const Z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 108.883;
      out.push([+X.toFixed(4), +Y.toFixed(4), +Z.toFixed(4)]);
    }
    return out;
  }

  _histogram() {
    const p = this.imageData.data;
    const hist = { r: new Array(256).fill(0), g: new Array(256).fill(0), b: new Array(256).fill(0) };
    for (let i = 0; i < this.width * this.height; i++) {
      hist.r[p[i * 4]]++;
      hist.g[p[i * 4 + 1]]++;
      hist.b[p[i * 4 + 2]]++;
    }
    return hist;
  }

  _asciiArt(gray, w, h) {
    const chars = '@%#*+=-:. ';
    let art = '';
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x++) {
        const idx = Math.floor(gray[y * w + x] / 255 * (chars.length - 1));
        art += chars[idx];
      }
      art += '\n';
    }
    return art;
  }

  _brailleArt(gray, w, h) {
    let art = '';
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 2) {
        let bits = 0;
        for (let dy = 0; dy < 4; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const px = x + dx, py = y + dy;
            if (px < w && py < h && gray[py * w + px] > 128) bits |= 1 << (dy * 2 + dx);
          }
        }
        art += String.fromCharCode(0x2800 + bits);
      }
      art += '\n';
    }
    return art;
  }

  _blockArt(gray, w, h) {
    const blocks = [' ', '▘', '▝', '▀', '▖', '▌', '▞', '▛', '▗', '▚', '▐', '▜', '▄', '▙', '▟', '█'];
    let art = '';
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x++) {
        const top = gray[y * w + x] > 128 ? 1 : 0;
        const bottom = (y + 1 < h && gray[(y + 1) * w + x] > 128) ? 2 : 0;
        art += blocks[top | bottom];
      }
      art += '\n';
    }
    return art;
  }

  _emojiArt(gray, w, h) {
    const emojis = ['⚫', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚪'];
    let art = '';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = Math.floor(gray[y * w + x] / 255 * (emojis.length - 1));
        art += emojis[idx];
      }
      art += '\n';
    }
    return art;
  }

  _pixelGrid(gray, w, h) {
    let grid = '';
    const maxW = Math.min(w, 40), maxH = Math.min(h, 20);
    for (let y = 0; y < maxH; y++) {
      for (let x = 0; x < maxW; x++) grid += gray[y * w + x] < 128 ? '⬛' : '⬜';
      grid += '\n';
    }
    if (h > 20 || w > 40) grid += '\n... (truncated to ' + maxW + '×' + maxH + ')';
    return grid;
  }

  _heatmap(gray, w, h) {
    const chars = ' ░▒▓█';
    let art = '';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = Math.floor(gray[y * w + x] / 255 * (chars.length - 1));
        art += chars[idx];
      }
      art += '\n';
    }
    return art;
  }

  _rle(gray) {
    const pairs = [];
    let count = 1;
    for (let i = 1; i <= gray.length; i++) {
      if (i < gray.length && gray[i] === gray[i - 1]) count++;
      else { pairs.push([gray[i - 1], count]); count = 1; }
    }
    return JSON.stringify(pairs);
  }

  _delta(gray) {
    const out = [gray[0]];
    for (let i = 1; i < gray.length; i++) out.push(gray[i] - gray[i - 1]);
    return JSON.stringify(out);
  }

  _svgTrace(gray, w, h) {
    if (w * h > 2500) return '<svg> <!-- Image too large for SVG trace (max 2500 pixels). --></svg>';
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = gray[y * w + x];
        svg += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="rgb(' + v + ',' + v + ',' + v + ')"/>';
      }
    }
    return svg + '</svg>';
  }

  async _hash(alg, gray) {
    const buf = await crypto.subtle.digest(alg, gray);
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  _crc32(gray) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < gray.length; i++) {
      crc ^= gray[i];
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) * 0xEDB88320);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  _toBase32(gray) {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (let i = 0; i < gray.length; i++) bits += gray[i].toString(2).padStart(8, '0');
    let out = '';
    for (let i = 0; i < bits.length; i += 5) out += alpha[parseInt(bits.substr(i, 5).padEnd(5, '0'), 2)];
    return out;
  }

  _toBase85(gray) {
    let out = '<~';
    for (let i = 0; i < gray.length; i += 4) {
      let val = 0;
      for (let j = 0; j < 4; j++) val = (val << 8) | (gray[i + j] || 0);
      for (let j = 0; j < 5; j++) { out += String.fromCharCode(33 + (val % 85)); val = Math.floor(val / 85); }
    }
    return out + '~>';
  }

  async _toBase64() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width; canvas.height = this.height;
    canvas.getContext('2d').putImageData(this.imageData, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
  }

  async _toDataURL() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width; canvas.height = this.height;
    canvas.getContext('2d').putImageData(this.imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }
}