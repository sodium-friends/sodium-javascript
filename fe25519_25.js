const assert = require('nanoassert')

const memory = new WebAssembly.Memory({ initial: 1 })
const mem = Buffer.from(memory.buffer)
const table = new WebAssembly.Table({ initial: 4, element: 'anyfunc' })

const debug = {
  log (...args) {
    console.log(...args.map(int => (int >>> 0).toString(16).padStart(8, '0')))
  },
  log_tee (arg) {
    console.log((arg >>> 0).toString(16).padStart(8, '0'))
    return arg
  }
}

const importObject = {
  imports: {
    js: {
      table
    },
    debug
  }
}

const importWithMemory = {
  imports: {
    js: {
      table,
      mem: memory
    },
    debug
  }
}

const wasm_mul = require('./fe25519_25/fe25519_mul')(importWithMemory)
const wasm_mul32 = require('./fe25519_25/fe25519_mul32')()
const wasm_sq = require('./fe25519_25/fe25519_sq')(importWithMemory)
const wasm_invert = require('./fe25519_25/fe25519_invert')(importWithMemory)
const wasm_pow = require('./fe25519_25/fe25519_pow22523')()
const wasm_sc_red = require('./fe25519_25/sc_reduce')(importObject)
const wasm_sc_mul = require('./fe25519_25/sc25519_mul')(importObject)
const wasm_sc_muladd = require('./fe25519_25/sc25519_muladd')(importObject)
const wasm_scalaramult_internal = require('./fe25519_25/scalarmult_curve25519')(importWithMemory)

function fe25519_invert (h, f) {
  const buf = new Uint8Array(f.buffer)

  // shared memory - invert takes 280 - 360
  mem.set(buf, 280)
  wasm_invert.exports.fe25519_invert(320, 280)

  parse_fe(h, mem, 320)
}

function fe25519_pow22523 (h, f) {
  let buf = new Uint8Array(f.buffer)

  wasm_pow.memory.set(buf)
  wasm_pow.exports.fe25519_pow22523(40, 0)

  buf = Buffer.from(wasm_pow.memory.slice(40, 80))
  for (let i = 0; i < 10; i++) {
    h[i] = buf.readUInt32LE(4 * i)
  }
  for (let i = 0; i < 10; i++) {
    h[i] = buf.readUInt32LE(4 * i)
  }
}

const base = require('./fe25519_25/base.json').map(a => a.map(b => ge2(b)))

const curve25519_h = Buffer.from([
  0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
])

const fe25519_sqrtm1 = fe25519([
  -32595792, -7943725, 9377950, 3500415, 12389472, -272473, -25146209, -2005654, 326686, 11406482
])

const ed25519_sqrtam2 = fe25519([
  -12222970, -8312128, -11511410, 9067497, -15300785, -241793, 25456130, 14121551, -12187136, 3972024
])

const ed25519_d = fe25519([
  -10913610, 13857413, -15372611, 6949391, 114729, -8787816, -6275908, -3247719, -18696448, -12055116
])

const ed25519_d2 = fe25519([
  -21827239, -5839606, -30745221, 13898782, 229458, 15978800, -12551817, -6495438, 29715968, 9444199
])

const ed25519_A_32 = 486662
const ed25519_A = fe25519([
  ed25519_A_32, 0, 0, 0, 0, 0, 0, 0, 0, 0
])

/* sqrt(ad - 1) with a = -1 (mod p) */
const ed25519_sqrtadm1 = fe25519([
  24849947, -153582, -23613485, 6347715, -21072328, -667138, -25271143, -15367704, -870347, 14525639
])

/* 1 / sqrt(a - d) */
const ed25519_invsqrtamd = fe25519([
  6111485, 4156064, -27798727, 12243468, -25904040, 120897, 20826367, -7060776, 6093568, -1986012
])

/* 1 - d ^ 2 */
const ed25519_onemsqd = fe25519([
  6275446, -16617371, -22938544, -3773710, 11667077, 7397348, -27922721, 1766195, -24433858, 672203
])

/* (d - 1) ^ 2 */
const ed25519_sqdmone = fe25519([
  15551795, -11097455, -13425098, -10125071, -11896535, 10178284, -26634327, 4729244, -5282110, -10116402
])

const one = fe25519()
fe25519_1(one)
const basepoint = Buffer.alloc(32)
fe25519_tobytes(basepoint, one)

module.exports = {
  fe25519,
  ge2,
  ge3,
  ge25519_p2: ge2,
  ge25519_p3: ge3,
  ge25519_p1p1: ge3,
  ge25519_precomp: ge3,
  ge25519_cached: ge3,
  print_ge,
  basepoint,
  fe25519_0,
  fe25519_1,
  fe25519_reduce,
  fe25519_frombytes,
  fe25519_tobytes,
  fe25519_add,
  fe25519_sub,
  fe25519_neg,
  fe25519_cmov,
  fe25519_cswap,
  fe25519_cneg,
  fe25519_copy,
  fe25519_abs,
  fe25519_isnegative,
  fe25519_iszero,
  fe25519_mul,
  fe25519_sq,
  fe25519_sqmul,
  fe25519_sq2,
  fe25519_invert,
  fe25519_invert_1,
  fe25519_pow22523,
  fe25519_pow22523_1,
  fe25519_sqrt,
  ge25519_is_canonical,
  ge25519_is_on_curve,
  ge25519_is_on_main_subgroup,
  ge25519_has_small_order,
  ge25519_frombytes,
  ge25519_add_cached,
  ge25519_sub_cached,
  ge25519_tobytes,
  ge25519_cmov8_base,
  ge25519_p3_to_cached,
  ge25519_p1p1_to_p3,
  ge25519_p3_tobytes,
  ge25519_p3_add,
  ge25519_p3_dbl,
  ge25519_scalarmult,
  ge25519_scalarmult_base,
  ge25519_frombytes_negate_vartime,
  ge25519_double_scalarmult_vartime,
  sc25519_mul,
  sc25519_muladd,
  sc25519_sq,
  sc25519_sqmul,
  sc25519_invert,
  sc25519_reduce,
  sc25519_is_canonical,
  chi25519,
  ge25519_mont_to_ed,
  ge25519_mul_l,
  ge25519_xmont_to_ymont,
  ge25519_clear_cofactor,
  ge25519_elligator2,
  ge25519_from_uniform,
  ge25519_from_hash,
  scalarmult_curve25519_inner_loop,
  ristretto255_sqrt_ratio_m1,
  ristretto255_is_canonical,
  ristretto255_frombytes,
  ristretto255_p3_tobytes,
  ristretto255_elligator,
  ristretto255_from_hash,
  curve25519_h
}

function print_ge (g, n = 4) {
  for (let i = 0; i < n; i++) for (let j = 0; j < 10; j++) console.log(`g[${i}][${j}]:`, signedInt(g[i][j]).toString(16).padStart(8, '0'))
}

function print_fe (f) {
  for (let j = 0; j < 10; j++) console.log(`f[${j}]:`, signedInt(f[j]).toString(16).padStart(8, '0'))
}

function fe25519 (arr) {
  const ret = new Int32Array(10)
  if (arr) {
    for (let i = 0; i < arr.length; i++) {
      ret[i] = arr[i]
    }
  }

  return ret
}

// projective
function ge2 (init) {
  const r = new Array(3)
  const inlen = init ? init.length : 0

  for (let i = 0; i < inlen; i++) r[i] = fe25519(init[i])
  for (let i = inlen; i < 3; i++) r[i] = fe25519()

  return r
}

// extended
function ge3 (init) {
  const r = new Array(4)
  const inlen = init ? init.length : 0

  for (let i = 0; i < inlen; i++) r[i] = fe25519(init[i])
  for (let i = inlen; i < 4; i++) r[i] = fe25519()

  return r
}

function load_3 (s, o) {
  if (o === undefined) return load_3(s, 0)

  let result

  result = s[0 + o]
  result |= s[1 + o] << 8
  result |= s[2 + o] << 16

  return result
}

function load_4 (s, o) {
  if (!o) o = 0
  let result

  result = s[o]
  result |= s[o + 1] << 8
  result |= s[o + 2] << 16
  result |= s[o + 3] << 24

  // result |= (0x100000000 + s[o + 3] << 24) & 0xfffffff

  return (0x100000000 + result) % 2 ** 32
}

function fe25519_reduce (h, f) {
  check_fe(h)
  check_fe(f)

  const t = fe25519()
  fe25519_copy(t, f)

  const q = new Int32Array(1)
  const carry = new Int32Array(10)

  q[0] = (19 * t[9] + (1 << 24)) >> 25
  q[0] = (t[0] + q[0]) >> 26
  q[0] = (t[1] + q[0]) >> 25
  q[0] = (t[2] + q[0]) >> 26
  q[0] = (t[3] + q[0]) >> 25
  q[0] = (t[4] + q[0]) >> 26
  q[0] = (t[5] + q[0]) >> 25
  q[0] = (t[6] + q[0]) >> 26
  q[0] = (t[7] + q[0]) >> 25
  q[0] = (t[8] + q[0]) >> 26
  q[0] = (t[9] + q[0]) >> 25

  /* Goal: Output h-(2^255-19)q, which is between 0 and 2^255-20. */
  t[0] += 19 * q[0]
  /* Goal: Output h-2^255 q, which is between 0 and 2^255-20. */

  carry[0] = t[0] >> 26
  t[1] += carry[0]
  t[0] -= carry[0] * (1 << 26)
  carry[1] = t[1] >> 25
  t[2] += carry[1]
  t[1] -= carry[1] * (1 << 25)
  carry[2] = t[2] >> 26
  t[3] += carry[2]
  t[2] -= carry[2] * (1 << 26)
  carry[3] = t[3] >> 25
  t[4] += carry[3]
  t[3] -= carry[3] * (1 << 25)
  carry[4] = t[4] >> 26
  t[5] += carry[4]
  t[4] -= carry[4] * (1 << 26)
  carry[5] = t[5] >> 25
  t[6] += carry[5]
  t[5] -= carry[5] * (1 << 25)
  carry[6] = t[6] >> 26
  t[7] += carry[6]
  t[6] -= carry[6] * (1 << 26)
  carry[7] = t[7] >> 25
  t[8] += carry[7]
  t[7] -= carry[7] * (1 << 25)
  carry[8] = t[8] >> 26
  t[9] += carry[8]
  t[8] -= carry[8] * (1 << 26)
  carry[9] = t[9] >> 25
  t[9] -= carry[9] * (1 << 25)

  h[0] = t[0]
  h[1] = t[1]
  h[2] = t[2]
  h[3] = t[3]
  h[4] = t[4]
  h[5] = t[5]
  h[6] = t[6]
  h[7] = t[7]
  h[8] = t[8]
  h[9] = t[9]
}

function fe25519_tobytes (s, h) {
  assert(s instanceof Uint8Array)
  assert(s.length >= 32)

  const t = fe25519()

  fe25519_reduce(t, h)
  s[0] = t[0] >> 0
  s[1] = t[0] >> 8
  s[2] = t[0] >> 16
  s[3] = (t[0] >> 24) | (t[1] * (1 << 2))
  s[4] = t[1] >> 6
  s[5] = t[1] >> 14
  s[6] = (t[1] >> 22) | (t[2] * (1 << 3))
  s[7] = t[2] >> 5
  s[8] = t[2] >> 13
  s[9] = (t[2] >> 21) | (t[3] * (1 << 5))
  s[10] = t[3] >> 3
  s[11] = t[3] >> 11
  s[12] = (t[3] >> 19) | (t[4] * (1 << 6))
  s[13] = t[4] >> 2
  s[14] = t[4] >> 10
  s[15] = t[4] >> 18
  s[16] = t[5] >> 0
  s[17] = t[5] >> 8
  s[18] = t[5] >> 16
  s[19] = (t[5] >> 24) | (t[6] * (1 << 1))
  s[20] = t[6] >> 7
  s[21] = t[6] >> 15
  s[22] = (t[6] >> 23) | (t[7] * (1 << 3))
  s[23] = t[7] >> 5
  s[24] = t[7] >> 13
  s[25] = (t[7] >> 21) | (t[8] * (1 << 4))
  s[26] = t[8] >> 4
  s[27] = t[8] >> 12
  s[28] = (t[8] >> 20) | (t[9] * (1 << 6))
  s[29] = t[9] >> 2
  s[30] = t[9] >> 10
  s[31] = t[9] >> 18
}

function fe25519_frombytes (h, s) {
  check_fe(h)

  let h0 = load_4(s) & 0xffff
  let h0_ = (load_4(s) >>> 16) & 0xffff
  let h1 = (load_3(s, 4) << 6) & 0xffff
  let h1_ = (load_3(s, 4) >>> 10) & 0xffff
  let h2 = (load_3(s, 7) << 5) & 0xffff
  let h2_ = (load_3(s, 7) >>> 11) & 0xffff
  let h3 = (load_3(s, 10) << 3) & 0xffff
  let h3_ = (load_3(s, 10) >>> 13) & 0xffff
  let h4 = (load_3(s, 13) << 2) & 0xffff
  let h4_ = (load_3(s, 13) >>> 14) & 0xffff
  let h5 = load_4(s, 16) & 0xffff
  let h5_ = (load_4(s, 16) >> 16) & 0xffff
  let h6 = (load_3(s, 20) << 7) & 0xffff
  let h6_ = (load_3(s, 20) >>> 9) & 0xffff
  let h7 = (load_3(s, 23) << 5) & 0xffff
  let h7_ = (load_3(s, 23) >>> 11) & 0xffff
  let h8 = (load_3(s, 26) << 4) & 0xffff
  let h8_ = (load_3(s, 26) >>> 12) & 0xffff
  let h9 = ((load_3(s, 29)) << 2) & 0xffff
  let h9_ = ((load_3(s, 29) & 8388607) >>> 14) & 0xffff

  let carry0
  let carry1
  let carry2
  let carry3
  let carry4
  let carry5
  let carry6
  let carry7
  let carry8
  let carry9

  carry9 = (h9_ + (1 << 8)) >> 9
  h9_ -= carry9 * (1 << 9)
  h0 += carry9 * 19
  carry9 = (h0 + (1 << 15)) >> 16
  h0_ += carry9
  h0 -= carry9 * (1 << 16)

  carry1 = (h1_ + (1 << 8)) >> 9
  h1_ -= carry1 * (1 << 9)
  h2 += carry1
  carry1 = (h2 + (1 << 15)) >> 16
  h2_ += carry1
  h2 -= carry1 * (1 << 16)

  carry3 = (h3_ + (1 << 8)) >> 9
  h3_ -= carry3 * (1 << 9)
  h4 += carry3
  carry3 = (h4 + (1 << 15)) >> 16
  h4_ += carry3
  h4 -= carry3 * (1 << 16)

  carry5 = (h5_ + (1 << 8)) >> 9
  h5_ -= carry5 * (1 << 9)
  h6 += carry5
  carry5 = (h6 + (1 << 15)) >> 16
  h6_ += carry5
  h6 -= carry5 * (1 << 16)

  carry7 = (h7_ + (1 << 8)) >> 9
  h7_ -= carry7 * (1 << 9)
  h8 += carry7
  carry7 = (h8 + (1 << 15)) >> 16
  h8_ += carry7
  h8 -= carry7 * (1 << 16)

  carry0 = (h0_ + (1 << 9)) >>> 10
  h0_ -= carry0 * (1 << 10)
  h1 += carry0
  carry0 = (h1 + (1 << 15)) >>> 16
  h1_ += carry0
  h1 -= carry0 * (1 << 16)

  carry2 = (h2_ + (1 << 9)) >>> 10
  h2_ -= carry2 * (1 << 10)
  h3 += carry2
  carry2 = (h3 + (1 << 15)) >>> 16
  h3_ += carry2
  h3 -= carry2 * (1 << 16)

  carry4 = (h4_ + (1 << 9)) >>> 10
  h4_ -= carry4 * (1 << 10)
  h5 += carry4
  carry4 = (h5 + (1 << 15)) >>> 16
  h5_ += carry4
  h5 -= carry4 * (1 << 16)

  carry6 = (h6_ + (1 << 9)) >>> 10
  h6_ -= carry6 * (1 << 10)
  h7 += carry6
  carry6 = (h7 + (1 << 15)) >>> 16
  h7_ += carry6
  h7 -= carry6 * (1 << 16)

  carry8 = (h8_ + (1 << 9)) >>> 10
  h8_ -= carry8 * (1 << 10)
  h9 += carry8
  carry8 = (h9 + (1 << 15)) >>> 16
  h9_ += carry8
  h9 -= carry8 * (1 << 16)

  h[0] = h0 + (h0_ << 16)
  h[1] = h1 + (h1_ << 16)
  h[2] = h2 + (h2_ << 16)
  h[3] = h3 + (h3_ << 16)
  h[4] = h4 + (h4_ << 16)
  h[5] = h5 + (h5_ << 16)
  h[6] = h6 + (h6_ << 16)
  h[7] = h7 + (h7_ << 16)
  h[8] = h8 + (h8_ << 16)
  h[9] = h9 + (h9_ << 16)
}

function fe25519_0 (h) {
  check_fe(h)

  for (let i = 0; i < 10; i++) h[i] = 0
}

function fe25519_1 (h) {
  check_fe(h)

  h[0] = 1
  for (let i = 1; i < 10; i++) h[i] = 0
}

/*
 h = f + g
 Can overlap h with f or g.
 *
 Preconditions:
 |f| bounded by 1.1*2^25,1.1*2^24,1.1*2^25,1.1*2^24,etc.
 |g| bounded by 1.1*2^25,1.1*2^24,1.1*2^25,1.1*2^24,etc.
 *
 Postconditions:
 |h| bounded by 1.1*2^26,1.1*2^25,1.1*2^26,1.1*2^25,etc.
 */

function fe25519_add (h, f, g) {
  check_fe(h)
  check_fe(f)
  check_fe(g)

  h[0] = f[0] + g[0]
  h[1] = f[1] + g[1]
  h[2] = f[2] + g[2]
  h[3] = f[3] + g[3]
  h[4] = f[4] + g[4]
  h[5] = f[5] + g[5]
  h[6] = f[6] + g[6]
  h[7] = f[7] + g[7]
  h[8] = f[8] + g[8]
  h[9] = f[9] + g[9]
}

/*
 h = f - g
 Can overlap h with f or g.
 *
 Preconditions:
 |f| bounded by 1.1*2^25,1.1*2^24,1.1*2^25,1.1*2^24,etc.
 |g| bounded by 1.1*2^25,1.1*2^24,1.1*2^25,1.1*2^24,etc.
 *
 Postconditions:
 |h| bounded by 1.1*2^26,1.1*2^25,1.1*2^26,1.1*2^25,etc.
 */

function fe25519_sub (h, f, g) {
  check_fe(h)
  check_fe(f)
  check_fe(g)

  h[0] = f[0] - g[0]
  h[1] = f[1] - g[1]
  h[2] = f[2] - g[2]
  h[3] = f[3] - g[3]
  h[4] = f[4] - g[4]
  h[5] = f[5] - g[5]
  h[6] = f[6] - g[6]
  h[7] = f[7] - g[7]
  h[8] = f[8] - g[8]
  h[9] = f[9] - g[9]
}

/*
 h = -f
 *
 Preconditions:
 |f| bounded by 1.1*2^25,1.1*2^24,1.1*2^25,1.1*2^24,etc.
 *
 Postconditions:
 |h| bounded by 1.1*2^25,1.1*2^24,1.1*2^25,1.1*2^24,etc.
 */

function fe25519_neg (h, f) {
  check_fe(h)
  check_fe(f)

  h[0] = -f[0]
  h[1] = -f[1]
  h[2] = -f[2]
  h[3] = -f[3]
  h[4] = -f[4]
  h[5] = -f[5]
  h[6] = -f[6]
  h[7] = -f[7]
  h[8] = -f[8]
  h[9] = -f[9]
}

/*
 Replace (f,g) with (g,g) if b == 1;
 replace (f,g) with (f,g) if b == 0.
 *
 Preconditions: b in {0,1}.
 */

function fe25519_cmov (f, g, b) {
  check_fe(f)
  check_fe(g)

  const mask = b ? 0xffffffff : 0x00000000

  let f0, f1, f2, f3, f4, f5, f6, f7, f8, f9
  let x0, x1, x2, x3, x4, x5, x6, x7, x8, x9

  f0 = f[0]
  f1 = f[1]
  f2 = f[2]
  f3 = f[3]
  f4 = f[4]
  f5 = f[5]
  f6 = f[6]
  f7 = f[7]
  f8 = f[8]
  f9 = f[9]

  x0 = f0 ^ g[0]
  x1 = f1 ^ g[1]
  x2 = f2 ^ g[2]
  x3 = f3 ^ g[3]
  x4 = f4 ^ g[4]
  x5 = f5 ^ g[5]
  x6 = f6 ^ g[6]
  x7 = f7 ^ g[7]
  x8 = f8 ^ g[8]
  x9 = f9 ^ g[9]

  x0 &= mask
  x1 &= mask
  x2 &= mask
  x3 &= mask
  x4 &= mask
  x5 &= mask
  x6 &= mask
  x7 &= mask
  x8 &= mask
  x9 &= mask

  f[0] = f0 ^ x0
  f[1] = f1 ^ x1
  f[2] = f2 ^ x2
  f[3] = f3 ^ x3
  f[4] = f4 ^ x4
  f[5] = f5 ^ x5
  f[6] = f6 ^ x6
  f[7] = f7 ^ x7
  f[8] = f8 ^ x8
  f[9] = f9 ^ x9
}

/*
 Replace (f,g) with (g,f) if b == 1;
 replace (f,g) with (f,g) if b == 0.
 *
 Preconditions: b in {0,1}.
 */

function fe25519_cswap (f, g, b) {
  check_fe(f)
  check_fe(g)

  const mask = b ? 0xffffffff : 0x00000000
  let x0, x1, x2, x3, x4, x5, x6, x7, x8, x9

  x0 = (f[0] ^ g[0]) & mask
  x1 = (f[1] ^ g[1]) & mask
  x2 = (f[2] ^ g[2]) & mask
  x3 = (f[3] ^ g[3]) & mask
  x4 = (f[4] ^ g[4]) & mask
  x5 = (f[5] ^ g[5]) & mask
  x6 = (f[6] ^ g[6]) & mask
  x7 = (f[7] ^ g[7]) & mask
  x8 = (f[8] ^ g[8]) & mask
  x9 = (f[9] ^ g[9]) & mask

  f[0] ^= x0
  f[1] ^= x1
  f[2] ^= x2
  f[3] ^= x3
  f[4] ^= x4
  f[5] ^= x5
  f[6] ^= x6
  f[7] ^= x7
  f[8] ^= x8
  f[9] ^= x9

  g[0] ^= x0
  g[1] ^= x1
  g[2] ^= x2
  g[3] ^= x3
  g[4] ^= x4
  g[5] ^= x5
  g[6] ^= x6
  g[7] ^= x7
  g[8] ^= x8
  g[9] ^= x9
}

/*
 Replace (h) with (-f) if b == 1;
 replace (h) with (f) if b == 0.
 *
 Preconditions: b in {0,1}.
 */

function fe25519_cneg (h, f, b) {
  check_fe(h)
  check_fe(f)

  const negf = fe25519()

  fe25519_neg(negf, f)
  fe25519_copy(h, f)
  fe25519_cmov(h, negf, b)
}

/*
 h = f
 */

function fe25519_copy (h, f) {
  check_fe(h)
  check_fe(f)

  for (let i = 0; i < 10; i++) h[i] = f[i]
}

/*
 h = |f|
 */

function fe25519_abs (h, f) {
  check_fe(h)
  check_fe(f)

  fe25519_cneg(h, f, fe25519_isnegative(f))
}

/*
 return 1 if f is in {1,3,5,...,q-2}
 return 0 if f is in {0,2,4,...,q-1}
 Preconditions:
 |f| bounded by 1.1*2^26,1.1*2^25,1.1*2^26,1.1*2^25,etc.
 */

function fe25519_isnegative (f) {
  check_fe(f)

  const s = new Uint8Array(32)
  fe25519_tobytes(s, f)

  return s[0] & 1
}

/*
 return 1 if f == 0
 return 0 if f != 0
 Preconditions:
 |f| bounded by 1.1*2^26,1.1*2^25,1.1*2^26,1.1*2^25,etc.
 */

function fe25519_iszero (f) {
  check_fe(f)

  const s = new Uint8Array(32)
  fe25519_tobytes(s, f)

  return sodium_is_zero(s, 32)

  function sodium_is_zero (n) {
    let i
    let d = 0

    for (let i = 0; i < n.length; i++) {
      d |= n[i]
    }

    return 1 & ((d - 1) >> 8)
  }
}

/*
 h = f * g
 Can overlap h with f or g.
 *
 Preconditions:
 |f| bounded by 1.65*2^26,1.65*2^25,1.65*2^26,1.65*2^25,etc.
 |g| bounded by 1.65*2^26,1.65*2^25,1.65*2^26,1.65*2^25,etc.
 *
 Postconditions:
 |h| bounded by 1.01*2^25,1.01*2^24,1.01*2^25,1.01*2^24,etc.
 */

/*
 Notes on implementation strategy:
 *
 Using schoolbook multiplication.
 Karatsuba would save a little in some cost models.
 *
 Most multiplications by 2 and 19 are 32-bit precomputations;
 cheaper than 64-bit postcomputations.
 *
 There is one remaining multiplication by 19 in the carry chain;
 one *19 precomputation can be merged into this,
 but the resulting data flow is considerably less clean.
 *
 There are 12 carries below.
 10 of them are 2-way parallelizable and vectorizable.
 Can get away with 11 carries, but then data flow is much deeper.
 *
 With tighter constraints on inputs can squeeze carries into int32.
 */

function fe25519_mul (h, f, g) {
  check_fe(h)
  check_fe(f)
  check_fe(g)

  // printFe(f, 'f')
  // printFe(g, 'g')

  const fbuf = new Uint8Array(f.buffer)
  const gbuf = new Uint8Array(g.buffer)

  // shared memory, mul takes 0 - 120
  mem.set(fbuf)
  mem.set(gbuf, 40)
  wasm_mul.exports.fe25519_mul(80, 0, 40)

  parse_fe(h, mem, 80)
}

function fe25519_mul32 (h, f, n) {
  check_fe(h)
  check_fe(f)

  // printFe(f, 'f')
  // printFe(g, 'g')

  const fbuf = new Uint8Array(f.buffer)

  wasm_mul32.memory.set(fbuf)
  wasm_mul32.exports.fe25519_mul32(40, 0, n)

  const output = Buffer.from(wasm_mul32.memory.slice(40, 80))
  parse_fe(h, output, 0)
}

/*
 h = f * f
 Can overlap h with f.
 *
 Preconditions:
 |f| bounded by 1.65*2^26,1.65*2^25,1.65*2^26,1.65*2^25,etc.
 *
 Postconditions:
 |h| bounded by 1.01*2^25,1.01*2^24,1.01*2^25,1.01*2^24,etc.
 */

function fe25519_sq (h, f, log) {
  check_fe(h)
  check_fe(f)

  const buf = new Uint8Array(f.buffer)

  // shared memory, mul takes 120 - 200
  mem.set(buf, 120)
  wasm_sq.exports.sq(160, 120, 0)

  parse_fe(h, mem, 160)
}

/*
 h = 2 * f * f
 Can overlap h with f.
 *
 Preconditions:
 |f| bounded by 1.65*2^26,1.65*2^25,1.65*2^26,1.65*2^25,etc.
 *
 Postconditions:
 |h| bounded by 1.01*2^25,1.01*2^24,1.01*2^25,1.01*2^24,etc.
 */

function fe25519_sq2 (h, f) {
  check_fe(h)
  check_fe(f)

  const buf = new Uint8Array(f.buffer)

  mem.set(buf, 120)
  wasm_sq.exports.sq(160, 120, 1)

  parse_fe(h, mem, 160)
}

function fe25519_sqmul (s, n, a) {
  check_fe(s)
  check_fe(a)
  assert(typeof n === 'number' && n < 2 ** 32)

  for (let i = 0; i < n; i++) {
    fe25519_sq(s, s)
  }
  fe25519_mul(s, s, a)
}

/*
 * Inversion - returns 0 if z=0
 */

function fe25519_invert_1 (out, z) {
  check_fe(out)
  check_fe(z)

  const t0 = fe25519(); const t1 = fe25519(); const t2 = fe25519(); const t3 = fe25519()
  let i

  fe25519_sq(t0, z)
  fe25519_sq(t1, t0)
  fe25519_sq(t1, t1)
  fe25519_mul(t1, z, t1)
  fe25519_mul(t0, t0, t1)
  fe25519_sq(t2, t0)
  fe25519_mul(t1, t1, t2)
  fe25519_sq(t2, t1)
  for (i = 1; i < 5; i++) {
    fe25519_sq(t2, t2)
  }
  fe25519_mul(t1, t2, t1)
  fe25519_sq(t2, t1)
  for (i = 1; i < 10; i++) {
    fe25519_sq(t2, t2)
  }
  fe25519_mul(t2, t2, t1)
  fe25519_sq(t3, t2)
  for (i = 1; i < 20; i++) {
    fe25519_sq(t3, t3)
  }
  fe25519_mul(t2, t3, t2)
  fe25519_sq(t2, t2)
  for (i = 1; i < 10; i++) {
    fe25519_sq(t2, t2)
  }
  fe25519_mul(t1, t2, t1)
  fe25519_sq(t2, t1)
  for (i = 1; i < 50; i++) {
    fe25519_sq(t2, t2)
  }
  fe25519_mul(t2, t2, t1)
  fe25519_sq(t3, t2)
  for (i = 1; i < 100; i++) {
    fe25519_sq(t3, t3)
  }
  fe25519_mul(t2, t3, t2)
  fe25519_sq(t2, t2)
  for (i = 1; i < 50; i++) {
    fe25519_sq(t2, t2)
  }
  fe25519_mul(t1, t2, t1)
  fe25519_sq(t1, t1)
  for (i = 1; i < 5; i++) {
    fe25519_sq(t1, t1)
  }
  fe25519_mul(out, t1, t0)
}

/*
Power 2^252 - 3 mod 2^255 - 19
*/

function fe25519_pow22523_1 (out, z) {
  check_fe(out)
  check_fe(z)

  const t0 = fe25519(); const t1 = fe25519(); const t2 = fe25519()
  let i

  fe25519_sq(t0, z)
  fe25519_sq(t1, t0)
  fe25519_sq(t1, t1)
  fe25519_mul(t1, z, t1)
  fe25519_mul(t0, t0, t1)
  fe25519_sq(t0, t0)
  fe25519_mul(t0, t1, t0)
  fe25519_sq(t1, t0)
  for (i = 1; i < 5; i++) {
    fe25519_sq(t1, t1)
  }
  fe25519_mul(t0, t1, t0)
  fe25519_sq(t1, t0)
  for (i = 1; i < 10; i++) {
    fe25519_sq(t1, t1)
  }
  fe25519_mul(t1, t1, t0)
  fe25519_sq(t2, t1)
  for (i = 1; i < 20; i++) {
    fe25519_sq(t2, t2)
  }
  fe25519_mul(t1, t2, t1)
  fe25519_sq(t1, t1)
  for (i = 1; i < 10; i++) {
    fe25519_sq(t1, t1)
  }
  fe25519_mul(t0, t1, t0)
  fe25519_sq(t1, t0)
  for (i = 1; i < 50; i++) {
    fe25519_sq(t1, t1)
  }
  fe25519_mul(t1, t1, t0)
  fe25519_sq(t2, t1)
  for (i = 1; i < 100; i++) {
    fe25519_sq(t2, t2)
  }
  fe25519_mul(t1, t2, t1)
  fe25519_sq(t1, t1)
  for (i = 1; i < 50; i++) {
    fe25519_sq(t1, t1)
  }
  fe25519_mul(t0, t1, t0)
  fe25519_sq(t0, t0)
  fe25519_sq(t0, t0)
  fe25519_mul(out, t0, z)
}

function fe25519_unchecked_sqrt (x, x2) {
  check_fe(x)
  check_fe(x2)

  const p_root = fe25519()
  const m_root = fe25519()
  const m_root2 = fe25519()
  const e = fe25519()

  fe25519_pow22523(e, x)
  fe25519_mul(p_root, e, x)
  fe25519_mul(m_root, p_root, fe25519_sqrtm1)
  fe25519_sq(m_root2, m_root)
  fe25519_sub(e, x2, m_root2)
  fe25519_copy(x, p_root)
  fe25519_cmov(x, m_root, fe25519_iszero(e))
}

function fe25519_sqrt (x, x2) {
  const check = fe25519()
  const x2_copy = fe25519()

  fe25519_copy(x2_copy, x2)
  fe25519_unchecked_sqrt(x, x2)
  fe25519_sq(check, x)
  fe25519_sub(check, check, x2_copy)

  return fe25519_iszero(check) - 1
}

/*
r = p + q
*/

// function ge25519_add (r, p, q) {
//   let Aa = fe25519(),
//       Ab = fe25519(),
//       Ac = fe25519(),
//       Ad = fe25519(),
//       Ae = fe25519(),
//       Af = fe25519(),
//       Ag = fe25519(),
//       Ah = fe25519(),
//       At = fe25519();

//   fe25519_sub(Aa, p[0], p[1]);
//   fe25519_sub(At, q[0], q[1]);
//   fe25519_mul(Aa, Aa, At);
//   fe25519_add(Ab, p[0], p[1]);
//   fe25519_add(At, q[0], q[1]);
//   fe25519_mul(Ab, Ab, At);
//   fe25519_mul(Ac, p[3], q[3]);
//   fe25519_mul(Ac, Ac, ed25519_d2);
//   fe25519_mul(Ad, p[2], q[2]);
//   fe25519_add(Ad, Ad, Ad);
//   fe25519_sub(Ae, Ab, Aa);
//   fe25519_sub(Af, Ad, Ac);
//   fe25519_add(Ag, Ad, Ac);
//   fe25519_add(Ah, Ab, Aa);

//   fe25519_mul(p[0], Ae, Af);
//   fe25519_mul(p[1], Ah, Ag);
//   fe25519_mul(p[2], Ag, Af);
//   fe25519_mul(p[3], Ae, Ah);
// }

/*
 r = p - q
 */

function ge25519_add_cached (r, p, q) {
  check_ge3(r)
  check_ge3(p)
  check_ge3(q)

  const t0 = fe25519()

  fe25519_add(r[0], p[1], p[0])
  fe25519_sub(r[1], p[1], p[0])
  fe25519_mul(r[2], r[0], q[0])
  fe25519_mul(r[1], r[1], q[1])
  fe25519_mul(r[3], q[3], p[3])
  fe25519_mul(r[0], p[2], q[2])
  fe25519_add(t0, r[0], r[0])
  fe25519_sub(r[0], r[2], r[1])
  fe25519_add(r[1], r[2], r[1])
  fe25519_add(r[2], t0, r[3])
  fe25519_sub(r[3], t0, r[3])
}

function ge25519_sub_cached (r, p, q) {
  check_ge3(r)
  check_ge3(p)
  check_ge3(q)

  const t0 = fe25519()

  fe25519_add(r[0], p[1], p[0])
  fe25519_sub(r[1], p[1], p[0])
  fe25519_mul(r[2], r[0], q[1])
  fe25519_mul(r[1], r[1], q[0])
  fe25519_mul(r[3], q[3], p[3])
  fe25519_mul(r[0], p[2], q[2])
  fe25519_add(t0, r[0], r[0])
  fe25519_sub(r[0], r[2], r[1])
  fe25519_add(r[1], r[2], r[1])
  fe25519_sub(r[2], t0, r[3])
  fe25519_add(r[3], t0, r[3])
}

function slide_vartime (r, a) {
  let i
  let b
  let k
  let ribs
  let cmp

  for (i = 0; i < 256; i++) {
    r[i] = 1 & (a[i >> 3] >> (i & 7))
  }

  for (i = 0; i < 256; i++) {
    if (!r[i]) {
      continue
    }
    for (b = 1; b <= 6 && i + b < 256; ++b) {
      if (!r[i + b]) {
        continue
      }
      ribs = r[i + b] << b
      cmp = r[i] + ribs
      if (cmp <= 15) {
        r[i] = cmp
        r[i + b] = 0
      } else {
        cmp = r[i] - ribs
        if (cmp < -15) {
          break
        }
        r[i] = cmp
        for (k = i + b; k < 256; ++k) {
          if (!r[k]) {
            r[k] = 1
            break
          }
          r[k] = 0
        }
      }
    }
  }
}

function ge25519_frombytes (h, s) {
  check_ge3(h)

  const u = fe25519()
  const v = fe25519()
  const v3 = fe25519()
  const vxx = fe25519()
  const m_root_check = fe25519()
  const p_root_check = fe25519()
  const negx = fe25519()
  const x_sqrtm1 = fe25519()
  let has_m_root, has_p_root

  fe25519_frombytes(h[1], s)
  fe25519_1(h[2])
  fe25519_sq(u, h[1])
  fe25519_mul(v, u, ed25519_d)
  fe25519_sub(u, u, h[2]) /* u = y^2-1 */
  fe25519_add(v, v, h[2]) /* v = dy^2+1 */

  fe25519_sq(v3, v)
  fe25519_mul(v3, v3, v) /* v3 = v^3 */
  fe25519_sq(h[0], v3)
  fe25519_mul(h[0], h[0], v)
  fe25519_mul(h[0], h[0], u) /* x = uv^7 */

  fe25519_pow22523(h[0], h[0]) /* x = (uv^7)^((q-5)/8) */
  fe25519_mul(h[0], h[0], v3)
  fe25519_mul(h[0], h[0], u) /* x = uv^3(uv^7)^((q-5)/8) */

  fe25519_sq(vxx, h[0])
  fe25519_mul(vxx, vxx, v)
  fe25519_sub(m_root_check, vxx, u) /* vx^2-u */
  fe25519_add(p_root_check, vxx, u) /* vx^2+u */
  has_m_root = fe25519_iszero(m_root_check)
  has_p_root = fe25519_iszero(p_root_check)
  fe25519_mul(x_sqrtm1, h[0], fe25519_sqrtm1) /* x*sqrt(-1) */
  fe25519_cmov(h[0], x_sqrtm1, 1 - has_m_root)

  fe25519_neg(negx, h[0])
  fe25519_cmov(h[0], negx, fe25519_isnegative(h[0]) ^ (s[31] >> 7))
  fe25519_mul(h[3], h[0], h[1])

  return (has_m_root | has_p_root) - 1
}

function ge25519_frombytes_negate_vartime (h, s) {
  check_ge3(h)

  const u = fe25519()
  const v = fe25519()
  const v3 = fe25519()
  const vxx = fe25519()
  const m_root_check = fe25519(); const p_root_check = fe25519()

  fe25519_frombytes(h[1], s)
  fe25519_1(h[2])
  fe25519_sq(u, h[1])
  fe25519_mul(v, u, ed25519_d)
  fe25519_sub(u, u, h[2]) /* u = y^2-1 */
  fe25519_add(v, v, h[2]) /* v = dy^2+1 */

  fe25519_sq(v3, v)
  fe25519_mul(v3, v3, v) /* v3 = v^3 */
  fe25519_sq(h[0], v3)
  fe25519_mul(h[0], h[0], v)
  fe25519_mul(h[0], h[0], u) /* x = uv^7 */

  fe25519_pow22523(h[0], h[0]) /* x = (uv^7)^((q-5)/8) */
  fe25519_mul(h[0], h[0], v3)
  fe25519_mul(h[0], h[0], u) /* x = uv^3(uv^7)^((q-5)/8) */

  fe25519_sq(vxx, h[0])
  fe25519_mul(vxx, vxx, v)
  fe25519_sub(m_root_check, vxx, u) /* vx^2-u */

  if (fe25519_iszero(m_root_check) == 0) {
    fe25519_add(p_root_check, vxx, u) /* vx^2+u */
    if (fe25519_iszero(p_root_check) == 0) {
      return -1
    }
    fe25519_mul(h[0], h[0], fe25519_sqrtm1)
  }

  if (fe25519_isnegative(h[0]) == (s[31] >> 7)) {
    fe25519_neg(h[0], h[0])
  }

  fe25519_mul(h[3], h[0], h[1])

  return 0
}

/*
 r = p + q
 */

function ge25519_add_precomp (r, p, q) {
  check_ge3(r)
  check_ge3(p)
  check_ge2(q)

  const t0 = fe25519()

  fe25519_add(r[0], p[1], p[0])
  fe25519_sub(r[1], p[1], p[0])
  fe25519_mul(r[2], r[0], q[0])
  fe25519_mul(r[1], r[1], q[1])
  fe25519_mul(r[3], q[2], p[3])
  fe25519_add(t0, p[2], p[2])
  fe25519_sub(r[0], r[2], r[1])
  fe25519_add(r[1], r[2], r[1])
  fe25519_add(r[2], t0, r[3])
  fe25519_sub(r[3], t0, r[3])
}

/*
 r = p - q
 */

function ge25519_sub_precomp (r, p, q) {
  check_ge3(r)
  check_ge3(p)
  check_ge2(q)

  const t0 = fe25519()

  fe25519_add(r[0], p[1], p[0])
  fe25519_sub(r[1], p[1], p[0])
  fe25519_mul(r[2], r[0], q[1])
  fe25519_mul(r[1], r[1], q[0])
  fe25519_mul(r[3], q[2], p[3])
  fe25519_add(t0, p[2], p[2])
  fe25519_sub(r[0], r[2], r[1])
  fe25519_add(r[1], r[2], r[1])
  fe25519_sub(r[2], t0, r[3])
  fe25519_add(r[3], t0, r[3])
}

/*
 r = p
 */

function ge25519_p1p1_to_p2 (r, p) {
  check_ge3(p)
  check_ge2(r)

  fe25519_mul(r[0], p[0], p[3])
  fe25519_mul(r[1], p[1], p[2])
  fe25519_mul(r[2], p[2], p[3])
  // console.log(r[0])
}

/*
 r = p
 */

function ge25519_p1p1_to_p3 (r, p) {
  check_ge3(p)
  check_ge3(r)

  fe25519_mul(r[0], p[0], p[3])
  fe25519_mul(r[1], p[1], p[2])
  fe25519_mul(r[2], p[2], p[3])
  fe25519_mul(r[3], p[0], p[1])
}

function ge25519_p2_0 (h) {
  check_ge2(h)

  fe25519_0(h[0])
  fe25519_1(h[1])
  fe25519_1(h[2])
}

/*
 r = 2 * p
 */

function ge25519_p2_dbl (r, p) {
  check_ge3(r)
  check_ge2(p)

  const t0 = fe25519()

  fe25519_sq(r[0], p[0])
  fe25519_sq(r[2], p[1])
  fe25519_sq2(r[3], p[2])
  fe25519_add(r[1], p[0], p[1])
  fe25519_sq(t0, r[1])
  fe25519_add(r[1], r[2], r[0])
  fe25519_sub(r[2], r[2], r[0])
  fe25519_sub(r[0], t0, r[1])
  fe25519_sub(r[3], r[3], r[2])
}

function ge25519_p3_0 (h) {
  check_ge3(h)

  fe25519_0(h[0])
  fe25519_1(h[1])
  fe25519_1(h[2])
  fe25519_0(h[3])
}

function ge25519_cached_0 (h) {
  check_ge3(h)

  fe25519_1(h[0])
  fe25519_1(h[1])
  fe25519_1(h[2])
  fe25519_0(h[3])
}

/*
 r = p
 */

function ge25519_p3_to_cached (r, p) {
  check_ge3(r)
  check_ge3(p)

  fe25519_add(r[0], p[1], p[0])
  fe25519_sub(r[1], p[1], p[0])
  fe25519_copy(r[2], p[2])
  fe25519_mul(r[3], p[3], ed25519_d2)
}

function ge25519_p3_to_precomp (pi, p) {
  check_ge2(pi)
  check_ge3(p)

  const recip = fe25519()
  const x = fe25519()
  const y = fe25519()
  const xy = fe25519()

  fe25519_invert(recip, p[2])
  fe25519_mul(x, p[0], recip)
  fe25519_mul(y, p[1], recip)
  fe25519_add(pi[0], y, x)
  fe25519_sub(pi[1], y, x)
  fe25519_mul(xy, x, y)
  fe25519_mul(pi[2], xy, ed25519_d2)
}

/*
 r = p
 */

function ge25519_p3_to_p2 (r, p) {
  check_ge2(r)
  check_ge3(p)

  fe25519_copy(r[0], p[0])
  fe25519_copy(r[1], p[1])
  fe25519_copy(r[2], p[2])
}

function ge25519_p3_tobytes (s, h) {
  check_ge3(h)
  const recip = fe25519()
  const x = fe25519()
  const y = fe25519()

  fe25519_invert(recip, h[2])
  fe25519_mul(x, h[0], recip)
  fe25519_mul(y, h[1], recip)
  fe25519_tobytes(s, y)
  s[31] ^= fe25519_isnegative(x) << 7
}

/*
 r = 2 * p
 */

function ge25519_p3_dbl (r, p) {
  check_ge3(p)
  check_ge3(r)

  const q = ge2()
  ge25519_p3_to_p2(q, p)
  ge25519_p2_dbl(r, q)
}

function ge25519_precomp_0 (h) {
  check_ge2(h)

  fe25519_1(h[0])
  fe25519_1(h[1])
  fe25519_0(h[2])
}

/* r = 2p */
function ge25519_p3p3_dbl (r, p) {
  check_ge3(r)
  check_ge3(p)
  const p1p1 = ge3()

  ge25519_p3_dbl(p1p1, p)
  ge25519_p1p1_to_p3(r, p1p1)
}

/* r = p+q */
function ge25519_p3_add (r, p, q) {
  check_ge3(r)
  check_ge3(p)
  check_ge3(q)

  const q_cached = ge3()
  const p1p1 = ge3()

  ge25519_p3_to_cached(q_cached, q)
  ge25519_add_cached(p1p1, p, q_cached)
  ge25519_p1p1_to_p3(r, p1p1)
}

/* r = r*(2^n)+q */
function ge25519_p3_dbladd (r, n, q) {
  check_ge3(r)
  check_ge3(q)

  const p2 = ge2()
  const p1p1 = ge3()
  let i

  ge25519_p3_to_p2(p2, r)
  for (i = 0; i < n; i++) {
    ge25519_p2_dbl(p1p1, p2)
    ge25519_p1p1_to_p2(p2, p1p1)
  }
  ge25519_p1p1_to_p3(r, p1p1)
  ge25519_p3_add(r, r, q)
}

function equal (b, c) {
  const u = new Uint8Array(3)
  let y = new Uint32Array(1)

  u[0] = b
  u[1] = c
  u[2] = u[0] ^ u[1] /* 0: yes; 1..255: no */

  y[0] = u[2] /* 0: yes; 1..255: no */

  y -= 1 /* 4294967295: yes; 0..254: no */
  y >>= 31 /* 1: yes; 0: no */

  return y
}

// ******************************************************************
// ******************************************************************

// uses uint64_t -> not used much need workaround
function negative (b) {
  /* 18446744073709551361..18446744073709551615: yes; 0..255: no */
  let x = b & 0xffffffff

  x >>>= 31 /* 1: yes; 0: no */

  return x
}

// ******************************************************************
// ******************************************************************

function ge25519_cmov (t, u, b) {
  check_ge2(t)
  check_ge2(u)

  fe25519_cmov(t[0], u[0], b)
  fe25519_cmov(t[1], u[1], b)
  fe25519_cmov(t[2], u[2], b)
}

function ge25519_cmov_cached (t, u, b) {
  check_ge3(t)
  check_ge3(u)

  fe25519_cmov(t[0], u[0], b)
  fe25519_cmov(t[1], u[1], b)
  fe25519_cmov(t[2], u[2], b)
  fe25519_cmov(t[3], u[3], b)
}

function ge25519_cmov8 (t, precomp, b) {
  check_ge2(t)
  // for (let i = 0; i < 8; i++) print_ge(precomp[i], 3)
  assert(precomp.length === 8)
  for (let i = 0; i < 8; i++) check_ge2(precomp[i])

  const minust = ge2()
  const bnegative = negative(b)
  const babs = b - (((-bnegative) & b) * (1 << 1))

  ge25519_precomp_0(t)
  ge25519_cmov(t, precomp[0], equal(babs, 1))
  ge25519_cmov(t, precomp[1], equal(babs, 2))
  ge25519_cmov(t, precomp[2], equal(babs, 3))
  ge25519_cmov(t, precomp[3], equal(babs, 4))
  ge25519_cmov(t, precomp[4], equal(babs, 5))
  ge25519_cmov(t, precomp[5], equal(babs, 6))
  ge25519_cmov(t, precomp[6], equal(babs, 7))
  ge25519_cmov(t, precomp[7], equal(babs, 8))
  fe25519_copy(minust[0], t[1])
  fe25519_copy(minust[1], t[0])
  fe25519_neg(minust[2], t[2])
  ge25519_cmov(t, minust, bnegative)
}

function ge25519_cmov8_base (t, pos, b) {
  check_ge2(t)
  ge25519_cmov8(t, base[pos], b)
}

// function ge25519_cmov8_base(t, pos, b) {
//   check_ge2(t)

//   static const ge25519_precomp base[32][8] = {  base[i][j] = (j+1)*256^i*B
//     // **************************************************** need fe_25_5 base
//   };
//   ge25519_cmov8(t, base[pos], b);
// }

function ge25519_cmov8_cached (t, cached, b) {
  check_ge3(t)
  assert(cached.length === 8)
  for (let i = 0; i < 8; i++) check_ge3(cached[i])

  const minust = ge3()
  const bnegative = negative(b)
  const babs = b - (((-bnegative) & b) * (1 << 1))

  ge25519_cached_0(t)
  ge25519_cmov_cached(t, cached[0], equal(babs, 1))
  ge25519_cmov_cached(t, cached[1], equal(babs, 2))
  ge25519_cmov_cached(t, cached[2], equal(babs, 3))
  ge25519_cmov_cached(t, cached[3], equal(babs, 4))
  ge25519_cmov_cached(t, cached[4], equal(babs, 5))
  ge25519_cmov_cached(t, cached[5], equal(babs, 6))
  ge25519_cmov_cached(t, cached[6], equal(babs, 7))
  ge25519_cmov_cached(t, cached[7], equal(babs, 8))
  fe25519_copy(minust[0], t[1])
  fe25519_copy(minust[1], t[0])
  fe25519_copy(minust[2], t[2])
  fe25519_neg(minust[3], t[3])
  ge25519_cmov_cached(t, minust, bnegative)
}

/*
 r = p - q
 */

function ge25519_sub (r, p, q) {
  check_ge3(r)
  check_ge3(p)
  check_ge3(q)
  const t0 = fe25519()

  fe25519_add(r[0], p[1], p[0])
  fe25519_sub(r[1], p[1], p[0])
  fe25519_mul(r[2], r[0], q[0])
  fe25519_mul(r[1], r[1], q[1])
  fe25519_mul(r[3], q[3], p[3])
  fe25519_mul(r[0], p[2], q[2])
  fe25519_add(t0, r[0], r[0])
  fe25519_sub(r[0], r[2], r[1])
  fe25519_add(r[1], r[2], r[1])
  fe25519_sub(r[2], t0, r[3])
  fe25519_add(r[3], t0, r[3])
}

function ge25519_tobytes (s, h) {
  check_ge2(h)

  const recip = fe25519()
  const x = fe25519()
  const y = fe25519()

  fe25519_invert(recip, h[2])
  fe25519_mul(x, h[0], recip)
  fe25519_mul(y, h[1], recip)
  fe25519_tobytes(s, y)
  s[31] ^= fe25519_isnegative(x) << 7
}

function ge25519_double_scalarmult_vartime (r, a, A, b) {
  check_ge2(r)

  const Bi = [
    ge3([
      [25967493, -14356035, 29566456, 3660896, -12694345, 4014787, 27544626, -11754271, -6079156, 2047605],
      [-12545711, 934262, -2722910, 3049990, -727428, 9406986, 12720692, 5043384, 19500929, -15469378],
      [-8738181, 4489570, 9688441, -14785194, 10184609, -12363380, 29287919, 11864899, -24514362, -4438546]
    ]),
    ge3([
      [15636291, -9688557, 24204773, -7912398, 616977, -16685262, 27787600, -14772189, 28944400, -1550024],
      [16568933, 4717097, -11556148, -1102322, 15682896, -11807043, 16354577, -11775962, 7689662, 11199574],
      [30464156, -5976125, -11779434, -15670865, 23220365, 15915852, 7512774, 10017326, -17749093, -9920357]
    ]),
    ge3([
      [10861363, 11473154, 27284546, 1981175, -30064349, 12577861, 32867885, 14515107, -15438304, 10819380],
      [4708026, 6336745, 20377586, 9066809, -11272109, 6594696, -25653668, 12483688, -12668491, 5581306],
      [19563160, 16186464, -29386857, 4097519, 10237984, -4348115, 28542350, 13850243, -23678021, -15815942]
    ]),
    ge3([
      [5153746, 9909285, 1723747, -2777874, 30523605, 5516873, 19480852, 5230134, -23952439, -15175766],
      [-30269007, -3463509, 7665486, 10083793, 28475525, 1649722, 20654025, 16520125, 30598449, 7715701],
      [28881845, 14381568, 9657904, 3680757, -20181635, 7843316, -31400660, 1370708, 29794553, -1409300]
    ]),
    ge3([
      [-22518993, -6692182, 14201702, -8745502, -23510406, 8844726, 18474211, -1361450, -13062696, 13821877],
      [-6455177, -7839871, 3374702, -4740862, -27098617, -10571707, 31655028, -7212327, 18853322, -14220951],
      [4566830, -12963868, -28974889, -12240689, -7602672, -2830569, -8514358, -10431137, 2207753, -3209784]
    ]),
    ge3([
      [-25154831, -4185821, 29681144, 7868801, -6854661, -9423865, -12437364, -663000, -31111463, -16132436],
      [25576264, -2703214, 7349804, -11814844, 16472782, 9300885, 3844789, 15725684, 171356, 6466918],
      [23103977, 13316479, 9739013, -16149481, 817875, -15038942, 8965339, -14088058, -30714912, 16193877]
    ]),
    ge3([
      [-33521811, 3180713, -2394130, 14003687, -16903474, -16270840, 17238398, 4729455, -18074513, 9256800],
      [-25182317, -4174131, 32336398, 5036987, -21236817, 11360617, 22616405, 9761698, -19827198, 630305],
      [-13720693, 2639453, -24237460, -7406481, 9494427, -5774029, -6554551, -15960994, -2449256, -14291300]
    ]),
    ge3([
      [-3151181, -5046075, 9282714, 6866145, -31907062, -863023, -18940575, 15033784, 25105118, -7894876],
      [-24326370, 15950226, -31801215, -14592823, -11662737, -5090925, 1573892, -2625887, 2198790, -15804619],
      [-3099351, 10324967, -2241613, 7453183, -5446979, -2735503, -13812022, -16236442, -32461234, -12290683]
    ])
  ]

  const aslide = new Int8Array(256)
  const bslide = new Int8Array(256)

  const Ai = new Array(8) /* A,3A,5A,7A,9A,11A,13A,15A */
  for (let i = 0; i < 8; i++) Ai[i] = ge3()
  const t = ge3()
  const u = ge3()
  const A2 = ge3()
  let i

  slide_vartime(aslide, a)
  slide_vartime(bslide, b)

  ge25519_p3_to_cached(Ai[0], A)
  ge25519_p3_dbl(t, A)
  ge25519_p1p1_to_p3(A2, t)

  ge25519_add_cached(t, A2, Ai[0])
  ge25519_p1p1_to_p3(u, t)
  ge25519_p3_to_cached(Ai[1], u)

  ge25519_add_cached(t, A2, Ai[1])
  ge25519_p1p1_to_p3(u, t)
  ge25519_p3_to_cached(Ai[2], u)

  ge25519_add_cached(t, A2, Ai[2])
  ge25519_p1p1_to_p3(u, t)
  ge25519_p3_to_cached(Ai[3], u)

  ge25519_add_cached(t, A2, Ai[3])
  ge25519_p1p1_to_p3(u, t)
  ge25519_p3_to_cached(Ai[4], u)

  ge25519_add_cached(t, A2, Ai[4])
  ge25519_p1p1_to_p3(u, t)
  ge25519_p3_to_cached(Ai[5], u)

  ge25519_add_cached(t, A2, Ai[5])
  ge25519_p1p1_to_p3(u, t)
  ge25519_p3_to_cached(Ai[6], u)

  ge25519_add_cached(t, A2, Ai[6])
  ge25519_p1p1_to_p3(u, t)
  ge25519_p3_to_cached(Ai[7], u)

  ge25519_p2_0(r)

  for (i = 255; i >= 0; --i) {
    if (aslide[i] || bslide[i]) {
      break
    }
  }

  for (; i >= 0; --i) {
    ge25519_p2_dbl(t, r)

    if (aslide[i] > 0) {
      ge25519_p1p1_to_p3(u, t)
      ge25519_add_cached(t, u, Ai[intDivide(aslide[i], 2)])
    } else if (aslide[i] < 0) {
      ge25519_p1p1_to_p3(u, t)
      ge25519_sub_cached(t, u, Ai[intDivide(-aslide[i], 2)])
    }

    if (bslide[i] > 0) {
      ge25519_p1p1_to_p3(u, t)
      ge25519_add_precomp(t, u, Bi[intDivide(bslide[i], 2)])
    } else if (bslide[i] < 0) {
      ge25519_p1p1_to_p3(u, t)
      ge25519_sub_precomp(t, u, Bi[intDivide(-bslide[i], 2)])
    }

    ge25519_p1p1_to_p2(r, t)
    // if (i > 250) { console.log(`i: ${i}\naslide: ${aslide[i]}\nbslide: ${bslide[i]}\n`); print_ge(r, 3)}
  }
}

/*
 h = a * p
 where a = a[0]+256*a[1]+...+256^31 a[31]
 Preconditions:
 a[31] <= 127
 p is public
 */

function ge25519_scalarmult (h, a, p) {
  check_ge3(h)
  check_ge3(p)

  const e = new Int8Array(64)
  const carry = new Int8Array(1)
  const r = ge3()
  const s = ge2()
  const t2 = ge3(); const t3 = ge3(); const t4 = ge3(); const t5 = ge3(); const t6 = ge3(); const t7 = ge3(); const t8 = ge3()
  const p2 = ge3(); const p3 = ge3(); const p4 = ge3(); const p5 = ge3(); const p6 = ge3(); const p7 = ge3(); const p8 = ge3()

  const pi = new Array(8)
  for (let i = 0; i < 8; i++) pi[i] = ge3()

  const t = ge3()

  ge25519_p3_to_cached(pi[1 - 1], p) /* p */

  ge25519_p3_dbl(t2, p)
  ge25519_p1p1_to_p3(p2, t2)
  ge25519_p3_to_cached(pi[2 - 1], p2) /* 2p = 2*p */

  ge25519_add_cached(t3, p, pi[2 - 1])
  ge25519_p1p1_to_p3(p3, t3)
  ge25519_p3_to_cached(pi[3 - 1], p3) /* 3p = 2p+p */

  ge25519_p3_dbl(t4, p2)
  ge25519_p1p1_to_p3(p4, t4)
  ge25519_p3_to_cached(pi[4 - 1], p4) /* 4p = 2*2p */

  ge25519_add_cached(t5, p, pi[4 - 1])
  ge25519_p1p1_to_p3(p5, t5)
  ge25519_p3_to_cached(pi[5 - 1], p5) /* 5p = 4p+p */

  ge25519_p3_dbl(t6, p3)
  ge25519_p1p1_to_p3(p6, t6)
  ge25519_p3_to_cached(pi[6 - 1], p6) /* 6p = 2*3p */

  ge25519_add_cached(t7, p, pi[6 - 1])
  ge25519_p1p1_to_p3(p7, t7)
  ge25519_p3_to_cached(pi[7 - 1], p7) /* 7p = 6p+p */

  ge25519_p3_dbl(t8, p4)
  ge25519_p1p1_to_p3(p8, t8)
  ge25519_p3_to_cached(pi[8 - 1], p8) /* 8p = 2*4p */

  for (let i = 0; i < 32; i++) {
    e[2 * i + 0] = (a[i] >> 0) & 15
    e[2 * i + 1] = (a[i] >> 4) & 15
  }
  /* each e[i] is between 0 and 15 */
  /* e[63] is between 0 and 7 */

  carry[0] = 0
  for (let i = 0; i < 63; i++) {
    e[i] += carry[0]
    carry[0] = e[i] + 8
    carry[0] >>= 4
    e[i] -= carry[0] * (1 << 4)
  }
  e[63] += carry[0]
  /* each e[i] is between -8 and 8 */

  ge25519_p3_0(h)

  for (i = 63; i != 0; i--) {
    ge25519_cmov8_cached(t, pi, e[i])
    ge25519_add_cached(r, h, t)

    ge25519_p1p1_to_p2(s, r)
    ge25519_p2_dbl(r, s)
    ge25519_p1p1_to_p2(s, r)
    ge25519_p2_dbl(r, s)
    ge25519_p1p1_to_p2(s, r)
    ge25519_p2_dbl(r, s)
    ge25519_p1p1_to_p2(s, r)
    ge25519_p2_dbl(r, s)

    ge25519_p1p1_to_p3(h, r) /* *16 */
  }

  ge25519_cmov8_cached(t, pi, e[i])
  ge25519_add_cached(r, h, t)

  ge25519_p1p1_to_p3(h, r)
}

/*
 h = a * B (with precomputation)
 where a = a[0]+256*a[1]+...+256^31 a[31]
 B is the Ed25519 base point (x,4/5) with x positive
 (as bytes: 0x5866666666666666666666666666666666666666666666666666666666666666)
 Preconditions:
 a[31] <= 127
 */

function ge25519_scalarmult_base (h, a) {
  check_ge3(h)

  let i
  const e = new Int8Array(64)
  let carry = 0
  const r = ge3()
  const s = ge2()
  const t = ge2()

  for (i = 0; i < 32; i++) {
    e[2 * i + 0] = (a[i] >> 0) & 15
    e[2 * i + 1] = (a[i] >> 4) & 15
  }
  /* each e[i] is between 0 and 15 */
  /* e[63] is between 0 and 7 */

  carry = 0
  for (i = 0; i < 63; i++) {
    e[i] += carry
    carry = e[i] + 8
    carry >>= 4
    e[i] -= carry * (1 << 4)
  }
  e[63] += carry
  /* each e[i] is between -8 and 8 */

  ge25519_p3_0(h)

  for (i = 1; i < 64; i += 2) {
    ge25519_cmov8_base(t, intDivide(i, 2), e[i])
    ge25519_add_precomp(r, h, t)
    ge25519_p1p1_to_p3(h, r)
  }

  ge25519_p3_dbl(r, h)
  ge25519_p1p1_to_p2(s, r)
  ge25519_p2_dbl(r, s)
  ge25519_p1p1_to_p2(s, r)
  ge25519_p2_dbl(r, s)
  ge25519_p1p1_to_p2(s, r)
  ge25519_p2_dbl(r, s)
  ge25519_p1p1_to_p3(h, r)

  for (i = 0; i < 64; i += 2) {
    ge25519_cmov8_base(t, intDivide(i, 2), e[i])
    ge25519_add_precomp(r, h, t)
    ge25519_p1p1_to_p3(h, r)
  }
}

/* multiply by the order of the main subgroup l = 2^252+27742317777372353535851937790883648493 */
function ge25519_mul_l (r, p) {
  const _10 = ge3()
  const _11 = ge3()
  const _100 = ge3()
  const _110 = ge3()
  const _1000 = ge3()
  const _1011 = ge3()
  const _10000 = ge3()
  const _100000 = ge3()
  const _100110 = ge3()
  const _1000000 = ge3()
  const _1010000 = ge3()
  const _1010011 = ge3()
  const _1100011 = ge3()
  const _1100111 = ge3()
  const _1101011 = ge3()
  const _10010011 = ge3()
  const _10010111 = ge3()
  const _10111101 = ge3()
  const _11010011 = ge3()
  const _11100111 = ge3()
  const _11101101 = ge3()
  const _11110101 = ge3()

  ge25519_p3p3_dbl(_10, p)
  ge25519_p3_add(_11, p, _10)
  ge25519_p3_add(_100, p, _11)
  ge25519_p3_add(_110, _10, _100)
  ge25519_p3_add(_1000, _10, _110)
  ge25519_p3_add(_1011, _11, _1000)
  ge25519_p3p3_dbl(_10000, _1000)
  ge25519_p3p3_dbl(_100000, _10000)
  ge25519_p3_add(_100110, _110, _100000)
  ge25519_p3p3_dbl(_1000000, _100000)
  ge25519_p3_add(_1010000, _10000, _1000000)
  ge25519_p3_add(_1010011, _11, _1010000)
  ge25519_p3_add(_1100011, _10000, _1010011)
  ge25519_p3_add(_1100111, _100, _1100011)
  ge25519_p3_add(_1101011, _100, _1100111)
  ge25519_p3_add(_10010011, _1000000, _1010011)
  ge25519_p3_add(_10010111, _100, _10010011)
  ge25519_p3_add(_10111101, _100110, _10010111)
  ge25519_p3_add(_11010011, _1000000, _10010011)
  ge25519_p3_add(_11100111, _1010000, _10010111)
  ge25519_p3_add(_11101101, _110, _11100111)
  ge25519_p3_add(_11110101, _1000, _11101101)

  ge25519_p3_add(r, _1011, _11110101)
  ge25519_p3_dbladd(r, 126, _1010011)
  ge25519_p3_dbladd(r, 9, _10)
  ge25519_p3_add(r, r, _11110101)
  ge25519_p3_dbladd(r, 7, _1100111)
  ge25519_p3_dbladd(r, 9, _11110101)
  ge25519_p3_dbladd(r, 11, _10111101)
  ge25519_p3_dbladd(r, 8, _11100111)
  ge25519_p3_dbladd(r, 9, _1101011)
  ge25519_p3_dbladd(r, 6, _1011)
  ge25519_p3_dbladd(r, 14, _10010011)
  ge25519_p3_dbladd(r, 10, _1100011)
  ge25519_p3_dbladd(r, 9, _10010111)
  ge25519_p3_dbladd(r, 10, _11110101)
  ge25519_p3_dbladd(r, 8, _11010011)
  ge25519_p3_dbladd(r, 8, _11101101)
}

function ge25519_is_on_curve (p) {
  check_ge3(p)

  const x2 = fe25519()
  const y2 = fe25519()
  const z2 = fe25519()
  const z4 = fe25519()
  const t0 = fe25519()
  const t1 = fe25519()

  fe25519_sq(x2, p[0])
  fe25519_sq(y2, p[1])
  fe25519_sq(z2, p[2])
  fe25519_sub(t0, y2, x2)
  fe25519_mul(t0, t0, z2)

  fe25519_mul(t1, x2, y2)
  fe25519_mul(t1, t1, ed25519_d)
  fe25519_sq(z4, z2)
  fe25519_add(t1, t1, z4)
  fe25519_sub(t0, t0, t1)

  return fe25519_iszero(t0)
}

function ge25519_is_on_main_subgroup (p) {
  const pl = ge3()

  ge25519_mul_l(pl, p)

  return fe25519_iszero(pl[0])
}

function ge25519_is_canonical (s) {
  let c
  let d

  c = (s[31] & 0x7f) ^ 0x7f
  for (let i = 30; i > 0; i--) {
    c |= s[i] ^ 0xff
  }
  c = (c - 1) >> 8
  d = (0xed - 1 - s[0]) >> 8

  return 1 - (c & d & 1)
}

function ge25519_has_small_order (s) {
  assert(s instanceof Uint8Array && s.length === 32)

  const blacklist = [
    /* 0 (order 4) */
    [
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ],
    /* 1 (order 1) */
    [
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ],
    /* 2707385501144840649318225287225658788936804267575313519463743609750303402022
       (order 8) */
    [
      0x26, 0xe8, 0x95, 0x8f, 0xc2, 0xb2, 0x27, 0xb0, 0x45, 0xc3, 0xf4,
      0x89, 0xf2, 0xef, 0x98, 0xf0, 0xd5, 0xdf, 0xac, 0x05, 0xd3, 0xc6,
      0x33, 0x39, 0xb1, 0x38, 0x02, 0x88, 0x6d, 0x53, 0xfc, 0x05
    ],
    /* 55188659117513257062467267217118295137698188065244968500265048394206261417927
       (order 8) */
    [
      0xc7, 0x17, 0x6a, 0x70, 0x3d, 0x4d, 0xd8, 0x4f, 0xba, 0x3c, 0x0b,
      0x76, 0x0d, 0x10, 0x67, 0x0f, 0x2a, 0x20, 0x53, 0xfa, 0x2c, 0x39,
      0xcc, 0xc6, 0x4e, 0xc7, 0xfd, 0x77, 0x92, 0xac, 0x03, 0x7a
    ],
    /* p-1 (order 2) */
    [
      0xec, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f
    ],
    /* p (=0, order 4) */
    [
      0xed, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f
    ],
    /* p+1 (=1, order 1) */
    [
      0xee, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f
    ]
  ]

  const c = new Uint8Array(7)
  assert(blacklist.length == 7)
  let j

  for (j = 0; j < 31; j++) {
    for (let i = 0; i < 7; i++) {
      c[i] |= s[j] ^ blacklist[i][j]
    }
  }

  for (let i = 0; i < 7; i++) {
    c[i] |= (s[j] & 0x7f) ^ blacklist[i][j]
  }

  let k = 0
  for (let i = 0; i < 7; i++) {
    k |= (c[i] - 1)
  }

  return ((k >> 8) & 1)
}

function sc25519_mul (s, a, b) {
  assert(s instanceof Uint8Array && s.length === 32)
  assert(a instanceof Uint8Array && a.length === 32)
  assert(b instanceof Uint8Array && a.length === 32)

  const _a = new Uint32Array(12)
  const _b = new Uint32Array(12)

  _a[0] = 2097151 & load_3(a)
  _a[1] = 2097151 & (load_4(a, 2) >>> 5)
  _a[2] = 2097151 & (load_3(a, 5) >>> 2)
  _a[3] = 2097151 & (load_4(a, 7) >>> 7)
  _a[4] = 2097151 & (load_4(a, 10) >>> 4)
  _a[5] = 2097151 & (load_3(a, 13) >>> 1)
  _a[6] = 2097151 & (load_4(a, 15) >>> 6)
  _a[7] = 2097151 & (load_3(a, 18) >>> 3)
  _a[8] = 2097151 & load_3(a, 21)
  _a[9] = 2097151 & (load_4(a, 23) >>> 5)
  _a[10] = 2097151 & (load_3(a, 26) >>> 2)
  _a[11] = (load_4(a, 28) >>> 7)

  _b[0] = 2097151 & load_3(b)
  _b[1] = 2097151 & (load_4(b, 2) >>> 5)
  _b[2] = 2097151 & (load_3(b, 5) >>> 2)
  _b[3] = 2097151 & (load_4(b, 7) >>> 7)
  _b[4] = 2097151 & (load_4(b, 10) >>> 4)
  _b[5] = 2097151 & (load_3(b, 13) >>> 1)
  _b[6] = 2097151 & (load_4(b, 15) >>> 6)
  _b[7] = 2097151 & (load_3(b, 18) >>> 3)
  _b[8] = 2097151 & load_3(b, 21)
  _b[9] = 2097151 & (load_4(b, 23) >>> 5)
  _b[10] = 2097151 & (load_3(b, 26) >>> 2)
  _b[11] = (load_4(b, 28) >>> 7)

  const abuf = new Uint8Array(_a.buffer)
  const bbuf = new Uint8Array(_b.buffer)

  wasm_sc_mul.memory.set(abuf, 0)
  wasm_sc_mul.memory.set(bbuf, 48)

  wasm_sc_mul.exports.sc25519_mul(96, 0, 48)

  s.set(wasm_sc_red.memory.slice(96, 128))
}

function sc25519_muladd (s, a, b, c) {
  assert(s instanceof Uint8Array && s.length >= 32)
  assert(a instanceof Uint8Array && b.length >= 32)
  assert(b instanceof Uint8Array && b.length >= 32)
  assert(c instanceof Uint8Array && c.length >= 32)

  const _a = new Uint32Array(12)
  const _b = new Uint32Array(12)
  const _c = new Uint32Array(12)

  _a[0] = 2097151 & load_3(a)
  _a[1] = 2097151 & (load_4(a, 2) >>> 5)
  _a[2] = 2097151 & (load_3(a, 5) >>> 2)
  _a[3] = 2097151 & (load_4(a, 7) >>> 7)
  _a[4] = 2097151 & (load_4(a, 10) >>> 4)
  _a[5] = 2097151 & (load_3(a, 13) >>> 1)
  _a[6] = 2097151 & (load_4(a, 15) >>> 6)
  _a[7] = 2097151 & (load_3(a, 18) >>> 3)
  _a[8] = 2097151 & load_3(a, 21)
  _a[9] = 2097151 & (load_4(a, 23) >>> 5)
  _a[10] = 2097151 & (load_3(a, 26) >>> 2)
  _a[11] = (load_4(a, 28) >>> 7)

  _b[0] = 2097151 & load_3(b)
  _b[1] = 2097151 & (load_4(b, 2) >>> 5)
  _b[2] = 2097151 & (load_3(b, 5) >>> 2)
  _b[3] = 2097151 & (load_4(b, 7) >>> 7)
  _b[4] = 2097151 & (load_4(b, 10) >>> 4)
  _b[5] = 2097151 & (load_3(b, 13) >>> 1)
  _b[6] = 2097151 & (load_4(b, 15) >>> 6)
  _b[7] = 2097151 & (load_3(b, 18) >>> 3)
  _b[8] = 2097151 & load_3(b, 21)
  _b[9] = 2097151 & (load_4(b, 23) >>> 5)
  _b[10] = 2097151 & (load_3(b, 26) >>> 2)
  _b[11] = (load_4(b, 28) >>> 7)

  _c[0] = 2097151 & load_3(c)
  _c[1] = 2097151 & (load_4(c, 2) >>> 5)
  _c[2] = 2097151 & (load_3(c, 5) >>> 2)
  _c[3] = 2097151 & (load_4(c, 7) >>> 7)
  _c[4] = 2097151 & (load_4(c, 10) >>> 4)
  _c[5] = 2097151 & (load_3(c, 13) >>> 1)
  _c[6] = 2097151 & (load_4(c, 15) >>> 6)
  _c[7] = 2097151 & (load_3(c, 18) >>> 3)
  _c[8] = 2097151 & load_3(c, 21)
  _c[9] = 2097151 & (load_4(c, 23) >>> 5)
  _c[10] = 2097151 & (load_3(c, 26) >>> 2)
  _c[11] = (load_4(c, 28) >>> 7)

  const abuf = new Uint8Array(_a.buffer)
  const bbuf = new Uint8Array(_b.buffer)
  const cbuf = new Uint8Array(_c.buffer)

  wasm_sc_muladd.memory.set(abuf, 0)
  wasm_sc_muladd.memory.set(bbuf, 48)
  wasm_sc_muladd.memory.set(cbuf, 96)

  wasm_sc_muladd.exports.sc25519_muladd(144, 0, 48, 96)

  s.set(wasm_sc_red.memory.slice(144, 176))
}

/*
 Input:
 a[0]+256*a[1]+...+256^31*a[31] = a
 *
 Output:
 s[0]+256*s[1]+...+256^31*s[31] = a^2 mod l
 where l = 2^252 + 27742317777372353535851937790883648493.
 */

function sc25519_sq (s, a) {
  assert(a instanceof Uint8Array && a.length === 32)
  assert(s instanceof Uint8Array && s.length === 32)

  sc25519_mul(s, a, a)
}

/*
 Input:
 s[0]+256*a[1]+...+256^31*a[31] = a
 n
 *
 Output:
 s[0]+256*s[1]+...+256^31*s[31] = x * s^(s^n) mod l
 where l = 2^252 + 27742317777372353535851937790883648493.
 Overwrites s in place.
 */

function sc25519_sqmul (s, n, a) {
  assert(a instanceof Uint8Array && a.length === 32)
  assert(s instanceof Uint8Array && s.length === 32)
  assert(typeof n === 'number')

  for (let i = 0; i < n; i++) {
    sc25519_sq(s, s)
  }

  sc25519_mul(s, s, a)
}

function sc25519_invert (recip, s) {
  assert(recip instanceof Uint8Array && recip.length === 32)
  assert(s instanceof Uint8Array && s.length === 32)

  const _10 = Buffer.alloc(32)
  const _100 = Buffer.alloc(32)
  const _1000 = Buffer.alloc(32)
  const _10000 = Buffer.alloc(32)
  const _100000 = Buffer.alloc(32)
  const _1000000 = Buffer.alloc(32)
  const _10010011 = Buffer.alloc(32)
  const _10010111 = Buffer.alloc(32)
  const _100110 = Buffer.alloc(32)
  const _1010 = Buffer.alloc(32)
  const _1010000 = Buffer.alloc(32)
  const _1010011 = Buffer.alloc(32)
  const _1011 = Buffer.alloc(32)
  const _10110 = Buffer.alloc(32)
  const _10111101 = Buffer.alloc(32)
  const _11 = Buffer.alloc(32)
  const _1100011 = Buffer.alloc(32)
  const _1100111 = Buffer.alloc(32)
  const _11010011 = Buffer.alloc(32)
  const _1101011 = Buffer.alloc(32)
  const _11100111 = Buffer.alloc(32)
  const _11101011 = Buffer.alloc(32)
  const _11110101 = Buffer.alloc(32)

  sc25519_sq(_10, s)
  sc25519_mul(_11, s, _10)
  sc25519_mul(_100, s, _11)
  sc25519_sq(_1000, _100)
  sc25519_mul(_1010, _10, _1000)
  sc25519_mul(_1011, s, _1010)
  sc25519_sq(_10000, _1000)
  sc25519_sq(_10110, _1011)
  sc25519_mul(_100000, _1010, _10110)
  sc25519_mul(_100110, _10000, _10110)
  sc25519_sq(_1000000, _100000)
  sc25519_mul(_1010000, _10000, _1000000)
  sc25519_mul(_1010011, _11, _1010000)
  sc25519_mul(_1100011, _10000, _1010011)
  sc25519_mul(_1100111, _100, _1100011)
  sc25519_mul(_1101011, _100, _1100111)
  sc25519_mul(_10010011, _1000000, _1010011)
  sc25519_mul(_10010111, _100, _10010011)
  sc25519_mul(_10111101, _100110, _10010111)
  sc25519_mul(_11010011, _10110, _10111101)
  sc25519_mul(_11100111, _1010000, _10010111)
  sc25519_mul(_11101011, _100, _11100111)
  sc25519_mul(_11110101, _1010, _11101011)

  sc25519_mul(recip, _1011, _11110101)
  sc25519_sqmul(recip, 126, _1010011)
  sc25519_sqmul(recip, 9, _10)
  sc25519_mul(recip, recip, _11110101)
  sc25519_sqmul(recip, 7, _1100111)
  sc25519_sqmul(recip, 9, _11110101)
  sc25519_sqmul(recip, 11, _10111101)
  sc25519_sqmul(recip, 8, _11100111)
  sc25519_sqmul(recip, 9, _1101011)
  sc25519_sqmul(recip, 6, _1011)
  sc25519_sqmul(recip, 14, _10010011)
  sc25519_sqmul(recip, 10, _1100011)
  sc25519_sqmul(recip, 9, _10010111)
  sc25519_sqmul(recip, 10, _11110101)
  sc25519_sqmul(recip, 8, _11010011)
  sc25519_sqmul(recip, 8, _11101011)
}

function sc25519_reduce (s) {
  assert(s instanceof Uint8Array && s.length === 64)

  const _s = new Uint32Array(24)

  _s[0] = 2097151 & load_3(s)
  _s[1] = 2097151 & (load_4(s, 2) >>> 5)
  _s[2] = 2097151 & (load_3(s, 5) >>> 2)
  _s[3] = 2097151 & (load_4(s, 7) >>> 7)
  _s[4] = 2097151 & (load_4(s, 10) >>> 4)
  _s[5] = 2097151 & (load_3(s, 13) >>> 1)
  _s[6] = 2097151 & (load_4(s, 15) >>> 6)
  _s[7] = 2097151 & (load_3(s, 18) >>> 3)
  _s[8] = 2097151 & load_3(s, 21)
  _s[9] = 2097151 & (load_4(s, 23) >>> 5)
  _s[10] = 2097151 & (load_3(s, 26) >>> 2)
  _s[11] = 2097151 & (load_4(s, 28) >>> 7)
  _s[12] = 2097151 & (load_4(s, 31) >>> 4)
  _s[13] = 2097151 & (load_3(s, 34) >>> 1)
  _s[14] = 2097151 & (load_4(s, 36) >>> 6)
  _s[15] = 2097151 & (load_3(s, 39) >>> 3)
  _s[16] = 2097151 & load_3(s, 42)
  _s[17] = 2097151 & (load_4(s, 44) >>> 5)
  _s[18] = 2097151 & (load_3(s, 47) >>> 2)
  _s[19] = 2097151 & (load_4(s, 49) >>> 7)
  _s[20] = 2097151 & (load_4(s, 52) >>> 4)
  _s[21] = 2097151 & (load_3(s, 55) >>> 1)
  _s[22] = 2097151 & (load_4(s, 57) >>> 6)
  _s[23] = load_4(s, 60) >>> 3

  const sbuf = new Uint8Array(_s.buffer)
  wasm_sc_red.memory.set(sbuf, 0)

  wasm_sc_red.exports.sc25519_reduce(0)

  s.fill(0)
  s.set(wasm_sc_red.memory.slice(0, 32))
}

function sc25519_is_canonical (s) {
  /* 2^252+27742317777372353535851937790883648493 */
  const L = Uint8Array.from([
    0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7,
    0xa2, 0xde, 0xf9, 0xde, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10
  ])

  let c = 0
  let n = 1
  let i = 32

  do {
    i--
    c |= ((s[i] - L[i]) >> 8) & n
    n &= ((s[i] ^ L[i]) - 1) >> 8
  } while (i !== 0)

  return (c != 0)
}

/* x^((p-1)/2) */
function chi25519 (out, z) {
  check_fe(out)
  check_fe(z)

  const t0 = fe25519()
  const t1 = fe25519()
  const t2 = fe25519()
  const t3 = fe25519()

  fe25519_sq(t0, z)
  fe25519_mul(t1, t0, z)
  fe25519_sq(t0, t1)
  fe25519_sq(t2, t0)
  fe25519_sq(t2, t2)
  fe25519_mul(t2, t2, t0)
  fe25519_mul(t1, t2, z)
  fe25519_sq(t2, t1)
  for (let i = 1; i < 5; i++) {
    fe25519_sq(t2, t2)
  }
  fe25519_mul(t1, t2, t1)
  fe25519_sq(t2, t1)
  for (let i = 1; i < 10; i++) {
    fe25519_sq(t2, t2)
  }
  fe25519_mul(t2, t2, t1)
  fe25519_sq(t3, t2)
  for (let i = 1; i < 20; i++) {
    fe25519_sq(t3, t3)
  }
  fe25519_mul(t2, t3, t2)
  fe25519_sq(t2, t2)
  for (let i = 1; i < 10; i++) {
    fe25519_sq(t2, t2)
  }
  fe25519_mul(t1, t2, t1)
  fe25519_sq(t2, t1)
  for (let i = 1; i < 50; i++) {
    fe25519_sq(t2, t2)
  }
  fe25519_mul(t2, t2, t1)
  fe25519_sq(t3, t2)
  for (let i = 1; i < 100; i++) {
    fe25519_sq(t3, t3)
  }
  fe25519_mul(t2, t3, t2)
  fe25519_sq(t2, t2)
  for (let i = 1; i < 50; i++) {
    fe25519_sq(t2, t2)
  }
  fe25519_mul(t1, t2, t1)
  fe25519_sq(t1, t1)
  for (let i = 1; i < 4; i++) {
    fe25519_sq(t1, t1)
  }
  fe25519_mul(out, t1, t0)
}

/* montgomery to edwards */
function ge25519_mont_to_ed (xed, yed, x, y) {
  check_fe(xed)
  check_fe(yed)
  check_fe(x)
  check_fe(y)

  const one = fe25519()
  const x_plus_one = fe25519()
  const x_minus_one = fe25519()
  const x_plus_one_y_inv = fe25519()

  fe25519_1(one)
  fe25519_add(x_plus_one, x, one)
  fe25519_sub(x_minus_one, x, one)

  /* xed = sqrt(-A-2)*x/y */
  fe25519_mul(x_plus_one_y_inv, x_plus_one, y)
  fe25519_invert(x_plus_one_y_inv, x_plus_one_y_inv) /* 1/((x+1)*y) */
  fe25519_mul(xed, x, ed25519_sqrtam2)
  fe25519_mul(xed, xed, x_plus_one_y_inv) /* sqrt(-A-2)*x/((x+1)*y) */
  fe25519_mul(xed, xed, x_plus_one)

  /* yed = (x-1)/(x+1) */
  fe25519_mul(yed, x_plus_one_y_inv, y) /* 1/(x+1) */
  fe25519_mul(yed, yed, x_minus_one)
  fe25519_cmov(yed, one, fe25519_iszero(x_plus_one_y_inv))
}

/* montgomery -- recover y = sqrt(x^3 + A*x^2 + x) */
function ge25519_xmont_to_ymont (y, x) {
  const x2 = fe25519()
  const x3 = fe25519()

  fe25519_sq(x2, x)
  fe25519_mul(x3, x, x2)
  fe25519_mul32(x2, x2, ed25519_A_32)
  fe25519_add(y, x3, x)
  fe25519_add(y, y, x2)

  return fe25519_sqrt(y, y)
}

/* multiply by the cofactor */
function ge25519_clear_cofactor (p3) {
  check_ge3(p3)

  const p1 = ge3()
  const p2 = ge3()

  ge25519_p3_dbl(p1, p3)
  ge25519_p1p1_to_p2(p2, p1)
  ge25519_p2_dbl(p1, p2)
  ge25519_p1p1_to_p2(p2, p1)
  ge25519_p2_dbl(p1, p2)
  ge25519_p1p1_to_p3(p3, p1)
}

function ge25519_elligator2 (x, y, r, was_square_p) {
  check_fe(x)
  check_fe(y)
  check_fe(r)
  assert(typeof was_square_p === 'number')

  const e = fe25519()
  const gx1 = fe25519()
  const rr2 = fe25519()
  const x2 = fe25519()
  const x3 = fe25519()
  const negx = fe25519()

  const s = Buffer.alloc(32)
  let was_square = 0

  fe25519_sq2(rr2, r)
  rr2[0]++
  fe25519_invert(rr2, rr2)
  fe25519_mul32(x, rr2, ed25519_A_32)
  fe25519_neg(x, x) /* x=x1 */

  fe25519_sq(x2, x)
  fe25519_mul(x3, x, x2)
  fe25519_mul32(x2, x2, ed25519_A_32) /* x2 = A*x1^2 */
  fe25519_add(gx1, x3, x)
  fe25519_add(gx1, gx1, x2) /* gx1 = x1^3 + A*x1^2 + x1 */

  chi25519(e, gx1)
  fe25519_tobytes(s, e)
  was_square = s[1] & 1

  /* e=-1 => x = -x1-A */
  fe25519_neg(negx, x)
  fe25519_cmov(x, negx, was_square)
  fe25519_0(x2)
  fe25519_cmov(x2, ed25519_A, was_square)
  fe25519_sub(x, x, x2)

  /* y = sqrt(gx1) or sqrt(gx2) with gx2 = gx1 * (A+x1) / -x1 */
  /* but it is about as fast to just recompute from the curve equation. */
  assert(ge25519_xmont_to_ymont(y, x) === 0)
  return was_square
}

function ge25519_from_uniform (s, r) {
  assert(s instanceof Uint8Array && s.length === 32)
  assert(r instanceof Uint8Array && r.length === 32)

  const p3 = ge3()
  const x = fe25519()
  const y = fe25519()
  const negxed = fe25519()
  const r_fe = fe25519()
  const was_square = 0
  let x_sign = 0

  s.set(r.subarray(0, 32))
  x_sign = s[31] >> 7
  s[31] &= 0x7f
  fe25519_frombytes(r_fe, s)

  ge25519_elligator2(x, y, r_fe, was_square)

  ge25519_mont_to_ed(p3[0], p3[1], x, y)
  fe25519_neg(negxed, p3[0])
  fe25519_cmov(p3[0], negxed, fe25519_isnegative(p3[0]) ^ x_sign)

  fe25519_1(p3[2])
  fe25519_mul(p3[3], p3[0], p3[1])
  ge25519_clear_cofactor(p3)
  ge25519_p3_tobytes(s, p3)
}

function ge25519_from_hash (s, h) {
  assert(s instanceof Uint8Array && s.length === 32)
  assert(h instanceof Uint8Array && h.length === 64)

  const fl = Buffer.alloc(32)
  const gl = Buffer.alloc(32)
  const p3 = ge3()
  const x = fe25519()
  const y = fe25519()
  const negy = fe25519()
  const fe_f = fe25519()
  const fe_g = fe25519()

  let i = 0
  const was_square = 0
  let y_sign = 0

  for (i = 0; i < 32; i++) {
    fl[i] = h[63 - i]
    gl[i] = h[31 - i]
  }

  fl[31] &= 0x7f
  gl[31] &= 0x7f

  fe25519_frombytes(fe_f, fl)
  fe25519_frombytes(fe_g, gl)
  fe_f[0] += (h[32] >> 7) * 19
  for (i = 0; i < 10; i++) {
    fe_f[i] += 38 * fe_g[i]
  }
  fe25519_reduce(fe_f, fe_f)

  ge25519_elligator2(x, y, fe_f, was_square)

  y_sign = was_square
  fe25519_neg(negy, y)
  fe25519_cmov(y, negy, fe25519_isnegative(y) ^ y_sign)

  ge25519_mont_to_ed(p3[0], p3[1], x, y)

  fe25519_1(p3[2])
  fe25519_mul(p3[3], p3[0], p3[1])
  ge25519_clear_cofactor(p3)
  ge25519_p3_tobytes(s, p3)
}

/* Ristretto group */

function ristretto255_sqrt_ratio_m1 (x, u, v) {
  check_fe(x)
  check_fe(u)
  check_fe(v)

  const v3 = fe25519()
  const vxx = fe25519()
  const m_root_check = fe25519()
  const p_root_check = fe25519()
  const f_root_check = fe25519()
  const x_sqrtm1 = fe25519()
  let has_m_root = 0
  let has_p_root = 0
  let has_f_root = 0

  fe25519_sq(v3, v)
  fe25519_mul(v3, v3, v) /* v3 = v^3 */
  fe25519_sq(x, v3)
  fe25519_mul(x, x, v)
  fe25519_mul(x, x, u) /* x = uv^7 */

  fe25519_pow22523(x, x) /* x = (uv^7)^((q-5)/8) */
  fe25519_mul(x, x, v3)
  fe25519_mul(x, x, u) /* x = uv^3(uv^7)^((q-5)/8) */

  fe25519_sq(vxx, x)
  fe25519_mul(vxx, vxx, v) /* vx^2 */
  fe25519_sub(m_root_check, vxx, u) /* vx^2-u */
  fe25519_add(p_root_check, vxx, u) /* vx^2+u */
  fe25519_mul(f_root_check, u, fe25519_sqrtm1) /* u*sqrt(-1) */
  fe25519_add(f_root_check, vxx, f_root_check) /* vx^2+u*sqrt(-1) */
  has_m_root = fe25519_iszero(m_root_check)
  has_p_root = fe25519_iszero(p_root_check)
  has_f_root = fe25519_iszero(f_root_check)
  fe25519_mul(x_sqrtm1, x, fe25519_sqrtm1) /* x*sqrt(-1) */

  fe25519_cmov(x, x_sqrtm1, has_p_root | has_f_root)
  fe25519_abs(x, x)

  return has_m_root | has_p_root
}

function ristretto255_is_canonical (s) {
  assert(s instanceof Uint8Array)

  let c = 0
  let d = 0
  let e = 0
  let i = 0

  c = (s[31] & 0x7f) ^ 0x7f
  for (i = 30; i > 0; i--) {
    c |= s[i] ^ 0xff
  }
  c = (c - 1) >> 8
  d = (0xed - 1 - s[0]) >> 8
  e = s[31] >> 7

  return 1 - (((c & d) | e | s[0]) & 1)
}

function ristretto255_frombytes (h, s, neg = false) {
  check_ge3(h)
  assert(s instanceof Uint8Array)

  const inv_sqrt = fe25519()
  const one = fe25519()
  const s_ = fe25519()
  const ss = fe25519()
  const u1 = fe25519()
  const u2 = fe25519()
  const u1u1 = fe25519()
  const u2u2 = fe25519()
  const v = fe25519()
  const v_u2u2 = fe25519()
  let was_square = 0

  if (ristretto255_is_canonical(s) == 0) {
    return -1
  }

  fe25519_frombytes(s_, s)
  fe25519_sq(ss, s_) /* ss = s^2 */

  fe25519_1(u1)
  fe25519_sub(u1, u1, ss) /* u1 = 1-ss */
  fe25519_sq(u1u1, u1) /* u1u1 = u1^2 */

  fe25519_1(u2)
  fe25519_add(u2, u2, ss) /* u2 = 1+ss */
  fe25519_sq(u2u2, u2) /* u2u2 = u2^2 */

  fe25519_mul(v, ed25519_d, u1u1) /* v = d*u1^2 */
  fe25519_neg(v, v) /* v = -d*u1^2 */
  fe25519_sub(v, v, u2u2) /* v = -(d*u1^2)-u2^2 */

  fe25519_mul(v_u2u2, v, u2u2) /* v_u2u2 = v*u2^2 */

  fe25519_1(one)
  was_square = ristretto255_sqrt_ratio_m1(inv_sqrt, one, v_u2u2)
  fe25519_mul(h[0], inv_sqrt, u2)
  fe25519_mul(h[1], inv_sqrt, h[0])
  fe25519_mul(h[1], h[1], v)

  fe25519_mul(h[0], h[0], s_)
  fe25519_add(h[0], h[0], h[0])
  fe25519_abs(h[0], h[0])
  fe25519_mul(h[1], u1, h[1])
  fe25519_1(h[2])

  if (neg) {
    fe25519_neg(h[1], h[1])
  }

  fe25519_mul(h[3], h[0], h[1])

  return -((1 - was_square) | fe25519_isnegative(h[3]) ^ neg | fe25519_iszero(h[1]))
}

function ristretto255_p3_tobytes (s, h) {
  check_ge3(h)
  assert(s instanceof Uint8Array)

  const den1 = fe25519()
  const den2 = fe25519()
  const den_inv = fe25519()
  const eden = fe25519()
  const inv_sqrt = fe25519()
  const ix = fe25519()
  const iy = fe25519()
  const one = fe25519()
  const s_ = fe25519()
  const t_z_inv = fe25519()
  const u1 = fe25519()
  const u2 = fe25519()
  const u1_u2u2 = fe25519()
  const x_ = fe25519()
  const y_ = fe25519()
  const x_z_inv = fe25519()
  const z_inv = fe25519()
  const zmy = fe25519()
  let rotate = 0

  fe25519_add(u1, h[2], h[1]) /* u1 = Z+Y */
  fe25519_sub(zmy, h[2], h[1]) /* zmy = Z-Y */
  fe25519_mul(u1, u1, zmy) /* u1 = (Z+Y)*(Z-Y) */
  fe25519_mul(u2, h[0], h[1]) /* u2 = X*Y */

  fe25519_sq(u1_u2u2, u2) /* u1_u2u2 = u2^2 */
  fe25519_mul(u1_u2u2, u1, u1_u2u2) /* u1_u2u2 = u1*u2^2 */

  fe25519_1(one)
  ristretto255_sqrt_ratio_m1(inv_sqrt, one, u1_u2u2)
  fe25519_mul(den1, inv_sqrt, u1) /* den1 = inv_sqrt*u1 */
  fe25519_mul(den2, inv_sqrt, u2) /* den2 = inv_sqrt*u2 */
  fe25519_mul(z_inv, den1, den2) /* z_inv = den1*den2 */
  fe25519_mul(z_inv, z_inv, h[3]) /* z_inv = den1*den2*T */

  fe25519_mul(ix, h[0], fe25519_sqrtm1) /* ix = X*sqrt(-1) */
  fe25519_mul(iy, h[1], fe25519_sqrtm1) /* iy = Y*sqrt(-1) */
  fe25519_mul(eden, den1, ed25519_invsqrtamd) /* eden = den1*sqrt(a-d) */

  fe25519_mul(t_z_inv, h[3], z_inv) /* t_z_inv = T*z_inv */
  rotate = fe25519_isnegative(t_z_inv)

  fe25519_copy(x_, h[0])
  fe25519_copy(y_, h[1])
  fe25519_copy(den_inv, den2)

  fe25519_cmov(x_, iy, rotate)
  fe25519_cmov(y_, ix, rotate)
  fe25519_cmov(den_inv, eden, rotate)

  fe25519_mul(x_z_inv, x_, z_inv)
  fe25519_cneg(y_, y_, fe25519_isnegative(x_z_inv))

  fe25519_sub(s_, h[2], y_)
  fe25519_mul(s_, den_inv, s_)
  fe25519_abs(s_, s_)
  fe25519_tobytes(s, s_)
}

function ristretto255_elligator (p, t) {
  check_fe(t)
  check_ge3(p)

  const c = fe25519()
  const n = fe25519()
  const one = fe25519()
  const r = fe25519()
  const rpd = fe25519()
  const s = fe25519()
  const s_prime = fe25519()
  const ss = fe25519()
  const u = fe25519()
  const v = fe25519()
  const w0 = fe25519()
  const w1 = fe25519()
  const w2 = fe25519()
  const w3 = fe25519()
  let wasnt_square = 0

  fe25519_1(one)
  fe25519_sq(r, t) /* r = t^2 */
  fe25519_mul(r, fe25519_sqrtm1, r) /* r = sqrt(-1)*t^2 */
  fe25519_add(u, r, one) /* u = r+1 */
  fe25519_mul(u, u, ed25519_onemsqd)/* u = (r+1)*(1-d^2) */
  fe25519_1(c)
  fe25519_neg(c, c) /* c = -1 */
  fe25519_add(rpd, r, ed25519_d) /* rpd = r*d */
  fe25519_mul(v, r, ed25519_d) /* v = r*d */
  fe25519_sub(v, c, v) /* v = c-r*d */
  fe25519_mul(v, v, rpd) /* v = (c-r*d)*(r+d) */

  wasnt_square = 1 - ristretto255_sqrt_ratio_m1(s, u, v)
  fe25519_mul(s_prime, s, t)
  fe25519_abs(s_prime, s_prime)
  fe25519_neg(s_prime, s_prime) /* s_prime = -|s*t| */
  fe25519_cmov(s, s_prime, wasnt_square)
  fe25519_cmov(c, r, wasnt_square)

  fe25519_sub(n, r, one) /* n = r-1 */
  fe25519_mul(n, n, c) /* n = c*(r-1) */
  fe25519_mul(n, n, ed25519_sqdmone) /* n = c*(r-1)*(d-1)^2 */
  fe25519_sub(n, n, v) /* n =  c*(r-1)*(d-1)^2-v */

  fe25519_add(w0, s, s) /* w0 = 2s */
  fe25519_mul(w0, w0, v) /* w0 = 2s*v */
  fe25519_mul(w1, n, ed25519_sqrtadm1) /* w1 = n*sqrt(ad-1) */
  fe25519_sq(ss, s) /* ss = s^2 */
  fe25519_sub(w2, one, ss) /* w2 = 1-s^2 */
  fe25519_add(w3, one, ss) /* w3 = 1+s^2 */

  fe25519_mul(p[0], w0, w3)
  fe25519_mul(p[1], w2, w1)
  fe25519_mul(p[2], w1, w3)
  fe25519_mul(p[3], w0, w2)
}

function ristretto255_from_hash (s, h) {
  assert(s instanceof Uint8Array && s.length === 32)
  assert(h instanceof Uint8Array && h.length === 64)

  const r0 = fe25519()
  const r1 = fe25519()
  const p1_cached = ge3()
  const p_p1p1 = ge3()
  const p0 = ge3()
  const p1 = ge3()
  const p = ge3()

  fe25519_frombytes(r0, h)
  fe25519_frombytes(r1, h.slice(32))
  ristretto255_elligator(p0, r0)
  ristretto255_elligator(p1, r1)
  ge25519_p3_to_cached(p1_cached, p1)
  ge25519_add_cached(p_p1p1, p0, p1_cached)
  ge25519_p1p1_to_p3(p, p_p1p1)
  ristretto255_p3_tobytes(s, p)
}

function scalarmult_curve25519_inner_loop (x1, x2, t) {
  check_fe(x1)
  check_fe(x2)
  assert(t instanceof Uint8Array && t.byteLength === 32)

  const x1buf = new Uint8Array(x1.buffer)
  const tbuf = new Uint8Array(t.buffer)

  // shared memory, mul takes 200 - 280
  mem.set(x1buf, 200)
  mem.set(tbuf, 240)
  wasm_scalaramult_internal.exports.scalarmult(280, 200, 240)

  parse_fe(x2, mem, 280)
}

function check_fe (h) {
  assert(h instanceof Int32Array)
  assert(h.length === 10)
}

function check_ge2 (h) {
  assert(h.length >= 3)
  for (let i = 0; i < 3; i++) check_fe(h[i])
}

function check_ge3 (h) {
  assert(h.length === 4)
  for (let i = 0; i < 4; i++) check_fe(h[i])
}

function intDivide (a, b) {
  return (a / b) - (a / b) % 1
}

function signedInt (i) {
  return i < 0 ? 2 ** 32 + i : i
}

function parse_fe (res, buf, offset = 0) {
  for (let i = 0; i < 10; i++) {
    res[i] = buf.readInt32LE(4 * i + offset)
  }
}

function print_fe_hex (p) {
  const buf = Buffer.alloc(32)
  fe25519_tobytes(buf, p)
  console.log(buf.toString('hex'))
}

function print_ge_hex (p) {
  const buf = Buffer.alloc(32)
  ge25519_tobytes(buf, p)
  console.log(buf.toString('hex'))
}
