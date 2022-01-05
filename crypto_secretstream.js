/* eslint-disable camelcase */
const assert = require('nanoassert')
const { randombytes_buf } = require('./randombytes')
const {
  crypto_stream_chacha20_ietf,
  crypto_stream_chacha20_ietf_xor,
  crypto_stream_chacha20_ietf_xor_ic,
  crypto_stream_chacha20_ietf_KEYBYTES,
  crypto_stream_chacha20_ietf_NONCEBYTES
} = require('./crypto_stream_chacha20')
const { crypto_core_hchacha20, crypto_core_hchacha20_INPUTBYTES } = require('./internal/hchacha20')
const Poly1305 = require('./internal/poly1305')
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
const crypto_secretstream_xchacha20poly1305_STATEBYTES = crypto_secretstream_xchacha20poly1305_KEYBYTES
  + crypto_secretstream_xchacha20poly1305_INONCEBYTES + crypto_secretstream_xchacha20poly1305_COUNTERBYTES + 8

const KEY_OFFSET = 0
const NONCE_OFFSET = crypto_secretstream_xchacha20poly1305_KEYBYTES
const PAD_OFFSET = NONCE_OFFSET + crypto_secretstream_xchacha20poly1305_INONCEBYTES + crypto_secretstream_xchacha20poly1305_COUNTERBYTES

const _pad0 = new Uint8Array(16)

function STORE64_LE (dest, int) {
  let mul = 1
  let i = 0
  dest[0] = int & 0xFF
  while (++i < 8 && (mul *= 0x100)) {
    dest[i] = (int / mul) & 0xFF
  }
}

function crypto_secretstream_xchacha20poly1305_counter_reset (state) {
  assert(state.byteLength === crypto_secretstream_xchacha20poly1305_STATEBYTES,
    'state is should be crypto_secretstream_xchacha20poly1305_STATEBYTES long')

  const nonce = state.subarray(NONCE_OFFSET, PAD_OFFSET)
  for (let i = 0; i < crypto_secretstream_xchacha20poly1305_COUNTERBYTES; i++) {
    nonce[i] = 0
  }
  nonce[0] = 1
}

function crypto_secretstream_xchacha20poly1305_keygen (k) {
  assert(k.length === crypto_secretstream_xchacha20poly1305_KEYBYTES)
  randombytes_buf(k)
}

function crypto_secretstream_xchacha20poly1305_init_push (state, out, key) {
  assert(state.byteLength === crypto_secretstream_xchacha20poly1305_STATEBYTES,
    'state is should be crypto_secretstream_xchacha20poly1305_STATEBYTES long')
  assert(out instanceof Uint8Array && out.length === crypto_secretstream_xchacha20poly1305_HEADERBYTES, 'out not byte array of length crypto_secretstream_xchacha20poly1305_HEADERBYTES')
  assert(crypto_secretstream_xchacha20poly1305_HEADERBYTES === crypto_core_hchacha20_INPUTBYTES + crypto_secretstream_xchacha20poly1305_INONCEBYTES)
  assert(crypto_secretstream_xchacha20poly1305_HEADERBYTES === crypto_aead_xchacha20poly1305_ietf_NPUBBYTES)
  assert(key instanceof Uint8Array && key.length === crypto_secretstream_xchacha20poly1305_KEYBYTES, 'key not byte array of length crypto_secretstream_xchacha20poly1305_KEYBYTES')

  const k = state.subarray(KEY_OFFSET, NONCE_OFFSET)
  const nonce = state.subarray(NONCE_OFFSET, PAD_OFFSET)
  const pad = state.subarray(PAD_OFFSET)

  randombytes_buf(out, crypto_secretstream_xchacha20poly1305_HEADERBYTES)
  crypto_core_hchacha20(k, out, key, null)
  crypto_secretstream_xchacha20poly1305_counter_reset(state)
  for (let i = 0; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
    nonce[i + crypto_secretstream_xchacha20poly1305_COUNTERBYTES] = out[i + crypto_core_hchacha20_INPUTBYTES]
  }
  pad.fill(0)
}

function crypto_secretstream_xchacha20poly1305_init_pull (state, _in, key) {
  assert(state.byteLength === crypto_secretstream_xchacha20poly1305_STATEBYTES,
    'state is should be crypto_secretstream_xchacha20poly1305_STATEBYTES long')
  assert(_in instanceof Uint8Array && _in.length === crypto_secretstream_xchacha20poly1305_HEADERBYTES,
    '_in not byte array of length crypto_secretstream_xchacha20poly1305_HEADERBYTES')
  assert(key instanceof Uint8Array && key.length === crypto_secretstream_xchacha20poly1305_KEYBYTES,
    'key not byte array of length crypto_secretstream_xchacha20poly1305_KEYBYTES')

  const k = state.subarray(KEY_OFFSET, NONCE_OFFSET)
  const nonce = state.subarray(NONCE_OFFSET, PAD_OFFSET)
  const pad = state.subarray(PAD_OFFSET)

  crypto_core_hchacha20(k, _in, key, null)
  crypto_secretstream_xchacha20poly1305_counter_reset(state)

  for (let i = 0; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
    nonce[i + crypto_secretstream_xchacha20poly1305_COUNTERBYTES] = _in[i + crypto_core_hchacha20_INPUTBYTES]
  }
  pad.fill(0)
}

function crypto_secretstream_xchacha20poly1305_rekey (state) {
  assert(state.byteLength === crypto_secretstream_xchacha20poly1305_STATEBYTES,
    'state is should be crypto_secretstream_xchacha20poly1305_STATEBYTES long')

  const k = state.subarray(KEY_OFFSET, NONCE_OFFSET)
  const nonce = state.subarray(NONCE_OFFSET, PAD_OFFSET)

  const new_key_and_inonce = new Uint8Array(
    crypto_stream_chacha20_ietf_KEYBYTES + crypto_secretstream_xchacha20poly1305_INONCEBYTES)
  let i
  for (i = 0; i < crypto_stream_chacha20_ietf_KEYBYTES; i++) {
    new_key_and_inonce[i] = k[i]
  }
  for (i = 0; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
    new_key_and_inonce[crypto_stream_chacha20_ietf_KEYBYTES + i] =
      nonce[crypto_secretstream_xchacha20poly1305_COUNTERBYTES + i]
  }
  crypto_stream_chacha20_ietf_xor(new_key_and_inonce, new_key_and_inonce, nonce, k)
  for (i = 0; i < crypto_stream_chacha20_ietf_KEYBYTES; i++) {
    k[i] = new_key_and_inonce[i]
  }
  for (i = 0; i < crypto_secretstream_xchacha20poly1305_INONCEBYTES; i++) {
    nonce[crypto_secretstream_xchacha20poly1305_COUNTERBYTES + i] =
      new_key_and_inonce[crypto_stream_chacha20_ietf_KEYBYTES + i]
  }
  crypto_secretstream_xchacha20poly1305_counter_reset(state)
}

function crypto_secretstream_xchacha20poly1305_push (state, out, m, ad, adlen, tag, outputs) {
  assert(state.byteLength === crypto_secretstream_xchacha20poly1305_STATEBYTES,
    'state is should be crypto_secretstream_xchacha20poly1305_STATEBYTES long')
  if (!ad) ad = new Uint8Array(0)

  const k = state.subarray(KEY_OFFSET, NONCE_OFFSET)
  const nonce = state.subarray(NONCE_OFFSET, PAD_OFFSET)

  const block = new Uint8Array(64)
  const slen = new Uint8Array(8)

  assert(crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX <=
    crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX)

  crypto_stream_chacha20_ietf(block, nonce, k)
  const poly = new Poly1305(block)
  block.fill(0)

  poly.update(ad, 0, ad.byteLength)
  poly.update(_pad0, 0, (0x10 - ad.byteLength) & 0xf)

  block[0] = tag
  crypto_stream_chacha20_ietf_xor_ic(block, block, nonce, 1, k)

  poly.update(block, 0, block.byteLength)
  out[0] = block[0]

  const c = out.subarray(1, out.byteLength)
  crypto_stream_chacha20_ietf_xor_ic(c, m, nonce, 2, k)
  poly.update(c, 0, m.byteLength)
  poly.update(_pad0, 0, (0x10 - block.byteLength + m.byteLength) & 0xf)

  STORE64_LE(slen, adlen)
  poly.update(slen, 0, slen.byteLength)
  STORE64_LE(slen, block.byteLength + m.byteLength)
  poly.update(slen, 0, slen.byteLength)

  const mac = out.subarray(1 + m.byteLength, out.byteLength)
  poly.finish(mac, 0)

  assert(crypto_onetimeauth_poly1305_BYTES >=
    crypto_secretstream_xchacha20poly1305_INONCEBYTES)
  xor_buf(nonce.subarray(crypto_secretstream_xchacha20poly1305_COUNTERBYTES, nonce.length),
    mac, crypto_secretstream_xchacha20poly1305_INONCEBYTES)
  sodium_increment(nonce)

  if ((tag & crypto_secretstream_xchacha20poly1305_TAG_REKEY) !== 0 ||
    sodium_is_zero(nonce.subarray(0, crypto_secretstream_xchacha20poly1305_COUNTERBYTES))) {
    crypto_secretstream_xchacha20poly1305_rekey(state)
  }

  outputs.res_len = crypto_secretstream_xchacha20poly1305_ABYTES + m.byteLength
  return 0
}

function crypto_secretstream_xchacha20poly1305_pull (state, m, _in, ad, adlen, outputs) {
  assert(state.byteLength === crypto_secretstream_xchacha20poly1305_STATEBYTES,
    'state is should be crypto_secretstream_xchacha20poly1305_STATEBYTES long')
  if (!ad) ad = new Uint8Array(0)

  const k = state.subarray(KEY_OFFSET, NONCE_OFFSET)
  const nonce = state.subarray(NONCE_OFFSET, PAD_OFFSET)

  const block = new Uint8Array(64)
  const slen = new Uint8Array(8)
  const mac = new Uint8Array(crypto_onetimeauth_poly1305_BYTES)

  if (_in.byteLength < crypto_secretstream_xchacha20poly1305_ABYTES) {
    return -1
  }

  const mlen = _in.byteLength - crypto_secretstream_xchacha20poly1305_ABYTES
  crypto_stream_chacha20_ietf(block, nonce, k)
  const poly = new Poly1305(block)
  block.fill(0) // sodium_memzero(block, sizeof block);

  poly.update(ad, 0, adlen)
  poly.update(_pad0, 0, (0x10 - adlen) & 0xf)

  block.fill(0) // memset(block, 0, sizeof block);
  block[0] = _in[0]
  crypto_stream_chacha20_ietf_xor_ic(block, block, nonce, 1, k)

  const tag = block[0]
  block[0] = _in[0]
  poly.update(block, 0, block.byteLength)

  const c = _in.subarray(1, _in.length)
  poly.update(c, 0, mlen)
  // poly.update(_in, 1, mlen)
  poly.update(_pad0, 0, (0x10 - block.byteLength + mlen) & 0xf)

  STORE64_LE(slen, adlen)
  poly.update(slen, 0, slen.byteLength)
  STORE64_LE(slen, block.byteLength + m.byteLength)
  poly.update(slen, 0, slen.byteLength)

  poly.finish(mac, 0)
  const stored_mac = _in.subarray(1 + mlen, _in.length)
  for (let i = 0; i < mac.length; i++) {
    if (mac[i] !== stored_mac[i]) {
      mac.fill(0)
      return -1
    }
  }

  crypto_stream_chacha20_ietf_xor_ic(m, c.subarray(0, m.length), nonce, 2, k)
  xor_buf(nonce.subarray(crypto_secretstream_xchacha20poly1305_COUNTERBYTES, nonce.length),
    mac, crypto_secretstream_xchacha20poly1305_INONCEBYTES)
  sodium_increment(nonce)

  if ((tag & crypto_secretstream_xchacha20poly1305_TAG_REKEY) !== 0 ||
    sodium_is_zero(nonce.subarray(0, crypto_secretstream_xchacha20poly1305_COUNTERBYTES))) {
    crypto_secretstream_xchacha20poly1305_rekey(state)
  }
  outputs.res_len = mlen
  outputs.tag = tag
  return 0
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
