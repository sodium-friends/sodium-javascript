/* eslint-disable camelcase */
const { crypto_hash_sha512 } = require('./crypto_hash')
const { crypto_scalarmult, crypto_scalarmult_base } = require('./crypto_scalarmult')
const { randombytes } = require('./randombytes')
const { crypto_generichash_batch } = require('./crypto_generichash')
const { crypto_secretbox_open_easy, crypto_secretbox_easy } = require('./crypto_secretbox')
const xsalsa20 = require('xsalsa20')
const assert = require('nanoassert')

const crypto_box_PUBLICKEYBYTES = 32
const crypto_box_SECRETKEYBYTES = 32
const crypto_box_NONCEBYTES = 24
const crypto_box_ZEROBYTES = 32
const crypto_box_BOXZEROBYTES = 16
const crypto_box_SEALBYTES = 48
const crypto_box_SEEDBYTES = 32
const crypto_box_BEFORENMBYTES = 32

module.exports = {
  crypto_box_keypair,
  crypto_box_seed_keypair,
  crypto_box_seal,
  crypto_box_seal_open,
  crypto_box_PUBLICKEYBYTES,
  crypto_box_SECRETKEYBYTES,
  crypto_box_NONCEBYTES,
  crypto_box_ZEROBYTES,
  crypto_box_BOXZEROBYTES,
  crypto_box_SEALBYTES,
  crypto_box_SEEDBYTES,
  crypto_box_BEFORENMBYTES
}

function crypto_box_keypair (pk, sk) {
  check(pk, crypto_box_PUBLICKEYBYTES)
  check(sk, crypto_box_SECRETKEYBYTES)
  randombytes(sk, 32)
  return crypto_scalarmult_base(pk, sk)
}

function crypto_box_seed_keypair (pk, sk, seed) {
  assert(pk.byteLength === crypto_box_PUBLICKEYBYTES, "pk should be 'crypto_box_PUBLICKEYBYTES' bytes")
  assert(sk.byteLength === crypto_box_SECRETKEYBYTES, "sk should be 'crypto_box_SECRETKEYBYTES' bytes")
  assert(sk.byteLength === crypto_box_SEEDBYTES, "sk should be 'crypto_box_SEEDBYTES' bytes")

  const hash = new Uint8Array(64)
  crypto_hash_sha512(hash, seed, 32)
  sk.set(hash.subarray(0, 32))
  hash.fill(0)

  return crypto_scalarmult_base(pk, sk)
}

function crypto_box_seal (c, m, pk) {
  check(c, crypto_box_SEALBYTES + m.length)
  check(pk, crypto_box_PUBLICKEYBYTES)

  var epk = c.subarray(0, crypto_box_PUBLICKEYBYTES)
  var esk = new Uint8Array(crypto_box_SECRETKEYBYTES)
  crypto_box_keypair(epk, esk)

  var n = new Uint8Array(crypto_box_NONCEBYTES)
  crypto_generichash_batch(n, [epk, pk])

  var s = new Uint8Array(crypto_box_PUBLICKEYBYTES)
  crypto_scalarmult(s, esk, pk)

  var k = new Uint8Array(crypto_box_BEFORENMBYTES)
  var zero = new Uint8Array(16)
  xsalsa20.core_hsalsa20(k, zero, s, xsalsa20.SIGMA)

  crypto_secretbox_easy(c.subarray(epk.length), m, n, k)

  cleanup(esk)
}

function crypto_box_seal_open (m, c, pk, sk) {
  check(c, crypto_box_SEALBYTES)
  check(m, c.length - crypto_box_SEALBYTES)
  check(pk, crypto_box_PUBLICKEYBYTES)
  check(sk, crypto_box_SECRETKEYBYTES)

  var epk = c.subarray(0, crypto_box_PUBLICKEYBYTES)

  var n = new Uint8Array(crypto_box_NONCEBYTES)
  crypto_generichash_batch(n, [epk, pk])

  var s = new Uint8Array(crypto_box_PUBLICKEYBYTES)
  crypto_scalarmult(s, sk, epk)

  var k = new Uint8Array(crypto_box_BEFORENMBYTES)
  var zero = new Uint8Array(16)
  xsalsa20.core_hsalsa20(k, zero, s, xsalsa20.SIGMA)

  return crypto_secretbox_open_easy(m, c.subarray(epk.length), n, k)
}

function check (buf, len) {
  if (!buf || (len && buf.length < len)) throw new Error('Argument must be a buffer' + (len ? ' of length ' + len : ''))
}

function cleanup (arr) {
  for (let i = 0; i < arr.length; i++) arr[i] = 0
}
