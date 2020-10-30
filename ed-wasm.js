const sodium = require('./')
const native = require('sodium-native')
const { crypto_scalarmult_ed25519, crypto_scalarmult_ed25519_base, crypto_scalarmult_curve25519, crypto_scalarmult_curve25519_1, crypto_scalarmult_curve25519_base } = require('./crypto_scalarmult_ed25519')
const { crypto_sign, crypto_sign_open, crypto_sign_verify_detached } = require('./crypto_sign_ed25519')
const sign = require('./crypto_sign')
const ed = require('./ed25519')
const ec = require('./fe25519_25')

console.log(crypto_scalarmult_ed25519)
let sm = Buffer.alloc(1024 + sodium.crypto_sign_BYTES)
let sm1 = Buffer.alloc(1024 + sodium.crypto_sign_BYTES)
let skpk = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
let pk = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
let sk = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
let smlen
let smlen1
let i
let test

// sig.fill(0)

var an = Buffer.from([
  0x77, 0x07, 0x6d, 0x0a, 0x73, 0x18, 0xa5, 0x7d, 0x3c, 0x16, 0xc1,
  0x72, 0x51, 0xb2, 0x66, 0x45, 0xdf, 0x4c, 0x2f, 0x87, 0xeb, 0xc0,
  0x99, 0x2a, 0xb1, 0x77, 0xfb, 0xa5, 0x1d, 0xb9, 0x2c, 0x2a
])

var bn = Buffer.from([
  0x5d, 0xab, 0x08, 0x7e, 0x62, 0x4a, 0x8a, 0x4b, 0x79, 0xe1, 0x7f,
  0x8b, 0x83, 0x80, 0x0e, 0xe6, 0x6f, 0x3b, 0xb1, 0x29, 0x26, 0x18,
  0xb6, 0xfd, 0x1c, 0x2f, 0x8b, 0x27, 0xff, 0x88, 0xe0, 0xeb
])

var bobpk = Buffer.from('de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f', 'hex')

var cn = Buffer.from([
  190,  24, 150, 125,  14, 254,  19,  44,
   55, 112, 156,   5, 141, 230,  91,  84,
  110, 130, 213,  39, 249, 107, 145, 140,
  226,  38,  16,  80, 186, 183, 134, 239
])

const res = Buffer.alloc(32)

var fixtures = require('./crypto_sign.json').map(a => parseTest(a))
var pass = true

// test = parseTest(fixture)

// console.time('hello')
// for (let test of fixtures) {
//   skpk.set(test.sk)
//   skpk.set(test.pk, sodium.crypto_sign_SEEDBYTES)
//   smlen = sodium.crypto_sign(sm, test.m, skpk)
//   sodium.crypto_sign_open(test.m, sm.subarray(0, smlen), test.pk)
// }
// console.timeEnd('hello')

// console.time('ed')
// for (let test of fixtures) {
//   skpk.set(test.sk)
//   skpk.set(test.pk, sodium.crypto_sign_SEEDBYTES)
//   smlen = crypto_sign(sm, test.m, skpk)
//   crypto_sign_open(test.m, sm.subarray(0, smlen), test.pk)
// }
// console.timeEnd('ed')

// for (let i = 0; i < fixtures.length; i++) {
//   let pass = true

//   sm.fill(0)
//   sm1.fill(0)
//   test = fixtures[i]
//   skpk.set(test.sk)
//   skpk.set(test.pk, sodium.crypto_sign_SEEDBYTES)
//   smlen = sodium.crypto_sign(sm, test.m, skpk)
//   smlen1 = crypto_sign(sm1, test.m, skpk)

//   pass &= sodium.crypto_sign_open(test.m, sm1.subarray(0, smlen1), test.pk)
//   pass &= crypto_sign_open(test.m, sm.subarray(0, smlen), test.pk)

//   if (Buffer.compare(sm, sm1) !== 0 || !pass) console.log('test fails at fixture #' + i)
// }

// //////////////////////////////
// sodium.crypto_scalarmult(res, an, bn)
// console.log(res.toString('hex'))

function main () {
  const b = 3;
  const pos = 21;
  const p = ec.ge2();
  const res = Buffer.alloc(32)
  // static char     hex[32];

  // printf("hello\n");
  ec.ge25519_cmov8_base(p, pos, b);
  // printf("hello\n");
  ec.ge25519_tobytes(res, p);

  console.log(res.toString('hex'))
}
console.log('====================')
main()
console.log('====================')

/////////////////////////////////////////

res.fill(0)
crypto_scalarmult_curve25519(res, an, bobpk)
console.log(res.toString('hex'))

// console.time('whole')
crypto_scalarmult_curve25519_1(res, an, bobpk)
// console.timeEnd('whole')
console.log('scmult wasm', res.toString('hex'))

native.crypto_scalarmult(res, an, bobpk)
console.log('scmult nati', res.toString('hex'))

sodium.crypto_scalarmult(res, an, bobpk)
console.log('scmult js  ', res.toString('hex'))

sodium.crypto_scalarmult_base(res, an)
console.log('scmultb js', res.toString('hex'))

// const basepoint = Buffer.alloc(32)
// res.fill(0)
// native.crypto_scalarmult_base(basepoint, res)
// console.log('---------------', basepoint.toString('hex'))

native.crypto_scalarmult_base(res, an)
console.log('scmultb nat', res.toString('hex'))

// res.fill(0)
// const p = ec.ge3()
// ec.ge25519_scalarmult_base(p, an)
// ec.ge25519_tobytes(res, p)
crypto_scalarmult_curve25519_base(res, an)
console.log('scmultb was', res.toString('hex'))

native.crypto_scalarmult(res, fixtures[1].sk, fixtures[1].pk)
console.log(res.toString('hex'))

crypto_scalarmult_curve25519(res, fixtures[1].sk, fixtures[1].pk)
console.log('wasm naive', res.toString('hex'))

crypto_scalarmult_curve25519_1(res, fixtures[1].sk, fixtures[1].pk)
console.log('wasm inner loop', res.toString('hex'))

native.crypto_scalarmult(res, fixtures[1].sk, fixtures[1].pk)
console.log('native', res.toString('hex'))

crypto_scalarmult_ed25519(res, fixtures[1].sk, fixtures[1].pk)
console.log(res.toString('hex'))

// const a = Buffer.alloc(32)
// a[i] = 9
// crypto_scalarmult_curve25519_base(res, an)
// console.log(res.toString('hex'))


// console.time('hello')
// for (let test of fixtures) {
//   sodium.crypto_scalarmult(res, test.sk, test.pk)
// }
// console.timeEnd('hello')
// console.log(res.toString('hex'))

// const res1 = Buffer.from(res)
// console.time('ed')
// for (let test of fixtures) {
//   crypto_scalarmult_curve25519(res, test.sk, test.pk)
// }
// console.timeEnd('ed')

// console.time('wasm')
// for (let test of fixtures) {
//   crypto_scalarmult_curve25519_1(res1, test.sk, test.pk)
// }
// console.timeEnd('wasm')

// console.time('native')
// for (let test of fixtures) {
//   native.crypto_scalarmult(res1, test.sk, test.pk)
// }
// console.timeEnd('native')
// console.log(res.toString('hex'))
// console.log(res1.toString('hex'))

/////////////////////////////////////////

// console.log(sm.toString('hex'))

native.crypto_sign_keypair(pk, sk)

let sig = Buffer.alloc(sodium.crypto_sign_BYTES + 32)
const m = Buffer.alloc(32)
const m2 = Buffer.alloc(32)
for (let i = 0; i < 32; i++) m[i] = i

crypto_sign(sig, m, sk)
// pass &= smlen === sodium.crypto_sign_BYTES + test.m.byteLength
// pass &= Buffer.compare(test.sig, sm.subarray(0, 64)) === 0
// pass &= sodium.crypto_sign_open(test.m, sm.subarray(0, smlen), test.pk)
console.log('sig', sig.toString('hex'))

console.log(sodium.crypto_sign_open(m2, sig, pk))
console.log(crypto_sign_open(m2, sig, pk))
console.log(m2.toString('hex'))

// // pass &= sig.byteLength !== 0 && sig.byteLength <= sodium.crypto_sign_BYTES
// // pass &= Buffer.compare(test.sig, sig) === 0
// pass &= sodium.crypto_sign_verify_detached(sig, test.m.subarray(0, i), test.pk)

function parseTest (t) {
  return {
    sk: Buffer.from(t[0]),
    pk: Buffer.from(t[1]),
    sig: Buffer.from(t[2]),
    m: Buffer.from(t[3])
  }
}

// 92a009a9f0d4cab8720e820b5f642540a2b27b5416503f8fb3762223ebdb69da085ac1e43e15996e458f3613d0f11d8c387b2eaeb4302aeeb00d291612bb0c00720
