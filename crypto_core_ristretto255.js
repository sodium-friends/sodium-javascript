const b4a = require('b4a')

const { randombytes_buf } = require('./randombytes')
const {
  ge25519_p3,
  ge25519_p1p1,
  ge25519_cached,
  ge25519_p3_to_cached,
  ge25519_add_cached,
  ge25519_p1p1_to_p3,
  ge25519_sub_cached,
  ristretto255_frombytes,
  ristretto255_p3_tobytes,
  ristretto255_from_hash,
  sc25519_mul,
  sc25519_is_canonical
} = require('./fe25519_25')

const {
  crypto_core_ed25519_scalar_random,
  crypto_core_ed25519_scalar_invert,
  crypto_core_ed25519_scalar_negate,
  crypto_core_ed25519_scalar_complement,
  crypto_core_ed25519_scalar_add,
  crypto_core_ed25519_scalar_sub,
  crypto_core_ed25519_scalar_reduce
} = require('./crypto_core')

const crypto_core_ristretto255_BYTES = 32
const crypto_core_ristretto255_NONREDUCEDSCALARBYTES = 64
const crypto_core_ristretto255_HASHBYTES = 64
const crypto_core_ristretto255_SCALARBYTES = 32

module.exports = {
  crypto_core_ristretto255_BYTES,
  crypto_core_ristretto255_NONREDUCEDSCALARBYTES,
  crypto_core_ristretto255_HASHBYTES,
  crypto_core_ristretto255_SCALARBYTES,
  crypto_core_ristretto255_is_valid_point,
  crypto_core_ristretto255_add,
  crypto_core_ristretto255_sub,
  crypto_core_ristretto255_from_hash,
  crypto_core_ristretto255_random,
  crypto_core_ristretto255_scalar_random,
  crypto_core_ristretto255_scalar_invert,
  crypto_core_ristretto255_scalar_negate,
  crypto_core_ristretto255_scalar_complement,
  crypto_core_ristretto255_scalar_add,
  crypto_core_ristretto255_scalar_sub,
  crypto_core_ristretto255_scalar_mul,
  crypto_core_ristretto255_scalar_reduce,
  crypto_core_ristretto255_scalar_is_canonical
}

function crypto_core_ristretto255_is_valid_point (p) {
  const p_p3 = ge25519_p3()

  if (ristretto255_frombytes(p_p3, p) != 0) {
    return false
  }
  return true
}

function crypto_core_ristretto255_add (r, p, q) {
  const p_p3 = ge25519_p3()
  const q_p3 = ge25519_p3()
  const r_p3 = ge25519_p3()
  const r_p1p1 = ge25519_p1p1()
  const q_cached = ge25519_cached()

  if (ristretto255_frombytes(p_p3, p) != 0 ||
      ristretto255_frombytes(q_p3, q) != 0) {
    return -1
  }
  ge25519_p3_to_cached(q_cached, q_p3)
  ge25519_add_cached(r_p1p1, p_p3, q_cached)
  ge25519_p1p1_to_p3(r_p3, r_p1p1)
  ristretto255_p3_tobytes(r, r_p3)

  return 0
}

function crypto_core_ristretto255_sub (r, p, q) {
  const p_p3 = ge25519_p3()
  const q_p3 = ge25519_p3()
  const r_p3 = ge25519_p3()
  const r_p1p1 = ge25519_p1p1()
  const q_cached = ge25519_cached()

  if (ristretto255_frombytes(p_p3, p) != 0 ||
      ristretto255_frombytes(q_p3, q) != 0) {
    return -1
  }
  ge25519_p3_to_cached(q_cached, q_p3)
  ge25519_sub_cached(r_p1p1, p_p3, q_cached)
  ge25519_p1p1_to_p3(r_p3, r_p1p1)
  ristretto255_p3_tobytes(r, r_p3)

  return 0
}

function crypto_core_ristretto255_from_hash (p, r) {
  ristretto255_from_hash(p, r)
  return 0
}

function crypto_core_ristretto255_random (p) {
  const h = b4a.alloc(crypto_core_ristretto255_HASHBYTES)
  randombytes_buf(h)
  crypto_core_ristretto255_from_hash(p, h)
}

function crypto_core_ristretto255_scalar_random (r) {
  crypto_core_ed25519_scalar_random(r)
}

function crypto_core_ristretto255_scalar_invert (recip, s) {
  return crypto_core_ed25519_scalar_invert(recip, s)
}

function crypto_core_ristretto255_scalar_negate (neg, s) {
  crypto_core_ed25519_scalar_negate(neg, s)
}

function crypto_core_ristretto255_scalar_complement (comp, s) {
  crypto_core_ed25519_scalar_complement(comp, s)
}

function crypto_core_ristretto255_scalar_add (z, x, y) {
  crypto_core_ed25519_scalar_add(z, x, y)
}

function crypto_core_ristretto255_scalar_sub (z, x, y) {
  crypto_core_ed25519_scalar_sub(z, x, y)
}

function crypto_core_ristretto255_scalar_mul (z, x, y) {
  sc25519_mul(z, x, y)
}

function crypto_core_ristretto255_scalar_reduce (r, s) {
  crypto_core_ed25519_scalar_reduce(r, s)
}

function crypto_core_ristretto255_scalar_is_canonical (s) {
  return sc25519_is_canonical(s)
}
