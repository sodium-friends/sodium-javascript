/* eslint-disable camelcase, one-var */
const { crypto_verify_32 } = require('./crypto_verify')
const { crypto_hash } = require('./crypto_hash')
const {
  gf, gf0, gf1, D, D2,
  X, Y, I, A, Z, M, S,
  sel25519, pack25519,
  inv25519, unpack25519
} = require('./internal/ed25519')
const { randombytes } = require('./randombytes')

const crypto_sign_BYTES = 64
const crypto_sign_PUBLICKEYBYTES = 32
const crypto_sign_SECRETKEYBYTES = 64
const crypto_sign_SEEDBYTES = 32

module.exports = {
  crypto_sign_keypair,
  crypto_sign_seed_keypair,
  crypto_sign,
  crypto_sign_detached,
  crypto_sign_open,
  crypto_sign_verify_detached,
  crypto_sign_BYTES,
  crypto_sign_PUBLICKEYBYTES,
  crypto_sign_SECRETKEYBYTES,
  crypto_sign_SEEDBYTES
}

function set25519 (r, a) {
  for (let i = 0; i < 16; i++) r[i] = a[i] | 0
}

function pow2523 (o, i) {
  var c = gf()
  var a
  for (a = 0; a < 16; a++) c[a] = i[a]
  for (a = 250; a >= 0; a--) {
    S(c, c)
    if (a !== 1) M(c, c, i)
  }
  for (a = 0; a < 16; a++) o[a] = c[a]
}

function add (p, q) {
  var a = gf(), b = gf(), c = gf(),
    d = gf(), e = gf(), f = gf(),
    g = gf(), h = gf(), t = gf()

  Z(a, p[1], p[0])
  Z(t, q[1], q[0])
  M(a, a, t)
  A(b, p[0], p[1])
  A(t, q[0], q[1])
  M(b, b, t)
  M(c, p[3], q[3])
  M(c, c, D2)
  M(d, p[2], q[2])
  A(d, d, d)
  Z(e, b, a)
  Z(f, d, c)
  A(g, d, c)
  A(h, b, a)

  M(p[0], e, f)
  M(p[1], h, g)
  M(p[2], g, f)
  M(p[3], e, h)
}

function cswap (p, q, b) {
  var i
  for (i = 0; i < 4; i++) {
    sel25519(p[i], q[i], b)
  }
}

function pack (r, p) {
  var tx = gf(), ty = gf(), zi = gf()
  inv25519(zi, p[2])
  M(tx, p[0], zi)
  M(ty, p[1], zi)
  pack25519(r, ty)
  r[31] ^= par25519(tx) << 7
}

function scalarmult (p, q, s) {
  var b, i
  set25519(p[0], gf0)
  set25519(p[1], gf1)
  set25519(p[2], gf1)
  set25519(p[3], gf0)
  for (i = 255; i >= 0; --i) {
    b = (s[(i / 8) | 0] >> (i & 7)) & 1
    cswap(p, q, b)
    add(q, p)
    add(p, p)
    cswap(p, q, b)
  }
}

function scalarbase (p, s) {
  var q = [gf(), gf(), gf(), gf()]
  set25519(q[0], X)
  set25519(q[1], Y)
  set25519(q[2], gf1)
  M(q[3], X, Y)
  scalarmult(p, q, s)
}

function crypto_sign_keypair (pk, sk, seeded) {
  check(pk, crypto_sign_PUBLICKEYBYTES)
  check(sk, crypto_sign_SECRETKEYBYTES)

  var d = new Uint8Array(64)
  var p = [gf(), gf(), gf(), gf()]
  var i

  if (!seeded) randombytes(sk, 32)
  crypto_hash(d, sk, 32)
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64

  scalarbase(p, d)
  pack(pk, p)

  for (i = 0; i < 32; i++) sk[i + 32] = pk[i]
  return 0
}

function crypto_sign_seed_keypair (pk, sk, seed) {
  check(seed, crypto_sign_SEEDBYTES)
  sk.set(seed)
  return crypto_sign_keypair(pk, sk, true)
}

var L = new Float64Array([0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10])

function modL (r, x) {
  var carry, i, j, k
  for (i = 63; i >= 32; --i) {
    carry = 0
    for (j = i - 32, k = i - 12; j < k; ++j) {
      x[j] += carry - 16 * x[i] * L[j - (i - 32)]
      carry = (x[j] + 128) >> 8
      x[j] -= carry * 256
    }
    x[j] += carry
    x[i] = 0
  }
  carry = 0
  for (j = 0; j < 32; j++) {
    x[j] += carry - (x[31] >> 4) * L[j]
    carry = x[j] >> 8
    x[j] &= 255
  }
  for (j = 0; j < 32; j++) x[j] -= carry * L[j]
  for (i = 0; i < 32; i++) {
    x[i + 1] += x[i] >> 8
    r[i] = x[i] & 255
  }
}

function reduce (r) {
  var x = new Float64Array(64)
  for (let i = 0; i < 64; i++) x[i] = r[i]
  for (let i = 0; i < 64; i++) r[i] = 0
  modL(r, x)
}

// Note: difference from C - smlen returned, not passed as argument.
function crypto_sign (sm, m, sk) {
  check(sm, crypto_sign_BYTES + m.length)
  check(m, 0)
  check(sk, crypto_sign_SECRETKEYBYTES)
  var n = m.length

  var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64)
  var i, j, x = new Float64Array(64)
  var p = [gf(), gf(), gf(), gf()]

  crypto_hash(d, sk, 32)
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64

  var smlen = n + 64
  for (i = 0; i < n; i++) sm[64 + i] = m[i]
  for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i]

  crypto_hash(r, sm.subarray(32), n + 32)
  reduce(r)
  scalarbase(p, r)
  pack(sm, p)

  for (i = 32; i < 64; i++) sm[i] = sk[i]
  crypto_hash(h, sm, n + 64)
  reduce(h)

  for (i = 0; i < 64; i++) x[i] = 0
  for (i = 0; i < 32; i++) x[i] = r[i]
  for (i = 0; i < 32; i++) {
    for (j = 0; j < 32; j++) {
      x[i + j] += h[i] * d[j]
    }
  }

  modL(sm.subarray(32), x)
  return smlen
}

function crypto_sign_detached (sig, m, sk) {
  var sm = new Uint8Array(m.length + crypto_sign_BYTES)
  crypto_sign(sm, m, sk)
  for (let i = 0; i < crypto_sign_BYTES; i++) sig[i] = sm[i]
}

function unpackneg (r, p) {
  var t = gf(), chk = gf(), num = gf(),
    den = gf(), den2 = gf(), den4 = gf(),
    den6 = gf()

  set25519(r[2], gf1)
  unpack25519(r[1], p)
  S(num, r[1])
  M(den, num, D)
  Z(num, num, r[2])
  A(den, r[2], den)

  S(den2, den)
  S(den4, den2)
  M(den6, den4, den2)
  M(t, den6, num)
  M(t, t, den)

  pow2523(t, t)
  M(t, t, num)
  M(t, t, den)
  M(t, t, den)
  M(r[0], t, den)

  S(chk, r[0])
  M(chk, chk, den)
  if (neq25519(chk, num)) M(r[0], r[0], I)

  S(chk, r[0])
  M(chk, chk, den)
  if (neq25519(chk, num)) return -1

  if (par25519(r[0]) === (p[31] >> 7)) Z(r[0], gf0, r[0])

  M(r[3], r[0], r[1])
  return 0
}

/* eslint-disable no-unused-vars */
function crypto_sign_open (msg, sm, pk) {
  check(msg, sm.length - crypto_sign_BYTES)
  check(sm, crypto_sign_BYTES)
  check(pk, crypto_sign_PUBLICKEYBYTES)
  var n = sm.length
  var m = new Uint8Array(sm.length)

  var i, mlen
  var t = new Uint8Array(32), h = new Uint8Array(64)
  var p = [gf(), gf(), gf(), gf()],
    q = [gf(), gf(), gf(), gf()]

  mlen = -1
  if (n < 64) return false

  if (unpackneg(q, pk)) return false

  for (i = 0; i < n; i++) m[i] = sm[i]
  for (i = 0; i < 32; i++) m[i + 32] = pk[i]
  crypto_hash(h, m, n)
  reduce(h)
  scalarmult(p, q, h)

  scalarbase(q, sm.subarray(32))
  add(p, q)
  pack(t, p)

  n -= 64
  if (crypto_verify_32(sm, 0, t, 0)) {
    for (i = 0; i < n; i++) m[i] = 0
    return false
    // throw new Error('crypto_sign_open failed')
  }

  for (i = 0; i < n; i++) msg[i] = sm[i + 64]
  mlen = n
  return true
}
/* eslint-enable no-unused-vars */

function crypto_sign_verify_detached (sig, m, pk) {
  check(sig, crypto_sign_BYTES)
  var sm = new Uint8Array(m.length + crypto_sign_BYTES)
  var i = 0
  for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i]
  for (i = 0; i < m.length; i++) sm[i + crypto_sign_BYTES] = m[i]
  return crypto_sign_open(m, sm, pk)
}

function par25519 (a) {
  var d = new Uint8Array(32)
  pack25519(d, a)
  return d[0] & 1
}

function neq25519 (a, b) {
  var c = new Uint8Array(32), d = new Uint8Array(32)
  pack25519(c, a)
  pack25519(d, b)
  return crypto_verify_32(c, 0, d, 0)
}

function check (buf, len) {
  if (!buf || (len && buf.length < len)) throw new Error('Argument must be a buffer' + (len ? ' of length ' + len : ''))
}
