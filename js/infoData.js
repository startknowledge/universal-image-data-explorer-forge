// Detailed descriptions for each converter (used by info (i) icon modal)
export const INFO_DATA = {
  // ===== A. Binary / Low Level =====
  binary: {
    title: "Binary (bits) Converter",
    body: `<p>Converts every pixel of your image into an 8-bit binary string, producing a single, continuous stream of 0s and 1s. Each pixel is first reduced to a weighted grayscale luminance value using the ITU-R BT.601 formula <code>Y = 0.299R + 0.587G + 0.114B</code>, then that value (0–255) is written as eight binary digits.</p>
    <p><b>Example:</b> a pure white pixel (255) becomes <code>11111111</code>; a pure black pixel (0) becomes <code>00000000</code>; the mid-grey value 170 becomes <code>10101010</code>.</p>
    <p><b>Typical use cases:</b> teaching binary representation, embedding images inside micro-controller firmware where each bit drives an LED or actuator, testing binary-to-image reconstruction algorithms, and generating test vectors for computer-science exams.</p>
    <p><b>Output format:</b> a single unbroken string of length <code>width × height × 8</code>. For a 100×100 image you will get 80,000 characters.</p>
    <p><b>Tip:</b> copy the output into the Revert card (binary format) with the same width and height to rebuild a grayscale version of the image.</p>`
  },
  hex: {
    title: "Hexadecimal Converter",
    body: `<p>Produces a space-separated hex dump of the grayscale byte stream. Each pixel is written as a two-digit lowercase hexadecimal number from <code>00</code> to <code>ff</code>, matching the byte-level layout used by hex editors, debuggers and logic analysers.</p>
    <p><b>Example:</b> white becomes <code>ff</code>, black becomes <code>00</code>, mid-grey 170 becomes <code>aa</code>.</p>
    <p><b>Typical use cases:</b> reverse-engineering proprietary image formats, comparing two images byte-by-byte, feeding data into embedded C compilers as a lookup table, and creating visualisation arrays for LED matrices.</p>
    <p><b>Output format:</b> <code>width × height</code> hex tokens separated by spaces.</p>`
  },
  octal: {
    title: "Octal Array Converter",
    body: `<p>Emits the grayscale byte stream as decimal-like octal numbers (base-8), comma-separated. Octal is rarely used in modern computing but remains a favourite in Unix permissions, legacy PDP-11 systems and some assembly-language tutorials.</p>
    <p><b>Example:</b> 255 becomes <code>377</code>, 128 becomes <code>200</code>, 64 becomes <code>100</code>.</p>
    <p><b>Use cases:</b> educational demonstrations of base conversion, legacy system development, and homework problems involving number bases.</p>`
  },
  byteArray: {
    title: "Byte Array Converter",
    body: `<p>Wraps the grayscale byte stream inside square brackets as a JavaScript-style array literal: <code>[170,170,170,...]</code>. Every value is a decimal integer between 0 and 255.</p>
    <p><b>Use cases:</b> pasting directly into a JavaScript console, feeding into WebGL textures, writing JSON configuration files, and testing image-processing functions in Node.js.</p>
    <p><b>Note:</b> for very large images the output is huge — consider the raw .bin download instead.</p>`
  },
  uint8Array: {
    title: "Uint8Array Converter",
    body: `<p>Emits a ready-to-use JavaScript <code>Uint8Array</code> constructor call: <code>new Uint8Array([...])</code>. This is the exact object type required by the browser's <code>ImageData</code> API, so you can paste the output directly into the browser console and feed it to <code>ctx.putImageData()</code>.</p>
    <p><b>Use cases:</b> rapid prototyping of canvas-based image processors, unit tests for pixel manipulators, and inline embedding of small images inside a single HTML file.</p>`
  },
  int16Array: {
    title: "Int16Array Converter",
    body: `<p>Wraps the byte stream in an <code>Int16Array</code> literal. Although the grayscale values fit in 8 bits, some algorithms (e.g. Sobel, Gaussian blur, convolution) promote pixel values to 16-bit signed integers to prevent overflow during intermediate computations.</p>
    <p><b>Use cases:</b> computer-vision edge detectors, image filters, and DSP pipelines.</p>`
  },
  int32Array: {
    title: "Int32Array Converter",
    body: `<p>Wraps the byte stream in an <code>Int32Array</code> literal. Used when pixel values are accumulated across multiple passes (for example in histogram equalisation or integral image computation) and 16-bit is not wide enough.</p>`
  },
  float32Array: {
    title: "Float32Array Converter",
    body: `<p>Emits a normalised <code>Float32Array</code> where every pixel value is divided by 255, producing a decimal number between 0.0 and 1.0. This is the format expected by most deep-learning frameworks (TensorFlow.js, PyTorch, ONNX Runtime) when loading image tensors.</p>
    <p><b>Use cases:</b> feeding a canvas image directly into a neural network in the browser, normalising inputs for computer-vision pipelines, and unit-testing ML pre-processing code.</p>`
  },
  bitStream: {
    title: "Bit Stream Converter",
    body: `<p>Similar to Binary but without zero-padding — each pixel becomes its shortest binary representation. This is useful for compression experiments and for teaching how variable-length encoding works.</p>`
  },

  // ===== B. Encoding =====
  base64: {
    title: "Base64 Converter",
    body: `<p>Renders the image using the standard RFC 4648 Base64 alphabet (A–Z, a–z, 0–9, +, /) with padding. Base64 is the most common way to embed binary image data inside text-only channels such as JSON, XML, email or HTML attributes.</p>
    <p><b>Use cases:</b> embedding a small logo directly inside a CSS file, sending an image inside a JWT payload, uploading an image over a text-only API, and storing images in localStorage.</p>
    <p><b>Note:</b> Base64 inflates size by ~33% compared to the raw bytes. For large photos, prefer the raw .bin download.</p>`
  },
  base32: {
    title: "Base32 Converter",
    body: `<p>Encodes the byte stream using RFC 4648 Base32 (A–Z, 2–7). Base32 is case-insensitive and avoids visually ambiguous characters, making it ideal for human transcription — for example two-factor authentication recovery codes, DNS TXT records and product licence keys.</p>
    <p><b>Use cases:</b> embedding image hashes in QR codes or DNS, generating shareable image identifiers, and any environment where Base64's <code>+</code> and <code>/</code> characters would break the transport.</p>`
  },
  base85: {
    title: "Base85 (Ascii85) Converter",
    body: `<p>Encodes the byte stream using the Ascii85 alphabet used by Adobe PostScript and PDF. Ascii85 is more compact than Base64 — roughly 25% overhead instead of 33%. The output is wrapped in <code>&lt;~</code> … <code>~&gt;</code> markers, matching the standard PDF binary-data convention.</p>
    <p><b>Use cases:</b> embedding images inside PostScript or PDF streams, compressing textual payloads for Git binary patches, and any transport where every byte counts.</p>`
  },
  dataURL: {
    title: "Data URL Converter",
    body: `<p>Produces a complete <code>data:image/png;base64,...</code> URL that can be pasted directly into the browser address bar, an <code>&lt;img src&gt;</code> attribute, or a CSS <code>background-image</code> rule. The browser will render the image immediately without any network request.</p>
    <p><b>Use cases:</b> single-file HTML reports, email signatures with embedded images, offline-first web apps, and sharing one-click previews.</p>`
  },
  urlEncoded: {
    title: "URL Encoded Converter",
    body: `<p>Takes the Base64 representation and percent-encodes it using <code>encodeURIComponent</code>, producing a string that is safe to place inside a query-string parameter. This is useful when you need to pass an image through a URL-based API without using multipart form uploads.</p>`
  },
  asciiText: {
    title: "ASCII Text Converter",
    body: `<p>Interprets the grayscale byte stream as ASCII characters. Bytes that fall outside the printable range are simply skipped. The result is a garbled but human-viewable string — occasionally useful for steganography demonstrations.</p>`
  },
  utf8Text: {
    title: "UTF-8 Text Converter",
    body: `<p>Decodes the grayscale byte stream through a UTF-8 TextDecoder. Any invalid byte sequence is replaced by the Unicode replacement character. This is primarily of interest to students of text encoding who want to see how arbitrary binary data is interpreted as text.</p>`
  },
  jsonData: {
    title: "JSON Data Converter",
    body: `<p>Emits a structured JSON document containing the image width, height and full grayscale array. Unlike the byte-array output (which is just numbers), this JSON object is self-describing, so downstream tools know the geometry without needing external metadata.</p>
    <p><b>Use cases:</b> REST API payloads, teaching JSON structure, and feeding image data into Python or R notebooks via a copy-paste round trip.</p>`
  },

  // ===== C. Pixel Data =====
  rgbMatrix: {
    title: "RGB Matrix Converter",
    body: `<p>Produces a nested 2-D array <code>[[[r,g,b],[r,g,b],...],...]</code> where each inner triple represents one pixel's red, green and blue channels. This is the canonical raw format used by image-processing libraries such as OpenCV, Pillow and scikit-image.</p>
    <p><b>Use cases:</b> statistical colour analysis, colour clustering (k-means), histogram construction, and feeding colour data into ML pipelines that need the original channels rather than grayscale.</p>
    <p><b>Note:</b> the output is huge — a 500×500 image produces 750,000 integers.</p>`
  },
  rgbaMatrix: {
    title: "RGBA Matrix Converter",
    body: `<p>Same as the RGB Matrix but with a fourth alpha channel: <code>[[[r,g,b,a],...],...]</code>. Alpha values are 0 (transparent) to 255 (opaque). Essential when working with PNG images that have transparency.</p>`
  },
  grayscaleMatrix: {
    title: "Grayscale Matrix Converter",
    body: `<p>Emits a nested 2-D array of grayscale bytes — the same values used internally by every other converter. Useful when you want a matrix layout but don't need colour information.</p>`
  },
  hslMatrix: {
    title: "HSL Matrix Converter",
    body: `<p>Converts every RGB triple into HSL (Hue 0–360°, Saturation 0–100%, Lightness 0–100%). HSL is more intuitive for designers than RGB because it separates the "colour" from the "brightness".</p>
    <p><b>Use cases:</b> recolouring logos, generating harmonious palettes, and building colour-based search indexes.</p>`
  },
  hsvMatrix: {
    title: "HSV Matrix Converter",
    body: `<p>Converts to HSV (Hue, Saturation, Value). HSV is preferred in computer vision because value is independent of hue — so illumination changes affect only V. Used by OpenCV's <code>inRange</code> colour segmentation.</p>`
  },
  cmykMatrix: {
    title: "CMYK Matrix Converter",
    body: `<p>Converts to the subtractive CMYK colour model used in printing (Cyan, Magenta, Yellow, Black; each 0–100%). Useful for prepress analysis and for checking whether an image will print acceptably.</p>`
  },
  yuvMatrix: {
    title: "YUV Matrix Converter",
    body: `<p>Converts to YUV, the colour space used in PAL, SECAM and most video-codec pipelines. Y is luminance; U and V are chrominance. The conversion uses ITU-R BT.601 weights and offsets chroma by 128 to keep values unsigned.</p>`
  },
  labColor: {
    title: "LAB Color Data Converter",
    body: `<p>Approximates the CIE XYZ colour space, the pre-step to CIELAB. XYZ is a device-independent colour space anchored to the D65 white point. Useful for colour-difference metrics (ΔE) and colour matching.</p>`
  },
  colorHistogram: {
    title: "Color Histogram Converter",
    body: `<p>Emits three 256-bin arrays (one each for R, G, B) counting how often each intensity appears. Histograms are the foundation of histogram-equalisation contrast enhancement and of colour-based image retrieval.</p>`
  },

  // ===== D. Programming =====
  cArray: {
    title: "C Array Converter",
    body: `<p>Emits a ready-to-compile C source line: <code>unsigned char img[N] = { ... };</code>. Drop it into any C or Arduino sketch and you can draw the image on an OLED or TFT display with a single loop.</p>`
  },
  cppArray: {
    title: "C++ Array Converter",
    body: `<p>Emits a <code>std::array&lt;unsigned char, N&gt;</code> initialiser, ready for modern C++17 and later. Keeps type safety and constexpr-friendliness.</p>`
  },
  pythonBytes: {
    title: "Python Bytes Converter",
    body: `<p>Emits <code>img_bytes = bytes([...])</code>, ready to paste into a Python script or Jupyter notebook. Feed it to <code>numpy.frombuffer()</code> or write it to disk with <code>open("out.raw","wb").write(img_bytes)</code>.</p>`
  },
  javaByteArray: {
    title: "Java byte[] Converter",
    body: `<p>Emits <code>byte[] imgData = { ... };</code>. Java byte values are signed, so values above 127 will appear as negatives when pasted — use <code>&amp; 0xFF</code> when reading them back.</p>`
  },
  goSlice: {
    title: "Go Byte Slice Converter",
    body: `<p>Emits <code>img := []byte{...}</code>, ready for <code>image.NewGray</code> or direct pixel rendering in Go.</p>`
  },
  rustArray: {
    title: "Rust Byte Array Converter",
    body: `<p>Emits <code>let img: [u8; N] = [...];</code>. Const-usable inside <code>const</code> or <code>static</code> blocks in embedded Rust (no_std).</p>`
  },
  jsBuffer: {
    title: "JavaScript Buffer Converter",
    body: `<p>Emits <code>Buffer.from([...])</code> for Node.js. Also works in Electron and in browsers via the Buffer polyfill. Ideal for server-side image manipulation with sharp or jimp.</p>`
  },
  phpBinary: {
    title: "PHP Binary String Converter",
    body: `<p>Emits a PHP double-quoted string containing the raw bytes, ready for <code>imagecreatefromstring()</code>.</p>`
  },
  swiftData: {
    title: "Swift Data Converter",
    body: `<p>Emits <code>Data([...])</code>, ready to feed into <code>UIImage(data:)</code> on iOS or macOS.</p>`
  },
  kotlinByteArray: {
    title: "Kotlin ByteArray Converter",
    body: `<p>Emits <code>byteArrayOf(...)</code>, ready for Android's <code>BitmapFactory.decodeByteArray</code>.</p>`
  },

  // ===== E. Visualization =====
  asciiArt: {
    title: "ASCII Art Converter",
    body: `<p>Renders the image using 10 ASCII characters ranked by darkness (<code>@%#*+=-:. </code>). The image is sampled every two rows to compensate for the tall aspect ratio of terminal fonts.</p>
    <p><b>Use cases:</b> terminal previews, comment banners, README images, and teaching how grayscale works.</p>`
  },
  brailleArt: {
    title: "Braille Art Converter",
    body: `<p>Uses Unicode Braille patterns (U+2800–U+28FF) to render 2×4 pixel blocks per character. Because Braille packs 8 pixels into one glyph, the result is roughly 8× denser than ASCII art. Excellent for high-resolution terminal previews.</p>`
  },
  blockArt: {
    title: "Block Art Converter",
    body: `<p>Uses Unicode block-drawing characters (▘▝▀▖▌▞▛▗▚▐▜▄▙▟█) to render 2 pixels per character. Produces a smoother look than pure ASCII.</p>`
  },
  emojiArt: {
    title: "Emoji Art Converter",
    body: `<p>Maps each pixel to one of eight coloured emoji (⚫🔴🟠🟡🟢🔵🟣⚪) based on hue and brightness. Great for sharing playful previews on chat apps.</p>`
  },
  pixelGrid: {
    title: "Pixel Grid Converter",
    body: `<p>Emits a black-and-white grid using ⬛ and ⬜ characters, thresholded at 128. Truncated to the top-left 40×20 region for readability.</p>`
  },
  heatmap: {
    title: "Heatmap (ASCII) Converter",
    body: `<p>Uses shading characters (░▒▓█) to render brightness as apparent density — useful for quickly eyeballing exposure problems in an image.</p>`
  },

  // ===== F. Compression / Security =====
  rle: {
    title: "Run Length Encoding Converter",
    body: `<p>Emits <code>[[value, count], ...]</code> pairs, compressing consecutive identical pixels. RLE is the simplest lossless compression and was used in early PCX, BMP and TIFF formats.</p>
    <p><b>Use cases:</b> teaching compression, pre-compression before transport, and identifying images with large flat regions (icons, logos).</p>`
  },
  deltaEncoding: {
    title: "Delta Encoded Pixels Converter",
    body: `<p>Stores the first pixel as-is and every subsequent pixel as the signed difference from its predecessor. Delta encoding reduces entropy for images with smooth gradients — often 2× better than raw for photographs before a secondary compressor runs.</p>`
  },
  md5: {
    title: "MD5 Hash Converter",
    body: `<p>Computes the 128-bit MD5 message digest of the grayscale byte stream using the Web Crypto API. Output is 32 hex characters.</p>
    <p><b>Note:</b> MD5 is cryptographically broken for adversarial use (chosen-prefix collisions exist) but remains fine for non-adversarial fingerprinting, cache keys and duplicate detection.</p>`
  },
  sha1: {
    title: "SHA-1 Hash Converter",
    body: `<p>Computes the 160-bit SHA-1 digest, output as 40 hex characters. SHA-1 is deprecated for cryptographic signatures but is still widely used in Git object IDs.</p>`
  },
  sha256: {
    title: "SHA-256 Hash Converter",
    body: `<p>Computes the 256-bit SHA-256 digest, output as 64 hex characters. This is the recommended hash for integrity checks, digital signatures and blockchain anchoring.</p>`
  },
  crc32: {
    title: "CRC32 Checksum Converter",
    body: `<p>Computes the IEEE 802.3 CRC-32 checksum, output as 8 hex characters. CRC-32 is used inside ZIP, PNG and Gzip for detecting accidental corruption.</p>`
  },

  // ===== G. AI / Data Science =====
  numpyArray: {
    title: "NumPy Array Converter",
    body: `<p>Emits <code>np.array([...]).reshape(H, W)</code>, ready to paste into a Jupyter notebook. The reshape makes the 1-D byte stream into a 2-D matrix matching the original image geometry.</p>`
  },
  tensor: {
    title: "TensorFlow Tensor Converter",
    body: `<p>Emits <code>tf.tensor([...], [H, W, 1])</code>, ready for TensorFlow.js or Python TensorFlow. The trailing 1 is the channel dimension (grayscale).</p>`
  },
  csvPixel: {
    title: "CSV Pixel Data Converter",
    body: `<p>Emits one row per pixel in the format <code>x,y,value</code>. Ready to import into Excel, Google Sheets, R or any pandas <code>read_csv()</code> call.</p>`
  },
  pandasDF: {
    title: "Pandas DataFrame Converter",
    body: `<p>Emits a Python <code>pd.DataFrame(...)</code> constructor that produces a long-format table with columns <code>pixel</code>, <code>x</code> and <code>y</code>. Ideal for exploratory data analysis of image statistics.</p>`
  },
  featureVector: {
    title: "Feature Vector Converter",
    body: `<p>Emits a plain 1-D array of the grayscale values — the simplest possible feature vector for classical machine-learning classifiers (SVM, k-NN, random forest) applied to image data.</p>`
  },

  // ===== H. Web =====
  svgTrace: {
    title: "SVG Trace (basic) Converter",
    body: `<p>Generates an SVG document in which every pixel becomes a 1×1 <code>&lt;rect&gt;</code>. This is a "raster-to-vector" trace and is limited to small images (≤ 2,500 pixels) because file size grows quadratically. For real vectorisation, use potrace or vtracer.</p>`
  },
  cssDataUri: {
    title: "CSS Data URI Converter",
    body: `<p>Emits a ready-to-paste CSS rule: <code>background-image: url('data:image/png;base64,...');</code>. Drop it inside a stylesheet to embed the image without a separate file request.</p>`
  },
  canvasData: {
    title: "Canvas ImageData Converter",
    body: `<p>Emits a <code>ctx.putImageData(...)</code> call containing the full RGBA byte stream. Because the raw RGBA array is 4× the size of grayscale, this converter is limited to images under 10,000 pixels.</p>`
  }
};