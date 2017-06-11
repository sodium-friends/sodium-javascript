var assert = require('assert')
var randombytes_buf = require('.').randombytes_buf
var blake2b = require('blake2b')

module.exports.crypto_kdf_PRIMITIVE = 'blake2b'
module.exports.crypto_kdf_BYTES_MIN = 16
module.exports.crypto_kdf_BYTES_MAX = 64
module.exports.crypto_kdf_CONTEXTBYTES = 8
module.exports.crypto_kdf_KEYBYTES = 64

function STORE64_LE(dest, int) {
  var mul = 1
  var i = 0
  dest[0] = int & 0xFF
  while (++i < 8 && (mul *= 0x100)) {
    dest[i] = (int / mul) & 0xFF
  }
}

module.exports.crypto_kdf_derive_from_key = function crypto_kdf_derive_from_key (subkey, subkey_id, ctx, key) {
  assert(subkey.length >= module.exports.crypto_kdf_BYTES_MIN, 'subkey must be')
  assert(ctx.length >= module.exports.crypto_kdf_CONTEXTBYTES, 'context must be')

  var ctx_padded = new Uint8Array(blake2b.PERSONALBYTES)
  var salt = new Uint8Array(blake2b.SALTBYTES)

  ctx_padded.set(ctx, 0, module.exports.crypto_kdf_CONTEXTBYTES)

  STORE64_LE(salt, subkey_id)

  blake2b(subkey.slice(0, Math.min(subkey.length, module.exports.crypto_kdf_BYTES_MAX)), [], key, salt, ctx_padded, true)
}

module.exports.crypto_kdf_keygen = function crypto_kdf_keygen (out) {
  assert(out.length >= module.exports.crypto_kdf_KEYBYTES)
  randombytes_buf(out.subarray(0, module.exports.crypto_kdf_KEYBYTES))
}
