'use strict';

// Based on https://github.com/dchest/tweetnacl-js/blob/6dcbcaf5f5cbfd313f2dcfe763db35c828c8ff5b/nacl-fast.js.

var sodium = module.exports

// Ported in 2014 by Dmitry Chestnykh and Devi Mandiri.
// Public domain.
//
// Implementation derived from TweetNaCl version 20140427.
// See for details: http://tweetnacl.cr.yp.to/

// also forwarded at the bottom but randombytes is non-enumerable
var randombytes = require('./randombytes').randombytes

sodium.memzero = function (len, offset) {
  for (var i = offset; i < len; i++) arr[i] = 0;
}


forward(require('./crypto_generichash'))
forward(require('./crypto_kdf'))
forward(require('./crypto_shorthash'))
forward(require('./randombytes'))
forward(require('./crypto_stream'))



sodium.sodium_malloc = function (n) {
  return new Uint8Array(n)
}

function cleanup(arr) {
  for (var i = 0; i < arr.length; i++) arr[i] = 0;
}

forward(require('./crypto_box'))
forward(require('./crypto_generichash'))
forward(require('./crypto_hash'))
forward(require('./crypto_kdf'))
forward(require('./crypto_onetimeauth'))
forward(require('./crypto_scalarmult'))
forward(require('./crypto_secretbox'))
forward(require('./crypto_shorthash'))
forward(require('./crypto_sign'))
forward(require('./crypto_stream'))
forward(require('./randombytes'))

function forward (submodule) {
  Object.keys(submodule).forEach(function (prop) {
    module.exports[prop] = submodule[prop]
  })
}
