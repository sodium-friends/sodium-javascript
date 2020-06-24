var assert = require('nanoassert')

var randombytes = (function () {
  var QUOTA = 65536 // limit for QuotaExceededException
  var crypto = global.crypto || global.msCrypto

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

  if (crypto && crypto.getRandomValues) return browserBytes

  if (require != null) {
    // Node.js. Bust Browserify
    crypto = require('cry' + 'pto')
    if (crypto && crypto.randomBytes) return nodeBytes
  }

  return noImpl
})()

// Make non enumerable as this is an internal function
Object.defineProperty(module.exports, 'randombytes', {
  value: randombytes
})

module.exports.randombytes_buf = function (out) {
  assert(out, 'out must be given')
  randombytes(out, out.length)
}
