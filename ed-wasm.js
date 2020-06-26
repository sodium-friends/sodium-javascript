const sodium = require('./')
const { crypto_scalarmult_ed25519, crypto_scalarmult_ed25519_base, crypto_scalarmult_curve25519, crypto_scalarmult_curve25519_base } = require('./crypto_scalarmult_ed25519')
const { crypto_sign, crypto_sign_open } = require('./crypto_sign_ed25519')

console.log(crypto_scalarmult_ed25519)
let sig = Buffer.alloc(sodium.crypto_sign_BYTES)
let sm = Buffer.alloc(1024 + sodium.crypto_sign_BYTES)
let sm1 = Buffer.alloc(1024 + sodium.crypto_sign_BYTES)
let skpk = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
let pk = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
let sk = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
let smlen
let smlen1
let i
let test

sig.fill(0)

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

sodium.crypto_scalarmult(res, an, bn)
console.log(res.toString('hex'))

crypto_scalarmult_ed25519(res, an, bn)
console.log(res.toString('hex'))

sodium.crypto_scalarmult_base(res, an)
console.log(res.toString('hex'))

sodium.crypto_scalarmult_base(res, an)
console.log(res.toString('hex'))

const a = Buffer.alloc(32)
a[i] = 9
crypto_scalarmult_curve25519_base(res, an)
console.log(res.toString('hex'))


console.time('hello')
for (let test of fixtures) {
  sodium.crypto_scalarmult(res, test.sk, test.pk)
}
console.timeEnd('hello')

console.time('ed')
for (let test of fixtures) {
  crypto_scalarmult_curve25519(res, test.sk, test.pk)
}
console.timeEnd('ed')

// console.log(sm.toString('hex'))

// pass &= smlen === sodium.crypto_sign_BYTES + test.m.byteLength
// pass &= Buffer.compare(test.sig, sm.subarray(0, 64)) === 0
// pass &= sodium.crypto_sign_open(test.m, sm.subarray(0, smlen), test.pk)

// sodium.crypto_sign_detached(sig, test.m, skpk)

// pass &= sig.byteLength !== 0 && sig.byteLength <= sodium.crypto_sign_BYTES
// pass &= Buffer.compare(test.sig, sig) === 0
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
