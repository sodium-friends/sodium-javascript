var { crypto_stream, crypto_stream_xor } = require('./crypto_stream')
var { crypto_onetimeauth, crypto_onetimeauth_verify } = require('./crypto_onetimeauth')

var crypto_secretbox_KEYBYTES = 32,
    crypto_secretbox_NONCEBYTES = 24,
    crypto_secretbox_ZEROBYTES = 32,
    crypto_secretbox_BOXZEROBYTES = 16,
    crypto_secretbox_MACBYTES = 16

module.exports = {
  crypto_secretbox,
  crypto_secretbox_open,
  crypto_secretbox_detached,
  crypto_secretbox_open_detached,
  crypto_secretbox_easy,
  crypto_secretbox_open_easy,
  crypto_secretbox_KEYBYTES,
  crypto_secretbox_NONCEBYTES,
  crypto_secretbox_ZEROBYTES,
  crypto_secretbox_BOXZEROBYTES,
  crypto_secretbox_MACBYTES
}

function crypto_secretbox (c, m, d, n, k) {
  var i
  if (d < 32) return -1
  crypto_stream_xor(c, m, n, k)
  crypto_onetimeauth(c, 16, c, 32, d - 32, c)
  for (i = 0; i < 16; i++) c[i] = 0
  return 0
}

function crypto_secretbox_open (m, c, d, n, k) {
  var i
  var x = new Uint8Array(32)
  if (d < 32) return -1
  crypto_stream(x, n, k)
  if (crypto_onetimeauth_verify(c, 16, c, 32, d - 32, x) !== 0) return -1
  crypto_stream_xor(m, c, n, k)
  for (i = 0; i < 32; i++) m[i] = 0
  return 0
}

function crypto_secretbox_detached (o, mac, msg, n, k) {
  check(mac, crypto_secretbox_MACBYTES)
  var tmp = new Uint8Array(msg.length + mac.length)
  crypto_secretbox_easy(tmp, msg, n, k)
  o.set(tmp.subarray(0, msg.length))
  mac.set(tmp.subarray(msg.length))
}

function crypto_secretbox_open_detached (msg, o, mac, n, k) {
  check(mac, crypto_secretbox_MACBYTES)
  var tmp = new Uint8Array(o.length + mac.length)
  tmp.set(o)
  tmp.set(mac, msg.length)
  return crypto_secretbox_open_easy(msg, tmp, n, k)
}

function crypto_secretbox_easy(o, msg, n, k) {
  check(msg, 0)
  check(o, msg.length + crypto_secretbox_MACBYTES)
  check(n, crypto_secretbox_NONCEBYTES)
  check(k, crypto_secretbox_KEYBYTES)

  var i
  var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length)
  var c = new Uint8Array(m.length)
  for (i = 0; i < msg.length; i++) m[i+crypto_secretbox_ZEROBYTES] = msg[i]
  crypto_secretbox(c, m, m.length, n, k)
  for (i = crypto_secretbox_BOXZEROBYTES; i < c.length; i++) o[i - crypto_secretbox_BOXZEROBYTES] = c[i]
}

function crypto_secretbox_open_easy(msg, box, n, k) {
  check(box, crypto_secretbox_MACBYTES)
  check(msg, box.length - crypto_secretbox_MACBYTES)
  check(n, crypto_secretbox_NONCEBYTES)
  check(k, crypto_secretbox_KEYBYTES)

  var i
  var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length)
  var m = new Uint8Array(c.length);
  for (i = 0; i < box.length; i++) c[i+crypto_secretbox_BOXZEROBYTES] = box[i]
  if (c.length < 32) return false
  if (crypto_secretbox_open(m, c, c.length, n, k) !== 0) return false

  for (i = crypto_secretbox_ZEROBYTES; i < m.length; i++) msg[i - crypto_secretbox_ZEROBYTES] = m[i]
  return true
}

function check (buf, len) {
  if (!buf || (len && buf.length < len)) throw new Error('Argument must be a buffer' + (len ? ' of length ' + len : ''))
}
