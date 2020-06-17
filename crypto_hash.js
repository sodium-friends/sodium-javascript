const sha256 = require('sha256-wasm')
const sha512 = require('sha512-wasm')
const assert = require('nanoassert')

var crypto_hash_sha256_BYTES = 32
var crypto_hash_sha512_BYTES = 64
var crypto_hash_BYTES = crypto_hash_sha512_BYTES

function crypto_hash_sha256 (out, m, n) {
  assert(out.byteLength === crypto_hash_sha256_BYTES, "out must be 'crypto_hash_sha256_BYTES' bytes long")

  sha256().update(m.subarray(0, n)).digest(out)
  return 0
}

function crypto_hash_sha512 (out, m, n) {
  assert(out.byteLength === crypto_hash_sha512_BYTES, "out must be 'crypto_hash_sha512_BYTES' bytes long")

  sha512().update(m.subarray(0, n)).digest(out)
  return 0
}

function crypto_hash (out, m, n) {
  return crypto_hash_sha512(out, m, n)
}

module.exports = {
  crypto_hash,
  crypto_hash_sha256,
  crypto_hash_sha512,
  crypto_hash_BYTES,
  crypto_hash_sha256_BYTES
}
