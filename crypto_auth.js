/* eslint-disable camelcase */
const { crypto_verify_32, crypto_verify_64 } = require('./crypto_verify')
const { sodium_memcmp } = require('./helpers')
const Sha256 = require('sha256-universal')
const Sha512 = require('sha512-universal')
const assert = require('nanoassert')

const crypto_auth_BYTES = 32
const crypto_auth_KEYBYTES = 32
const crypto_auth_hmacsha256_BYTES = 32
const crypto_auth_hmacsha256_KEYBYTES = 32
const crypto_auth_hmacsha512_BYTES = 64
const crypto_auth_hmacsha512_KEYBYTES = 32
const crypto_auth_hmacsha512256_BYTES = 32
const crypto_auth_hmacsha512256_KEYBYTES = 32

function crypto_auth_hmacsha256 (out, input, k) {
  assert(out.byteLength === crypto_auth_hmacsha256_BYTES, "out should be 'crypto_auth_hmacsha256_BYTES' in length")

  const hmac = Sha256.HMAC(k)
  hmac.update(input)
  return hmac.digest(out)
}

function crypto_auth_hmacsha256_verify (h, input, k) {
  const correct = Sha256.HMAC(k).update(input).digest()

  return crypto_verify_32(h, 0, correct, 0) | sodium_memcmp(correct, h, 32)
}

function crypto_auth_hmacsha512 (out, input, k) {
  assert(out.byteLength === crypto_auth_hmacsha512_BYTES, "out should be 'crypto_auth_hmacsha512_BYTES' in length")

  const hmac = Sha512.HMAC(k)
  hmac.update(input)
  return hmac.digest(out)
}

function crypto_auth_hmacsha512_verify (h, input, k) {
  const correct = Sha512.HMAC(k).update(input).digest()

  return crypto_verify_64(h, 0, correct, 0) | sodium_memcmp(correct, h, 64)
}

function crypto_auth_hmacsha512256 (out, input, k) {
  assert(out.byteLength === crypto_auth_hmacsha512256_BYTES, "out should be 'crypto_auth_hmacsha512256_BYTES' in length")

  const out0 = new Uint8Array(64)
  const hmac = Sha512.HMAC(k)
  hmac.update(input)
  hmac.digest(out0)

  out.set(out0.subarray(0, 32))
}

function crypto_auth_hmacsha512256_verify (h, input, k) {
  const correct = Sha512.HMAC(k).update(input).digest()

  return crypto_verify_32(h, 0, correct, 0) | sodium_memcmp(correct.subarray(32), h, 32)
}

function crypto_auth (out, input, k) {
  return crypto_auth_hmacsha512256(out, input, k)
}

function crypto_auth_verify (h, input, k) {
  return crypto_auth_hmacsha512256_verify(h, input, k)
}

module.exports = {
  crypto_auth_BYTES,
  crypto_auth_KEYBYTES,
  crypto_auth_hmacsha256_BYTES,
  crypto_auth_hmacsha256_KEYBYTES,
  crypto_auth_hmacsha512_BYTES,
  crypto_auth_hmacsha512_KEYBYTES,
  crypto_auth_hmacsha512256_BYTES,
  crypto_auth_hmacsha512256_KEYBYTES,
  crypto_auth,
  crypto_auth_verify,
  crypto_auth_hmacsha256,
  crypto_auth_hmacsha256_verify,
  crypto_auth_hmacsha512,
  crypto_auth_hmacsha512256,
  crypto_auth_hmacsha512256_verify,
  crypto_auth_hmacsha512_verify
}
