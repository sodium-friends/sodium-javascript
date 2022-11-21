var assert = require('nanoassert')
const {
  crypto_stream_chacha20_ietf,
  crypto_stream_chacha20_ietf_KEYBYTES,
  crypto_stream_chacha20_ietf_NONCEBYTES
} = require('./crypto_stream_chacha20')

const randombytes_SEEDBYTES = 32

var randombytes = (function () {
  var QUOTA = 65536 // limit for QuotaExceededException
  var crypto = typeof global !== 'undefined' ? crypto = (global.crypto || global.msCrypto) : null

  function browserBytes (out, n) {
    for (var i = 0; i < n; i += QUOTA) {
      crypto.getRandomValues(out.subarray(i, i + Math.min(n - i, QUOTA)))
    }
  }

  function nodeBytes (out, n) {
    out.set(crypto.randomBytes(n))
  }

  function noImpl () {
    throw new Error('No secure random number generator available')
  }

  if (crypto && crypto.getRandomValues) {
    return browserBytes
  } else if (typeof require !== 'undefined') {
    // Node.js.
    crypto = require('crypto')
    if (crypto && crypto.randomBytes) {
      return nodeBytes
    }
  }

  return noImpl
})()

Object.defineProperty(module.exports, 'randombytes', {
  value: randombytes
})

function randombytes_buf (out) {
  assert(out, 'out must be given')
  randombytes(out, out.length)
}

function randombytes_buf_deterministic (buf, seed) {
  const nonce = Buffer.alloc(crypto_stream_chacha20_ietf_NONCEBYTES)
  nonce.write('LibsodiumDRG')

  assert(randombytes_SEEDBYTES === crypto_stream_chacha20_ietf_KEYBYTES)
  crypto_stream_chacha20_ietf(buf, nonce, seed)
}

module.exports = {
  randombytes_buf,
  randombytes_buf_deterministic,
  randombytes_SEEDBYTES
}