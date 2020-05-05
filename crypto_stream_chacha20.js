const assert = require('nanoassert')

const constant = [1634760805, 857760878, 2036477234, 1797285236]

exports.crypto_stream_chacha20_KEYBYTES = 32
exports.crypto_stream_chacha20_NONCEBYTES = 8
exports.crypto_stream_chacha20_MESSAGEBYTES_MAX = Number.MAX_SAFE_INTEGER

exports.crypto_stream_chacha20_ietf_KEYBYTES = 32
exports.crypto_stream_chacha20_ietf_NONCEBYTES = 12
exports.crypto_stream_chacha20_ietf_MESSAGEBYTES_MAX = 2 ** 32

exports.crypto_stream_chacha20 = function (c, clen, n, k) {
  c.fill(0)
  exports.crypto_stream_chacha20_xor(c, 0, c, 0, 0, n, k)
}

exports.crypto_stream_chacha20_xor = function (c, cpos, m, mpos, clen, n, k) {
  assert(n.byteLength === exports.crypto_stream_chacha20_NONCEBYTES,
    'n should be crypto_stream_chacha20_NONCEBYTES')
  assert(k.byteLength === exports.crypto_stream_chacha20_KEYBYTES,
    'k should be crypto_stream_chacha20_KEYBYTES')

  var xor = new Chacha20(n, k)
  xor.update(c, m)
  xor.final()
}

exports.crypto_stream_chacha20_xor_ic = function (c, m, mlen, n, ic, k) {
  assert(n.byteLength === exports.crypto_stream_chacha20_NONCEBYTES,
    'n should be crypto_stream_chacha20_NONCEBYTES')
  assert(k.byteLength === exports.crypto_stream_chacha20_KEYBYTES,
    'k should be crypto_stream_chacha20_KEYBYTES')

  var xor = new Chacha20(n, k, ic)
  xor.update(c, m)
  xor.final()
}

exports.crypto_stream_chacha20_xor_instance = function (n, k) {
  assert(n.byteLength === exports.crypto_stream_chacha20_NONCEBYTES,
    'n should be crypto_stream_chacha20_NONCEBYTES')
  assert(k.byteLength === exports.crypto_stream_chacha20_KEYBYTES,
    'k should be crypto_stream_chacha20_KEYBYTES')

  return new Chacha20(n, k)
}

exports.crypto_stream_chacha20_ietf = function (c, clen, n, k) {
  c.fill(0)
  exports.crypto_stream_chacha20_ietf_xor(c, 0, c, 0, 0, n, k)
}

exports.crypto_stream_chacha20_ietf_xor = function (c, cpos, m, mpos, clen, n, k) {
  assert(n.byteLength === exports.crypto_stream_chacha20_ietf_NONCEBYTES,
    'n should be crypto_stream_chacha20_ietf_NONCEBYTES')
  assert(k.byteLength === exports.crypto_stream_chacha20_ietf_KEYBYTES,
    'k should be crypto_stream_chacha20_ietf_KEYBYTES')

  var xor = new Chacha20(n, k)
  xor.update(c, m)
  xor.final()
}

exports.crypto_stream_chacha20_ietf_xor_ic = function (c, m, mlen, n, ic, k) {
  assert(n.byteLength === exports.crypto_stream_chacha20_ietf_NONCEBYTES,
    'n should be crypto_stream_chacha20_ietf_NONCEBYTES')
  assert(k.byteLength === exports.crypto_stream_chacha20_ietf_KEYBYTES,
    'k should be crypto_stream_chacha20_ietf_KEYBYTES')

  var xor = new Chacha20(n, k, ic)
  xor.update(c, m)
  xor.final()
}

exports.crypto_stream_chacha20_ietf_xor_instance = function (n, k) {
  assert(n.byteLength === exports.crypto_stream_chacha20_ietf_NONCEBYTES,
    'n should be crypto_stream_chacha20_ietf_NONCEBYTES')
  assert(k.byteLength === exports.crypto_stream_chacha20_ietf_KEYBYTES,
    'k should be crypto_stream_chacha20_ietf_KEYBYTES')

  return new Chacha20(n, k)
}

function Chacha20 (n, k, counter) {
  assert(k.byteLength === exports.crypto_stream_chacha20_ietf_KEYBYTES)
  assert(n.byteLength === exports.crypto_stream_chacha20_NONCEBYTES ||
    n.byteLength === exports.crypto_stream_chacha20_ietf_NONCEBYTES)

  if (!counter) counter = 0
  assert(counter < Number.MAX_SAFE_INTEGER)

  this.finalized = false
  this.pos = 0
  this.state = new Uint32Array(16)

  for (let i = 0; i < 4; i++) this.state[i] = constant[i]
  for (let i = 0; i < 8; i++) this.state[4 + i] = k.readUInt32LE(4 * i)

  this.state[12] = counter & 0xffffffff

  if (n.byteLength === 8) {
    this.state[13] = counter >> 32
    this.state[14] = n.readUInt32LE(0)
    this.state[15] = n.readUInt32LE(4)
  } else {
    this.state[13] = n.readUInt32LE(0)
    this.state[14] = n.readUInt32LE(4)
    this.state[15] = n.readUInt32LE(8)
  }

  return this
}

Chacha20.prototype.update = function (output, input) {
  assert(!this.finalized, 'cipher finalized.')
  assert(output.byteLength >= input.byteLength,
    'output cannot be shorter than input.')

  var len = input.length
  var offset = this.pos % 64
  this.pos += len

  // input position
  var j = 0

  var keyStream = chacha20_block(this.state)

  // try to finsih the current block
  while (offset > 0 && len > 0) {
    output[j] = input[j++] ^ keyStream[offset]
    offset = (offset + 1) & 0x3f
    if (!offset) this.state[12]++
    len--
  }

  // encrypt rest block at a time
  while (len > 0) {
    keyStream = chacha20_block(this.state)

    // less than a full block remaining
    if (len < 64) {
      for (let i = 0; i < len; i++) {
        output[j] = input[j++] ^ keyStream[offset++]
        offset &= 0x3f
      }

      return
    }

    for (; offset < 64;) {
      output[j] = input[j++] ^ keyStream[offset++]
    }

    this.state[12]++
    offset = 0
    len -= 64
  }
}

Chacha20.prototype.final = function () {
  this.finalized = true
}

module.exports.keystream = function (output, key, nonce, counter) {
  var c = new Chacha20(key, nonce, counter)
  c.update(output, Buffer.alloc(output.length))
  c.final()
}

function chacha20_block (state) {
  var workingState = new Uint32Array(16)
  for (let i = 16; i--;) workingState[i] = state[i]

  for (let i = 0; i < 20; i += 2) {
    QR(workingState, 0, 4, 8, 12) // column 0
    QR(workingState, 1, 5, 9, 13) // column 1
    QR(workingState, 2, 6, 10, 14) // column 2
    QR(workingState, 3, 7, 11, 15) // column 3

    QR(workingState, 0, 5, 10, 15) // diagonal 1 (main diagonal)
    QR(workingState, 1, 6, 11, 12) // diagonal 2
    QR(workingState, 2, 7, 8, 13) // diagonal 3
    QR(workingState, 3, 4, 9, 14) // diagonal 4
  }

  for (let i = 0; i < 16; i++) {
    workingState[i] += state[i]
  }

  return Buffer.from(workingState.buffer)
}

function rotl (a, b) {
  return ((a << b) | (a >>> (32 - b)))
}

function QR (obj, a, b, c, d) {
  obj[a] += obj[b]
  obj[d] ^= obj[a]
  obj[d] = rotl(obj[d], 16)

  obj[c] += obj[d]
  obj[b] ^= obj[c]
  obj[b] = rotl(obj[b], 12)

  obj[a] += obj[b]
  obj[d] ^= obj[a]
  obj[d] = rotl(obj[d], 8)

  obj[c] += obj[d]
  obj[b] ^= obj[c]
  obj[b] = rotl(obj[b], 7)
}
