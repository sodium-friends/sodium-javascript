const { crypto_box_keypair, crypto_box_seed_keypair } = require('./crypto_box')

function crypto_kx_keypair (pk, sk) {
  return crypto_box_keypair(pk, sk)
}

function crypto_kx_seed_keypair (pk, sk, seed) {
  return crypto_box_seed_keypair(pk, sk, seed)
}
