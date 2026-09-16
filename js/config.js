// Grouped conversion definitions (60+ formats)
// ============================================================
// Universal Image Data Explorer Forge — Converter Registry
// File: js/config.js
// ============================================================

export const CONVERSION_GROUPS = [
  {
    name: "A. Binary / Low Level Data",
    icon: "fa-solid fa-database",
    items: [
      { id: "binary", name: "Binary (bits)" },
      { id: "hex", name: "Hexadecimal" },
      { id: "octal", name: "Octal Array" },
      { id: "byteArray", name: "Byte Array" },
      { id: "uint8Array", name: "Uint8 Array" },
      { id: "int16Array", name: "Int16 Array" },
      { id: "int32Array", name: "Int32 Array" },
      { id: "float32Array", name: "Float32 Array" },
      { id: "bitStream", name: "Bit Stream" }
    ]
  },
  {
    name: "B. Encoding Formats",
    icon: "fa-solid fa-code",
    items: [
      { id: "base64", name: "Base64" },
      { id: "base32", name: "Base32" },
      { id: "base85", name: "Base85 (Ascii85)" },
      { id: "dataURL", name: "Data URL" },
      { id: "urlEncoded", name: "URL Encoded" },
      { id: "asciiText", name: "ASCII Text" },
      { id: "utf8Text", name: "UTF-8 Text" },
      { id: "jsonData", name: "JSON Data" }
    ]
  },
  {
    name: "C. Pixel Data Formats",
    icon: "fa-solid fa-palette",
    items: [
      { id: "rgbMatrix", name: "RGB Matrix" },
      { id: "rgbaMatrix", name: "RGBA Matrix" },
      { id: "grayscaleMatrix", name: "Grayscale Matrix" },
      { id: "hslMatrix", name: "HSL Matrix" },
      { id: "hsvMatrix", name: "HSV Matrix" },
      { id: "cmykMatrix", name: "CMYK Matrix" },
      { id: "yuvMatrix", name: "YUV Matrix" },
      { id: "labColor", name: "LAB Color Data" },
      { id: "colorHistogram", name: "Color Histogram" }
    ]
  },
  {
    name: "D. Programming Languages",
    icon: "fa-solid fa-laptop-code",
    items: [
      { id: "cArray", name: "C Array (uint8)" },
      { id: "cppArray", name: "C++ Array" },
      { id: "pythonBytes", name: "Python Bytes" },
      { id: "javaByteArray", name: "Java byte[]" },
      { id: "goSlice", name: "Go Byte Slice" },
      { id: "rustArray", name: "Rust Byte Array" },
      { id: "jsBuffer", name: "JavaScript Buffer" },
      { id: "phpBinary", name: "PHP Binary String" },
      { id: "swiftData", name: "Swift Data" },
      { id: "kotlinByteArray", name: "Kotlin ByteArray" }
    ]
  },
  {
    name: "E. Visualization Formats",
    icon: "fa-solid fa-chart-simple",
    items: [
      { id: "asciiArt", name: "ASCII Art" },
      { id: "brailleArt", name: "Braille Art" },
      { id: "blockArt", name: "Block Art" },
      { id: "emojiArt", name: "Emoji Art" },
      { id: "pixelGrid", name: "Pixel Grid" },
      { id: "heatmap", name: "Heatmap (ASCII)" }
    ]
  },
  {
    name: "F. Compression / Security",
    icon: "fa-solid fa-shield-halved",
    items: [
      { id: "rle", name: "Run Length Encoding" },
      { id: "deltaEncoding", name: "Delta Encoded Pixels" },
      { id: "md5", name: "MD5 Hash" },
      { id: "sha1", name: "SHA1 Hash" },
      { id: "sha256", name: "SHA256 Hash" },
      { id: "crc32", name: "CRC32 Checksum" }
    ]
  },
  {
    name: "G. AI / Data Science",
    icon: "fa-solid fa-brain",
    items: [
      { id: "numpyArray", name: "NumPy Array" },
      { id: "tensor", name: "Tensor (3D)" },
      { id: "csvPixel", name: "CSV Pixel Data" },
      { id: "pandasDF", name: "Pandas DataFrame" },
      { id: "featureVector", name: "Feature Vector" }
    ]
  },
  {
    name: "H. Web / Browser Formats",
    icon: "fa-solid fa-globe",
    items: [
      { id: "svgTrace", name: "SVG Trace (basic)" },
      { id: "cssDataUri", name: "CSS Data URI" },
      { id: "canvasData", name: "Canvas ImageData" }
    ]
  }
];

// Maps each converter ID to its processing function name (implemented in main processor)
export const converterFunctionMap = {
  binary: "toBinary", hex: "toHex", octal: "toOctal", byteArray: "toByteArray",
  uint8Array: "toUint8Array", int16Array: "toInt16Array", int32Array: "toInt32Array",
  float32Array: "toFloat32Array", bitStream: "toBitStream",
  base64: "toBase64", base32: "toBase32", base85: "toBase85", dataURL: "toDataURL",
  urlEncoded: "toUrlEncoded", asciiText: "toAsciiText", utf8Text: "toUtf8Text", jsonData: "toJsonData",
  rgbMatrix: "toRgbMatrix", rgbaMatrix: "toRgbaMatrix", grayscaleMatrix: "toGrayscaleMatrix",
  hslMatrix: "toHslMatrix", hsvMatrix: "toHsvMatrix", cmykMatrix: "toCmykMatrix", yuvMatrix: "toYuvMatrix",
  labColor: "toLabColor", colorHistogram: "toColorHistogram",
  cArray: "toCArray", cppArray: "toCppArray", pythonBytes: "toPythonBytes", javaByteArray: "toJavaByteArray",
  goSlice: "toGoSlice", rustArray: "toRustArray", jsBuffer: "toJsBuffer", phpBinary: "toPhpBinary",
  swiftData: "toSwiftData", kotlinByteArray: "toKotlinByteArray",
  asciiArt: "toAsciiArt", brailleArt: "toBrailleArt", blockArt: "toBlockArt", emojiArt: "toEmojiArt",
  pixelGrid: "toPixelGrid", heatmap: "toHeatmap",
  rle: "toRLE", deltaEncoding: "toDeltaEncoding", md5: "toMD5", sha1: "toSHA1", sha256: "toSHA256", crc32: "toCRC32",
  numpyArray: "toNumpyArray", tensor: "toTensor", csvPixel: "toCSV", pandasDF: "toPandasDF", featureVector: "toFeatureVector",
  svgTrace: "toSvgTrace", cssDataUri: "toCssDataUri", canvasData: "toCanvasData"
};