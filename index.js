'use strict'

// Based on https://github.com/dchest/tweetnacl-js/blob/6dcbcaf5f5cbfd313f2dcfe763db35c828c8ff5b/nacl-fast.js.

var sodium = module.exports

// Ported in 2014 by Dmitry Chestnykh and Devi Mandiri.
// Public domain.
//
// Implementation derived from TweetNaCl version 20140427.
// See for details: http://tweetnacl.cr.yp.to/

// also forwarded at the bottom but randombytes is non-enumerable

sodium.sodium_memzero = function (arr) {
  arr.fill(0)
}

sodium.sodium_malloc = function (n) {
  return new Uint8Array(n)
}

forward(require('./crypto_box'))
forward(require('./crypto_generichash'))
forward(require('./crypto_hash'))
forward(require('./crypto_hash_sha256'))
forward(require('./crypto_kdf'))
forward(require('./crypto_kx'))
forward(require('./crypto_aead'))
forward(require('./crypto_onetimeauth'))
// forward(require('./crypto_scalarmult_ed25519'))
forward(require('./crypto_scalarmult'))
forward(require('./crypto_secretbox'))
forward(require('./crypto_shorthash'))
// forward(require('./crypto_sign'))
forward(require('./crypto_sign_ed25519'))
forward(require('./crypto_stream'))
forward(require('./crypto_stream_chacha20'))
forward(require('./crypto_verify'))
forward(require('./randombytes'))

function forward (submodule) {
  Object.keys(submodule).forEach(function (prop) {
    module.exports[prop] = submodule[prop]
  })
}
