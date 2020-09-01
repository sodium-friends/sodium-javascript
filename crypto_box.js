/* eslint-disable camelcase */
const { crypto_hash_sha512 } = require('./crypto_hash')
const { crypto_scalarmult, crypto_scalarmult_base } = require('./crypto_scalarmult')
const { randombytes } = require('./randombytes')
const { crypto_generichash_batch } = require('./crypto_generichash')
const { crypto_stream_xsalsa20_MESSAGEBYTES_MAX } = require('./crypto_stream')
const { crypto_secretbox_open_easy, crypto_secretbox_easy, crypto_secretbox_detached, crypto_secretbox_open_detached } = require('./crypto_secretbox')
const xsalsa20 = require('xsalsa20')
const assert = require('nanoassert')

const crypto_box_PUBLICKEYBYTES = 32
const crypto_box_SECRETKEYBYTES = 32
const crypto_box_NONCEBYTES = 24
const crypto_box_ZEROBYTES = 32
const crypto_box_BOXZEROBYTES = 16
const crypto_box_SEALBYTES = 48
const crypto_box_SEEDBYTES = 32
const crypto_box_BEFORENMBYTES = 32
const crypto_box_MACBYTES = 16

const crypto_box_curve25519xsalsa20poly1305_MACBYTES = 16

const crypto_box_MESSAGEBYTES_MAX = crypto_stream_xsalsa20_MESSAGEBYTES_MAX - crypto_box_curve25519xsalsa20poly1305_MACBYTES

module.exports = {
  crypto_box_easy,
  crypto_box_open_easy,
  crypto_box_keypair,
  crypto_box_seed_keypair,
  crypto_box_seal,
  crypto_box_seal_open,
  crypto_box_PUBLICKEYBYTES,
  crypto_box_SECRETKEYBYTES,
  crypto_box_NONCEBYTES,
  crypto_box_ZEROBYTES,
  crypto_box_BOXZEROBYTES,
  crypto_box_SEALBYTES,
  crypto_box_SEEDBYTES,
  crypto_box_BEFORENMBYTES,
  crypto_box_MACBYTES
}

function crypto_box_keypair (pk, sk) {
  check(pk, crypto_box_PUBLICKEYBYTES)
  check(sk, crypto_box_SECRETKEYBYTES)
  randombytes(sk, 32)
  return crypto_scalarmult_base(pk, sk)
}

function crypto_box_seed_keypair (pk, sk, seed) {
  assert(pk.byteLength === crypto_box_PUBLICKEYBYTES, "pk should be 'crypto_box_PUBLICKEYBYTES' bytes")
  assert(sk.byteLength === crypto_box_SECRETKEYBYTES, "sk should be 'crypto_box_SECRETKEYBYTES' bytes")
  assert(sk.byteLength === crypto_box_SEEDBYTES, "sk should be 'crypto_box_SEEDBYTES' bytes")

  const hash = new Uint8Array(64)
  crypto_hash_sha512(hash, seed, 32)
  sk.set(hash.subarray(0, 32))
  hash.fill(0)

  return crypto_scalarmult_base(pk, sk)
}

function crypto_box_seal (c, m, pk) {
  check(c, crypto_box_SEALBYTES + m.length)
  check(pk, crypto_box_PUBLICKEYBYTES)

  var epk = c.subarray(0, crypto_box_PUBLICKEYBYTES)
  var esk = new Uint8Array(crypto_box_SECRETKEYBYTES)
  crypto_box_keypair(epk, esk)

  var n = new Uint8Array(crypto_box_NONCEBYTES)
  crypto_generichash_batch(n, [epk, pk])

  var s = new Uint8Array(crypto_box_PUBLICKEYBYTES)
  crypto_scalarmult(s, esk, pk)

  var k = new Uint8Array(crypto_box_BEFORENMBYTES)
  var zero = new Uint8Array(16)
  xsalsa20.core_hsalsa20(k, zero, s, xsalsa20.SIGMA)

  crypto_secretbox_easy(c.subarray(epk.length), m, n, k)

  cleanup(esk)
}

function crypto_box_seal_open (m, c, pk, sk) {
  check(c, crypto_box_SEALBYTES)
  check(m, c.length - crypto_box_SEALBYTES)
  check(pk, crypto_box_PUBLICKEYBYTES)
  check(sk, crypto_box_SECRETKEYBYTES)

  var epk = c.subarray(0, crypto_box_PUBLICKEYBYTES)

  var n = new Uint8Array(crypto_box_NONCEBYTES)
  crypto_generichash_batch(n, [epk, pk])

  var s = new Uint8Array(crypto_box_PUBLICKEYBYTES)
  crypto_scalarmult(s, sk, epk)

  var k = new Uint8Array(crypto_box_BEFORENMBYTES)
  var zero = new Uint8Array(16)
  xsalsa20.core_hsalsa20(k, zero, s, xsalsa20.SIGMA)

  return crypto_secretbox_open_easy(m, c.subarray(epk.length), n, k)
}

// int
// crypto_box_curve25519xsalsa20poly1305_beforenm(unsigned char *k,
//                                                const unsigned char *pk,
//                                                const unsigned char *sk)
// {
//     static const unsigned char zero[16] = { 0 };
//     unsigned char s[32];
//
//     if (crypto_scalarmult_curve25519(s, sk, pk) != 0) {
//         return -1;
//     }
//     return crypto_core_hsalsa20(k, zero, s, NULL);
// }
function crypto_box_beforenm (k, pk, sk) {
  const zero = new Uint8Array(16)
  const s = new Uint8Array(32)

  assert(crypto_scalarmult(s, sk, pk) === 0)

  xsalsa20.core_hsalsa20(k, zero, s, xsalsa20.SIGMA)

  return true
}

// int
// crypto_box_detached_afternm(unsigned char *c, unsigned char *mac,
//                             const unsigned char *m, unsigned long long mlen,
//                             const unsigned char *n, const unsigned char *k)
// {
//     return crypto_secretbox_detached(c, mac, m, mlen, n, k);
// }
function crypto_box_detached_afternm (c, mac, m, n, k) {
  return crypto_secretbox_detached(c, mac, m, n, k)
}

// crypto_box_detached(unsigned char *c, unsigned char *mac,
//                     const unsigned char *m, unsigned long long mlen,
//                     const unsigned char *n, const unsigned char *pk,
//                     const unsigned char *sk)
// {
//     unsigned char k[crypto_box_BEFORENMBYTES];
//     int           ret;
//
//     COMPILER_ASSERT(crypto_box_BEFORENMBYTES >= crypto_secretbox_KEYBYTES);
//     if (crypto_box_beforenm(k, pk, sk) != 0) {
//         return -1;
//     }
//     ret = crypto_box_detached_afternm(c, mac, m, mlen, n, k);
//     sodium_memzero(k, sizeof k);
//
//     return ret;
// }
function crypto_box_detached (c, mac, m, n, pk, sk) {
  check(mac, crypto_box_MACBYTES)
  check(n, crypto_box_NONCEBYTES)
  check(pk, crypto_box_PUBLICKEYBYTES)
  check(sk, crypto_box_SECRETKEYBYTES)

  const k = new Uint8Array(crypto_box_BEFORENMBYTES)

  assert(crypto_box_beforenm(k, pk, sk))

  const ret = crypto_box_detached_afternm(c, mac, m, n, k)
  cleanup(k)

  return ret
}

// int
// crypto_box_easy(unsigned char *c, const unsigned char *m,
//                 unsigned long long mlen, const unsigned char *n,
//                 const unsigned char *pk, const unsigned char *sk)
// {
//     if (mlen > crypto_box_MESSAGEBYTES_MAX) {
//         sodium_misuse();
//     }
//     return crypto_box_detached(c + crypto_box_MACBYTES, c, m, mlen, n,
//                                pk, sk);
// }
function crypto_box_easy (c, m, n, pk, sk) {
  assert(c.length >= m.length + crypto_box_MACBYTES, "c should be at least 'm.length + crypto_box_MACBYTES'")
  assert(c.byteLength <= crypto_box_MESSAGEBYTES_MAX, "m should not be more than 'crypto_box_MESSAGEBYTES_MAX' bytes")

  return crypto_box_detached(
    c.subarray(crypto_box_MACBYTES, m.length + crypto_box_MACBYTES),
    c.subarray(0, crypto_box_MACBYTES),
    m,
    n,
    pk,
    sk
  )
}
// int
// crypto_box_open_detached_afternm(unsigned char *m, const unsigned char *c,
//                                  const unsigned char *mac,
//                                  unsigned long long clen,
//                                  const unsigned char *n,
//                                  const unsigned char *k)
// {
//     return crypto_secretbox_open_detached(m, c, mac, clen, n, k);
// }
function crypto_box_open_detached_afternm (m, c, mac, n, k) {
  return crypto_secretbox_open_detached(m, c, mac, n, k)
}

// int
// crypto_box_open_detached(unsigned char *m, const unsigned char *c,
//                          const unsigned char *mac,
//                          unsigned long long clen, const unsigned char *n,
//                          const unsigned char *pk, const unsigned char *sk)
// {
//     unsigned char k[crypto_box_BEFORENMBYTES];
//     int           ret;
//
//     if (crypto_box_beforenm(k, pk, sk) != 0) {
//         return -1;
//     }
//     ret = crypto_box_open_detached_afternm(m, c, mac, clen, n, k);
//     sodium_memzero(k, sizeof k);
//
//     return ret;
// }
function crypto_box_open_detached (m, c, mac, n, pk, sk) {
  check(mac, crypto_box_MACBYTES)
  check(n, crypto_box_NONCEBYTES)
  check(pk, crypto_box_PUBLICKEYBYTES)
  check(sk, crypto_box_SECRETKEYBYTES)

  const k = Uint8Array(crypto_box_BEFORENMBYTES)

  assert(crypto_box_beforenm(k, pk, sk))

  const ret = crypto_box_open_detached_afternm(
    m,
    c,
    mac,
    n,
    k
  )

  cleanup(k)

  return ret
}

// int
// crypto_box_open_easy(unsigned char *m, const unsigned char *c,
//                      unsigned long long clen, const unsigned char *n,
//                      const unsigned char *pk, const unsigned char *sk)
// {
//     if (clen < crypto_box_MACBYTES) {
//         return -1;
//     }
//     return crypto_box_open_detached(m, c + crypto_box_MACBYTES, c,
//                                     clen - crypto_box_MACBYTES,
//                                     n, pk, sk);
// }
function crypto_box_open_easy (m, c, n, pk, sk) {
  check(n, crypto_box_NONCEBYTES)
  check(pk, crypto_box_PUBLICKEYBYTES)
  check(sk, crypto_box_SECRETKEYBYTES)

  assert(c.length < crypto_box_MACBYTES)

  return crypto_box_open_detached(m,
    c.subarray(crypto_box_MACBYTES, m.length + crypto_box_MACBYTES),
    c.subarray(0, crypto_box_MACBYTES),
    n,
    pk,
    sk
  )
}

function check (buf, len) {
  if (!buf || (len && buf.length < len)) throw new Error('Argument must be a buffer' + (len ? ' of length ' + len : ''))
}

function cleanup (arr) {
  for (let i = 0; i < arr.length; i++) arr[i] = 0
}
