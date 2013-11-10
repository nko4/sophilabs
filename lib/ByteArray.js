/*
 * ByteArray.js
 *
 * Modified version for MacGifer
 */

function ByteArray() {
  this.page = -1;
  this.pages = [];
  this.onWriteCallback = function(val) {};
}

ByteArray.pageSize = 4096;

ByteArray.prototype.writeByte = function(val) {
  this.onWriteCallback(val);
};

ByteArray.prototype.writeUTFBytes = function(string) {
  for (var l = string.length, i = 0; i < l; i++)
    this.writeByte(string.charCodeAt(i));
};

ByteArray.prototype.writeBytes = function(array, offset, length) {
  for (var l = length || array.length, i = offset || 0; i < l; i++)
    this.writeByte(array[i]);
};

ByteArray.prototype.onWrite = function(callback) {
  this.onWriteCallback = callback;
};

if (typeof module !== 'undefined') {
    module.exports = ByteArray;
}
