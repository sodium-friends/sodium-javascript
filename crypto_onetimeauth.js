/* eslint-disable camelcase */
const Poly1305 = require('./internal/poly1305')
const { crypto_verify_16 } = require('./crypto_verify')

module.exports = {
  crypto_onetimeauth,
  crypto_onetimeauth_verify
}

function crypto_onetimeauth (out, outpos, m, mpos, n, k) {
  var s = new Poly1305(k)
  s.update(m, mpos, n)
  s.finish(out, outpos)
  return 0
}

function crypto_onetimeauth_verify (h, hpos, m, mpos, n, k) {
  var x = new Uint8Array(16)
  crypto_onetimeauth(x, 0, m, mpos, n, k)
  return crypto_verify_16(h, hpos, x, 0)
}
