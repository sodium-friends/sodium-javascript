const sha512 = require('sha512-wasm')
const assert = require('nanoassert')

if (new Uint16Array([1])[0] !== 1) throw new Error('Big endian architecture is not supported.')

var crypto_hash_sha512_BYTES = 64
var crypto_hash_BYTES = crypto_hash_sha512_BYTES

function crypto_hash_sha512 (out, m, n) {
  assert(out.byteLength === crypto_hash_sha512_BYTES, "out must be 'crypto_hash_sha512_BYTES' bytes long")

  sha512().update(m.subarray(0, n)).digest(out)
  return 0
}

function crypto_hash_sha512_state () {
  return sha512()
}

function crypto_hash_sha512_update (state, m, n) {
  if (n === undefined) n = m.byteLength
  state.update(m.subarray(0, n))
  return 0
}

function crypto_hash_sha512_final (state, out) {
  assert(out.byteLength === crypto_hash_sha512_BYTES, "out must be 'crypto_hash_sha512_BYTES' bytes long")

  state.digest(out)
  return 0
}

function crypto_hash (out, m, n) {
  return crypto_hash_sha512(out, m, n)
}

module.exports = {
  crypto_hash,
  crypto_hash_sha512,
  crypto_hash_sha512_state,
  crypto_hash_sha512_update,
  crypto_hash_sha512_final,
  crypto_hash_sha512_BYTES,
  crypto_hash_BYTES
}
