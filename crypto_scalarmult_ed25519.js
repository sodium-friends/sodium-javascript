const assert = require('nanoassert')
const ec = require('./fe25519_25')

const crypto_scalarmult_ed25519_BYTES = 32
const crypto_scalarmult_ed25519_SCALARBYTES = 32

module.exports = {
  crypto_scalarmult_ed25519,
  crypto_scalarmult_ed25519_base,
  crypto_scalarmult_ed25519_base_noclamp,
  crypto_scalarmult_curve25519,
  crypto_scalarmult_curve25519_1,
  crypto_scalarmult_curve25519_base,
  crypto_scalarmult_ristretto255,
  crypto_scalarmult_ristretto255_base,
  crypto_scalarmult_ed25519_BYTES,
  crypto_scalarmult_ed25519_SCALARBYTES
}

const _121666buf = Buffer.alloc(32)
_121666buf.writeUInt32LE(121666)

const _121666 = ec.fe25519()
ec.fe25519_frombytes(_121666, _121666buf)

function _crypto_scalarmult_ed25519_is_inf (s) {
  var c
  var i

  c = s[0] ^ 0x01
  for (i = 1; i < 31; i++) {
    c |= s[i]
  }
  c |= s[31] & 0x7f

  return ((c - 1) >> 8) & 1
}

function _crypto_scalarmult_ed25519_clamp (k) {
  k[0] &= 248
  k[31] |= 64
}

function _crypto_scalarmult_ed25519 (q, n, p, clamp) {
  var Q = ec.ge3()
  var P = ec.ge3()
  var t = q.slice()
  var i

  // if (ec.ge25519_is_canonical(p) == 0 || ec.ge25519_has_small_order(p) != 0 ||
  if (ec.ge25519_frombytes(P, p) != 0 || ec.ge25519_is_on_main_subgroup(P) == 0) {
    throw new Error('Invalid base point')
  }

  for (i = 0; i < 32; ++i) {
    t[i] = n[i]
  }

  if (clamp !== 0) {
    _crypto_scalarmult_ed25519_clamp(t)
  }

  t[31] &= 127

  ec.ge25519_scalarmult(Q, t, P)
  ec.ge25519_p3_tobytes(q, Q)

  if (_crypto_scalarmult_ed25519_is_inf(q) != 0 || sodium_is_zero(n, 32)) {
    throw new Error('Point multiplication failed')
  }

  return 0
}

function crypto_scalarmult_ed25519 (q, n, p) {
  assert(q instanceof Uint8Array && q.byteLength === 32)
  assert(n instanceof Uint8Array && n.byteLength === 32)
  assert(p instanceof Uint8Array && p.byteLength === 32)

  return _crypto_scalarmult_ed25519(q, n, p, 1)
}

function crypto_scalarmult_ed25519_noclamp (q, n, p) {
  assert(q instanceof Uint8Array && q.byteLength === 32)
  assert(n instanceof Uint8Array && n.byteLength === 32)
  assert(p instanceof Uint8Array && p.byteLength === 32)

  return _crypto_scalarmult_ed25519(q, n, p, 0)
}

function _crypto_scalarmult_ed25519_base (q, n, clamp) {
  var t = q.slice()
  var Q = ec.ge3()
  var i

  for (i = 0; i < 32; ++i) {
    t[i] = n[i]
  }

  if (clamp !== 0) {
    _crypto_scalarmult_ed25519_clamp(t)
  }

  t[31] &= 127

  ec.ge25519_scalarmult_base(Q, t)
  ec.ge25519_p3_tobytes(q, Q)
  if (_crypto_scalarmult_ed25519_is_inf(q) !== 0 || sodium_is_zero(n, 32)) {
    return -1
  }
  return 0
}

function crypto_scalarmult_ed25519_base(q, n) {
  assert(q instanceof Uint8Array && q.byteLength === 32)
  assert(n instanceof Uint8Array && n.byteLength === 32)

  return _crypto_scalarmult_ed25519_base(q, n, 1)
}

function crypto_scalarmult_ed25519_base_noclamp (q, n) {
  return _crypto_scalarmult_ed25519_base(q, n, 0)
}

function crypto_scalarmult_ed25519_bytes () {
  return crypto_scalarmult_ed25519_BYTES
}

function crypto_scalarmult_ed25519_scalarbytes () {
  return crypto_scalarmult_ed25519_SCALARBYTES
}

function crypto_scalarmult_ristretto255 (q, n, p) {
  assert(q instanceof Uint8Array && k.byteLength === 32)
  assert(n instanceof Uint8Array && k.byteLength === 32)
  assert(p instanceof Uint8Array && k.byteLength === 32)

  var t = q.slice()
  var Q = ec.ge3()
  var P = ec.ge3()
  var i

  if (ec.ristretto255_frombytes(P, p) != 0) {
    return -1
  }
  for (i = 0; i < 32; ++i) {
    t[i] = n[i]
  }
  t[31] &= 127
  ec.ge25519_scalarmult(Q, t, P)
  ec.ristretto255_p3_tobytes(q, Q)
  if (sodium_is_zero(q, 32)) {
    return -1
  }
  return 0
}

function crypto_scalarmult_ristretto255_base (q, n) {
  var t = q.slice
  var Q = ec.ge3()
  var i

  for (i = 0; i < 32; ++i) {
    t[i] = n[i]
  }

  t[31] &= 127

  ec.ge25519_scalarmult_base(Q, t)
  ec.ristretto255_p3_tobytes(q, Q)
  if (sodium_is_zero(q, 32)) {
    return -1
  }
  return 0
}

function crypto_scalarmult_ristretto255_bytes () {
  return crypto_scalarmult_ristretto255_BYTES
}

function crypto_scalarmult_ristretto255_scalarbytes () {
  return crypto_scalarmult_ristretto255_SCALARBYTES
}

function has_small_order (s) {
  assert(s instanceof Uint8Array && s.byteLength === 32)

  const blacklist = [
    /* 0 (order 4) */
    [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ],
    /* 1 (order 1) */
    [ 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ],
    /* 325606250916557431795983626356110631294008115727848805560023387167927233504
       (order 8) */
    [ 0xe0, 0xeb, 0x7a, 0x7c, 0x3b, 0x41, 0xb8, 0xae, 0x16, 0x56, 0xe3,
      0xfa, 0xf1, 0x9f, 0xc4, 0x6a, 0xda, 0x09, 0x8d, 0xeb, 0x9c, 0x32,
      0xb1, 0xfd, 0x86, 0x62, 0x05, 0x16, 0x5f, 0x49, 0xb8, 0x00 ],
    /* 39382357235489614581723060781553021112529911719440698176882885853963445705823
       (order 8) */
    [ 0x5f, 0x9c, 0x95, 0xbc, 0xa3, 0x50, 0x8c, 0x24, 0xb1, 0xd0, 0xb1,
      0x55, 0x9c, 0x83, 0xef, 0x5b, 0x04, 0x44, 0x5c, 0xc4, 0x58, 0x1c,
      0x8e, 0x86, 0xd8, 0x22, 0x4e, 0xdd, 0xd0, 0x9f, 0x11, 0x57 ],
    /* p-1 (order 2) */
    [ 0xec, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f ],
    /* p (=0, order 4) */
    [ 0xed, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f ],
    /* p+1 (=1, order 1) */
    [ 0xee, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f ]
  ]

  const c = Buffer.alloc(7)

  var k
  var i, j

  assert(blacklist.length === 7)
  for (j = 0; j < 31; j++) {
    for (i = 0; i < 7; i++) {
      c[i] |= s[j] ^ blacklist[i][j]
    }
  }
  for (i = 0; i < 7; i++) {
    c[i] |= (s[j] & 0x7f) ^ blacklist[i][j]
  }
  k = 0
  for (i = 0; i < 7; i++) {
    k |= (c[i] - 1)
  }
  return ((k >> 8) & 1)
}

function crypto_scalarmult_curve25519 (q, n, p) {
  var t = q.slice()
  var i
  var x1 = ec.fe25519()
  var x2 = ec.fe25519()
  var z2 = ec.fe25519()
  var x3 = ec.fe25519()
  var z3 = ec.fe25519()
  var tmp0 = ec.fe25519()
  var tmp1 = ec.fe25519()
  var pos
  var swap
  var b

  if (has_small_order(p)) {
    return -1;
  }
  for (i = 0; i < 32; i++) {
    t[i] = n[i]
  }
  t[0] &= 248
  t[31] &= 127
  t[31] |= 64
  ec.fe25519_frombytes(x1, p)
  ec.fe25519_1(x2)
  ec.fe25519_0(z2)
  ec.fe25519_copy(x3, x1)
  ec.fe25519_1(z3)

  for (pos = 254; pos >= 0; --pos) {
    b = t[Math.floor(pos / 8)] >> (pos & 7)
    b &= 1
    swap ^= b

    ec.fe25519_cswap(x2, x3, swap)
    ec.fe25519_cswap(z2, z3, swap)
    swap = b
    ec.fe25519_sub(tmp0, x3, z3)

    ec.fe25519_sub(tmp1, x2, z2)
    ec.fe25519_add(x2, x2, z2)
    ec.fe25519_add(z2, x3, z3)
    ec.fe25519_mul(z3, tmp0, x2)
    ec.fe25519_mul(z2, z2, tmp1)
    ec.fe25519_sq(tmp0, tmp1)
    ec.fe25519_sq(tmp1, x2)
    ec.fe25519_add(x3, z3, z2)
    ec.fe25519_sub(z2, z3, z2)
    ec.fe25519_mul(x2, tmp1, tmp0)
    ec.fe25519_sub(tmp1, tmp1, tmp0)
    ec.fe25519_sq(z2, z2)
    // TODO
    // ec.fe25519_mul32(z3, tmp1, 121666)
    ec.fe25519_mul(z3, tmp1, _121666)
    ec.fe25519_sq(x3, x3)
    ec.fe25519_add(tmp0, tmp0, z3)
    ec.fe25519_mul(z3, x1, z2)
    ec.fe25519_mul(z2, tmp1, tmp0)
  }

  ec.fe25519_cswap(x2, x3, swap)
  ec.fe25519_cswap(z2, z3, swap)

  ec.fe25519_invert(z2, z2)
  ec.fe25519_mul(x2, x2, z2)
  ec.fe25519_tobytes(q, x2)

  return 0
}

function crypto_scalarmult_curve25519_1 (q, n, p) {
  var t = q.slice()
  var i
  var x1 = ec.fe25519()
  var x2 = ec.fe25519()
  var z2 = ec.fe25519()
  var x3 = ec.fe25519()
  var z3 = ec.fe25519()
  var pos
  var swap
  var b
  var _q = Buffer.alloc(32)

  if (has_small_order(p)) {
    return -1;
  }
  t.set(n)
  t[0] &= 248
  t[31] &= 127
  t[31] |= 64

  ec.fe25519_frombytes(x1, p)
  swap = ec.scalarmult_curve25519_inner_loop(x1, x2, t)

  ec.fe25519_tobytes(q, x2)

  return 0
}

function edwards_to_montgomery(montgomeryX, edwardsY, edwardsZ) {
  var tempX = ec.fe25519()
  var tempZ = ec.fe25519()

  ec.fe25519_add(tempX, edwardsZ, edwardsY)
  ec.fe25519_sub(tempZ, edwardsZ, edwardsY)
  ec.fe25519_invert(tempZ, tempZ)
  ec.fe25519_mul(montgomeryX, tempX, tempZ)
}

function crypto_scalarmult_curve25519_base (q, n) {
  var t = q.slice()
  var Q = ec.ge3()
  const pk = ec.fe25519()

  var i

  for (i = 0; i < 32; i++) {
    t[i] = n[i]
  }

  t[0] &= 248
  t[31] |= 64
  t[31] &= 127

  ec.ge25519_scalarmult_base(Q, t)
  edwards_to_montgomery(pk, Q[1], Q[2]);
  ec.fe25519_tobytes(q, pk)

  return 0
}

function print32 (num) {
  if (num < 0) return print32(0x100000000 + num)
  console.log(num.toString(16).padStart(16, '0'))
}

function printfe (fe) {
  for (let i of fe) print32(i)
}

function sodium_is_zero (n) {
  let i
  let d = 0

  for (let i = 0; i < n.length; i++) {
    d |= n[i]
  }

  return 1 & ((d - 1) >> 8)
}
