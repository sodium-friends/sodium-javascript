const ec = require('./fe25519_25.js')
const sodium = require('./')
const invert = require('./fe25519_25/fe25519_invert')({
  imports: {
    debug: {
      log (...args) {
        console.log(...args.map(int => (int >>> 0).toString(16).padStart(8, '0')))
      },
      log_tee (arg) {
        console.log((arg >>> 0).toString(16).padStart(8, '0'))
        return arg
      }
    }
  }
})
const pow = require('./fe25519_25/fe25519_pow22523')({
  imports: {
    debug: {
      log (...args) {
        console.log(...args.map(int => (int >>> 0).toString(16).padStart(8, '0')))
      },
      log_tee (arg) {
        console.log((arg >>> 0).toString(16).padStart(8, '0'))
        return arg
      }
    }
  }
})

// const crypto = require('crypto')

var f = new Int32Array(10)
var g = new Int32Array(10)
var h = new Int32Array(10)

var a = ec.ge3()
var r = ec.ge3()

function wasm_inv (h, f) {
  var buf = Buffer.from(f.buffer)

  invert.memory.set(buf)
  invert.exports.fe25519_invert(40, 0)

  buf = Buffer.from(invert.memory.slice(40, 80))
  for (let i = 0; i < 10; i++) {
    h[i] = buf.readUInt32LE(4 * i)
  }
}

function wasm_pow (h, f) {
  var buf = Buffer.from(f.buffer)

  pow.memory.set(buf)
  pow.exports.fe25519_pow22523(40, 0)

  buf = Buffer.from(pow.memory.slice(40, 80))
  for (let i = 0; i < 10; i++) {
    h[i] = buf.readUInt32LE(4 * i)
  }
}

f[0] = 23983080
a[2][0] = 1

// ec.fe25519_neg(g, f)
// ec.fe25519_reduce(g, g)
// ec.fe25519_add(h, f, g)
// ec.fe25519_reduce(h, h)

// ec.fe25519_sub(h, f, g)
// ec.fe25519_reduce(h, h)
// console.log(h)

// ec.fe25519_add(h, f, f)
// ec.fe25519_reduce(h, h)
// console.log(h)

// g[0] = 2
// for (let i = 1; i < 10; i++) g[i] = 0
// ec.fe25519_mul(h, f, g)
// console.log(h)
// ec.fe25519_reduce(h, h)
// console.log(h)

var an = Buffer.from([
  171,  69, 129,  47,  90,  82, 223, 134,
    6, 147,  54,  76,  55, 148, 252,  37,
  234, 216, 113,  62, 223,  49,  33,  36,
  172, 246,  18, 226,  50, 249, 198, 231
])

var bn = Buffer.from([
  226,  38,  16,  80, 186, 183, 134, 239,
  190,  24, 150, 125,  14, 254,  19,  44,
   55, 112, 156,   5, 141, 230,  91,  84,
  110, 130, 213,  39, 249, 107, 145, 140
])

var cn = Buffer.from([
  190,  24, 150, 125,  14, 254,  19,  44,
   55, 112, 156,   5, 141, 230,  91,  84,
  110, 130, 213,  39, 249, 107, 145, 140,
  226,  38,  16,  80, 186, 183, 134, 239
])

var s = Buffer.from([
  190,  24, 150, 125,  14, 254,  19,  44,
   55, 112, 156,   5, 141, 230,  91,  84,
  110, 130, 213,  39, 249, 107, 145, 140,
  226,  38,  16,  80, 186, 183, 134, 239,
  190,  24, 150, 125,  14, 254,  19,  44,
   55, 112, 156,   5, 141, 230,  91,  84,
  110, 130, 213,  39, 249, 107, 145, 140,
  226,  38,  16,  80, 186, 183, 134, 239
])

const p = Buffer.from([
  0x38, 0xf4, 0x69, 0x6f, 0xcf, 0x62, 0xa0, 0xfd,
  0x5a, 0xb7, 0x6e, 0x9f, 0xcb, 0xcd, 0x95, 0x3f,
  0xed, 0xba, 0x30, 0xb2, 0x64, 0x42, 0xa4, 0x52,
  0x27, 0xa6, 0x3e, 0xd2, 0xc8, 0xac, 0xa4, 0xed
])

const pk_test = Buffer.from('d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a', 'hex')

function signedInt (i) {
  return i < 0 ? 2 ** 32 + i : i
}

// console.log(Uint8Array.from(an))
// console.log(Uint8Array.from(bn))

// console.log(an.toString('hex'))
// console.log(bn.toString('hex'))

// for (let i = 0; i < 25; i++) an[i] = bn[i] = i
// var correct = true

// var dn = Buffer.alloc(32)

const mod =  2n ** 252n + 27742317777372353535851937790883648493n
const res = Buffer.alloc(32)
const res1 = Buffer.alloc(32)

var a = new Int32Array(10)
var b = new Int32Array(10)
var c = new Int32Array(10)
var g = new Int32Array(10)
const ge = ec.ge3()
const gf = ec.ge3()

///////////////////////////////////////////
ec.fe25519_frombytes(a, an)
ec.fe25519_frombytes(b, bn)

ec.fe25519_mul(c, b, a)
// // console.log('\na __________')
// // for (let i = 0; i < 10; i++) console.log(`a${i}:`, signedInt(a[i]).toString(16).padStart(8, '0'))
// // console.log('\nb __________')
// // for (let i = 0; i < 10; i++) console.log(`b${i}:`, signedInt(b[i]).toString(16).padStart(8, '0'))
// ec.fe25519_frombytes(c, bn)
ec.fe25519_tobytes(res, c)
console.log('tess  :', res.toString('hex'))


console.time('standard')
for (let i = 0; i < 10000; i++) ec.fe25519_pow22523(b, a)
console.timeEnd('standard')

ec.fe25519_tobytes(res, b)
console.log('tess  :', res.toString('hex'))

console.time('pure invert')
for (let i = 0; i < 10000; i++) wasm_pow(b, a)
console.timeEnd('pure invert')
ec.fe25519_tobytes(res, b)
console.log('tess  :', res.toString('hex'))

ec.fe25519_pow22523(a, a)
ec.fe25519_tobytes(res, a)
console.log('fe_p25:', res.toString('hex'))

ec.fe25519_cneg(a, a, 1)
ec.fe25519_tobytes(res, a)
console.log('fe_cng:', res.toString('hex'))

ec.sc25519_mul(res, an, bn)
console.log('sc_mul:', res.toString('hex'))

ec.sc25519_muladd(res, an, bn, cn)
console.log('sc_mad:', res.toString('hex'))

ec.sc25519_reduce(s)
console.log('sc_red:', s.subarray(0, 32).toString('hex'))

ec.sc25519_invert(res, cn)
console.log('sc_inv:', res.toString('hex'))

ec.ge25519_mont_to_ed(g, c, a, b)
ec.fe25519_tobytes(res, g)
console.log('g_m2ex:', res.toString('hex'))
ec.fe25519_tobytes(res, c)
console.log('g_m2ey:', res.toString('hex'))

ec.ge25519_frombytes(ge, p)
ec.ge25519_p3_tobytes(res, ge)
console.log("p     :", res.toString('hex'))

ec.ge25519_mul_l(gf, ge)
ec.ge25519_p3_tobytes(res, gf)
console.log("mul_l :", res.toString('hex'))

ec.ge25519_scalarmult_base(gf, cn)
ec.ge25519_p3_tobytes(res, gf)
console.log("smultb:", res.toString('hex'))

ec.ge25519_scalarmult(ge, bn, gf)
ec.ge25519_p3_tobytes(res, ge)
console.log("smult :", res.toString('hex'))

ec.ge25519_double_scalarmult_vartime(gf, an, ge, bn)
ec.ge25519_p3_tobytes(res, gf)
console.log("smdbl :", res.toString('hex'))

ec.ge25519_frombytes_negate_vartime(gf, pk_test)
ec.ge25519_p3_tobytes(res, gf)
console.log("smdbl :", res.toString('hex'))

console.log('canon :', ec.sc25519_is_canonical(bn))

/////////////////////////////////////////////////////

// console.log(((BigInt(ahex) * BigInt(ahex)) % mod).toString(16))
// console.log(res1.toString('hex'))

// const b = new Float64Array(16)
// const bi = new Float64Array(16)
// sodium.unpack25519(b, an)
// console.log(b)
// sodium.inv25519(bi, b)
// console.log(b)
// sodium.pack(res1, bi)


// console.log(res.toString('hex'))
// console.log(res1.toString('hex'))


// for (let j = 0; j < 10000; j++) {
//   var an = crypto.randomBytes(32)
//   var bn = crypto.randomBytes(32)
//   var cn = crypto.randomBytes(32)
//   dn.fill(0)

//   ec.fe25519_invert(dn, an, bn, cn)
//   var res = reverseEndian(dn)

//   var bi = (((BigInt('0x' + reverseEndian(an)) * BigInt('0x' + reverseEndian(bn))) +  BigInt('0x' + reverseEndian(cn))) % mod).toString(16).padStart(res.length, '0')

//   correct &= res === bi
// }

// console.log(correct === 1)

// function reverseEndian (buf) {
//   var str = ''
//   let i = buf.length - 1

//   while (buf[i] === 0) i--
//   if (i === -1) return '0'

//   for (; i >= 0; i--) {
//     str += buf[i].toString(16).padStart(2, '0')
//   }

//   return str
// }

// const a237 = new Array(
//   0x0003e6b1n,
//   0x001d0353n,
//   0x00033a5dn,
//   0x000fcd68n,
//   0x000cd8c5n,
//   0x00172cd9n,
//   0x000dcf66n,
//   0x0014afffn,
//   0x0009f453n,
//   0x0006399cn,
//   0x000e9672n,
//   0x000ee4een
// )
// var a237 = []
// a237 = Array.from(a237).map(BigInt)

// var s = Buffer.alloc(32)

// s[0]  = Number(a237[0] >> 0n)
// s[1]  = Number(a237[0] >> 8n)
// s[2]  = Number((a237[0] >> 16n) | (a237[1] *  (1n << 5n)))
// s[3]  = Number(a237[1] >> 3n)
// s[4]  = Number(a237[1] >> 11n)
// s[5]  = Number((a237[1] >> 19n) | (a237[2] *  (1n << 2n)))
// s[6]  = Number(a237[2] >> 6n)
// s[7]  = Number((a237[2] >> 14n) | (a237[3] *  (1n << 7n)))
// s[8]  = Number(a237[3] >> 1n)
// s[9]  = Number(a237[3] >> 9n)
// s[10] = Number((a237[3] >> 17n) | (a237[4] *  (1n << 4n)))
// s[11] = Number(a237[4] >> 4n)
// s[12] = Number(a237[4] >> 12n)
// s[13] = Number((a237[4] >> 20n) | (a237[5] *  (1n << 1n)))
// s[14] = Number(a237[5] >> 7n)
// s[15] = Number((a237[5] >> 15n) | (a237[6] *  (1n << 6n)))
// s[16] = Number(a237[6] >> 2n)
// s[17] = Number(a237[6] >> 10n)
// s[18] = Number((a237[6] >> 18n) | (a237[7] *  (1n << 3n)))
// s[19] = Number(a237[7] >> 5n)
// s[20] = Number(a237[7] >> 13n)
// s[21] = Number(a237[8] >> 0n)
// s[22] = Number(a237[8] >> 8n)
// s[23] = Number((a237[8] >> 16n) | (a237[9] *  (1n << 5n)))
// s[24] = Number(a237[9] >> 3n)
// s[25] = Number(a237[9] >> 11n)
// s[26] = Number((a237[9] >> 19n) | (a237[10] *  (1n << 2n)))
// s[27] = Number(a237[10]  >> 6n)
// s[28] = Number((a237[10] >> 14n) | (a237[11] *  (1n << 7n)))
// s[29] = Number(a237[11]  >> 1n)
// s[30] = Number(a237[11]  >> 9n)
// s[31] = Number(a237[11]  >> 17n)

// console.log(reverseEndian(s))
// // console.log(a237.reduce((acc, a, i) => acc + a * 1n << (20n * BigInt(i))).toString(16))
