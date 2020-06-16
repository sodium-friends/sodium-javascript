const { crypto_scalarmult_base } = require('./crypto_scalarmult')
const { crypto_generichash } = require('./crypto_generichash')
const { randombytes_buf } = require('./randombytes')

var crypto_kx_SEEDBYTES = 32
var crypto_kx_PUBLICKEYBYTES = 32
var crypto_kx_SECRETKEYBYTES = 32

function crypto_kx_keypair (pk, sk) {
  check(pk, crypto_kx_PUBLICKEYBYTES)
  check(sk, crypto_kx_SECRETKEYBYTES)

  randombytes_buf(sk, crypto_kx_SECRETKEYBYTES)
  return crypto_scalarmult_base(pk, sk)
}

function crypto_kx_seed_keypair (pk, sk, seed) {
  check(pk, crypto_kx_PUBLICKEYBYTES)
  check(sk, crypto_kx_SECRETKEYBYTES)
  check(seed, crypto_kx_SEEDBYTES)

  crypto_generichash(sk, seed)
  return crypto_scalarmult_base(pk, sk)
}

function check (buf, len) {
  if (!buf || (len && buf.length < len)) throw new Error('Argument must be a buffer' + (len ? ' of length ' + len : ''))
}

module.exports = {
  crypto_kx_keypair,
  crypto_kx_seed_keypair,
  crypto_kx_SEEDBYTES,
  crypto_kx_SECRETKEYBYTES,
  crypto_kx_PUBLICKEYBYTES
}
