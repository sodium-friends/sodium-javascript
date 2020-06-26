/* eslint-disable camelcase */
var MessageChannel = global.MessageChannel
if (MessageChannel == null) ({ MessageChannel } = require('worker' + '_threads'))

function sodium_malloc (n) {
  return new Uint8Array(n)
}

const sink = new MessageChannel()
function sodium_free (n) {
  sodium_memzero(n)
  sink.port1.postMessage(n.buffer, [n.buffer])
}

function sodium_memzero (arr) {
  arr.fill(0)
}

module.exports = {
  sodium_malloc,
  sodium_free,
  sodium_memzero
}
