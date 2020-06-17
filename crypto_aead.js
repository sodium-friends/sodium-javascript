const { crypto_stream_chacha20_ietf, crypto_stream_chacha20_ietf_xor_ic } = require('./crypto_stream_chacha20')
const { crypto_verify_16 } = require('./crypto_verify')
const Poly1305 = require('./poly1305.js')
const assert = require('nanoassert')

const crypto_aead_chacha20poly1305_ietf_KEYBYTES = 32
const crypto_aead_chacha20poly1305_ietf_NSECBYTES = 0
const crypto_aead_chacha20poly1305_ietf_NPUBBYTES = 12
const crypto_aead_chacha20poly1305_ietf_ABYTES = 16
const crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX = Number.MAX_SAFE_INTEGER

const _pad0 = Buffer.alloc(16)

function crypto_aead_chacha20poly1305_ietf_encrypt (c, m, ad, nsec, npub, k) {
  assert(c.length === m.length + crypto_aead_chacha20poly1305_ietf_ABYTES,
    "ciphertext should be 'crypto_aead_chacha20poly1305_ietf_ABYTES' longer than message")
  assert(npub.length === crypto_aead_chacha20poly1305_ietf_NPUBBYTES,
    "npub should be 'crypto_aead_chacha20poly1305_ietf_NPUBBYTES' long")
  assert(k.length === crypto_aead_chacha20poly1305_ietf_KEYBYTES,
    "k should be 'crypto_aead_chacha20poly1305_ietf_KEYBYTES' long")
  assert(m.length <= crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX, 'message is too large')

  var ret = crypto_aead_chacha20poly1305_ietf_encrypt_detached(c.subarray(0, m.length), c.subarray(m.length), m, ad, nsec, npub, k)

  if (ret === 0) {
    return m.length + crypto_aead_chacha20poly1305_ietf_ABYTES
  }

  return ret
}

function crypto_aead_chacha20poly1305_ietf_encrypt_detached (c, mac, m, ad, nsec, npub, k) {
  assert(c.length === m.length, 'ciphertext should be same length than message')
  assert(npub.length === crypto_aead_chacha20poly1305_ietf_NPUBBYTES,
    "npub should be 'crypto_aead_chacha20poly1305_ietf_NPUBBYTES' long")
  assert(k.length === crypto_aead_chacha20poly1305_ietf_KEYBYTES,
    "k should be 'crypto_aead_chacha20poly1305_ietf_KEYBYTES' long")
  assert(m.length <= crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX, 'message is too large')
  assert(mac.length <= crypto_aead_chacha20poly1305_ietf_ABYTES,
    "mac should be 'crypto_aead_chacha20poly1305_ietf_ABYTES' long")

  const block0 = new Uint8Array(64)
  var slen = Buffer.alloc(8)

  crypto_stream_chacha20_ietf(block0, npub, k)
  const poly = new Poly1305(block0)
  block0.fill(0)

  poly.update(ad, 0, ad.length)
  poly.update(_pad0, 0, (0x10 - ad.length) & 0xf)

  crypto_stream_chacha20_ietf_xor_ic(c, m, npub, 1, k)

  poly.update(c, 0, m.length)
  poly.update(_pad0, 0, (0x10 - m.length) & 0xf)

  write64LE(slen, ad.length)
  poly.update(slen, 0, slen.length)

  write64LE(slen, m.length)
  poly.update(slen, 0, slen.length)

  poly.finish(mac, 0)
  slen.fill(0)

  return 0
}

function crypto_aead_chacha20poly1305_ietf_decrypt (m, nsec, c, ad, npub, k) {
  assert(m.length === c.length - crypto_aead_chacha20poly1305_ietf_ABYTES,
    "message should be 'crypto_aead_chacha20poly1305_ietf_ABYTES' shorter than ciphertext")
  assert(npub.length === crypto_aead_chacha20poly1305_ietf_NPUBBYTES,
    "npub should be 'crypto_aead_chacha20poly1305_ietf_NPUBBYTES' long")
  assert(k.length === crypto_aead_chacha20poly1305_ietf_KEYBYTES,
    "k should be 'crypto_aead_chacha20poly1305_ietf_KEYBYTES' long")
  assert(m.length <= crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX, 'message is too large')

  var ret = -1

  if (c.length >= crypto_aead_chacha20poly1305_ietf_ABYTES) {
    ret = crypto_aead_chacha20poly1305_ietf_decrypt_detached(
      m, nsec,
      c.subarray(0, c.length - crypto_aead_chacha20poly1305_ietf_ABYTES),
      c.subarray(c.length - crypto_aead_chacha20poly1305_ietf_ABYTES),
      ad, npub, k)
  }

  if (ret === 0) {
    return c.length - crypto_aead_chacha20poly1305_ietf_ABYTES
  }

  return ret;
}

function crypto_aead_chacha20poly1305_ietf_decrypt_detached (m, nsec, c, mac, ad, npub, k) {
  assert(c.length === m.length, 'message should be same length than ciphertext')
  assert(npub.length === crypto_aead_chacha20poly1305_ietf_NPUBBYTES,
    "npub should be 'crypto_aead_chacha20poly1305_ietf_NPUBBYTES' long")
  assert(k.length === crypto_aead_chacha20poly1305_ietf_KEYBYTES,
    "k should be 'crypto_aead_chacha20poly1305_ietf_KEYBYTES' long")
  assert(m.length <= crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX, 'message is too large')
  assert(mac.length <= crypto_aead_chacha20poly1305_ietf_ABYTES,
    "mac should be 'crypto_aead_chacha20poly1305_ietf_ABYTES' long")

  const block0 = new Uint8Array(64)
  const slen = Buffer.alloc(8)
  const computed_mac = Buffer.alloc(crypto_aead_chacha20poly1305_ietf_ABYTES)
  var mlen
  var ret

  crypto_stream_chacha20_ietf(block0, npub, k)
  const poly = new Poly1305(block0)
  block0.fill(0)

  poly.update(ad, 0, ad.length)
  poly.update(_pad0, 0, (0x10 - ad.length) & 0xf)

  mlen = c.length
  poly.update(c, 0, mlen)
  poly.update(_pad0, 0, (0x10 - mlen) & 0xf)

  write64LE(slen, ad.length)
  poly.update(slen, 0, slen.length)

  write64LE(slen, mlen)
  poly.update(slen, 0, slen.length)

  poly.finish(computed_mac, 0)

  assert(computed_mac.length === 16)
  ret = crypto_verify_16(computed_mac, 0, mac, 0)

  computed_mac.fill(0)
  slen.fill(0)

  if (ret !== 0) {
    m.fill(0)
    return -1
  }

  crypto_stream_chacha20_ietf_xor_ic(m, c, npub, 1, k)
  return 0
}

function write64LE (buf, int) {
  buf.fill(0, 0, 8)
  buf.writeUInt32LE(int & 0xffffffff)
  buf.writeUInt32LE((int >> 32) & 0xffffffff)
}

module.exports = {
  crypto_aead_chacha20poly1305_ietf_encrypt,
  crypto_aead_chacha20poly1305_ietf_encrypt_detached,
  crypto_aead_chacha20poly1305_ietf_decrypt,
  crypto_aead_chacha20poly1305_ietf_decrypt_detached,
  crypto_aead_chacha20poly1305_ietf_ABYTES,
  crypto_aead_chacha20poly1305_ietf_KEYBYTES,
  crypto_aead_chacha20poly1305_ietf_NPUBBYTES,
  crypto_aead_chacha20poly1305_ietf_NSECBYTES,
  crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX
}
