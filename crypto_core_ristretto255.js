const ristretto255 = require('ristretto255')

const crypto_core_ristretto255_BYTES = 32
const crypto_core_ristretto255_HASHBYTES = 64
const crypto_core_ristretto255_SCALARBYTES = 32
const crypto_core_ristretto255_NONREDUCEDSCALARBYTES = 64

module.exports = {
  crypto_core_ristretto255_BYTES,
  crypto_core_ristretto255_HASHBYTES,
  crypto_core_ristretto255_SCALARBYTES,
  crypto_core_ristretto255_NONREDUCEDSCALARBYTES,
  crypto_core_ristretto255_is_valid_point,
  crypto_core_ristretto255_add,
  crypto_core_ristretto255_sub,
  crypto_core_ristretto255_from_hash,
  crypto_core_ristretto255_random,
  crypto_core_ristretto255_scalar_random,
  crypto_core_ristretto255_scalar_invert,
  crypto_core_ristretto255_scalar_negate,
  crypto_core_ristretto255_scalar_add,
  crypto_core_ristretto255_scalar_sub,
  crypto_core_ristretto255_scalar_mul
}

function crypto_core_ristretto255_is_valid_point (p) {
  check(p, crypto_core_ristretto255_BYTES)
  return ristretto255.isValid(p)
}
function crypto_core_ristretto255_add (r, p, q) {
  check(r, crypto_core_ristretto255_BYTES)
  check(p, crypto_core_ristretto255_BYTES)
  check(q, crypto_core_ristretto255_BYTES)
  return r.set(ristretto255.add(p, q))
}
function crypto_core_ristretto255_sub (r, p, q) {
  check(r, crypto_core_ristretto255_BYTES)
  check(p, crypto_core_ristretto255_BYTES)
  check(q, crypto_core_ristretto255_BYTES)
  return r.set(ristretto255.sub(p, q))
}
function crypto_core_ristretto255_from_hash (p, r) {
  check(p, crypto_core_ristretto255_BYTES)
  check(r, crypto_core_ristretto255_HASHBYTES)
  return p.set(ristretto255.fromHash(r))
}
// crypto_core_ristretto255_from_string () {}
// crypto_core_ristretto255_from_string_ro () {}
function crypto_core_ristretto255_random (p) {
  check(p, crypto_core_ristretto255_BYTES)
  return p.set(ristretto255.getRandom())
}
function crypto_core_ristretto255_scalar_random (r) {
  check(r, crypto_core_ristretto255_SCALARBYTES)
  return r.set(ristretto255.scalar.getRandom())
}
function crypto_core_ristretto255_scalar_invert (recip, s) {
  check(recip, crypto_core_ristretto255_SCALARBYTES)
  check(s, crypto_core_ristretto255_SCALARBYTES)
  return recip.set(ristretto255.scalar.invert(s))
}
function crypto_core_ristretto255_scalar_negate (neg, s) {
  check(neg, crypto_core_ristretto255_SCALARBYTES)
  check(s, crypto_core_ristretto255_SCALARBYTES)
  return neg.set(ristretto255.scalar.negate(s))
}
// function crypto_core_ristretto255_scalar_complement (comp, s) {}
function crypto_core_ristretto255_scalar_add (z, x, y) {
  check(z, crypto_core_ristretto255_SCALARBYTES)
  check(x, crypto_core_ristretto255_SCALARBYTES)
  check(y, crypto_core_ristretto255_SCALARBYTES)
  return z.set(ristretto255.scalar.add(x, y))
}
function crypto_core_ristretto255_scalar_sub (z, x, y) {
  check(z, crypto_core_ristretto255_SCALARBYTES)
  check(x, crypto_core_ristretto255_SCALARBYTES)
  check(y, crypto_core_ristretto255_SCALARBYTES)
  return z.set(ristretto255.scalar.sub(x, y))
}
function crypto_core_ristretto255_scalar_mul (z, x, y) {
  check(z, crypto_core_ristretto255_SCALARBYTES)
  check(x, crypto_core_ristretto255_SCALARBYTES)
  check(y, crypto_core_ristretto255_SCALARBYTES)
  return z.set(ristretto255.scalar.mul(x, y))
}
// function crypto_core_ristretto255_scalar_reduce (r, s) {}
// function crypto_core_ristretto255_scalar_is_canonical (s) {}

function check (buf, len) {
  if (!buf || (len && buf.length < len)) throw new Error('Argument must be a buffer' + (len ? ' of length ' + len : ''))
}
