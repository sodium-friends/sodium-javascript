/* eslint-disable camelcase */
const { sodium_malloc } = require('./memory')
const assert = require('nanoassert')

if (new Uint16Array([1])[0] !== 1) throw new Error('Big endian architecture is not supported.')

const crypto_core_hchacha20_OUTPUTBYTES = 32
const crypto_core_hchacha20_INPUTBYTES = 16
const crypto_core_hchacha20_KEYBYTES = 32
const crypto_core_hchacha20_CONSTBYTES = 16

function ROTL32 (x, b) {
  x &= 0xFFFFFFFF
  b &= 0xFFFFFFFF
  return (x << b) | (x >>> (32 - b))
}

function LOAD32_LE (src, offset) {
  assert(src instanceof Uint8Array, 'src not byte array')
  let w = src[offset]
  w |= src[offset + 1] << 8
  w |= src[offset + 2] << 16
  w |= src[offset + 3] << 24
  return w
}

function STORE32_LE (dest, int, offset) {
  assert(dest instanceof Uint8Array, 'dest not byte array')
  var mul = 1
  var i = 0
  dest[offset] = int & 0xFF // grab bottom byte
  while (++i < 4 && (mul *= 0x100)) {
    dest[offset + i] = (int / mul) & 0xFF
  }
}

function QUARTERROUND (l, A, B, C, D) {
  l[A] += l[B]
  l[D] = ROTL32(l[D] ^ l[A], 16)
  l[C] += l[D]
  l[B] = ROTL32(l[B] ^ l[C], 12)
  l[A] += l[B]
  l[D] = ROTL32(l[D] ^ l[A], 8)
  l[C] += l[D]
  l[B] = ROTL32(l[B] ^ l[C], 7)
}

function crypto_core_hchacha20 (out, _in, k, c) {
  assert(out instanceof Uint8Array && out.length === 32, 'out is not an array of 32 bytes')
  assert(k instanceof Uint8Array && k.length === 32, 'k is not an array of 32 bytes')
  assert(c === null || (c instanceof Uint8Array && c.length === 16), 'c is not null or an array of 16 bytes')

  let i = 0
  const x = new Uint32Array(16)
  if (!c) {
    x[0] = 0x61707865
    x[1] = 0x3320646E
    x[2] = 0x79622D32
    x[3] = 0x6B206574
  } else {
    x[0] = LOAD32_LE(c, 0)
    x[1] = LOAD32_LE(c, 4)
    x[2] = LOAD32_LE(c, 8)
    x[3] = LOAD32_LE(c, 12)
  }
  x[4] = LOAD32_LE(k, 0)
  x[5] = LOAD32_LE(k, 4)
  x[6] = LOAD32_LE(k, 8)
  x[7] = LOAD32_LE(k, 12)
  x[8] = LOAD32_LE(k, 16)
  x[9] = LOAD32_LE(k, 20)
  x[10] = LOAD32_LE(k, 24)
  x[11] = LOAD32_LE(k, 28)
  x[12] = LOAD32_LE(_in, 0)
  x[13] = LOAD32_LE(_in, 4)
  x[14] = LOAD32_LE(_in, 8)
  x[15] = LOAD32_LE(_in, 12)

  for (i = 0; i < 10; i++) {
    QUARTERROUND(x, 0, 4, 8, 12)
    QUARTERROUND(x, 1, 5, 9, 13)
    QUARTERROUND(x, 2, 6, 10, 14)
    QUARTERROUND(x, 3, 7, 11, 15)
    QUARTERROUND(x, 0, 5, 10, 15)
    QUARTERROUND(x, 1, 6, 11, 12)
    QUARTERROUND(x, 2, 7, 8, 13)
    QUARTERROUND(x, 3, 4, 9, 14)
  }

  STORE32_LE(out, x[0], 0)
  STORE32_LE(out, x[1], 4)
  STORE32_LE(out, x[2], 8)
  STORE32_LE(out, x[3], 12)
  STORE32_LE(out, x[12], 16)
  STORE32_LE(out, x[13], 20)
  STORE32_LE(out, x[14], 24)
  STORE32_LE(out, x[15], 28)

  return 0
}

function crypto_core_hchacha20_outputbytes () {
  return crypto_core_hchacha20_OUTPUTBYTES
}

function crypto_core_hchacha20_inputbytes () {
  return crypto_core_hchacha20_INPUTBYTES
}

function crypto_core_hchacha20_keybytes () {
  return crypto_core_hchacha20_KEYBYTES
}

function crypto_core_hchacha20_constbytes () {
  return crypto_core_hchacha20_CONSTBYTES
}

// test

function sodium_hex2bin (key, hex) {
  for (let i = 0; i < hex.length / 2; i++) {
    const current_byte = hex.slice(i * 2, (i * 2) + 2)
    key[i] = parseInt(current_byte, 16)
  }
}

function tv_hchacha20 () {
  const tvs = [
    { key: '24f11cce8a1b3d61e441561a696c1c1b7e173d084fd4812425435a8896a013dc', in: 'd9660c5900ae19ddad28d6e06e45fe5e', out: '5966b3eec3bff1189f831f06afe4d4e3be97fa9235ec8c20d08acfbbb4e851e3' },
    { key: '80a5f6272031e18bb9bcd84f3385da65e7731b7039f13f5e3d475364cd4d42f7', in: 'c0eccc384b44c88e92c57eb2d5ca4dfa', out: '6ed11741f724009a640a44fce7320954c46e18e0d7ae063bdbc8d7cf372709df' },
    { key: 'cb1fc686c0eec11a89438b6f4013bf110e7171dace3297f3a657a309b3199629', in: 'fcd49b93e5f8f299227e64d40dc864a3', out: '84b7e96937a1a0a406bb7162eeaad34308d49de60fd2f7ec9dc6a79cbab2ca34' },
    { key: '6640f4d80af5496ca1bc2cfff1fefbe99638dbceaabd7d0ade118999d45f053d', in: '31f59ceeeafdbfe8cae7914caeba90d6', out: '9af4697d2f5574a44834a2c2ae1a0505af9f5d869dbe381a994a18eb374c36a0' },
    { key: '0693ff36d971225a44ac92c092c60b399e672e4cc5aafd5e31426f123787ac27', in: '3a6293da061da405db45be1731d5fc4d', out: 'f87b38609142c01095bfc425573bb3c698f9ae866b7e4216840b9c4caf3b0865' },
    { key: '809539bd2639a23bf83578700f055f313561c7785a4a19fc9114086915eee551', in: '780c65d6a3318e479c02141d3f0b3918', out: '902ea8ce4680c09395ce71874d242f84274243a156938aaa2dd37ac5be382b42' },
    { key: '1a170ddf25a4fd69b648926e6d794e73408805835c64b2c70efddd8cd1c56ce0', in: '05dbee10de87eb0c5acb2b66ebbe67d3', out: 'a4e20b634c77d7db908d387b48ec2b370059db916e8ea7716dc07238532d5981' },
    { key: '3b354e4bb69b5b4a1126f509e84cad49f18c9f5f29f0be0c821316a6986e15a6', in: 'd8a89af02f4b8b2901d8321796388b6c', out: '9816cb1a5b61993735a4b161b51ed2265b696e7ded5309c229a5a99f53534fbc' },
    { key: '4b9a818892e15a530db50dd2832e95ee192e5ed6afffb408bd624a0c4e12a081', in: 'a9079c551de70501be0286d1bc78b045', out: 'ebc5224cf41ea97473683b6c2f38a084bf6e1feaaeff62676db59d5b719d999b' },
    { key: 'c49758f00003714c38f1d4972bde57ee8271f543b91e07ebce56b554eb7fa6a7', in: '31f0204e10cf4f2035f9e62bb5ba7303', out: '0dd8cc400f702d2c06ed920be52048a287076b86480ae273c6d568a2e9e7518c' }
  ]

  const constant = sodium_malloc(crypto_core_hchacha20_CONSTBYTES)
  const key = sodium_malloc(crypto_core_hchacha20_KEYBYTES)
  const _in = sodium_malloc(crypto_core_hchacha20_INPUTBYTES)
  const out = sodium_malloc(crypto_core_hchacha20_OUTPUTBYTES)
  const out2 = sodium_malloc(crypto_core_hchacha20_OUTPUTBYTES)

  for (let i = 0; i < tvs.length; i++) {
    const tv = tvs[i]
    sodium_hex2bin(key, tv.key)
    sodium_hex2bin(_in, tv.in)
    sodium_hex2bin(out, tv.out)
    crypto_core_hchacha20(out2, _in, key, null)
    let outs_equal = true
    for (let j = 0; j < out.length; j++) {
      if (out[j] !== out2[j]) {
        outs_equal = false
      }
    }
    assert(outs_equal, 'hchacha20 test failed')
  }

  sodium_hex2bin(constant, '0d29b795c1ca70c1652e823364d32417')
  sodium_hex2bin(out, '934d941d78eb9bfc2f0376f7ccd4a11ecf0c6a44104618a9749ef47fe97037a2')
  crypto_core_hchacha20(out2, _in, key, constant)
  let outs_equal = true
  for (let j = 0; j < out.length; j++) {
    if (out[j] !== out2[j]) {
      outs_equal = false
    }
  }
  assert(outs_equal, 'hchacha20 test with constant failed')
  console.log('hchacha20 test OK')
}

tv_hchacha20()

module.exports = {
  crypto_core_hchacha20_INPUTBYTES,
  LOAD32_LE,
  STORE32_LE,
  QUARTERROUND,
  crypto_core_hchacha20,
  crypto_core_hchacha20_outputbytes,
  crypto_core_hchacha20_inputbytes,
  crypto_core_hchacha20_keybytes,
  crypto_core_hchacha20_constbytes
}
