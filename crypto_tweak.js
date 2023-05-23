const b4a = require('b4a')

const {
  crypto_scalarmult_ed25519,
  crypto_scalarmult_ed25519_noclamp,
  crypto_scalarmult_ed25519_base,
  crypto_scalarmult_ed25519_base_noclamp,
  crypto_scalarmult_ed25519_SCALARBYTES
} = require('./crypto_scalarmult_ed25519')

const {
  crypto_sign_keypair_seed,
  crypto_sign_ed25519_PUBLICKEYBYTES
} = require('./crypto_sign_ed25519')

const {
  crypto_hash_sha512_state,
  crypto_hash_sha512_update,
  crypto_hash_sha512_final,
  crypto_hash
} = require('./crypto_hash')

const {
  crypto_core_ed25519_is_valid_point,
  crypto_core_ed25519_scalar_reduce,
  crypto_core_ed25519_scalar_add,
  crypto_core_ed25519_scalar_mul,
  crypto_core_ed25519_add
} = require('./crypto_core')

const { curve25519_h: COFACTOR } = require('./fe25519_25')

const { sodium_memzero } = require('./utils')

/*
  *EXPERIMENTAL API*

  This module is an experimental implementation of a key tweaking protocol
  over ed25519 keys. The signature algorithm has been reimplemented from
  libsodium, but the nonce generation algorithm is *non-standard*.

  Use at your own risk
*/

const crypto_tweak_ed25519_BYTES = crypto_sign_ed25519_PUBLICKEYBYTES
const crypto_tweak_ed25519_SCALARBYTES = crypto_scalarmult_ed25519_SCALARBYTES

function _crypto_tweak_nonce (nonce, n, m, mlen) {
  // dom2(x, y) with x = 0 (not prehashed) and y = "crypto_tweak_ed25519"
  const prefix = b4a.alloc(54)

  prefix.write('SigEd25519 no Ed25519 collisions\x00\x14crypto_tweak_ed25519')

  const hs = crypto_hash_sha512_state()

  crypto_hash_sha512_update(hs, prefix)
  crypto_hash_sha512_update(hs, n, 32)
  crypto_hash_sha512_update(hs, m, m.byteLength)
  crypto_hash_sha512_final(hs, nonce)
}

function _crypto_sign_ed25519_clamp (k) {
  k[0] &= 248
  k[31] &= 127
  k[31] |= 64
}

function _crypto_tweak_ed25519(q, n, ns) {
  sodium_memzero(q)

  crypto_hash(n, ns)
  n[31] &= 127 // clear highest bit

  crypto_scalarmult_ed25519_base_noclamp(q, n)

  // hash tweak until we get a valid tweaked q
  while (crypto_core_ed25519_is_valid_point(q) != 1) {
    crypto_hash(n, n, 32)
    n[31] &= 127 // clear highest bit

    crypto_scalarmult_ed25519_base_noclamp(q, n)
  }
}

function crypto_tweak_ed25519_base (n, q, ns) {
  sodium_memzero(q)

  const n64 = b4a.alloc(64)
  _crypto_tweak_ed25519(q, n64, ns)

  n.set(n64.subarray(0, 32))
}

// TODO: check pk is correct if we pass it
function crypto_tweak_ed25519_sign_detached (sig, m, n, pk = null) {
  const hs = crypto_hash_sha512_state()

  const nonce = b4a.alloc(64)
  const R = b4a.alloc(32)
  const hram = b4a.alloc(64)
  const _pk = b4a.alloc(32)

  // check if pk was passed
  if (pk === null) {
    pk = _pk

    // derive pk from scalar
    crypto_scalarmult_ed25519_base_noclamp(pk, n)
  }

  _crypto_tweak_nonce(nonce, n, m)
  crypto_core_ed25519_scalar_reduce(nonce, nonce)

  // R = G ^ nonce : curve point from nonce
  crypto_scalarmult_ed25519_base_noclamp(R, nonce)

  // generate challenge as h(ram) = hash(R, pk, message)
  crypto_hash_sha512_update(hs, R, 32)
  crypto_hash_sha512_update(hs, pk, 32)
  crypto_hash_sha512_update(hs, m, m.byteLength)

  crypto_hash_sha512_final(hs, hram)

  crypto_core_ed25519_scalar_reduce(hram, hram)

  // sig = nonce + n * h(ram)
  crypto_core_ed25519_scalar_mul(sig.subarray(0, 32), hram.subarray(0, 32), n)
  crypto_core_ed25519_scalar_add(sig.subarray(32, 64), nonce.subarray(0, 32), sig)

  sig.set(R)

  return 0
}

// get scalar from secret key
function crypto_tweak_ed25519_sk_to_scalar (n, sk) {
  const n64 = b4a.alloc(64)

  // get sk scalar from seed, cf. crypto_sign_keypair_seed
  crypto_hash(n64, sk, 32)
  _crypto_sign_ed25519_clamp(n64)

  n.set(n64.subarray(0, 32))
}

// tweak a secret key
function crypto_tweak_ed25519_scalar (scalar_out, scalar, ns) {
  const q = b4a.alloc(32)
  const n = b4a.alloc(64)

  const n32 = n.subarray(0, 32)

  _crypto_tweak_ed25519(q, n, ns)
  crypto_tweak_ed25519_scalar_add(scalar_out, n32, scalar)
}

// tweak a public key
function crypto_tweak_ed25519_pk (tpk, pk, ns) {
  const n = b4a.alloc(64)
  const q = b4a.alloc(32)

  _crypto_tweak_ed25519(q, n, ns)
  return crypto_core_ed25519_add(tpk, q, pk)
}

function crypto_tweak_ed25519_keypair (pk, scalar_out, scalar, ns) {
  const n64 = b4a.alloc(64)

  crypto_hash(n64, ns)
  n64[31] &= 127 // clear highest bit

  crypto_tweak_ed25519_scalar_add(scalar_out, scalar, n64)
  crypto_scalarmult_ed25519_base_noclamp(pk, scalar_out)

  // hash tweak until we get a valid tweaked point
  while (crypto_core_ed25519_is_valid_point(pk) != 1) {
    crypto_hash(n64, n64, 32)
    n64[31] &= 127 // clear highest bit

    crypto_tweak_ed25519_scalar_add(scalar_out, scalar, n64)
    crypto_scalarmult_ed25519_base_noclamp(pk, scalar_out)
  }
}

// add tweak to scalar
function crypto_tweak_ed25519_scalar_add (scalar_out, scalar, n) {
  crypto_core_ed25519_scalar_add(scalar_out, scalar, n)
}

// add tweak point to public key
function crypto_tweak_ed25519_pk_add (tpk, pk, q) {
  crypto_core_ed25519_add(tpk, pk, q)
}

// add tweak to scalar
function crypto_tweak_ed25519_scalar_mul (scalar_out, scalar, n) {
  crypto_core_ed25519_scalar_mul(scalar_out, scalar, n)
}

// add tweak point to public key
function crypto_tweak_ed25519_publickey_mul (tpk, pk, n) {
  crypto_scalarmult_ed25519_noclamp(tpk, n, pk)
}

module.exports = {
  crypto_tweak_ed25519_base,
  crypto_tweak_ed25519_sign_detached,
  crypto_tweak_ed25519_sk_to_scalar,
  crypto_tweak_ed25519_scalar,
  crypto_tweak_ed25519_pk,
  crypto_tweak_ed25519_keypair,
  crypto_tweak_ed25519_scalar_add,
  crypto_tweak_ed25519_pk_add,
  crypto_tweak_ed25519_BYTES,
  crypto_tweak_ed25519_SCALARBYTES
}
