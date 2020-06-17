const assert = require('nanoassert')

module.exports = {
  crypto_verify_16,
  crypto_verify_32,
  sodium_memcmp,
  sodium_is_zero
}

function vn (x, xi, y, yi, n) {
  var i, d = 0
  for (i = 0; i < n; i++) d |= x[xi + i] ^ y[yi + i]
  return (1 & ((d - 1) >>> 8)) - 1
}

function crypto_verify_16(x, xi, y, yi) {
  return vn(x, xi, y, yi, 16)
}

function crypto_verify_32(x, xi, y, yi) {
  return vn(x, xi, y, yi, 32)
}

function sodium_memcmp (a, b) {
  assert(a.byteLength = b.byteLength, 'buffers must be the same size')

  return vn(a, 0, b, 0, a.byteLength) === 0
}

function sodium_is_zero (arr) {
  var d = 0
  for (let i = 0; i < arr.length; i++) d |= arr[i]
  return d === 0
}
