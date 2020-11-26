/* eslint-disable camelcase */
const assert = require('nanoassert')
const crypto = require('crypto')
const { randombytes_buf } = require('./randombytes')
const {
  crypto_stream_chacha20_ietf,
  crypto_stream_chacha20_ietf_xor,
  crypto_stream_chacha20_ietf_xor_ic,
  crypto_stream_chacha20_ietf_KEYBYTES,
  crypto_stream_chacha20_ietf_NONCEBYTES
} = require('./crypto_stream_chacha20')
const { crypto_core_hchacha20, crypto_core_hchacha20_INPUTBYTES } = require('./crypto_core_hchacha20')
const Poly1305 = require('./internal/poly1305')
const { STORE64_LE } = require('./crypto_kdf')
const { sodium_increment, sodium_is_zero, sodium_memcmp } = require('./helpers')

const crypto_onetimeauth_poly1305_BYTES = 16
const crypto_secretstream_xchacha20poly1305_COUNTERBYTES = 4
const crypto_secretstream_xchacha20poly1305_INONCEBYTES = 8
const crypto_aead_xchacha20poly1305_ietf_KEYBYTES = 32
const crypto_secretstream_xchacha20poly1305_KEYBYTES = crypto_aead_xchacha20poly1305_ietf_KEYBYTES
const crypto_aead_xchacha20poly1305_ietf_NPUBBYTES = 24
const crypto_secretstream_xchacha20poly1305_HEADERBYTES = crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
const crypto_aead_xchacha20poly1305_ietf_ABYTES = 16
const crypto_secretstream_xchacha20poly1305_ABYTES = 1 + crypto_aead_xchacha20poly1305_ietf_ABYTES
const crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX = Number.MAX_SAFE_INTEGER
const crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX = Number.MAX_SAFE_INTEGER
const crypto_secretstream_xchacha20poly1305_TAG_MESSAGE = 0
const crypto_secretstream_xchacha20poly1305_TAG_PUSH = 1
const crypto_secretstream_xchacha20poly1305_TAG_REKEY = 2
const crypto_secretstream_xchacha20poly1305_TAG_FINAL = crypto_secretstream_xchacha20poly1305_TAG_PUSH | crypto_secretstream_xchacha20poly1305_TAG_REKEY

// #define STATE_COUNTER(STATE) ((STATE)->nonce)
// #define STATE_INONCE(STATE)  ((STATE)->nonce + \
//                               crypto_secretstream_xchacha20poly1305_COUNTERBYTES)

const _pad0 = new Uint8Array(16).fill(0)

class Crypto_secretstream_xchacha20poly1305_state {
  constructor (k, nonce, pad) {
    this.k = new Uint8Array(crypto_stream_chacha20_ietf_KEYBYTES).fill(0)
    this.nonce = new Uint8Array(crypto_stream_chacha20_ietf_NONCEBYTES).fill(0)
    this.pad = new Uint8Array(8).fill(0)
  }
}

function _crypto_secretstream_xchacha20poly1305_counter_reset (state) {
  assert(state instanceof Crypto_secretstream_xchacha20poly1305_state, 'state is not an instance of Crypto_secretstream_xchacha20poly1305_state')
  for (let i = 0; i < crypto_secretstream_xchacha20poly1305_COUNTERBYTES; i++) {
    state.nonce[i] = 0
  }
  state.nonce[0] = 1
}

function crypto_secretstream_xchacha20poly1305_keygen (k) {
  assert(k.length === crypto_secretstream_xchacha20poly1305_KEYBYTES)
  randombytes_buf(k)
}

function crypto_secretstream_xchacha20poly1305_init_push (state, out, k) {
  assert(state instanceof Crypto_secretstream_xchacha20poly1305_state, 'state not instance of Crypto_secretstream_xchacha20poly1305_state')
  assert(out instanceof Uint8Array && out.length === crypto_secretstream_xchacha20poly1305_HEADERBYTES, 'out not byte array of length crypto_secretstream_xchacha20poly1305_HEADERBYTES')
  assert(k instanceof Uint8Array && k.length === crypto_secretstream_xchacha20poly1305_KEYBYTES, 'k not byte array of length crypto_secretstream_xchacha20poly1305_KEYBYTES')
  assert(crypto_secretstream_xchacha20poly1305_HEADERBYTES === crypto_core_hchacha20_INPUTBYTES + crypto_secretstream_xchacha20poly1305_INONCEBYTES)
  assert(crypto_secretstream_xchacha20poly1305_HEADERBYTES === crypto_aead_xchacha20poly1305_ietf_NPUBBYTES)
  assert(state.nonce.length === crypto_secretstream_xchacha20poly1305_INONCEBYTES + crypto_secretstream_xchacha20poly1305_COUNTERBYTES)

  randombytes_buf(out, crypto_secretstream_xchacha20poly1305_HEADERBYTES)
  crypto_core_hchacha20(state.k, out, k, null)
  _crypto_secretstream_xchacha20poly1305_counter_reset(state)
  for (let i = 0; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
    state.nonce[i + crypto_secretstream_xchacha20poly1305_COUNTERBYTES] = out[i + crypto_core_hchacha20_INPUTBYTES]
  }
  state.pad.fill(0)
  return 0
}

function crypto_secretstream_xchacha20poly1305_init_pull (state, _in, k) {
  assert(state instanceof Crypto_secretstream_xchacha20poly1305_state,
    'state not instance of Crypto_secretstream_xchacha20poly1305_state')
  assert(_in instanceof Uint8Array && _in.length === crypto_secretstream_xchacha20poly1305_HEADERBYTES,
    '_in not byte array of length crypto_secretstream_xchacha20poly1305_HEADERBYTES')
  assert(k instanceof Uint8Array && k.length === crypto_secretstream_xchacha20poly1305_KEYBYTES,
    'k not byte array of length crypto_secretstream_xchacha20poly1305_KEYBYTES')
  crypto_core_hchacha20(state.k, _in, k, null)
  _crypto_secretstream_xchacha20poly1305_counter_reset(state)

  for (let i = 0; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
    state.nonce[i + crypto_secretstream_xchacha20poly1305_COUNTERBYTES] = _in[i + crypto_core_hchacha20_INPUTBYTES]
  }
  state.pad.fill(0)
  return 0
}

function crypto_secretstream_xchacha20poly1305_rekey (state) {
  assert(state instanceof Crypto_secretstream_xchacha20poly1305_state,
    'state not instance of Crypto_secretstream_xchacha20poly1305_state')
  const new_key_and_inonce = new Uint8Array(
    crypto_stream_chacha20_ietf_KEYBYTES + crypto_secretstream_xchacha20poly1305_INONCEBYTES)
  let i
  for (i = 0; i < crypto_stream_chacha20_ietf_KEYBYTES; i++) {
    new_key_and_inonce[i] = state.k[i]
  }
  for (i = 0; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
    new_key_and_inonce[crypto_stream_chacha20_ietf_KEYBYTES + i] =
      state.nonce[crypto_secretstream_xchacha20poly1305_COUNTERBYTES + i]
  }
  crypto_stream_chacha20_ietf_xor(new_key_and_inonce, new_key_and_inonce, state.nonce, state.k)
  for (i = 0; i < crypto_stream_chacha20_ietf_KEYBYTES; i++) {
    state.k[i] = new_key_and_inonce[i]
  }
  for (i = 0; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
    state.nonce[crypto_secretstream_xchacha20poly1305_COUNTERBYTES + i] =
      new_key_and_inonce[crypto_stream_chacha20_ietf_KEYBYTES + i]
  }
  _crypto_secretstream_xchacha20poly1305_counter_reset(state)
}

function crypto_secretstream_xchacha20poly1305_push (state, out, m, ad, tag, outputs) {
  const block = new Uint8Array(64)
  const slen = new Uint8Array(8)

  assert(crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX <=
    crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX)

  crypto_stream_chacha20_ietf(block, state.nonce, state.k)
  const poly = new Poly1305(block)
  block.fill(0)

  poly.update(ad, 0, ad.byteLength)
  poly.update(_pad0, 0, (0x10 - ad.byteLength) & 0xf)

  block[0] = tag
  crypto_stream_chacha20_ietf_xor_ic(block, block, state.nonce, 1, state.k)

  poly.update(block, 0, block.byteLength)
  out[0] = block[0]

  // block is 64 bytes. sizeof tag is 1, as it's a byte, so c is the subarray starting at out[1]
  // c = out + (sizeof tag);
  const c = out.subarray(1, out.byteLength)
  crypto_stream_chacha20_ietf_xor_ic(c, m, state.nonce, 2, state.k)
  poly.update(c, 0, m.byteLength)
  poly.update(_pad0, (0x10 - block.byteLength + m.byteLength) & 0xf)

  STORE64_LE(slen, ad.byteLength)
  poly.update(slen, slen.byteLength)
  STORE64_LE(slen, block.byteLength + m.byteLength)
  poly.update(slen, slen.byteLength)

  const mac = out.subarray(1 + m.byteLength, out.byteLength)
  poly.finish(mac, 0)

  assert(crypto_onetimeauth_poly1305_BYTES >=
    crypto_secretstream_xchacha20poly1305_INONCEBYTES)
  xor_buf(state.nonce.subarray(crypto_secretstream_xchacha20poly1305_COUNTERBYTES, state.nonce.length),
    mac, crypto_secretstream_xchacha20poly1305_INONCEBYTES)
  sodium_increment(state.nonce)

  if ((tag & crypto_secretstream_xchacha20poly1305_TAG_REKEY) !== 0 ||
    sodium_is_zero(state.nonce, crypto_secretstream_xchacha20poly1305_COUNTERBYTES)) {
    crypto_secretstream_xchacha20poly1305_rekey(state)
  }
  // if (outlen_p != NULL) {
  //     *outlen_p = crypto_secretstream_xchacha20poly1305_ABYTES + mlen;
  // }
  outputs.res_len = crypto_secretstream_xchacha20poly1305_ABYTES + m.byteLength
  return 0
}

function crypto_secretstream_xchacha20poly1305_pull (state, m, _in, ad, outputs) {
  const block = new Uint8Array(64)
  const slen = new Uint8Array(8)
  const mac = new Uint8Array(crypto_onetimeauth_poly1305_BYTES)

  if (_in.byteLength < crypto_secretstream_xchacha20poly1305_ABYTES) {
    return -1
  }

  const mlen = _in.byteLength - crypto_secretstream_xchacha20poly1305_ABYTES
  // if (mlen > crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX) {
  //   sodium_misuse()
  // }
  crypto_stream_chacha20_ietf(block, state.nonce, state.k)
  const poly = new Poly1305(block)
  block.fill(0) // sodium_memzero(block, sizeof block);

  poly.update(ad, 0, ad.byteLength)
  poly.update(_pad0, 0, (0x10 - ad.byteLength) & 0xf)

  block.fill(0) // memset(block, 0, sizeof block);
  block[0] = _in[0]
  crypto_stream_chacha20_ietf_xor_ic(block, block, state.nonce, 1, state.k)

  const tag = block[0]
  block[0] = _in[0]
  poly.update(block, 0, block.byteLength)

  const c = _in.subarray(1, _in.length)
  poly.update(c, 0, mlen)
  // poly.update(_in, 1, mlen)
  poly.update(_pad0, (0x10 - block.byteLength + mlen) & 0xf)

  STORE64_LE(slen, ad.byteLength)
  poly.update(slen, slen.byteLength)
  STORE64_LE(slen, block.byteLength + m.byteLength)
  poly.update(slen, slen.byteLength)

  poly.finish(mac, 0)
  const stored_mac = _in.subarray(1 + mlen, _in.length)
  for (let i = 0; i < mac.length; i++) {
    if (mac[i] !== stored_mac[i]) {
      mac.fill(0)
      return -1
    }
  }

  crypto_stream_chacha20_ietf_xor_ic(m, c.subarray(0, m.length), state.nonce, 2, state.k)
  xor_buf(state.nonce.subarray(crypto_secretstream_xchacha20poly1305_COUNTERBYTES, state.nonce.length),
    mac, crypto_secretstream_xchacha20poly1305_INONCEBYTES)
  sodium_increment(state.nonce)

  if ((tag & crypto_secretstream_xchacha20poly1305_TAG_REKEY) !== 0 ||
    sodium_is_zero(state.nonce, crypto_secretstream_xchacha20poly1305_COUNTERBYTES)) {
    crypto_secretstream_xchacha20poly1305_rekey(state)
  }
  outputs.res_len = mlen
  outputs.tag = tag
  return tag
}

function crypto_secretstream_xchacha20poly1305_statebytes () {
  return crypto_stream_chacha20_ietf_KEYBYTES + crypto_stream_chacha20_ietf_NONCEBYTES + 8
}

function crypto_secretstream_xchacha20poly1305_abytes () {
  return crypto_secretstream_xchacha20poly1305_ABYTES
}

function crypto_secretstream_xchacha20poly1305_headerbytes () {
  return crypto_secretstream_xchacha20poly1305_HEADERBYTES
}

function crypto_secretstream_xchacha20poly1305_keybytes () {
  return crypto_secretstream_xchacha20poly1305_KEYBYTES
}

function crypto_secretstream_xchacha20poly1305_messagebytes_max () {
  return crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX
}

function crypto_secretstream_xchacha20poly1305_tag_message () {
  return crypto_secretstream_xchacha20poly1305_TAG_MESSAGE
}

function crypto_secretstream_xchacha20poly1305_tag_push () {
  return crypto_secretstream_xchacha20poly1305_TAG_PUSH
}

function crypto_secretstream_xchacha20poly1305_tag_rekey () {
  return crypto_secretstream_xchacha20poly1305_TAG_REKEY
}

function crypto_secretstream_xchacha20poly1305_tag_final () {
  return crypto_secretstream_xchacha20poly1305_TAG_FINAL
}

function xor_buf (out, _in, n) {
  for (let i = 0; i < n; i++) {
    out[i] ^= _in[i]
  }
}

module.exports = {
  // crypto_aead_xchacha20poly1305_ietf_ABYTES,
  // crypto_secretstream_xchacha20poly1305_ABYTES,
  crypto_secretstream_xchacha20poly1305_keygen,
  crypto_secretstream_xchacha20poly1305_init_push,
  crypto_secretstream_xchacha20poly1305_init_pull,
  crypto_secretstream_xchacha20poly1305_rekey,
  crypto_secretstream_xchacha20poly1305_push,
  crypto_secretstream_xchacha20poly1305_pull,
  crypto_secretstream_xchacha20poly1305_statebytes,
  crypto_secretstream_xchacha20poly1305_abytes,
  crypto_secretstream_xchacha20poly1305_headerbytes,
  crypto_secretstream_xchacha20poly1305_keybytes,
  crypto_secretstream_xchacha20poly1305_messagebytes_max,
  crypto_secretstream_xchacha20poly1305_tag_message,
  crypto_secretstream_xchacha20poly1305_tag_push,
  crypto_secretstream_xchacha20poly1305_tag_rekey,
  crypto_secretstream_xchacha20poly1305_tag_final
}

// test

function memcpy (dest, src, n) {
  assert(dest.length >= n && src.length >= n, 'n longer than source or destination')
  for (let i = 0; i < n; i++) {
    dest[i] = src[i]
  }
}

function test_secretstream () {
  const state = new Crypto_secretstream_xchacha20poly1305_state()
  // const statesave = new Crypto_secretstream_xchacha20poly1305_state()
  // const state_copy = new Crypto_secretstream_xchacha20poly1305_state()
  const header = new Uint8Array(crypto_secretstream_xchacha20poly1305_HEADERBYTES)
  const outputs = {
    res_len: null,
    tag: null
  }

  const ad_len = crypto.randomInt(100)
  const m1_len = crypto.randomInt(1000)
  const m2_len = crypto.randomInt(1000)
  const m3_len = crypto.randomInt(1000)

  const c1 = new Uint8Array(m1_len + crypto_secretstream_xchacha20poly1305_ABYTES)
  const c2 = new Uint8Array(m2_len + crypto_secretstream_xchacha20poly1305_ABYTES)
  const c3 = new Uint8Array(m3_len + crypto_secretstream_xchacha20poly1305_ABYTES)
  // const csave = new Uint8Array((m1_len | m2_len | m3_len) + crypto_secretstream_xchacha20poly1305_ABYTES)

  const ad = new Uint8Array(ad_len)
  const m1 = new Uint8Array(m1_len)
  const m2 = new Uint8Array(m2_len)
  const m3 = new Uint8Array(m3_len)
  const m1_ = new Uint8Array(m1_len)
  const m2_ = new Uint8Array(m2_len)
  const m3_ = new Uint8Array(m3_len)

  randombytes_buf(ad, ad_len)

  randombytes_buf(m1, m1_len)
  memcpy(m1_, m1, m1_len)
  randombytes_buf(m2, m2_len)
  memcpy(m2_, m2, m2_len)
  randombytes_buf(m3, m3_len)
  memcpy(m3_, m3, m3_len)

  const k = new Uint8Array(crypto_secretstream_xchacha20poly1305_KEYBYTES)
  crypto_secretstream_xchacha20poly1305_keygen(k)

  /* push */

  let ret = crypto_secretstream_xchacha20poly1305_init_push(state, header, k)
  assert(ret === 0, 'init_push failed')

  ret = crypto_secretstream_xchacha20poly1305_push(state, c1, m1, 0, 0, outputs) // how can ad be null here?
  assert(ret === 0, 'push failed')
  assert(outputs.res_len === m1_len + crypto_secretstream_xchacha20poly1305_ABYTES)

  ret = crypto_secretstream_xchacha20poly1305_push(state, c2, m2, ad, 0, outputs)
  assert(ret === 0, 'second push failed')

  ret = crypto_secretstream_xchacha20poly1305_push(state, c3, m3, ad, crypto_secretstream_xchacha20poly1305_TAG_FINAL, outputs)
  assert(ret === 0, 'third push failed')

  /* pull */

  ret = crypto_secretstream_xchacha20poly1305_init_pull(state, header, k)
  assert(ret === 0)

  ret = crypto_secretstream_xchacha20poly1305_pull(state, m1, c1, 0, outputs)
  assert(ret === 0, 'first pull failed')
  assert(outputs.tag === 0, 'tag pull failed')
  assert(sodium_memcmp(m1, m1_), 'failed m1 memcmp')
  assert(outputs.res_len === m1_len)
}

test_secretstream()
