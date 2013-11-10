/*
 * GIFEncoder.js
 *
 * Authors
 * Kevin Weiner (original Java version - kweiner@fmsware.com)
 * Thibault Imbert (AS3 version - bytearray.org)
 * Johan Nordberg (JS version - code@johan-nordberg.com)
 *
 * Modified version for MacGifer
 */

if (typeof module !== 'undefined') {
    var NeuQuant = require('./TypedNeuQuant.js');
    var LZWEncoder = require('./LZWEncoder.js');
    var ByteArray = require('./ByteArray.js');
}

/**
 * GIF encoder.
 */
function GIFEncoder(width, height) {
  // image size
  this.width = ~~width;
  this.height = ~~height;

  // transparent color if given
  this.transparent = null;

  // transparent index in color table
  this.transIndex = 0;

  // frame delay (hundredths)
  this.delay = 0;

  this.image = null; // current frame
  this.pixels = null; // BGR byte array from frame
  this.indexedPixels = null; // converted frame indexed to palette
  this.colorTab = null; // RGB palette
  this.usedEntry = new Array(); // active palette entries
  this.colorDepth = 8; // number of bit planes
  this.palSize = this.colorDepth - 1; // color table size (bits-1)
  this.dispose = -1; // disposal code (-1 = use default)
  this.sample = 10; // default sample interval for quantizer

  this.out = new ByteArray();
}


/**
 * Set the delay time between each frame, or change it for subsequent frames
 * (applies to last frame added).
 */
GIFEncoder.prototype.setDelay = function(milliseconds) {
  this.delay = Math.round(milliseconds / 10);
};

/**
 * Set frame rate in frames per second.
 */
GIFEncoder.prototype.setFrameRate = function(fps) {
  this.delay = Math.round(100 / fps);
};

/*
 * Set the GIF frame disposal code for the last added frame and any subsequent 
 * frames. Default is 0 if no transparent color has been set, otherwise 2.
 */
GIFEncoder.prototype.setDispose = function(disposalCode) {
  if (disposalCode >= 0) this.dispose = disposalCode;
};

/*
 * Set the transparent color for the last added frame and any subsequent
 * frames. Since all colors are subject to modification in the quantization
 * process, the color in the final palette for each frame closest to the given
 * color becomes the transparent color for that frame. May be set to null to
 * indicate no transparent color.
 */
GIFEncoder.prototype.setTransparent = function(color) {
  this.transparent = color;
};

/*
 * Add next GIF frame. The frame is not written immediately, but is
 * actually deferred until the next frame is received so that timing
 * data can be inserted.  Invoking finish() flushes all frames.
 */
GIFEncoder.prototype.addFrame = function(imageData) {
  this.image = imageData;

  this.getImagePixels(); // convert to correct format if necessary
  this.analyzePixels(); // build color table & map pixels

  this.writeGraphicCtrlExt(); // write graphic control extension
  this.writeImageDesc(); // image descriptor
  this.writeLocalPalette(); // local color table
  this.writePixels(); // encode and write pixel data
};

/*
 * Add final trailer to the GIF stream, if you don't call the finish method
 * the GIF stream will not be valid.
 */
GIFEncoder.prototype.finish = function() {
  this.out.writeByte(0x3b); // gif trailer
};

/*
 * Set quality of color quantization (conversion of images to the maximum 256
 * colors allowed by the GIF specification). Lower values (minimum = 1)
 * produce better colors, but slow processing significantly. 10 is the
 * default, and produces good color mapping at reasonable speeds. Values
 * greater than 20 do not yield significant improvements in speed.
 */
GIFEncoder.prototype.setQuality = function(quality) {
  if (quality < 1) quality = 20;
  this.sample = quality;
};

/*
 * Write GIF file header
 */
GIFEncoder.prototype.writeHeader = function() {
  this.out.writeUTFBytes("GIF89a");
};

/*
 * Analyze the current frame colors and create a color map.
 */
GIFEncoder.prototype.analyzePixels = function() {
  var len = this.pixels.length;
  var nPix = len / 3;

  this.indexedPixels = new Uint8Array(nPix);

  var imgq = new NeuQuant(this.pixels, this.sample);
  imgq.buildColormap(); // create reduced palette
  this.colorTab = imgq.getColormap();

  // map image pixels to new palette
  var k = 0;
  for (var j = 0; j < nPix; j++) {
    var index = imgq.lookupRGB(
      this.pixels[k++] & 0xff,
      this.pixels[k++] & 0xff,
      this.pixels[k++] & 0xff
    );
    this.usedEntry[index] = true;
    this.indexedPixels[j] = index;
  }

  this.pixels = null;

  // get closest match to transparent color if specified
  if (this.transparent !== null) {
    this.transIndex = this.findClosest(this.transparent);
  }
};

/*
 * Return index of palette color closest to c.
 */
GIFEncoder.prototype.findClosest = function(c) {
  if (this.colorTab === null) return -1;

  var r = (c & 0xFF0000) >> 16;
  var g = (c & 0x00FF00) >> 8;
  var b = (c & 0x0000FF);
  var minpos = 0;
  var dmin = 256 * 256 * 256;
  var len = this.colorTab.length;

  for (var i = 0; i < len;) {
    var dr = r - (this.colorTab[i++] & 0xff);
    var dg = g - (this.colorTab[i++] & 0xff);
    var db = b - (this.colorTab[i] & 0xff);
    var d = dr * dr + dg * dg + db * db;
    var index = i / 3;
    if (this.usedEntry[index] && (d < dmin)) {
      dmin = d;
      minpos = index;
    }
    i++;
  }

  return minpos;
};

/*
 * Extract image pixels into byte array pixels (remove alphachannel from
 * canvas imagedata).
 */
GIFEncoder.prototype.getImagePixels = function() {
  var w = this.width;
  var h = this.height;
  this.pixels = new Uint8Array(w * h * 3);

  var data = this.image;
  var count = 0;

  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      var b = (i * w * 4) + j * 4;
      this.pixels[count++] = data[b];
      this.pixels[count++] = data[b+1];
      this.pixels[count++] = data[b+2];
    }
  }
};

/*
 * Write Graphic Control Extension.
 */
GIFEncoder.prototype.writeGraphicCtrlExt = function() {
  this.out.writeByte(0x21); // extension introducer
  this.out.writeByte(0xf9); // GCE label
  this.out.writeByte(4); // data block size

  var transp, disp;
  if (this.transparent === null) {
    transp = 0;
    disp = 0; // dispose = no action
  } else {
    transp = 1;
    disp = 2; // force clear if using transparent color
  }

  if (this.dispose >= 0) {
    disp = dispose & 7; // user override
  }
  disp <<= 2;

  // packed fields
  this.out.writeByte(
    0 | // 1:3 reserved
    disp | // 4:6 disposal
    0 | // 7 user input - 0 = none
    transp // 8 transparency flag
  );

  this.writeShort(this.delay); // delay x 1/100 sec
  this.out.writeByte(this.transIndex); // transparent color index
  this.out.writeByte(0); // block terminator
};

/*
 * Write Image Descriptor.
 */
GIFEncoder.prototype.writeImageDesc = function() {
  this.out.writeByte(0x2c); // image separator
  this.writeShort(0); // image position x,y = 0,0
  this.writeShort(0);
  this.writeShort(this.width); // image size
  this.writeShort(this.height);

  // specify normal LCT
  this.out.writeByte(
    0x80 | // 1 local color table 1=yes
    0 | // 2 interlace - 0=no
    0 | // 3 sorted - 0=no
    0 | // 4-5 reserved
    this.palSize // 6-8 size of color table
  );
};

/*
 * Write Logical Screen Descriptor.
 */
GIFEncoder.prototype.writeLSD = function() {
  // logical screen size
  this.writeShort(this.width);
  this.writeShort(this.height);

  // packed fields
  this.out.writeByte(
    0x80 | // 1 : global color table flag = 1 (gct used)
    0x70 | // 2-4 : color resolution = 7
    0x00 | // 5 : gct sort flag = 0
    0x00 // 6-8 : gct size
  );

  this.out.writeByte(0); // background color index
  this.out.writeByte(0); // pixel aspect ratio - assume 1:1
};

/**
 * Write global color table.
 */
GIFEncoder.prototype.writeGlobalPalette = function() {
  for (var i = 0; i < 6; i++) {
    this.out.writeByte(0x00);
  }
};

/*
 * Write local color table.
 */
GIFEncoder.prototype.writeLocalPalette = function() {
  this.out.writeBytes(this.colorTab);
  var n = (3 * 256) - this.colorTab.length;
  for (var i = 0; i < n; i++)
    this.out.writeByte(0);
};

/*
 * Write short.
 */
GIFEncoder.prototype.writeShort = function(pValue) {
  this.out.writeByte(pValue & 0xFF);
  this.out.writeByte((pValue >> 8) & 0xFF);
};

/*
 * Encode and write pixel data.
 */
GIFEncoder.prototype.writePixels = function() {
  var enc = new LZWEncoder(this.width, this.height,
                           this.indexedPixels, this.colorDepth);
  enc.encode(this.out);
};

/*
 * Retrieve the GIF stream.
 */
GIFEncoder.prototype.stream = function() {
  return this.out;
};

if (typeof module !== 'undefined') {
    module.exports = GIFEncoder;
}
