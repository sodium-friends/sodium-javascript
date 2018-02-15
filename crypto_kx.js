var assert = require('nanoassert')
var randombytes_buf = require('./randombytes').randombytes_buf
var generichash = require('./crypto_generichash')
var crypto_scalarmult_base = require('./crypto_scalarmult').crypto_scalarmult_base

exports.crypto_kx_PUBLICKEYBYTES = 32
exports.crypto_kx_SECRETKEYBYTES = 32
exports.crypto_kx_SEEDBYTES = 32
exports.crypto_kx_SESSIONKEYBYTES = 32
exports.crypto_kx_PRIMITIVE = ''

exports.crypto_kx_keypair = function (pk, sk) {
  assert(sk.byteLength >= exports.crypto_kx_SECRETKEYBYTES, 'sk must be at least crypto_kx_SECRETKEYBYTES')
  assert(pk.byteLength >= exports.crypto_kx_PUBLICKEYBYTES, 'pk must be at least crypto_kx_PUBLICKEYBYTES')

  randombytes_buf(sk.subarray(0, exports.crypto_kx_SECRETKEYBYTES))

  crypto_scalarmult_base(
    pk.subarray(0, exports.crypto_kx_PUBLICKEYBYTES),
    sk.subarray(0, exports.crypto_kx_SECRETKEYBYTES)
  )
}

exports.crypto_kx_seed_keypair = function (pk, sk, seed) {
  assert(sk.byteLength >= exports.crypto_kx_SECRETKEYBYTES, 'sk must be at least crypto_kx_SECRETKEYBYTES')
  assert(pk.byteLength >= exports.crypto_kx_PUBLICKEYBYTES, 'pk must be at least crypto_kx_PUBLICKEYBYTES')
  assert(seed.byteLength >= exports.crypto_kx_SEEDBYTES, 'seed must be at least crypto_kx_SEEDBYTES')

  generichash.crypto_generichash(
    sk.subarray(0, exports.crypto_kx_SECRETKEYBYTES),
    seed.subarray(0, exports.crypto_kx_SEEDBYTES)
  )

  crypto_scalarmult_base(
    pk.subarray(0, exports.crypto_kx_PUBLICKEYBYTES),
    sk.subarray(0, exports.crypto_kx_SECRETKEYBYTES)
  )
}

exports.crypto_kx_client_session_keys = calc.bind(null, false)

exports.crypto_kx_server_session_keys = calc.bind(null, true)


function calc (server, rx, tx, pk, sk, remote_pk) {
  if (rx == null) rx = tx
  if (tx == null) tx = rx

  assert(rx >= exports.crypto_kx_SESSIONKEYBYTES, 'rx must be at least crypto_kx_SESSIONKEYBYTES')
  assert(tx >= exports.crypto_kx_SESSIONKEYBYTES, 'tx should be at least crypto_kx_SESSIONKEYBYTES')
  assert(sk.byteLength >= exports.crypto_kx_SECRETKEYBYTES, 'sk must be at least crypto_kx_SECRETKEYBYTES')
  assert(pk.byteLength >= exports.crypto_kx_PUBLICKEYBYTES, 'pk must be at least crypto_kx_PUBLICKEYBYTES')
  assert(remote_pk.byteLength >= exports.crypto_kx_PUBLICKEYBYTES, 'remote_pk must be at least crypto_kx_PUBLICKEYBYTES')

  rx = rx.subarray(0, exports.crypto_kx_SESSIONKEYBYTES)
  tx = tx.subarray(0, exports.crypto_kx_SESSIONKEYBYTES)

  sk = sk.subarray(0, exports.crypto_kx_SECRETKEYBYTES)
  pk = pk.subarray(0, exports.crypto_kx_PUBLICKEYBYTES)
  remote_pk = remote_pk.subarray(0, exports.crypto_kx_PUBLICKEYBYTES)

  var keys = new Uint8Array(2 * exports.crypto_kx_SESSIONKEYBYTES)
  var hash = generichash.crypto_generichash_instance(null, keys.byteLength)
  var q = new Uint8Array(scalarmult.crypto_scalarmult_BYTES)

  scalarmult.crypto_scalamult(q, sk, remote_pk)

  hash.update(q)
  q.fill(0)
  // if server, then remote_pk == client_pk
  hash.update(server ? remote_pk : pk)
  hash.update(server ? pk : remote_pk)
  hash.final(keys)

  // TODO clear out hash

  rx.set(keys.subarray(0, exports.crypto_kx_SESSIONKEYBYTES))
  tx.set(keys.subarray(exports.crypto_kx_SESSIONKEYBYTES))
}
