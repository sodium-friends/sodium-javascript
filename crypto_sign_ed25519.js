const { sodium_memzero } = require('./utils')
const { randombytes_buf } = require('./randombytes')
const ec = require('./fe25519_25')
const {
  crypto_hash_sha512,
  crypto_hash_sha512_update,
  crypto_hash_sha512_state,
  crypto_hash_sha512_final,
  crypto_hash_sha512_BYTES
} = require('./crypto_hash.js')
const { crypto_verify_32 } = require('./crypto_verify')
const {
  crypto_scalarmult_base,
  crypto_scalarmult_curve25519_BYTES
} = require('./crypto_scalarmult_ed25519')

var crypto_sign_ed25519_BYTES = 64
var crypto_sign_ed25519_SEEDBYTES = 32
var crypto_sign_ed25519_PUBLICKEYBYTES = 32
var crypto_sign_ed25519_SECRETKEYBYTES = 64
var crypto_sign_ed25519_MESSAGEBYTES_MAX = Number.MAX_SAFE_INTEGER

const crypto_sign_BYTES = crypto_sign_ed25519_BYTES
const crypto_sign_PUBLICKEYBYTES = crypto_sign_ed25519_PUBLICKEYBYTES
const crypto_sign_SECRETKEYBYTES = crypto_sign_ed25519_SECRETKEYBYTES
const crypto_sign_SEEDBYTES = crypto_sign_ed25519_SEEDBYTES


function crypto_sign_seed_keypair (pk, sk, seed) {
  const A = ec.ge25519_p3()

  crypto_hash_sha512(sk, seed, 32)
  sk[0] &= 248
  sk[31] &= 127
  sk[31] |= 64

  ec.ge25519_scalarmult_base(A, sk)
  ec.ge25519_p3_tobytes(pk, A)

  sk.set(seed)
  sk.set(pk, 32)
}

function crypto_sign_keypair (pk, sk) {
  const seed = Buffer.alloc(32)

  randombytes_buf(seed)
  crypto_sign_seed_keypair(pk, sk, seed)
  sodium_memzero(seed)
}

function crypto_sign_ed25519_pk_to_curve25519 (curve25519_pk, ed25519_pk) {
  const A = ec.ge25519_p3()
  const x = ec.fe25519()
  const one_minus_y = ec.fe25519()

  if (ec.ge25519_has_small_order(ed25519_pk) != 0 ||
      ec.ge25519_frombytes_negate_vartime(A, ed25519_pk) != 0 ||
      ec.ge25519_is_on_main_subgroup(A) == 0) {
      throw new Error('Invalid public key')
  }

  ec.fe25519_1(one_minus_y)
  ec.fe25519_sub(one_minus_y, one_minus_y, A[1])
  ec.fe25519_1(x)
  ec.fe25519_add(x, x, A[1])
  ec.fe25519_invert(one_minus_y, one_minus_y)
  ec.fe25519_mul(x, x, one_minus_y)
  ec.fe25519_tobytes(curve25519_pk, x)
}

function crypto_sign_ed25519_sk_to_curve25519 (curve25519_sk, ed25519_sk) {
    const h = Buffer.alloc(crypto_hash_sha512_BYTES)

    crypto_hash_sha512(h, ed25519_sk, 32)
    h[0] &= 248
    h[31] &= 127
    h[31] |= 64
    curve25519_sk.set(h.subarray(0, crypto_scalarmult_curve25519_BYTES))

    sodium_memzero(h)
}

function _crypto_sign_ed25519_ref10_hinit (hs, prehashed) {
  const DOM2PREFIX = Buffer.from('SigEd25519 no Ed25519 collisions  ')
  DOM2PREFIX[30] = 1
  DOM2PREFIX[31] = 0

  if (prehashed) {
    crypto_hash_sha512_update(hs, DOM2PREFIX, DOM2PREFIX.byteLength)
  }
}

function _crypto_sign_ed25519_clamp (k) {
  k[0] &= 248
  k[31] &= 127
  k[31] |= 64
}

function _crypto_sign_ed25519_detached (sig, m, sk, prehashed) {
  var state = crypto_hash_sha512_state()
  var az = Buffer.alloc(64)
  var nonce = Buffer.alloc(64)
  var hram = Buffer.alloc(64)
  var R = ec.ge3()

  _crypto_sign_ed25519_ref10_hinit(state, prehashed)

  crypto_hash_sha512(az, sk, 32)
  crypto_hash_sha512_update(state, az.subarray(32), 32)
  crypto_hash_sha512_update(state, m)
  crypto_hash_sha512_final(state, nonce)

  sig.set(sk.subarray(32, 64), 32)

  ec.sc25519_reduce(nonce)
  ec.ge25519_scalarmult_base(R, nonce)
  ec.ge25519_p3_tobytes(sig, R)

  state = crypto_hash_sha512_state()
  _crypto_sign_ed25519_ref10_hinit(state, prehashed)
  crypto_hash_sha512_update(state, sig, 64)
  crypto_hash_sha512_update(state, m)
  crypto_hash_sha512_final(state, hram)

  ec.sc25519_reduce(hram)
  _crypto_sign_ed25519_clamp(az)
  ec.sc25519_muladd(sig.subarray(32), hram, az, nonce)

  sodium_memzero(az)
  sodium_memzero(nonce)

  return 0
}

function crypto_sign_ed25519_detached (sig, m, sk) {
  return _crypto_sign_ed25519_detached(sig, m, sk, 0)
}

function crypto_sign_detached (sig, m, sk) {
  return _crypto_sign_ed25519_detached(sig, m, sk, 0)
}

function crypto_sign_ed25519 (sm, m, sk) {
  sm.set(m, crypto_sign_ed25519_BYTES)

  /* LCOV_EXCL_START */
  if (crypto_sign_detached(sm, sm.subarray(crypto_sign_ed25519_BYTES), sk) !== 0) {
    sm.fill(0, m.byteLength + crypto_sign_ed25519_BYTES)
    return -1
  }
  /* LCOV_EXCL_STOP */
  return m.byteLength + 64
}

function crypto_sign (sm, m, sk) {
  return crypto_sign_ed25519(sm, m, sk)
}

function _crypto_sign_ed25519_verify_detached(sig, m, pk, prehashed) {
  var hs = crypto_hash_sha512_state()
  var h = Buffer.alloc(64)
  var rcheck = Buffer.alloc(32)
  var A = ec.ge3()
  var R = ec.ge2()

  if ((sig[63] & 240) &&
      ec.sc25519_is_canonical(sig + 32) == 0) {
    return false
  }
  if (ec.ge25519_has_small_order(sig.subarray(0, 32)) != 0) {
    return false
  }
  if (ec.ge25519_is_canonical(pk) == 0 ||
      ec.ge25519_has_small_order(pk) != 0) {
    return false
  }

  if (ec.ge25519_frombytes_negate_vartime(A, pk) !== 0) {
  }
  ec.ge25519_tobytes(rcheck, A)

  _crypto_sign_ed25519_ref10_hinit(hs, prehashed)
  crypto_hash_sha512_update(hs, sig, 32)
  crypto_hash_sha512_update(hs, pk, 32)
  crypto_hash_sha512_update(hs, m)
  crypto_hash_sha512_final(hs, h)
  ec.sc25519_reduce(h)

  ec.ge25519_double_scalarmult_vartime(R, h, A, sig.subarray(32))
  ec.ge25519_tobytes(rcheck, R)

  return crypto_verify_32(rcheck, 0, sig, 0) === 0
}

function crypto_sign_ed25519_verify_detached (sig, m, pk) {
  return _crypto_sign_ed25519_verify_detached(sig, m, pk, 0);
}

function crypto_sign_ed25519_open (m, sm, pk) {
  if (sm.byteLength < 64 || sm.byteLength - 64 > crypto_sign_ed25519_MESSAGEBYTES_MAX) {
    throw new Error('Bad signature.')
  }

  if (!crypto_sign_ed25519_verify_detached(sm, sm.subarray(64), pk)) {
    if (m.byteLength) m.fill(0)
    throw new Error('Bad signature.')
  }

  if (m.byteLength) {
    m.set(sm.subarray(64))
  }

  return true
}

function crypto_sign_ed25519_sk_to_pk (pk, sk) {
  pk.set(sk.subarray(crypto_sign_ed25519_SEEDBYTES))
}

function crypto_sign_open (m, sm, pk) {
  return crypto_sign_ed25519_open(m, sm, pk)
}

function crypto_sign_verify_detached (m, sm, pk) {
  return crypto_sign_ed25519_verify_detached(m, sm, pk)
}

function _crypto_sign_ristretto25519_detached (sig, m, sk, prehashed) {
  var state = crypto_hash_sha512_state()
  var az = Buffer.alloc(64)
  var nonce = Buffer.alloc(64)
  var hram = Buffer.alloc(64)
  var R = ec.ge3()

  _crypto_sign_ed25519_ref10_hinit(state, prehashed)

  crypto_hash_sha512(az, sk, 32)
  crypto_hash_sha512_update(state, az.subarray(32), 32)
  crypto_hash_sha512_update(state, m)
  crypto_hash_sha512_final(state, nonce)

  sig.set(sk.subarray(32, 64), 32)

  ec.sc25519_reduce(nonce)
  ec.ge25519_scalarmult_base(R, nonce)
  ec.ristretto255_p3_tobytes(sig, R)

  state = crypto_hash_sha512_state()
  _crypto_sign_ed25519_ref10_hinit(state, prehashed)
  crypto_hash_sha512_update(state, sig, 64)
  crypto_hash_sha512_update(state, m)
  crypto_hash_sha512_final(state, hram)

  ec.sc25519_reduce(hram)
  az[31] &= 127
  // az[0] &= 248
  // az[0] |= 1
  // console.log(az[31] & 128)
  // console.log(nonce[31] & 128)
  // console.log(hram[31] & 128)
  ec.sc25519_muladd(sig.subarray(32), hram, az, nonce)

  sodium_memzero(az)
  sodium_memzero(nonce)

  return 0

  var rcheck = Buffer.alloc(32)
  var A = ec.ge3()
  var _A = ec.ge3()
  var h = Buffer.alloc(64)
  var hs = crypto_hash_sha512_state()
  var pk = sk.subarray(32).slice()
  // pk[31] &= 127
  ec.ristretto255_frombytes(A, pk, true)
  ec.ge25519_scalarmult_base(_A, az)
  ec.ge25519_p3_add(_A, _A, A)
  ec.ge25519_p3_tobytes(rcheck, _A)
  // console.log(rcheck.toString('hex'))

  _crypto_sign_ed25519_ref10_hinit(hs, prehashed)
  crypto_hash_sha512_update(hs, sig, 32)
  crypto_hash_sha512_update(hs, pk, 32)
  crypto_hash_sha512_update(hs, m)
  crypto_hash_sha512_final(hs, h)
  ec.sc25519_reduce(h)

  ec.ge25519_double_scalarmult_vartime(R, h, A, sig.subarray(32))
  ec.ristretto255_p3_tobytes(rcheck, R)

}

function _crypto_sign_ristretto25519_verify_detached(sig, m, pk, prehashed) {
  var hs = crypto_hash_sha512_state()
  var h = Buffer.alloc(64)
  var rcheck = Buffer.alloc(32)
  var A = ec.ge3()
  var R = ec.ge3()

  // #ifdef ED25519_COMPAT
  // if (sig[63] & 224) {
  //   return -1
  // }
  // #else
  if ((sig[63] & 240) &&
      ec.sc25519_is_canonical(sig + 32) == 0) {
    return false
  }
  if (ec.ge25519_has_small_order(sig) != 0) {
    return false
  }
  if (ec.ge25519_is_canonical(pk) == 0 ||
      ec.ge25519_has_small_order(pk) != 0) {
    return false
  }
  // #endif
  if (ec.ristretto255_frombytes(A, pk, true) !== 0) {
    return false
  }

  _crypto_sign_ed25519_ref10_hinit(hs, prehashed)
  crypto_hash_sha512_update(hs, sig, 32)
  crypto_hash_sha512_update(hs, pk, 32)
  crypto_hash_sha512_update(hs, m)
  crypto_hash_sha512_final(hs, h)
  ec.sc25519_reduce(h)

  ec.ge25519_double_scalarmult_vartime(R, h, A, sig.subarray(32))
  ec.ristretto255_p3_tobytes(rcheck, R)

  return crypto_verify_32(rcheck, 0, sig, 0)// | sodium_memcmp(sig.subarray(0, 32), rcheck.subarray(0, 32))
}

function crypto_sign_ristretto25519_detached (sig, m, sk) {
  return _crypto_sign_ristretto25519_detached(sig, m, sk)
}

function crypto_sign_ristretto25519_verify_detached (sig, m, pk) {
  return _crypto_sign_ristretto25519_verify_detached(sig, m, pk, 0)
}

function crypto_sign_ristretto25519 (sm, m, sk) {
  var siglen

  sm.set(m.subarray(0, mlen), crypto_sign_ristretto25519_BYTES)

  /* LCOV_EXCL_START */
  if (crypto_sign_ristretto25519_detached(sm, sm.subarray(crypto_sign_ristretto25519_BYTES), mlen, sk) !== 0) {
    sm.fill(0, mlen + crypto_sign_ristretto25519_BYTES)
    return -1
  }
  /* LCOV_EXCL_STOP */
  return m.byteLength + 64
}

module.exports = {
  crypto_sign_keypair,
  crypto_sign_seed_keypair,
  crypto_sign_ed25519_pk_to_curve25519,
  crypto_sign_ed25519_sk_to_curve25519,
  crypto_sign_ed25519_sk_to_pk,
  crypto_sign,
  crypto_sign_open,
  crypto_sign_ed25519_detached,
  crypto_sign_detached,
  crypto_sign_ristretto25519_detached,
  crypto_sign_ristretto25519_verify_detached,
  crypto_sign_verify_detached,
  crypto_sign_BYTES,
  crypto_sign_PUBLICKEYBYTES,
  crypto_sign_SECRETKEYBYTES,
  crypto_sign_SEEDBYTES
}
